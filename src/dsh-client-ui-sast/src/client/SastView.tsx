/**
 * SastView: the 白盒审计 conversation-view tab. A pure projection-mode
 * surface — the standing `sast` projection (scan plus the audit graph)
 * arrives through `useProjection('sast')`, so the tab owns no store and
 * needs no host RPC. The view renders one scan header card (repo, branch,
 * objective, authorization, node counts) over a sub-tab bar: 审计链路 (the
 * chain as an interactive graph), 漏洞 (findings with code evidence chains),
 * 代码资产 (list or graph), 任务与进度 (methodology check coverage), and
 * 报告 (copyable Markdown). A batch owner session additionally gets 批次总览
 * and 待确认 sub-tabs (M6) — gated on `sastBatch` being non-null, NOT on any
 * preset name, since a pure batch owner may never itself call
 * `sast_start_scan` (its jobs run under separate worker sessions) and so
 * would otherwise never see the empty-`sast` guard fall through. Absent
 * projection (capability or session not composed) or both projections null
 * renders the guiding empty note.
 */

import { useState } from 'react'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: pulls the `sast`/`sastBatch` SessionProjectionMap key merges.
import type {} from '@tangxiaofeng7/dsh-sast-host/client'
import { AssetsView } from './AssetsView.tsx'
import { BatchView } from './BatchView.tsx'
import { ExploreView } from './ExploreView.tsx'
import { FindingsView } from './FindingsView.tsx'
import { ReportView } from './ReportView.tsx'
import { ReviewInboxView } from './ReviewInboxView.tsx'
import { TasksView } from './TasksView.tsx'
import type { SastKey } from './locales.ts'
import css from './SastView.module.css'

/** The five single-repo sub-tabs of the view, always present. */
const SAST_TABS = ['explore', 'findings', 'assets', 'tasks', 'report'] as const
/** The two batch-owner-only sub-tabs (M6), shown only while `sastBatch` is non-null. */
const BATCH_TABS = ['batch', 'reviewInbox'] as const

/** One sub-tab key. */
type ViewTab = typeof SAST_TABS[number] | typeof BATCH_TABS[number]

/** Sub-tab label keys. */
const TAB_LABELS = {
  explore: 'view.tab.explore',
  findings: 'view.tab.findings',
  assets: 'view.tab.assets',
  tasks: 'view.tab.tasks',
  report: 'view.tab.report',
  batch: 'view.tab.batch',
  reviewInbox: 'view.tab.reviewInbox',
} as const satisfies Record<ViewTab, SastKey>

/** Full props of the view entry: session standard kit + the locale seat. */
export type SastViewProps = PropsRuntime<'conversation.view'> & PropsLocale<'sast'>

export function SastView({ useProjection, t }: SastViewProps) {
  const sast = useProjection('sast')
  const sastBatch = useProjection('sastBatch')
  const hasSast = sast !== undefined && sast !== null
  const hasBatch = sastBatch !== undefined && sastBatch !== null
  const tabs: readonly ViewTab[] = hasBatch ? [...SAST_TABS, ...BATCH_TABS] : SAST_TABS
  const [tab, setTab] = useState<ViewTab>(hasSast ? 'explore' : 'batch')
  if (!hasSast && !hasBatch) {
    return (
      <div className={css.empty} data-testid="sast-view">
        <span className={css.emptyText}>{t('view.empty')}</span>
      </div>
    )
  }
  const activeTab = tabs.includes(tab) ? tab : tabs[0]
  return (
    <section className={css.root} data-testid="sast-view">
      {hasSast && (
        <header className={css.card}>
          <div className={css.cardTitle}>
            <h2 className={css.repo}>{sast.scan === null ? '' : sast.scan.repoUrl}</h2>
            {sast.scan !== null && sast.scan.branch !== '' && (
              <span className={css.branch}>{t('header.branch', { branch: sast.scan.branch })}</span>
            )}
          </div>
          {sast.scan !== null && sast.scan.objective !== '' && (
            <p className={css.objective}>{t('header.objective', { objective: sast.scan.objective })}</p>
          )}
          <p className={css.counts}>
            {t('counts', {
              skills: sast.skills.length,
              intents: sast.counts.intents,
              facts: sast.counts.facts,
              findings: sast.counts.findings,
              assets: sast.counts.assets,
            })}
          </p>
          {sast.scan !== null && sast.scan.authorization !== '' && (
            <p className={css.authorization}>{t('header.authorization', { authorization: sast.scan.authorization })}</p>
          )}
        </header>
      )}
      <nav className={css.tabs} data-testid="sast-tabs">
        {tabs.map(tabKey => (
          <button
            key={tabKey}
            type="button"
            className={css.tab}
            aria-pressed={activeTab === tabKey}
            data-testid={`sast-tab-${tabKey}`}
            onClick={() => { setTab(tabKey) }}
          >
            {t(TAB_LABELS[tabKey])}
            {tabKey === 'findings' && hasSast ? ` (${sast.counts.findings})` : ''}
            {tabKey === 'assets' && hasSast ? ` (${sast.counts.assets})` : ''}
          </button>
        ))}
      </nav>
      <div className={css.content}>
        {activeTab === 'explore' && hasSast && <ExploreView sast={sast} t={t} />}
        {activeTab === 'findings' && hasSast && <FindingsView sast={sast} t={t} />}
        {activeTab === 'assets' && hasSast && <AssetsView sast={sast} t={t} />}
        {activeTab === 'tasks' && hasSast && <TasksView sast={sast} t={t} />}
        {activeTab === 'report' && hasSast && <ReportView sast={sast} t={t} />}
        {activeTab === 'batch' && hasBatch && <BatchView sastBatch={sastBatch} t={t} />}
        {activeTab === 'reviewInbox' && hasBatch && <ReviewInboxView sastBatch={sastBatch} t={t} />}
      </div>
    </section>
  )
}

