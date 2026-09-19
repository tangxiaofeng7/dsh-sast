/**
 * TasksView: the 任务与进度 sub-tab of the 白盒审计 view (tools-protocol.md
 * §5.4). Shows each registered audit-methodology Skill grouped by trust
 * bucket (builtin/workspace/user), every check's derived state
 * (todo/planned/running/done/blocked — no intent yet vs. pending vs. the
 * intent's own status, mirroring coverage.ts's derivation), and the two
 * coverage dimensions this view can derive client-side from the standing
 * projection alone: check inclusion (non-todo / total) and completion
 * (done / total). File coverage requires the scan's full fileCount
 * (durable-layer only, not carried by the projection), so this tab
 * surfaces check coverage and the intent-status distribution;
 * `sast_coverage` remains the source of file-coverage truth.
 *
 * The fully-empty note only fires when there is truly nothing yet (no
 * skills AND no intents) — an ad-hoc audit that never calls
 * `sast_register_skill` still has real intent-status progress worth
 * showing, since that distribution does not depend on any skill being
 * registered. Verified against a real end-to-end audit session: a run
 * using only ad-hoc intents (no methodology) rendered a fully blank tab
 * before this fix, even though the session's own 审计链路/漏洞/报告 tabs all
 * showed real progress from the same intents.
 */

import type { SastIntentStatus, SastProjection, SastProjectionSkill } from '@tangxiaofeng7/dsh-sast-host/client'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { SastKey } from './locales.ts'
import css from './TasksView.module.css'

/** Derived progress state of one methodology check (never stored, always recomputed — mirrors coverage.ts). */
type CheckState = 'todo' | 'planned' | 'running' | 'done' | 'blocked'

const CHECK_STATE_LABELS: Record<CheckState, SastKey> = {
  todo: 'checkState.todo',
  planned: 'checkState.planned',
  running: 'checkState.running',
  done: 'checkState.done',
  blocked: 'checkState.blocked',
}

const INTENT_STATUS_LABELS: Record<SastIntentStatus, SastKey> = {
  pending: 'intentStatus.pending',
  running: 'intentStatus.running',
  done: 'intentStatus.done',
  blocked: 'intentStatus.blocked',
}

/** State of one check: no intent → todo; pending → planned; else the intent's own status (mirrors coverage.ts's deriveCheckState). */
function checkStateOf(projection: SastProjection, skillId: string, checkId: string): CheckState {
  const found = projection.nodes.find(node => node.kind === 'intent' && node.skillId === skillId && node.checkId === checkId)
  if (found === undefined || found.kind !== 'intent') return 'todo'
  if (found.status === 'pending') return 'planned'
  return found.status
}

/** One skill's check-count rollup, mirroring coverage.ts's CoverageSkillEntry shape at the fields this tab needs. */
function rollupOf(projection: SastProjection, skill: SastProjectionSkill): { total: number; covered: number; completed: number } {
  const states = skill.checks.map(check => checkStateOf(projection, skill.id, check.id))
  return {
    total: states.length,
    covered: states.filter(state => state !== 'todo').length,
    completed: states.filter(state => state === 'done').length,
  }
}

/** Full props of the tasks sub-tab. */
export interface TasksViewProps {
  readonly sast: SastProjection
  readonly t: PropsLocale<'sast'>['t']
}

export function TasksView({ sast, t }: TasksViewProps) {
  const intentCounts: Record<SastIntentStatus, number> = { pending: 0, running: 0, done: 0, blocked: 0 }
  for (const node of sast.nodes) {
    if (node.kind === 'intent') intentCounts[node.status] += 1
  }
  const hasIntents = intentCounts.pending + intentCounts.running + intentCounts.done + intentCounts.blocked > 0

  // Fully empty only when there is truly nothing to show: no registered
  // methodology AND no intents at all (e.g. before the first sast_start_scan
  // creates any). An ad-hoc audit that issues intents without ever calling
  // sast_register_skill still has real progress worth surfacing — the
  // intent-status distribution below does not depend on any skill.
  if (sast.skills.length === 0 && !hasIntents) {
    return <p className={css.empty} data-testid="sast-tasks-empty">{t('tasks.empty')}</p>
  }
  const activeSkills = sast.skills.filter(skill => skill.enabled)
  const totals = activeSkills.reduce((sum, skill) => {
    const rollup = rollupOf(sast, skill)
    return { total: sum.total + rollup.total, covered: sum.covered + rollup.covered, completed: sum.completed + rollup.completed }
  }, { total: 0, covered: 0, completed: 0 })
  return (
    <div className={css.root} data-testid="sast-tasks">
      <section className={css.summary} data-testid="sast-tasks-summary">
        {sast.skills.length > 0 && (
          <>
            <div className={css.metric}>
              <span className={css.metricLabel}>{t('tasks.coverage.checksIncluded')}</span>
              <span className={css.metricValue}>{totals.covered} / {totals.total}</span>
            </div>
            <div className={css.metric}>
              <span className={css.metricLabel}>{t('tasks.coverage.checksCompleted')}</span>
              <span className={css.metricValue}>{totals.completed} / {totals.total}</span>
            </div>
          </>
        )}
        <div className={css.metric} data-testid="sast-tasks-intent-status">
          <span className={css.metricLabel}>{t('tasks.intents.byStatus')}</span>
          <span className={css.metricValue}>
            {(['pending', 'running', 'done', 'blocked'] as const).map(status => `${t(INTENT_STATUS_LABELS[status])} ${intentCounts[status]}`).join(' · ')}
          </span>
        </div>
      </section>
      {sast.skills.length === 0 && (
        <p className={css.noMethodology} data-testid="sast-tasks-no-methodology">{t('tasks.noMethodology')}</p>
      )}
      {sast.skills.length > 0 && (
        <ul className={css.skills} data-testid="sast-tasks-skills">
          {sast.skills.map((skill) => {
            const rollup = rollupOf(sast, skill)
            return (
              <li key={skill.id} className={css.skill} data-testid="sast-tasks-skill">
                <header className={css.skillHeader}>
                  <span className={css.sourceBadge} data-source={skill.sourceGroup}>{skill.sourceGroup}</span>
                  <h4 className={css.skillTitle}>{skill.title}</h4>
                  <span className={css.skillStatus} data-enabled={skill.enabled}>
                    {t(skill.enabled ? 'tasks.skill.enabled' : 'tasks.skill.disabled')}
                  </span>
                  <span className={css.skillProgress}>{rollup.completed}/{rollup.total}</span>
                </header>
                <ul className={css.checks}>
                  {skill.checks.map((check) => {
                    const state = checkStateOf(sast, skill.id, check.id)
                    return (
                      <li key={check.id} className={css.check} data-testid="sast-tasks-check">
                        <span className={css.checkState} data-state={state}>{t(CHECK_STATE_LABELS[state])}</span>
                        <span className={css.checkId}>{check.id}</span>
                        <span className={css.checkTitle}>{check.title}</span>
                      </li>
                    )
                  })}
                </ul>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
