/**
 * spike-D (docs/architecture.md §4/§6, the M5 hard gate): can the host
 * create/resume an independent repository-worker session — via
 * `ctx.agents.create/resume`, NOT `ctx.subagents.startContinuable` (that
 * path always produces `origin: 'subagent'`, exactly what this gate forbids
 * using to impersonate a worker) — and observe/cancel/resume it the way
 * `DurableBatchScheduler` needs to?
 *
 * VERIFIED. This drives the real `@deepseek-ai/dsh-agent-loop` package
 * (registered via `AgentRegistry.setFactory`) against a deterministic,
 * keyless `@deepseek-ai/dsh-llm-replay` adapter — no live model call, no
 * fake `AgentFactory` reimplementing the loop's own logic. Every assertion
 * below exercises the real integration point `createAgentWorkerFactory`
 * (`../../src/batch/worker.ts`) actually calls in production.
 *
 * The four checklist items (this repo's plan.md P2.0 point 2-4):
 *  1. The factory's created session has a distinct id from the owner,
 *     `origin !== 'subagent'`, carries `agentPreset`/`cwd` through, AND
 *     (the part `meta.agentPreset` alone does NOT give you — see
 *     `worker.ts`'s `mountPreset` doc) actually has the preset's tools
 *     composed onto its own scope, invisible from the global registry.
 *  2. Feeding a prompt and observing `whenIdle()` converges once the
 *     worker's turn actually finishes.
 *  3. `cancel()` + a deadline race drives a hung worker to idle without
 *     waiting for a model response that will never arrive.
 *  4. `dispose()` then `resume({ resumeSessionId })` (via a fresh factory
 *     instance, simulating a process restart) restores the same session.
 * @module
 */

import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import SessionStore from '@deepseek-ai/dsh-session'
import AgentRegistry from '@deepseek-ai/dsh-agent'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import LlmRuntime from '@deepseek-ai/dsh-llm'
import { installLlmReplay } from '@deepseek-ai/dsh-llm-replay'
import JsonlPersistence from '@deepseek-ai/dsh-session-persistence-jsonl'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import { Loader } from '@deepseek-ai/cordis-plugin-loader'
import AgentPresets from '@deepseek-ai/dsh-agent-presets'
import { scopeOf } from '@deepseek-ai/dsh-scope'
import { deadline } from '@deepseek-ai/dsh-timeout'
import { createAgentWorkerFactory } from '../../src/batch/worker.ts'

const TEST_AGENT_OPTIONS = { provider: 'test', model: 'test-model' }

/** One recorded session.jsonl: a single turn, one text block, no tool calls — enough for replay to derive a `finish` script. */
function fixtureLines(now: number): string {
  return [
    { seq: 0, kind: 'session/created', at: now, data: { id: 'fixture-session', createdAt: now } },
    { seq: 1, kind: 'turn/start', at: now + 1, data: { turn: 0 } },
    { seq: 2, kind: 'assistant/chunk', at: now + 2, data: { turn: 0, step: 0, chunk: { type: 'block-start', index: 0, block: { type: 'text' } } } },
    { seq: 3, kind: 'assistant/chunk', at: now + 3, data: { turn: 0, step: 0, chunk: { type: 'text-delta', index: 0, delta: 'audited' } } },
    { seq: 4, kind: 'assistant/chunk', at: now + 4, data: { turn: 0, step: 0, chunk: { type: 'block-end', index: 0 } } },
    { seq: 5, kind: 'assistant/chunk', at: now + 5, data: { turn: 0, step: 0, chunk: { type: 'finish', reason: 'stop' } } },
    { seq: 6, kind: 'turn/end', at: now + 6, data: { turn: 0 } },
  ].map(line => JSON.stringify(line)).join('\n') + '\n'
}

/**
 * A minimal real preset directory (not this repo's actual preset/sast/ — a
 * self-contained fixture) so `ctx.agentPresets.mount()` has something to
 * compose. Registers one marker tool ONLY inside the preset's own scope
 * layer, so a test can assert the mount actually happened (the marker is
 * invisible globally, but visible from the created worker's own scope) —
 * proving `createAgentWorkerFactory`'s `setup` really drives that seam
 * rather than a no-op stub.
 */
