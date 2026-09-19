// @vitest-environment jsdom
/**
 * Sast sub-tab acceptance: the 审计链路 graph (chain nodes with kind badges
 * and severity, flows_to taint edges, edge labels, empty note), the 漏洞
 * list (severity badges, description, code evidence chain, affected asset,
 * methodology origin), the 代码资产 tab (empty note, list mode grouped by
 * type with parent links, graph mode toggle), and the 任务与进度 tab (skill
 * cards, check states, coverage summary).
 *
 * See sast-view.client.spec.tsx's header comment for why these tests stand
 * in a minimal translate function rather than the real
 * dsh-client-test-runtime/dsh-client-locale packages.
 */
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Position, ReactFlowProvider, type EdgeProps } from '@xyflow/react'
import type { SastProjection } from '@tangxiaofeng7/dsh-sast-host/client'
import { ExploreView, ChainEdge, FlowEdge } from '../src/client/ExploreView.tsx'
import { FindingsView } from '../src/client/FindingsView.tsx'
import { AssetsView, AssetEdge } from '../src/client/AssetsView.tsx'
import { TasksView } from '../src/client/TasksView.tsx'
import { GraphDetailDrawer } from '../src/client/GraphDetailDrawer.tsx'
import { zh } from '../src/client/locales.ts'

/** Minimal translate stub: the sast namespace only, falls back to the key. */
function t(key: string): string {
  return (zh as Record<string, string>)[key] ?? key
}

/** jsdom has no ResizeObserver; the React Flow graphs measure through one. */
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverStub)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const CHAIN: SastProjection = {
  scan: { id: 'scan-1', provider: 'github', repoUrl: 'https://github.com/org/repo', branch: 'main', commit: 'a'.repeat(40), objective: 'find sqli', authorization: '' },
  skills: [],
  nodes: [
    { id: 'intent-1', kind: 'intent', title: '测绘控制器与路由', detail: 'scope src/', category: 'recon', status: 'done' },
    { id: 'fact-1', kind: 'fact', factKind: 'sink', intentId: 'intent-1', path: 'src/dao/OrderDao.java', line: 88, detail: '拼接 SQL', confidence: 0.9 },
    { id: 'finding-1', kind: 'finding', intentId: 'intent-1', title: 'SQL injection', severity: 'high', description: 'injectable', cwe: 'CWE-89', codePath: [{ path: 'src/dao/OrderDao.java', line: 88, symbol: 'selectByKeyword' }] },
  ],
  assets: [
    { id: 'asset-1', type: 'repo', value: 'repo-root', meta: 'scope' },
    { id: 'asset-2', type: 'file', value: 'src/dao/OrderDao.java', meta: '' },
  ],
  edges: [
    { id: 'edge-1', kind: 'spawns', sourceId: 'scan-1', targetId: 'intent-1' },
    { id: 'edge-2', kind: 'yields', sourceId: 'intent-1', targetId: 'fact-1' },
    { id: 'edge-3', kind: 'proves', sourceId: 'intent-1', targetId: 'finding-1' },
    { id: 'edge-4', kind: 'parent', sourceId: 'asset-1', targetId: 'asset-2' },
  ],
  counts: { intents: 1, facts: 1, findings: 1, assets: 2 },
}

describe('ExploreView', () => {
  it('renders the chain nodes with kind badges and severity', () => {
    render(<ExploreView sast={CHAIN} t={t} />)
    expect(screen.getByTestId('explore-node-scan').textContent).toContain('扫描')
    expect(screen.getByTestId('explore-node-scan').textContent).toContain('https://github.com/org/repo')
    expect(screen.getByTestId('explore-node-intent').textContent).toContain('意图')
    expect(screen.getByTestId('explore-node-intent').textContent).toContain('测绘控制器与路由')
    expect(screen.getByTestId('explore-node-fact').textContent).toContain('事实')
    expect(screen.getByTestId('explore-node-finding').textContent).toContain('漏洞')
    expect(screen.getByTestId('explore-node-finding').textContent).toContain('高危')
  })

  it('renders the empty note for a scan-only audit', () => {
    render(<ExploreView sast={{ ...CHAIN, nodes: [], edges: [] }} t={t} />)
    expect(screen.getByTestId('sast-explore-empty').textContent).toContain('审计链路为空')
  })

  it('opens and closes a detail drawer after selecting a chain node', () => {
    render(<ExploreView sast={CHAIN} t={t} />)
    act(() => { screen.getByTestId('explore-node-intent').click() })
    expect(screen.getByTestId('graph-detail-drawer').textContent).toContain('scope src/')
    act(() => { screen.getByLabelText('关闭详情').click() })
    expect(screen.queryByTestId('graph-detail-drawer')).toBeNull()
  })
})

