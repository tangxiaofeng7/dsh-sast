/**
 * `RepositoryWorkerFactory` (M5): creates/resumes/observes an independent
 * repository-worker session for one batch job.
 *
 * spike-D (docs/architecture.md §4/§6) asked whether the host can actually
 * do this through `ctx.agents.create/resume`, backed by
 * `AgentRegistry.setFactory` (`@deepseek-ai/dsh-agent-loop`) — verified in
 * this repo's `tests/batch/worker-factory.spec.ts`, which drives the real
 * `dsh-agent-loop` package against a deterministic keyless
 * `@deepseek-ai/dsh-llm-replay` adapter (no live model call, no fake
 * `AgentFactory`) and asserts every item spike-D required: a distinct
 * session id from the owner, `origin !== 'subagent'`, `agentPreset`/`cwd`
 * carried through, `cancel()` + a deadline race driving a hung worker to
 * idle, and `dispose()` + `resume({ resumeSessionId })` restoring the same
 * session.
 *
 * Never `ctx.subagents.startContinuable` — that path always produces
 * `origin: 'subagent'`, which spike-D explicitly forbids using to
 * impersonate a worker (a subagent is delegation, not an independently
 * durable, resumable, cancellable session the scheduler owns).
 * @module @tangxiaofeng7/dsh-sast-host/src/batch/worker
 */

import type { Context } from '@deepseek-ai/cordis'
import type { AgentHandle, AgentOptions } from '@deepseek-ai/dsh-agent'
import { SessionId } from '@deepseek-ai/dsh-session'
import { createUserMessage } from '@deepseek-ai/dsh-llm/message'
import type { SastScanJob } from '../spec.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Host-provided (`@deepseek-ai/dsh-agent-presets`, shipped by `dsh-web-app`) — mounts one preset's whole composition (tools, prompt sections, `toolFilter`) onto a freshly created agent's own scope. Absent when the composing host does not carry this service; `createAgentWorkerFactory`'s `setup` fails loudly rather than silently creating an unrestricted worker in that case. */
    agentPresets?: {
      mount(agentCtx: Context, id?: string): Promise<unknown>
    }
  }
}

/** Everything the scheduler needs to observe/drive one claimed worker session, independent of the concrete Agent SDK shape. */
export interface RepositoryWorker {
  /** The worker's own session id — distinct from the batch owner's session id and from every other job's worker (A18). */
  readonly sessionId: string
  /** Send the initial delegation prompt (workspace path, repo spec, methodology references, parent batch/job ids) and wake the worker. */
  start(prompt: string): void
  /** Resolve once the worker's driver reaches quiescence (turn-driving loop idle) — the scheduler's signal that the job attempt has run to some conclusion. */
  whenIdle(): Promise<void>
  /** Cancel the worker's active turn (job deadline elapsed, or a batch-level cancellation) — the cause is a short stable code, not free text. */
  cancel(cause: string): void
  /** Release the worker session and its scope. Idempotent. */
  dispose(): Promise<void>
}

/** Input to {@link RepositoryWorkerFactory.create}. */
export interface CreateWorkerInput {
  /** The new worker's own session id (store-assigned, `worker-<batchId>-<ordinal>-<attempt>` by convention — never reused across attempts of the SAME job: a fresh attempt gets a fresh session so a crashed prior attempt's log cannot bleed into the next one). */
  readonly sessionId: string
  /**
   * The worker's trusted `cwd` — the BATCH OWNER's own cwd, never a
   * per-job repository clone. `sast_register_skill`'s methodology lookup
   * resolves Skills via `session.header.cwd` (ADR-14/15: never
   * `scan.workspacePath`, which is untrusted repository content); if a
   * worker's `cwd` were its own job's clone, that lookup would resolve
   * against attacker-controlled content instead of the trusted Skill root
   * every other decision agent in this deployment uses. The worker clones
   * its OWN job's repository itself, by calling `sast_start_scan` (the same
   * clone/guardrail/harden pipeline every standalone single-repo worker
   * already uses) — the scheduler never pre-clones on the worker's behalf.
   */
  readonly cwd: string
  /** The owning batch's id, carried into the worker's session metadata for `sastBatch` projection lookups. */
  readonly batchId: string
  /** The specific job this worker executes. */
  readonly job: SastScanJob
}

/**
 * Creates/resumes/observes the independent repository-worker sessions the
 * scheduler drives, one per job attempt. The real implementation is
 * `ctx.agents.create/resume` with `meta.agentPreset: 'sast'` (or a
 * `sast-*` derived preset) and `meta.cwd` pointing at that attempt's own
 * read-only clone — see {@link createAgentWorkerFactory}.
 */
export interface RepositoryWorkerFactory {
  /** Create a brand-new worker session for one job attempt (never reused across attempts — see {@link CreateWorkerInput.sessionId}). */
  create(input: CreateWorkerInput): Promise<RepositoryWorker>
  /** Resume a worker session that a prior process instance created but never observed reach a terminal state (A21: crash recovery). */
  resume(sessionId: string): Promise<RepositoryWorker>
  /**
   * Read back the `(batchId, jobId)` a given worker session id was created
   * for — the seam `sast_start_scan`'s tool boundary uses to auto-tag its
   * `scans` row without the model ever supplying `batchId`/`jobId` as
   * arguments (they must never be model-suppliable: a worker session is
   * already scoped to exactly one job, so the linkage is structural, not
   * a claim the model makes). `undefined` for a session this factory never
   * created (e.g. the batch owner's own session, or a single-repo worker
   * outside any batch).
   */
  lineageOf(sessionId: string): { readonly batchId: string; readonly jobId: string } | undefined
}

