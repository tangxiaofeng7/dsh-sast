/**
 * @module
 */

import { describe, expect, it } from 'vitest'
import { buildSarif } from '../../src/report/sarif.ts'
import type { SastStateView } from '../../src/store.ts'
import { findingFixture, scanFixture } from './fixtures.ts'

function stateFixture(overrides: Partial<SastStateView> = {}): SastStateView {
  return {
    initialized: true,
    scan: scanFixture(),
    skills: [],
    intents: [],
    facts: [],
    findings: [findingFixture()],
    assets: [],
    edges: [],
    counts: { skills: 0, intents: 0, facts: 0, findings: 1, assets: 0 },
    ...overrides,
  }
}

describe('buildSarif', () => {
  it('emits a well-formed SARIF 2.1.0 log envelope', () => {
    const sarif = buildSarif(stateFixture())
    expect(sarif.version).toBe('2.1.0')
    expect(sarif.$schema).toContain('sarif-schema-2.1.0.json')
    expect(sarif.runs).toHaveLength(1)
    expect(sarif.runs[0]!.tool.driver.name).toBe('dsh-sast')
  })

  it('maps a methodology-associated finding to ruleId = skillId/checkId', () => {
    const sarif = buildSarif(stateFixture())
    const result = sarif.runs[0]!.results[0]!
    expect(result.ruleId).toBe('mybatis-sqli/dollar-interpolation')
  })

  it('falls back ruleId to cwe, then vulnClass, then unclassified when no skill/check is present', () => {
    const withCwe = buildSarif(stateFixture({ findings: [findingFixture({ skillId: undefined, checkId: undefined })] }))
    expect(withCwe.runs[0]!.results[0]!.ruleId).toBe('CWE-89')
    const withVulnClassOnly = buildSarif(stateFixture({ findings: [findingFixture({ skillId: undefined, checkId: undefined, cwe: undefined })] }))
    expect(withVulnClassOnly.runs[0]!.results[0]!.ruleId).toBe('injection')
    const withNeither = buildSarif(stateFixture({ findings: [findingFixture({ skillId: undefined, checkId: undefined, cwe: undefined, vulnClass: undefined })] }))
    expect(withNeither.runs[0]!.results[0]!.ruleId).toBe('unclassified')
  })

  it('maps severity to level and a security-severity score', () => {
    const critical = buildSarif(stateFixture({ findings: [findingFixture({ severity: 'critical' })] }))
    expect(critical.runs[0]!.results[0]!.level).toBe('error')
    expect(critical.runs[0]!.results[0]!.properties?.['security-severity']).toBe('9.5')
    const info = buildSarif(stateFixture({ findings: [findingFixture({ severity: 'info' })] }))
    expect(info.runs[0]!.results[0]!.level).toBe('note')
  })

  it('maps a multi-hop codePath to codeFlows.threadFlows.locations, in order', () => {
    const sarif = buildSarif(stateFixture())
    const result = sarif.runs[0]!.results[0]!
    expect(result.codeFlows).toBeDefined()
    const locations = result.codeFlows![0]!.threadFlows[0]!.locations
    expect(locations).toHaveLength(2)
    expect(locations[0]!.location.physicalLocation.artifactLocation.uri).toBe('src/web/OrderController.java')
    expect(locations[1]!.location.physicalLocation.artifactLocation.uri).toBe('src/dao/OrderDao.java')
  })

  it('omits codeFlows for a single-hop finding (the primary location covers it)', () => {
    const sarif = buildSarif(stateFixture({ findings: [findingFixture({ codePath: [{ path: 'a.ts', line: 1 }] })] }))
    expect(sarif.runs[0]!.results[0]!.codeFlows).toBeUndefined()
  })

  it('keeps a false-positive-triaged finding as a result, adding suppressions rather than dropping it (ADR-09)', () => {
    const sarif = buildSarif(stateFixture({ findings: [findingFixture({ status: 'false-positive', triageReason: '已排除' })] }))
    expect(sarif.runs[0]!.results).toHaveLength(1)
    expect(sarif.runs[0]!.results[0]!.suppressions).toEqual([{ kind: 'inSource', justification: '已排除' }])
  })

  it('does not add suppressions to an active (non-excluded) finding', () => {
    const sarif = buildSarif(stateFixture({ findings: [findingFixture({ status: 'confirmed' })] }))
    expect(sarif.runs[0]!.results[0]!.suppressions).toBeUndefined()
  })

  it('carries versionControlProvenance with the redacted repoUrl and commit sha', () => {
    const sarif = buildSarif(stateFixture())
    expect(sarif.runs[0]!.versionControlProvenance).toEqual([{ repositoryUri: '/repo', revisionId: 'a'.repeat(40) }])
  })

  it('omits versionControlProvenance when the scan has no commit yet', () => {
    const sarif = buildSarif(stateFixture({ scan: scanFixture({ commit: '' }) }))
    expect(sarif.runs[0]!.versionControlProvenance).toBeUndefined()
  })

  it('declares one rule per distinct ruleId, not one per finding', () => {
    const sarif = buildSarif(stateFixture({
      findings: [
        findingFixture({ id: 'finding-1', skillId: 's1', checkId: 'c1' }),
        findingFixture({ id: 'finding-2', skillId: 's1', checkId: 'c1' }),
      ],
    }))
    expect(sarif.runs[0]!.tool.driver.rules).toHaveLength(1)
  })

  it('tags each partialFingerprints with the finding id for stable dedup across reruns', () => {
    const sarif = buildSarif(stateFixture())
    expect(sarif.runs[0]!.results[0]!.partialFingerprints).toEqual({ findingId: 'finding-1' })
  })
})
