/**
 * Markdown report builder (`sast_report format: markdown`, ADR-09): a pure
 * function over the storage layer's full session view (not the projection's
 * windowed view, ADR-11) — real elapsed time, complete records, no
 * snippet-preview truncation. Section order: header metadata → audit summary
 * (counts + two-dimensional coverage + real elapsed time) → methodology and
 * check coverage (including incidental findings) → vulnerability detail
 * (numbered codePath chains) → excluded (false-positive) → code assets
 * (indented by parent hierarchy) → audit chain (chronological).
 * @module @tangxiaofeng7/dsh-sast-host/src/report/markdown
 */

import type { CoverageView } from '../coverage.ts'
import type { SastStateView } from '../store.ts'
import type { SastAsset, SastEdge, SastFinding, SastIntent } from '../spec.ts'
import { partitionByTriage } from './partition.ts'

/** Format milliseconds as `<h>h<m>m<s>s` / `<m>m<s>s` / `<s>s`, dropping leading zero units. */
function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) return `${hours}h${minutes}m${seconds}s`
  if (minutes > 0) return `${minutes}m${seconds}s`
  return `${seconds}s`
}

/** Real wall-clock elapsed time across every timestamp the store's injected clock actually wrote (ADR-10); undefined when there is nothing to measure yet. */
function totalElapsed(intents: readonly SastIntent[]): string | undefined {
  const timestamps: number[] = []
  for (const intent of intents) {
    timestamps.push(intent.createdAt)
    if (intent.startedAt !== undefined) timestamps.push(intent.startedAt)
    if (intent.endedAt !== undefined) timestamps.push(intent.endedAt)
  }
  if (timestamps.length === 0) return undefined
  return formatDuration(Math.max(...timestamps) - Math.min(...timestamps))
}

/** Per-intent elapsed time for the audit-chain timeline; undefined until the intent has both a start and end. */
function intentElapsed(intent: SastIntent): string | undefined {
  if (intent.startedAt === undefined || intent.endedAt === undefined) return undefined
  return formatDuration(intent.endedAt - intent.startedAt)
}

/** Find the edge anchoring one node's kind:id as `<kind> <sourceId>`, or '?' if the store somehow omitted it (unreachable in practice — see store.ts). */
function anchorOf(edges: readonly SastEdge[], targetId: string): string {
  const edge = edges.find(e => e.targetId === targetId)
  /* v8 ignore next 1 -- unreachable: the store writes the connecting edge with every node. */
  return edge === undefined ? '?' : `${edge.kind} ${edge.sourceId}`
}

/** Render the "审计方法论与检查项覆盖" section: one subsection per Skill, plus incidental findings. */
function buildMethodologySection(coverage: CoverageView, findingsById: Map<string, SastFinding>): string[] {
  const lines: string[] = ['## 审计方法论与检查项覆盖']
  for (const skill of coverage.checks.skills) {
    const sourceLabel = skill.sourceGroup === 'builtin' ? 'builtin' : skill.sourceGroup === 'workspace' ? 'workspace' : 'user'
    lines.push(`### ${skill.skillId} — ${skill.name}（${sourceLabel}，${skill.completed}/${skill.total} 已完成）`)
    for (const check of skill.checks) {
      const findingRefs = check.findings.length === 0 ? '' : ` → 漏洞 ${check.findings.join(', ')}`
      lines.push(`- [${check.state}] ${check.checkId} ${check.title}${findingRefs}`)
    }
  }
  if (coverage.incidentalFindings.length > 0) {
    lines.push('### 检查清单之外的发现（内置流程 / 顺带发现）')
    for (const findingId of coverage.incidentalFindings) {
      const finding = findingsById.get(findingId)
      if (finding === undefined) continue
      lines.push(`- ${finding.id} [${finding.severity}] ${finding.title}`)
    }
  }
  return lines
}

/** Render one finding's full detail block, with its numbered codePath chain. */
function buildFindingSection(finding: SastFinding, assets: readonly SastAsset[]): string[] {
  const originLabel = finding.skillId !== undefined ? ` · 来源: ${finding.skillId} / ${finding.checkId}` : ''
  const asset = finding.affectedAssetId === undefined ? undefined : assets.find(a => a.id === finding.affectedAssetId)
  const titlePrefix = [finding.cwe, finding.vulnClass].filter(Boolean).join(' · ')
  const lines = [
    `### ${finding.id} [${finding.severity}]${titlePrefix === '' ? '' : ` ${titlePrefix} ·`} ${finding.title}`,
    `- 置信度: ${finding.confidence}  · 状态: ${finding.status}${originLabel}`,
    `- 成因: ${finding.description === '' ? '（未说明）' : finding.description}`,
    `- 影响资产: ${asset === undefined ? '（未关联）' : `[${asset.type}] ${asset.value}`}`,
    '- 代码证据链:',
    ...finding.codePath.map((hop, index) => {
      const symbol = hop.symbol === undefined ? '' : ` \`${hop.symbol}\``
      const note = hop.note === undefined || hop.note === '' ? '' : ` — ${hop.note}`
      return `  ${index + 1}. ${hop.path}:${hop.line ?? 0}${symbol}${note}`
    }),
  ]
  if (finding.poc !== '') lines.push(`- 触发方式: ${finding.poc}`)
  if (finding.remediation !== '') lines.push(`- 修复建议: ${finding.remediation}`)
  return lines
}

