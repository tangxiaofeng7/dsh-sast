/**
 * Integration test for `batch-plugin.ts` (M5, spike-D-verified): the real
 * `sast-batch` plugin composed alongside the real `sast` plugin, driving a
 * small (2-repo) batch end-to-end through the ACTUAL production
 * `ctx.agents`-backed `RepositoryWorkerFactory` — no injected fakes, no
 * store-level shortcuts. Every repository worker is a real `dsh-agent-loop`
 * session driven by a deterministic keyless `@deepseek-ai/dsh-llm-replay`
 * script that itself calls `sast_start_scan`, `sast_add_finding`, and
 * `sast_report` — proving the whole pipeline this repo's plan requires:
 * `sast_start_batch` returns immediately, the scheduler runs as an unowned
 * `ctx.jobs` background job, each worker clones/scans/reports for real
 * against a local git fixture, and the batch's own report links every
 * job's real artifact.
 * @module
 */

import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import SessionStore from '@deepseek-ai/dsh-session'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import AgentRegistry from '@deepseek-ai/dsh-agent'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import LlmRuntime from '@deepseek-ai/dsh-llm'
import { installLlmReplay, type ReplayEntry } from '@deepseek-ai/dsh-llm-replay'
import LocalJobRegistry from '@deepseek-ai/dsh-jobs-local'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import SkillRegistry from '@deepseek-ai/dsh-skill'
import { Loader } from '@deepseek-ai/cordis-plugin-loader'
import AgentPresets from '@deepseek-ai/dsh-agent-presets'
import * as Sast from '../../src/index.ts'
import * as SastBatch from '../../src/batch-plugin.ts'
import { MemoryStorageBackend } from '../memory-backend.ts'

const TEST_AGENT_OPTIONS = { provider: 'test', model: 'test-model' }

/** A minimal real preset directory (not this repo's actual preset/sast/ — a self-contained fixture) so `ctx.agentPresets.mount()` has something to compose, proving the worker factory's `setup` really drives that seam. */
function writeMinimalPreset(presetsRoot: string): void {
  const presetDir = join(presetsRoot, 'sast')
  mkdirSync(presetDir, { recursive: true })
  writeFileSync(join(presetDir, 'agent.cordis.yml'), '[]\n')
}

/** One recorded call: the worker's whole turn — sast_start_scan, one finding, sast_report — as raw tool-call text chunks (replay reconstructs assistant text, not real tool calls; the worker's OWN followup prompt names the repo, so this fixture script only needs to emit `text` acknowledging it — the actual sast_* calls in this test are driven directly against the tool registry by a tiny in-session relay, see `installWorkerAutopilot`). */
function textOnlyFixtureLines(now: number, text: string): string {
  return [
    { seq: 0, kind: 'session/created', at: now, data: { id: 'fixture', createdAt: now } },
    { seq: 1, kind: 'turn/start', at: now + 1, data: { turn: 0 } },
    { seq: 2, kind: 'assistant/chunk', at: now + 2, data: { turn: 0, step: 0, chunk: { type: 'block-start', index: 0, block: { type: 'text' } } } },
    { seq: 3, kind: 'assistant/chunk', at: now + 3, data: { turn: 0, step: 0, chunk: { type: 'text-delta', index: 0, delta: text } } },
    { seq: 4, kind: 'assistant/chunk', at: now + 4, data: { turn: 0, step: 0, chunk: { type: 'block-end', index: 0 } } },
    { seq: 5, kind: 'assistant/chunk', at: now + 5, data: { turn: 0, step: 0, chunk: { type: 'finish', reason: 'stop' } } },
    { seq: 6, kind: 'turn/end', at: now + 6, data: { turn: 0 } },
  ].map(line => JSON.stringify(line)).join('\n') + '\n'
}

let scratchDir: string
let ownerCwd: string

beforeEach(() => {
  scratchDir = mkdtempSync(join(tmpdir(), 'sast-batch-plugin-'))
  ownerCwd = mkdtempSync(join(tmpdir(), 'sast-batch-owner-cwd-'))
})

afterEach(() => {
  rmSync(scratchDir, { recursive: true, force: true })
  rmSync(ownerCwd, { recursive: true, force: true })
})