/** Model route for repository-worker sessions — resolved once per factory call, not cached across jobs (every worker in ONE batch shares that batch's own route; a different batch may resolve a different one). A plain value is the common case; a function lets the composing plugin prefer the calling batch owner's own live route over a static config fallback. */
export interface AgentWorkerFactoryConfig {
  readonly agentOptions: AgentOptions | ((batchId: string) => AgentOptions)
  /** Preset id `setup` mounts onto every worker's own scope (default `'sast'`, matching `meta.agentPreset` and `preset/sast/agent.cordis.yml`'s own directory name) — override only for a deployment that ships a derived `sast-*` preset for its workers. */
  readonly presetId?: string
}

/** Wrap a live `AgentHandle` to satisfy {@link RepositoryWorker}. */
function workerOf(handle: AgentHandle): RepositoryWorker {
  return {
    sessionId: handle.agent.session.header.id,
    start: (prompt) => {
      handle.agent.followup(createUserMessage({ content: [{ type: 'text', text: prompt }], source: { kind: 'user' } }))
    },
    whenIdle: () => handle.agent.whenIdle(),
    cancel: (cause) => {
      handle.agent.cancel({ kind: 'hook', reason: cause })
    },
    dispose: () => handle.dispose(),
  }
}

/**
 * The real spike-D-verified implementation: `ctx.agents.create/resume`
 * backed by a registered `AgentFactory` (`@deepseek-ai/dsh-agent-loop` in
 * production). `meta.agentPreset: 'sast'` is presentation metadata ONLY —
 * it does not by itself compose any tool, prompt section, or `toolFilter`
 * onto the new session (verified against a real `ctx.agents.create()` +
 * `@deepseek-ai/dsh-agent-presets` mount: a worker created with only
 * `meta.agentPreset` set sees none of the preset's scoped tools). The
 * actual composition happens through `setup`, the one supported call site
 * for `ctx.agentPresets.mount(agentCtx, presetId)` — this is what actually
 * gives the worker the read-only, no-shell `sast` preset tool surface
 * (`preset/sast/agent.cordis.yml`) instead of silently inheriting whatever
 * the composing plugin's own `ctx` happens to have globally registered
 * (which, on a real multi-preset host, could include tools from OTHER
 * presets entirely). `meta.cwd` is the BATCH OWNER's own trusted cwd (see
 * {@link CreateWorkerInput.cwd}'s doc for why — never a per-job repository
 * clone). Never sets `origin` — leaving it `undefined` is what keeps this
 * session from ever being mistaken for a `subagent` delegation.
 */
export function createAgentWorkerFactory(ctx: Context, config: AgentWorkerFactoryConfig): RepositoryWorkerFactory {
  // In-memory only: this factory is one long-lived object per plugin
  // instance, re-populated by `create()` on every attempt (never by
  // `resume()`, since a resumed session already carries its scan's own
  // durable batchId/jobId — see `lineageOf`'s doc). Never persisted; a
  // process restart re-derives it from the FRESH `create()` calls the
  // scheduler's own lease-recovery loop issues, not from this map surviving
  // the crash.
  const lineage = new Map<string, { readonly batchId: string; readonly jobId: string }>()
  const resolveAgentOptions = (batchId: string): AgentOptions =>
    typeof config.agentOptions === 'function' ? config.agentOptions(batchId) : config.agentOptions
  const presetId = config.presetId ?? 'sast'
  const mountPreset = async (agentCtx: Context): Promise<void> => {
    const agentPresets = agentCtx.get('agentPresets') as Context['agentPresets']
    if (agentPresets === undefined) {
      throw new Error('sast-batch: no ctx.agentPresets service is composed on this host (expected from @deepseek-ai/dsh-agent-presets, shipped by dsh-web-app) — cannot compose the sast preset\'s tool restrictions onto a batch worker session; refusing to create an unrestricted one')
    }
    await agentPresets.mount(agentCtx, presetId)
  }
  return {
    create: async (input) => {
      const handle = await ctx.agents.create({
        sessionId: SessionId(input.sessionId),
        meta: { cwd: input.cwd, agentPreset: presetId },
        agentOptions: resolveAgentOptions(input.batchId),
        setup: mountPreset,
      })
      lineage.set(input.sessionId, { batchId: input.batchId, jobId: input.job.id })
      return workerOf(handle)
    },
    resume: async (sessionId) => {
      const lineageForSession = lineage.get(sessionId)
      const agentOptions = lineageForSession !== undefined ? resolveAgentOptions(lineageForSession.batchId) : resolveAgentOptions('')
      const handle = await ctx.agents.resume({ resumeSessionId: SessionId(sessionId), agentOptions, setup: mountPreset })
      return workerOf(handle)
    },
    lineageOf: (sessionId) => lineage.get(sessionId),
  }
}

