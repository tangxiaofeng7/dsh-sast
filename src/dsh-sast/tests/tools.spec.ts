/**
 * Behavior of the model-facing `sast_*` tools over the real store: the audit
 * chain (scan → intent → fact → derived intent → finding), the asset graph,
 * session scoping, referential validation, path hardening (ADR-03),
 * deterministic ids, and the non-agent rejection.
 * @module
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { sastDomainSpec } from '../src/spec.ts'
import { sastHarness, SESSION_ID } from './harness.ts'

// sast_start_scan's remote-provider path is exercised end-to-end against a
// real local git repo in tests/ingest/clone.spec.ts; here cloneRepo is
// mocked so this file never depends on network access or spawns git.
vi.mock('../src/ingest/clone.ts', () => ({
  cloneRepo: vi.fn(async (input: { repoUrl: string; branch?: string }) => {
    if (input.repoUrl.includes('unreachable')) {
      throw new Error(`sast: failed to clone ${input.repoUrl}: mocked failure`)
    }
    return { workspacePath: clonedWorkspacePath, commit: 'a'.repeat(40), branch: input.branch ?? 'main' }
  }),
}))
vi.mock('../src/ingest/sandbox.ts', () => ({ hardenWorkspaceReadOnly: vi.fn(async () => {}) }))

let workspacePath: string
let clonedWorkspacePath: string

beforeEach(() => {
  workspacePath = mkdtempSync(join(tmpdir(), 'sast-tools-'))
  mkdirSync(join(workspacePath, 'src', 'dao'), { recursive: true })
  writeFileSync(join(workspacePath, 'src', 'dao', 'OrderDao.java'), 'line1\nline2\nline3\n')
  writeFileSync(join(workspacePath, 'README.md'), 'hello\n')
  clonedWorkspacePath = workspacePath
})

afterEach(() => {
  vi.restoreAllMocks()
  rmSync(workspacePath, { recursive: true, force: true })
})

/** Start a scan against the fixture workspace (provider: local skips cloning). */
function startScan(call: (name: string, args: unknown, sessionId: string) => Promise<unknown>, sessionId = SESSION_ID): Promise<unknown> {
  return call('sast_start_scan', { repoUrl: workspacePath, objective: 'find sqli', authorization: 'CTO signed off' }, sessionId)
}

/** The recorded write results of one full chain. */
interface ChainWrites {
  scan: Record<string, unknown>
  intentA: Record<string, unknown>
  fact: Record<string, unknown>
  intentB: Record<string, unknown>
  finding: Record<string, unknown>
}

/** Drive one full audit chain and return the recorded write results. */
async function fullChain(
  call: (name: string, args: unknown, sessionId: string) => Promise<unknown>,
): Promise<ChainWrites> {
  const scan = await startScan(call) as Record<string, unknown>
  const intentA = await call('sast_add_intent', { scanId: scan.id, title: '测绘控制器与路由', detail: 'scope src/' }, SESSION_ID) as Record<string, unknown>
  const fact = await call('sast_add_fact', {
    intentId: intentA.id, kind: 'sink', path: 'src/dao/OrderDao.java', line: 2, detail: '字符串拼接进入 SQL', confidence: 0.9,
  }, SESSION_ID) as Record<string, unknown>
  const intentB = await call('sast_add_intent', { derivedFromFactId: fact.id, title: '验证 SQL 注入' }, SESSION_ID) as Record<string, unknown>
  const finding = await call('sast_add_finding', {
    intentId: intentB.id, title: 'SQL injection in OrderDao', severity: 'high',
    codePath: [{ path: 'src/dao/OrderDao.java', line: 2, symbol: 'selectByKeyword' }],
    description: 'Injectable parameter',
  }, SESSION_ID) as Record<string, unknown>
  return { scan, intentA, fact, intentB, finding }
}

