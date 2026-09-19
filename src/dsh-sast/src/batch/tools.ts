/**
 * Model-facing `sast_batch_*` tools (M5, tools-protocol.md §2.0): the 4
 * batch-control tools available only to the batch owner session
 * (tools-protocol.md §0's record-ownership discipline — repository worker
 * and intent-subagent sessions never see these in their tool directory,
 * enforced by preset/agent.cordis.yml's `toolFilter.deny`, not by this
 * module).
 *
 * `sast_start_batch` atomically creates the batch and every job
 * (`BatchStore.createBatch`), pinning any named methodologies
 * (`pinMethodologies`) before that write — a resolution failure aborts the
 * whole call with zero rows written (docs/architecture.md §3's "非法定义不
 * 产生部分快照" ADR-16 discipline extended to batch creation). It does NOT
 * itself start the scheduler: v1's `DurableBatchScheduler` still requires a
 * real `RepositoryWorkerFactory`
 * (spike-D, unverified — `batch/worker.ts`), so wiring `sast_start_batch` to
 * actually drive execution is a follow-up once that dependency exists. The
 * created batch/jobs are durable and queued regardless.
 * @module @tangxiaofeng7/dsh-sast-host/src/batch/tools
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { buildBatchJsonReport, buildBatchMarkdownReport, type BatchReportJobRow, type JobSummary } from './report.ts'
import { pinMethodologies, type MethodologyResolver, type ResolvedMethodologySkill } from './methodology.ts'
import { writeArtifact } from '../report/artifacts.ts'
import type { BatchStore } from './store.ts'
import type { SastJobReviewStatus, SastProvider } from '../spec.ts'

const PROVIDERS = ['gitlab', 'github', 'local'] as const
const METHODOLOGY_MODES = ['explicit-only', 'explicit-plus-auto', 'auto'] as const
const REPORT_FORMATS = ['markdown', 'json'] as const
const RESOLVE_ACTIONS = ['accept-gap', 'retry', 'confirm-skip'] as const

/** Resolve the calling session id or fail a non-agent caller. */
function sessionIdOf(exec: { agent?: { session: { id: string } } }): string {
  if (!exec.agent) throw new Error('sast_batch_* tools require an owning agent session')
  return exec.agent.session.id
}

function requiredString(value: unknown, name: string): string {
  if (typeof value !== 'string' || value === '') throw new Error(`sast_batch_* requires ${name}`)
  return value
}

/** Configuration for the batch tools: where to write batch-scoped report/methodology artifacts (mirrors `SastToolsConfig.reportRoot`), and the optional execution trigger. */
export interface SastBatchToolsConfig {
  readonly reportRoot?: string
  /**
   * Invoked once, after `sast_start_batch` durably creates the batch and
   * every job — the seam the composing plugin (`batch-plugin.ts`) uses to
   * kick off `DurableBatchScheduler.run(batchId)` as a background job
   * (`ctx.jobs`), so this tool call itself returns `{ batchId, total,
   * status: 'queued' }` immediately rather than blocking on up to 100
   * sequential audits. `ownerAgentOptions` is the calling batch owner's own
   * live `provider`/`model` (from `exec.agent?.options`, when a real agent
   * called this tool) — `batch-plugin.ts` prefers this over its static
   * config fallback so worker sessions default to the SAME route the batch
   * owner is already using, without needing Cordis config templating (none
   * exists for a plugin's own `config` block). Absent in tests that only
   * exercise the tools' store-level contract (no execution expected).
   * Errors are the trigger's own responsibility to handle — a throw here
   * does not roll back the already-committed batch.
   */
  readonly onBatchCreated?: (batchId: string, ownerAgentOptions?: { readonly provider?: string; readonly model?: string }) => void
  /**
   * Invoked once, after `sast_batch_resolve` requeues at least one job for
   * retry — the scheduler's `run()` loop already exited (no more `queued`
   * jobs) by the time a Review Inbox decision lands, so a retry needs the
   * same re-trigger `sast_start_batch` gets. Never invoked for
   * `accept-gap`/`confirm-skip` (those never requeue anything).
   */
  readonly onBatchResumed?: (batchId: string) => void
}

