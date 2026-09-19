/**
 * The standing `sastBatch` session-projection unit: folds the batch owner
 * session's logged `sast_batch_*` tool calls into the batch overview and
 * Review Inbox state. Pure mathematics, replay-safe, no storage-domain
 * reads — same discipline as `projection.ts`'s `sast` unit.
 *
 * Foldability limit (documented, not a bug to "fix" here): a fold sees only
 * `tool/call` events — the model's own arguments — never a tool's return
 * value or anything a host-side driver (the `DurableBatchScheduler`) does
 * autonomously between calls. `sast_start_batch`'s call arguments are enough
 * to seed the initial job list (repositories + total), and
 * `sast_batch_resolve`'s decisions are foldable the same way. Live job
 * STATUS transitions the scheduler drives with no corresponding model tool
 * call are NOT visible to this fold — those need the same synthetic-event
 * bridge `tools.ts`'s `appendSubmissionProjection` already uses for
 * `sast_submit` (the scheduler, once wired, appends a synthetic
 * `sast_batch_job_status` tool/call after each transition it drives). Until
 * that wiring lands, this projection's job statuses reflect only what the
 * owner session itself has directly caused (creation and resolve
 * decisions), not autonomous scheduler progress.
 *
 * v1 assumes one active batch per owner session, so — mirroring
 * `sast_start_scan`'s fixed `scan-1` id — every batch this fold sees is
 * represented under the fixed projection id `batch-1`; the real durable
 * `batchId` `BatchStore` uses is a host-side concern this projection never
 * needs to reproduce.
 * @module @tangxiaofeng7/dsh-sast-host/src/batch/projection
 */

import { z } from 'zod'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import type {
  SastBatchProjection,
  SastBatchProjectionEvent,
  SastBatchProjectionJob,
  SastBatchProjectionMethodology,
} from '../types.ts'

/** Batch job-summary rows kept, ADR-11 (a batch caps at 100 repositories, so this is also the hard ceiling — never a lossy window against the batch's own size). */
export const BATCH_JOB_CAP = 100
/** Most-recent batch events retained. */
export const BATCH_EVENT_CAP = 100

/** The 4 batch-control tool names this fold cares about — NOT a shared prefix: `sast_start_batch` does not start with `sast_batch_`. */
const SAST_BATCH_TOOL_NAMES = new Set(['sast_start_batch', 'sast_batch_state', 'sast_batch_report', 'sast_batch_resolve'])

/** Wire payload schema of the `sastBatch` projection (standing state or pre-init null). */
export const sastBatchProjectionSchema: z.ZodType<SastBatchProjection | null> = z.union([
  z.object({
    id: z.string(),
    objective: z.string(),
    authorization: z.string(),
    status: z.enum(['queued', 'running', 'awaiting_review', 'completed', 'completed_with_issues']),
    total: z.number(),
    methodologies: z.array(z.object({
      name: z.string(),
      manifestDigest: z.string(),
      contentDigest: z.string(),
    })),
    jobs: z.array(z.object({
      ordinal: z.number(),
      repoUrl: z.string(),
      branch: z.string().optional(),
      status: z.enum(['queued', 'preparing', 'running', 'retry_wait', 'succeeded', 'degraded', 'skipped', 'failed', 'timed_out', 'cancelled']),
      reviewStatus: z.enum(['none', 'pending', 'accepted', 'retried', 'confirmed-skip']),
      attempt: z.number(),
      fallback: z.string().optional(),
      errorClass: z.string().optional(),
    })),
    recentEvents: z.array(z.object({
      seq: z.number(),
      jobId: z.string().optional(),
      kind: z.string(),
      detail: z.string(),
    })),
  }),
  z.null(),
])