describe('sast_start_scan', () => {
  it('records the scan with a deterministic id, redacted repoUrl, and authorization', async () => {
    const { call } = await sastHarness()
    const scan = await startScan(call) as Record<string, unknown>
    expect(scan).toMatchObject({ id: 'scan-1', repoUrl: workspacePath, provider: 'local' })
    const view = await call('sast_state', {}, SESSION_ID) as Record<string, unknown>
    expect(view).toMatchObject({ initialized: true })
    expect(view.scan).toMatchObject({ id: 'scan-1', authorization: 'CTO signed off' })
  })

  it('rejects a local repoUrl that does not exist', async () => {
    const { call } = await sastHarness()
    await expect(call('sast_start_scan', { repoUrl: join(workspacePath, 'nope'), objective: 'o' }, SESSION_ID))
      .rejects.toThrow(/does not exist or is not a directory/)
  })

  it('clones a remote repository, hardens it read-only, and records the redacted URL and resolved commit/branch', async () => {
    const { call } = await sastHarness()
    const scan = await call('sast_start_scan', {
      repoUrl: 'https://user:secrettoken@github.com/example/repo.git', objective: 'o', provider: 'github',
    }, SESSION_ID) as Record<string, unknown>
    expect(scan).toMatchObject({ provider: 'github', repoUrl: 'https://github.com/example/repo.git', branch: 'main', workspacePath })
    expect(scan.commit).toMatch(/^a{40}$/)
  })

  it('infers the provider from the URL when none is given', async () => {
    const { call } = await sastHarness()
    const scan = await call('sast_start_scan', { repoUrl: 'https://gitlab.com/group/project.git', objective: 'o' }, SESSION_ID) as Record<string, unknown>
    expect(scan.provider).toBe('gitlab')
  })

  it('rejects an unreachable remote repository with an actionable error and writes no scan row', async () => {
    const { call } = await sastHarness()
    await expect(call('sast_start_scan', { repoUrl: 'https://github.com/example/unreachable.git', objective: 'o' }, SESSION_ID))
      .rejects.toThrow(/failed to clone/)
    await expect(call('sast_state', {}, SESSION_ID)).resolves.toMatchObject({ initialized: false })
  })

  it('treats an explicit provider: local as a filesystem path even when it looks like a URL', async () => {
    const { call } = await sastHarness()
    await expect(call('sast_start_scan', { repoUrl: 'https://github.com/example/repo.git', objective: 'o', provider: 'local' }, SESSION_ID))
      .rejects.toThrow(/does not exist or is not a directory/)
  })

  it('resets the whole audit graph when a new scan is recorded', async () => {
    const { call } = await sastHarness()
    const { intentA } = await fullChain(call)
    expect(intentA.id).toBe('intent-1')
    await startScan(call)
    const view = await call('sast_state', {}, SESSION_ID) as Record<string, unknown>
    expect(view).toMatchObject({ counts: { intents: 0, facts: 0, findings: 0, assets: 0 } })
    // Counters restart: the first intent of the new scan is intent-1 again.
    const fresh = await call('sast_add_intent', { scanId: 'scan-1', title: 'fresh intent' }, SESSION_ID) as Record<string, unknown>
    expect(fresh.id).toBe('intent-1')
  })
})

