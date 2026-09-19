/**
 * @module
 */

import { describe, expect, it } from 'vitest'
import { coverageOf } from '../src/coverage.ts'
import type { SastAsset, SastFact, SastFinding, SastIntent, SastScan, SastSkill } from '../src/spec.ts'

function scanFixture(overrides: Partial<SastScan> = {}): SastScan {
  return {
    id: 'scan-1',
    sessionId: 'session-1',
    provider: 'local',
    repoUrl: '/repo',
    branch: '',
    commit: '',
    workspacePath: '/workspace',
    objective: 'audit',
    scope: [],
    authorization: '',
    languages: [],
    fileCount: 0,
    ...overrides,
  }
}

function skillFixture(overrides: Partial<SastSkill> = {}): SastSkill {
  return {
    id: 'skill-sqli',
    sessionId: 'session-1',
    title: 'SQL Injection',
    source: 'project-dsh',
    sourceGroup: 'workspace',
    provider: 'dsh',
    category: 'custom',
    applicability: { languages: [], frameworks: [], paths: [] },
    checks: [{ id: 'check-1', title: 'Check raw queries', scope: [] }],
    enabled: true,
    manifestDigest: 'digest-1',
    ...overrides,
  }
}

function intentFixture(overrides: Partial<SastIntent> = {}): SastIntent {
  return {
    id: 'intent-1',
    sessionId: 'session-1',
    title: 'Check raw queries',
    detail: '',
    category: 'custom',
    scope: [],
    status: 'pending',
    note: '',
    createdAt: 0,
    ...overrides,
  }
}

function factFixture(overrides: Partial<SastFact> = {}): SastFact {
  return {
    id: 'fact-1',
    sessionId: 'session-1',
    intentId: 'intent-1',
    kind: 'sink',
    path: 'src/db.ts',
    line: 0,
    lineAdjusted: false,
    detail: 'raw query',
    confidence: 0.5,
    source: 'llm',
    engineRule: '',
    at: 0,
    ...overrides,
  }
}

function findingFixture(overrides: Partial<SastFinding> = {}): SastFinding {
  return {
    id: 'finding-1',
    sessionId: 'session-1',
    intentId: 'intent-1',
    title: 'SQL injection',
    severity: 'high',
    confidence: 0.5,
    description: '',
    codePath: [{ path: 'src/db.ts', line: 10 }],
    remediation: '',
    poc: '',
    status: 'open',
    triageReason: '',
    at: 0,
    ...overrides,
  }
}

function assetFixture(overrides: Partial<SastAsset>): SastAsset {
  return {
    id: 'asset-1',
    sessionId: 'session-1',
    type: 'file',
    value: 'src/db.ts',
    meta: '',
    at: 0,
    ...overrides,
  }
}

