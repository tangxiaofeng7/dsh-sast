/**
 * The M5 hard gate's other half: end-to-end proof that the durable batch
 * control plane (`BatchStore` + `DurableBatchScheduler`) actually drives 100
 * jobs to completion under real (non-trivial) failure conditions, not just
 * the small-N unit scenarios in `tests/batch/scheduler.spec.ts`.
 *
 * This does NOT exercise spike-D (`ctx.agents.create/resume`) — that
 * dependency is still unverified in this environment (see
 * `src/batch/worker.ts`'s module doc and `tests/batch/worker-factory.spec.ts`'s
 * `it.fails` probe) — so the `RepositoryWorkerFactory`/`JobOutcomeResolver`
 * are fakes, exactly like the rest of the scheduler unit tests. What this
 * file adds beyond those is scale (a real 100, not a stand-in N) and content
 * (`provider: 'local'` fixture repos with real files on disk, not bare repo
 * specs), so A18/A19/A20/A21 are demonstrated against the full batch size
 * the product claims to support, not extrapolated from N=3..5.
 *
 * No network access, no GitLab/GitHub credentials: every fixture repository
 * is a local temp directory (`provider: 'local'`), per the plan's decision
 * to keep this test fully offline and deterministic.
 * @module
 */

import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import { BatchStore } from '../../src/batch/store.ts'
import { DurableBatchScheduler, type JobOutcome, type JobOutcomeResolver, type PromptBuilder } from '../../src/batch/scheduler.ts'
import type { CreateWorkerInput, RepositoryWorker, RepositoryWorkerFactory } from '../../src/batch/worker.ts'
import { sastDomainSpec } from '../../src/spec.ts'
import { MemoryStorageBackend } from '../memory-backend.ts'

const REPO_COUNT = 100
const AUTH_FAILURE_ORDINAL = 2
const TIMEOUT_ORDINAL = 50
const BLOCKED_ORDINAL = 99

let root: string

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'sast-e2e-batch-100-'))
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

/** Create REPO_COUNT real local fixture directories, each with a couple of source files containing an obvious pattern — realistic enough that a real worker (once spike-D lands) would have something to actually read. */
function makeFixtureRepos(baseDir: string, n: number): Array<{ provider: 'local'; repoUrl: string }> {
  const repos: Array<{ provider: 'local'; repoUrl: string }> = []
  for (let i = 1; i <= n; i++) {
    const repoDir = join(baseDir, `repo-${i}`)
    mkdirSync(repoDir, { recursive: true })
    writeFileSync(join(repoDir, 'README.md'), `# repo ${i}\n`)
    writeFileSync(
      join(repoDir, 'app.js'),
      `// repo ${i}\nconst apiKey = "sk-fixture-${i}"\nfunction query(userInput) {\n  return db.raw("SELECT * FROM t WHERE id = " + userInput)\n}\n`,
    )
    repos.push({ provider: 'local', repoUrl: repoDir })
  }
  return repos
}

async function batchStoreBench(): Promise<BatchStore> {
  const ctx = new Context()
  await ctx.plugin(Storage)
  ctx.storage.backend.register('memory', new MemoryStorageBackend())
  const facility = new DomainFacility(ctx, { backend: 'memory', routes: {} })
  const domain = await facility.open(sastDomainSpec)
  return new BatchStore(() => Promise.resolve(domain))
}

/** A worker double that immediately idles — spike-D is unverified, so no real turn-driving loop runs; this file's job is proving the SCHEDULER/STORE layer, not a real agent. */
function fakeWorker(sessionId: string, log: string[]): RepositoryWorker {
  return {
    sessionId,
    start: (prompt) => { log.push(`start:${sessionId}:${prompt}`) },
    whenIdle: async () => { log.push(`idle:${sessionId}`) },
    cancel: (cause) => { log.push(`cancel:${sessionId}:${cause}`) },
    dispose: async () => { log.push(`dispose:${sessionId}`) },
  }
}