describe('sast_add_intent', () => {
  it('rejects writes before sast_start_scan', async () => {
    const { call } = await sastHarness()
    await expect(call('sast_add_intent', { scanId: 'scan-1', title: 'x' }, SESSION_ID))
      .rejects.toThrow(/not initialized/)
  })

  it('requires exactly one anchor', async () => {
    const { call } = await sastHarness()
    await startScan(call)
    await expect(call('sast_add_intent', { title: 'x' }, SESSION_ID))
      .rejects.toThrow(/exactly one anchor/)
    await expect(call('sast_add_intent', { title: 'x', scanId: 'scan-1', derivedFromFactId: 'fact-1' }, SESSION_ID))
      .rejects.toThrow(/exactly one anchor/)
  })

  it('rejects an unknown scan anchor without changing the graph', async () => {
    const { call } = await sastHarness()
    await startScan(call)
    await expect(call('sast_add_intent', { scanId: 'scan-9', title: 'x' }, SESSION_ID))
      .rejects.toThrow(/unknown scan scan-9/)
    const state = await call('sast_state', {}, SESSION_ID) as { counts: unknown }
    expect(state.counts).toMatchObject({ intents: 0, facts: 0, findings: 0, assets: 0 })
  })

  it('records a spawns intent under the scan', async () => {
    const { call } = await sastHarness()
    await startScan(call)
    const write = await call('sast_add_intent', { scanId: 'scan-1', title: '测绘', detail: 'scope: src/' }, SESSION_ID) as Record<string, unknown>
    expect(write).toMatchObject({ id: 'intent-1', edgeId: 'edge-1', edgeKind: 'spawns', sourceId: 'scan-1' })
  })

  it('records a derived_from intent under a fact and rejects unknown anchors', async () => {
    const { call } = await sastHarness()
    await startScan(call)
    const intent = await call('sast_add_intent', { scanId: 'scan-1', title: 'a' }, SESSION_ID) as Record<string, unknown>
    const fact = await call('sast_add_fact', { intentId: intent.id, kind: 'info', path: 'README.md', detail: 'file present' }, SESSION_ID) as Record<string, unknown>
    const derived = await call('sast_add_intent', { derivedFromFactId: fact.id, title: 'b' }, SESSION_ID) as Record<string, unknown>
    expect(derived).toMatchObject({ id: 'intent-2', edgeKind: 'derived_from', sourceId: fact.id })
    await expect(call('sast_add_intent', { derivedFromFactId: 'fact-99', title: 'c' }, SESSION_ID))
      .rejects.toThrow(/unknown fact fact-99/)
  })

  it('requires skillId and checkId together, and rejects an unregistered skill', async () => {
    const { call } = await sastHarness()
    await startScan(call)
    await expect(call('sast_add_intent', { scanId: 'scan-1', title: 'x', skillId: 'sqli' }, SESSION_ID))
      .rejects.toThrow(/skillId and checkId together or neither/)
    await expect(call('sast_add_intent', { scanId: 'scan-1', title: 'x', skillId: 'sqli', checkId: 'check-1' }, SESSION_ID))
      .rejects.toThrow(/unknown skill sqli/)
  })
})

describe('sast_update_intent', () => {
  it('updates status and note, and rejects done -> pending', async () => {
    const { call } = await sastHarness()
    await startScan(call)
    const intent = await call('sast_add_intent', { scanId: 'scan-1', title: 'a' }, SESSION_ID) as Record<string, unknown>
    const running = await call('sast_update_intent', { intentId: intent.id, status: 'running', note: 'delegated' }, SESSION_ID) as Record<string, unknown>
    expect(running).toMatchObject({ id: intent.id, status: 'running', note: 'delegated' })
    const done = await call('sast_update_intent', { intentId: intent.id, status: 'done' }, SESSION_ID) as Record<string, unknown>
    expect(done.status).toBe('done')
    await expect(call('sast_update_intent', { intentId: intent.id, status: 'pending' }, SESSION_ID))
      .rejects.toThrow(/cannot move from done back to pending/)
  })

  it('rejects an unknown intent', async () => {
    const { call } = await sastHarness()
    await startScan(call)
    await expect(call('sast_update_intent', { intentId: 'intent-99', status: 'running' }, SESSION_ID))
      .rejects.toThrow(/unknown intent intent-99/)
  })
})

