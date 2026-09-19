/**
 * BatchView: the batch-owner-only overview tab (M6, docs/architecture.md §7). Shows
 * up to 100 job rows (ordinal, redacted repo/ref, status, attempt, fallback)
 * plus the batch header (objective/authorization/status/methodology
 * digests) — never a full per-repo audit graph (ADR-11's windowing
 * discipline extended to the batch overview). A pure projection-mode
 * surface, same shape as SastView: the live `sastBatch` state arrives
 * through `useProjection('sastBatch')`.
 */

import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { SastBatchProjection, SastBatchStatus, SastJobStatus } from '@tangxiaofeng7/dsh-sast-host/client'
import type { SastKey } from './locales.ts'
import css from './BatchView.module.css'

/** Statuses that mean "this job never produced a usable audit" — the caller must render coverage as unknown, never as 0 findings (A23: never mistake "not audited" for "audited and clean"). */
const UNAUDITED_STATUSES = new Set<SastJobStatus>(['queued', 'preparing', 'running', 'retry_wait', 'skipped', 'failed', 'timed_out', 'cancelled'])

const JOB_STATUS_LABELS: Record<SastJobStatus, SastKey> = {
  queued: 'batch.job.status.queued',
  preparing: 'batch.job.status.preparing',
  running: 'batch.job.status.running',
  retry_wait: 'batch.job.status.retry_wait',
  succeeded: 'batch.job.status.succeeded',
  degraded: 'batch.job.status.degraded',
  skipped: 'batch.job.status.skipped',
  failed: 'batch.job.status.failed',
  timed_out: 'batch.job.status.timed_out',
  cancelled: 'batch.job.status.cancelled',
}

const BATCH_STATUS_LABELS: Record<SastBatchStatus, SastKey> = {
  queued: 'batch.status.queued',
  running: 'batch.status.running',
  awaiting_review: 'batch.status.awaiting_review',
  completed: 'batch.status.completed',
  completed_with_issues: 'batch.status.completed_with_issues',
}

/** Full props of the batch overview tab. */
export interface BatchViewProps {
  readonly sastBatch: SastBatchProjection
  readonly t: PropsLocale<'sast'>['t']
}

export function BatchView({ sastBatch, t }: BatchViewProps) {
  const pendingCount = sastBatch.jobs.filter(job => job.reviewStatus === 'pending').length

  return (
    <div className={css.root} data-testid="sast-batch-view">
      <header className={css.header} data-testid="sast-batch-header">
        <p className={css.objective}>{t('batch.objective', { objective: sastBatch.objective })}</p>
        {sastBatch.authorization !== '' && (
          <p className={css.authorization}>{t('batch.authorization', { authorization: sastBatch.authorization })}</p>
        )}
        <p className={css.status}>
          {t('batch.status', { status: t(BATCH_STATUS_LABELS[sastBatch.status]) })}
          {' · '}
          {t('batch.total', { total: sastBatch.total })}
          {pendingCount > 0 && ` · ${t('batch.pendingReview', { count: pendingCount })}`}
        </p>
        {sastBatch.methodologies.length > 0 && (
          <ul className={css.methodologies} data-testid="sast-batch-methodologies">
            {sastBatch.methodologies.map(methodology => (
              <li key={methodology.name} className={css.methodology}>
                {methodology.name}
              </li>
            ))}
          </ul>
        )}
      </header>
      <ul className={css.jobs} data-testid="sast-batch-jobs">
        {sastBatch.jobs.map((job) => {
          const unaudited = UNAUDITED_STATUSES.has(job.status)
          return (
            <li key={job.ordinal} className={css.job} data-testid="sast-batch-job">
              <span className={css.ordinal}>{job.ordinal}</span>
              <span className={css.repoUrl}>{job.repoUrl}{job.branch !== undefined && job.branch !== '' ? `@${job.branch}` : ''}</span>
              <span className={css.jobStatus} data-status={job.status}>{t(JOB_STATUS_LABELS[job.status])}</span>
              <span className={css.attempt}>{t('batch.job.attempt', { attempt: job.attempt })}</span>
              {/* A23: an unaudited job never claims "0 findings" — coverage
                  for it is unknown, not measured-and-empty. This view has no
                  finding counts to show at all yet (JobSummaryResolver is
                  host-side only), so the discipline here is simply never
                  rendering a success-shaped badge for a job that never ran
                  to completion. */}
              {unaudited && job.fallback === undefined && (
                <span className={css.unaudited}>{t('batch.job.unaudited')}</span>
              )}
              {job.fallback !== undefined && job.fallback !== '' && (
                <span className={css.fallback} data-testid="sast-batch-job-fallback">{job.fallback}</span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
