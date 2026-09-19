/**
 * The `sast-batch` plugin (M5): the durable multi-repo batch control plane —
 * the 4 `sast_batch_*` tools, `DurableBatchScheduler`, and the real
 * `ctx.agents`-backed `RepositoryWorkerFactory` (spike-D, verified — see
 * `batch/worker.ts`'s module doc). Deliberately a SEPARATE plugin from the
 * single-repo `sast` plugin (`index.ts`, M1-M4) — built to its own
 * `lib/batch-scheduler.js` entry (`tsdown.config.mjs`) and mounted as its
 * own row in `preset/sast/agent.cordis.yml` — so M5 stays independently
 * composable and testable, and a deployment that has not yet verified
 * spike-D in its own host can simply not mount this row while still
 * shipping the fully-functional M1-M4 single-repo surface.
 *
 * `sast_start_batch` (and a `sast_batch_resolve` retry) trigger execution as
 * an UNOWNED `ctx.jobs` background job — `DurableBatchScheduler.run()` can
 * take as long as 100 sequential audits, so the tool call itself must
 * return `{ batchId, total, status: 'queued' }` immediately rather than
 * blocking the batch owner's whole turn on it. The batch outlives any
 * single tool call or agent turn by construction: nothing here is owned by
 * an `Agent`, so owner-disposal cleanup never cancels it.
 * @module @tangxiaofeng7/dsh-sast-host/batch-plugin
 */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-jobs'
import { SessionId } from '@deepseek-ai/dsh-session'
import type { AgentOptions } from '@deepseek-ai/dsh-agent'
import { BatchStore } from './batch/store.ts'
import { DurableBatchScheduler } from './batch/scheduler.ts'
import { createAgentWorkerFactory } from './batch/worker.ts'
import { batchPromptBuilder, createStoreBackedOutcomeResolver, createStoreBackedSummaryResolver } from './batch/orchestrator.ts'
import { registerSastBatchTools, type SastBatchToolsConfig } from './batch/tools.ts'

declare module '@deepseek-ai/dsh-jobs' {
  interface JobKindMap {
    sastBatch: 'sast-batch'
  }
}

/** Configuration for the `sast-batch` plugin. */
export interface SastBatchPluginConfig extends SastBatchToolsConfig {
  /** Provider/model route every repository worker this batch creates uses (one route per batch owner's whole batch, not per job — mirrors the batch owner's own configured route by default). */
  readonly workerAgentOptions: AgentOptions
}

/** Plugin identity. */
export const name = 'sast-batch'
/**
 * Services required before this plugin can register tools, claim/observe
 * jobs, and create worker sessions. `sastStore` is NOT provided by this
 * plugin itself — it is the sibling `sast` plugin's (`index.ts`) service —
 * but it must still be declared here: Cordis only *waits* for a dependency
 * before calling `apply()` when it is named in `inject`; an optimistic
 * `ctx.get('sastStore')` at the top of `apply()` (with no `inject` entry)
 * races the sibling row's own async provisioning and fails intermittently
 * depending on plugin load order — reproduced against a real preset mount
 * (`agentPreset.select` → `agent-preset-invalid`) even though the preset
 * YAML lists the `sast` row before `sast-batch`; YAML row order is not a
 * Cordis load-order guarantee.
 */
export const inject = ['tools', 'storageDomain', 'sessions', 'agents', 'jobs', 'sastStore']

/**
 * Activate the durable batch control plane. Requires the sibling `sast`
 * plugin (`index.ts`) to already be composed and to have provided its
 * `SastStore` on `ctx.sastStore` — this plugin never opens its own `sast`
 * domain (`DomainFacility.open` rejects a second open of the same name) —
 * and provides `ctx.sastBatchLineageOf` back onto the SAME context so
 * `index.ts`'s `sast_start_scan`/`sast_report` (composed on this same
 * context) can auto-tag their durable rows with the calling worker's
 * `(batchId, jobId)`.
 */
