/**
 * The standing `sast` projection: the pure fold over logged sast_* tool
 * calls (the audit graph with deterministic ids), the wire schema, and the
 * live registration through the session-projection seam (mounted harness,
 * driven by real session events).
 * @module
 */

import { describe, expect, it } from 'vitest'
import { CallId } from '@deepseek-ai/dsh-llm'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import {
  applySastEvent,
  applySastMounted,
  sastInitialState,
  sastMountedSchema,
  sastProjectionSchema,
  viewSastState,
  ASSET_CAP,
  EDGE_CAP,
  NODE_CAP,
} from '../src/projection.ts'
import type { SastFoldState } from '../src/projection.ts'
import { sastProjectionHarness } from './harness.ts'

/** One tool/call event carrying the given sast tool name and raw JSON arguments. */
function toolCall(name: string, args: string, seq = 1, callId = 'c1'): SessionEvent {
  return {
    type: 'tool/call',
    seq,
    time: seq,
    data: { turn: 1, step: 1, callId: CallId(callId), name, arguments: args },
  }
}

/** Fold a sequence of tool calls from the initial state. */
function fold(...events: SessionEvent[]): SastFoldState {
  return events.reduce(applySastEvent, sastInitialState)
}

/** The canonical full chain: scan → spawns intent → fact → derived intent → finding. */
function fullChainEvents(): SessionEvent[] {
  return [
    toolCall('sast_start_scan', '{"repoUrl":"/repo","objective":"find sqli","authorization":"signed"}', 1, 'g1'),
    toolCall('sast_add_intent', '{"scanId":"scan-1","title":"测绘控制器与路由","detail":"scope src/"}', 2, 'i1'),
    toolCall('sast_add_fact', '{"intentId":"intent-1","kind":"sink","path":"src/dao/OrderDao.java","line":88,"detail":"拼接 SQL","confidence":0.9}', 3, 'f1'),
    toolCall('sast_add_intent', '{"derivedFromFactId":"fact-1","title":"验证 SQL 注入"}', 4, 'i2'),
    toolCall('sast_add_finding', '{"intentId":"intent-2","title":"sqli","severity":"high","description":"injectable","codePath":[{"path":"src/dao/OrderDao.java","line":88}]}', 5, 'n1'),
  ]
}

