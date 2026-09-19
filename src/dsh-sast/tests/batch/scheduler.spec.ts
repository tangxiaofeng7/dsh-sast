/**
 * `DurableBatchScheduler`: strict ordinal serialization (A18), continuing
 * past per-job failures of every classified kind while stopping only for
 * an `infra`-class failure (A19/A25), and — via `BatchStore` — not
 * re-running an already-terminal job after a fresh scheduler instance
 * resumes the same batch (A21's other half; lease recovery itself is
 * covered in `store.spec.ts`).
 * @module
 */

import { describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import { BatchStore } from '../../src/batch/store.ts'
import { DurableBatchScheduler, type JobOutcome, type JobOutcomeResolver, type PromptBuilder } from '../../src/batch/scheduler.ts'
import type { CreateWorkerInput, RepositoryWorker, RepositoryWorkerFactory } from '../../src/batch/worker.ts'
import { sastDomainSpec } from '../../src/spec.ts'
import { MemoryStorageBackend } from '../memory-backend.ts'

async function batchStoreBench(): Promise<BatchStore> {
  const ctx = new Context()
  await ctx.plugin(Storage)
  ctx.storage.backend.register('memory', new MemoryStorageBackend())
  const facility = new DomainFacility(ctx, { backend: 'memory', routes: {} })
  const domain = await facility.open(sastDomainSpec)
  return new BatchStore(() => Promise.resolve(domain))
}

function reposFixture(n: number): Array<{ provider: 'local'; repoUrl: string }> {
  return Array.from({ length: n }, (_, i) => ({ provider: 'local' as const, repoUrl: `/repo-${i + 1}` }))
}

/** A worker double that immediately idles (no real turn-driving loop) and records start/cancel/dispose calls. */
function fakeWorker(sessionId: string, log: string[]): RepositoryWorker {
  return {
    sessionId,
    start: (prompt) => { log.push(`start:${sessionId}:${prompt}`) },
    whenIdle: async () => { log.push(`idle:${sessionId}`) },
    cancel: (cause) => { log.push(`cancel:${sessionId}:${cause}`) },
    dispose: async () => { log.push(`dispose:${sessionId}`) },
  }
}

/** A worker double whose `whenIdle()` never resolves — forces the scheduler's deadline race to time out. */
function hangingWorker(sessionId: string, log: string[]): RepositoryWorker {
  return {
    sessionId,
    start: () => { log.push(`start:${sessionId}`) },
    whenIdle: () => new Promise<void>(() => {}),
    cancel: (cause) => { log.push(`cancel:${sessionId}:${cause}`) },
    dispose: async () => { log.push(`dispose:${sessionId}`) },
  }
}

/** A `RepositoryWorkerFactory` double that records every `create` call (session id, ordinal) and hands back a per-call fake worker, so tests can assert A18's "at most one running at a time" by checking no two creates ever overlap in the log. */
function recordingFactory(log: string[], workerOf: (input: CreateWorkerInput) => RepositoryWorker = (input) => fakeWorker(input.sessionId, log)): RepositoryWorkerFactory {
  return {
    create: async (input) => {
      log.push(`create:${input.sessionId}:ordinal=${input.job.ordinal}`)
      return workerOf(input)
    },
    resume: async (sessionId) => fakeWorker(sessionId, log),
    lineageOf: () => undefined,
  }
}

const promptBuilder: PromptBuilder = { build: (job) => `audit ${job.repoSpec.repoUrl}` }
const workspaceOf = async (job: { readonly repoSpec: { readonly repoUrl: string } }): Promise<string> => `/tmp/${job.repoSpec.repoUrl}`

/** An outcome resolver double driven by a fixed map from ordinal -> outcome (default: succeeded). */
function resolverOf(outcomes: Readonly<Record<number, JobOutcome>>): JobOutcomeResolver {
  return { resolve: async (job) => outcomes[job.ordinal] ?? { kind: 'succeeded' } }
}

describe('DurableBatchScheduler.run — A18 strict ordinal serialization', () => {
  it('creates exactly one worker per job, in ordinal order, and disposes each before the next is created', async () => {
    const store = await batchStoreBench()
    await store.createBatch('b1', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(3) })
    const log: string[] = []
    const scheduler = new DurableBatchScheduler({
      store, workerFactory: recordingFactory(log), outcomeResolver: resolverOf({}), promptBuilder, workspaceOf,
    })
    const summary = await scheduler.run('b1')
    expect(summary.failedClosed).toBe(false)
    expect(summary.results.map(r => r.outcome)).toEqual(['succeeded', 'succeeded', 'succeeded'])
    // Every create happens before the NEXT create, and each worker is
    // disposed before that same worker's create-index entry for the next
    // ordinal appears — i.e. creates never interleave.
    const createIndexes = log.reduce<number[]>((acc, line, i) => (line.startsWith('create:') ? [...acc, i] : acc), [])
    const disposeIndexes = log.reduce<number[]>((acc, line, i) => (line.startsWith('dispose:') ? [...acc, i] : acc), [])
    expect(createIndexes).toHaveLength(3)
    expect(disposeIndexes).toHaveLength(3)
    // create[1] must come after dispose[0] (ordinal 2's worker is not
    // created until ordinal 1's worker has been fully disposed).
    expect(createIndexes[1]).toBeGreaterThan(disposeIndexes[0])
    expect(createIndexes[2]).toBeGreaterThan(disposeIndexes[1])
  })

  it('never has two workers created without an intervening dispose (at most one worker running at any point in the log)', async () => {
    const store = await batchStoreBench()
    await store.createBatch('b2', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(5) })
    const log: string[] = []
    const scheduler = new DurableBatchScheduler({
      store, workerFactory: recordingFactory(log), outcomeResolver: resolverOf({}), promptBuilder, workspaceOf,
    })
    await scheduler.run('b2')
    let liveWorkers = 0
    let maxConcurrent = 0
    for (const line of log) {
      if (line.startsWith('create:')) liveWorkers++
      if (line.startsWith('dispose:')) liveWorkers--
      maxConcurrent = Math.max(maxConcurrent, liveWorkers)
    }
    expect(maxConcurrent).toBe(1)
  })
})