/** Render the "代码资产" section, indented by parent hierarchy (parent edges). */
function buildAssetSection(assets: readonly SastAsset[], edges: readonly SastEdge[]): string[] {
  if (assets.length === 0) return ['（无）']
  const parentOf = new Map<string, string>()
  for (const edge of edges) {
    if (edge.kind === 'parent') parentOf.set(edge.targetId, edge.sourceId)
  }
  const depthOf = (assetId: string, seen = new Set<string>()): number => {
    const parentId = parentOf.get(assetId)
    if (parentId === undefined || seen.has(assetId)) return 0
    return 1 + depthOf(parentId, new Set([...seen, assetId]))
  }
  return assets.map((asset) => {
    const indent = '  '.repeat(depthOf(asset.id))
    return `${indent}- [${asset.type}] ${asset.value}${asset.meta === '' ? '' : `（${asset.meta}）`}`
  })
}

/** Build the full Markdown audit report for one session's storage-layer view. */
export function buildReport(state: SastStateView, coverage: CoverageView): string {
  if (!state.initialized || state.scan === undefined) {
    return ['# 白盒审计报告', '', '（未初始化：尚未调用 sast_start_scan。）'].join('\n')
  }
  const scan = state.scan
  const findingsById = new Map(state.findings.map(finding => [finding.id, finding] as const))
  const { active, excluded } = partitionByTriage(state.findings)

  const statusCounts = { done: 0, running: 0, blocked: 0, pending: 0 }
  for (const intent of state.intents) statusCounts[intent.status] += 1
  const severityCounts = new Map<string, number>()
  for (const finding of active) severityCounts.set(finding.severity, (severityCounts.get(finding.severity) ?? 0) + 1)
  const severityLabel = [...severityCounts.entries()].map(([severity, count]) => `${severity} ${count}`).join(' / ')

  const elapsed = totalElapsed(state.intents)
  const shortCommit = scan.commit === '' ? '（未知）' : scan.commit.slice(0, 12)

  const chainLines = [
    `- 扫描 (scan ${scan.id})「${scan.repoUrl}${scan.branch === '' ? '' : ` @ ${scan.branch}`}」— 目标: ${scan.objective}`,
    ...state.intents.map((intent) => {
      const elapsedLabel = intentElapsed(intent)
      return `- 意图 (intent ${intent.id})「${intent.title}」(${anchorOf(state.edges, intent.id)}) — 状态: ${intent.status}${elapsedLabel === undefined ? '' : ` · 耗时 ${elapsedLabel}`}`
    }),
    ...state.facts.map(fact => `- 事实 (fact ${fact.id}) [${fact.kind}] ${fact.path}:${fact.line} ${fact.detail} (${anchorOf(state.edges, fact.id)})`),
    ...active.map(finding => `- 漏洞 (finding ${finding.id}) [${finding.severity}] ${finding.title} (${anchorOf(state.edges, finding.id)})`),
  ]

  return [
    '# 白盒审计报告',
    '',
    `- 仓库: ${scan.repoUrl}`,
    `- 分支/引用: ${scan.branch === '' ? '（未知）' : scan.branch} @ ${shortCommit}`,
    `- 审计范围: ${scan.scope.length === 0 ? '全仓' : scan.scope.join(', ')}`,
    `- 授权: ${scan.authorization === '' ? '未声明' : scan.authorization}`,
    `- 代码规模: ${scan.fileCount} 个文件（${scan.languages.length === 0 ? '未知语言' : scan.languages.join('/')}）`,
    '',
    '## 审计概要',
    `- 审计意图 ${state.intents.length}（已完成 ${statusCounts.done} / 进行中 ${statusCounts.running} / 阻塞 ${statusCounts.blocked}）· 事实 ${state.facts.length} · 漏洞 ${active.length}（${severityLabel === '' ? '无' : severityLabel}）`,
    `- 文件覆盖率: 已触达 ${coverage.files.touched} / 范围内 ${coverage.files.inScope} 个文件（${Math.round(coverage.files.ratio * 100)}%）`,
    `- 检查项纳入率: ${coverage.checks.covered} / ${coverage.checks.total}（${Math.round(coverage.checks.coverageRatio * 100)}%，非 todo）`,
    `- 检查项完成度: ${coverage.checks.completed} / ${coverage.checks.total}（${Math.round(coverage.checks.completionRatio * 100)}%；blocked ${coverage.checks.blocked} / running ${coverage.checks.running} / planned ${coverage.checks.planned} / todo ${coverage.checks.todo}）`,
    `- 总耗时: ${elapsed ?? '（尚无记录）'}（耗时来自存储层的耐久时间戳，各意图耗时见「审计链路」小节）`,
    '',
    ...buildMethodologySection(coverage, findingsById),
    '',
    '## 漏洞明细',
    ...(active.length === 0 ? ['（无）'] : active.flatMap(finding => [...buildFindingSection(finding, state.assets), ''])),
    '## 已排除（误报裁决）',
    ...(excluded.length === 0 ? ['（无）'] : excluded.map(finding => `- ${finding.id} [${finding.severity}] ${finding.title} — false-positive：${finding.triageReason === '' ? '（未说明）' : finding.triageReason}`)),
    '',
    '## 代码资产',
    ...buildAssetSection(state.assets, state.edges),
    '',
    '## 审计链路',
    ...(chainLines.length === 1 ? ['（仅扫描，尚未展开）'] : chainLines),
    '',
  ].join('\n')
}
