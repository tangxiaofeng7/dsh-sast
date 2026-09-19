/**
 * `BatchStore` (M5): durable reads/writes for the four batch-control-plane
 * tables (`batches`, `scan_jobs`, `job_events`, `report_artifacts`).
 *
 * Store discipline mirrors `store.ts` throughout: one write queue per batch
 * (not per session — the owning identity here is the batch, and the
 * scheduler's claim/lease/advance operations must serialize against each
 * other, not against the owner session's unrelated tool calls), CAS state
 * transitions (never a blind overwrite of `status`), append-only
 * `job_events` with a store-assigned monotonic `seq`, and the injected clock
 * (ADR-10) for every timestamp.
 *
 * Atomicity: the domain has no cross-table transaction primitive, so
 * `createBatch` follows the same validate-first/write-in-order/roll-back-on-
 * failure shape `store.ts`'s `submit()` already uses for its own
 * multi-record writes — either every job row lands or none does.
 * @module @tangxiaofeng7/dsh-sast-host/src/batch/store
 */

import type { Domain } from '@deepseek-ai/dsh-storage-domain'
import { ReportArtifactStore } from '../report/artifact-store.ts'
import {
  sastDomainSpec,
  type SastBatch,
  type SastBatchStatus,
  type SastJobEvent,
  type SastJobReviewStatus,
  type SastJobStatus,
  type SastReportArtifact,
  type SastScanJob,
} from '../spec.ts'

/** Physical key for a batch-scoped row (mirrors `store.ts`'s `recordKey`). */
function recordKey(batchId: string, id: string): string {
  return `${batchId}:${id}`
}

/** Copy and freeze one record before it crosses the service boundary (mirrors `store.ts`'s `snapshot`). */
function snapshot<T extends object>(value: T): T {
  return Object.freeze({ ...value })
}

/** Legal job status transitions (CAS — every other edge is rejected). Terminal states have no outgoing edge (except `retry_wait -> queued`, modeled as `queued`'s own incoming set). */
const LEGAL_JOB_TRANSITIONS: Record<SastJobStatus, ReadonlySet<SastJobStatus>> = {
  queued: new Set(['preparing', 'cancelled']),
  preparing: new Set(['running', 'cancelled', 'failed', 'timed_out']),
  running: new Set(['retry_wait', 'succeeded', 'degraded', 'skipped', 'failed', 'timed_out', 'cancelled']),
  retry_wait: new Set(['queued', 'cancelled']),
  succeeded: new Set([]),
  degraded: new Set([]),
  skipped: new Set([]),
  failed: new Set([]),
  timed_out: new Set([]),
  cancelled: new Set([]),
}

/** Automatic-execution terminal states: each releases the queue to advance to the next ordinal. */
const AUTO_TERMINAL_JOB_STATUSES: ReadonlySet<SastJobStatus> = new Set(['succeeded', 'degraded', 'skipped', 'failed', 'timed_out'])

/** Legal batch status transitions (CAS). A user retrying part of a batch moves it back to `running`. */
const LEGAL_BATCH_TRANSITIONS: Record<SastBatchStatus, ReadonlySet<SastBatchStatus>> = {
  queued: new Set(['running']),
  running: new Set(['awaiting_review', 'completed', 'completed_with_issues']),
  awaiting_review: new Set(['running', 'completed', 'completed_with_issues']),
  completed: new Set(['running']),
  completed_with_issues: new Set(['running']),
}

/** One repository spec input to {@link BatchStore.createBatch}, pre-validated/redacted by the caller (`sast_start_batch`'s tool boundary — never raw model input reaching this store). */
export interface ScanJobRepoSpecInput {
  readonly provider: SastScanJob['repoSpec']['provider']
  readonly repoUrl: string
  readonly branch?: string
  readonly ref?: string
  readonly scope?: readonly string[]
  readonly objective?: string
}

/** Input to {@link BatchStore.createBatch}. */
export interface CreateBatchInput {
  readonly ownerSessionId: string
  readonly objective: string
  readonly authorization?: string
  readonly methodologies?: readonly SastBatch['methodologies'][number][]
  readonly methodologyMode?: SastBatch['methodologyMode']
  readonly policy?: Partial<SastBatch['policy']>
  readonly repositories: readonly ScanJobRepoSpecInput[]
}