describe('DurableBatchScheduler.run — A19 continues past per-job failures of every kind', () => {
  it('the 2nd of 5 jobs fails auth (skip), the rest still run to completion', async () => {
    const store = await batchStoreBench()
    await store.createBatch('a19-1', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(5) })
    const scheduler = new DurableBatchScheduler({
      store, workerFactory: recordingFactory([]),
      outcomeResolver: resolverOf({ 2: { kind: 'failed', error: new Error('sast: authentication failed cloning x; check the configured token env var') } }),
      promptBuilder, workspaceOf,
    })
    const summary = await scheduler.run('a19-1')
    expect(summary.failedClosed).toBe(false)
    expect(summary.results).toHaveLength(5)
    expect(summary.results[1].outcome).toBe('skipped')
    expect(summary.results.map(r => r.outcome)).toEqual(['succeeded', 'skipped', 'succeeded', 'succeeded', 'succeeded'])
  })

  it('the job at ordinal 3 exceeds its deadline (timeout, exhausted attempts -> degraded/timed_out), execution still reaches the last ordinal', async () => {
    const store = await batchStoreBench()
    await store.createBatch('a19-2', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(4), policy: { maxAttempts: 1, jobTimeoutMs: 5 } })
    const log: string[] = []
    const scheduler = new DurableBatchScheduler({
      store,
      workerFactory: recordingFactory(log, (input) => input.job.ordinal === 3 ? hangingWorker(input.sessionId, log) : fakeWorker(input.sessionId, log)),
      outcomeResolver: resolverOf({}),
      promptBuilder, workspaceOf,
    })
    const summary = await scheduler.run('a19-2')
    expect(summary.failedClosed).toBe(false)
    expect(summary.results.map(r => r.outcome)).toEqual(['succeeded', 'succeeded', 'timed_out', 'succeeded'])
    expect(log).toContain('cancel:worker-a19-2-3-1:SAST_JOB_TIMEOUT')
  })

  it('the job at ordinal 3 exceeds its deadline and STILL has attempts left, so it retries before eventually degrading', async () => {
    const store = await batchStoreBench()
    await store.createBatch('a19-2b', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(4), policy: { maxAttempts: 2, jobTimeoutMs: 5 } })
    const log: string[] = []
    const scheduler = new DurableBatchScheduler({
      store,
      workerFactory: recordingFactory(log, (input) => input.job.ordinal === 3 ? hangingWorker(input.sessionId, log) : fakeWorker(input.sessionId, log)),
      outcomeResolver: resolverOf({}),
      promptBuilder, workspaceOf,
    })
    const summary = await scheduler.run('a19-2b')
    expect(summary.failedClosed).toBe(false)
    // ordinal 3's job times out on attempt 1 (retries, attempt < maxAttempts)
    // and again on attempt 2 (exhausted -> timed_out), but the batch still
    // reaches ordinal 4.
    expect(summary.results.map(r => r.outcome)).toEqual(['succeeded', 'succeeded', 'retried', 'timed_out', 'succeeded'])
    expect(log.filter(l => l.startsWith('create:') && l.includes('ordinal=3'))).toHaveLength(2)
  })

  it('the job at ordinal 4 (last) has an unresolved blocked check (degrade), the batch still finishes without failing closed', async () => {
    const store = await batchStoreBench()
    await store.createBatch('a19-3', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(4) })
    const scheduler = new DurableBatchScheduler({
      store, workerFactory: recordingFactory([]),
      outcomeResolver: resolverOf({ 4: { kind: 'degraded', coverageImpact: 'unresolved blocked check' } }),
      promptBuilder, workspaceOf,
    })
    const summary = await scheduler.run('a19-3')
    expect(summary.failedClosed).toBe(false)
    expect(summary.results.map(r => r.outcome)).toEqual(['succeeded', 'succeeded', 'succeeded', 'degraded'])
    const job4 = await store.getJob('a19-3', 'job-4')
    expect(job4?.reviewStatus).toBe('pending')
  })

  it('retries a timeout-classified failure within maxAttempts before eventually degrading', async () => {
    const store = await batchStoreBench()
    await store.createBatch('a19-4', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(1), policy: { maxAttempts: 3 } })
    let calls = 0
    const scheduler = new DurableBatchScheduler({
      store, workerFactory: recordingFactory([]),
      outcomeResolver: { resolve: async () => { calls++; return { kind: 'failed', error: new Error('sast: unexpected transient failure') } } },
      promptBuilder, workspaceOf,
    })
    const summary = await scheduler.run('a19-4')
    expect(calls).toBe(3) // attempt 1, 2, 3 (maxAttempts) all ran
    expect(summary.results.at(-1)?.outcome).toBe('degraded')
  })
})