describe('sast_add_fact', () => {
  it('records a fact with a hardened path and defaults', async () => {
    const { call } = await sastHarness()
    await startScan(call)
    const intent = await call('sast_add_intent', { scanId: 'scan-1', title: 'a' }, SESSION_ID) as Record<string, unknown>
    const fact = await call('sast_add_fact', {
      intentId: intent.id, kind: 'sink', path: 'src/dao/OrderDao.java', line: 2, detail: '拼接 SQL', confidence: 0.9,
    }, SESSION_ID) as Record<string, unknown>
    expect(fact).toMatchObject({ id: 'fact-1', kind: 'sink', path: 'src/dao/OrderDao.java', line: 2, edgeId: 'edge-2' })
    await call('sast_add_fact', { intentId: intent.id, kind: 'info', path: 'README.md', detail: 'file present' }, SESSION_ID)
    const view = await call('sast_state', {}, SESSION_ID) as Record<string, unknown>
    expect(view.counts).toMatchObject({ facts: 2 })
  })

  it('rejects a path that does not exist in the workspace, with no partial write', async () => {
    const { call } = await sastHarness()
    await startScan(call)
    const intent = await call('sast_add_intent', { scanId: 'scan-1', title: 'a' }, SESSION_ID) as Record<string, unknown>
    await expect(call('sast_add_fact', { intentId: intent.id, kind: 'info', path: 'src/missing.ts', detail: 'x' }, SESSION_ID))
      .rejects.toThrow(/does not exist in the scan workspace/)
    const view = await call('sast_state', {}, SESSION_ID) as Record<string, unknown>
    expect(view.counts).toMatchObject({ facts: 0 })
  })

  it('rejects a path escaping the workspace', async () => {
    const { call } = await sastHarness()
    await startScan(call)
    const intent = await call('sast_add_intent', { scanId: 'scan-1', title: 'a' }, SESSION_ID) as Record<string, unknown>
    await expect(call('sast_add_fact', { intentId: intent.id, kind: 'info', path: '../../etc/passwd', detail: 'x' }, SESSION_ID))
      .rejects.toThrow(/not a valid repo-relative path/)
  })

  it('soft-clamps a line beyond the file\'s actual length and marks lineAdjusted', async () => {
    const { call } = await sastHarness()
    await startScan(call)
    const intent = await call('sast_add_intent', { scanId: 'scan-1', title: 'a' }, SESSION_ID) as Record<string, unknown>
    const fact = await call('sast_add_fact', {
      intentId: intent.id, kind: 'info', path: 'src/dao/OrderDao.java', line: 999, detail: 'x',
    }, SESSION_ID) as Record<string, unknown>
    expect(fact).toMatchObject({ line: 3, lineAdjusted: true })
  })

  it('rejects unknown intent references, including ids from another session', async () => {
    const { call } = await sastHarness()
    await startScan(call)
    await expect(call('sast_add_fact', { intentId: 'intent-99', kind: 'info', path: 'README.md', detail: 'x' }, SESSION_ID))
      .rejects.toThrow(/unknown intent intent-99/)
    await startScan(call, 'session-b')
    const foreign = await call('sast_add_intent', { scanId: 'scan-1', title: 'b' }, 'session-b') as Record<string, unknown>
    await expect(call('sast_add_fact', { intentId: foreign.id, kind: 'info', path: 'README.md', detail: 'x' }, SESSION_ID))
      .rejects.toThrow(/unknown intent intent-1/)
  })

  it('records a flows_to edge to an upstream fact', async () => {
    const { call } = await sastHarness()
    await startScan(call)
    const intent = await call('sast_add_intent', { scanId: 'scan-1', title: 'a' }, SESSION_ID) as Record<string, unknown>
    const upstream = await call('sast_add_fact', { intentId: intent.id, kind: 'source', path: 'README.md', detail: 'user input' }, SESSION_ID) as Record<string, unknown>
    const downstream = await call('sast_add_fact', {
      intentId: intent.id, kind: 'sink', path: 'src/dao/OrderDao.java', detail: 'sql sink', fromFactId: upstream.id,
    }, SESSION_ID) as Record<string, unknown>
    expect(downstream.flowEdgeId).toBeDefined()
  })
})