describe('applySastEvent', () => {
  it('sast_start_scan resets to a fresh graph with the scan', () => {
    const state = fold(...fullChainEvents())
    const reset = applySastEvent(state, toolCall('sast_start_scan', '{"repoUrl":"/other","objective":"fresh"}', 6, 'g2'))
    expect(reset).toEqual({
      scan: { id: 'scan-1', provider: 'local', repoUrl: '/other', branch: '', commit: '', objective: 'fresh', authorization: '' },
      skills: [],
      nodes: [],
      assets: [],
      edges: [],
      counters: { intent: 0, fact: 0, finding: 0, asset: 0, edge: 0 },
    })
  })

  it('skips a scan without repoUrl or objective', () => {
    const before = fold(...fullChainEvents())
    expect(applySastEvent(before, toolCall('sast_start_scan', '{"repoUrl":""}', 6, 'g2'))).toBe(before)
    expect(applySastEvent(before, toolCall('sast_start_scan', '{"objective":"o"}', 6, 'g2'))).toBe(before)
  })

  it('folds the full chain with deterministic ids and edges', () => {
    const state = fold(...fullChainEvents())
    expect(state.scan).toEqual({ id: 'scan-1', provider: 'local', repoUrl: '/repo', branch: '', commit: '', objective: 'find sqli', authorization: 'signed' })
    expect(state.nodes).toEqual([
      { id: 'intent-1', kind: 'intent', title: '测绘控制器与路由', detail: 'scope src/', category: 'custom', status: 'pending' },
      { id: 'fact-1', kind: 'fact', factKind: 'sink', intentId: 'intent-1', path: 'src/dao/OrderDao.java', line: 88, detail: '拼接 SQL', confidence: 0.9 },
      { id: 'intent-2', kind: 'intent', title: '验证 SQL 注入', detail: '', category: 'custom', status: 'pending' },
      { id: 'finding-1', kind: 'finding', intentId: 'intent-2', title: 'sqli', severity: 'high', description: 'injectable', codePath: [{ path: 'src/dao/OrderDao.java', line: 88 }] },
    ])
    expect(state.edges).toEqual([
      { id: 'edge-1', kind: 'spawns', sourceId: 'scan-1', targetId: 'intent-1' },
      { id: 'edge-2', kind: 'yields', sourceId: 'intent-1', targetId: 'fact-1' },
      { id: 'edge-3', kind: 'derived_from', sourceId: 'fact-1', targetId: 'intent-2' },
      { id: 'edge-4', kind: 'proves', sourceId: 'intent-2', targetId: 'finding-1' },
    ])
  })

  it('add_intent requires exactly one resolvable anchor', () => {
    const scan = toolCall('sast_start_scan', '{"repoUrl":"/repo","objective":"o"}', 1, 'g1')
    const afterScan = fold(scan)
    const unchanged = fold(scan)
    const emptyTitle = applySastEvent(unchanged, toolCall('sast_add_intent', '{"title":"","scanId":"scan-1"}', 2, 'i1'))
    const noAnchor = applySastEvent(emptyTitle, toolCall('sast_add_intent', '{"title":"x"}', 2, 'i1'))
    const both = applySastEvent(noAnchor, toolCall('sast_add_intent', '{"title":"x","scanId":"scan-1","derivedFromFactId":"fact-1"}', 2, 'i1'))
    const badScan = applySastEvent(both, toolCall('sast_add_intent', '{"title":"x","scanId":"scan-9"}', 2, 'i1'))
    expect(emptyTitle).toBe(unchanged)
    expect(noAnchor).toBe(unchanged)
    expect(both).toBe(unchanged)
    expect(badScan).toBe(unchanged)
    const badFact = applySastEvent(afterScan, toolCall('sast_add_intent', '{"title":"x","derivedFromFactId":"fact-9"}', 2, 'i1'))
    expect(badFact).toBe(afterScan)
  })

  it('add_intent requires skillId and checkId together', () => {
    const state = fold(toolCall('sast_start_scan', '{"repoUrl":"/repo","objective":"o"}', 1, 'g1'))
    const onlySkill = applySastEvent(state, toolCall('sast_add_intent', '{"title":"x","scanId":"scan-1","skillId":"sqli"}', 2, 'i1'))
    expect(onlySkill).toBe(state)
    const both = applySastEvent(state, toolCall('sast_add_intent', '{"title":"x","scanId":"scan-1","skillId":"sqli","checkId":"c1"}', 2, 'i1'))
    expect(both.nodes.at(-1)).toMatchObject({ skillId: 'sqli', checkId: 'c1' })
  })

  it('add_fact yields facts with defaults and skips unknown intents or empty path/detail', () => {
    const state = fold(
      toolCall('sast_start_scan', '{"repoUrl":"/repo","objective":"o"}', 1, 'g1'),
      toolCall('sast_add_intent', '{"scanId":"scan-1","title":"a"}', 2, 'i1'),
    )
    const first = applySastEvent(state, toolCall('sast_add_fact', '{"intentId":"intent-1","path":"README.md","detail":"bare"}', 3, 'f1'))
    expect(first.nodes).toEqual([
      { id: 'intent-1', kind: 'intent', title: 'a', detail: '', category: 'custom', status: 'pending' },
      { id: 'fact-1', kind: 'fact', factKind: 'info', intentId: 'intent-1', path: 'README.md', line: 0, detail: 'bare', confidence: 0.5 },
    ])
    expect(first.edges.at(-1)).toEqual({ id: 'edge-2', kind: 'yields', sourceId: 'intent-1', targetId: 'fact-1' })
    const unknownIntent = applySastEvent(state, toolCall('sast_add_fact', '{"intentId":"intent-9","path":"x","detail":"x"}', 3, 'f1'))
    expect(unknownIntent).toBe(state)
    const emptyPath = applySastEvent(state, toolCall('sast_add_fact', '{"intentId":"intent-1","path":"","detail":"x"}', 3, 'f1'))
    expect(emptyPath).toBe(state)
    const emptyDetail = applySastEvent(state, toolCall('sast_add_fact', '{"intentId":"intent-1","path":"x","detail":""}', 3, 'f1'))
    expect(emptyDetail).toBe(state)
    const normalized = applySastEvent(state, toolCall('sast_add_fact', '{"intentId":"intent-1","kind":"weird","path":"x","detail":"d","confidence":9}', 3, 'f1'))
    expect(normalized.nodes.at(-1)).toMatchObject({ kind: 'fact', factKind: 'info', confidence: 0.09 })
  })

  it('add_fact records a flows_to edge to a known upstream fact and skips an unknown one', () => {
    const state = fold(
      toolCall('sast_start_scan', '{"repoUrl":"/repo","objective":"o"}', 1, 'g1'),
      toolCall('sast_add_intent', '{"scanId":"scan-1","title":"a"}', 2, 'i1'),
      toolCall('sast_add_fact', '{"intentId":"intent-1","kind":"source","path":"a","detail":"upstream"}', 3, 'f1'),
    )
    const withFlow = applySastEvent(state, toolCall('sast_add_fact', '{"intentId":"intent-1","kind":"sink","path":"b","detail":"downstream","fromFactId":"fact-1"}', 4, 'f2'))
    expect(withFlow.edges.at(-1)).toEqual({ id: 'edge-4', kind: 'flows_to', sourceId: 'fact-1', targetId: 'fact-2' })
    const withoutFlow = applySastEvent(state, toolCall('sast_add_fact', '{"intentId":"intent-1","kind":"sink","path":"b","detail":"downstream","fromFactId":"fact-9"}', 4, 'f2'))
    expect(withoutFlow.edges.every(edge => edge.kind !== 'flows_to')).toBe(true)
  })

  it('add_finding proves findings with a codePath and skips codePath-less or unresolvable ones', () => {
    const state = fold(
      toolCall('sast_start_scan', '{"repoUrl":"/repo","objective":"o"}', 1, 'g1'),
      toolCall('sast_add_intent', '{"scanId":"scan-1","title":"a"}', 2, 'i1'),
      toolCall('sast_add_asset', '{"type":"file","value":"x"}', 3, 'a1'),
    )
    const finding = applySastEvent(state, toolCall('sast_add_finding', '{"intentId":"intent-1","title":"n","severity":"weird","description":"d","codePath":[{"path":"x","line":1},{"path":""}],"affectedAssetId":"asset-1"}', 4, 'n1'))
    expect(finding.nodes.at(-1)).toMatchObject({ kind: 'finding', title: 'n', severity: 'info', codePath: [{ path: 'x', line: 1 }], affectedAssetId: 'asset-1' })
    const unknownIntent = applySastEvent(state, toolCall('sast_add_finding', '{"intentId":"intent-9","title":"n","codePath":[{"path":"x"}]}', 4, 'n1'))
    expect(unknownIntent).toBe(state)
    const emptyTitle = applySastEvent(state, toolCall('sast_add_finding', '{"intentId":"intent-1","title":"","codePath":[{"path":"x"}]}', 4, 'n1'))
    expect(emptyTitle).toBe(state)
    const noCodePath = applySastEvent(state, toolCall('sast_add_finding', '{"intentId":"intent-1","title":"n","codePath":[]}', 4, 'n1'))
    expect(noCodePath).toBe(state)
    const badAsset = applySastEvent(state, toolCall('sast_add_finding', '{"intentId":"intent-1","title":"n","codePath":[{"path":"x"}],"affectedAssetId":"asset-9"}', 4, 'n1'))
    expect(badAsset).toBe(state)
    const mismatchedSkill = applySastEvent(state, toolCall('sast_add_finding', '{"intentId":"intent-1","title":"n","codePath":[{"path":"x"}],"skillId":"s1"}', 4, 'n1'))
    expect(mismatchedSkill).toBe(state)
  })

  it('add_asset records root and parented assets and skips invalid ones', () => {
    const state = fold(toolCall('sast_start_scan', '{"repoUrl":"/repo","objective":"o"}', 1, 'g1'))
    const root = applySastEvent(state, toolCall('sast_add_asset', '{"type":"repo","value":"repo-root","meta":"scope"}', 2, 'a1'))
    expect(root.assets).toEqual([{ id: 'asset-1', type: 'repo', value: 'repo-root', meta: 'scope' }])
    expect(root.edges).toEqual([])
    const child = applySastEvent(root, toolCall('sast_add_asset', '{"type":"file","value":"README.md","parentId":"asset-1"}', 3, 'a2'))
    expect(child.assets.at(-1)).toEqual({ id: 'asset-2', type: 'file', value: 'README.md', meta: '' })
    expect(child.edges.at(-1)).toEqual({ id: 'edge-1', kind: 'parent', sourceId: 'asset-1', targetId: 'asset-2' })
    const badType = applySastEvent(state, toolCall('sast_add_asset', '{"type":"planet","value":"x"}', 2, 'a1'))
    const emptyValue = applySastEvent(state, toolCall('sast_add_asset', '{"type":"file","value":""}', 2, 'a1'))
    expect(badType).toBe(state)
    expect(emptyValue).toBe(state)
    const badParent = applySastEvent(root, toolCall('sast_add_asset', '{"type":"file","value":"x","parentId":"asset-9"}', 3, 'a2'))
    expect(badParent).toBe(root)
    const emptyParent = applySastEvent(root, toolCall('sast_add_asset', '{"type":"file","value":"x","parentId":""}', 3, 'a2'))
    expect(emptyParent.assets.at(-1)).toMatchObject({ id: 'asset-2', type: 'file', value: 'x' })
    expect(emptyParent.edges).toEqual([])
  })

  it('register_skill adds a snapshot and idempotently replays; set_skill_enabled toggles it', () => {
    const state = fold(toolCall('sast_start_scan', '{"repoUrl":"/repo","objective":"o"}', 1, 'g1'))
    const registered = applySastEvent(state, toolCall('sast_register_skill', '{"id":"sqli","title":"SQLi","source":"project-dsh","sourceGroup":"workspace","checks":[{"id":"c1","title":"raw","scope":[]}]}', 2, 's1'))
    expect(registered.skills).toEqual([{ id: 'sqli', title: 'SQLi', source: 'project-dsh', sourceGroup: 'workspace', enabled: true, checks: [{ id: 'c1', title: 'raw', scope: [] }] }])
    const disabled = applySastEvent(registered, toolCall('sast_set_skill_enabled', '{"skillId":"sqli","enabled":false}', 3, 's2'))
    expect(disabled.skills[0]).toMatchObject({ enabled: false })
    const unknownSkill = applySastEvent(state, toolCall('sast_set_skill_enabled', '{"skillId":"sqli","enabled":false}', 3, 's2'))
    expect(unknownSkill).toBe(state)
  })

  it('update_intent updates a known intent status and skips an unknown one', () => {
    const state = fold(
      toolCall('sast_start_scan', '{"repoUrl":"/repo","objective":"o"}', 1, 'g1'),
      toolCall('sast_add_intent', '{"scanId":"scan-1","title":"a"}', 2, 'i1'),
    )
    const running = applySastEvent(state, toolCall('sast_update_intent', '{"intentId":"intent-1","status":"running"}', 3, 'u1'))
    expect(running.nodes[0]).toMatchObject({ status: 'running' })
    const unknown = applySastEvent(state, toolCall('sast_update_intent', '{"intentId":"intent-9","status":"running"}', 3, 'u1'))
    expect(unknown).toBe(state)
  })

  it('caps nodes at the newest', () => {
    const scan = toolCall('sast_start_scan', '{"repoUrl":"/repo","objective":"o"}', 1, 'g1')
    const many = Array.from({ length: NODE_CAP + 50 }, (_, index) =>
      toolCall('sast_add_intent', `{"scanId":"scan-1","title":"i${index}"}`, 2 + index, `i${2 + index}`))
    const capped = many.reduce(applySastEvent, fold(scan))
    expect(capped.nodes).toHaveLength(NODE_CAP)
    expect(capped.nodes[0]).toMatchObject({ id: `intent-${NODE_CAP + 51 - NODE_CAP}` })
  })

  it('caps edges at the newest, combining intent and flows_to edges', () => {
    // Each fact with fromFactId produces two edges (yields + flows_to) per
    // node, so a chain of facts pushes edges past EDGE_CAP while nodes stay
    // under NODE_CAP — isolating the edge cap from the node cap.
    const scan = toolCall('sast_start_scan', '{"repoUrl":"/repo","objective":"o"}', 1, 'g1')
    const withIntent = applySastEvent(fold(scan), toolCall('sast_add_intent', '{"scanId":"scan-1","title":"a"}', 2, 'i1'))
    let state = withIntent
    let previousFactId: string | undefined
    for (let index = 0; index < 450; index++) {
      const args = previousFactId === undefined
        ? `{"intentId":"intent-1","kind":"source","path":"p${index}","detail":"f${index}"}`
        : `{"intentId":"intent-1","kind":"sink","path":"p${index}","detail":"f${index}","fromFactId":"${previousFactId}"}`
      state = applySastEvent(state, toolCall('sast_add_fact', args, 3 + index, `f${3 + index}`))
      previousFactId = `fact-${index + 1}`
    }
    expect(state.nodes.length).toBeLessThan(NODE_CAP)
    expect(state.edges).toHaveLength(EDGE_CAP)
  })

  it('caps assets at the newest', () => {
    const scan = toolCall('sast_start_scan', '{"repoUrl":"/repo","objective":"o"}', 1, 'g1')
    const assets = Array.from({ length: ASSET_CAP + 50 }, (_, index) =>
      toolCall('sast_add_asset', `{"type":"file","value":"f${index}"}`, 300 + index, `a${300 + index}`))
    const cappedAssets = assets.reduce(applySastEvent, fold(scan))
    expect(cappedAssets.assets).toHaveLength(ASSET_CAP)
  })

  it('does not expose edges whose capped endpoints are absent', () => {
    const scan = toolCall('sast_start_scan', '{"repoUrl":"/repo","objective":"o"}', 1, 'g1')
    const intents = Array.from({ length: NODE_CAP }, (_, index) =>
      toolCall('sast_add_intent', `{"scanId":"scan-1","title":"i${index}"}`, 2 + index, `i${index}`))
    const beforeFacts = intents.reduce(applySastEvent, fold(scan))
    const capped = Array.from({ length: NODE_CAP }, (_, index) =>
      toolCall('sast_add_fact', `{"intentId":"intent-${index + 1}","path":"p${index}","detail":"f${index}"}`, 202 + index, `f${index}`))
      .reduce(applySastEvent, beforeFacts)
    const ids = new Set(['scan-1', ...capped.nodes.map(node => node.id), ...capped.assets.map(asset => asset.id)])
    expect(capped.edges.every(edge => ids.has(edge.sourceId) && ids.has(edge.targetId))).toBe(true)
  })

  it('does not window Skill snapshots even under heavy node/edge churn', () => {
    const scan = toolCall('sast_start_scan', '{"repoUrl":"/repo","objective":"o"}', 1, 'g1')
    const registered = applySastEvent(fold(scan), toolCall('sast_register_skill', '{"id":"sqli","title":"SQLi","checks":[{"id":"c1","title":"raw","scope":[]}]}', 2, 's1'))
    const many = Array.from({ length: NODE_CAP + 50 }, (_, index) =>
      toolCall('sast_add_intent', `{"scanId":"scan-1","title":"i${index}"}`, 3 + index, `i${3 + index}`))
    const churned = many.reduce(applySastEvent, registered)
    expect(churned.skills).toHaveLength(1)
  })

  it('ignores foreign events, read tools, and malformed arguments', () => {
    const scan = toolCall('sast_start_scan', '{"repoUrl":"/repo","objective":"o"}', 1, 'g1')
    const clean = fold(scan)
    const unchanged = fold(
      scan,
      toolCall('bash', '{"command":"ls"}', 2, 'c2'),
      toolCall('sast_add_fact', 'not json', 3, 'c3'),
      toolCall('sast_add_fact', '"just a string"', 4, 'c4'),
      toolCall('sast_state', '{}', 5, 'c5'),
      toolCall('sast_graph', '{}', 6, 'c6'),
      toolCall('sast_report', '{}', 7, 'c7'),
      { type: 'tool/result', seq: 8, time: 8, data: { turn: 1, step: 1, callId: CallId('c3'), name: 'sast_add_fact', arguments: '{"intentId":"intent-1","path":"x","detail":"d"}' } } as SessionEvent,
    )
    expect(unchanged).toEqual(clean)
  })

  it('replays a delegated submission and ignores malformed submission entries', () => {
    const state = fold(
      toolCall('sast_start_scan', '{"repoUrl":"/repo","objective":"o"}', 1, 'g1'),
      toolCall('sast_add_intent', '{"scanId":"scan-1","title":"probe"}', 2, 'i1'),
    )
    const submitted = applySastEvent(state, {
      type: 'sast/submit',
      data: {
        intentId: 'intent-1',
        facts: [{ path: 'x', detail: 'HTTP 200', kind: 'sink', confidence: 0.9 }, null, 'not-an-object'],
        assets: [{ type: 'file', value: 'x' }, null],
        findings: [{ title: 'confirmed issue', severity: 'high', codePath: [{ path: 'x' }] }, null],
      },
    } as unknown as SessionEvent)
    expect(submitted.nodes).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'fact-1', kind: 'fact', intentId: 'intent-1', detail: 'HTTP 200' }),
      expect.objectContaining({ id: 'finding-1', kind: 'finding', intentId: 'intent-1', title: 'confirmed issue' }),
    ]))
    expect(submitted.assets).toEqual([expect.objectContaining({ id: 'asset-1', value: 'x' })])
    expect(applySastEvent(state, { type: 'sast/submit', data: { facts: [] } } as unknown as SessionEvent)).toBe(state)
    expect(applySastEvent(state, {
      type: 'sast/submit', data: { intentId: 'intent-1', facts: 'bad', assets: 'bad', findings: 'bad' },
    } as unknown as SessionEvent)).toBe(state)
  })
})

