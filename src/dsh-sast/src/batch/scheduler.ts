/**
 * `DurableBatchScheduler` (M5): drives one batch's jobs to completion,
 * strictly serial by ordinal (ADR-16: `concurrency` is fixed at 1), never
 * asking the user about a single job's problem (A25) — safe retry,
 * degrade, or skip are the only responses to a job failure; only a global
 * infrastructure failure (`policy.ts`'s `'infra'` class) stops the loop.
 *
 * The scheduler is a host-side driver, not a model: it claims a job
 * (`BatchStore.claimJob`), creates or resumes its worker
 * (`RepositoryWorkerFactory`), starts it with a delegation prompt, races its
 * `whenIdle()` against the job's deadline, and asks a
 * {@link JobOutcomeResolver} what actually happened once the worker goes
 * idle or the deadline fires — the resolver is the seam that will read the
 * worker's own durable state (did it call `sast_report`? does a
 * `report_artifacts` row exist for its session?) once `SastStore`/worker
 * wiring lands; here it is injected so this module is fully testable
 * against fakes without a real agent (spike-D is still unverified).
 * @module @tangxiaofeng7/dsh-sast-host/src/batch/scheduler
 */

import { deadline, TimeoutReason } from '@deepseek-ai/dsh-timeout'
import { classifyError, decideOutcome, type SastErrorClass, type SastJobDecision } from './policy.ts'
import type { BatchStore } from './store.ts'
import type { CreateWorkerInput, RepositoryWorker, RepositoryWorkerFactory } from './worker.ts'
import type { SastBatch, SastJobStatus, SastScanJob } from '../spec.ts'

/** Default lease duration when a batch's policy sets no `jobTimeoutMs` — generous enough for a real audit, short enough that a crashed worker's lease clears within one scheduler restart cycle. The lease and the job deadline share this value: the lease must outlive the worker's own deadline, or the scheduler's own claim could be treated as stale before the worker even times out. */
const DEFAULT_JOB_TIMEOUT_MS = 20 * 60 * 1000
/** Deadline code stamped on a scheduler-driven job timeout (matches `policy.ts`'s `classifyError`). */
const JOB_TIMEOUT_CODE = 'SAST_JOB_TIMEOUT'

/** What actually happened to one claimed job's worker attempt, as {@link JobOutcomeResolver} reports it. */
export type JobOutcome =
  | { readonly kind: 'succeeded' }
  | { readonly kind: 'degraded'; readonly coverageImpact: string }
  | { readonly kind: 'skipped'; readonly coverageImpact: string }
  | { readonly kind: 'failed'; readonly error: unknown }

/** Resolves what a worker attempt actually accomplished — the seam over the worker's own durable state (report_artifacts / scan / intent coverage for its session), injected so `scheduler.ts` needs no real store/agent to unit test. */
export interface JobOutcomeResolver {
  resolve(job: SastScanJob, worker: RepositoryWorker): Promise<JobOutcome>
}

/** Builds the delegation prompt handed to a freshly created/resumed worker — the one piece of batch-specific context a repository-worker session needs beyond its own tools. */
export interface PromptBuilder {
  build(job: SastScanJob): string
}

/** One iteration's result, reported for observability/testing (the scheduler drives the whole batch by looping this internally; callers normally only care about {@link DurableBatchScheduler.run}'s final summary). */
export interface JobRunResult {
  readonly job: SastScanJob
  readonly outcome: 'succeeded' | 'degraded' | 'skipped' | 'failed' | 'timed_out' | 'retried' | 'fail-closed'
}

/** Summary returned by {@link DurableBatchScheduler.run}. */
export interface BatchRunSummary {
  readonly results: readonly JobRunResult[]
  /** Present only when a job's failure classified as `'infra'` — the loop stopped without claiming further ordinals (A25's one exception: fail closed on a global failure). */
  readonly failedClosed: boolean
}

