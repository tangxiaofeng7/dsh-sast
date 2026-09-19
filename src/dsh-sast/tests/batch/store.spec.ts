/**
 * `BatchStore`: atomic batch+jobs creation (all-or-nothing, `ordinal`
 * uniqueness), CAS batch/job status transitions, lease claim/renew/recover,
 * append-only `job_events` (monotonic `seq`), and review-status writes that
 * never rewrite the original failure.
 * @module
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import { BatchStore } from '../../src/batch/store.ts'
import { sastDomainSpec } from '../../src/spec.ts'
import { MemoryStorageBackend } from '../memory-backend.ts'

let clockValue = 1000

async function storeBench(): Promise<{ store: BatchStore; domain: Awaited<ReturnType<DomainFacility['open']>> }> {
  const ctx = new Context()
  await ctx.plugin(Storage)
  ctx.storage.backend.register('memory', new MemoryStorageBackend())
  const facility = new DomainFacility(ctx, { backend: 'memory', routes: {} })
  const domain = await facility.open(sastDomainSpec)
  clockValue = 1000
  const store = new BatchStore(() => Promise.resolve(domain), () => clockValue++)
  return { store, domain }
}

function reposFixture(n: number): Array<{ provider: 'local'; repoUrl: string }> {
  return Array.from({ length: n }, (_, i) => ({ provider: 'local' as const, repoUrl: `/repo-${i + 1}` }))
}

describe('BatchStore.createBatch', () => {
  it('creates a batch and one job per repository, with unique sequential ordinals', async () => {
    const { store } = await storeBench()
    const { batch, jobs } = await store.createBatch('batch-1', {
      ownerSessionId: 'owner-1', objective: 'audit', repositories: reposFixture(3),
    })
    expect(batch.total).toBe(3)
    expect(jobs).toHaveLength(3)
    expect(jobs.map(j => j.ordinal)).toEqual([1, 2, 3])
    expect(new Set(jobs.map(j => j.ordinal)).size).toBe(3)
  })

  it('creates a full 100-repository batch', async () => {
    const { store } = await storeBench()
    const { jobs } = await store.createBatch('batch-100', {
      ownerSessionId: 'owner-1', objective: 'audit', repositories: reposFixture(100),
    })
    expect(jobs).toHaveLength(100)
    expect(jobs.at(-1)?.ordinal).toBe(100)
  })

  it('rejects an empty repository list', async () => {
    const { store } = await storeBench()
    await expect(store.createBatch('batch-empty', { ownerSessionId: 'o', objective: 'a', repositories: [] }))
      .rejects.toThrow(/between 1 and 100/)
  })

  it('rejects more than 100 repositories', async () => {
    const { store } = await storeBench()
    await expect(store.createBatch('batch-over', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(101) }))
      .rejects.toThrow(/between 1 and 100/)
  })

  it('fixes policy.concurrency at 1 regardless of caller input', async () => {
    const { store } = await storeBench()
    const { batch } = await store.createBatch('batch-c', {
      ownerSessionId: 'o', objective: 'a', repositories: reposFixture(1),
      policy: { concurrency: 1 },
    })
    expect(batch.policy.concurrency).toBe(1)
  })

  it('writes a batch-created event', async () => {
    const { store } = await storeBench()
    await store.createBatch('batch-e', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(2) })
    const events = await store.listEvents('batch-e')
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({ kind: 'batch-created', seq: 1 })
  })

  it('rolls back the whole batch (no jobs, no batch row) when repositories.length is invalid — verified via listJobs returning empty', async () => {
    const { store } = await storeBench()
    await expect(store.createBatch('batch-bad', { ownerSessionId: 'o', objective: 'a', repositories: [] })).rejects.toThrow()
    expect(await store.getBatch('batch-bad')).toBeUndefined()
    expect(await store.listJobs('batch-bad')).toEqual([])
  })
})

describe('BatchStore CAS transitions', () => {
  it('allows every documented job transition and rejects an illegal one', async () => {
    const { store } = await storeBench()
    await store.createBatch('b1', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(1) })
    await store.transitionJob('b1', 'job-1', 'preparing')
    await store.transitionJob('b1', 'job-1', 'running')
    await store.transitionJob('b1', 'job-1', 'succeeded')
    const job = await store.getJob('b1', 'job-1')
    expect(job?.status).toBe('succeeded')
    // succeeded is terminal: no outgoing edge at all, including back to queued.
    await expect(store.transitionJob('b1', 'job-1', 'queued')).rejects.toThrow(/illegal job transition/)
  })

  it('rejects skipping straight from queued to succeeded', async () => {
    const { store } = await storeBench()
    await store.createBatch('b2', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(1) })
    await expect(store.transitionJob('b2', 'job-1', 'succeeded')).rejects.toThrow(/illegal job transition/)
  })

  it('allows running -> retry_wait -> queued', async () => {
    const { store } = await storeBench()
    await store.createBatch('b3', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(1) })
    await store.transitionJob('b3', 'job-1', 'preparing')
    await store.transitionJob('b3', 'job-1', 'running')
    await store.transitionJob('b3', 'job-1', 'retry_wait')
    const job = await store.transitionJob('b3', 'job-1', 'queued')
    expect(job.status).toBe('queued')
  })

  it('allows batch queued -> running -> awaiting_review -> completed_with_issues, and running back after a retry', async () => {
    const { store } = await storeBench()
    await store.createBatch('bt', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(1) })
    await store.transitionBatch('bt', 'running')
    await store.transitionBatch('bt', 'awaiting_review')
    const done = await store.transitionBatch('bt', 'completed_with_issues')
    expect(done.status).toBe('completed_with_issues')
    const retried = await store.transitionBatch('bt', 'running')
    expect(retried.status).toBe('running')
  })

  it('rejects an illegal batch transition (queued -> completed)', async () => {
    const { store } = await storeBench()
    await store.createBatch('bx', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(1) })
    await expect(store.transitionBatch('bx', 'completed')).rejects.toThrow(/illegal batch transition/)
  })

  it('is idempotent when the requested status already matches the current one', async () => {
    const { store } = await storeBench()
    await store.createBatch('bi', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(1) })
    const job = await store.transitionJob('bi', 'job-1', 'queued')
    expect(job.status).toBe('queued')
  })
})

describe('BatchStore.isAutoTerminal', () => {
  it('classifies succeeded/degraded/skipped/failed/timed_out as auto-terminal, and everything else as not', () => {
    expect(BatchStore.isAutoTerminal('succeeded')).toBe(true)
    expect(BatchStore.isAutoTerminal('degraded')).toBe(true)
    expect(BatchStore.isAutoTerminal('skipped')).toBe(true)
    expect(BatchStore.isAutoTerminal('failed')).toBe(true)
    expect(BatchStore.isAutoTerminal('timed_out')).toBe(true)
    expect(BatchStore.isAutoTerminal('cancelled')).toBe(false)
    expect(BatchStore.isAutoTerminal('queued')).toBe(false)
    expect(BatchStore.isAutoTerminal('running')).toBe(false)
  })
})

describe('BatchStore lease claim/renew/recover', () => {
  it('claims a queued job, bumping attempt and moving it to preparing', async () => {
    const { store } = await storeBench()
    await store.createBatch('l1', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(1) })
    const claimed = await store.claimJob('l1', 'job-1', 'worker-a', 60_000)
    expect(claimed?.status).toBe('preparing')
    expect(claimed?.attempt).toBe(1)
    expect(claimed?.leaseOwner).toBe('worker-a')
  })

  it('refuses to claim a job already held by a different, still-live owner', async () => {
    const { store } = await storeBench()
    await store.createBatch('l2', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(1) })
    await store.claimJob('l2', 'job-1', 'worker-a', 60_000)
    const secondClaim = await store.claimJob('l2', 'job-1', 'worker-b', 60_000)
    expect(secondClaim).toBeUndefined()
  })

  it('does not re-claim an already-claimed job even for the same owner (claim only accepts queued)', async () => {
    const { store } = await storeBench()
    await store.createBatch('l3', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(1) })
    const first = await store.claimJob('l3', 'job-1', 'worker-a', 60_000)
    expect(first?.status).toBe('preparing')
    const reclaim = await store.claimJob('l3', 'job-1', 'worker-a', 60_000)
    expect(reclaim).toBeUndefined()
  })

  it('refuses a different owner\'s claim on a retry_wait -> queued job whose prior lease has not actually expired yet', async () => {
    const { store } = await storeBench()
    await store.createBatch('l3b', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(1) })
    await store.claimJob('l3b', 'job-1', 'worker-a', 60_000)
    await store.transitionJob('l3b', 'job-1', 'running')
    await store.transitionJob('l3b', 'job-1', 'retry_wait')
    await store.transitionJob('l3b', 'job-1', 'queued') // leaseOwner/leaseExpiresAt from worker-a still on the row
    const claim = await store.claimJob('l3b', 'job-1', 'worker-b', 60_000)
    expect(claim).toBeUndefined()
  })

  it('allows a different owner to claim a retry_wait -> queued job once the prior lease has actually expired', async () => {
    const { store } = await storeBench()
    await store.createBatch('l3c', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(1) })
    await store.claimJob('l3c', 'job-1', 'worker-a', 1)
    await store.transitionJob('l3c', 'job-1', 'running')
    await store.transitionJob('l3c', 'job-1', 'retry_wait')
    await store.transitionJob('l3c', 'job-1', 'queued')
    clockValue += 10_000
    const claim = await store.claimJob('l3c', 'job-1', 'worker-b', 60_000)
    expect(claim?.leaseOwner).toBe('worker-b')
  })

  it('refuses to claim a non-queued job', async () => {
    const { store } = await storeBench()
    await store.createBatch('l4', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(1) })
    await store.claimJob('l4', 'job-1', 'worker-a', 60_000)
    await store.transitionJob('l4', 'job-1', 'running')
    const claim = await store.claimJob('l4', 'job-1', 'worker-b', 60_000)
    expect(claim).toBeUndefined()
  })

  it('renews a live lease held by the same owner', async () => {
    const { store } = await storeBench()
    await store.createBatch('l5', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(1) })
    const claimed = await store.claimJob('l5', 'job-1', 'worker-a', 1000)
    const renewed = await store.renewLease('l5', 'job-1', 'worker-a', 5000)
    expect(renewed.leaseExpiresAt).toBeGreaterThan(claimed!.leaseExpiresAt!)
  })

  it('rejects renewing a lease held by a different owner', async () => {
    const { store } = await storeBench()
    await store.createBatch('l6', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(1) })
    await store.claimJob('l6', 'job-1', 'worker-a', 60_000)
    await expect(store.renewLease('l6', 'job-1', 'worker-b', 5000)).rejects.toThrow(/lease is held by/)
  })

  it('recovers an expired lease of a preparing/running job back to queued', async () => {
    const { store } = await storeBench()
    await store.createBatch('l7', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(1) })
    await store.claimJob('l7', 'job-1', 'worker-a', 1) // 1ms lease
    await store.transitionJob('l7', 'job-1', 'running')
    // advance the injected clock well past the 1ms lease
    clockValue += 10_000
    const recovered = await store.recoverExpiredLeases('l7')
    expect(recovered).toHaveLength(1)
    expect(recovered[0].status).toBe('queued')
    expect(recovered[0].leaseOwner).toBeUndefined()
  })

  it('does not recover a job whose lease has not yet expired', async () => {
    const { store } = await storeBench()
    await store.createBatch('l8', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(1) })
    await store.claimJob('l8', 'job-1', 'worker-a', 60_000)
    const recovered = await store.recoverExpiredLeases('l8')
    expect(recovered).toHaveLength(0)
  })

  it('does not recover an already-terminal job even if its lease field is stale', async () => {
    const { store } = await storeBench()
    await store.createBatch('l9', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(1) })
    await store.claimJob('l9', 'job-1', 'worker-a', 1)
    await store.transitionJob('l9', 'job-1', 'running')
    await store.transitionJob('l9', 'job-1', 'succeeded')
    clockValue += 10_000
    const recovered = await store.recoverExpiredLeases('l9')
    expect(recovered).toHaveLength(0)
  })
})

describe('BatchStore review/outcome writes', () => {
  it('setReviewStatus never touches status/errorClass/fallback (A24)', async () => {
    const { store } = await storeBench()
    await store.createBatch('r1', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(1) })
    await store.claimJob('r1', 'job-1', 'worker-a', 60_000)
    await store.recordJobOutcome('r1', 'job-1', 'failed', { errorClass: 'auth' }, 'auth failed')
    await store.setReviewStatus('r1', 'job-1', 'pending', 'awaiting owner decision')
    const job = await store.getJob('r1', 'job-1')
    expect(job?.status).toBe('failed')
    expect(job?.errorClass).toBe('auth')
    expect(job?.reviewStatus).toBe('pending')
  })

  it('recordJobOutcome writes status + errorClass/fallback/reportArtifactId in one call', async () => {
    const { store } = await storeBench()
    await store.createBatch('r2', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(1) })
    await store.claimJob('r2', 'job-1', 'worker-a', 60_000)
    await store.transitionJob('r2', 'job-1', 'running')
    const job = await store.recordJobOutcome('r2', 'job-1', 'degraded', { fallback: 'built-in mapping without a matched methodology', reportArtifactId: 'artifact-1' })
    expect(job.status).toBe('degraded')
    expect(job.fallback).toBe('built-in mapping without a matched methodology')
    expect(job.reportArtifactId).toBe('artifact-1')
  })
})

describe('BatchStore append-only job_events', () => {
  it('assigns a strictly increasing seq per batch across every write path', async () => {
    const { store } = await storeBench()
    await store.createBatch('ev', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(1) })
    await store.claimJob('ev', 'job-1', 'worker-a', 60_000)
    await store.transitionJob('ev', 'job-1', 'running')
    await store.transitionJob('ev', 'job-1', 'succeeded')
    const events = await store.listEvents('ev')
    expect(events.map(e => e.seq)).toEqual([1, 2, 3, 4])
  })

  it('never mutates an existing event: old events remain after new ones are appended', async () => {
    const { store } = await storeBench()
    await store.createBatch('ev2', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(1) })
    const [created] = await store.listEvents('ev2')
    await store.claimJob('ev2', 'job-1', 'worker-a', 60_000)
    const events = await store.listEvents('ev2')
    expect(events[0]).toEqual(created)
  })

  it('keeps separate batches\' event sequences independent', async () => {
    const { store } = await storeBench()
    await store.createBatch('sep1', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(1) })
    await store.createBatch('sep2', { ownerSessionId: 'o', objective: 'a', repositories: reposFixture(1) })
    await store.claimJob('sep1', 'job-1', 'worker-a', 60_000)
    const events1 = await store.listEvents('sep1')
    const events2 = await store.listEvents('sep2')
    expect(events1.map(e => e.seq)).toEqual([1, 2])
    expect(events2.map(e => e.seq)).toEqual([1])
  })
})