describe('edge components', () => {
  /** Minimal edge props: only the fields the custom edge components read. */
  function edgeProps(overrides: Partial<EdgeProps> = {}): EdgeProps {
    return {
      id: 'e1',
      source: 'a',
      target: 'b',
      sourceX: 0,
      sourceY: 0,
      targetX: 120,
      targetY: 0,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      selected: false,
      isFocusable: false,
      ...overrides,
    } as unknown as EdgeProps
  }

  it('ChainEdge renders a bezier path and forwards the relationship label', () => {
    render(
      <ReactFlowProvider>
        <ChainEdge {...edgeProps({ label: '意图链' })} />
      </ReactFlowProvider>,
    )
    expect(document.querySelector('path')).not.toBeNull()
  })

  it('ChainEdge renders without a label when none is given', () => {
    render(
      <ReactFlowProvider>
        <ChainEdge {...edgeProps()} />
      </ReactFlowProvider>,
    )
    expect(document.querySelector('path')).not.toBeNull()
  })

  it('FlowEdge renders the dashed taint-propagation path and forwards the 污点传播 label', () => {
    render(
      <ReactFlowProvider>
        <FlowEdge {...edgeProps({ label: '污点传播' })} />
      </ReactFlowProvider>,
    )
    expect(document.querySelector('path')).not.toBeNull()
  })

  it('AssetEdge renders the parent-edge bezier path and forwards the 隶属 label', () => {
    render(
      <ReactFlowProvider>
        <AssetEdge {...edgeProps({ label: '隶属' })} />
      </ReactFlowProvider>,
    )
    expect(document.querySelector('path')).not.toBeNull()
  })
})

describe('GraphDetailDrawer', () => {
  it('filters empty fields and closes through Escape or its backdrop', () => {
    const onClose = vi.fn()
    render(<GraphDetailDrawer title="node" fields={[{ label: 'shown', value: 'value' }, { label: 'hidden', value: '' }]} onClose={onClose} t={t} />)
    expect(screen.getByTestId('graph-detail-drawer').textContent).toContain('value')
    expect(screen.getByTestId('graph-detail-drawer').textContent).not.toContain('hidden')
    act(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })) })
    expect(onClose).not.toHaveBeenCalled()
    act(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })) })
    expect(onClose).toHaveBeenCalledTimes(1)
    act(() => { screen.getByTestId('graph-detail-drawer').querySelector('button')!.click() })
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})

describe('FindingsView', () => {
  it('renders each finding with severity, title, description, cwe, and the code evidence chain', () => {
    render(<FindingsView sast={CHAIN} t={t} />)
    const finding = screen.getByTestId('sast-finding')
    expect(finding.textContent).toContain('高危')
    expect(finding.textContent).toContain('SQL injection')
    expect(finding.textContent).toContain('injectable')
    expect(finding.textContent).toContain('CWE-89')
    expect(finding.textContent).toContain('代码证据链')
    const hops = finding.querySelectorAll('ol li')
    expect(hops).toHaveLength(1)
    expect(hops[0]!.textContent).toContain('src/dao/OrderDao.java:88')
    expect(hops[0]!.textContent).toContain('selectByKeyword')
  })

  it('omits description and affected asset lines while absent, and shows the incidental origin', () => {
    render(<FindingsView sast={{
      ...CHAIN,
      nodes: [{ id: 'finding-1', kind: 'finding', intentId: 'intent-1', title: 'no details', severity: 'info', description: '', codePath: [{ path: 'x', line: 1 }] }],
    }} t={t} />)
    const finding = screen.getByTestId('sast-finding')
    expect(finding.textContent).not.toContain('影响资产')
    expect(finding.textContent).toContain('检查清单之外的发现')
  })

  it('shows the affected asset when linked, and the methodology origin when skillId/checkId are set', () => {
    render(<FindingsView sast={{
      ...CHAIN,
      nodes: [{ id: 'finding-1', kind: 'finding', intentId: 'intent-1', title: 'sqli', severity: 'high', description: '', codePath: [{ path: 'x', line: 1 }], affectedAssetId: 'asset-2', skillId: 'mybatis-sqli', checkId: 'dollar-interpolation' }],
    }} t={t} />)
    const finding = screen.getByTestId('sast-finding')
    expect(finding.textContent).toContain('影响资产: [file] src/dao/OrderDao.java')
    expect(finding.textContent).toContain('mybatis-sqli / dollar-interpolation')
  })

  it('renders the empty note without findings', () => {
    render(<FindingsView sast={{ ...CHAIN, nodes: [] }} t={t} />)
    expect(screen.getByTestId('sast-findings-empty').textContent).toBe('暂无漏洞记录')
  })
})