export function apply(ctx: Context, config: SastBatchPluginConfig): void {
  // `inject` above guarantees this is defined by the time Cordis calls
  // `apply` — see this function's doc for why `inject` (not an optimistic
  // `ctx.get`) is the correct wait mechanism here.
  const sastStore = ctx.sastStore!
  const domain = () => sastStore.openedDomain()
  const store = new BatchStore(domain, () => Date.now(), sastStore.artifactStore())

  // Per-batch worker route override, captured from the OWNER's own live
  // `agent.options` at `sast_start_batch` call time (there is no Cordis
  // config-templating seam a static preset `config` value could use to
  // reference "whatever route composed this session" — see
  // agent.cordis.yml's `sast-batch` row comment) — falls back to
  // `config.workerAgentOptions` when the caller was not a real agent (a
  // test, or an agentless caller) or supplied no route.
  const workerAgentOptionsByBatch = new Map<string, { readonly provider?: string; readonly model?: string }>()
  const workerFactory = createAgentWorkerFactory(ctx, {
    agentOptions: (batchId) => {
      const override = workerAgentOptionsByBatch.get(batchId)
      if (override?.provider !== undefined && override.model !== undefined) {
        return { provider: override.provider, model: override.model }
      }
      return config.workerAgentOptions
    },
  })
  ctx.provide('sastBatchLineageOf', (sessionId: string) => workerFactory.lineageOf(sessionId))
  const outcomeResolver = createStoreBackedOutcomeResolver(domain, store)
  const summaryResolver = createStoreBackedSummaryResolver(domain)

  // Tracks whether a scheduler run is currently in flight for a batch, and
  // whether another run was REQUESTED while one was already running (a
  // `sast_batch_resolve` retry can land on a job that degraded/skipped
  // early while the scheduler is still working through later ordinals —
  // `setReviewStatus` is written per-job as soon as THAT job finishes, not
  // only once the whole batch does). Without this guard, a second
  // `DurableBatchScheduler` instance would start concurrently against the
  // same batch: each only claims currently-`queued` jobs (no double-claim,
  // CAS-protected), but two instances could each be running a DIFFERENT
  // job's worker at the same moment — a real violation of A18's "at most
  // one repository worker running at any time", not just a data race.
  // Coalescing a rerun request into "run once more after the current run
  // finishes" (rather than dropping it) also means a retry requested
  // mid-run is never silently lost.
  const runState = new Map<string, { rerunRequested: boolean }>()

  /** Kick off (or resume) `DurableBatchScheduler.run(batchId)` as an unowned background job, so the triggering tool call never blocks on it. Coalesces concurrent requests for the same batch into one run followed by at most one more (see `runState`'s doc) — never two overlapping scheduler instances. */
  const runInBackground = (batchId: string): void => {
    const existing = runState.get(batchId)
    if (existing !== undefined) {
      existing.rerunRequested = true
      return
    }
    const state = { rerunRequested: false }
    runState.set(batchId, state)
    ctx.jobs.start({
      kind: 'sast-batch',
      label: `sast batch ${batchId}`,
      run: () => {
        const controller = new AbortController()
        const done = (async () => {
          let lastSummary: { failedClosed: boolean; results: readonly unknown[] } | undefined
          try {
            do {
              state.rerunRequested = false
              const batch = await store.getBatch(batchId)
              if (batch === undefined) throw new Error(`sast-batch: batch ${batchId} does not exist`)
              // Every worker's cwd is the BATCH OWNER's own trusted cwd
              // (ADR-14/15 — never a per-job repository clone; see
              // batch/worker.ts's CreateWorkerInput.cwd doc for why). Looked
              // up live (not captured at sast_start_batch time) so a batch
              // that outlives the tool call still resolves the owner
              // session's current cwd correctly.
              const ownerSession = ctx.sessions.get(SessionId(batch.ownerSessionId))
              const cwd = ownerSession?.header.cwd
              if (cwd === undefined) {
                throw new Error(`sast-batch: owner session ${batch.ownerSessionId} of batch ${batchId} has no cwd (session may have been disposed)`)
              }
              const scheduler = new DurableBatchScheduler({
                store,
                workerFactory,
                outcomeResolver,
                promptBuilder: batchPromptBuilder({
                  objective: batch.objective,
                  authorization: batch.authorization,
                  methodologyNames: batch.methodologies.map(m => m.name),
                }),
                workspaceOf: async () => cwd,
              })
              lastSummary = await scheduler.run(batchId)
            } while (state.rerunRequested)
            return { status: 'completed' as const, detail: lastSummary?.failedClosed ? 'fail-closed' : `${lastSummary?.results.length ?? 0} job(s) run` }
          } catch (error) {
            return { status: 'failed' as const, detail: error instanceof Error ? error.message : String(error) }
          } finally {
            workerAgentOptionsByBatch.delete(batchId)
            runState.delete(batchId)
          }
        })()
        return {
          cancel: () => controller.abort(),
          done,
          read: undefined,
        }
      },
    })
  }

  registerSastBatchTools(ctx, store, {
    ...config,
    onBatchCreated: (batchId, ownerAgentOptions) => {
      if (ownerAgentOptions !== undefined) workerAgentOptionsByBatch.set(batchId, ownerAgentOptions)
      config.onBatchCreated?.(batchId, ownerAgentOptions)
      runInBackground(batchId)
    },
    onBatchResumed: (batchId) => {
      config.onBatchResumed?.(batchId)
      runInBackground(batchId)
    },
  }, summaryResolver)
}