describe('sast_add_finding', () => {
  it('records a finding with a hardened codePath chain', async () => {
    const { call } = await sastHarness()
    await startScan(call)
    const intent = await call('sast_add_intent', { scanId: 'scan-1', title: 'a' }, SESSION_ID) as Record<string, unknown>
    const finding = await call('sast_add_finding', {
      intentId: intent.id, title: 'SQL injection', severity: 'high',
      codePath: [{ path: 'src/dao/OrderDao.java', line: 2, symbol: 'selectByKeyword' }],
      description: 'Injectable parameter', cwe: 'CWE-89',
    }, SESSION_ID) as Record<string, unknown>
    expect(finding).toMatchObject({ id: 'finding-1', title: 'SQL injection', severity: 'high', cwe: 'CWE-89', edgeId: 'edge-2' })
    const view = await call('sast_state', {}, SESSION_ID) as Record<string, unknown>
    expect(view.counts).toMatchObject({ findings: 1 })
  })

  it('rejects an empty codePath', async () => {
    const { call } = await sastHarness()
    await startScan(call)
    const intent = await call('sast_add_intent', { scanId: 'scan-1', title: 'a' }, SESSION_ID) as Record<string, unknown>
    await expect(call('sast_add_finding', { intentId: intent.id, title: 'x', severity: 'low', codePath: [] }, SESSION_ID))
      .rejects.toThrow(/at least one code location/)
  })

  it('rejects a codePath hop pointing outside the workspace, indexed', async () => {
    const { call } = await sastHarness()
    await startScan(call)
    const intent = await call('sast_add_intent', { scanId: 'scan-1', title: 'a' }, SESSION_ID) as Record<string, unknown>
    await expect(call('sast_add_finding', {
      intentId: intent.id, title: 'x', severity: 'low',
      codePath: [{ path: 'README.md' }, { path: 'src/missing.ts' }],
    }, SESSION_ID)).rejects.toThrow(/codePath\[1\]\.path/)
    const view = await call('sast_state', {}, SESSION_ID) as Record<string, unknown>
    expect(view.counts).toMatchObject({ findings: 0 })
  })

  it('links an affected asset and rejects unknown asset ids', async () => {
    const { call } = await sastHarness()
    await startScan(call)
    const intent = await call('sast_add_intent', { scanId: 'scan-1', title: 'a' }, SESSION_ID) as Record<string, unknown>
    const asset = await call('sast_add_asset', { type: 'file', value: 'README.md' }, SESSION_ID) as Record<string, unknown>
    const finding = await call('sast_add_finding', {
      intentId: intent.id, title: 'x', severity: 'low', codePath: [{ path: 'README.md' }], affectedAssetId: asset.id,
    }, SESSION_ID) as Record<string, unknown>
    expect(finding.id).toBe('finding-1')
    await expect(call('sast_add_finding', {
      intentId: intent.id, title: 'x', severity: 'low', codePath: [{ path: 'README.md' }], affectedAssetId: 'asset-99',
    }, SESSION_ID)).rejects.toThrow(/unknown asset asset-99/)
  })
})

describe('sast_add_asset', () => {
  it('records a root asset without an edge and a parented asset with a parent edge', async () => {
    const { call } = await sastHarness()
    await startScan(call)
    const root = await call('sast_add_asset', { type: 'repo', value: 'repo-root', meta: 'java' }, SESSION_ID) as Record<string, unknown>
    expect(root).toMatchObject({ id: 'asset-1', type: 'repo', value: 'repo-root' })
    expect(root.edgeId).toBeUndefined()
    const child = await call('sast_add_asset', { type: 'file', value: 'README.md', parentId: root.id }, SESSION_ID) as Record<string, unknown>
    expect(child).toMatchObject({ id: 'asset-2', edgeId: 'edge-1' })
  })

  it('hardens file/module asset values against the scan workspace', async () => {
    const { call } = await sastHarness()
    await startScan(call)
    await expect(call('sast_add_asset', { type: 'file', value: 'src/missing.ts' }, SESSION_ID))
      .rejects.toThrow(/does not exist in the scan workspace/)
    const module = await call('sast_add_asset', { type: 'module', value: 'src/dao' }, SESSION_ID) as Record<string, unknown>
    expect(module).toMatchObject({ type: 'module', value: 'src/dao' })
  })

  it('does not path-check entrypoint/package/datastore values', async () => {
    const { call } = await sastHarness()
    await startScan(call)
    const asset = await call('sast_add_asset', { type: 'package', value: 'log4j-core@2.14.0' }, SESSION_ID) as Record<string, unknown>
    expect(asset).toMatchObject({ type: 'package', value: 'log4j-core@2.14.0' })
  })

  it('accepts an empty-string parentId as a root asset', async () => {
    const { call } = await sastHarness()
    await startScan(call)
    const root = await call('sast_add_asset', { type: 'repo', value: 'repo-root', parentId: '' }, SESSION_ID) as Record<string, unknown>
    expect(root.edgeId).toBeUndefined()
  })
})