describe('AssetsView', () => {
  it('renders the empty note without assets', () => {
    render(<AssetsView sast={{ ...CHAIN, assets: [], edges: [] }} t={t} />)
    expect(screen.getByTestId('sast-assets-empty').textContent).toBe('暂无资产记录')
  })

  it('lists assets grouped by type with parent links in list mode', () => {
    render(<AssetsView sast={CHAIN} t={t} />)
    expect(screen.getByTestId('sast-assets-list')).toBeTruthy()
    const groups = screen.getAllByTestId('sast-asset-group')
    expect(groups.map(group => group.querySelector('h4')!.textContent)).toEqual(['仓库', '文件'])
    const rows = screen.getAllByTestId('sast-asset-row')
    expect(rows[0]!.textContent).toContain('repo-root')
    expect(rows[0]!.textContent).toContain('（scope）')
    expect(rows[1]!.textContent).toContain('src/dao/OrderDao.java')
    expect(rows[1]!.textContent).toContain('← repo-root')
  })

  it('toggles to graph mode and back', () => {
    render(<AssetsView sast={CHAIN} t={t} />)
    expect(screen.getByTestId('sast-assets-mode-list').getAttribute('aria-pressed')).toBe('true')
    act(() => { screen.getByTestId('sast-assets-mode-graph').click() })
    expect(screen.getByTestId('sast-assets-graph')).toBeTruthy()
    expect(screen.queryByTestId('sast-assets-list')).toBeNull()
    expect(screen.getAllByTestId('explore-node-asset')).toHaveLength(2)
    const assetNodes = screen.getAllByTestId('explore-node-asset')
    expect(assetNodes.map(node => node.textContent).join(' ')).toContain('仓库')
    expect(assetNodes.map(node => node.textContent).join(' ')).toContain('repo-root')
    act(() => { screen.getByTestId('sast-assets-mode-list').click() })
    expect(screen.getByTestId('sast-assets-list')).toBeTruthy()
  })

  it('opens asset details from a graph node', () => {
    render(<AssetsView sast={CHAIN} t={t} />)
    act(() => { screen.getByTestId('sast-assets-mode-graph').click() })
    act(() => { screen.getAllByTestId('explore-node-asset')[0]!.click() })
    expect(screen.getByTestId('graph-detail-drawer').textContent).toContain('scope')
    act(() => { screen.getByLabelText('关闭详情').click() })
    expect(screen.queryByTestId('graph-detail-drawer')).toBeNull()
  })
})

describe('TasksView', () => {
  const WITH_SKILLS: SastProjection = {
    ...CHAIN,
    skills: [
      {
        id: 'mybatis-sqli',
        title: 'MyBatis 注入',
        source: 'project-dsh',
        sourceGroup: 'workspace',
        enabled: true,
        checks: [
          { id: 'dollar-interpolation', title: '${} 插值审计', scope: [] },
          { id: 'dynamic-orderby', title: 'order by 动态拼接', scope: [] },
        ],
      },
      {
        id: 'disabled-skill',
        title: '已停用清单',
        source: 'user-dsh',
        sourceGroup: 'user',
        enabled: false,
        checks: [{ id: 'c1', title: 'x', scope: [] }],
      },
    ],
    nodes: [
      ...CHAIN.nodes,
      { id: 'intent-2', kind: 'intent', title: 'check dollar-interpolation', detail: '', category: 'taint', status: 'done', skillId: 'mybatis-sqli', checkId: 'dollar-interpolation' },
    ],
  }

  it('renders the fully-empty note when there are no skills and no intents at all', () => {
    render(<TasksView sast={{ ...CHAIN, skills: [], nodes: [] }} t={t} />)
    expect(screen.getByTestId('sast-tasks-empty').textContent).toBe('尚未注册任何审计方法论。')
  })

  it('renders the intent-status distribution (not the fully-empty note) for an ad-hoc audit with intents but no registered skill', () => {
    render(<TasksView sast={{ ...CHAIN, skills: [] }} t={t} />)
    expect(screen.queryByTestId('sast-tasks-empty')).toBeNull()
    expect(screen.getByTestId('sast-tasks-no-methodology')).toBeTruthy()
    const intentStatus = screen.getByTestId('sast-tasks-intent-status')
    expect(intentStatus.textContent).toContain('已完成 1')
  })

  it('renders one card per skill with its source badge, enabled state, and checks', () => {
    render(<TasksView sast={WITH_SKILLS} t={t} />)
    const skills = screen.getAllByTestId('sast-tasks-skill')
    expect(skills).toHaveLength(2)
    expect(skills[0]!.textContent).toContain('MyBatis 注入')
    expect(skills[0]!.textContent).toContain('workspace')
    expect(skills[0]!.textContent).toContain('已启用')
    expect(skills[1]!.textContent).toContain('已停用')
  })

  it('derives each check\'s state: done for a completed intent, todo for none', () => {
    render(<TasksView sast={WITH_SKILLS} t={t} />)
    const checks = screen.getAllByTestId('sast-tasks-check')
    const dollarCheck = checks.find(check => check.textContent?.includes('dollar-interpolation'))!
    expect(dollarCheck.textContent).toContain('已完成')
    const orderbyCheck = checks.find(check => check.textContent?.includes('dynamic-orderby'))!
    expect(orderbyCheck.textContent).toContain('待办')
  })

  it('sums check inclusion/completion only across ENABLED skills, and shows the intent-status distribution', () => {
    render(<TasksView sast={WITH_SKILLS} t={t} />)
    const summary = screen.getByTestId('sast-tasks-summary')
    expect(summary.textContent).toContain('检查项纳入')
    // The disabled skill's check must not count toward the denominator.
    expect(summary.textContent).toContain('1 / 2')
    expect(summary.textContent).toContain('检查项完成')
    const intentStatus = screen.getByTestId('sast-tasks-intent-status')
    expect(intentStatus.textContent).toContain('已完成 2')
  })
})
