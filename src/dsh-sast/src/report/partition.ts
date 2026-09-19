/**
 * Triage-status partitioning shared by both report builders (markdown.ts,
 * sarif.ts): a `false-positive` triage moves a finding out of the "active"
 * report body into the excluded/suppressed section, but the record itself
 * is NEVER deleted or dropped from either report — the original conclusion
 * stays fully auditable (ADR-09). `wont-fix` and `confirmed` findings are
 * real, active vulnerabilities and stay in the main body.
 * @module @tangxiaofeng7/dsh-sast-host/src/report/partition
 */

import type { SastFinding } from '../spec.ts'

export interface FindingPartition {
  readonly active: readonly SastFinding[]
  readonly excluded: readonly SastFinding[]
}

/** Split findings into the active report body vs. the false-positive-excluded set. */
export function partitionByTriage(findings: readonly SastFinding[]): FindingPartition {
  const active: SastFinding[] = []
  const excluded: SastFinding[] = []
  for (const finding of findings) {
    (finding.status === 'false-positive' ? excluded : active).push(finding)
  }
  return { active, excluded }
}
