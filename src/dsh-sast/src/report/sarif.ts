/**
 * SARIF 2.1.0 report builder (`sast_report format: sarif`, ADR-09): a pure
 * function over the storage layer's full session view. Mapping
 * (tools-protocol.md §2.11/§5.5): `finding` → `result`, `codePath` →
 * `codeFlows[].threadFlows[].locations[]`, `cwe` → `taxa` (CWE taxonomy),
 * `severity` → `level` + `properties.security-severity`, `status:
 * 'false-positive'` → `suppressions[]` (the result itself is KEPT, never
 * dropped — ADR-09). `ruleId` is `<skillId>/<checkId>` when a finding traces
 * to a registered check, else a stable fallback to `cwe`/`vulnClass`/
 * `'unclassified'` (§5.5) so every result always resolves a rule.
 * @module @tangxiaofeng7/dsh-sast-host/src/report/sarif
 */

import type { SastFinding, SastScan, SastSeverity } from '../spec.ts'
import type { SastStateView } from '../store.ts'
import { partitionByTriage } from './partition.ts'

/** Minimal SARIF 2.1.0 shape this builder emits (not the full spec — only what dsh-sast populates). */
export interface SarifLog {
  readonly version: '2.1.0'
  readonly $schema: string
  readonly runs: readonly SarifRun[]
}

export interface SarifRun {
  readonly tool: { readonly driver: { readonly name: string; readonly informationUri: string; readonly rules: readonly SarifRule[] } }
  readonly results: readonly SarifResult[]
  readonly versionControlProvenance?: readonly { readonly repositoryUri: string; readonly revisionId: string }[]
}

export interface SarifRule {
  readonly id: string
  readonly name: string
  readonly properties?: { readonly tags?: readonly string[] }
}

export interface SarifResult {
  readonly ruleId: string
  readonly level: 'error' | 'warning' | 'note'
  readonly message: { readonly text: string }
  readonly locations: readonly SarifLocation[]
  readonly codeFlows?: readonly { readonly threadFlows: readonly { readonly locations: readonly { readonly location: SarifLocation }[] }[] }[]
  readonly partialFingerprints?: { readonly findingId: string }
  readonly properties?: Record<string, unknown>
  readonly suppressions?: readonly { readonly kind: 'external' | 'inSource'; readonly justification: string }[]
}

export interface SarifLocation {
  readonly physicalLocation: {
    readonly artifactLocation: { readonly uri: string }
    readonly region?: { readonly startLine: number; readonly snippet?: { readonly text: string } }
  }
  readonly message?: { readonly text: string }
}

/** `severity` → SARIF `level`. */
const LEVEL_BY_SEVERITY: Record<SastSeverity, 'error' | 'warning' | 'note'> = {
  critical: 'error',
  high: 'error',
  medium: 'warning',
  low: 'note',
  info: 'note',
}

/** `severity` → `properties['security-severity']`, a 0.0-10.0 CVSS-like score GitLab/GitHub code scanning sort by. */
const SECURITY_SEVERITY_BY_SEVERITY: Record<SastSeverity, string> = {
  critical: '9.5',
  high: '7.5',
  medium: '5.0',
  low: '2.5',
  info: '0.0',
}

/** Stable `ruleId`: `<skillId>/<checkId>` when the finding traces to a registered check, else a fallback to cwe/vulnClass/'unclassified' (§5.5). */
function ruleIdOf(finding: SastFinding): string {
  if (finding.skillId !== undefined) return `${finding.skillId}/${finding.checkId}`
  if (finding.cwe !== undefined) return finding.cwe
  if (finding.vulnClass !== undefined) return finding.vulnClass
  return 'unclassified'
}

function locationOf(hop: { readonly path: string; readonly line?: number; readonly symbol?: string; readonly note?: string }): SarifLocation {
  const line = hop.line ?? 0
  return {
    physicalLocation: {
      artifactLocation: { uri: hop.path },
      ...(line > 0 ? { region: { startLine: line } } : {}),
    },
    ...(hop.symbol !== undefined || (hop.note !== undefined && hop.note !== '')
      ? { message: { text: [hop.symbol, hop.note].filter(Boolean).join(' — ') } }
      : {}),
  }
}

/** Build one SARIF `rule` declaration for a finding's ruleId, deduplicated by the caller. */
function ruleOf(ruleId: string, finding: SastFinding): SarifRule {
  const tags = [finding.vulnClass, finding.cwe].filter((tag): tag is string => tag !== undefined)
  return { id: ruleId, name: finding.title, ...(tags.length > 0 ? { properties: { tags } } : {}) }
}

/** Build one SARIF `result` for a finding, whether active or triaged as a false positive (kept, suppressed — ADR-09). */
function resultOf(finding: SastFinding, suppressed: boolean): SarifResult {
  const codePath = finding.codePath
  const primary = codePath[0]
  return {
    ruleId: ruleIdOf(finding),
    level: LEVEL_BY_SEVERITY[finding.severity],
    message: { text: finding.description === '' ? finding.title : finding.description },
    /* v8 ignore next 1 -- unreachable: store.ts rejects a finding with an empty codePath, so [0] always exists. */
    locations: primary === undefined ? [] : [locationOf(primary)],
    ...(codePath.length > 1 ? { codeFlows: [{ threadFlows: [{ locations: codePath.map(hop => ({ location: locationOf(hop) })) }] }] } : {}),
    partialFingerprints: { findingId: finding.id },
    properties: {
      'security-severity': SECURITY_SEVERITY_BY_SEVERITY[finding.severity],
      ...(finding.skillId !== undefined ? { skillId: finding.skillId, checkId: finding.checkId } : {}),
    },
    ...(suppressed ? { suppressions: [{ kind: 'inSource', justification: finding.triageReason === '' ? '（未说明）' : finding.triageReason }] } : {}),
  }
}

/** `versionControlProvenance`: the redacted repo URL plus the checked-out commit sha, so GitLab/GitHub code scanning can map results back to source. */
function provenanceOf(scan: SastScan): { readonly repositoryUri: string; readonly revisionId: string } | undefined {
  if (scan.commit === '') return undefined
  return { repositoryUri: scan.repoUrl, revisionId: scan.commit }
}

/** Build the full SARIF 2.1.0 log for one session's storage-layer view. */
export function buildSarif(state: SastStateView): SarifLog {
  const { active, excluded } = partitionByTriage(state.findings)
  const results = [
    ...active.map(finding => resultOf(finding, false)),
    ...excluded.map(finding => resultOf(finding, true)),
  ]
  const rulesById = new Map<string, SarifRule>()
  for (const finding of state.findings) {
    const ruleId = ruleIdOf(finding)
    if (!rulesById.has(ruleId)) rulesById.set(ruleId, ruleOf(ruleId, finding))
  }
  const provenance = state.scan === undefined ? undefined : provenanceOf(state.scan)
  return {
    version: '2.1.0',
    $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    runs: [{
      tool: { driver: { name: 'dsh-sast', informationUri: 'https://github.com/tangxiaofeng7/dsh-sast', rules: [...rulesById.values()] } },
      results,
      ...(provenance !== undefined ? { versionControlProvenance: [provenance] } : {}),
    }],
  }
}
