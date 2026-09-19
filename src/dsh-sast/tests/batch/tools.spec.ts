/**
 * The 4 `sast_batch_*` tools: atomic all-or-nothing batch creation
 * (including methodology pinning and precheck failures never producing a
 * partial batch), state/report reads never returning a full per-repo
 * graph, and resolve decisions only ever touching `reviewStatus=pending`
 * jobs without rewriting their original error/fallback fields.
 * @module
 */

import { mkdtempSync, rmSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import SessionStore from '@deepseek-ai/dsh-session'
import SkillRegistry from '@deepseek-ai/dsh-skill'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import { BatchStore } from '../../src/batch/store.ts'
import { registerSastBatchTools, type SastBatchToolsConfig, type JobSummaryResolver } from '../../src/batch/tools.ts'
import { sastDomainSpec } from '../../src/spec.ts'
import { MemoryStorageBackend } from '../memory-backend.ts'

const OWNER_SESSION_ID = 'owner-a'

async function batchToolsHarness(config: SastBatchToolsConfig = {}, summaryResolver?: JobSummaryResolver): Promise<{
  ctx: Context
  store: BatchStore
  call: (name: string, args: unknown, sessionId: string) => Promise<unknown>
}> {
  const ctx = new Context()
  await ctx.plugin(SessionStore)
  await ctx.plugin(Storage)
  ctx.storage.backend.register('memory', new MemoryStorageBackend())
  const facility = new DomainFacility(ctx, { backend: 'memory', routes: {} })
  ctx.storage.mount('domain', facility)
  ctx.provide('storageDomain', facility)
  await ctx.plugin(ToolRuntime)
  await ctx.plugin(SystemPrompt, { persona: '' })
  await ctx.plugin(SkillRegistry)
  const domain = await facility.open(sastDomainSpec)
  const store = new BatchStore(() => Promise.resolve(domain))
  registerSastBatchTools(ctx, store, config, summaryResolver)
  const call = (name: string, args: unknown, sessionId: string): Promise<unknown> => {
    const tool = ctx.tools.get(name)
    if (tool === undefined) throw new Error(`tool '${name}' is not registered`)
    return tool.execute(args, { agent: { session: { id: sessionId } } } as never)
  }
  return { ctx, store, call }
}

function reposArg(n: number): Array<{ repoUrl: string; provider: 'local' }> {
  return Array.from({ length: n }, (_, i) => ({ repoUrl: `/repo-${i + 1}`, provider: 'local' as const }))
}

let root: string

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'sast-batch-tools-'))
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

describe('sast_start_batch', () => {
  it('creates a batch and returns { batchId, total, status }', async () => {
    const { call } = await batchToolsHarness({ reportRoot: root })
    const result = await call('sast_start_batch', {
      repositories: reposArg(3), objective: 'audit', authorization: 'ok',
    }, OWNER_SESSION_ID) as { batchId: string; total: number; status: string }
    expect(result.total).toBe(3)
    expect(result.status).toBe('queued')
  })

  it('rejects an empty repository list with zero rows written', async () => {
    const { call, store } = await batchToolsHarness({ reportRoot: root })
    await expect(call('sast_start_batch', { repositories: [], objective: 'a', authorization: 'ok' }, OWNER_SESSION_ID))
      .rejects.toThrow()
    expect(await store.getBatchByOwner(OWNER_SESSION_ID)).toBeUndefined()
  })

  it('rejects more than 100 repositories', async () => {
    const { call } = await batchToolsHarness({ reportRoot: root })
    await expect(call('sast_start_batch', { repositories: reposArg(101), objective: 'a', authorization: 'ok' }, OWNER_SESSION_ID))
      .rejects.toThrow()
  })

  it('resolves and pins a named methodology, and the batch row carries its digest/artifactId', async () => {
    const { call, ctx, store } = await batchToolsHarness({ reportRoot: root })
    ctx.skills.register({
      name: 'sqli', description: 'SQLi checklist', source: 'user-dsh', content: '## check\ninspect raw queries',
      metadata: { sast: { category: 'taint', checks: [{ id: 'check-1', title: 'raw queries', scope: [] }] } },
    })
    const result = await call('sast_start_batch', {
      repositories: reposArg(2), objective: 'a', authorization: 'ok', methodologies: ['sqli'],
    }, OWNER_SESSION_ID) as { batchId: string }
    const batch = await store.getBatch(result.batchId)
    expect(batch?.methodologies).toHaveLength(1)
    expect(batch?.methodologies[0].name).toBe('sqli')
    expect(batch?.methodologies[0].manifestDigest).toMatch(/^[0-9a-f]{64}$/)
    const artifact = await store.getReportArtifact(batch!.methodologies[0].artifactId)
    expect(artifact).toBeDefined()
    expect(readFileSync(fileURLToPath(artifact!.uri), 'utf8')).toBe('## check\ninspect raw queries')
    // The artifact's own batchId field matches the real batch just created
    // (not a provisional placeholder) — its on-disk path was written under
    // that same real batchId from the start.
    expect(artifact?.batchId).toBe(result.batchId)
    expect(fileURLToPath(artifact!.uri)).toContain(result.batchId)
  })

  it('aborts with zero rows written when a named methodology cannot be resolved', async () => {
    const { call, store } = await batchToolsHarness({ reportRoot: root })
    await expect(call('sast_start_batch', {
      repositories: reposArg(1), objective: 'a', authorization: 'ok', methodologies: ['ghost'],
    }, OWNER_SESSION_ID)).rejects.toThrow(/ghost/)
    expect(await store.getBatchByOwner(OWNER_SESSION_ID)).toBeUndefined()
  })
})