function writeMinimalPreset(presetsRoot: string): void {
  const presetDir = join(presetsRoot, 'sast')
  mkdirSync(presetDir, { recursive: true })
  writeFileSync(join(presetDir, 'agent.cordis.yml'), `
- id: marker-tool
  name: './marker-tool-plugin.mjs'
`)
  writeFileSync(join(presetDir, 'marker-tool-plugin.mjs'), `
export const name = 'marker-tool-plugin'
export const inject = ['tools']
export function apply(ctx) {
  ctx.tools.register({
    name: 'sast_preset_marker',
    description: 'test-only marker proving preset composition reached this worker scope',
    parameters: { type: 'object', properties: {} },
    output: { schema: { type: 'string' }, render: () => [] },
    execute: async () => 'marker',
  })
}
`)
}

/** Boot a minimal but real agent-loop host: session store, tools, system prompt, LLM runtime, agent registry, agent-presets (backed by a real fixture preset directory), and (backed by dsh-agent-loop) the factory `ctx.agents.create/resume` need. */
async function bootAgentLoopHost(scratchDir: string, persistenceRoot?: string): Promise<Context> {
  const ctx = new Context()
  await ctx.plugin(SessionStore)
  await ctx.plugin(SystemPrompt, { persona: '' })
  await ctx.plugin(ToolRuntime)
  await ctx.plugin(LlmRuntime)
  await ctx.plugin(AgentRegistry)
  await ctx.plugin(Loader)
  const presetsRoot = join(scratchDir, 'presets')
  writeMinimalPreset(presetsRoot)
  await ctx.plugin(AgentPresets, { default: 'sast', roots: [{ path: presetsRoot, trust: 'user' }], includeUserRoot: false })
  if (persistenceRoot !== undefined) {
    await ctx.plugin(JsonlPersistence, { root: persistenceRoot })
  }
  await ctx.plugin(AgentLoop, { agents: [] })
  return ctx
}

let scratchDir: string

beforeEach(() => {
  scratchDir = mkdtempSync(join(tmpdir(), 'sast-spike-d-'))
})

afterEach(() => {
  rmSync(scratchDir, { recursive: true, force: true })
})