/** Result of {@link BatchStore.createBatch}. */
export interface CreatedBatch {
  readonly batch: SastBatch
  readonly jobs: readonly SastScanJob[]
}

/**
 * Owning handle for the batch control-plane tables. Not a Cordis service:
 * a private helper constructed once per plugin `apply` fiber (M5), sharing
 * the same open `sast` domain `SastStore` uses (see `SastStore`'s
 * `sharedDomain` constructor parameter — the domain can only be opened
 * once per facility).
 */
export class BatchStore {
  private readonly batchQueues = new Map<string, Promise<void>>()
  private readonly eventSeqCache = new Map<string, number>()
  private readonly artifacts: ReportArtifactStore

  /**
   * @param domain - shared opener resolving the already-open `sast` domain (see class doc).
   * @param now - injected clock (ADR-10): every timestamp here comes from this, never model input or the OS clock read elsewhere.
   * @param artifacts - optional shared `report_artifacts` store — MUST be the same instance `SastStore` uses once M5 composes both against the same domain (two independent id counters over one table can collide); defaults to a private instance over this store's own `domain()` opener.
   */
  constructor(
    private readonly domain: () => Promise<Domain<typeof sastDomainSpec>>,
    private readonly now: () => number = () => Date.now(),
    artifacts?: ReportArtifactStore,
  ) {
    this.artifacts = artifacts ?? new ReportArtifactStore(domain, now)
  }

  /** Serialize read/allocate/write transactions for one batch (mirrors `store.ts`'s per-session `enqueue`). */
  private enqueue<T>(batchId: string, operation: () => Promise<T>): Promise<T> {
    const previous = this.batchQueues.get(batchId) ?? Promise.resolve()
    const current = previous.then(operation)
    const settled = current.then(() => undefined, () => undefined)
    this.batchQueues.set(batchId, settled)
    return current
  }

  /** Read one batch row, if present. */
  async getBatch(batchId: string): Promise<SastBatch | undefined> {
    return (await this.domain()).table('batches').get(batchId)
  }

  /**
   * Read the most recently created batch owned by one session (v1: an
   * owner session runs at most one batch at a time — the "active batch
   * pin" the tools layer resolves `sast_batch_state`/`sast_batch_report`
   * against when the model does not name a `batchId` explicitly).
   */
  async getBatchByOwner(ownerSessionId: string): Promise<SastBatch | undefined> {
    const domain = await this.domain()
    const owned = [...domain.table('batches').entries()]
      .map(([, row]) => row)
      .filter(row => row.ownerSessionId === ownerSessionId)
      .sort((a, b) => b.createdAt - a.createdAt)
    return owned[0]
  }

  /** Read one job row within a batch, if present. */
  async getJob(batchId: string, jobId: string): Promise<SastScanJob | undefined> {
    return (await this.domain()).table('scan_jobs').get(recordKey(batchId, jobId))
  }

  /** Read every job row of one batch, ordered by ordinal. */
  async listJobs(batchId: string): Promise<SastScanJob[]> {
    const domain = await this.domain()
    return [...domain.table('scan_jobs').entries()]
      .map(([, row]) => row)
      .filter(row => row.batchId === batchId)
      .sort((a, b) => a.ordinal - b.ordinal)
  }

  /** Read every event of one batch, ordered by `seq`. */
  async listEvents(batchId: string): Promise<SastJobEvent[]> {
    const domain = await this.domain()
    return [...domain.table('job_events').entries()]
      .map(([, row]) => row)
      .filter(row => row.batchId === batchId)
      .sort((a, b) => a.seq - b.seq)
  }

  /** The next `seq` for one batch's append-only event log — O(1) after the first call, rebuilt from the durable table on first touch. */
  private async nextEventSeq(batchId: string): Promise<number> {
    let max = this.eventSeqCache.get(batchId)
    if (max === undefined) {
      max = 0
      for (const [, row] of (await this.domain()).table('job_events').entries()) {
        if (row.batchId === batchId) max = Math.max(max, row.seq)
      }
    }
    const next = max + 1
    this.eventSeqCache.set(batchId, next)
    return next
  }

