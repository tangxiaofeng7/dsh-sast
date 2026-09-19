// @vitest-environment jsdom
/**
 * Batch UI acceptance (M6): the batch overview tab (job rows, header,
 * methodology names, unaudited badge — never "0 findings" for a skipped
 * job) and the Review Inbox tab (only reviewStatus=pending jobs, fallback
 * text, empty note), plus SastView's batch-owner tab gating (batch tabs
 * appear only while `sastBatch` is non-null, independent of whether `sast`
 * is null — a pure batch owner never itself calls sast_start_scan).
 *
 * See sast-view.client.spec.tsx's header comment for why these tests stand
 * in a minimal translate function rather than the real
 * dsh-client-test-runtime/dsh-client-locale packages.
 */
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSyncExternalStore } from 'react'
import type { SastBatchProjection, SastProjection } from '@tangxiaofeng7/dsh-sast-host/client'
import { BatchView } from '../src/client/BatchView.tsx'
import { ReviewInboxView } from '../src/client/ReviewInboxView.tsx'
import { SastView } from '../src/client/SastView.tsx'
import type { SastViewProps } from '../src/client/SastView.tsx'
import { zh } from '../src/client/locales.ts'

/** Minimal translate stub: the sast namespace only, `{param}` interpolation, falls back to the key. */
function t(key: string, params?: Record<string, unknown>): string {
  const template = (zh as Record<string, string>)[key] ?? key
  if (params === undefined) return template
  return template.replace(/\{(\w+)\}/g, (_match, name: string) => String(params[name] ?? ''))
}

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

const BATCH: SastBatchProjection = {
  id: 'batch-1',
  objective: 'audit payment repos',
  authorization: 'CTO sign-off',
  status: 'running',
  total: 3,
  methodologies: [{ name: 'sqli', manifestDigest: 'a'.repeat(64), contentDigest: 'b'.repeat(64) }],
  jobs: [
    { ordinal: 1, repoUrl: '/repo-1', status: 'succeeded', reviewStatus: 'none', attempt: 1 },
    { ordinal: 2, repoUrl: '/repo-2', status: 'skipped', reviewStatus: 'pending', attempt: 2, fallback: 'authentication failed', errorClass: 'auth' },
    { ordinal: 3, repoUrl: '/repo-3', status: 'degraded', reviewStatus: 'pending', attempt: 1, fallback: 'unresolved blocked check' },
  ],
  recentEvents: [],
}

describe('BatchView', () => {
  it('renders the header (objective/authorization/status/total) and methodology names', () => {
    render(<BatchView sastBatch={BATCH} t={t} />)
    expect(screen.getByTestId('sast-batch-header').textContent).toContain('audit payment repos')
    expect(screen.getByTestId('sast-batch-header').textContent).toContain('CTO sign-off')
    expect(screen.getByTestId('sast-batch-methodologies').textContent).toContain('sqli')
  })

  it('renders one row per job, in ordinal order', () => {
    render(<BatchView sastBatch={BATCH} t={t} />)
    const jobs = screen.getAllByTestId('sast-batch-job')
    expect(jobs).toHaveLength(3)
    expect(jobs[0].textContent).toContain('/repo-1')
    expect(jobs[1].textContent).toContain('/repo-2')
    expect(jobs[2].textContent).toContain('/repo-3')
  })

  it('shows a skipped job\'s fallback text, and never renders a "0 findings" claim for it (A23)', () => {
    render(<BatchView sastBatch={BATCH} t={t} />)
    const fallbacks = screen.getAllByTestId('sast-batch-job-fallback')
    expect(fallbacks.some(el => el.textContent === 'authentication failed')).toBe(true)
    expect(screen.queryByText(/0 findings/i)).toBeNull()
    expect(screen.queryByText(/0.*漏洞/)).toBeNull()
  })

  it('marks an unaudited job (no fallback text) with the unaudited badge, not a success-shaped status', () => {
    const withUnaudited: SastBatchProjection = {
      ...BATCH,
      jobs: [{ ordinal: 1, repoUrl: '/repo-x', status: 'queued', reviewStatus: 'none', attempt: 0 }],
    }
    render(<BatchView sastBatch={withUnaudited} t={t} />)
    const job = screen.getByTestId('sast-batch-job')
    expect(job.textContent).toContain(t('batch.job.unaudited'))
  })

  it('renders zero job rows without throwing for an empty batch', () => {
    render(<BatchView sastBatch={{ ...BATCH, jobs: [], total: 0 }} t={t} />)
    expect(screen.queryAllByTestId('sast-batch-job')).toHaveLength(0)
  })
})