describe('sast_triage', () => {
  it('updates status and reason without deleting the finding', async () => {
    const { call } = await sastHarness()
    const { finding } = await fullChain(call)
    const triaged = await call('sast_triage', { findingId: finding.id, status: 'false-positive', reason: '已由白名单校验拦截' }, SESSION_ID) as Record<string, unknown>
    expect(triaged).toMatchObject({ id: finding.id, status: 'false-positive' })
    const view = await call('sast_state', {}, SESSION_ID) as { findings: Array<Record<string, unknown>> }
    expect(view.findings.find(f => f.id === finding.id)).toMatchObject({ status: 'false-positive', triageReason: '已由白名单校验拦截' })
  })

  it('requires a reason', async () => {
    const { call } = await sastHarness()
    const { finding } = await fullChain(call)
    await expect(call('sast_triage', { findingId: finding.id, status: 'wont-fix', reason: '' }, SESSION_ID))
      .rejects.toThrow()
  })
})

describe('sast_submit', () => {
  it('lets a delegated child submit a compact result into its parent intent', async () => {
    const { call, callAsChild, ctx } = await sastHarness()
    await startScan(call)
    const intent = await call('sast_add_intent', { scanId: 'scan-1', title: '审计登录' }, SESSION_ID) as { id: string }
    await expect(callAsChild('sast_submit', {
      intentId: intent.id,
      facts: [{ kind: 'sink', path: 'src/dao/OrderDao.java', detail: '拼接 SQL', confidence: 0.9 }],
      assets: [{ type: 'file', value: 'README.md' }],
      findings: [],
    }, SESSION_ID)).resolves.toEqual({ facts: 1, assets: 1, findings: 0 })
    const state = await call('sast_state', {}, SESSION_ID) as { facts: Array<{ detail: string }>; assets: Array<{ value: string }> }
    expect(state.facts).toEqual([expect.objectContaining({ detail: '拼接 SQL' })])
    expect(state.assets).toEqual([expect.objectContaining({ value: 'README.md' })])
    expect(ctx.sessions.get(SESSION_ID)?.events.some(event => event.type === 'sast/submit')).toBe(false)
    expect(ctx.sessions.get(SESSION_ID)?.events.some(event =>
      event.type === 'tool/call' && event.data.name === 'sast_add_asset',
    )).toBe(true)
  })

  it('rejects a root session without a parent target', async () => {
    const { call } = await sastHarness()
    await expect(call('sast_submit', { intentId: 'intent-1', facts: [], assets: [], findings: [] }, SESSION_ID))
      .rejects.toThrow(/only available to a delegated subagent/)
  })

  it('rejects a placeholder parent intent id without writing to the parent graph', async () => {
    const { call, callAsChild } = await sastHarness()
    await startScan(call)
    await call('sast_add_intent', { scanId: 'scan-1', title: '审计登录' }, SESSION_ID)
    await expect(callAsChild('sast_submit', {
      intentId: 'delegation-intent-id',
      facts: [{ path: 'README.md', detail: 'x' }],
      assets: [],
      findings: [],
    }, SESSION_ID)).rejects.toThrow(/concrete parent intent ID.*placeholder "delegation-intent-id"/)
    const state = await call('sast_state', {}, SESSION_ID) as { facts: unknown[] }
    expect(state.facts).toEqual([])
  })

  it('does not persist a child submission when its parent session is not live', async () => {
    const { call, callAsChildWithoutParent } = await sastHarness()
    await startScan(call)
    const intent = await call('sast_add_intent', { scanId: 'scan-1', title: 'a' }, SESSION_ID) as { id: string }
    await expect(callAsChildWithoutParent('sast_submit', {
      intentId: intent.id,
      facts: [{ path: 'README.md', detail: 'x' }],
      assets: [],
      findings: [],
    }, SESSION_ID)).rejects.toThrow(/parent session session-a is not live/)
  })

  it('rolls back the whole submission when any path is invalid, with no partial write', async () => {
    const { call, callAsChild, ctx } = await sastHarness()
    await startScan(call)
    const intent = await call('sast_add_intent', { scanId: 'scan-1', title: 'a' }, SESSION_ID) as { id: string }
    await expect(callAsChild('sast_submit', {
      intentId: intent.id,
      facts: [{ path: 'README.md', detail: 'ok fact' }],
      assets: [],
      findings: [{ title: 'bad finding', codePath: [{ path: 'src/missing.ts' }] }],
    }, SESSION_ID)).rejects.toThrow(/does not exist in the scan workspace/)
    const state = await call('sast_state', {}, SESSION_ID) as { facts: unknown[]; findings: unknown[] }
    expect(state.facts).toEqual([])
    expect(state.findings).toEqual([])
    expect(ctx.sessions.get(SESSION_ID)?.events.some(event =>
      event.type === 'tool/call' && event.data.name === 'sast_add_fact',
    )).toBe(false)
  })

  it('normalizes percentage confidence from a delegated child', async () => {
    const { call, callAsChild } = await sastHarness()
    await startScan(call)
    const intent = await call('sast_add_intent', { scanId: 'scan-1', title: 'a' }, SESSION_ID) as { id: string }
    await callAsChild('sast_submit', {
      intentId: intent.id,
      facts: [{ path: 'README.md', detail: 'x', confidence: '90%' }],
      assets: [],
      findings: [],
    }, SESSION_ID)
    const view = await call('sast_state', {}, SESSION_ID) as { facts: Array<{ confidence: number }> }
    expect(view.facts[0]?.confidence).toBe(0.9)
  })
})