function str(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function argsOf(event: SessionEvent): Record<string, unknown> | undefined {
  if (event.type !== 'tool/call' || !SAST_BATCH_TOOL_NAMES.has(event.data.name)) return undefined
  try {
    const parsed = JSON.parse(event.data.arguments)
    return parsed !== null && typeof parsed === 'object' ? parsed as Record<string, unknown> : undefined
  } catch {
    return undefined
  }
}

/** Append one event, capped, with a locally-assigned monotonic seq (the fold's own counter — the durable log's real `seq` is not visible to a fold, mirroring every other synthetic id this package's projections assign). */
function withEvent(state: SastBatchProjection, jobId: string | undefined, kind: string, detail: string): SastBatchProjection {
  const seq = (state.recentEvents.at(-1)?.seq ?? 0) + 1
  const event: SastBatchProjectionEvent = { seq, ...(jobId !== undefined ? { jobId } : {}), kind, detail }
  return { ...state, recentEvents: [...state.recentEvents, event].slice(-BATCH_EVENT_CAP) }
}

/** Fold one `sast_batch_*` tool/call event into the standing `sastBatch` state (or leave it untouched — a malformed/foreign event never partially applies). */
export function applySastBatchEvent(state: SastBatchProjection | null, event: SessionEvent): SastBatchProjection | null {
  if (event.type !== 'tool/call' || !SAST_BATCH_TOOL_NAMES.has(event.data.name)) return state
  const args = argsOf(event)
  if (args === undefined) return state

  switch (event.data.name) {
    case 'sast_start_batch': {
      const repositories = Array.isArray(args.repositories) ? args.repositories : []
      if (repositories.length === 0 || repositories.length > BATCH_JOB_CAP) return state
      const objective = str(args.objective)
      const authorization = str(args.authorization)
      const methodologyNames = Array.isArray(args.methodologies) ? args.methodologies.filter((n): n is string => typeof n === 'string') : []
      const jobs: SastBatchProjectionJob[] = repositories.slice(0, BATCH_JOB_CAP).map((repo, index) => {
        const record = repo !== null && typeof repo === 'object' ? repo as Record<string, unknown> : {}
        const branch = str(record.branch)
        return {
          ordinal: index + 1,
          repoUrl: str(record.repoUrl),
          ...(branch === '' ? {} : { branch }),
          status: 'queued',
          reviewStatus: 'none',
          attempt: 0,
        }
      })
      const methodologies: SastBatchProjectionMethodology[] = methodologyNames.map(name => ({ name, manifestDigest: '', contentDigest: '' }))
      const initial: SastBatchProjection = {
        id: 'batch-1',
        objective,
        authorization,
        status: 'queued',
        total: jobs.length,
        methodologies,
        jobs,
        recentEvents: [],
      }
      return withEvent(initial, undefined, 'batch-created', `${jobs.length} job(s)`)
    }
    case 'sast_batch_resolve': {
      if (state === null) return state
      const decisions = Array.isArray(args.decisions) ? args.decisions : []
      let next = state
      for (const raw of decisions) {
        if (raw === null || typeof raw !== 'object') continue
        const decision = raw as Record<string, unknown>
        const jobId = str(decision.jobId)
        const action = str(decision.action)
        if (jobId === '' || action === '') continue
        const ordinal = ordinalOfJobId(jobId)
        if (ordinal === undefined) continue
        const jobIndex = next.jobs.findIndex(job => job.ordinal === ordinal)
        if (jobIndex === -1) continue
        const job = next.jobs[jobIndex]
        if (job.reviewStatus !== 'pending') continue
        const updatedJob: SastBatchProjectionJob = action === 'retry'
          ? { ...job, status: 'queued', reviewStatus: 'retried' }
          : { ...job, reviewStatus: action === 'accept-gap' ? 'accepted' : 'confirmed-skip' }
        const jobs = [...next.jobs]
        jobs[jobIndex] = updatedJob
        next = withEvent({ ...next, jobs }, jobId, 'review-decision', action)
      }
      return next
    }
    default:
      return state
  }
}

/** `job-<n>` -> its ordinal `n`, or `undefined` for anything else (defensive — a fold never guesses at a malformed id). */
function ordinalOfJobId(jobId: string): number | undefined {
  const match = /^job-(\d+)$/.exec(jobId)
  if (match === null) return undefined
  return Number(match[1])
}

/** View function: the fold state IS the model-visible payload (no derived transform needed, unlike `sast`'s richer view). */
export function viewSastBatchState(state: SastBatchProjection | null): SastBatchProjection | null {
  return state
}