describe('coverageOf', () => {
  it('returns an empty view for a session with no domain rows', () => {
    const view = coverageOf({ scan: undefined, skills: [], intents: [], facts: [], findings: [], assets: [] })
    expect(view.files).toEqual({ inScope: 0, touched: 0, ratio: 0, modules: [], untouchedHotspots: [] })
    expect(view.checks).toEqual({
      total: 0, covered: 0, coverageRatio: 0, completed: 0, completionRatio: 0,
      blocked: 0, running: 0, planned: 0, todo: 0, skills: [],
    })
    expect(view.incidentalFindings).toEqual([])
  })

  it('derives todo for a check with no intent', () => {
    const view = coverageOf({
      scan: scanFixture(), skills: [skillFixture()], intents: [], facts: [], findings: [], assets: [],
    })
    const skill = view.checks.skills[0]!
    expect(skill.checks[0]!.state).toBe('todo')
    expect(skill.todo).toBe(1)
    expect(skill.covered).toBe(0)
  })

  it('derives planned for a pending intent', () => {
    const view = coverageOf({
      scan: scanFixture(),
      skills: [skillFixture()],
      intents: [intentFixture({ skillId: 'skill-sqli', checkId: 'check-1', status: 'pending' })],
      facts: [], findings: [], assets: [],
    })
    const check = view.checks.skills[0]!.checks[0]!
    expect(check.state).toBe('planned')
  })

  it.each(['running', 'done', 'blocked'] as const)('maps a %s intent status directly to check state', (status) => {
    const view = coverageOf({
      scan: scanFixture(),
      skills: [skillFixture()],
      intents: [intentFixture({ skillId: 'skill-sqli', checkId: 'check-1', status })],
      facts: [], findings: [], assets: [],
    })
    expect(view.checks.skills[0]!.checks[0]!.state).toBe(status)
  })

  it('counts covered as any non-todo state and completed only as done', () => {
    const view = coverageOf({
      scan: scanFixture(),
      skills: [skillFixture({
        checks: [
          { id: 'check-1', title: 'a', scope: [] },
          { id: 'check-2', title: 'b', scope: [] },
          { id: 'check-3', title: 'c', scope: [] },
        ],
      })],
      intents: [
        intentFixture({ id: 'intent-1', skillId: 'skill-sqli', checkId: 'check-1', status: 'done' }),
        intentFixture({ id: 'intent-2', skillId: 'skill-sqli', checkId: 'check-2', status: 'running' }),
      ],
      facts: [], findings: [], assets: [],
    })
    const skill = view.checks.skills[0]!
    expect(skill.total).toBe(3)
    expect(skill.covered).toBe(2)
    expect(skill.completed).toBe(1)
    expect(skill.todo).toBe(1)
    expect(view.checks.coverageRatio).toBeCloseTo(2 / 3)
    expect(view.checks.completionRatio).toBeCloseTo(1 / 3)
  })

  it('never counts a blocked check as completed even though it is covered', () => {
    const view = coverageOf({
      scan: scanFixture(),
      skills: [skillFixture()],
      intents: [intentFixture({ skillId: 'skill-sqli', checkId: 'check-1', status: 'blocked' })],
      facts: [], findings: [], assets: [],
    })
    expect(view.checks.covered).toBe(1)
    expect(view.checks.completed).toBe(0)
    expect(view.checks.blocked).toBe(1)
    expect(view.checks.coverageRatio).toBe(1)
    expect(view.checks.completionRatio).toBe(0)
  })

  it('excludes a disabled skill from the aggregate denominator but still lists it', () => {
    const view = coverageOf({
      scan: scanFixture(),
      skills: [
        skillFixture({ id: 'skill-a', enabled: true }),
        skillFixture({ id: 'skill-b', enabled: false }),
      ],
      intents: [],
      facts: [], findings: [], assets: [],
    })
    expect(view.checks.total).toBe(1)
    expect(view.checks.skills).toHaveLength(2)
    expect(view.checks.skills.find(s => s.skillId === 'skill-b')!.enabled).toBe(false)
  })

  it('routes a finding with skillId+checkId into that check and an unlinked finding into incidentalFindings', () => {
    const view = coverageOf({
      scan: scanFixture(),
      skills: [skillFixture()],
      intents: [intentFixture({ skillId: 'skill-sqli', checkId: 'check-1', status: 'done' })],
      facts: [],
      findings: [
        findingFixture({ id: 'finding-linked', skillId: 'skill-sqli', checkId: 'check-1' }),
        findingFixture({ id: 'finding-incidental' }),
      ],
      assets: [],
    })
    expect(view.checks.skills[0]!.checks[0]!.findings).toEqual(['finding-linked'])
    expect(view.incidentalFindings).toEqual(['finding-incidental'])
  })

  it('computes file coverage ratio from fact paths and finding codePath hops', () => {
    const view = coverageOf({
      scan: scanFixture({ fileCount: 4 }),
      skills: [], intents: [],
      facts: [factFixture({ path: 'src/a.ts' })],
      findings: [findingFixture({ codePath: [{ path: 'src/b.ts', line: 1 }] })],
      assets: [],
    })
    expect(view.files.inScope).toBe(4)
    expect(view.files.touched).toBe(2)
    expect(view.files.ratio).toBeCloseTo(0.5)
  })

  it('falls back to counting file assets for inScope when the scan has no fileCount', () => {
    const view = coverageOf({
      scan: scanFixture({ fileCount: 0 }),
      skills: [], intents: [], facts: [], findings: [],
      assets: [
        assetFixture({ id: 'asset-1', type: 'file', value: 'src/a.ts' }),
        assetFixture({ id: 'asset-2', type: 'file', value: 'src/b.ts' }),
      ],
    })
    expect(view.files.inScope).toBe(2)
  })

  it('lists file assets that were never cited as untouched hotspots', () => {
    const view = coverageOf({
      scan: scanFixture(),
      skills: [], intents: [],
      facts: [factFixture({ path: 'src/a.ts' })],
      findings: [],
      assets: [
        assetFixture({ id: 'asset-1', type: 'file', value: 'src/a.ts' }),
        assetFixture({ id: 'asset-2', type: 'file', value: 'src/b.ts' }),
      ],
    })
    expect(view.files.untouchedHotspots).toEqual(['src/b.ts'])
  })

  it('rolls up module coverage and finding counts from nested file assets', () => {
    const view = coverageOf({
      scan: scanFixture(),
      skills: [], intents: [],
      facts: [factFixture({ path: 'src/mod/a.ts' })],
      findings: [findingFixture({ codePath: [{ path: 'src/mod/a.ts', line: 1 }] })],
      assets: [
        assetFixture({ id: 'asset-mod', type: 'module', value: 'src/mod' }),
        assetFixture({ id: 'asset-a', type: 'file', value: 'src/mod/a.ts' }),
        assetFixture({ id: 'asset-b', type: 'file', value: 'src/mod/b.ts' }),
      ],
    })
    expect(view.files.modules).toEqual([{ path: 'src/mod', inScope: 2, touched: 1, findings: 1 }])
  })
})
