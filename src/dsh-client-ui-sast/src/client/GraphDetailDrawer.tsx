import { useEffect } from 'react'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { SastKey } from './locales.ts'
import css from './GraphDetailDrawer.module.css'

export interface GraphDetailField {
  readonly label: string
  readonly value: string
}

export interface GraphDetailDrawerProps {
  readonly title: string
  readonly fields: readonly GraphDetailField[]
  readonly onClose: () => void
  readonly t: PropsLocale<'sast'>['t']
}

/** A graph-scoped right drawer that keeps complete node data available. */
export function GraphDetailDrawer({ title, fields, onClose, t }: GraphDetailDrawerProps) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => { window.removeEventListener('keydown', closeOnEscape) }
  }, [onClose])

  const closeLabel = t('detail.close' satisfies SastKey)

  return (
    <div className={css.layer} data-testid="graph-detail-drawer">
      <button type="button" className={css.backdrop} aria-hidden="true" tabIndex={-1} onClick={onClose} />
      <aside className={css.drawer} aria-label={t('detail.node' satisfies SastKey)}>
        <header className={css.header}>
          <h3 className={css.title}>{title}</h3>
          <button type="button" className={css.close} aria-label={closeLabel} onClick={onClose}>×</button>
        </header>
        <dl className={css.fields}>
          {fields.filter(field => field.value !== '').map(field => (
            <div key={field.label} className={css.field}>
              <dt>{field.label}</dt>
              <dd>{field.value}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </div>
  )
}