  /** Append one lifecycle/decision event to a batch's log (never mutated or deleted afterward). */
  private async appendEvent(batchId: string, jobId: string | undefined, kind: string, detail: string): Promise<SastJobEvent> {
    const domain = await this.domain()
    const seq = await this.nextEventSeq(batchId)
    const id = `event-${batchId}-${seq}`
    const event = snapshot<SastJobEvent>({
      id, batchId, ...(jobId !== undefined ? { jobId } : {}), seq, kind, detail, at: this.now(),
    })
    await domain.table('job_events').put(recordKey(batchId, id), event)
    return event
  }

  /**
   * Atomically create one batch and every one of its jobs (1..100,
   * `ordinal` 1-based and unique within the batch). All-or-nothing: any
   * failure mid-write rolls back every row already put, so a partial batch
   * never becomes visible — the caller (`sast_start_batch`'s tool boundary)
   * is expected to have already validated repository count/authorization/
   * methodology resolution BEFORE calling this, so a failure here should
   * only ever be an id/backend problem, not a normal validation rejection.
   */
  async createBatch(batchId: string, input: CreateBatchInput): Promise<CreatedBatch> {
    return this.enqueue(batchId, async () => {
      const domain = await this.domain()
      if (input.repositories.length < 1 || input.repositories.length > 100) {
        throw new Error('sast: a batch must contain between 1 and 100 repositories')
      }
      const createdAt = this.now()
      const batch = snapshot<SastBatch>({
        id: batchId,
        ownerSessionId: input.ownerSessionId,
        objective: input.objective,
        authorization: input.authorization ?? '',
        methodologies: [...(input.methodologies ?? [])],
        methodologyMode: input.methodologyMode ?? 'explicit-only',
        policy: {
          maxAttempts: input.policy?.maxAttempts ?? 2,
          ...(input.policy?.cloneTimeoutMs !== undefined ? { cloneTimeoutMs: input.policy.cloneTimeoutMs } : {}),
          ...(input.policy?.jobTimeoutMs !== undefined ? { jobTimeoutMs: input.policy.jobTimeoutMs } : {}),
          autoNarrowScope: input.policy?.autoNarrowScope ?? true,
          deduplicate: input.policy?.deduplicate ?? true,
          concurrency: 1,
        },
        status: 'queued',
        total: input.repositories.length,
        createdAt,
      })
      const written: Array<{ table: 'batches' | 'scan_jobs'; key: string }> = []
      try {
        await domain.table('batches').put(batchId, batch)
        written.push({ table: 'batches', key: batchId })
        const jobs: SastScanJob[] = []
        for (const [index, repo] of input.repositories.entries()) {
          const ordinal = index + 1
          const jobId = `job-${ordinal}`
          const job = snapshot<SastScanJob>({
            id: jobId,
            batchId,
            ordinal,
            repoSpec: {
              provider: repo.provider,
              repoUrl: repo.repoUrl,
              ...(repo.branch !== undefined ? { branch: repo.branch } : {}),
              ...(repo.ref !== undefined ? { ref: repo.ref } : {}),
              scope: [...(repo.scope ?? [])],
              ...(repo.objective !== undefined ? { objective: repo.objective } : {}),
            },
            attempt: 0,
            status: 'queued',
            reviewStatus: 'none',
            createdAt,
            updatedAt: createdAt,
          })
          await domain.table('scan_jobs').put(recordKey(batchId, jobId), job)
          written.push({ table: 'scan_jobs', key: recordKey(batchId, jobId) })
          jobs.push(job)
        }
        await this.appendEvent(batchId, undefined, 'batch-created', `${jobs.length} job(s)`)
        return { batch, jobs }
      } catch (error) {
        for (const { table, key } of written.reverse()) {
          try {
            await domain.table(table).delete(key)
          } catch {
            // Rollback already lost the race with a failing backend; the
            // original error below is the actionable one.
          }
        }
        throw error
      }
    })
  }

  /** CAS a batch's status. Throws (naming both states) on an illegal transition; a no-op when `to` already equals the current status. */
  async transitionBatch(batchId: string, to: SastBatchStatus): Promise<SastBatch> {
    return this.enqueue(batchId, async () => {
      const domain = await this.domain()
      const current = domain.table('batches').get(batchId)
      if (current === undefined) throw new Error(`sast: batch ${batchId} does not exist`)
      if (current.status === to) return current
      if (!LEGAL_BATCH_TRANSITIONS[current.status].has(to)) {
        throw new Error(`sast: illegal batch transition ${current.status} -> ${to} for batch ${batchId}`)
      }
      const updated = snapshot<SastBatch>({ ...current, status: to })
      await domain.table('batches').put(batchId, updated)
      await this.appendEvent(batchId, undefined, 'batch-status', `${current.status} -> ${to}`)
      return updated
    })
  }