describe('sast_state', () => {
  it('reports an uninitialized session without throwing', async () => {
    const { call } = await sastHarness()
    await expect(call('sast_state', {}, SESSION_ID)).resolves.toMatchObject({
      initialized: false, counts: { skills: 0, intents: 0, facts: 0, findings: 0, assets: 0 },
    })
  })

  it('keeps sessions isolated: a fresh session sees none of another session\'s records', async () => {
    const { call } = await sastHarness()
    await fullChain(call)
    await expect(call('sast_state', {}, 'session-b')).resolves.toMatchObject({ initialized: false })
    await expect(call('sast_add_fact', { intentId: 'intent-1', kind: 'info', path: 'README.md', detail: 'x' }, 'session-b'))
      .rejects.toThrow(/not initialized/)
  })
})

describe('sast_graph', () => {
  it('dumps the full audit graph as JSON, with skills separate from graph nodes', async () => {
    const { call } = await sastHarness()
    const { scan, intentA } = await fullChain(call)
    const graph = await call('sast_graph', {}, SESSION_ID) as Record<string, unknown>
    const body = graph.graph as Record<string, unknown>
    expect(body.scan).toMatchObject({ id: scan.id })
    expect(body.skills).toEqual([])
    expect((body.intents as unknown[]).length).toBeGreaterThanOrEqual(1)
    expect((body.edges as Array<{ sourceId: string }>).some(e => e.sourceId === intentA.id)).toBe(true)
  })
})

describe('sast_coverage', () => {
  it('reports zero checks with no registered skill and file coverage from touched paths', async () => {
    const { call } = await sastHarness()
    await fullChain(call)
    const coverage = await call('sast_coverage', {}, SESSION_ID) as Record<string, unknown>
    const checks = coverage.checks as Record<string, unknown>
    expect(checks).toMatchObject({ total: 0, covered: 0, coverageRatio: 0 })
    const files = coverage.files as Record<string, unknown>
    expect(files.touched).toBeGreaterThanOrEqual(1)
  })
})

