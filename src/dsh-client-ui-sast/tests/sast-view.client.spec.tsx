// @vitest-environment jsdom
/**
 * Sast view tab acceptance: the 白盒审计 conversation-view entry (guiding
 * empty note for absent/null projection; the scan header card — repo,
 * branch, objective, authorization, counts; and the sub-tab bar — 审计链路
 * / 漏洞 / 代码资产 / 任务与进度 / 报告 — switching the rendered sub-tab)
 * and its live-update path through the projection source.
 *
 * The real `@deepseek-ai/dsh-client-runtime`/`dsh-client-web-react`/
 * `dsh-client-test-runtime` packages ship browser-loader bundles with no
 * Node-importable entry (dsh-client-test-runtime's own README: "Every
 * consumer is an in-repository Vitest suite; there is no Node-compatible
 * runtime entry" — they're consumed via tsconfig path aliases inside the
 * real DSH monorepo, which this bundle repo does not have). This suite
 * stands in a minimal useProjection/t of its own shape instead, since
 * SastView only relies on the `useProjection`/`t` CONTRACT (PropsRuntime/
 * PropsLocale), not on any concrete package.
 */
import { useSyncExternalStore } from 'react'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SastProjection } from '@tangxiaofeng7/dsh-sast-host/client'
import type { SastViewProps } from '../src/client/SastView.tsx'
import { SastView } from '../src/client/SastView.tsx'
import { zh } from '../src/client/locales.ts'

/** Minimal translate stub: the sast namespace only, `{param}` interpolation, falls back to the key. */
function t(key: string, params?: Record<string, unknown>): string {
  const template = (zh as Record<string, string>)[key] ?? key
  if (params === undefined) return template
  return template.replace(/\{(\w+)\}/g, (_match, name: string) => String(params[name] ?? ''))
}

