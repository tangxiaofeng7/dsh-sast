/**
 * @module
 */

import { describe, expect, it } from 'vitest'
import { parseSkillManifest } from '../src/skill-manifest.ts'
import type { ResolvedSkillLike } from '../src/skill-manifest.ts'

function skillFixture(overrides: Partial<ResolvedSkillLike> = {}): ResolvedSkillLike {
  return {
    name: 'pay-callback',
    description: '审计支付回调的验签、金额一致性与重放防护',
    source: 'project-dsh',
    provider: 'dsh',
    invocation: { modelInvocable: true },
    metadata: {
      sast: {
        displayName: '支付回调安全清单',
        category: 'taint',
        languages: ['java'],
        frameworks: ['spring-boot'],
        paths: ['src/pay/**'],
        checks: [
          { id: 'sign-verify', title: '回调验签是否可绕过', scope: ['src/pay/**'] },
          { id: 'amount-tamper', title: '金额篡改与入账幂等', scope: ['src/pay/**'] },
        ],
      },
    },
    ...overrides,
  }
}

describe('parseSkillManifest', () => {
  it('parses a well-formed manifest into a store-ready registration input', () => {
    const input = parseSkillManifest(skillFixture())
    expect(input).toMatchObject({
      id: 'pay-callback',
      title: '支付回调安全清单',
      source: 'project-dsh',
      sourceGroup: 'workspace',
      provider: 'dsh',
      category: 'taint',
      applicability: { languages: ['java'], frameworks: ['spring-boot'], paths: ['src/pay/**'] },
      checks: [
        { id: 'sign-verify', title: '回调验签是否可绕过', scope: ['src/pay/**'] },
        { id: 'amount-tamper', title: '金额篡改与入账幂等', scope: ['src/pay/**'] },
      ],
      enabled: true,
    })
    expect(input.manifestDigest).toMatch(/^[0-9a-f]{64}$/)
  })

  it('maps source to the correct trust group: bundled -> builtin, project-* -> workspace, else user', () => {
    expect(parseSkillManifest(skillFixture({ source: 'bundled' })).sourceGroup).toBe('builtin')
    expect(parseSkillManifest(skillFixture({ source: 'project-agents' })).sourceGroup).toBe('workspace')
    expect(parseSkillManifest(skillFixture({ source: 'user-dsh' })).sourceGroup).toBe('user')
    expect(parseSkillManifest(skillFixture({ source: 'custom' })).sourceGroup).toBe('user')
  })

  it('falls back category to custom when omitted, and title to the Skill description when displayName is absent', () => {
    const skill = skillFixture()
    delete (skill.metadata!.sast as Record<string, unknown>).category
    delete (skill.metadata!.sast as Record<string, unknown>).displayName
    const input = parseSkillManifest(skill)
    expect(input.category).toBe('custom')
    expect(input.title).toBe(skill.description)
  })

  it('rejects a Skill that is not model-invocable', () => {
    expect(() => parseSkillManifest(skillFixture({ invocation: { modelInvocable: false } })))
      .toThrow(/not model-invocable/)
  })

  it('rejects a non-kebab-case Skill name', () => {
    expect(() => parseSkillManifest(skillFixture({ name: 'PayCallback' })))
      .toThrow(/must be kebab-case/)
  })

  it('rejects a missing metadata.sast namespace', () => {
    expect(() => parseSkillManifest(skillFixture({ metadata: {} })))
      .toThrow(/metadata\.sast is missing/)
  })

  it('rejects an invalid category', () => {
    const skill = skillFixture()
    ;(skill.metadata!.sast as Record<string, unknown>).category = 'not-a-real-category'
    expect(() => parseSkillManifest(skill)).toThrow(/category must be one of/)
  })

  it('rejects zero checks', () => {
    const skill = skillFixture()
    ;(skill.metadata!.sast as Record<string, unknown>).checks = []
    expect(() => parseSkillManifest(skill)).toThrow(/non-empty array/)
  })

  it('rejects more than 256 checks', () => {
    const skill = skillFixture()
    ;(skill.metadata!.sast as Record<string, unknown>).checks = Array.from({ length: 257 }, (_, i) => ({ id: `c${i}`, title: `t${i}` }))
    expect(() => parseSkillManifest(skill)).toThrow(/at most 256 checks/)
  })

  it('rejects a duplicate check id', () => {
    const skill = skillFixture()
    ;(skill.metadata!.sast as Record<string, unknown>).checks = [
      { id: 'c1', title: 'a' },
      { id: 'c1', title: 'b' },
    ]
    expect(() => parseSkillManifest(skill)).toThrow(/duplicate check id c1/)
  })

  it('rejects a check with a non-kebab-case id, or a missing/empty title', () => {
    const badId = skillFixture()
    ;(badId.metadata!.sast as Record<string, unknown>).checks = [{ id: 'Bad_Id', title: 'x' }]
    expect(() => parseSkillManifest(badId)).toThrow(/checks\[0\]\.id must be a kebab-case string/)

    const noTitle = skillFixture()
    ;(noTitle.metadata!.sast as Record<string, unknown>).checks = [{ id: 'c1', title: '' }]
    expect(() => parseSkillManifest(noTitle)).toThrow(/checks\[0\]\.title must be a non-empty string/)
  })

  it('defaults a check\'s scope to an empty array when omitted', () => {
    const skill = skillFixture()
    ;(skill.metadata!.sast as Record<string, unknown>).checks = [{ id: 'c1', title: 'a' }]
    const input = parseSkillManifest(skill)
    expect(input.checks[0]).toEqual({ id: 'c1', title: 'a', scope: [] })
  })

  it('never stores the prose body, absolute path, or resourceBase — only what checkOf/applicability extract', () => {
    const input = parseSkillManifest(skillFixture())
    expect(input).not.toHaveProperty('content')
    expect(input).not.toHaveProperty('path')
    expect(input).not.toHaveProperty('resourceBase')
  })

  it('produces the same digest for the same checks/category/name regardless of check order or unrelated body text', () => {
    const a = skillFixture()
    const b = skillFixture()
    ;(b.metadata!.sast as Record<string, unknown>).checks = [
      { id: 'amount-tamper', title: '金额篡改与入账幂等', scope: ['src/pay/**'] },
      { id: 'sign-verify', title: '回调验签是否可绕过', scope: ['src/pay/**'] },
    ]
    expect(parseSkillManifest(a).manifestDigest).toBe(parseSkillManifest(b).manifestDigest)
  })

  it('produces a different digest when the check set actually changes', () => {
    const a = parseSkillManifest(skillFixture())
    const skill = skillFixture()
    ;(skill.metadata!.sast as Record<string, unknown>).checks = [{ id: 'sign-verify', title: '回调验签是否可绕过', scope: [] }]
    const b = parseSkillManifest(skill)
    expect(a.manifestDigest).not.toBe(b.manifestDigest)
  })
})
