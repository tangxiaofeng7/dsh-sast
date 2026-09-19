/**
 * Trusted parsing/validation of a registered audit-methodology Skill's
 * `metadata.sast` frontmatter into `SkillRegistrationInput` (§5.1). Pure —
 * no filesystem or `ctx.skills` access, so it can be unit tested against a
 * fixture `SkillDefinition`-shaped object alone. The store (registerSkill)
 * still enforces the check-count/id-uniqueness invariants at the durable
 * boundary; this module's job is turning an untrusted `metadata` blob into
 * the store's typed input or a guiding rejection — it never partially
 * accepts a malformed manifest.
 * @module @tangxiaofeng7/dsh-sast-host/src/skill-manifest
 */

import { createHash } from 'node:crypto'
import type { SastIntentCategory, SastSkillCheck, SastSkillSourceGroup } from './spec.ts'
import type { SkillRegistrationInput } from './store.ts'

const KEBAB_CASE_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/
const MAX_CHECKS = 256
const INTENT_CATEGORIES = new Set<SastIntentCategory>(['recon', 'attack-surface', 'taint', 'config', 'dependency', 'verify', 'custom'])

/** The minimal shape this module reads off a resolved Skill definition (a subset of `@deepseek-ai/dsh-skill`'s `SkillDefinition`). */
export interface ResolvedSkillLike {
  readonly name: string
  readonly title?: string
  readonly description: string
  readonly source: string
  readonly provider: string
  readonly invocation: { readonly modelInvocable: boolean }
  readonly metadata?: Readonly<Record<string, unknown>>
}

/** Map a raw DSH `SkillSource` value to the SAST-domain trust bucket (§5.2). */
function sourceGroupOf(source: string): SastSkillSourceGroup {
  if (source === 'bundled') return 'builtin'
  if (source === 'project-dsh' || source === 'project-agents') return 'workspace'
  return 'user'
}

function fail(name: string, reason: string): never {
  throw new Error(`sast: skill ${name} has an invalid metadata.sast manifest: ${reason}`)
}

/** Validate one raw check entry from `metadata.sast.checks`. */
function checkOf(name: string, raw: unknown, index: number): SastSkillCheck {
  if (raw === null || typeof raw !== 'object') fail(name, `checks[${index}] must be an object`)
  const entry = raw as Record<string, unknown>
  if (typeof entry.id !== 'string' || !KEBAB_CASE_RE.test(entry.id)) fail(name, `checks[${index}].id must be a kebab-case string`)
  if (typeof entry.title !== 'string' || entry.title === '') fail(name, `checks[${index}].title must be a non-empty string`)
  const scope = entry.scope === undefined ? [] : entry.scope
  if (!Array.isArray(scope) || !scope.every(s => typeof s === 'string')) fail(name, `checks[${index}].scope must be an array of strings`)
  return { id: entry.id, title: entry.title, scope }
}

/**
 * Parse and strictly validate one resolved Skill's `metadata.sast` into a
 * `SkillRegistrationInput` the store can register, plus a stable
 * `manifestDigest` (sha256 of the normalized checks + name + category) so
 * an unrelated body/whitespace edit does not change the digest but a real
 * check-set change does. Throws with an actionable message on any
 * malformation — never a partial/best-effort registration.
 */
export function parseSkillManifest(skill: ResolvedSkillLike): SkillRegistrationInput {
  if (!skill.invocation.modelInvocable) {
    fail(skill.name, 'the resolved Skill is not model-invocable (invocation.modelInvocable is false)')
  }
  if (!KEBAB_CASE_RE.test(skill.name)) fail(skill.name, 'the Skill name itself must be kebab-case')
  const metadata = skill.metadata
  const sast = metadata?.sast
  if (sast === null || typeof sast !== 'object') fail(skill.name, 'metadata.sast is missing or not an object')
  const raw = sast as Record<string, unknown>

  const category = raw.category === undefined ? 'custom' : raw.category
  if (typeof category !== 'string' || !INTENT_CATEGORIES.has(category as SastIntentCategory)) {
    fail(skill.name, `metadata.sast.category must be one of: ${[...INTENT_CATEGORIES].join(', ')}`)
  }

  const rawChecks = raw.checks
  if (!Array.isArray(rawChecks) || rawChecks.length === 0) fail(skill.name, 'metadata.sast.checks must be a non-empty array')
  if (rawChecks.length > MAX_CHECKS) fail(skill.name, `metadata.sast.checks must declare at most ${MAX_CHECKS} checks`)
  const checks = rawChecks.map((check, index) => checkOf(skill.name, check, index))
  const seenIds = new Set<string>()
  for (const check of checks) {
    if (seenIds.has(check.id)) fail(skill.name, `duplicate check id ${check.id}`)
    seenIds.add(check.id)
  }

  const languages = Array.isArray(raw.languages) && raw.languages.every(l => typeof l === 'string') ? raw.languages : []
  const frameworks = Array.isArray(raw.frameworks) && raw.frameworks.every(f => typeof f === 'string') ? raw.frameworks : []
  const paths = Array.isArray(raw.paths) && raw.paths.every(p => typeof p === 'string') ? raw.paths : []

  // Digest covers only the machine-checked truth (name, category, checks
  // sorted by id) — never the prose body, absolute path, or resourceBase
  // (those are never stored, per §5.1's "不保存正文、绝对 path 或 resourceBase").
  const digestInput = JSON.stringify({
    name: skill.name,
    category,
    checks: [...checks].sort((a, b) => a.id.localeCompare(b.id)),
  })
  const manifestDigest = createHash('sha256').update(digestInput).digest('hex')

  return {
    id: skill.name,
    title: typeof raw.displayName === 'string' && raw.displayName !== '' ? raw.displayName : skill.description,
    source: skill.source,
    sourceGroup: sourceGroupOf(skill.source),
    provider: skill.provider,
    category: category as SastIntentCategory,
    applicability: { languages, frameworks, paths },
    checks,
    enabled: true,
    manifestDigest,
  }
}
