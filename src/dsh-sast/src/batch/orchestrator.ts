/**
 * The real (spike-D-verified) glue between `DurableBatchScheduler` and the
 * single-repo `SastStore`/tools surface: builds each worker's delegation
 * prompt from its job's repo spec + the batch's pinned methodologies,
 * resolves what a finished worker attempt actually accomplished by reading
 * that worker's OWN durable state (never trusting a self-reported outcome),
 * and answers `sast_batch_state`/`sast_batch_report`'s per-job summary
 * query the same way.
 *
 * Deliberately separate from `scheduler.ts`/`tools.ts` (which stay
 * injectable-interface-only and fully unit-testable against fakes) — this
 * module is the one place that actually depends on `SastStore` and is
 * therefore only exercised by `batch-plugin.ts`'s own integration tests.
 * @module @tangxiaofeng7/dsh-sast-host/src/batch/orchestrator
 */

import type { Domain } from '@deepseek-ai/dsh-storage-domain'
import { classifyError } from './policy.ts'
import type { JobOutcome, JobOutcomeResolver, PromptBuilder } from './scheduler.ts'
import type { BatchStore } from './store.ts'
import type { JobSummary } from './report.ts'
import type { JobSummaryResolver } from './tools.ts'
import { SastStore } from '../store.ts'
import type { sastDomainSpec, SastScanJob } from '../spec.ts'

/** Batch-wide context a job's delegation prompt needs beyond its own repo spec (constant across every job of one batch). */
export interface BatchPromptContext {
  readonly objective: string
  readonly authorization: string
  readonly methodologyNames: readonly string[]
}

/**
 * Builds the delegation prompt for one job's worker: the repo to scan, the
 * batch-wide objective/authorization, and the pinned methodology names (if
 * any) — the worker calls `sast_start_scan` and `sast_register_skill`
 * itself, exactly like a standalone single-repo worker, so this prompt
 * names WHAT to do, never HOW (no clone/skill-lookup instructions — those
 * are the worker's own protocol, unchanged for batch execution).
 */
export function batchPromptBuilder(context: BatchPromptContext): PromptBuilder {
  return {
    build: (job: SastScanJob): string => {
      const repo = job.repoSpec
      const lines = [
        `你是本批次第 ${job.ordinal} 个仓库的 repository worker，只对这一个仓库负责。`,
        `仓库：${repo.repoUrl}${repo.provider !== 'local' ? ` (provider: ${repo.provider})` : ''}${repo.branch !== undefined ? ` branch: ${repo.branch}` : ''}${repo.ref !== undefined ? ` ref: ${repo.ref}` : ''}`,
        `目标：${repo.objective ?? context.objective}`,
        `授权：${context.authorization}`,
      ]
      if (context.methodologyNames.length > 0) {
        lines.push(`本批次固定的审计方法论（全部按名调用 sast_register_skill 登记，不要臆造未列出的方法论）：${context.methodologyNames.join('、')}`)
      }
      if (repo.scope.length > 0) {
        lines.push(`审计范围限定：${repo.scope.join('、')}`)
      }
      lines.push('先调用 sast_start_scan 完成克隆与元数据，再照常规单仓协议推进，最后调用 sast_report 固化报告。')
      lines.push('这是批次执行：不要调用任何 sast_batch_* 工具，也不要就单仓问题询问用户——遇到阻塞就记录并在 sast_report 中如实标注。')
      return lines.join('\n')
    },
  }
}

/**
 * Resolves a finished worker attempt's outcome by reading that worker's OWN
 * durable `SastStore` state — never a self-reported claim. Precedence:
 * 1. A `report_artifacts` row for this job (the worker called `sast_report`)
 *    → `succeeded`.
 * 2. No report, but the worker's coverage shows at least one `blocked`
 *    check → `degraded` (an audit ran, just didn't finish everything).
 * 3. No report and no scan at all (the worker never even started, or
 *    `sast_start_scan` itself threw — auth/timeout/scope failures surface
 *    this way) → `failed`, classified from... there is no raw error text
 *    to classify from here (the worker's own turn already absorbed it), so
 *    this resolver reports a generic transient failure and lets
 *    `policy.ts`'s `classifyError` fall through to `'unknown'` (bounded
 *    retry, matching the conservative default for an unclassifiable
 *    failure).
 */
export function createStoreBackedOutcomeResolver(
  domain: () => Promise<Domain<typeof sastDomainSpec>>,
  batchStore: BatchStore,
): JobOutcomeResolver {
  return {
    resolve: async (job: SastScanJob, worker): Promise<JobOutcome> => {
      const workerStore = new SastStore(undefined, () => Date.now(), domain)
      const artifact = await batchStore.findReportArtifactByJob(job.id)
      if (artifact !== undefined) {
        return { kind: 'succeeded' }
      }
      const scan = await workerStore.getScan(worker.sessionId)
      if (scan === undefined) {
        // The worker never even reached sast_start_scan — most likely its
        // own turn errored before calling any sast_* tool (a clone
        // auth/timeout/scope failure the model surfaced as plain text, or
        // an infra-level failure). No raw error text survives to this
        // resolver, so classifyError(undefined) reports 'unknown' — the
        // conservative, bounded-retry default for an unclassifiable
        // failure — rather than guessing a more specific (and more
        // aggressively retried) class.
        return { kind: 'failed', error: new Error('sast: worker attempt ended without ever starting a scan') }
      }
      const coverage = await workerStore.coverage(worker.sessionId)
      if (coverage.checks.blocked > 0) {
        return { kind: 'degraded', coverageImpact: `${coverage.checks.blocked} check(s) blocked after the worker's own bounded recovery attempts` }
      }
      // A scan exists, no report was ever written, and nothing is blocked —
      // the worker's turn ended (idled) without calling sast_report. Treat
      // as a transient failure so policy.ts's retry/degrade ladder applies,
      // exactly as it would for any other unclassified failure.
      return { kind: 'failed', error: new Error('sast: worker attempt idled without calling sast_report') }
    },
  }
}

/** Force `classifyError` module import to stay used even when this file's own resolver never calls it directly outside the comment above — kept as a documented seam for a future refinement that threads the worker's actual turn-error text through. */
void classifyError

/**
 * Resolves `sast_batch_state`/`sast_batch_report`'s per-job summary by
 * reading that job's worker session's own coverage/findings — the same
 * `SastStore` the outcome resolver reads, over the same shared domain.
 */
export function createStoreBackedSummaryResolver(
  domain: () => Promise<Domain<typeof sastDomainSpec>>,
): JobSummaryResolver {
  const store = new SastStore(undefined, () => Date.now(), domain)
  return {
    resolve: async (_jobId: string, workerSessionId: string | undefined): Promise<JobSummary> => {
      if (workerSessionId === undefined) return { findingsBySeverity: {} }
      const scan = await store.getScan(workerSessionId)
      if (scan === undefined) {
        return { findingsBySeverity: {} }
      }
      const data = await store.sessionData(workerSessionId)
      const coverage = await store.coverage(workerSessionId)
      const findingsBySeverity: Partial<Record<string, number>> = {}
      for (const finding of data.findings) {
        if (finding.status === 'false-positive' || finding.status === 'wont-fix') continue
        findingsBySeverity[finding.severity] = (findingsBySeverity[finding.severity] ?? 0) + 1
      }
      return {
        findingsBySeverity,
        fileCoverageRatio: coverage.files.ratio,
        checkCompletionRatio: coverage.checks.completionRatio,
      }
    },
  }
}
