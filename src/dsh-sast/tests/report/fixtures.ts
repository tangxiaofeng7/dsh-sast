/**
 * Domain-row fixtures shared by report/*.spec.ts (mirrors coverage.spec.ts's
 * inline fixtures, factored out since both report builders need the same
 * shapes across several tests).
 * @module
 */

import type { SastAsset, SastEdge, SastFact, SastFinding, SastIntent, SastScan, SastSkill } from '../../src/spec.ts'

export function scanFixture(overrides: Partial<SastScan> = {}): SastScan {
  return {
    id: 'scan-1',
    sessionId: 'session-1',
    provider: 'local',
    repoUrl: '/repo',
    branch: 'main',
    commit: 'a'.repeat(40),
    workspacePath: '/repo',
    objective: 'audit',
    scope: [],
    authorization: '',
    languages: ['java'],
    fileCount: 10,
    ...overrides,
  }
}

export function skillFixture(overrides: Partial<SastSkill> = {}): SastSkill {
  return {
    id: 'mybatis-sqli',
    sessionId: 'session-1',
    title: 'MyBatis 注入',
    source: 'project-dsh',
    sourceGroup: 'workspace',
    provider: 'dsh',
    category: 'custom',
    applicability: { languages: [], frameworks: [], paths: [] },
    checks: [{ id: 'dollar-interpolation', title: '${} 插值审计', scope: [] }],
    enabled: true,
    manifestDigest: 'digest-1',
    ...overrides,
  }
}

export function intentFixture(overrides: Partial<SastIntent> = {}): SastIntent {
  return {
    id: 'intent-1',
    sessionId: 'session-1',
    title: '测绘控制器与路由',
    detail: '',
    category: 'custom',
    scope: [],
    status: 'done',
    note: '',
    createdAt: 1000,
    startedAt: 1000,
    endedAt: 134000,
    ...overrides,
  }
}

export function factFixture(overrides: Partial<SastFact> = {}): SastFact {
  return {
    id: 'fact-1',
    sessionId: 'session-1',
    intentId: 'intent-1',
    kind: 'sink',
    path: 'src/dao/OrderDao.java',
    line: 88,
    lineAdjusted: false,
    detail: '字符串拼接进入 SQL',
    confidence: 0.9,
    source: 'llm',
    engineRule: '',
    at: 2000,
    ...overrides,
  }
}

export function findingFixture(overrides: Partial<SastFinding> = {}): SastFinding {
  return {
    id: 'finding-1',
    sessionId: 'session-1',
    intentId: 'intent-1',
    title: '/api/order/query 存在 SQL 注入',
    severity: 'critical',
    vulnClass: 'injection',
    cwe: 'CWE-89',
    confidence: 0.9,
    description: '用户可控参数拼接进入 SQL',
    codePath: [
      { path: 'src/web/OrderController.java', line: 42, symbol: 'query' },
      { path: 'src/dao/OrderDao.java', line: 88, symbol: 'selectByKeyword' },
    ],
    remediation: '改用 #{} 参数化绑定',
    poc: "GET /api/order/query?keyword=1' OR '1'='1",
    status: 'open',
    triageReason: '',
    skillId: 'mybatis-sqli',
    checkId: 'dollar-interpolation',
    at: 3000,
    ...overrides,
  }
}

export function assetFixture(overrides: Partial<SastAsset> = {}): SastAsset {
  return {
    id: 'asset-1',
    sessionId: 'session-1',
    type: 'repo',
    value: 'pay/gateway',
    meta: 'Java 17',
    at: 500,
    ...overrides,
  }
}

export function edgeFixture(overrides: Partial<SastEdge>): SastEdge {
  return {
    id: 'edge-1',
    sessionId: 'session-1',
    kind: 'spawns',
    sourceId: 'scan-1',
    targetId: 'intent-1',
    ...overrides,
  }
}