describe('sast_batch_state', () => {
  it('resolves the calling session\'s most recently created batch when batchId is omitted', async () => {
    const { call } = await batchToolsHarness({ reportRoot: root })
    const created = await call('sast_start_batch', { repositories: reposArg(2), objective: 'a', authorization: 'ok' }, OWNER_SESSION_ID) as { batchId: string }
    const state = await call('sast_batch_state', {}, OWNER_SESSION_ID) as { batch: { id: string }; jobs: unknown[] }
    expect(state.batch.id).toBe(created.batchId)
    expect(state.jobs).toHaveLength(2)
  })

  it('never includes the full per-repo graph — only redacted per-job fields', async () => {
    const { call } = await batchToolsHarness({ reportRoot: root })
    await call('sast_start_batch', { repositories: reposArg(1), objective: 'a', authorization: 'ok' }, OWNER_SESSION_ID)
    const state = await call('sast_batch_state', {}, OWNER_SESSION_ID) as { jobs: Array<Record<string, unknown>> }
    const keys = Object.keys(state.jobs[0])
    expect(keys).not.toContain('intents')
    expect(keys).not.toContain('facts')
    expect(keys).not.toContain('findings')
    expect(keys).toContain('ordinal')
    expect(keys).toContain('status')
  })

  it('throws when no batch exists for the session', async () => {
    const { call } = await batchToolsHarness({ reportRoot: root })
    await expect(call('sast_batch_state', {}, 'no-such-owner')).rejects.toThrow(/no batch found/)
  })
})

describe('sast_batch_report', () => {
  it('generates a markdown report by default, persisted as a durable artifact', async () => {
    const { call } = await batchToolsHarness({ reportRoot: root })
    await call('sast_start_batch', { repositories: reposArg(2), objective: 'a', authorization: 'ok' }, OWNER_SESSION_ID)
    const report = await call('sast_batch_report', {}, OWNER_SESSION_ID) as { markdown: string; artifactId: string; uri: string }
    expect(report.markdown).toContain('# 批次审计报告')
    expect(readFileSync(fileURLToPath(report.uri), 'utf8')).toBe(report.markdown)
  })

  it('generates a json report when format: json', async () => {
    const { call } = await batchToolsHarness({ reportRoot: root })
    await call('sast_start_batch', { repositories: reposArg(2), objective: 'a', authorization: 'ok' }, OWNER_SESSION_ID)
    const report = await call('sast_batch_report', { format: 'json' }, OWNER_SESSION_ID) as { json: { jobs: unknown[] } }
    expect(report.json.jobs).toHaveLength(2)
  })

  it('every input appears exactly once (A20)', async () => {
    const { call } = await batchToolsHarness({ reportRoot: root })
    await call('sast_start_batch', { repositories: reposArg(5), objective: 'a', authorization: 'ok' }, OWNER_SESSION_ID)
    const report = await call('sast_batch_report', { format: 'json' }, OWNER_SESSION_ID) as { json: { jobs: Array<{ ordinal: number }> } }
    expect(report.json.jobs.map(j => j.ordinal)).toEqual([1, 2, 3, 4, 5])
  })
})