describe('sast_register_skill', () => {
  it('resolves a runtime-registered Skill via ctx.skills and registers its checks', async () => {
    const { call, ctx } = await sastHarness()
    await startScan(call)
    ctx.skills.register({
      name: 'sqli',
      description: 'SQL injection audit checklist',
      source: 'user-dsh',
      content: '## check-1\ninspect raw queries',
      metadata: { sast: { category: 'taint', checks: [{ id: 'check-1', title: 'raw queries', scope: [] }] } },
    })
    const skill = await call('sast_register_skill', { name: 'sqli' }, SESSION_ID) as Record<string, unknown>
    expect(skill).toMatchObject({ id: 'sqli', sourceGroup: 'user', enabled: true, checks: [{ id: 'check-1', title: 'raw queries', scope: [] }] })
  })

  it('rejects an unknown skill name', async () => {
    const { call } = await sastHarness()
    await startScan(call)
    await expect(call('sast_register_skill', { name: 'ghost-skill' }, SESSION_ID))
      .rejects.toThrow(/unknown or no longer available/)
  })

  it('rejects a Skill whose metadata.sast is missing or malformed', async () => {
    const { call, ctx } = await sastHarness()
    await startScan(call)
    ctx.skills.register({ name: 'no-metadata', description: 'x', source: 'user-dsh', content: 'y' })
    await expect(call('sast_register_skill', { name: 'no-metadata' }, SESSION_ID))
      .rejects.toThrow(/metadata\.sast is missing/)
  })

  it('respects an explicit enabled: false', async () => {
    const { call, ctx } = await sastHarness()
    await startScan(call)
    ctx.skills.register({
      name: 'sqli',
      description: 'x',
      source: 'user-dsh',
      content: 'y',
      metadata: { sast: { checks: [{ id: 'check-1', title: 't', scope: [] }] } },
    })
    const skill = await call('sast_register_skill', { name: 'sqli', enabled: false }, SESSION_ID) as Record<string, unknown>
    expect(skill.enabled).toBe(false)
  })
})

describe('sast_report', () => {
  it('defaults to markdown and includes header metadata, summary, and the vulnerability detail', async () => {
    const { call } = await sastHarness()
    const { finding } = await fullChain(call)
    const report = await call('sast_report', {}, SESSION_ID) as { markdown: string }
    expect(report.markdown).toContain('# 白盒审计报告')
    expect(report.markdown).toContain(`### ${finding.id}`)
    expect(report.markdown).toContain('## 审计概要')
  })

  it('emits a SARIF 2.1.0 log with one result per finding', async () => {
    const { call } = await sastHarness()
    const { finding } = await fullChain(call)
    const report = await call('sast_report', { format: 'sarif' }, SESSION_ID) as { sarif: { version: string; runs: Array<{ results: Array<{ partialFingerprints: { findingId: string } }> }> } }
    expect(report.sarif.version).toBe('2.1.0')
    expect(report.sarif.runs[0]!.results).toHaveLength(1)
    expect(report.sarif.runs[0]!.results[0]!.partialFingerprints).toEqual({ findingId: finding.id })
  })

  it('moves a triaged false-positive into SARIF suppressions without dropping the result', async () => {
    const { call } = await sastHarness()
    const { finding } = await fullChain(call)
    await call('sast_triage', { findingId: finding.id, status: 'false-positive', reason: '已由白名单校验拦截' }, SESSION_ID)
    const report = await call('sast_report', { format: 'sarif' }, SESSION_ID) as { sarif: { runs: Array<{ results: Array<{ suppressions?: unknown[] }> }> } }
    expect(report.sarif.runs[0]!.results).toHaveLength(1)
    expect(report.sarif.runs[0]!.results[0]!.suppressions).toBeDefined()
  })

  it('moves a triaged false-positive into the markdown excluded section', async () => {
    const { call } = await sastHarness()
    const { finding } = await fullChain(call)
    await call('sast_triage', { findingId: finding.id, status: 'false-positive', reason: '已由白名单校验拦截' }, SESSION_ID)
    const report = await call('sast_report', {}, SESSION_ID) as { markdown: string }
    expect(report.markdown).toContain('## 已排除（误报裁决）')
    expect(report.markdown).toContain(finding.id)
    expect(report.markdown).not.toContain(`### ${finding.id}`)
  })

  it('reports an uninitialized session without throwing', async () => {
    const { call } = await sastHarness()
    const report = await call('sast_report', {}, SESSION_ID) as { markdown: string }
    expect(report.markdown).toContain('未初始化')
  })
})

describe('domain spec sanity', () => {
  it('opens the sast domain via the facility used by the harness', async () => {
    const { facility } = await sastHarness()
    const domain = await facility.open(sastDomainSpec)
    expect(domain.table('scans')).toBeDefined()
    await domain.close()
  })
})
