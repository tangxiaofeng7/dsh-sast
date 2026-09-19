/**
 * FindingsView: the 漏洞 sub-tab of the 白盒审计 view. Lists every
 * vulnerability finding of the audit — severity badge, title, description,
 * the code evidence chain (codePath: path:line + symbol + note, each hop a
 * permalink into the source repository when the scan has resolved a commit,
 * with a copy-path affordance), CWE/vulnClass, methodology origin
 * (skillId/checkId, or "检查清单之外的发现" when incidental), and the
 * affected asset when linked.
 */

import { useState } from 'react'
import type { SastProjection, SastProjectionNode, SastSeverity } from '@tangxiaofeng7/dsh-sast-host/client'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import { permalinkOf } from './permalink.ts'
import type { SastKey } from './locales.ts'
import css from './FindingsView.module.css'

/** Severity badge label keys. */
const SEVERITY_LABELS: Record<SastSeverity, SastKey> = {
  critical: 'severity.critical',
  high: 'severity.high',
  medium: 'severity.medium',
  low: 'severity.low',
  info: 'severity.info',
}

/** Narrow the projection nodes to findings. */
function findingsOf(projection: SastProjection): Array<SastProjectionNode & { kind: 'finding' }> {
  return projection.nodes.filter((node): node is SastProjectionNode & { kind: 'finding' } => node.kind === 'finding')
}

/** One code-evidence-chain hop: path:line, an optional symbol, a permalink, and a copy-path button. */
function CodePathHop({ hop, index, sast, t }: {
  readonly hop: { readonly path: string; readonly line: number; readonly symbol?: string }
  readonly index: number
  readonly sast: SastProjection
  readonly t: PropsLocale<'sast'>['t']
}) {
  const [copied, setCopied] = useState(false)
  const url = sast.scan === null ? undefined : permalinkOf(sast.scan, hop)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(hop.path)
      setCopied(true)
      setTimeout(() => { setCopied(false) }, 1500)
    } catch {
      // Clipboard access can be denied; the button silently stays unclicked-looking.
    }
  }
  return (
    <li className={css.hop}>
      <span className={css.hopIndex}>{index + 1}.</span>
      <span className={css.hopLocation}>
        {hop.path}:{hop.line}{hop.symbol !== undefined && <code className={css.hopSymbol}>{hop.symbol}</code>}
      </span>
      <span className={css.hopActions}>
        {url !== undefined && (
          <a className={css.hopAction} href={url} target="_blank" rel="noreferrer" title={t('permalink.open')}>↗</a>
        )}
        <button type="button" className={css.hopAction} onClick={() => { void copy() }} title={t('copy.path')}>
          {copied ? t('copy.done') : '⧉'}
        </button>
      </span>
    </li>
  )
}

/** Full props of the findings sub-tab. */
export interface FindingsViewProps {
  readonly sast: SastProjection
  readonly t: PropsLocale<'sast'>['t']
}

export function FindingsView({ sast, t }: FindingsViewProps) {
  const findings = findingsOf(sast)
  if (findings.length === 0) {
    return <p className={css.empty} data-testid="sast-findings-empty">{t('findings.empty')}</p>
  }
  return (
    <ul className={css.list} data-testid="sast-findings">
      {findings.map((finding) => {
        const asset = finding.affectedAssetId === undefined
          ? undefined
          : sast.assets.find(candidate => candidate.id === finding.affectedAssetId)
        return (
          <li key={finding.id} className={css.finding} data-testid="sast-finding">
            <header className={css.header}>
              <span className={css.severity} data-severity={finding.severity}>{t(SEVERITY_LABELS[finding.severity])}</span>
              <h4 className={css.title}>{finding.title}</h4>
              <span className={css.id}>{finding.id}</span>
            </header>
            {(finding.cwe !== undefined || finding.vulnClass !== undefined) && (
              <p className={css.tags}>
                {finding.cwe !== undefined && <span className={css.tag}>{t('finding.cwe')}: {finding.cwe}</span>}
                {finding.vulnClass !== undefined && <span className={css.tag}>{t('finding.vulnClass')}: {finding.vulnClass}</span>}
              </p>
            )}
            {finding.description !== '' && <p className={css.description}>{finding.description}</p>}
            <div className={css.codePathBlock}>
              <span className={css.codePathLabel}>{t('finding.codePath')}</span>
              <ol className={css.codePath}>
                {finding.codePath.map((hop, index) => (
                  <CodePathHop key={index} hop={hop} index={index} sast={sast} t={t} />
                ))}
              </ol>
            </div>
            {asset !== undefined && (
              <p className={css.asset}>{t('finding.affected')}: [{asset.type}] {asset.value}</p>
            )}
            <p className={css.origin}>
              {t('finding.origin')}: {finding.skillId !== undefined ? `${finding.skillId} / ${finding.checkId}` : t('finding.incidental')}
            </p>
          </li>
        )
      })}
    </ul>
  )
}
