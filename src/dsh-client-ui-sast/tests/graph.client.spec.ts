/**
 * Pure graph-layout acceptance: `layoutExploration` (BFS layers from the
 * scan over chain edges only, flows_to returned separately) and
 * `layoutAssets` (parent-tree layers) produce the expected columns,
 * stacking, and edge filtering.
 * @module
 */

import { describe, expect, it } from 'vitest'
import type { SastProjection } from '@tangxiaofeng7/dsh-sast-host/client'
import { layoutAssets, layoutExploration } from '../src/client/graph.ts'

/** A chain projection: scan → intent → fact → derived intent → finding, plus one flows_to and one parent asset edge. */
function chainProjection(): SastProjection {
  return {
    scan: { id: 'scan-1', provider: 'github', repoUrl: 'https://github.com/org/repo', branch: 'main', commit: 'abc', objective: 'find sqli', authorization: '' },
    skills: [],
    nodes: [
      { id: 'intent-1', kind: 'intent', title: '测绘', detail: 'scope src/', category: 'recon', status: 'done' },
      { id: 'fact-1', kind: 'fact', factKind: 'source', intentId: 'intent-1', path: 'a.ts', line: 1, detail: 'user input', confidence: 0.9 },
      { id: 'fact-2', kind: 'fact', factKind: 'sink', intentId: 'intent-1', path: 'b.ts', line: 2, detail: 'sql sink', confidence: 0.9 },
      { id: 'intent-2', kind: 'intent', title: '验证', detail: '', category: 'taint', status: 'done' },
      { id: 'finding-1', kind: 'finding', intentId: 'intent-2', title: 'sqli', severity: 'high', description: 'injectable', codePath: [{ path: 'b.ts', line: 2 }] },
    ],
    assets: [
      { id: 'asset-1', type: 'repo', value: 'repo-root', meta: '' },
      { id: 'asset-2', type: 'file', value: 'a.ts', meta: '' },
    ],
    edges: [
      { id: 'edge-1', kind: 'spawns', sourceId: 'scan-1', targetId: 'intent-1' },
      { id: 'edge-2', kind: 'yields', sourceId: 'intent-1', targetId: 'fact-1' },
      { id: 'edge-3', kind: 'yields', sourceId: 'intent-1', targetId: 'fact-2' },
      { id: 'edge-4', kind: 'flows_to', sourceId: 'fact-1', targetId: 'fact-2' },
      { id: 'edge-5', kind: 'derived_from', sourceId: 'fact-2', targetId: 'intent-2' },
      { id: 'edge-6', kind: 'proves', sourceId: 'intent-2', targetId: 'finding-1' },
      { id: 'edge-7', kind: 'parent', sourceId: 'asset-1', targetId: 'asset-2' },
    ],
    counts: { intents: 2, facts: 2, findings: 1, assets: 2 },
  }
}