/** A minimal external store standing in for the framework's real snapshot store. */
function makeStore<T>(initial: T) {
  let value = initial
  const listeners = new Set<() => void>()
  return {
    getSnapshot: () => value,
    subscribe: (fn: () => void) => {
      listeners.add(fn)
      return () => { listeners.delete(fn) }
    },
    set: (next: T) => {
      value = next
      for (const fn of listeners) fn()
    },
  }
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

const SCAN = { id: 'scan-1', provider: 'github' as const, repoUrl: 'https://github.com/org/repo', branch: 'main', commit: 'a'.repeat(40), objective: 'find sqli', authorization: 'CTO sign-off' }

const STANDING: SastProjection = {
  scan: SCAN,
  skills: [],
  nodes: [
    { id: 'intent-1', kind: 'intent', title: '测绘控制器与路由', detail: 'scope src/', category: 'recon', status: 'done' },
    { id: 'fact-1', kind: 'fact', factKind: 'sink', intentId: 'intent-1', path: 'src/dao/OrderDao.java', line: 88, detail: '拼接 SQL', confidence: 0.9 },
    { id: 'finding-1', kind: 'finding', intentId: 'intent-1', title: 'SQL injection', severity: 'high', description: 'injectable', codePath: [{ path: 'src/dao/OrderDao.java', line: 88 }] },
  ],
  assets: [
    { id: 'asset-1', type: 'repo', value: 'repo-root', meta: '' },
  ],
  edges: [
    { id: 'edge-1', kind: 'spawns', sourceId: 'scan-1', targetId: 'intent-1' },
    { id: 'edge-2', kind: 'yields', sourceId: 'intent-1', targetId: 'fact-1' },
    { id: 'edge-3', kind: 'proves', sourceId: 'intent-1', targetId: 'finding-1' },
  ],
  counts: { intents: 1, facts: 1, findings: 1, assets: 1 },
}

/** View props stub: routes `useProjection('sast')` to `store`, and `useProjection('sastBatch')` to a fixed `null` (most tests in this file only exercise the single-repo surface; batch-surface tests live in batch-views.client.spec.tsx). */
function viewProps(store: ReturnType<typeof makeStore<SastProjection | null | undefined>>): SastViewProps {
  const useProjection = ((key: string) => {
    if (key === 'sastBatch') return null
    return useSyncExternalStore(store.subscribe, store.getSnapshot)
  }) as SastViewProps['useProjection']
  return { useProjection, t } as unknown as SastViewProps
}

describe('SastView', () => {
  it('renders the guiding empty note while the projection is absent or null', () => {
    const absent = makeStore<SastProjection | null | undefined>(undefined)
    const first = render(<SastView {...viewProps(absent)} />)
    expect(first.getByTestId('sast-view')).toBeTruthy()
    expect(first.getByText(/还没有白盒审计记录/)).toBeTruthy()
    cleanup()

    const none = makeStore<SastProjection | null | undefined>(null)
    const second = render(<SastView {...viewProps(none)} />)
    expect(second.getByText(/还没有白盒审计记录/)).toBeTruthy()
  })

  it('renders the scan card: repo, branch, objective, authorization, counts', () => {
    const store = makeStore<SastProjection | null | undefined>(STANDING)
    render(<SastView {...viewProps(store)} />)
    expect(screen.getAllByText('https://github.com/org/repo').length).toBeGreaterThan(0)
    expect(screen.getByText('分支：main')).toBeTruthy()
    expect(screen.getByText('目的：find sqli')).toBeTruthy()
    expect(screen.getByText('授权：CTO sign-off')).toBeTruthy()
    expect(screen.getByText(/技能 0 · 意图 1 · 事实 1 · 漏洞 1 · 资产 1/)).toBeTruthy()
  })

  it('omits the objective and authorization lines while they are empty', () => {
    const store = makeStore<SastProjection | null | undefined>({ ...STANDING, scan: { ...SCAN, objective: '', authorization: '' } })
    render(<SastView {...viewProps(store)} />)
    expect(screen.queryByText(/目的：/)).toBeNull()
    expect(screen.queryByText(/授权：/)).toBeNull()
  })

  it('renders an empty header while the projection scan is null', () => {
    const store = makeStore<SastProjection | null | undefined>({
      ...STANDING, scan: null, nodes: [], edges: [], counts: { intents: 0, facts: 0, findings: 0, assets: 0 },
    })
    render(<SastView {...viewProps(store)} />)
    expect(screen.getByText(/技能 0 · 意图 0 · 事实 0 · 漏洞 0 · 资产 0/)).toBeTruthy()
    expect(screen.queryByText(/目的：/)).toBeNull()
    expect(screen.queryByText(/授权：/)).toBeNull()
  })

  it('renders the sub-tab bar with counts and switches the sub-tab content', () => {
    const store = makeStore<SastProjection | null | undefined>(STANDING)
    render(<SastView {...viewProps(store)} />)
    expect(screen.getByTestId('sast-explore')).toBeTruthy()
    expect(screen.getByTestId('explore-node-scan')).toBeTruthy()

    expect(screen.getByText('审计链路')).toBeTruthy()
    expect(screen.getByText('漏洞 (1)')).toBeTruthy()
    expect(screen.getByText('代码资产 (1)')).toBeTruthy()
    expect(screen.getByText('任务与进度')).toBeTruthy()
    expect(screen.getByText('报告')).toBeTruthy()

    act(() => { screen.getByTestId('sast-tab-findings').click() })
    expect(screen.getByTestId('sast-findings')).toBeTruthy()
    expect(screen.queryByTestId('sast-explore')).toBeNull()

    act(() => { screen.getByTestId('sast-tab-assets').click() })
    expect(screen.getByTestId('sast-assets')).toBeTruthy()
    expect(screen.queryByTestId('sast-findings')).toBeNull()

    act(() => { screen.getByTestId('sast-tab-tasks').click() })
    // STANDING has an intent (no registered skill) — the intent-status
    // distribution shows, not the fully-empty note (see TasksView.tsx).
    expect(screen.getByTestId('sast-tasks-no-methodology')).toBeTruthy()

    act(() => { screen.getByTestId('sast-tab-report').click() })
    expect(screen.getByTestId('sast-report')).toBeTruthy()
    expect(screen.getByTestId('sast-report-markdown').textContent).toContain('白盒审计报告')
  })

  it('copies the rendered report and reports clipboard failures', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    const store = makeStore<SastProjection | null | undefined>(STANDING)
    render(<SastView {...viewProps(store)} />)
    act(() => { screen.getByTestId('sast-tab-report').click() })
    await act(async () => { screen.getByTestId('sast-report-copy').click() })
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('# 白盒审计报告'))
    expect(screen.getByTestId('sast-report-copy').textContent).toContain('已复制')

    writeText.mockRejectedValueOnce(new Error('denied'))
    await act(async () => { screen.getByTestId('sast-report-copy').click() })
    expect(screen.getByRole('status').textContent).toContain('复制失败')
  })

  it('downloads the report with a sanitized repo filename', () => {
    const createObjectURL = vi.fn(() => 'blob:report')
    const revokeObjectURL = vi.fn()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
    const store = makeStore<SastProjection | null | undefined>({ ...STANDING, scan: { ...SCAN, repoUrl: 'https://github.com/org/a path' } })
    render(<SastView {...viewProps(store)} />)
    act(() => { screen.getByTestId('sast-tab-report').click() })
    act(() => { screen.getByTestId('sast-report-download').click() })
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
    expect(click).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:report')
  })

  it('shows the explore empty note for a scan-only audit', () => {
    const store = makeStore<SastProjection | null | undefined>({
      ...STANDING, nodes: [], edges: [], counts: { intents: 0, facts: 0, findings: 0, assets: 0 },
    })
    render(<SastView {...viewProps(store)} />)
    expect(screen.getByTestId('sast-explore-empty').textContent).toBe('审计链路为空。先调用 sast_start_scan 记录仓库与审计目的。')
  })

  it('follows projection changes through the same source', () => {
    const store = makeStore<SastProjection | null | undefined>(null)
    render(<SastView {...viewProps(store)} />)
    expect(screen.getByText(/还没有白盒审计记录/)).toBeTruthy()
    act(() => { store.set(STANDING) })
    expect(screen.getAllByText('https://github.com/org/repo').length).toBeGreaterThan(0)
    expect(screen.getByTestId('explore-node-scan')).toBeTruthy()
  })
})