describe('spike-D: independent repository worker session (M5 hard gate) — VERIFIED', () => {
  it('creates a worker session with a distinct id, origin !== subagent, and agentPreset/cwd carried through', async () => {
    const ctx = await bootAgentLoopHost(scratchDir)
    const fixturePath = join(scratchDir, 'session.jsonl')
    writeFileSync(fixturePath, fixtureLines(Date.now()))
    const replay = installLlmReplay(ctx, { file: fixturePath })
    const factory = createAgentWorkerFactory(ctx, { agentOptions: TEST_AGENT_OPTIONS })

    const ownerSessionId = 'owner-batch-session'
    const worker = await factory.create({
      sessionId: 'worker-batch1-1-1',
      cwd: '/tmp/some-readonly-clone',
      batchId: 'batch1',
      job: { id: 'job-1', batchId: 'batch1', ordinal: 1, repoSpec: { provider: 'local', repoUrl: '/tmp/some-readonly-clone', scope: [] }, attempt: 1, status: 'preparing', reviewStatus: 'none', createdAt: 0, updatedAt: 0 },
    })
    const header = ctx.sessions.get(worker.sessionId as never)?.header
    expect(header?.id).not.toBe(ownerSessionId)
    expect(header?.origin).not.toBe('subagent')
    expect(header?.agentPreset).toBe('sast')
    expect(header?.cwd).toBe('/tmp/some-readonly-clone')

    // Proves `setup: mountPreset` really composed the preset's tools onto
    // the worker's OWN scope — not merely that `mount()` didn't throw, and
    // not that the marker leaked globally (see worker.ts's module doc:
    // `meta.agentPreset` alone composes nothing).
    const agentCtx = (ctx.agents.get(worker.sessionId as never) as { ctx: Context } | undefined)?.ctx
    expect(agentCtx).toBeDefined()
    const workerScope = scopeOf(agentCtx!)
    expect(ctx.tools.get('sast_preset_marker', workerScope)).toBeTruthy()
    expect(ctx.tools.get('sast_preset_marker')).toBeFalsy()

    worker.start('audit this repo')
    await worker.whenIdle()
    await worker.dispose()
    replay.assertConsumed()
  })

  it('cancel() plus a deadline race drives a hung worker to idle without waiting for a model response that never arrives', async () => {
    const ctx = await bootAgentLoopHost(scratchDir)
    const fixturePath = join(scratchDir, 'session.jsonl')
    const overridePath = join(scratchDir, 'session.jsonl.override.json')
    writeFileSync(fixturePath, fixtureLines(Date.now()))
    writeFileSync(overridePath, JSON.stringify([{ kind: 'hang' }]))
    installLlmReplay(ctx, { file: fixturePath, overrideFile: overridePath })
    const factory = createAgentWorkerFactory(ctx, { agentOptions: TEST_AGENT_OPTIONS })

    const worker = await factory.create({
      sessionId: 'worker-hanging-job',
      cwd: scratchDir,
      batchId: 'batch1',
      job: { id: 'job-1', batchId: 'batch1', ordinal: 1, repoSpec: { provider: 'local', repoUrl: scratchDir, scope: [] }, attempt: 1, status: 'preparing', reviewStatus: 'none', createdAt: 0, updatedAt: 0 },
    })
    worker.start('audit this repo')

    using timer = deadline(undefined, 200, 'SAST_JOB_TIMEOUT')
    const idlePromise = worker.whenIdle().then(() => 'idle' as const)
    const timeoutPromise = new Promise<'timeout'>((resolve) => timer.signal.addEventListener('abort', () => resolve('timeout'), { once: true }))
    const winner = await Promise.race([idlePromise, timeoutPromise])
    expect(winner).toBe('timeout')

    worker.cancel('SAST_JOB_TIMEOUT')
    await worker.whenIdle()
    await worker.dispose()
  })

  it('dispose() then resume({ resumeSessionId }) via a fresh factory instance restores the same session (A21: process-restart recovery)', async () => {
    const persistenceRoot = mkdtempSync(join(tmpdir(), 'sast-spike-d-persist-'))
    const ctx = await bootAgentLoopHost(scratchDir, persistenceRoot)
    const fixturePath = join(scratchDir, 'session.jsonl')
    writeFileSync(fixturePath, fixtureLines(Date.now()))
    const replay = installLlmReplay(ctx, { file: fixturePath })
    const factory = createAgentWorkerFactory(ctx, { agentOptions: TEST_AGENT_OPTIONS })

    const sessionId = 'worker-resumable-job'
    const worker = await factory.create({
      sessionId,
      cwd: scratchDir,
      batchId: 'batch1',
      job: { id: 'job-1', batchId: 'batch1', ordinal: 1, repoSpec: { provider: 'local', repoUrl: scratchDir, scope: [] }, attempt: 1, status: 'preparing', reviewStatus: 'none', createdAt: 0, updatedAt: 0 },
    })
    worker.start('audit this repo')
    await worker.whenIdle()
    const session = ctx.sessions.get(sessionId as never)
    if (session !== undefined) await ctx.sessions.flush(session)
    await worker.dispose()
    replay.assertConsumed()

    // A brand-new host + factory instance, simulating a process restart —
    // the ONLY thing carrying the session across is durable persistence.
    const ctx2 = await bootAgentLoopHost(scratchDir, persistenceRoot)
    const factory2 = createAgentWorkerFactory(ctx2, { agentOptions: TEST_AGENT_OPTIONS })
    const resumed = await factory2.resume(sessionId)
    expect(resumed.sessionId).toBe(sessionId)
    await resumed.dispose()
  })
})