/** Per-job finding/coverage summary resolver — the seam over each job's own worker session graph (a separate `SastStore` per worker), injected so `sast_batch_state`/`sast_batch_report` don't need a real worker/domain wired in to be registered and tested. Returns an empty summary (0 findings, unknown coverage) for a job whose worker session was never reached. */
export interface JobSummaryResolver {
  resolve(jobId: string, workerSessionId: string | undefined): Promise<JobSummary>
}

const EMPTY_SUMMARY: JobSummary = { findingsBySeverity: {} }

/** Default resolver: no worker wiring yet, so every job reports the empty/unknown summary rather than guessing. */
const noopSummaryResolver: JobSummaryResolver = { resolve: async () => EMPTY_SUMMARY }

/** Register the 4 `sast_batch_*` tools on the caller's tool registry. */
export function registerSastBatchTools(
  ctx: Context,
  store: BatchStore,
  config: SastBatchToolsConfig = {},
  summaryResolver: JobSummaryResolver = noopSummaryResolver,
): void {
  const reportRoot = config.reportRoot ?? '/tmp/dsh-sast-reports'

  ctx.tools.register(defineTool({
    name: 'sast_start_batch',
    description: 'Atomically create a durable multi-repo audit batch: 1..100 repositories, one job per repository, and (if named) every methodology pinned to a fixed manifest/content digest for the whole batch (A22). Any precheck failure — empty/oversized repository list, missing authorization, an unresolvable named methodology — aborts with zero rows written. Does not itself loop repositories or ask about a single job\'s problem afterward; the durable scheduler executes strictly one job at a time.',
    parameters: {
      repositories: { type: 'array', required: true, description: '1..100 repository specs.', items: { type: 'object', additionalProperties: false, properties: {
        repoUrl: { type: 'string', required: true },
        provider: { type: 'string', enum: PROVIDERS },
        branch: { type: 'string' },
        ref: { type: 'string' },
        scope: { type: 'array', items: { type: 'string' } },
        objective: { type: 'string' },
      } } },
      objective: { type: 'string', required: true, description: 'The batch-wide completion judgement.' },
      authorization: { type: 'string', required: true, description: 'Batch-wide authorization note.' },
      methodologies: { type: 'array', description: 'User-named audit methodologies to pin for every job.', items: { type: 'string' } },
      methodologyMode: { type: 'string', enum: METHODOLOGY_MODES, description: 'Default explicit-only.' },
      policy: { type: 'object', additionalProperties: true, properties: {
        maxAttempts: { type: 'number' },
        cloneTimeoutMs: { type: 'number' },
        jobTimeoutMs: { type: 'number' },
        autoNarrowScope: { type: 'boolean' },
        deduplicate: { type: 'boolean' },
      } },
    },
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        batchId: { type: 'string', required: true },
        total: { type: 'number', required: true },
        status: { type: 'string', required: true },
      } },
      render: (_a, v) => [{ type: 'text', text: `Created batch ${v.batchId} with ${v.total} job(s), status ${v.status}.` }],
    },
    execute: async (args, exec) => {
      const ownerSessionId = sessionIdOf(exec)
      const repositories = args.repositories as ReadonlyArray<Record<string, unknown>>
      if (!Array.isArray(repositories) || repositories.length < 1 || repositories.length > 100) {
        throw new Error('sast_start_batch requires between 1 and 100 repositories')
      }
      const authorization = requiredString(args.authorization, 'authorization')
      const objective = requiredString(args.objective, 'objective')
      const methodologyNames = (args.methodologies as string[] | undefined) ?? []
      // Generated up front (never inside pinMethodologies) so the artifact
      // path baked into each pinned methodology's `uri` already carries the
      // REAL batchId — a provisional id here would leave the on-disk path
      // permanently mismatched with the batchId the persisted row claims.
      const batchId = `batch-${ownerSessionId}-${Date.now()}`

      let pinned: Awaited<ReturnType<typeof pinMethodologies>> = []
      if (methodologyNames.length > 0) {
        const cwd = (exec.agent?.session as { header?: { cwd?: string } } | undefined)?.header?.cwd
        const skills = ctx.get('skills') as { get: (name: string, options?: { cwd?: string }) => Promise<unknown> } | undefined
        if (skills === undefined) {
          throw new Error('sast_start_batch: no skill registry (ctx.skills) is composed on this agent; mount @deepseek-ai/dsh-tool-skill and a skill provider')
        }
        const resolver: MethodologyResolver = {
          resolve: async (name) => {
            const resolved = await skills.get(name, { cwd })
            return resolved as ResolvedMethodologySkill | undefined
          },
        }
        pinned = await pinMethodologies(resolver, methodologyNames, { root: reportRoot, sessionId: ownerSessionId, batchId })
      }

      const provider = (repo: Record<string, unknown>): SastProvider => {
        const explicit = repo.provider as SastProvider | undefined
        if (explicit !== undefined) return explicit
        return typeof repo.repoUrl === 'string' && /^https?:\/\//i.test(repo.repoUrl) ? 'gitlab' : 'local'
      }

      const { batch } = await store.createBatch(batchId, {
        ownerSessionId,
        objective,
        authorization,
        methodologyMode: (args.methodologyMode as typeof METHODOLOGY_MODES[number] | undefined) ?? 'explicit-only',
        policy: args.policy as never,
        methodologies: await Promise.all(pinned.map(async (p) => {
          const artifact = await store.putReportArtifact(p.artifact)
          return { name: p.methodology.name, manifestDigest: p.methodology.manifestDigest, contentDigest: p.methodology.contentDigest, artifactId: artifact.id }
        })),
        repositories: repositories.map(repo => ({
          provider: provider(repo),
          repoUrl: requiredString(repo.repoUrl, 'repositories[].repoUrl'),
          branch: repo.branch as string | undefined,
          ref: repo.ref as string | undefined,
          scope: repo.scope as string[] | undefined,
          objective: repo.objective as string | undefined,
        })),
      })
      config.onBatchCreated?.(batch.id, (exec.agent as { options?: { provider?: string; model?: string } } | undefined)?.options)
      return { batchId: batch.id, total: batch.total, status: batch.status }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'sast_batch_state',
    description: 'Read the calling owner session\'s active batch: its cursor, aggregate counts, and a redacted per-job summary (ordinal, redacted repo/ref, status/reviewStatus, attempt, finding/coverage summary, fallback). Never returns the full per-repo audit graph of any job.',
    parameters: {
      batchId: { type: 'string', description: 'Explicit batch id; defaults to the calling session\'s most recently created batch.' },
    },
    output: {
      schema: { type: 'object', additionalProperties: true, properties: {
        batch: { type: 'object', required: true, additionalProperties: true, properties: {} },
        jobs: { type: 'array', required: true, items: { type: 'object', additionalProperties: true, properties: {} } },
      } },
      render: (_a, v) => [{ type: 'text', text: `Batch ${v.batch.id}: ${v.batch.status}, ${v.jobs.length} job(s).` }],
    },
    execute: async (args, exec) => {
      const ownerSessionId = sessionIdOf(exec)
      const batch = args.batchId !== undefined
        ? await store.getBatch(args.batchId as string)
        : await store.getBatchByOwner(ownerSessionId)
      if (batch === undefined) throw new Error('sast_batch_state: no batch found for this session')
      const jobs = await store.listJobs(batch.id)
      const rows = await Promise.all(jobs.map(async (job) => ({
        ordinal: job.ordinal,
        repoUrl: job.repoSpec.repoUrl,
        ...(job.repoSpec.branch !== undefined ? { branch: job.repoSpec.branch } : {}),
        ...(job.repoSpec.ref !== undefined ? { ref: job.repoSpec.ref } : {}),
        status: job.status,
        reviewStatus: job.reviewStatus,
        attempt: job.attempt,
        ...(job.fallback !== undefined ? { fallback: job.fallback } : {}),
        ...(job.errorClass !== undefined ? { errorClass: job.errorClass } : {}),
        summary: await summaryResolver.resolve(job.id, job.workerSessionId),
      })))
      return { batch, jobs: rows } as never
    },
  }))

  ctx.tools.register(defineTool({
    name: 'sast_batch_report',
    description: 'Generate the cross-repo batch report (markdown or json, default markdown). Every input appears exactly once; aggregate counts are the sum of each job\'s own summary. Persisted as a durable report_artifacts row. A call before every job reaches an execution terminal state still generates a snapshot (the report itself is not blocked on completion — callers should check sast_batch_state\'s job statuses to know whether it is final).',
    parameters: {
      format: { type: 'string', enum: REPORT_FORMATS, description: 'Report format (default markdown).' },
      batchId: { type: 'string', description: 'Explicit batch id; defaults to the calling session\'s most recently created batch.' },
    },
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        markdown: { type: 'string' },
        json: { type: 'object', additionalProperties: true, properties: {} },
        artifactId: { type: 'string', required: true },
        uri: { type: 'string', required: true },
        sha256: { type: 'string', required: true },
        bytes: { type: 'number', required: true },
      } },
      render: (_a, v) => [{ type: 'text', text: v.markdown ?? JSON.stringify(v.json) }],
    },
    execute: async (args, exec) => {
      const ownerSessionId = sessionIdOf(exec)
      const format = (args.format as typeof REPORT_FORMATS[number] | undefined) ?? 'markdown'
      const batch = args.batchId !== undefined
        ? await store.getBatch(args.batchId as string)
        : await store.getBatchByOwner(ownerSessionId)
      if (batch === undefined) throw new Error('sast_batch_report: no batch found for this session')
      const jobs = await store.listJobs(batch.id)
      const rows: BatchReportJobRow[] = await Promise.all(jobs.map(async job => ({
        job, summary: await summaryResolver.resolve(job.id, job.workerSessionId),
      })))
      if (format === 'json') {
        const json = buildBatchJsonReport(batch, rows)
        const written = await writeArtifact({ root: reportRoot, sessionId: ownerSessionId, batchId: batch.id, kind: 'batch-json', content: JSON.stringify(json, null, 2) })
        const artifact = await store.putReportArtifact(written)
        return { json, artifactId: artifact.id, uri: artifact.uri, sha256: artifact.sha256, bytes: artifact.bytes } as never
      }
      const markdown = buildBatchMarkdownReport(batch, rows)
      const written = await writeArtifact({ root: reportRoot, sessionId: ownerSessionId, batchId: batch.id, kind: 'batch-markdown', content: markdown })
      const artifact = await store.putReportArtifact(written)
      return { markdown, artifactId: artifact.id, uri: artifact.uri, sha256: artifact.sha256, bytes: artifact.bytes }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'sast_batch_resolve',
    description: 'Finalize Review Inbox decisions for specific jobs (only reviewStatus=pending jobs are affected). "retry" puts the job back in the queue for the scheduler; "accept-gap" and "confirm-skip" write an append-only decision event and clear reviewStatus to accepted — neither ever rewrites the job\'s original error/fallback fields.',
    parameters: {
      batchId: { type: 'string', description: 'Explicit batch id; defaults to the calling session\'s most recently created batch.' },
      decisions: { type: 'array', required: true, items: { type: 'object', additionalProperties: false, properties: {
        jobId: { type: 'string', required: true },
        action: { type: 'string', required: true, enum: RESOLVE_ACTIONS },
        reason: { type: 'string' },
      } } },
    },
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        applied: { type: 'array', required: true, items: { type: 'object', additionalProperties: true, properties: {} } },
      } },
      render: (_a, v) => [{ type: 'text', text: `Applied ${v.applied.length} decision(s).` }],
    },
    execute: async (args, exec) => {
      const ownerSessionId = sessionIdOf(exec)
      const batch = args.batchId !== undefined
        ? await store.getBatch(args.batchId as string)
        : await store.getBatchByOwner(ownerSessionId)
      if (batch === undefined) throw new Error('sast_batch_resolve: no batch found for this session')
      const decisions = args.decisions as ReadonlyArray<{ jobId: string; action: typeof RESOLVE_ACTIONS[number]; reason?: string }>
      const applied: Array<{ jobId: string; action: string; skipped?: string }> = []
      let requeued = false
      for (const decision of decisions) {
        const job = await store.getJob(batch.id, decision.jobId)
        if (job === undefined) {
          applied.push({ jobId: decision.jobId, action: decision.action, skipped: 'job does not exist' })
          continue
        }
        if (job.reviewStatus !== 'pending') {
          applied.push({ jobId: decision.jobId, action: decision.action, skipped: `reviewStatus is ${job.reviewStatus}, not pending` })
          continue
        }
        if (decision.action === 'retry') {
          await store.requeueForRetry(batch.id, job.id, decision.reason ?? '')
          requeued = true
        } else {
          const reviewStatus: SastJobReviewStatus = decision.action === 'accept-gap' ? 'accepted' : 'confirmed-skip'
          await store.setReviewStatus(batch.id, job.id, reviewStatus, decision.reason ?? '')
        }
        applied.push({ jobId: decision.jobId, action: decision.action })
      }
      if (requeued) config.onBatchResumed?.(batch.id)
      return { applied }
    },
  }))
}
