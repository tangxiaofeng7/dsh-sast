/**
 * The standing `sastBatch` projection: the pure fold over the batch owner
 * session's logged `sast_batch_*` tool calls. Covers `sast_start_batch`
 * seeding the job list, `sast_batch_resolve` decisions (retry/accept-gap/
 * confirm-skip) only ever touching a `reviewStatus=pending` job, unrelated
 * jobs remaining untouched, the 100-row job cap, and — the session-
 * projection contract's hard requirement — an unrecognized event returning
 * the EXACT SAME state reference (`Object.is`), never a fresh clone.
 * @module
 */

import { describe, expect, it } from 'vitest'
import { CallId } from '@deepseek-ai/dsh-llm'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import { applySastBatchEvent, viewSastBatchState, BATCH_JOB_CAP } from '../../src/batch/projection.ts'
import type { SastBatchProjection } from '../../src/types.ts'

/** One tool/call event carrying the given sast_batch tool name and raw JSON arguments. */
function toolCall(name: string, args: string, seq = 1, callId = 'c1'): SessionEvent {
  return {
    type: 'tool/call',
    seq,
    time: seq,
    data: { turn: 1, step: 1, callId: CallId(callId), name, arguments: args },
  }
}

/** Fold a sequence of tool calls from `null`. */
function fold(...events: SessionEvent[]): SastBatchProjection | null {
  return events.reduce(applySastBatchEvent, null as SastBatchProjection | null)
}

function reposArg(n: number): string {
  return JSON.stringify(Array.from({ length: n }, (_, i) => ({ repoUrl: `/repo-${i + 1}` })))
}

describe('applySastBatchEvent', () => {
  it('is null before any sast_batch_* event', () => {
    expect(fold()).toBeNull()
  })

  it('sast_start_batch seeds the job list from repositories, one queued job per repo', () => {
    const state = fold(toolCall('sast_start_batch', `{"repositories":${reposArg(3)},"objective":"audit","authorization":"ok"}`))
    expect(state?.id).toBe('batch-1')
    expect(state?.total).toBe(3)
    expect(state?.jobs).toHaveLength(3)
    expect(state?.jobs.map(j => j.ordinal)).toEqual([1, 2, 3])
    expect(state?.jobs.every(j => j.status === 'queued' && j.reviewStatus === 'none')).toBe(true)
  })

  it('carries objective/authorization/methodology names through', () => {
    const state = fold(toolCall('sast_start_batch', `{"repositories":${reposArg(1)},"objective":"find sqli","authorization":"CTO signed","methodologies":["sqli"]}`))
    expect(state?.objective).toBe('find sqli')
    expect(state?.authorization).toBe('CTO signed')
    expect(state?.methodologies.map(m => m.name)).toEqual(['sqli'])
  })

  it('ignores an empty or oversized repositories list (never partially seeds)', () => {
    expect(fold(toolCall('sast_start_batch', '{"repositories":[],"objective":"a","authorization":"ok"}'))).toBeNull()
    const over = fold(toolCall('sast_start_batch', `{"repositories":${reposArg(BATCH_JOB_CAP + 1)},"objective":"a","authorization":"ok"}`))
    expect(over).toBeNull()
  })

  it('caps at 100 job rows for a full 100-repository batch', () => {
    const state = fold(toolCall('sast_start_batch', `{"repositories":${reposArg(BATCH_JOB_CAP)},"objective":"a","authorization":"ok"}`))
    expect(state?.jobs).toHaveLength(BATCH_JOB_CAP)
  })

  it('sast_batch_resolve retry moves the named job to queued/retried, leaving others untouched', () => {
    let state = fold(toolCall('sast_start_batch', `{"repositories":${reposArg(2)},"objective":"a","authorization":"ok"}`, 1))
    // Simulate the scheduler having already put job-1 into Review Inbox —
    // the fold cannot see that on its own (documented foldability limit),
    // so the test drives the state directly to exercise resolve's own logic.
    state = { ...state!, jobs: state!.jobs.map(j => j.ordinal === 1 ? { ...j, status: 'skipped', reviewStatus: 'pending' } : j) }
    const resolved = applySastBatchEvent(state, toolCall('sast_batch_resolve', '{"decisions":[{"jobId":"job-1","action":"retry","reason":"fixed token"}]}', 2))
    expect(resolved?.jobs[0]).toMatchObject({ ordinal: 1, status: 'queued', reviewStatus: 'retried' })
    expect(resolved?.jobs[1]).toMatchObject({ ordinal: 2, status: 'queued', reviewStatus: 'none' })
  })

  it('sast_batch_resolve accept-gap and confirm-skip set reviewStatus without touching job status', () => {
    let state = fold(toolCall('sast_start_batch', `{"repositories":${reposArg(2)},"objective":"a","authorization":"ok"}`, 1))
    state = {
      ...state!,
      jobs: state!.jobs.map(j => ({ ...j, status: 'degraded' as const, reviewStatus: 'pending' as const })),
    }
    const resolved = applySastBatchEvent(state, toolCall('sast_batch_resolve', '{"decisions":[{"jobId":"job-1","action":"accept-gap"},{"jobId":"job-2","action":"confirm-skip"}]}', 2))
    expect(resolved?.jobs[0]).toMatchObject({ status: 'degraded', reviewStatus: 'accepted' })
    expect(resolved?.jobs[1]).toMatchObject({ status: 'degraded', reviewStatus: 'confirmed-skip' })
  })

  it('sast_batch_resolve is a no-op for a job whose reviewStatus is not pending', () => {
    const state = fold(toolCall('sast_start_batch', `{"repositories":${reposArg(1)},"objective":"a","authorization":"ok"}`, 1))
    const resolved = applySastBatchEvent(state, toolCall('sast_batch_resolve', '{"decisions":[{"jobId":"job-1","action":"retry"}]}', 2))
    // job-1's reviewStatus is 'none' (never entered Review Inbox), so the
    // decision does not apply.
    expect(resolved?.jobs[0]).toMatchObject({ status: 'queued', reviewStatus: 'none' })
  })

  it('returns the exact same state reference for an event this projection does not care about (session-projection contract)', () => {
    const state = fold(toolCall('sast_start_batch', `{"repositories":${reposArg(1)},"objective":"a","authorization":"ok"}`))
    const unrelated = applySastBatchEvent(state, toolCall('sast_add_fact', '{"path":"a","detail":"b"}', 2))
    expect(unrelated).toBe(state)
  })

  it('returns null (unchanged) for an unrelated event before any batch exists', () => {
    const result = applySastBatchEvent(null, toolCall('sast_add_fact', '{"path":"a","detail":"b"}', 1))
    expect(result).toBeNull()
  })
})

describe('viewSastBatchState', () => {
  it('is the identity function over the fold state', () => {
    const state = fold(toolCall('sast_start_batch', `{"repositories":${reposArg(1)},"objective":"a","authorization":"ok"}`))
    expect(viewSastBatchState(state)).toBe(state)
  })
})