export interface DurableBatchSchedulerOptions {
  readonly store: BatchStore
  readonly workerFactory: RepositoryWorkerFactory
  readonly outcomeResolver: JobOutcomeResolver
  readonly promptBuilder: PromptBuilder
  /** Worker cwd allocator: given a job, returns the read-only workspace directory its worker's tools resolve paths against (a fresh directory per attempt). */
  readonly workspaceOf: (job: SastScanJob) => Promise<string>
  /**
   * Stable identity for every lease THIS scheduler instance claims, across
   * every job and every attempt (default: a random id generated once per
   * instance). Must NOT vary per job or per attempt — `BatchStore.claimJob`
   * treats a different owner as a competing scheduler and refuses to grab
   * a job whose prior (same-batch) lease has not actually expired yet
   * (deliberately, so `retry_wait -> queued` does not let a genuinely
   * different process instance steal a live lease); a scheduler that
   * minted a fresh owner id per attempt would perpetually lock itself out
   * of its own retries.
   */
  readonly leaseOwner?: string
}

/** Terminal statuses that map directly onto a {@link JobRunResult} outcome label. */
const AUTO_TERMINAL_STATUSES: ReadonlySet<SastJobStatus> = new Set(['succeeded', 'degraded', 'skipped', 'failed', 'timed_out'])

/**
 * Drives one batch to completion (or a fail-closed halt), strictly serial by
 * ordinal, never asking the user about a single job's problem.
 */
export class DurableBatchScheduler {
  /** This instance's stable lease-owner identity (see {@link DurableBatchSchedulerOptions.leaseOwner}'s doc) — resolved once, in the constructor, never regenerated per call. */
  private readonly leaseOwner: string

  constructor(private readonly options: DurableBatchSchedulerOptions) {
    this.leaseOwner = options.leaseOwner ?? `scheduler:${Math.random().toString(36).slice(2)}`
  }

  /**
   * Recover any lease left dangling by a prior process instance (A21), then
   * run every remaining `queued` job of the batch in ordinal order to a
   * terminal or fail-closed outcome. Idempotent to call again on a batch
   * that already has some terminal jobs — it only ever claims `queued` ones,
   * so an already-`succeeded` job is never re-run (the other half of A21).
   */
  async run(batchId: string): Promise<BatchRunSummary> {
    const batch = await this.options.store.getBatch(batchId)
    if (batch === undefined) throw new Error(`sast: batch ${batchId} does not exist`)
    await this.options.store.recoverExpiredLeases(batchId)
    const results: JobRunResult[] = []
    while (true) {
      const jobs = await this.options.store.listJobs(batchId)
      const next = jobs.find(job => job.status === 'queued')
      if (next === undefined) break
      const result = await this.runOneJob(batchId, batch, next)
      results.push(result)
      if (result.outcome === 'fail-closed') {
        return { results, failedClosed: true }
      }
    }
    return { results, failedClosed: false }
  }

  /** Claim, run, and finalize exactly one job — the unit A18 requires be strictly sequential (never called concurrently by `run`'s own loop, and callers must not call it concurrently for the same batch either). */
  private async runOneJob(batchId: string, batch: SastBatch, job: SastScanJob): Promise<JobRunResult> {
    const timeoutMs = batch.policy.jobTimeoutMs ?? DEFAULT_JOB_TIMEOUT_MS
    const claimed = await this.options.store.claimJob(batchId, job.id, this.leaseOwner, timeoutMs)
    if (claimed === undefined) {
      // Lost the claim race (another process instance, or the job moved on
      // its own) — report it as whatever its current state now says rather
      // than guessing; the caller's loop will simply re-read jobs next pass.
      const current = await this.options.store.getJob(batchId, job.id) ?? job
      return { job: current, outcome: outcomeOf(current.status) }
    }

    const sessionId = `worker-${batchId}-${claimed.ordinal}-${claimed.attempt}`
    const cwd = await this.options.workspaceOf(claimed)
    const workerInput: CreateWorkerInput = { sessionId, cwd, batchId, job: claimed }
    const worker = await this.options.workerFactory.create(workerInput)
    try {
      await this.options.store.transitionJob(batchId, job.id, 'running')
      await this.options.store.setWorkerSessionId(batchId, job.id, worker.sessionId)
      const prompt = this.options.promptBuilder.build(claimed)
      worker.start(prompt)

      using timer = deadline(undefined, timeoutMs, JOB_TIMEOUT_CODE)
      const idled = await raceIdleAgainstDeadline(worker, timer.signal)
      if (!idled) {
        worker.cancel(JOB_TIMEOUT_CODE)
        return await this.finalize(batchId, batch, claimed, { kind: 'failed', error: new TimeoutReason(JOB_TIMEOUT_CODE, timeoutMs) })
      }

      const outcome = await this.options.outcomeResolver.resolve(claimed, worker)
      return await this.finalize(batchId, batch, claimed, outcome)
    } finally {
      await worker.dispose()
    }
  }

