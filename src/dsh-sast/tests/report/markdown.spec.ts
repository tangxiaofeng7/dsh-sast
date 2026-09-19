/**
 * @module
 */

import { describe, expect, it } from 'vitest'
import { coverageOf } from '../../src/coverage.ts'
import { buildReport } from '../../src/report/markdown.ts'
import type { SastStateView } from '../../src/store.ts'
import { assetFixture, edgeFixture, factFixture, findingFixture, intentFixture, scanFixture, skillFixture } from './fixtures.ts'

function stateFixture(overrides: Partial<SastStateView> = {}): SastStateView {
  return {
    initialized: true,
    scan: scanFixture(),
    skills: [],
    intents: [intentFixture()],
    facts: [factFixture()],
    findings: [findingFixture()],
    assets: [],
    edges: [edgeFixture({ kind: 'spawns', sourceId: 'scan-1', targetId: 'intent-1' })],
    counts: { skills: 0, intents: 1, facts: 1, findings: 1, assets: 0 },
    ...overrides,
  }
}

describe('buildReport', () => {
  it('reports an uninitialized session without throwing', () => {
    const view = buildReport({ initialized: false, skills: [], intents: [], facts: [], findings: [], assets: [], edges: [], counts: { skills: 0, intents: 0, facts: 0, findings: 0, assets: 0 } }, coverageOf({ scan: undefined, skills: [], intents: [], facts: [], findings: [], assets: [] }))
    expect(view).toContain('未初始化')
  })

  it('renders header metadata from the scan row', () => {
    const state = stateFixture()
    const report = buildReport(state, coverageOf({ scan: state.scan, skills: state.skills, intents: state.intents, facts: state.facts, findings: state.findings, assets: state.assets }))
    expect(report).toContain('- 仓库: /repo')
    expect(report).toContain('- 分支/引用: main @')
    expect(report).toContain('- 审计范围: 全仓')
    expect(report).toContain('- 代码规模: 10 个文件（java）')
  })

  it('shows scope globs instead of "全仓" when scope is non-empty', () => {
    const state = stateFixture({ scan: scanFixture({ scope: ['src/pay/**'] }) })
    const report = buildReport(state, coverageOf({ scan: state.scan, skills: state.skills, intents: state.intents, facts: state.facts, findings: state.findings, assets: state.assets }))
    expect(report).toContain('- 审计范围: src/pay/**')
  })

  it('computes real elapsed time from intent timestamps and per-intent elapsed in the audit chain', () => {
    const state = stateFixture({ intents: [intentFixture({ createdAt: 1000, startedAt: 1000, endedAt: 134000 })] })
    const report = buildReport(state, coverageOf({ scan: state.scan, skills: state.skills, intents: state.intents, facts: state.facts, findings: state.findings, assets: state.assets }))
    expect(report).toContain('- 总耗时: 2m13s')
    expect(report).toContain('耗时 2m13s')
  })

  it('lists a methodology skill\'s checks with their derived state and finding links', () => {
    const skill = skillFixture()
    const intent = intentFixture({ skillId: 'mybatis-sqli', checkId: 'dollar-interpolation', status: 'done' })
    const finding = findingFixture({ skillId: 'mybatis-sqli', checkId: 'dollar-interpolation' })
    const state = stateFixture({ skills: [skill], intents: [intent], findings: [finding] })
    const report = buildReport(state, coverageOf({ scan: state.scan, skills: state.skills, intents: state.intents, facts: state.facts, findings: state.findings, assets: state.assets }))
    expect(report).toContain('### mybatis-sqli — MyBatis 注入（workspace，1/1 已完成）')
    expect(report).toContain('- [done] dollar-interpolation ${} 插值审计 → 漏洞 finding-1')
  })

  it('lists an incidental finding (no skill/check) under its own subsection', () => {
    const finding = findingFixture({ skillId: undefined, checkId: undefined })
    const state = stateFixture({ findings: [finding] })
    const report = buildReport(state, coverageOf({ scan: state.scan, skills: state.skills, intents: state.intents, facts: state.facts, findings: state.findings, assets: state.assets }))
    expect(report).toContain('### 检查清单之外的发现（内置流程 / 顺带发现）')
    expect(report).toContain(`- ${finding.id} [${finding.severity}] ${finding.title}`)
  })

  it('renders a finding\'s full detail block with a numbered codePath chain', () => {
    const state = stateFixture()
    const report = buildReport(state, coverageOf({ scan: state.scan, skills: state.skills, intents: state.intents, facts: state.facts, findings: state.findings, assets: state.assets }))
    expect(report).toContain('### finding-1 [critical] CWE-89 · injection · /api/order/query 存在 SQL 注入')
    expect(report).toContain('1. src/web/OrderController.java:42 `query`')
    expect(report).toContain('2. src/dao/OrderDao.java:88 `selectByKeyword`')
    expect(report).toContain("- 触发方式: GET /api/order/query?keyword=1' OR '1'='1")
    expect(report).toContain('- 修复建议: 改用 #{} 参数化绑定')
  })

  it('links a finding\'s affected asset by id', () => {
    const asset = assetFixture({ id: 'asset-1', type: 'entrypoint', value: 'GET /api/order/query' })
    const finding = findingFixture({ affectedAssetId: 'asset-1' })
    const state = stateFixture({ assets: [asset], findings: [finding] })
    const report = buildReport(state, coverageOf({ scan: state.scan, skills: state.skills, intents: state.intents, facts: state.facts, findings: state.findings, assets: state.assets }))
    expect(report).toContain('- 影响资产: [entrypoint] GET /api/order/query')
  })

  it('moves a false-positive-triaged finding to the excluded section, not the main body', () => {
    const finding = findingFixture({ status: 'false-positive', triageReason: '已由白名单校验拦截' })
    const state = stateFixture({ findings: [finding] })
    const report = buildReport(state, coverageOf({ scan: state.scan, skills: state.skills, intents: state.intents, facts: state.facts, findings: state.findings, assets: state.assets }))
    expect(report).not.toContain(`### ${finding.id}`)
    expect(report).toContain('## 已排除（误报裁决）')
    expect(report).toContain(`- ${finding.id} [${finding.severity}] ${finding.title} — false-positive：已由白名单校验拦截`)
  })

  it('indents nested assets by parent hierarchy', () => {
    const repo = assetFixture({ id: 'asset-1', type: 'repo', value: 'pay/gateway', meta: 'Java 17' })
    const module = assetFixture({ id: 'asset-2', type: 'module', value: 'payment-core', meta: '' })
    const entrypoint = assetFixture({ id: 'asset-3', type: 'entrypoint', value: 'POST /api/pay/callback', meta: '' })
    const edges = [
      edgeFixture({ id: 'edge-1', kind: 'parent', sourceId: 'asset-1', targetId: 'asset-2' }),
      edgeFixture({ id: 'edge-2', kind: 'parent', sourceId: 'asset-2', targetId: 'asset-3' }),
    ]
    const state = stateFixture({ assets: [repo, module, entrypoint], edges, findings: [] })
    const report = buildReport(state, coverageOf({ scan: state.scan, skills: state.skills, intents: state.intents, facts: state.facts, findings: state.findings, assets: state.assets }))
    expect(report).toContain('- [repo] pay/gateway（Java 17）\n  - [module] payment-core\n    - [entrypoint] POST /api/pay/callback')
  })
})