/** A worker double whose `whenIdle()` never resolves — used at the ordinal that must time out. */
function hangingWorker(sessionId: string, log: string[]): RepositoryWorker {
  return {
    sessionId,
    start: () => { log.push(`start:${sessionId}`) },
    whenIdle: () => new Promise<void>(() => {}),
    cancel: (cause) => { log.push(`cancel:${sessionId}:${cause}`) },
    dispose: async () => { log.push(`dispose:${sessionId}`) },
  }
}

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
const workspaceOf = async (job: { readonly repoSpec: { readonly repoUrl: string } }): Promise<string> => job.repoSpec.repoUrl

/**
 * The outcome resolver that drives this whole test's failure scenario: every
 * ordinal succeeds except the three the plan requires be exercised —
 * ordinal 2 fails auth (unretryable, becomes `skipped`), ordinal 50 hangs
 * past its deadline (its worker double never idles, forcing a real
 * `timed_out`), and ordinal 99 reports an unresolved blocked check
 * (`degraded`). None of these is an `infra`-class failure, so A19 requires
 * the batch to still reach ordinal 100.
 */
function scenarioResolver(): JobOutcomeResolver {
  return {
    resolve: async (job) => {
      if (job.ordinal === AUTH_FAILURE_ORDINAL) {
        return { kind: 'failed', error: new Error('sast: authentication failed cloning x; check the configured token env var') } satisfies JobOutcome
      }
      if (job.ordinal === BLOCKED_ORDINAL) {
        return { kind: 'degraded', coverageImpact: 'unresolved blocked check' } satisfies JobOutcome
      }
      return { kind: 'succeeded' } satisfies JobOutcome
    },
  }
}

