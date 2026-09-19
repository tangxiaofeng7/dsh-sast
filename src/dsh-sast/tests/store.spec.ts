/**
 * Direct coverage of `SastStore` methods not otherwise exercised through the
 * `sast_*` tools: Skill registration/enablement, the injected clock on
 * intent timestamps, and the skill/check cross-reference rules
 * `sast_add_intent`/`sast_add_finding` delegate to. Constructs `SastStore`
 * directly over a minimal Cordis context (Storage + DomainFacility, no
 * ToolRuntime/SystemPrompt/Sast plugin) so the clock can be swapped for a
 * deterministic one.
 * @module
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import { SastStore } from '../src/store.ts'
import type { SkillRegistrationInput } from '../src/store.ts'
import { MemoryStorageBackend } from './memory-backend.ts'

const SESSION_ID = 'session-a'

async function storeBench(now: () => number = () => Date.now()): Promise<{ store: SastStore; ctx: Context }> {
  const ctx = new Context()
  await ctx.plugin(Storage)
  ctx.storage.backend.register('memory', new MemoryStorageBackend())
  const facility = new DomainFacility(ctx, { backend: 'memory', routes: {} })
  ctx.storage.mount('domain', facility)
  ctx.provide('storageDomain', facility)
  return { store: new SastStore(ctx, now), ctx }
}

let workspacePath: string

beforeEach(() => {
  workspacePath = mkdtempSync(join(tmpdir(), 'sast-store-'))
  mkdirSync(join(workspacePath, 'src'), { recursive: true })
  writeFileSync(join(workspacePath, 'src', 'db.ts'), 'line1\nline2\n')
})

afterEach(() => {
  rmSync(workspacePath, { recursive: true, force: true })
})

function skillInput(overrides: Partial<SkillRegistrationInput> = {}): SkillRegistrationInput {
  return {
    id: 'sqli',
    title: 'SQL Injection',
    source: 'project-dsh',
    sourceGroup: 'workspace',
    provider: 'dsh',
    category: 'custom',
    applicability: { languages: [], frameworks: [], paths: [] },
    checks: [{ id: 'check-1', title: 'raw queries', scope: [] }],
    enabled: true,
    manifestDigest: 'digest-1',
    ...overrides,
  }
}

async function scan(store: SastStore, sessionId = SESSION_ID) {
  return store.initScan(sessionId, {
    provider: 'local', repoUrl: workspacePath, branch: '', commit: '', workspacePath,
    objective: 'o', scope: [], authorization: '', languages: [], fileCount: 0,
  })
}

describe('SastStore.registerSkill', () => {
  it('registers a new skill and rejects a skill with zero or duplicate check ids', async () => {
    const { store } = await storeBench()
    await scan(store)
    const skill = await store.registerSkill(SESSION_ID, skillInput())
    expect(skill).toMatchObject({ id: 'sqli', title: 'SQL Injection', enabled: true, checks: [{ id: 'check-1', title: 'raw queries', scope: [] }] })
    await expect(store.registerSkill(SESSION_ID, skillInput({ checks: [] })))
      .rejects.toThrow(/must declare between 1 and/)
    await expect(store.registerSkill(SESSION_ID, skillInput({
      checks: [{ id: 'c1', title: 'a', scope: [] }, { id: 'c1', title: 'b', scope: [] }],
    }))).rejects.toThrow(/duplicate check id/)
  })

  it('rejects registration before a scan exists', async () => {
    const { store } = await storeBench()
    await expect(store.registerSkill(SESSION_ID, skillInput())).rejects.toThrow(/not initialized/)
  })

  it('is idempotent for the same name and digest', async () => {
    const { store } = await storeBench()
    await scan(store)
    const first = await store.registerSkill(SESSION_ID, skillInput())
    const second = await store.registerSkill(SESSION_ID, skillInput())
    expect(second).toEqual(first)
  })

  it('replaces atomically when the digest changes and no intent references it yet', async () => {
    const { store } = await storeBench()
    await scan(store)
    await store.registerSkill(SESSION_ID, skillInput())
    const replaced = await store.registerSkill(SESSION_ID, skillInput({ manifestDigest: 'digest-2', title: 'SQLi v2' }))
    expect(replaced).toMatchObject({ manifestDigest: 'digest-2', title: 'SQLi v2' })
  })

  it('hard-fails a digest change once an intent references the skill', async () => {
    const { store } = await storeBench()
    const initedScan = await scan(store)
    await store.registerSkill(SESSION_ID, skillInput())
    await store.addIntent(SESSION_ID, {
      title: 'check raw queries', detail: '', category: 'custom', scope: [],
      skillId: 'sqli', checkId: 'check-1', scanId: initedScan.id,
    })
    await expect(store.registerSkill(SESSION_ID, skillInput({ manifestDigest: 'digest-2' })))
      .rejects.toThrow(/already referenced by an intent/)
  })

  it('enforces per-skill, per-session, and total-checks capacity guardrails', async () => {
    const { store } = await storeBench()
    await scan(store)
    const manyChecks = Array.from({ length: 257 }, (_, i) => ({ id: `c${i}`, title: `t${i}`, scope: [] }))
    await expect(store.registerSkill(SESSION_ID, skillInput({ checks: manyChecks })))
      .rejects.toThrow(/must declare between 1 and 256/)
    for (let i = 0; i < 64; i++) {
      await store.registerSkill(SESSION_ID, skillInput({ id: `skill-${i}`, manifestDigest: `d${i}` }))
    }
    await expect(store.registerSkill(SESSION_ID, skillInput({ id: 'skill-65', manifestDigest: 'd65' })))
      .rejects.toThrow(/already has 64 registered skills/)
  })
})

describe('SastStore.setSkillEnabled', () => {
  it('toggles enabled without deleting the snapshot, checks, or referencing intents', async () => {
    const { store } = await storeBench()
    const initedScan = await scan(store)
    await store.registerSkill(SESSION_ID, skillInput())
    await store.addIntent(SESSION_ID, {
      title: 'check raw queries', detail: '', category: 'custom', scope: [],
      skillId: 'sqli', checkId: 'check-1', scanId: initedScan.id,
    })
    const disabled = await store.setSkillEnabled(SESSION_ID, 'sqli', false)
    expect(disabled.enabled).toBe(false)
    const enabled = await store.setSkillEnabled(SESSION_ID, 'sqli', true)
    expect(enabled.checks).toEqual([{ id: 'check-1', title: 'raw queries', scope: [] }])
  })

  it('rejects an unknown skill', async () => {
    const { store } = await storeBench()
    await scan(store)
    await expect(store.setSkillEnabled(SESSION_ID, 'ghost', false)).rejects.toThrow(/unknown skill ghost/)
  })
})

describe('SastStore.addIntent skill/check cross-reference', () => {
  it('rejects an intent against a disabled skill, an unknown check, or a check already claimed', async () => {
    const { store } = await storeBench()
    const initedScan = await scan(store)
    await store.registerSkill(SESSION_ID, skillInput())
    await store.setSkillEnabled(SESSION_ID, 'sqli', false)
    await expect(store.addIntent(SESSION_ID, {
      title: 'x', detail: '', category: 'custom', scope: [], skillId: 'sqli', checkId: 'check-1', scanId: initedScan.id,
    })).rejects.toThrow(/is disabled/)
    await store.setSkillEnabled(SESSION_ID, 'sqli', true)
    await expect(store.addIntent(SESSION_ID, {
      title: 'x', detail: '', category: 'custom', scope: [], skillId: 'sqli', checkId: 'ghost-check', scanId: initedScan.id,
    })).rejects.toThrow(/unknown check ghost-check/)
    await store.addIntent(SESSION_ID, {
      title: 'first claim', detail: '', category: 'custom', scope: [], skillId: 'sqli', checkId: 'check-1', scanId: initedScan.id,
    })
    await expect(store.addIntent(SESSION_ID, {
      title: 'second claim', detail: '', category: 'custom', scope: [], skillId: 'sqli', checkId: 'check-1', scanId: initedScan.id,
    })).rejects.toThrow(/already has an intent/)
  })
})

describe('SastStore.updateIntent injected clock', () => {
  it('writes startedAt on entering running and endedAt on entering a terminal state, from the injected clock only', async () => {
    let clock = 1000
    const { store } = await storeBench(() => clock)
    const initedScan = await scan(store)
    const created = await store.addIntent(SESSION_ID, { title: 'a', detail: '', category: 'custom', scope: [], scanId: initedScan.id })
    clock = 2000
    const running = await store.updateIntent(SESSION_ID, created.nodeId, { status: 'running' })
    expect(running).toMatchObject({ startedAt: 2000 })
    expect(running.endedAt).toBeUndefined()
    clock = 3000
    const done = await store.updateIntent(SESSION_ID, created.nodeId, { status: 'done' })
    expect(done).toMatchObject({ startedAt: 2000, endedAt: 3000 })
  })

  it('does not overwrite an already-set startedAt/endedAt on a later transition', async () => {
    let clock = 1000
    const { store } = await storeBench(() => clock)
    const initedScan = await scan(store)
    const created = await store.addIntent(SESSION_ID, { title: 'a', detail: '', category: 'custom', scope: [], scanId: initedScan.id })
    await store.updateIntent(SESSION_ID, created.nodeId, { status: 'running' })
    clock = 5000
    const blocked = await store.updateIntent(SESSION_ID, created.nodeId, { status: 'blocked' })
    expect(blocked.startedAt).toBe(1000)
    expect(blocked.endedAt).toBe(5000)
  })
})