/** One assembled request header carrying the given tool names. */
function requestHeader(tools: readonly string[], seq = 1): SessionEvent {
  return {
    type: 'request/header',
    seq,
    time: seq,
    data: {
      header: { config: { provider: 'test', model: 'test' }, tools: tools.map(name => ({ name, description: '', parameters: {} })) },
      reason: 'initial',
    },
  } as unknown as SessionEvent
}

describe('applySastMounted', () => {
  it('marks the session once its assembled request header carries a sast tool', () => {
    expect(applySastMounted(false, requestHeader(['bash', 'read', 'sast_start_scan']))).toBe(true)
    expect(applySastMounted(false, requestHeader(['sast_submit']))).toBe(true)
    expect(applySastMounted(false, requestHeader(['bash', 'read']))).toBe(false)
    expect(applySastMounted(false, requestHeader([]))).toBe(false)
  })

  it('marks the session from a logged sast call or a folded delegated submission', () => {
    expect(applySastMounted(false, toolCall('sast_submit', '{"intentId":"intent-1","facts":[]}'))).toBe(true)
    expect(applySastMounted(false, toolCall('bash', '{"command":"id"}'))).toBe(false)
    expect(applySastMounted(false, {
      type: 'sast/submit', seq: 2, time: 2, data: { intentId: 'intent-1', facts: [] },
    } as unknown as SessionEvent)).toBe(true)
  })

  it('stays marked and treats foreign or malformed events as no evidence', () => {
    expect(applySastMounted(true, toolCall('bash', '{"command":"id"}'))).toBe(true)
    expect(applySastMounted(false, { type: 'turn/start', seq: 1, time: 1, data: { turn: 1 } } as SessionEvent)).toBe(false)
    expect(applySastMounted(false, { type: 'request/header', seq: 1, time: 1, data: {} } as unknown as SessionEvent)).toBe(false)
    expect(applySastMounted(false, {
      type: 'request/header', seq: 1, time: 1, data: { header: { tools: 'nope' }, reason: 'initial' },
    } as unknown as SessionEvent)).toBe(false)
    expect(applySastMounted(false, {
      type: 'request/header', seq: 1, time: 1, data: { header: { tools: [{ description: 'no name' }] }, reason: 'initial' },
    } as unknown as SessionEvent)).toBe(false)
  })

  it('is a strict boolean wire payload', () => {
    expect(sastMountedSchema.safeParse(true).success).toBe(true)
    expect(sastMountedSchema.safeParse(false).success).toBe(true)
    expect(sastMountedSchema.safeParse(null).success).toBe(false)
    expect(sastMountedSchema.safeParse('true').success).toBe(false)
  })
})

