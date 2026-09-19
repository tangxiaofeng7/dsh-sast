/**
 * ReviewInboxView: the batch-owner-only Review Inbox tab (M6). Lists every
 * job whose `reviewStatus` is `'pending'` — fallback text (auto-retry
 * exhausted / scope narrowed / skipped / unresolved blocked check) plus a
 * read-only presentation of the three resolve actions (`accept-gap` /
 * `retry` / `confirm-skip`). ADR-08: the Web client stays a read-only
 * projection consumer — actually resolving a decision is done through
 * `sast_batch_resolve` in the conversation, not a button here.
 */

import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { SastBatchProjection } from '@tangxiaofeng7/dsh-sast-host/client'
import css from './ReviewInboxView.module.css'

/** Full props of the Review Inbox tab. */
export interface ReviewInboxViewProps {
  readonly sastBatch: SastBatchProjection
  readonly t: PropsLocale<'sast'>['t']
}

export function ReviewInboxView({ sastBatch, t }: ReviewInboxViewProps) {
  const pending = sastBatch.jobs.filter(job => job.reviewStatus === 'pending')
  if (pending.length === 0) {
    return <p className={css.empty} data-testid="sast-review-inbox-empty">{t('reviewInbox.empty')}</p>
  }
  return (
    <div className={css.root} data-testid="sast-review-inbox">
      <p className={css.hint}>{t('reviewInbox.hint')}</p>
      <ul className={css.items} data-testid="sast-review-inbox-items">
        {pending.map((job) => (
          <li key={job.ordinal} className={css.item} data-testid="sast-review-inbox-item">
            <header className={css.itemHeader}>
              <span className={css.ordinal}>{job.ordinal}</span>
              <span className={css.repoUrl}>{job.repoUrl}</span>
              <span className={css.jobStatus} data-status={job.status}>{job.status}</span>
            </header>
            <p className={css.fallback} data-testid="sast-review-inbox-fallback">
              {job.fallback !== undefined && job.fallback !== '' ? job.fallback : t('reviewInbox.noDetail')}
            </p>
            <p className={css.actionsHint}>{t('reviewInbox.actionsHint')}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