  /** Apply `policy.ts`'s decision for one resolved outcome, writing the job's terminal (or retry) state. */
  private async finalize(batchId: string, batch: SastBatch, job: SastScanJob, outcome: JobOutcome): Promise<JobRunResult> {
    if (outcome.kind === 'succeeded') {
      const updated = await this.options.store.recordJobOutcome(batchId, job.id, 'succeeded', {})
      return { job: updated, outcome: 'succeeded' }
    }
    if (outcome.kind === 'degraded' || outcome.kind === 'skipped') {
      const updated = await this.options.store.recordJobOutcome(batchId, job.id, outcome.kind, { fallback: outcome.coverageImpact })
      await this.options.store.setReviewStatus(batchId, job.id, 'pending', outcome.coverageImpact)
      return { job: updated, outcome: outcome.kind }
    }
    // outcome.kind === 'failed'
    const errorClass: SastErrorClass = classifyError(outcome.error)
    const decision = decideOutcome(errorClass, job.attempt, batch.policy.maxAttempts, batch.policy.autoNarrowScope)
    return await this.applyFailureDecision(batchId, job, errorClass, decision)
  }

  private async applyFailureDecision(
    batchId: string,
    job: SastScanJob,
    errorClass: SastErrorClass,
    decision: SastJobDecision,
  ): Promise<JobRunResult> {
    if (decision.action === 'fail-closed') {
      return { job, outcome: 'fail-closed' }
    }
    if (decision.action === 'retry') {
      await this.options.store.transitionJob(batchId, job.id, 'retry_wait', errorClass)
      const requeued = await this.options.store.transitionJob(batchId, job.id, 'queued')
      return { job: requeued, outcome: 'retried' }
    }
    // decision.action is 'degrade' or 'skip'. A degrade whose cause was
    // specifically a timeout gets the dedicated `timed_out` terminal status
    // (the job schema's own distinction from a generic `degraded`); every
    // other degrade (blocked/unknown) stays `degraded`.
    const terminal: SastJobStatus = decision.action === 'skip' ? 'skipped' : errorClass === 'timeout' ? 'timed_out' : 'degraded'
    const updated = await this.options.store.recordJobOutcome(batchId, job.id, terminal, { errorClass, fallback: decision.coverageImpact })
    await this.options.store.setReviewStatus(batchId, job.id, 'pending', decision.coverageImpact)
    return { job: updated, outcome: terminal }
  }
}

/** Race a worker's `whenIdle()` against an already-armed deadline signal. Returns `true` when the worker idled first, `false` when the deadline fired first. */
async function raceIdleAgainstDeadline(worker: RepositoryWorker, signal: AbortSignal): Promise<boolean> {
  if (signal.aborted) return false
  const onAbort = (): void => {
    settleDeadline()
  }
  let settleDeadline: () => void = () => {}
  const deadlinePromise = new Promise<void>((resolve) => {
    settleDeadline = resolve
    signal.addEventListener('abort', onAbort, { once: true })
  })
  try {
    const idle = worker.whenIdle().then(() => 'idle' as const)
    const timedOut = deadlinePromise.then(() => 'timeout' as const)
    return (await Promise.race([idle, timedOut])) === 'idle'
  } finally {
    signal.removeEventListener('abort', onAbort)
  }
}

/** Map a job's current status back to the closest {@link JobRunResult} outcome label, for the claim-race-lost path — a job that is already auto-terminal is reported as such; anything else (still queued, retry_wait, cancelled) is reported as `'retried'` (the loop will simply re-read and try again, or stop if it was cancelled). */
function outcomeOf(status: SastJobStatus): JobRunResult['outcome'] {
  if (AUTO_TERMINAL_STATUSES.has(status)) return status as JobRunResult['outcome']
  return 'retried'
}