describe('viewSastState / sastProjectionSchema', () => {
  it('projects null before the first scan and the standing state afterwards', () => {
    expect(viewSastState(sastInitialState)).toBeNull()
    const state = fold(...fullChainEvents())
    const view = viewSastState(state)
    expect(sastProjectionSchema.parse(view)).toEqual(view)
    expect(view).toMatchObject({
      scan: { id: 'scan-1', repoUrl: '/repo' },
      counts: { intents: 2, facts: 1, findings: 1, assets: 0 },
    })
    expect(sastProjectionSchema.parse(null)).toBeNull()
  })
})

describe('sast projection registration', () => {
  it('folds real session events into the snapshot through the projection seam', async () => {
    const { ctx, session } = await sastProjectionHarness()
    expect(ctx.sessionProjections.snapshot(session).values['sast']).toBeNull()
    session.append('tool/call', {
      turn: 1, step: 1, callId: CallId('scan-1'), name: 'sast_start_scan',
      arguments: '{"repoUrl":"/repo","objective":"find sqli"}',
    })
    session.append('tool/call', {
      turn: 1, step: 2, callId: CallId('intent-1'), name: 'sast_add_intent',
      arguments: '{"scanId":"scan-1","title":"测绘"}',
    })
    session.append('tool/call', {
      turn: 1, step: 3, callId: CallId('fact-1'), name: 'sast_add_fact',
      arguments: '{"intentId":"intent-1","kind":"sink","path":"a","detail":"拼接 SQL"}',
    })
    expect(ctx.sessionProjections.snapshot(session).values['sast']).toMatchObject({
      scan: { id: 'scan-1', repoUrl: '/repo', objective: 'find sqli' },
      counts: { intents: 1, facts: 1, findings: 0, assets: 0 },
    })
  })

  it('marks the mount per session while the key itself stays host-wide', async () => {
    const { ctx, session } = await sastProjectionHarness()
    const other = ctx.sessions.create()
    expect(ctx.sessionProjections.snapshot(session).values['sastMounted']).toBe(false)
    expect(ctx.sessionProjections.snapshot(other).values['sastMounted']).toBe(false)
    session.append('tool/call', {
      turn: 1, step: 1, callId: CallId('submit-1'), name: 'sast_submit',
      arguments: '{"intentId":"intent-1","facts":[]}',
    })
    expect(ctx.sessionProjections.snapshot(session).values['sastMounted']).toBe(true)
    expect(ctx.sessionProjections.snapshot(other).values['sastMounted']).toBe(false)
  })

  it('replays the full parent log in seq order: turn-0 synthetic submissions fold after their anchors', async () => {
    const { ctx, session } = await sastProjectionHarness()
    session.append('tool/call', {
      turn: 1, step: 1, callId: CallId('scan-1'), name: 'sast_start_scan',
      arguments: '{"repoUrl":"/repo","objective":"find sqli"}',
    })
    session.append('tool/call', {
      turn: 1, step: 2, callId: CallId('intent-1'), name: 'sast_add_intent',
      arguments: '{"scanId":"scan-1","title":"delegate audit"}',
    })
    session.append('tool/call', {
      turn: 0, step: 1, callId: CallId('sast-submit-1'), name: 'sast_add_fact',
      arguments: '{"intentId":"intent-1","kind":"sink","path":"a","detail":"拼接 SQL","confidence":0.9}',
    })
    session.append('tool/call', {
      turn: 0, step: 2, callId: CallId('sast-submit-2'), name: 'sast_add_asset',
      arguments: '{"type":"file","value":"a","meta":"java"}',
    })
    const live = ctx.sessionProjections.snapshot(session).values['sast']
    expect(live).toMatchObject({
      scan: { id: 'scan-1', repoUrl: '/repo' },
      counts: { intents: 1, facts: 1, findings: 0, assets: 1 },
    })
    const replayed = session.events.reduce(applySastEvent, sastInitialState)
    expect(viewSastState(replayed)).toEqual(live)
  })
})