describe('DurableBatchScheduler.run — A25 fail-closed only for infra-class failures', () => {
  it('stops the whole batch (fail-closed) without claiming further ordinals when a job fails with an infra-class error', async () => {
    const store = await batchStoreBench()
    await store.createBatch('a25-1', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(5) })
    const log: string[] = []
    const scheduler = new DurableBatchScheduler({
      store, workerFactory: recordingFactory(log),
      outcomeResolver: resolverOf({ 2: { kind: 'failed', error: new Error('sast: storage backend is unavailable') } }),
      promptBuilder, workspaceOf,
    })
    const summary = await scheduler.run('a25-1')
    expect(summary.failedClosed).toBe(true)
    expect(summary.results).toHaveLength(2) // ordinal 1 succeeded, ordinal 2 failed closed — 3/4/5 never ran
    const createCalls = log.filter(l => l.startsWith('create:')).length
    expect(createCalls).toBe(2)
  })
})

describe('DurableBatchScheduler.run — A21: does not re-run an already-terminal job', () => {
  it('a fresh scheduler instance resuming the same batch skips jobs already succeeded and only runs the remaining queued ones', async () => {
    const store = await batchStoreBench()
    await store.createBatch('a21-1', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(3) })
    const firstLog: string[] = []
    const firstScheduler = new DurableBatchScheduler({
      store, workerFactory: recordingFactory(firstLog),
      outcomeResolver: resolverOf({ 2: { kind: 'failed', error: new Error('sast: storage backend is unavailable') } }),
      promptBuilder, workspaceOf,
    })
    const firstSummary = await firstScheduler.run('a21-1')
    expect(firstSummary.failedClosed).toBe(true) // stopped after ordinal 2's infra failure; ordinal 3 never ran

    // A brand-new scheduler instance (simulating a process restart) resumes
    // the same batch. Ordinal 1 already succeeded and must not run again.
    // Ordinal 2 is left `running` (an infra-class failure returns
    // 'fail-closed' without writing any terminal/retry status — the batch
    // owner must decide whether it is now safe to continue) and its lease
    // has not expired, so recoverExpiredLeases does not requeue it either;
    // only ordinal 3, which never ran, is picked up.
    const secondLog: string[] = []
    const secondScheduler = new DurableBatchScheduler({
      store, workerFactory: recordingFactory(secondLog), outcomeResolver: resolverOf({}), promptBuilder, workspaceOf,
    })
    const secondSummary = await secondScheduler.run('a21-1')
    expect(secondSummary.failedClosed).toBe(false)
    expect(secondLog.some(l => l.includes('ordinal=1'))).toBe(false)
    expect(secondLog.some(l => l.includes('ordinal=2'))).toBe(false)
    expect(secondSummary.results.map(r => r.outcome)).toEqual(['succeeded'])
  })
})