describe('layoutExploration', () => {
  it('lays a pure chain out one column per hop with the scan at the start', () => {
    const { nodes, edges } = layoutExploration(chainProjection())
    expect(edges.map(edge => edge.kind)).toEqual(['spawns', 'yields', 'yields', 'derived_from', 'proves'])
    const byId = new Map(nodes.map(node => [node.id, node]))
    expect(byId.get('scan-1')).toMatchObject({ kind: 'scan', title: 'https://github.com/org/repo', x: 0, y: 0 })
    expect(byId.get('intent-1')).toMatchObject({ kind: 'intent', title: '测绘', x: 320, y: 0 })
    expect(byId.get('finding-1')).toMatchObject({ kind: 'finding', severity: 'high', title: 'sqli' })
  })

  it('returns flows_to edges separately from the chain edges', () => {
    const { edges, flowEdges } = layoutExploration(chainProjection())
    expect(edges.some(edge => edge.kind === 'flows_to')).toBe(false)
    expect(flowEdges).toEqual([{ id: 'edge-4', kind: 'flows_to', sourceId: 'fact-1', targetId: 'fact-2' }])
  })

  it('excludes parent edges from the chain graph entirely', () => {
    const { edges, flowEdges } = layoutExploration(chainProjection())
    expect(edges.some(edge => edge.kind === 'parent')).toBe(false)
    expect(flowEdges.some(edge => edge.kind === 'parent')).toBe(false)
  })

  it('stacks sibling nodes of one layer vertically', () => {
    const { nodes } = layoutExploration(chainProjection())
    const layerOne = nodes.filter(node => node.x === 320).sort((a, b) => a.y - b.y)
    expect(layerOne.map(node => node.id)).toEqual(['intent-1'])
    const layerTwo = nodes.filter(node => node.x === 640).sort((a, b) => a.y - b.y)
    expect(layerTwo.map(node => node.id)).toEqual(['fact-1', 'fact-2'])
    expect(layerTwo[0]!.y).toBe(0)
    expect(layerTwo[1]!.y).toBe(152)
  })

  it('renders a fact\'s detail line as path:line [kind] · confidence', () => {
    const { nodes } = layoutExploration(chainProjection())
    expect(nodes.find(node => node.id === 'fact-1')).toMatchObject({ detail: 'a.ts:1 [source] · 0.9' })
  })

  it('hangs nodes unreachable from the scan in the last column and tolerates a missing scan', () => {
    const projection = chainProjection()
    const withOrphan: SastProjection = {
      ...projection,
      nodes: [...projection.nodes, { id: 'finding-9', kind: 'finding', intentId: 'intent-9', title: 'orphan', severity: 'low', description: '', codePath: [{ path: 'x', line: 1 }] }],
    }
    const { nodes } = layoutExploration(withOrphan)
    const orphan = nodes.find(node => node.id === 'finding-9')!
    expect(orphan.x).toBeGreaterThan(640)
    const scanless = layoutExploration({ ...withOrphan, scan: null })
    expect(scanless.nodes[0]).toMatchObject({ id: 'scan-1', kind: 'scan', title: '', x: 0, y: 0 })
  })
})

describe('layoutAssets', () => {
  it('lays the asset tree out from roots one column per parent hop', () => {
    const projection: SastProjection = {
      scan: { id: 'scan-1', provider: 'local', repoUrl: '/repo', branch: '', commit: '', objective: 'o', authorization: '' },
      skills: [],
      nodes: [],
      assets: [
        { id: 'asset-1', type: 'repo', value: 'repo-root', meta: '' },
        { id: 'asset-2', type: 'module', value: 'src', meta: '' },
        { id: 'asset-3', type: 'file', value: 'src/a.ts', meta: '' },
        { id: 'asset-4', type: 'entrypoint', value: 'GET /', meta: '' },
      ],
      edges: [
        { id: 'edge-1', kind: 'parent', sourceId: 'asset-1', targetId: 'asset-2' },
        { id: 'edge-2', kind: 'parent', sourceId: 'asset-1', targetId: 'asset-3' },
        { id: 'edge-3', kind: 'parent', sourceId: 'asset-3', targetId: 'asset-4' },
      ],
      counts: { intents: 0, facts: 0, findings: 0, assets: 4 },
    }
    const { nodes, edges } = layoutAssets(projection)
    expect(edges).toEqual(projection.edges)
    const byId = new Map(nodes.map(node => [node.id, node]))
    expect(byId.get('asset-1')).toMatchObject({ x: 0, y: 0 })
    expect(byId.get('asset-2')).toMatchObject({ x: 292, y: 0 })
    expect(byId.get('asset-3')).toMatchObject({ x: 292, y: 132 })
    expect(byId.get('asset-4')).toMatchObject({ x: 584, y: 0 })
  })

  it('treats assets without parent edges as roots', () => {
    const projection: SastProjection = {
      scan: { id: 'scan-1', provider: 'local', repoUrl: '/repo', branch: '', commit: '', objective: 'o', authorization: '' },
      skills: [],
      nodes: [],
      assets: [
        { id: 'asset-1', type: 'package', value: 'log4j-core', meta: '' },
        { id: 'asset-2', type: 'datastore', value: 'redis', meta: '' },
      ],
      edges: [],
      counts: { intents: 0, facts: 0, findings: 0, assets: 2 },
    }
    const { nodes } = layoutAssets(projection)
    expect(nodes.map(node => [node.id, node.x, node.y])).toEqual([
      ['asset-1', 0, 0],
      ['asset-2', 0, 132],
    ])
  })
})
