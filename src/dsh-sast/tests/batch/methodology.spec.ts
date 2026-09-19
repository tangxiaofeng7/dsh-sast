/**
 * @module
 */

import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { pinMethodologies, type MethodologyResolver, type ResolvedMethodologySkill } from '../../src/batch/methodology.ts'

function skillFixture(overrides: Partial<ResolvedMethodologySkill> = {}): ResolvedMethodologySkill {
  return {
    name: 'pay-callback',
    description: '审计支付回调的验签、金额一致性与重放防护',
    source: 'project-dsh',
    provider: 'dsh',
    invocation: { modelInvocable: true },
    content: '# 支付回调审计方法论\n\n1. 验签是否可绕过\n2. 金额是否可篡改\n',
    metadata: {
      sast: {
        displayName: '支付回调安全清单',
        category: 'taint',
        checks: [
          { id: 'sign-verify', title: '回调验签是否可绕过', scope: ['src/pay/**'] },
        ],
      },
    },
    ...overrides,
  }
}

/** A resolver backed by a fixed map, standing in for `ctx.skills.get()` — never reads the cloned workspace (no cwd parameter exists on the interface at all). */
function resolverOf(skills: Readonly<Record<string, ResolvedMethodologySkill | undefined>>): MethodologyResolver {
  return { resolve: async (name) => skills[name] }
}

let root: string

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'sast-methodology-'))
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

describe('pinMethodologies', () => {
  it('resolves a named methodology into a manifestDigest, a contentDigest, and a durable content artifact', async () => {
    const resolver = resolverOf({ 'pay-callback': skillFixture() })
    const [pinned] = await pinMethodologies(resolver, ['pay-callback'], { root, sessionId: 's1', batchId: 'batch-1' })
    expect(pinned.methodology.name).toBe('pay-callback')
    expect(pinned.methodology.manifestDigest).toMatch(/^[0-9a-f]{64}$/)
    expect(pinned.methodology.contentDigest).toMatch(/^[0-9a-f]{64}$/)
    const onDisk = readFileSync(fileURLToPath(pinned.artifact.uri), 'utf8')
    expect(onDisk).toBe(skillFixture().content)
  })

  it('produces the same contentDigest for the same body and a different one for a different body', async () => {
    const resolver = resolverOf({
      a: skillFixture({ name: 'a', content: 'same body' }),
      b: skillFixture({ name: 'b', content: 'same body' }),
      c: skillFixture({ name: 'c', content: 'different body' }),
    })
    const [pinnedA, pinnedB, pinnedC] = await pinMethodologies(resolver, ['a', 'b', 'c'], { root, sessionId: 's1', batchId: 'batch-1' })
    expect(pinnedA.methodology.contentDigest).toBe(pinnedB.methodology.contentDigest)
    expect(pinnedA.methodology.contentDigest).not.toBe(pinnedC.methodology.contentDigest)
  })

  it('throws (all-or-nothing) when any named methodology cannot be resolved, naming it', async () => {
    const resolver = resolverOf({ 'pay-callback': skillFixture() })
    await expect(pinMethodologies(resolver, ['pay-callback', 'ghost'], { root, sessionId: 's1', batchId: 'batch-1' }))
      .rejects.toThrow(/ghost/)
  })

  it('throws when a resolved methodology fails manifest validation (propagated from parseSkillManifest)', async () => {
    const resolver = resolverOf({ broken: skillFixture({ name: 'broken', metadata: { sast: { checks: [] } } }) })
    await expect(pinMethodologies(resolver, ['broken'], { root, sessionId: 's1', batchId: 'batch-1' }))
      .rejects.toThrow(/checks/)
  })

  it('a resolver that has changed since an earlier pin produces a different digest for a NEW pin (the earlier batch\'s already-computed digest is a value, not a live reference)', async () => {
    const resolver = resolverOf({ 'pay-callback': skillFixture() })
    const [first] = await pinMethodologies(resolver, ['pay-callback'], { root, sessionId: 's1', batchId: 'batch-1' })
    // Simulate the source Skill changing on disk after batch-1 pinned it.
    // A second, independent batch's own pin call sees the new content —
    // but that is a NEW pin for a NEW batch, not a mutation of batch-1's
    // already-fixed digest (A22: batch-1's own row, once written by
    // BatchStore, never re-resolves this Skill again for its own jobs).
    const changedResolver = resolverOf({ 'pay-callback': skillFixture({ content: '# edited later\n' }) })
    const [second] = await pinMethodologies(changedResolver, ['pay-callback'], { root, sessionId: 's2', batchId: 'batch-2' })
    expect(first.methodology.contentDigest).not.toBe(second.methodology.contentDigest)
  })

  it('writes each named methodology to a distinct path within the same batch (no filename collision)', async () => {
    const resolver = resolverOf({
      a: skillFixture({ name: 'a', content: 'a-body' }),
      b: skillFixture({ name: 'b', content: 'b-body' }),
    })
    const [pinnedA, pinnedB] = await pinMethodologies(resolver, ['a', 'b'], { root, sessionId: 's1', batchId: 'batch-1' })
    expect(pinnedA.artifact.uri).not.toBe(pinnedB.artifact.uri)
  })
})