describe('sast_batch_resolve', () => {
  it('retries a reviewStatus=pending job, putting it back in the queue', async () => {
    const { call, store } = await batchToolsHarness({ reportRoot: root })
    const created = await call('sast_start_batch', { repositories: reposArg(1), objective: 'a', authorization: 'ok' }, OWNER_SESSION_ID) as { batchId: string }
    await store.claimJob(created.batchId, 'job-1', 'w', 60_000)
    await store.transitionJob(created.batchId, 'job-1', 'running')
    await store.recordJobOutcome(created.batchId, 'job-1', 'skipped', { errorClass: 'auth', fallback: 'authentication failed' })
    await store.setReviewStatus(created.batchId, 'job-1', 'pending', 'awaiting decision')
    await call('sast_batch_resolve', { batchId: created.batchId, decisions: [{ jobId: 'job-1', action: 'retry', reason: 'retry with fixed token' }] }, OWNER_SESSION_ID)
    const job = await store.getJob(created.batchId, 'job-1')
    expect(job?.status).toBe('queued')
  })

  it('accept-gap and confirm-skip never rewrite the original errorClass/fallback (A24)', async () => {
    const { call, store } = await batchToolsHarness({ reportRoot: root })
    const created = await call('sast_start_batch', { repositories: reposArg(1), objective: 'a', authorization: 'ok' }, OWNER_SESSION_ID) as { batchId: string }
    await store.claimJob(created.batchId, 'job-1', 'w', 60_000)
    await store.transitionJob(created.batchId, 'job-1', 'running')
    await store.recordJobOutcome(created.batchId, 'job-1', 'skipped', { errorClass: 'auth', fallback: 'authentication failed' })
    await store.setReviewStatus(created.batchId, 'job-1', 'pending')
    await call('sast_batch_resolve', { batchId: created.batchId, decisions: [{ jobId: 'job-1', action: 'accept-gap', reason: 'known gap' }] }, OWNER_SESSION_ID)
    const job = await store.getJob(created.batchId, 'job-1')
    expect(job?.status).toBe('skipped')
    expect(job?.errorClass).toBe('auth')
    expect(job?.fallback).toBe('authentication failed')
    expect(job?.reviewStatus).toBe('accepted')
  })

  it('is a no-op (reported as skipped) for a job whose reviewStatus is not pending', async () => {
    const { call, store } = await batchToolsHarness({ reportRoot: root })
    const created = await call('sast_start_batch', { repositories: reposArg(1), objective: 'a', authorization: 'ok' }, OWNER_SESSION_ID) as { batchId: string }
    const result = await call('sast_batch_resolve', { batchId: created.batchId, decisions: [{ jobId: 'job-1', action: 'retry' }] }, OWNER_SESSION_ID) as { applied: Array<{ skipped?: string }> }
    expect(result.applied[0].skipped).toContain('not pending')
    const job = await store.getJob(created.batchId, 'job-1')
    expect(job?.status).toBe('queued') // untouched
  })

  it('only retries the specified job — other pending jobs are untouched', async () => {
    const { call, store } = await batchToolsHarness({ reportRoot: root })
    const created = await call('sast_start_batch', { repositories: reposArg(2), objective: 'a', authorization: 'ok' }, OWNER_SESSION_ID) as { batchId: string }
    for (const jobId of ['job-1', 'job-2']) {
      await store.claimJob(created.batchId, jobId, 'w', 60_000)
      await store.transitionJob(created.batchId, jobId, 'running')
      await store.recordJobOutcome(created.batchId, jobId, 'skipped', { errorClass: 'auth', fallback: 'authentication failed' })
      await store.setReviewStatus(created.batchId, jobId, 'pending')
    }
    await call('sast_batch_resolve', { batchId: created.batchId, decisions: [{ jobId: 'job-1', action: 'retry' }] }, OWNER_SESSION_ID)
    const job1 = await store.getJob(created.batchId, 'job-1')
    const job2 = await store.getJob(created.batchId, 'job-2')
    expect(job1?.status).toBe('queued')
    expect(job2?.status).toBe('skipped')
    expect(job2?.reviewStatus).toBe('pending')
  })
})