describe('ReviewInboxView', () => {
  it('renders only reviewStatus=pending jobs', () => {
    render(<ReviewInboxView sastBatch={BATCH} t={t} />)
    const items = screen.getAllByTestId('sast-review-inbox-item')
    expect(items).toHaveLength(2)
    expect(items[0].textContent).toContain('/repo-2')
    expect(items[1].textContent).toContain('/repo-3')
    expect(items.every(el => !el.textContent?.includes('/repo-1'))).toBe(true)
  })

  it('shows each pending job\'s fallback text', () => {
    render(<ReviewInboxView sastBatch={BATCH} t={t} />)
    const fallbacks = screen.getAllByTestId('sast-review-inbox-fallback')
    expect(fallbacks.map(el => el.textContent)).toEqual(['authentication failed', 'unresolved blocked check'])
  })

  it('renders the empty note when no job is pending review', () => {
    const noPending: SastBatchProjection = { ...BATCH, jobs: BATCH.jobs.map(j => ({ ...j, reviewStatus: 'none' as const })) }
    render(<ReviewInboxView sastBatch={noPending} t={t} />)
    expect(screen.getByTestId('sast-review-inbox-empty')).toBeTruthy()
  })

  it('presents actions read-only (no button/input elements — writes go through sast_batch_resolve in the conversation, ADR-08)', () => {
    render(<ReviewInboxView sastBatch={BATCH} t={t} />)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    expect(screen.queryAllByRole('textbox')).toHaveLength(0)
  })
})

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

/** View props stub routing `useProjection('sast')` and `useProjection('sastBatch')` to independent stores. */
function viewPropsOf(
  sastStore: ReturnType<typeof makeStore<SastProjection | null | undefined>>,
  batchStore: ReturnType<typeof makeStore<SastBatchProjection | null | undefined>>,
): SastViewProps {
  const useProjection = ((key: string) => {
    if (key === 'sastBatch') return useSyncExternalStore(batchStore.subscribe, batchStore.getSnapshot)
    return useSyncExternalStore(sastStore.subscribe, sastStore.getSnapshot)
  }) as SastViewProps['useProjection']
  return { useProjection, t } as unknown as SastViewProps
}

describe('SastView batch-tab gating', () => {
  it('shows no batch tabs while sastBatch is null, even with a live sast projection', () => {
    const sastStore = makeStore<SastProjection | null | undefined>(null)
    const batchStore = makeStore<SastBatchProjection | null | undefined>(null)
    render(<SastView {...viewPropsOf(sastStore, batchStore)} />)
    expect(screen.queryByTestId('sast-tab-batch')).toBeNull()
    expect(screen.queryByTestId('sast-tab-reviewInbox')).toBeNull()
  })

  it('shows the batch tabs once sastBatch becomes non-null, even while sast stays null (a pure batch owner)', () => {
    const sastStore = makeStore<SastProjection | null | undefined>(null)
    const batchStore = makeStore<SastBatchProjection | null | undefined>(null)
    render(<SastView {...viewPropsOf(sastStore, batchStore)} />)
    act(() => { batchStore.set(BATCH) })
    expect(screen.getByTestId('sast-tab-batch')).toBeTruthy()
    expect(screen.getByTestId('sast-tab-reviewInbox')).toBeTruthy()
    // The single-repo scan header must not render — this session never
    // scanned a repo itself.
    expect(screen.queryByTestId('sast-tabs')?.textContent).not.toContain('还没有白盒审计记录')
  })

  it('clicking the batch tab renders BatchView content', () => {
    const sastStore = makeStore<SastProjection | null | undefined>(null)
    const batchStore = makeStore<SastBatchProjection | null | undefined>(BATCH)
    render(<SastView {...viewPropsOf(sastStore, batchStore)} />)
    screen.getByTestId('sast-tab-batch').click()
    expect(screen.getByTestId('sast-batch-view')).toBeTruthy()
  })
})