  /**
   * CAS one job's status. `cancelled` (user cancellation) is legal from
   * every non-terminal state and additionally moves the batch itself so the
   * scheduler stops claiming further ordinals (the caller drives that batch
   * transition; this method only enforces the job-level CAS and logs the
   * event with `detail`).
   */
  async transitionJob(batchId: string, jobId: string, to: SastJobStatus, detail = ''): Promise<SastScanJob> {
    return this.enqueue(batchId, async () => {
      const domain = await this.domain()
      const key = recordKey(batchId, jobId)
      const current = domain.table('scan_jobs').get(key)
      if (current === undefined) throw new Error(`sast: job ${jobId} does not exist in batch ${batchId}`)
      if (current.status === to) return current
      if (!LEGAL_JOB_TRANSITIONS[current.status].has(to)) {
        throw new Error(`sast: illegal job transition ${current.status} -> ${to} for job ${jobId}`)
      }
      const updated = snapshot<SastScanJob>({ ...current, status: to, updatedAt: this.now() })
      await domain.table('scan_jobs').put(key, updated)
      await this.appendEvent(batchId, jobId, 'job-status', detail === '' ? `${current.status} -> ${to}` : `${current.status} -> ${to}: ${detail}`)
      return updated
    })
  }

  /**
   * Record the worker session id the scheduler created for this job's
   * current attempt — the seam `sast_batch_state`/`sast_batch_report`'s
   * `JobSummaryResolver` uses to find that worker's own durable coverage/
   * findings (`workerSessionId`, declared in the schema but otherwise never
   * written: the scheduler computes the session id deterministically
   * itself, right after `claimJob`, so this is a plain informational write,
   * never load-bearing for the CAS state machine itself). Does not append a
   * `job_events` row — this is bookkeeping, not a status transition.
   */
  async setWorkerSessionId(batchId: string, jobId: string, workerSessionId: string): Promise<SastScanJob> {
    return this.enqueue(batchId, async () => {
      const domain = await this.domain()
      const key = recordKey(batchId, jobId)
      const current = domain.table('scan_jobs').get(key)
      if (current === undefined) throw new Error(`sast: job ${jobId} does not exist in batch ${batchId}`)
      const updated = snapshot<SastScanJob>({ ...current, workerSessionId, updatedAt: this.now() })
      await domain.table('scan_jobs').put(key, updated)
      return updated
    })
  }

  /** Whether a job status is one of the five automatic-execution terminal states (each releases the queue to advance). */
  static isAutoTerminal(status: SastJobStatus): boolean {
    return AUTO_TERMINAL_JOB_STATUSES.has(status)
  }

  /**
   * Attempt to claim a lease on one job for `leaseOwner`, bumping `attempt`.
   * Fails (returns `undefined`) when the job is not `queued` — including a
   * job already claimed by anyone (claiming moves it straight to
   * `preparing`, so a second claim attempt against the same job, same owner
   * or not, always sees a non-`queued` status and fails). The additional
   * lease-liveness check below guards the one path that can leave a job
   * `queued` again while still carrying a PRIOR lease's fields: the
   * `retry_wait -> queued` transition does not clear `leaseOwner`/
   * `leaseExpiresAt` (only {@link recoverExpiredLeases} does), so a
   * different owner racing a fresh claim just after that transition would
   * otherwise be able to grab a job whose earlier lease has not actually
   * expired yet.
   */
  async claimJob(batchId: string, jobId: string, leaseOwner: string, leaseMs: number): Promise<SastScanJob | undefined> {
    return this.enqueue(batchId, async () => {
      const domain = await this.domain()
      const key = recordKey(batchId, jobId)
      const current = domain.table('scan_jobs').get(key)
      if (current === undefined) return undefined
      if (current.status !== 'queued') return undefined
      const now = this.now()
      if (current.leaseOwner !== undefined && current.leaseExpiresAt !== undefined && current.leaseExpiresAt > now && current.leaseOwner !== leaseOwner) {
        return undefined
      }
      const updated = snapshot<SastScanJob>({
        ...current,
        status: 'preparing',
        attempt: current.attempt + 1,
        leaseOwner,
        leaseExpiresAt: now + leaseMs,
        updatedAt: now,
      })
      await domain.table('scan_jobs').put(key, updated)
      await this.appendEvent(batchId, jobId, 'job-claimed', `owner=${leaseOwner} attempt=${updated.attempt}`)
      return updated
    })
  }

