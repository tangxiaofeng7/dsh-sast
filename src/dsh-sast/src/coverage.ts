/**
 * Two-dimensional coverage derivation (`sast_coverage`, ADR-14): file coverage
 * measures breadth (how much of the repo has been examined), check coverage
 * measures methodology commitment and progress. Pure over one session's
 * domain snapshot — no filesystem access, so it can be unit tested without a
 * store or workspace fixture.
 * @module @tangxiaofeng7/dsh-sast-host/src/coverage
 */

import type {
  SastAsset,
  SastFact,
  SastFinding,
  SastIntent,
  SastScan,
  SastSkill,
  SastSkillSourceGroup,
} from './spec.ts'

/** Derived progress state of one methodology check (never stored, always recomputed). */
export type CheckState = 'todo' | 'planned' | 'running' | 'done' | 'blocked'

export interface CoverageCheckEntry {
  readonly checkId: string
  readonly title: string
  readonly state: CheckState
  readonly findings: string[]
}

export interface CoverageSkillEntry {
  readonly skillId: string
  readonly name: string
  readonly source: string
  readonly sourceGroup: SastSkillSourceGroup
  readonly enabled: boolean
  readonly total: number
  readonly covered: number
  readonly completed: number
  readonly blocked: number
  readonly running: number
  readonly planned: number
  readonly todo: number
  readonly checks: CoverageCheckEntry[]
}

export interface CoverageChecks {
  readonly total: number
  readonly covered: number
  readonly coverageRatio: number
  readonly completed: number
  readonly completionRatio: number
  readonly blocked: number
  readonly running: number
  readonly planned: number
  readonly todo: number
  readonly skills: CoverageSkillEntry[]
}

export interface CoverageFileModule {
  readonly path: string
  readonly inScope: number
  readonly touched: number
  readonly findings: number
}

export interface CoverageFiles {
  readonly inScope: number
  readonly touched: number
  readonly ratio: number
  readonly modules: CoverageFileModule[]
  readonly untouchedHotspots: string[]
}

export interface CoverageView {
  readonly files: CoverageFiles
  readonly checks: CoverageChecks
  readonly incidentalFindings: string[]
}

/** Snapshot of one session's domain rows, as read from the store. */
export interface CoverageInput {
  readonly scan: SastScan | undefined
  readonly skills: readonly SastSkill[]
  readonly intents: readonly SastIntent[]
  readonly facts: readonly SastFact[]
  readonly findings: readonly SastFinding[]
  readonly assets: readonly SastAsset[]
}

const EMPTY_CHECKS: CoverageChecks = {
  total: 0, covered: 0, coverageRatio: 0, completed: 0, completionRatio: 0,
  blocked: 0, running: 0, planned: 0, todo: 0, skills: [],
}

/** State of one check: no intent → todo; pending → planned; else the intent's own status. */
function deriveCheckState(intent: SastIntent | undefined): CheckState {
  if (intent === undefined) return 'todo'
  if (intent.status === 'pending') return 'planned'
  return intent.status
}

function ratioOf(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator
}