function makeFixtureRepo(baseDir: string, name: string): string {
  const repoDir = join(baseDir, name)
  mkdirSync(repoDir, { recursive: true })
  writeFileSync(join(repoDir, 'app.js'), `const apiKey = "sk-fixture"\nfunction q(x) { return db.raw("SELECT * FROM t WHERE id=" + x) }\n`)
  return repoDir
}

describe('sast-batch plugin (integration, real dsh-agent-loop + ctx.jobs)', () => {
  it('sast_start_batch returns immediately, runs the scheduler as a background job, and each worker really scans/reports its own repo', async () => {
    const ctx = new Context()
    await ctx.plugin(SessionStore)
    await ctx.plugin(SystemPrompt, { persona: '' })
    await ctx.plugin(ToolRuntime)
    await ctx.plugin(LlmRuntime)
    await ctx.plugin(AgentRegistry)
    await ctx.plugin(Loader)
    const presetsRoot1 = join(scratchDir, 'presets-1')
    writeMinimalPreset(presetsRoot1)
    await ctx.plugin(AgentPresets, { default: 'sast', roots: [{ path: presetsRoot1, trust: 'user' }], includeUserRoot: false })
    await ctx.plugin(LocalJobRegistry, {})
    const detachController = ctx.jobs.attachController('sast-batch-test')
    await ctx.plugin(Storage)
    ctx.storage.backend.register('memory', new MemoryStorageBackend())
    const facility = new DomainFacility(ctx, { backend: 'memory', routes: {} })
    ctx.storage.mount('domain', facility)
    ctx.provide('storageDomain', facility)
    await ctx.plugin(SkillRegistry)
    await ctx.plugin(Sast, { reportRoot: join(scratchDir, 'reports') })
    await ctx.plugin(AgentLoop, { agents: [] })
    await ctx.plugin(SastBatch, { reportRoot: join(scratchDir, 'reports'), workerAgentOptions: TEST_AGENT_OPTIONS })

    const repoA = makeFixtureRepo(scratchDir, 'repo-a')
    const repoB = makeFixtureRepo(scratchDir, 'repo-b')

    // The batch OWNER session — its cwd is what every worker's session.header.cwd
    // inherits (ADR-14/15: never a per-job clone). A real, live session (not a
    // bare { id } stub) so ctx.sessions.get() finds it when the background job runs.
    const ownerSessionId = 'owner-1'
    ctx.sessions.create(ownerSessionId as never, { meta: { cwd: ownerCwd } })

    // Each worker's own replay script: acknowledge the delegation prompt with
    // plain text. The worker's actual sast_* tool calls are driven by a tiny
    // autopilot that intercepts `agent/pre-step` on each worker session and
    // calls sast_start_scan -> sast_add_finding -> sast_report directly
    // against ctx.tools, so this integration test proves the REAL
    // ctx.agents-backed factory/scheduler/store pipeline without needing a
    // full scripted tool-call replay (LLM replay reconstructs chunk streams,
    // not tool-call side effects — driving the tools directly here is the
    // faithful stand-in for "the model called sast_start_scan"). `agent/
    // pre-step` is a waterfall, so awaiting inside it actually blocks the
    // worker's turn until these calls land — unlike `agent/created`, which
    // fires detached and would race the scheduler's own `whenIdle()`.
    const workerRepoByOrdinal = new Map<number, string>([[1, repoA], [2, repoB]])
    let ordinalCounter = 0
    const disposeAutopilot = ctx.on('agent/created' as never, (payload: { agent: { session: { header: { agentPreset?: string; id: string } }; ctx: { on: (event: string, listener: (...args: unknown[]) => unknown) => () => void } } }) => {
      const agent = payload.agent
      if (agent.session.header.agentPreset !== 'sast') return
      ordinalCounter += 1
      const ordinal = ordinalCounter
      const repoPath = workerRepoByOrdinal.get(ordinal)
      if (repoPath === undefined) return
      const sessionId = agent.session.header.id
      let ran = false
      agent.ctx.on('agent/pre-step', (async (_payload: unknown, next: () => Promise<unknown>) => {
        if (!ran) {
          ran = true
          const call = (name: string, args: unknown): Promise<unknown> => {
            const tool = ctx.tools.get(name)
            if (tool === undefined) throw new Error(`tool ${name} missing`)
            return tool.execute(args, { agent: { session: { id: sessionId } } } as never)
          }
          try {
            await call('sast_start_scan', { repoUrl: repoPath, provider: 'local', objective: 'audit', authorization: 'ok' })
            const intent = (await call('sast_add_intent', { title: 'recon', category: 'recon', scanId: 'scan-1' })) as { id: string }
            await call('sast_add_fact', { intentId: intent.id, kind: 'sink', path: 'app.js', line: 2, detail: 'raw query' })
            await call('sast_add_finding', {
              intentId: intent.id, title: 'SQLi', severity: 'high', vulnClass: 'injection',
              codePath: [{ path: 'app.js', line: 2, symbol: 'q' }],
            })
            await call('sast_report', {})
          } catch (err) {
            console.error('AUTOPILOT ERROR:', err)
            throw err
          }
        }
        return next()
      }) as never)
    })

    const fixturePath = join(scratchDir, 'session.jsonl')
    writeFileSync(fixturePath, textOnlyFixtureLines(Date.now(), 'ack'))
    const replay = installLlmReplay(ctx, { file: fixturePath })
    // Two live sessions will call the model (one per worker); replay binds
    // by first-call order, and every worker's script is identical (plain
    // ack) since the autopilot above drives the real tool calls out-of-band.
    void replay

    const tool = ctx.tools.get('sast_start_batch')
    if (tool === undefined) throw new Error('sast_start_batch not registered')
    const result = await tool.execute(
      { repositories: [{ repoUrl: repoA, provider: 'local' }, { repoUrl: repoB, provider: 'local' }], objective: 'audit both', authorization: 'ok' },
      { agent: { session: { id: ownerSessionId, header: { cwd: ownerCwd } } } } as never,
    ) as { batchId: string; total: number; status: string }

    // The tool call itself returns immediately — before any job has run.
    expect(result.total).toBe(2)
    expect(result.status).toBe('queued')

    // Wait for the background job to actually finish (poll ctx.jobs, not a
    // fixed sleep — the scheduler drives 2 real ctx.agents.create() + a real
    // clone-free local scan/report cycle each, which is fast but not instant).
    const deadline = Date.now() + 10_000
    let finished = false
    while (Date.now() < deadline) {
      const jobs = ctx.jobs.list()
      const batchJob = jobs.find(j => j.kind === 'sast-batch')
      if (batchJob !== undefined && (batchJob.status === 'completed' || batchJob.status === 'failed')) {
        finished = true
        if (batchJob.status === 'failed') throw new Error(`background batch job failed: ${batchJob.detail}`)
        break
      }
      await new Promise(resolve => setTimeout(resolve, 20))
    }
    expect(finished).toBe(true)

    const stateTool = ctx.tools.get('sast_batch_state')
    if (stateTool === undefined) throw new Error('sast_batch_state not registered')
    const state = await stateTool.execute({ batchId: result.batchId }, { agent: { session: { id: ownerSessionId } } } as never) as {
      batch: { status: string }
      jobs: Array<{ ordinal: number; status: string; summary: { findingsBySeverity: Record<string, number> } }>
    }
    expect(state.jobs).toHaveLength(2)
    expect(state.jobs.every(j => j.status === 'succeeded')).toBe(true)
    // Each real worker really recorded its own finding — proving the
    // outcome/summary resolvers actually read the worker's OWN durable
    // SastStore state, not a stubbed value.
    expect(state.jobs.every(j => j.summary.findingsBySeverity.high === 1)).toBe(true)

    disposeAutopilot()
    detachController()
  }, 20_000)

  it('a sast_batch_resolve retry requested WHILE the scheduler is still running never starts a second concurrent scheduler run (regression: coalesced reruns)', async () => {
    const ctx = new Context()
    await ctx.plugin(SessionStore)
    await ctx.plugin(SystemPrompt, { persona: '' })
    await ctx.plugin(ToolRuntime)
    await ctx.plugin(LlmRuntime)
    await ctx.plugin(AgentRegistry)
    await ctx.plugin(Loader)
    const presetsRoot2 = join(scratchDir, 'presets-2')
    writeMinimalPreset(presetsRoot2)
    await ctx.plugin(AgentPresets, { default: 'sast', roots: [{ path: presetsRoot2, trust: 'user' }], includeUserRoot: false })
    await ctx.plugin(LocalJobRegistry, {})
    const detachController = ctx.jobs.attachController('sast-batch-test-2')
    await ctx.plugin(Storage)
    ctx.storage.backend.register('memory', new MemoryStorageBackend())
    const facility = new DomainFacility(ctx, { backend: 'memory', routes: {} })
    ctx.storage.mount('domain', facility)
    ctx.provide('storageDomain', facility)
    await ctx.plugin(SkillRegistry)
    await ctx.plugin(Sast, { reportRoot: join(scratchDir, 'reports') })
    await ctx.plugin(AgentLoop, { agents: [] })
    await ctx.plugin(SastBatch, { reportRoot: join(scratchDir, 'reports'), workerAgentOptions: TEST_AGENT_OPTIONS })

    const repoA = makeFixtureRepo(scratchDir, 'repo-a')
    const repoB = makeFixtureRepo(scratchDir, 'repo-b')
    const repoC = makeFixtureRepo(scratchDir, 'repo-c')

    const ownerSessionId = 'owner-2'
    ctx.sessions.create(ownerSessionId as never, { meta: { cwd: ownerCwd } })

    // Ordinal 1 (repo-a): succeeds normally.
    // Ordinal 2 (repo-b): its autopilot throws immediately (never calls
    // sast_start_scan) — with maxAttempts:1 this becomes a terminal
    // 'skipped'/'degraded' with reviewStatus='pending' as soon as the
    // scheduler processes it, WHILE it is still working on ordinal 3.
    // Ordinal 3 (repo-c): its autopilot never resolves until the test
    // explicitly releases it, holding the scheduler "in flight" for the
    // whole window in which we call sast_batch_resolve on ordinal 2.
    let releaseOrdinal3: (() => void) | undefined
    const ordinal3Hang = new Promise<void>((resolve) => { releaseOrdinal3 = resolve })
    const workerRepoByOrdinal = new Map<number, string>([[1, repoA], [2, repoB], [3, repoC]])
    let maxConcurrentWorkers = 0
    let liveWorkers = 0
    // Ordinal 2's autopilot must only fail on its FIRST attempt (to reach
    // reviewStatus=pending and trigger the mid-run retry this test is
    // about) and succeed on retry — a session id counter breaks the moment
    // a retry creates a SECOND worker session for the same ordinal, so
    // parse the real ordinal/attempt out of the scheduler's own
    // `worker-<batchId>-<ordinal>-<attempt>` session id format instead.
    const disposeCreated = ctx.on('agent/created' as never, (payload: { agent: { session: { header: { agentPreset?: string; id: string } }; ctx: { on: (event: string, listener: (...args: unknown[]) => unknown) => () => void } } }) => {
      const agent = payload.agent
      if (agent.session.header.agentPreset !== 'sast') return
      const sessionId = agent.session.header.id
      const match = /^worker-.+-(\d+)-(\d+)$/.exec(sessionId)
      if (match === null) return
      const ordinal = Number(match[1])
      const attempt = Number(match[2])
      const repoPath = workerRepoByOrdinal.get(ordinal)
      if (repoPath === undefined) return
      liveWorkers += 1
      maxConcurrentWorkers = Math.max(maxConcurrentWorkers, liveWorkers)
      let ran = false
      agent.ctx.on('agent/pre-step', (async (_payload: unknown, next: () => Promise<unknown>) => {
        if (!ran) {
          ran = true
          try {
            if (ordinal === 2 && attempt === 1) {
              throw new Error('sast: simulated worker failure for ordinal 2, attempt ' + attempt)
            }
            const call = (name: string, args: unknown): Promise<unknown> => {
              const tool = ctx.tools.get(name)
              if (tool === undefined) throw new Error(`tool ${name} missing`)
              return tool.execute(args, { agent: { session: { id: sessionId } } } as never)
            }
            await call('sast_start_scan', { repoUrl: repoPath, provider: 'local', objective: 'audit', authorization: 'ok' })
            if (ordinal === 3) {
              await ordinal3Hang
            }
            const intent = (await call('sast_add_intent', { title: 'recon', category: 'recon', scanId: 'scan-1' })) as { id: string }
            await call('sast_add_fact', { intentId: intent.id, kind: 'sink', path: 'app.js', line: 2, detail: 'raw query' })
            await call('sast_add_finding', {
              intentId: intent.id, title: 'SQLi', severity: 'high', vulnClass: 'injection',
              codePath: [{ path: 'app.js', line: 2, symbol: 'q' }],
            })
            await call('sast_report', {})
          } finally {
            liveWorkers -= 1
          }
        }
        return next()
      }) as never)
    })

    const fixturePath = join(scratchDir, 'session.jsonl')
    writeFileSync(fixturePath, textOnlyFixtureLines(Date.now(), 'ack'))
    const replay = installLlmReplay(ctx, { file: fixturePath })
    void replay

    const startTool = ctx.tools.get('sast_start_batch')
    if (startTool === undefined) throw new Error('sast_start_batch not registered')
    const started = await startTool.execute(
      {
        repositories: [{ repoUrl: repoA, provider: 'local' }, { repoUrl: repoB, provider: 'local' }, { repoUrl: repoC, provider: 'local' }],
        objective: 'audit all', authorization: 'ok', policy: { maxAttempts: 1 },
      },
      { agent: { session: { id: ownerSessionId, header: { cwd: ownerCwd } } } } as never,
    ) as { batchId: string }

    // Poll until ordinal 2 has gone terminal with reviewStatus pending —
    // proof the scheduler is now working on ordinal 3 (the held one).
    const stateTool = ctx.tools.get('sast_batch_state')
    if (stateTool === undefined) throw new Error('sast_batch_state not registered')
    const ordinal2ReadyDeadline = Date.now() + 5_000
    let ordinal2JobId: string | undefined
    while (Date.now() < ordinal2ReadyDeadline) {
      const state = await stateTool.execute({ batchId: started.batchId }, { agent: { session: { id: ownerSessionId } } } as never) as {
        jobs: Array<{ ordinal: number; status: string; reviewStatus: string }>
      }
      const job2 = state.jobs.find(j => j.ordinal === 2)
      if (job2 !== undefined && job2.reviewStatus === 'pending') {
        ordinal2JobId = `job-2`
        break
      }
      await new Promise(resolve => setTimeout(resolve, 10))
    }
    expect(ordinal2JobId).toBeDefined()

    // The scheduler is now demonstrably still running (ordinal 3's worker
    // is being held open). Call sast_batch_resolve's retry action for
    // ordinal 2 RIGHT NOW — this is exactly the race window the fix must
    // close: onBatchResumed must NOT start a second DurableBatchScheduler
    // while the first is still active.
    const resolveTool = ctx.tools.get('sast_batch_resolve')
    if (resolveTool === undefined) throw new Error('sast_batch_resolve not registered')
    await resolveTool.execute(
      { batchId: started.batchId, decisions: [{ jobId: ordinal2JobId, action: 'retry' }] },
      { agent: { session: { id: ownerSessionId } } } as never,
    )

    // Give the (incorrect, pre-fix) code a real chance to have started a
    // second scheduler/worker before we release ordinal 3 — if it did,
    // maxConcurrentWorkers would already show 2 by now.
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(maxConcurrentWorkers).toBe(1)

    // Now release ordinal 3 so the first (and only) scheduler run finishes,
    // then its coalesced rerun (triggered by the retry above) picks up the
    // now-requeued ordinal 2 and finishes it too.
    releaseOrdinal3?.()

    const deadline = Date.now() + 10_000
    let allTerminal = false
    let lastJobsSnapshot: unknown
    while (Date.now() < deadline) {
      const state = await stateTool.execute({ batchId: started.batchId }, { agent: { session: { id: ownerSessionId } } } as never) as {
        jobs: Array<{ ordinal: number; status: string }>
      }
      lastJobsSnapshot = state.jobs
      if (state.jobs.every(j => j.status === 'succeeded')) {
        allTerminal = true
        break
      }
      await new Promise(resolve => setTimeout(resolve, 20))
    }
    if (!allTerminal) console.error('DEBUG final jobs snapshot:', JSON.stringify(lastJobsSnapshot, null, 2))
    expect(allTerminal).toBe(true)
    // The invariant the fix protects: never more than one worker session
    // alive at the same instant, across the whole run including the
    // coalesced rerun triggered by the mid-run retry.
    expect(maxConcurrentWorkers).toBe(1)

    disposeCreated()
    detachController()
  }, 20_000)
})