  /** Renew an already-claimed job's lease (extends `leaseExpiresAt`; does not change `status` or `attempt`). Throws if `leaseOwner` does not match the current holder — a stale worker must not renew a lease it already lost. */
  async renewLease(batchId: string, jobId: string, leaseOwner: string, leaseMs: number): Promise<SastScanJob> {
    return this.enqueue(batchId, async () => {
      const domain = await this.domain()
      const key = recordKey(batchId, jobId)
      const current = domain.table('scan_jobs').get(key)
      if (current === undefined) throw new Error(`sast: job ${jobId} does not exist in batch ${batchId}`)
      if (current.leaseOwner !== leaseOwner) {
        throw new Error(`sast: job ${jobId}'s lease is held by '${current.leaseOwner}', not '${leaseOwner}'`)
      }
      const updated = snapshot<SastScanJob>({ ...current, leaseExpiresAt: this.now() + leaseMs })
      await domain.table('scan_jobs').put(key, updated)
      return updated
    })
  }

  /**
   * Recover every job whose lease has expired while still `preparing`/
   * `running` (a crashed or killed worker never reported a terminal
   * status) back to `queued` so the scheduler can re-claim it — called on
   * scheduler startup (A21: "中途重启后回收 lease 并继续"). Returns the
   * recovered jobs.
   */
  async recoverExpiredLeases(batchId: string): Promise<SastScanJob[]> {
    const domain = await this.domain()
    const now = this.now()
    const expired = [...domain.table('scan_jobs').entries()]
      .map(([, row]) => row)
      .filter(row => row.batchId === batchId
        && (row.status === 'preparing' || row.status === 'running')
        && row.leaseExpiresAt !== undefined && row.leaseExpiresAt <= now)
    const recovered: SastScanJob[] = []
    for (const job of expired) {
      recovered.push(await this.enqueue(batchId, async () => {
        const key = recordKey(batchId, job.id)
        const current = domain.table('scan_jobs').get(key)
        // Re-check under the queue: a claim or a status change may have
        // landed between the snapshot above and this job's turn.
        if (current === undefined || (current.status !== 'preparing' && current.status !== 'running')) return current ?? job
        if (current.leaseExpiresAt === undefined || current.leaseExpiresAt > this.now()) return current
        const updated = snapshot<SastScanJob>({ ...current, status: 'queued', leaseOwner: undefined, leaseExpiresAt: undefined, updatedAt: this.now() })
        await domain.table('scan_jobs').put(key, updated)
        await this.appendEvent(batchId, job.id, 'lease-recovered', `stale owner=${current.leaseOwner ?? 'unknown'}`)
        return updated
      }))
    }
    return recovered
  }

  /** Set a job's `reviewStatus` (Review Inbox membership) — never touches `status`, `errorClass`, or `fallback` (A24: a resolve decision must not rewrite the original failure). */
  async setReviewStatus(batchId: string, jobId: string, reviewStatus: SastJobReviewStatus, reason = ''): Promise<SastScanJob> {
    return this.enqueue(batchId, async () => {
      const domain = await this.domain()
      const key = recordKey(batchId, jobId)
      const current = domain.table('scan_jobs').get(key)
      if (current === undefined) throw new Error(`sast: job ${jobId} does not exist in batch ${batchId}`)
      const updated = snapshot<SastScanJob>({ ...current, reviewStatus, updatedAt: this.now() })
      await domain.table('scan_jobs').put(key, updated)
      await this.appendEvent(batchId, jobId, 'review-decision', reason === '' ? reviewStatus : `${reviewStatus}: ${reason}`)
      return updated
    })
  }

