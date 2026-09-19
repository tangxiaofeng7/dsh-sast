/**
 * ReportView: render, copy, and download the current sast projection as
 * Markdown. This is a projection-view render (windowed nodes, no real
 * elapsed time — the projection never sees store timestamps), distinct from
 * `sast_report`'s storage-layer report (docs/architecture.md §7).
 */

import { useState } from 'react'
import type { ReactNode } from 'react'
import type { SastProjection, SastProjectionNode } from '@tangxiaofeng7/dsh-sast-host/client'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import css from './ReportView.module.css'

export interface ReportViewProps {
  readonly sast: SastProjection
  readonly t: PropsLocale<'sast'>['t']
}

function reportOf(sast: SastProjection, t: ReportViewProps['t']): string {
  if (sast.scan === null) return `# ${t('report.title')}\n\n${t('report.uninitialized')}\n`

  const findings = sast.nodes.filter((node): node is SastProjectionNode & { kind: 'finding' } => node.kind === 'finding')
  const chain = sast.nodes.map((node) => {
    const anchor = sast.edges.find(edge => edge.targetId === node.id)
    const relation = anchor === undefined ? '' : ` (${anchor.kind} ${anchor.sourceId})`
    if (node.kind === 'intent') return `- ${t('kind.intent')} (${node.id}) ${node.title}${node.detail === '' ? '' : `: ${node.detail}`}${relation}`
    if (node.kind === 'fact') return `- ${t('kind.fact')} (${node.id}) [${node.factKind}] ${node.path}:${node.line} ${node.detail}${relation}`
    return `- ${t('kind.finding')} (${node.id}) [${node.severity}] ${node.title}${relation}`
  })
  const findingSections = findings.flatMap((finding) => {
    const asset = finding.affectedAssetId === undefined ? undefined : sast.assets.find(candidate => candidate.id === finding.affectedAssetId)
    return [
      `### ${finding.id} [${finding.severity}] ${finding.title}`,
      `- ${t('report.description')}: ${finding.description === '' ? t('report.none') : finding.description}`,
      `- ${t('finding.affected')}: ${asset === undefined ? t('report.unlinked') : `[${asset.type}] ${asset.value}`}`,
      `- ${t('finding.codePath')}:`,
      ...finding.codePath.map((hop, index) => `  ${index + 1}. ${hop.path}:${hop.line}${hop.symbol === undefined ? '' : ` \`${hop.symbol}\``}`),
      '',
    ]
  })
  const assetLines = sast.assets.map((asset) => {
    const edge = sast.edges.find(candidate => candidate.kind === 'parent' && candidate.targetId === asset.id)
    const parent = edge === undefined ? undefined : sast.assets.find(candidate => candidate.id === edge.sourceId)
    return `- [${asset.type}] ${asset.value}${asset.meta === '' ? '' : ` (${asset.meta})`}${parent === undefined ? '' : ` <- ${parent.value}`}`
  })
  return [
    `# ${t('report.title')}`,
    '',
    `- ${t('report.repo')}: ${sast.scan.repoUrl}`,
    `- ${t('report.branch')}: ${sast.scan.branch === '' ? t('report.undeclared') : sast.scan.branch}`,
    `- ${t('report.objective')}: ${sast.scan.objective}`,
    `- ${t('report.authorization')}: ${sast.scan.authorization === '' ? t('report.undeclared') : sast.scan.authorization}`,
    '',
    `## ${t('report.chain')}`,
    ...(chain.length === 0 ? [t('report.chainEmpty')] : chain),
    '',
    `## ${t('report.findings')}`,
    ...(findingSections.length === 0 ? [t('report.none')] : findingSections),
    `## ${t('report.assets')}`,
    ...(assetLines.length === 0 ? [t('report.none')] : assetLines),
    '',
  ].join('\n')
}

function filenameOf(repoUrl: string): string {
  const name = repoUrl.replace(/^https?:\/\//, '').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '')
  return `sast-report-${name === '' ? 'session' : name}.md`
}

/** Render the report's small, fixed Markdown subset without interpreting HTML. */
function MarkdownPreview({ markdown }: { readonly markdown: string }) {
  const rows: ReactNode[] = []
  for (const [index, line] of markdown.split('\n').entries()) {
    if (line === '') continue
    if (line.startsWith('### ')) {
      rows.push(<h3 key={index}>{line.slice(4)}</h3>)
    } else if (line.startsWith('## ')) {
      rows.push(<h2 key={index}>{line.slice(3)}</h2>)
    } else if (line.startsWith('# ')) {
      rows.push(<h1 key={index}>{line.slice(2)}</h1>)
    } else if (line.startsWith('- ')) {
      rows.push(<p key={index} className={css.bullet}>{line.slice(2)}</p>)
    } else if (/^  \d+\. /.test(line)) {
      rows.push(<p key={index} className={css.step}>{line.trim()}</p>)
    } else {
      rows.push(<p key={index}>{line}</p>)
    }
  }
  return <article className={css.markdown} data-testid="sast-report-markdown">{rows}</article>
}

export function ReportView({ sast, t }: ReportViewProps) {
  const markdown = reportOf(sast, t)
  const [copyState, setCopyState] = useState<'idle' | 'done' | 'failed'>('idle')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      setCopyState('done')
    } catch {
      setCopyState('failed')
    }
  }

  const download = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filenameOf(sast.scan?.repoUrl ?? '')
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className={css.root} data-testid="sast-report">
      <header className={css.toolbar}>
        <p className={css.hint}>{t('report.hint')}</p>
        <div className={css.actions}>
          <button type="button" className={css.action} onClick={() => { void copy() }} data-testid="sast-report-copy">
            {t(copyState === 'done' ? 'report.copied' : 'report.copy')}
          </button>
          <button type="button" className={css.action} onClick={download} data-testid="sast-report-download">
            {t('report.download')}
          </button>
        </div>
      </header>
      {copyState === 'failed' && <p className={css.error} role="status">{t('report.copyFailed')}</p>}
      <MarkdownPreview markdown={markdown} />
    </section>
  )
}
