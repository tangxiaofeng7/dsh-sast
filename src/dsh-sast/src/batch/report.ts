/**
 * Cross-repo batch report builder (M5/M6, `sast_batch_report`): Markdown or
 * JSON summarizing every job in a batch — exactly once each (A20), with
 * aggregate counts computed as the sum of each job's own summary rather
 * than recomputed independently (so the total can never silently drift
 * from what each job actually reported). A pure function over
 * `SastBatch`/`SastScanJob[]` plus an explicit `JobSummary` per job — the
 * per-job finding/coverage counts live in that job's own worker session
 * graph (a separate `SastStore`), so this module takes them as an input
 * rather than reaching into storage itself, keeping it independently
 * testable without a real worker or domain.
 * @module @tangxiaofeng7/dsh-sast-host/src/batch/report
 */

import type { SastBatch, SastScanJob, SastSeverity } from '../spec.ts'

/** One job's finding/coverage summary, as the batch report needs it — computed from that job's own worker session (SastStore.coverage() + a severity tally over its findings), not from anything stored on `SastScanJob` itself. */
export interface JobSummary {
  /** Count of active (non-excluded) findings by severity; omitted severities count as zero. */
  readonly findingsBySeverity: Readonly<Partial<Record<SastSeverity, number>>>
  /** File coverage ratio (0..1), or `undefined` when the job never reached a scan (e.g. skipped before clone). */
  readonly fileCoverageRatio?: number
  /** Check completion ratio (0..1), same caveat. */
  readonly checkCompletionRatio?: number
}

/** Redacted per-job row for the report — never the full per-repo graph (ADR-11 windowing discipline extended to the batch report). */
export interface BatchReportJobRow {
  readonly job: SastScanJob
  readonly summary: JobSummary
}

/** `unknown` is the report's explicit non-answer for a job that never got far enough to have a real ratio — distinct from `0` (measured and empty) so it is never mistaken for "audited, found nothing". */
type RatioOrUnknown = number | 'unknown'

function ratioOrUnknown(ratio: number | undefined): RatioOrUnknown {
  return ratio ?? 'unknown'
}

const SEVERITY_ORDER: readonly SastSeverity[] = ['critical', 'high', 'medium', 'low', 'info']

/** Sum one severity's count across every row (0 for a row that never reported that severity). */
function totalOf(rows: readonly BatchReportJobRow[], severity: SastSeverity): number {
  return rows.reduce((sum, row) => sum + (row.summary.findingsBySeverity[severity] ?? 0), 0)
}