  /**
   * Put a `reviewStatus=pending` job back in the queue at the user's
   * explicit request (`sast_batch_resolve`'s `retry` action, A24) — the ONE
   * legal way to leave a terminal state, deliberately outside
   * `LEGAL_JOB_TRANSITIONS` (which the scheduler's own automatic state
   * machine uses and which has no outgoing edge from any terminal status).
   * Requires `reviewStatus === 'pending'`: retrying a job nobody flagged for
   * review, or one already resolved, is a caller bug, not a legal request.
   * Does not touch `errorClass`/`fallback` — the original failure record
   * is append-only and survives the retry, even if this attempt succeeds.
   */
  async requeueForRetry(batchId: string, jobId: string, reason = ''): Promise<SastScanJob> {
    return this.enqueue(batchId, async () => {
      const domain = await this.domain()
      const key = recordKey(batchId, jobId)
      const current = domain.table('scan_jobs').get(key)
      if (current === undefined) throw new Error(`sast: job ${jobId} does not exist in batch ${batchId}`)
      if (current.reviewStatus !== 'pending') {
        throw new Error(`sast: job ${jobId} is not awaiting review (reviewStatus=${current.reviewStatus}); only a pending job may be retried`)
      }
      const updated = snapshot<SastScanJob>({ ...current, status: 'queued', reviewStatus: 'retried', leaseOwner: undefined, leaseExpiresAt: undefined, updatedAt: this.now() })
      await domain.table('scan_jobs').put(key, updated)
      await this.appendEvent(batchId, jobId, 'review-decision', reason === '' ? 'retried' : `retried: ${reason}`)
      return updated
    })
  }

  /** Record a job's terminal outcome fields (`errorClass`/`fallback`/`reportArtifactId`) alongside its status transition, in one write. */
  async recordJobOutcome(
    batchId: string,
    jobId: string,
    to: SastJobStatus,
    fields: { readonly errorClass?: string; readonly fallback?: string; readonly reportArtifactId?: string },
    detail = '',
  ): Promise<SastScanJob> {
    return this.enqueue(batchId, async () => {
      const domain = await this.domain()
      const key = recordKey(batchId, jobId)
      const current = domain.table('scan_jobs').get(key)
      if (current === undefined) throw new Error(`sast: job ${jobId} does not exist in batch ${batchId}`)
      if (current.status === to) return current
      if (!LEGAL_JOB_TRANSITIONS[current.status].has(to)) {
        throw new Error(`sast: illegal job transition ${current.status} -> ${to} for job ${jobId}`)
      }
      const updated = snapshot<SastScanJob>({
        ...current,
        status: to,
        ...(fields.errorClass !== undefined ? { errorClass: fields.errorClass } : {}),
        ...(fields.fallback !== undefined ? { fallback: fields.fallback } : {}),
        ...(fields.reportArtifactId !== undefined ? { reportArtifactId: fields.reportArtifactId } : {}),
        updatedAt: this.now(),
      })
      await domain.table('scan_jobs').put(key, updated)
      await this.appendEvent(batchId, jobId, 'job-status', detail === '' ? `${current.status} -> ${to}` : `${current.status} -> ${to}: ${detail}`)
      return updated
    })
  }

  /** Read one report artifact row by its durable id (batch reports link to per-job artifacts written through the same table M4 already uses). */
  async getReportArtifact(id: string): Promise<SastReportArtifact | undefined> {
    return this.artifacts.get(id)
  }

  /**
   * Find the repo-level report a job's worker produced by calling
   * `sast_report`, keyed by the `jobId` `sast_start_scan`'s
   * `batchLineageOf` auto-tags every one of that worker's durable rows with
   * (never a `sessionId` lookup — a resumed worker's session id can differ
   * attempt to attempt, but its `jobId` never does). `undefined` when the
   * worker never called `sast_report` (e.g. it failed/timed out first).
   * Prefers `repo-markdown` over `repo-sarif` when a worker somehow wrote
   * both (the common case is exactly one call).
   */
  async findReportArtifactByJob(jobId: string): Promise<SastReportArtifact | undefined> {
    const domain = await this.domain()
    const candidates = [...domain.table('report_artifacts').entries()]
      .map(([, row]) => row)
      .filter(row => row.jobId === jobId && (row.kind === 'repo-markdown' || row.kind === 'repo-sarif'))
    return candidates.find(row => row.kind === 'repo-markdown') ?? candidates[0]
  }

  /** Persist one report artifact row (batch/JSON reports, pinned methodology content) through the shared allocator (see class doc's `artifacts` field). */
  async putReportArtifact(fields: Omit<SastReportArtifact, 'id' | 'createdAt'>): Promise<SastReportArtifact> {
    return this.artifacts.put(fields)
  }
}