describe('E2E: a 100-repository batch, driven by the real BatchStore + DurableBatchScheduler', () => {
  it('A18: strictly serial by ordinal — never two workers created without an intervening dispose, and creation order is 1..100', async () => {
    const store = await batchStoreBench()
    const repos = makeFixtureRepos(root, REPO_COUNT)
    const { batch } = await store.createBatch('batch-100', {
      ownerSessionId: 'owner', objective: 'audit all', repositories: repos, policy: { maxAttempts: 1, jobTimeoutMs: 50 },
    })
    expect(batch.total).toBe(REPO_COUNT)

    const log: string[] = []
    const scheduler = new DurableBatchScheduler({
      store,
      workerFactory: recordingFactory(log, (input) => input.job.ordinal === TIMEOUT_ORDINAL ? hangingWorker(input.sessionId, log) : fakeWorker(input.sessionId, log)),
      outcomeResolver: scenarioResolver(),
      promptBuilder,
      workspaceOf,
      leaseOwner: 'e2e-scheduler',
    })
    const summary = await scheduler.run('batch-100')

    expect(summary.failedClosed).toBe(false)
    expect(summary.results).toHaveLength(REPO_COUNT)

    // A18: at no point in the log are two workers concurrently "live"
    // (created but not yet disposed).
    let liveWorkers = 0
    let maxConcurrent = 0
    for (const line of log) {
      if (line.startsWith('create:')) liveWorkers++
      if (line.startsWith('dispose:')) liveWorkers--
      maxConcurrent = Math.max(maxConcurrent, liveWorkers)
    }
    expect(maxConcurrent).toBe(1)

    // Creation happened in strict ordinal order 1..100.
    const createdOrdinals = log
      .filter(line => line.startsWith('create:'))
      .map(line => Number(line.match(/ordinal=(\d+)/)?.[1]))
    expect(createdOrdinals).toEqual(Array.from({ length: REPO_COUNT }, (_, i) => i + 1))
  }, 30_000)

  it('A19: ordinal 2 (auth), 50 (timeout), and 99 (blocked) do not stop the batch — every ordinal up to 100 still runs', async () => {
    const store = await batchStoreBench()
    const repos = makeFixtureRepos(root, REPO_COUNT)
    await store.createBatch('batch-a19', { ownerSessionId: 'owner', objective: 'audit all', repositories: repos, policy: { maxAttempts: 1, jobTimeoutMs: 50 } })
    const log: string[] = []
    const scheduler = new DurableBatchScheduler({
      store,
      workerFactory: recordingFactory(log, (input) => input.job.ordinal === TIMEOUT_ORDINAL ? hangingWorker(input.sessionId, log) : fakeWorker(input.sessionId, log)),
      outcomeResolver: scenarioResolver(),
      promptBuilder,
      workspaceOf,
    })
    const summary = await scheduler.run('batch-a19')

    expect(summary.failedClosed).toBe(false)
    expect(summary.results).toHaveLength(REPO_COUNT)
    expect(summary.results.at(-1)?.job.ordinal).toBe(REPO_COUNT)
    expect(summary.results.at(-1)?.outcome).toBe('succeeded')

    const byOrdinal = new Map(summary.results.map(r => [r.job.ordinal, r.outcome]))
    expect(byOrdinal.get(AUTH_FAILURE_ORDINAL)).toBe('skipped')
    expect(byOrdinal.get(TIMEOUT_ORDINAL)).toBe('timed_out')
    expect(byOrdinal.get(BLOCKED_ORDINAL)).toBe('degraded')
    // Every other ordinal succeeded.
    for (let ordinal = 1; ordinal <= REPO_COUNT; ordinal++) {
      if ([AUTH_FAILURE_ORDINAL, TIMEOUT_ORDINAL, BLOCKED_ORDINAL].includes(ordinal)) continue
      expect(byOrdinal.get(ordinal)).toBe('succeeded')
    }
  }, 30_000)

  it('A20: the batch job table lists every one of the 100 inputs exactly once, and aggregate status counts sum to 100', async () => {
    const store = await batchStoreBench()
    const repos = makeFixtureRepos(root, REPO_COUNT)
    await store.createBatch('batch-a20', { ownerSessionId: 'owner', objective: 'audit all', repositories: repos, policy: { maxAttempts: 1, jobTimeoutMs: 50 } })
    const log: string[] = []
    const scheduler = new DurableBatchScheduler({
      store,
      workerFactory: recordingFactory(log, (input) => input.job.ordinal === TIMEOUT_ORDINAL ? hangingWorker(input.sessionId, log) : fakeWorker(input.sessionId, log)),
      outcomeResolver: scenarioResolver(),
      promptBuilder,
      workspaceOf,
    })
    await scheduler.run('batch-a20')

    const jobs = await store.listJobs('batch-a20')
    expect(jobs).toHaveLength(REPO_COUNT)
    // Every ordinal 1..100 appears exactly once (A20's "每个输入恰好出现一次").
    const ordinals = jobs.map(j => j.ordinal).sort((a, b) => a - b)
    expect(ordinals).toEqual(Array.from({ length: REPO_COUNT }, (_, i) => i + 1))
    expect(new Set(ordinals).size).toBe(REPO_COUNT)

    const statusTally = jobs.reduce<Record<string, number>>((acc, job) => {
      acc[job.status] = (acc[job.status] ?? 0) + 1
      return acc
    }, {})
    expect(statusTally.succeeded).toBe(REPO_COUNT - 3)
    expect(statusTally.skipped).toBe(1)
    expect(statusTally.timed_out).toBe(1)
    expect(statusTally.degraded).toBe(1)
    // Aggregate == sum of each job's own terminal status — never
    // independently recomputed (report.ts's own discipline; here re-asserted
    // against the real store's 100 rows rather than a hand-built fixture).
    const total = Object.values(statusTally).reduce((sum, count) => sum + count, 0)
    expect(total).toBe(REPO_COUNT)
  }, 30_000)

  it('A21: a simulated process restart recovers ordinal 50\'s abandoned lease and completes the batch without re-running already-terminal jobs', async () => {
    const store = await batchStoreBench()
    const repos = makeFixtureRepos(root, REPO_COUNT)
    await store.createBatch('batch-a21', { ownerSessionId: 'owner', objective: 'audit all', repositories: repos, policy: { maxAttempts: 1, jobTimeoutMs: 20_000 } })

    // First scheduler instance drives ordinals 1..49 to completion normally.
    const firstLog: string[] = []
    const firstScheduler = new DurableBatchScheduler({
      store,
      workerFactory: recordingFactory(firstLog),
      outcomeResolver: scenarioResolver(),
      promptBuilder,
      workspaceOf,
      leaseOwner: 'process-1',
    })
    for (let ordinal = 1; ordinal < TIMEOUT_ORDINAL; ordinal++) {
      const jobs = await store.listJobs('batch-a21')
      const next = jobs.find(j => j.status === 'queued')
      expect(next?.ordinal).toBe(ordinal)
      const claimed = await store.claimJob('batch-a21', next!.id, 'process-1', 20_000)
      expect(claimed).toBeDefined()
      await store.transitionJob('batch-a21', next!.id, 'running')
      const outcome = await scenarioResolver().resolve(claimed!, fakeWorker(`worker-${ordinal}`, firstLog))
      if (outcome.kind === 'succeeded') {
        await store.recordJobOutcome('batch-a21', next!.id, 'succeeded', {})
      } else if (outcome.kind === 'failed') {
        // ordinal 2's auth failure: unretryable, maxAttempts=1 -> skipped.
        await store.recordJobOutcome('batch-a21', next!.id, 'skipped', { errorClass: 'auth', fallback: 'authentication failed' })
        await store.setReviewStatus('batch-a21', next!.id, 'pending', 'authentication failed')
      }
    }
    // Ordinal 50: claim it directly with an already-expired lease (0ms), then
    // never finalize — this is exactly the state a crashed worker process
    // leaves behind (status stuck at 'preparing', lease already expired).
    const stillQueued = await store.listJobs('batch-a21')
    const ordinal50Job = stillQueued.find(j => j.ordinal === TIMEOUT_ORDINAL)
    expect(ordinal50Job?.status).toBe('queued')
    await store.claimJob('batch-a21', ordinal50Job!.id, 'process-1', 0)
    const stuck = await store.getJob('batch-a21', ordinal50Job!.id)
    expect(stuck?.status).toBe('preparing')

    // A brand-new scheduler instance (simulating a process restart) resumes
    // the same batch. Its run() call must recover the stale lease and
    // continue from ordinal 50 through ordinal 100.
    const secondLog: string[] = []
    const secondScheduler = new DurableBatchScheduler({
      store,
      workerFactory: recordingFactory(secondLog),
      outcomeResolver: scenarioResolver(),
      promptBuilder,
      workspaceOf,
      leaseOwner: 'process-2',
    })
    const summary = await secondScheduler.run('batch-a21')

    // Ordinals 1..49 must NOT be re-created by the second scheduler — they
    // were already terminal. Match the ordinal as a whole number (not a
    // substring) so ordinal=1 doesn't false-positive on ordinal=10/11/etc.
    const secondCreatedOrdinals = new Set(
      secondLog.filter(line => line.startsWith('create:')).map(line => Number(line.match(/ordinal=(\d+)/)?.[1])),
    )
    for (let ordinal = 1; ordinal < TIMEOUT_ORDINAL; ordinal++) {
      expect(secondCreatedOrdinals.has(ordinal)).toBe(false)
    }
    // Ordinal 50 (recovered) through 100 all ran under the second instance.
    expect(summary.results.map(r => r.job.ordinal)).toEqual(
      Array.from({ length: REPO_COUNT - TIMEOUT_ORDINAL + 1 }, (_, i) => TIMEOUT_ORDINAL + i),
    )
    expect(summary.failedClosed).toBe(false)

    const finalJobs = await store.listJobs('batch-a21')
    expect(finalJobs).toHaveLength(REPO_COUNT)
    const finalStatuses = finalJobs.reduce<Record<string, number>>((acc, job) => {
      acc[job.status] = (acc[job.status] ?? 0) + 1
      return acc
    }, {})
    // Full accounting: 100 jobs, exactly one skipped (auth, ordinal 2), one
    // degraded (blocked, ordinal 99), the recovered ordinal 50 and every
    // other ordinal succeeded.
    expect(finalStatuses.skipped).toBe(1)
    expect(finalStatuses.degraded).toBe(1)
    expect(finalStatuses.succeeded ?? 0).toBe(REPO_COUNT - 2)
  }, 30_000)
})