/** Build the cross-repo Markdown report. Every row in `rows` must be present exactly once, covering every job of the batch — the caller (`sast_batch_report`'s tool boundary) is responsible for passing the full, deduplicated set (A20); this function does not itself deduplicate or fill in missing ordinals, so a caller bug there is visible as a gap in the output rather than silently patched over. */
export function buildBatchMarkdownReport(batch: SastBatch, rows: readonly BatchReportJobRow[]): string {
  const sorted = [...rows].sort((a, b) => a.job.ordinal - b.job.ordinal)
  const totalsLine = SEVERITY_ORDER.map(severity => `${severity} ${totalOf(sorted, severity)}`).join(' / ')
  const reviewPending = sorted.filter(row => row.job.reviewStatus === 'pending')

  const jobLines = sorted.map((row) => {
    const { job, summary } = row
    const severityCounts = SEVERITY_ORDER
      .map(severity => [severity, summary.findingsBySeverity[severity] ?? 0] as const)
      .filter(([, count]) => count > 0)
      .map(([severity, count]) => `${severity} ${count}`)
      .join(', ')
    const findingsLabel = severityCounts === '' ? '0 findings' : severityCounts
    const fileRatio = ratioOrUnknown(summary.fileCoverageRatio)
    const checkRatio = ratioOrUnknown(summary.checkCompletionRatio)
    const fallbackNote = job.fallback === undefined || job.fallback === '' ? '' : ` — ${job.fallback}`
    return [
      `### ${job.ordinal}. ${job.repoSpec.repoUrl}`,
      `- 状态: ${job.status}（尝试 ${job.attempt} 次）${fallbackNote}`,
      // A23: an unknown ratio (skipped/failed before measurement) reads as
      // literally "unknown" — NEVER as 0%, which would misrepresent "not
      // audited" as "audited and clean".
      `- 文件覆盖率: ${fileRatio === 'unknown' ? 'unknown（未审）' : `${Math.round(fileRatio * 100)}%`}`,
      `- 检查项完成度: ${checkRatio === 'unknown' ? 'unknown（未审）' : `${Math.round(checkRatio * 100)}%`}`,
      `- 漏洞: ${findingsLabel}`,
    ].join('\n')
  })

  const reviewLines = reviewPending.length === 0
    ? ['（无）']
    : reviewPending.map(row => `- ordinal ${row.job.ordinal}（${row.job.status}）: ${row.job.fallback ?? '（未说明）'}`)

  return [
    '# 批次审计报告',
    '',
    `- 批次目标: ${batch.objective}`,
    `- 授权: ${batch.authorization === '' ? '未声明' : batch.authorization}`,
    `- 仓库总数: ${batch.total}`,
    `- 状态: ${batch.status}`,
    '',
    '## 汇总',
    `- 漏洞合计（按严重度）: ${totalsLine}`,
    `- 待确认项: ${reviewPending.length}`,
    '',
    '## 各仓明细',
    ...jobLines,
    '',
    '## 待确认（Review Inbox）',
    ...reviewLines,
    '',
  ].join('\n')
}

/** JSON shape of {@link buildBatchJsonReport} — a machine-readable mirror of the Markdown report's same data, not a superset or subset. */
export interface BatchJsonReport {
  readonly batchId: string
  readonly objective: string
  readonly authorization: string
  readonly total: number
  readonly status: SastBatch['status']
  readonly totals: Readonly<Record<SastSeverity, number>>
  readonly jobs: ReadonlyArray<{
    readonly ordinal: number
    readonly repoUrl: string
    readonly status: SastScanJob['status']
    readonly attempt: number
    readonly reviewStatus: SastScanJob['reviewStatus']
    readonly fallback?: string
    readonly fileCoverageRatio: RatioOrUnknown
    readonly checkCompletionRatio: RatioOrUnknown
    readonly findingsBySeverity: Readonly<Partial<Record<SastSeverity, number>>>
    readonly reportArtifactId?: string
  }>
}

/** Build the cross-repo JSON report — same coverage/A20/A23 discipline as {@link buildBatchMarkdownReport}, machine-readable for `format: json`. */
export function buildBatchJsonReport(batch: SastBatch, rows: readonly BatchReportJobRow[]): BatchJsonReport {
  const sorted = [...rows].sort((a, b) => a.job.ordinal - b.job.ordinal)
  const totals = Object.fromEntries(SEVERITY_ORDER.map(severity => [severity, totalOf(sorted, severity)])) as Record<SastSeverity, number>
  return {
    batchId: batch.id,
    objective: batch.objective,
    authorization: batch.authorization,
    total: batch.total,
    status: batch.status,
    totals,
    jobs: sorted.map(({ job, summary }) => ({
      ordinal: job.ordinal,
      repoUrl: job.repoSpec.repoUrl,
      status: job.status,
      attempt: job.attempt,
      reviewStatus: job.reviewStatus,
      ...(job.fallback !== undefined ? { fallback: job.fallback } : {}),
      fileCoverageRatio: ratioOrUnknown(summary.fileCoverageRatio),
      checkCompletionRatio: ratioOrUnknown(summary.checkCompletionRatio),
      findingsBySeverity: summary.findingsBySeverity,
      ...(job.reportArtifactId !== undefined ? { reportArtifactId: job.reportArtifactId } : {}),
    })),
  }
}