export function coverageOf(input: CoverageInput): CoverageView {
  const { scan, skills, intents, facts, findings, assets } = input

  const intentBySkillCheck = new Map<string, SastIntent>()
  for (const intent of intents) {
    if (intent.skillId === undefined || intent.checkId === undefined) continue
    intentBySkillCheck.set(`${intent.skillId}:${intent.checkId}`, intent)
  }
  const findingsBySkillCheck = new Map<string, string[]>()
  const incidentalFindings: string[] = []
  for (const finding of findings) {
    if (finding.skillId === undefined || finding.checkId === undefined) {
      incidentalFindings.push(finding.id)
      continue
    }
    const key = `${finding.skillId}:${finding.checkId}`
    const list = findingsBySkillCheck.get(key) ?? []
    list.push(finding.id)
    findingsBySkillCheck.set(key, list)
  }

  const skillEntries: CoverageSkillEntry[] = skills.map(skill => {
    const checkEntries: CoverageCheckEntry[] = skill.checks.map(check => {
      const key = `${skill.id}:${check.id}`
      const state = deriveCheckState(intentBySkillCheck.get(key))
      return { checkId: check.id, title: check.title, state, findings: findingsBySkillCheck.get(key) ?? [] }
    })
    return {
      skillId: skill.id,
      name: skill.title,
      source: skill.source,
      sourceGroup: skill.sourceGroup,
      enabled: skill.enabled,
      total: checkEntries.length,
      covered: checkEntries.filter(c => c.state !== 'todo').length,
      completed: checkEntries.filter(c => c.state === 'done').length,
      blocked: checkEntries.filter(c => c.state === 'blocked').length,
      running: checkEntries.filter(c => c.state === 'running').length,
      planned: checkEntries.filter(c => c.state === 'planned').length,
      todo: checkEntries.filter(c => c.state === 'todo').length,
      checks: checkEntries,
    }
  })

  const activeSkillEntries = skillEntries.filter(entry => entry.enabled)
  const checks: CoverageChecks = activeSkillEntries.length === 0 && skillEntries.length === 0
    ? EMPTY_CHECKS
    : {
      total: activeSkillEntries.reduce((sum, s) => sum + s.total, 0),
      covered: activeSkillEntries.reduce((sum, s) => sum + s.covered, 0),
      coverageRatio: ratioOf(
        activeSkillEntries.reduce((sum, s) => sum + s.covered, 0),
        activeSkillEntries.reduce((sum, s) => sum + s.total, 0),
      ),
      completed: activeSkillEntries.reduce((sum, s) => sum + s.completed, 0),
      completionRatio: ratioOf(
        activeSkillEntries.reduce((sum, s) => sum + s.completed, 0),
        activeSkillEntries.reduce((sum, s) => sum + s.total, 0),
      ),
      blocked: activeSkillEntries.reduce((sum, s) => sum + s.blocked, 0),
      running: activeSkillEntries.reduce((sum, s) => sum + s.running, 0),
      planned: activeSkillEntries.reduce((sum, s) => sum + s.planned, 0),
      todo: activeSkillEntries.reduce((sum, s) => sum + s.todo, 0),
      skills: skillEntries,
    }

  const touchedPaths = new Set<string>()
  for (const fact of facts) touchedPaths.add(fact.path)
  for (const finding of findings) for (const hop of finding.codePath) touchedPaths.add(hop.path)

  const findingCountByPath = new Map<string, number>()
  for (const finding of findings) {
    for (const hop of finding.codePath) {
      findingCountByPath.set(hop.path, (findingCountByPath.get(hop.path) ?? 0) + 1)
    }
  }

  const fileAssets = assets.filter(asset => asset.type === 'file')
  const moduleAssets = assets.filter(asset => asset.type === 'module')

  const modules: CoverageFileModule[] = moduleAssets.map(module => {
    const children = fileAssets.filter(file => file.value.startsWith(`${module.value}/`))
    const touched = children.filter(file => touchedPaths.has(file.value))
    const findingsCount = children.reduce((sum, file) => sum + (findingCountByPath.get(file.value) ?? 0), 0)
    return { path: module.value, inScope: children.length, touched: touched.length, findings: findingsCount }
  })

  const untouchedHotspots = fileAssets.filter(file => !touchedPaths.has(file.value)).map(file => file.value)
  // fileCount defaults to 0 until ingest populates it (ADR-14); a real scan
  // with recorded file assets but fileCount still 0 means "not yet known",
  // not "zero files in scope", so fall back to the asset count in that case.
  const inScope = scan?.fileCount || fileAssets.length
  const touched = touchedPaths.size

  return {
    files: { inScope, touched, ratio: ratioOf(touched, inScope), modules, untouchedHotspots },
    checks,
    incidentalFindings,
  }
}
