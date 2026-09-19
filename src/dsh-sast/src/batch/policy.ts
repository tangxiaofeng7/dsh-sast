/**
 * Pure batch-execution decision logic (M5): error classification, retry/
 * fallback/skip decisions, and `coverageImpact` text — none of it touches
 * the domain, a clock, or an agent. Kept separate from `scheduler.ts` (which
 * drives the actual claim/lease/dispatch loop) so the judgment calls are the
 * easiest part of the batch control plane to unit test.
 * @module @tangxiaofeng7/dsh-sast-host/src/batch/policy
 */

import { timeoutOf } from '@deepseek-ai/dsh-timeout'

/** How one job failure should be treated by the scheduler. */
export type SastErrorClass =
  | 'auth' // credential/permission failure — never retried with a guessed credential (ADR-07)
  | 'ref-not-found' // requested branch/ref does not exist — never silently substituted
  | 'timeout' // clone or job deadline elapsed
  | 'scope-exceeded' // repository exceeds the configured size/file-count guardrail
  | 'blocked' // audit completed with an unresolved blocked check (not a failure to run)
  | 'infra' // storage/isolation/global failure — the one class that is NOT safe to continue past (fail closed)
  | 'unknown' // uncategorized — treated conservatively as non-retryable

/** The terminal disposition {@link decideOutcome} recommends for one job attempt. */
export type SastJobDecision =
  | { readonly action: 'retry' } // put back in queue (attempt < policy.maxAttempts and errorClass is retryable)
  | { readonly action: 'degrade'; readonly coverageImpact: string } // finished with a gap — still an executed job
  | { readonly action: 'skip'; readonly coverageImpact: string } // could not execute at all
  | { readonly action: 'fail-closed' } // infra-class failure — the batch itself must stop, not just this job

/**
 * Classify a job failure from its raw error message (never the model's own
 * classification — the message is the same text ADR-07/ADR-13 already
 * scrub of credentials before it reaches this function). Falls back to
 * `'unknown'` rather than guessing a more specific (and more automatically
 * retryable) class from ambiguous text.
 */
export function classifyError(error: unknown): SastErrorClass {
  if (timeoutOf({ reason: error }, 'SAST_JOB_TIMEOUT') !== undefined) return 'timeout'
  if (timeoutOf({ reason: error }, 'SAST_CLONE_TIMEOUT') !== undefined) return 'timeout'
  const text = (error instanceof Error ? error.message : String(error)).toLowerCase()
  if (text.includes('authentication failed') || text.includes('check the configured token')) return 'auth'
  if (text.includes('not found in') && (text.includes('branch') || text.includes('ref'))) return 'ref-not-found'
  if (text.includes('audit scope limit')) return 'scope-exceeded'
  if (text.includes('storage') && (text.includes('corrupt') || text.includes('unavailable'))) return 'infra'
  if (text.includes('git is not available')) return 'infra'
  return 'unknown'
}

/** Error classes a bounded retry may plausibly resolve (a fresh clone attempt, not a credential guess or scope change). */
const RETRYABLE: ReadonlySet<SastErrorClass> = new Set(['timeout', 'unknown'])

/**
 * Decide what a repository worker's finished (or failed) attempt means for
 * queue progression. `attempt` is 1-based (this attempt's own number);
 * `maxAttempts` comes from the batch's immutable policy snapshot.
 * `autoNarrowScope` is the same policy flag — when true, a `scope-exceeded`
 * failure gets one retry with a narrowed scope (the worker's own job, not
 * this function's) before it is treated as unretryable; when false, it
 * skips immediately rather than silently narrowing scope.
 *
 * - `infra` is the one class that must NOT continue past — ADR (PRD §risk
 *   table, A25): a global storage/isolation failure means correctness
 *   itself is no longer guaranteed, so the caller must fail the whole batch
 *   closed rather than let the scheduler claim another repo.
 * - `blocked` never retries (a bounded audit already ran to completion; more
 *   attempts would not change an unresolved dependency) — always `degrade`.
 * - Every other class retries while `attempt < maxAttempts`; once attempts
 *   are exhausted, `auth`/`ref-not-found`/`scope-exceeded` become `skip`
 *   (the job never produced a usable partial audit) while `timeout`/
 *   `unknown` become `degrade` (a partial audit may still exist from before
 *   the failure — the caller decides which is true from what was actually
 *   recorded, this function only names the intended review-inbox category).
 */
export function decideOutcome(errorClass: SastErrorClass, attempt: number, maxAttempts: number, autoNarrowScope = true): SastJobDecision {
  if (errorClass === 'infra') return { action: 'fail-closed' }
  if (errorClass === 'blocked') {
    return { action: 'degrade', coverageImpact: 'unresolved blocked check after bounded recovery attempts' }
  }
  const retryable = RETRYABLE.has(errorClass) || (errorClass === 'scope-exceeded' && autoNarrowScope)
  if (retryable && attempt < maxAttempts) return { action: 'retry' }
  if (errorClass === 'auth') return { action: 'skip', coverageImpact: 'authentication failed; no credential was guessed or escalated (ADR-07)' }
  if (errorClass === 'ref-not-found') return { action: 'skip', coverageImpact: 'requested branch/ref does not exist; no other branch was substituted' }
  if (errorClass === 'scope-exceeded') return { action: 'skip', coverageImpact: 'repository exceeds the configured size/file-count guardrail; scope was not silently narrowed' }
  return { action: 'degrade', coverageImpact: `job did not complete after ${attempt} attempt(s): ${errorClass}` }
}
