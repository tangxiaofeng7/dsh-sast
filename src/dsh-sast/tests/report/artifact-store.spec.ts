/**
 * `ReportArtifactStore`: the shared `report_artifacts` allocator both
 * `SastStore` and `BatchStore` must delegate to — proving the specific bug
 * this extraction fixes: two independent id counters over the same table
 * would allocate the same `artifact-<n>` id once both stores are composed
 * against the same domain.
 * @module
 */

import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import { ReportArtifactStore } from '../../src/report/artifact-store.ts'
import { SastStore } from '../../src/store.ts'
import { BatchStore } from '../../src/batch/store.ts'
import { sastDomainSpec } from '../../src/spec.ts'
import { MemoryStorageBackend } from '../memory-backend.ts'

async function domainBench(): Promise<() => Promise<Awaited<ReturnType<DomainFacility['open']>>>> {
  const ctx = new Context()
  await ctx.plugin(Storage)
  ctx.storage.backend.register('memory', new MemoryStorageBackend())
  const facility = new DomainFacility(ctx, { backend: 'memory', routes: {} })
  const domain = await facility.open(sastDomainSpec)
  return () => Promise.resolve(domain)
}

const artifactFields = { kind: 'repo-markdown' as const, uri: 'file:///x', sha256: 'a'.repeat(64), bytes: 1 }

describe('ReportArtifactStore', () => {
  it('allocates sequential ids across repeated calls', async () => {
    const domain = await domainBench()
    const artifacts = new ReportArtifactStore(domain)
    const a = await artifacts.put(artifactFields)
    const b = await artifacts.put(artifactFields)
    expect(a.id).toBe('artifact-1')
    expect(b.id).toBe('artifact-2')
  })

  it('rebuilds its counter from the durable table on a fresh instance (no in-memory state carried over)', async () => {
    const domain = await domainBench()
    const first = new ReportArtifactStore(domain)
    await first.put(artifactFields)
    await first.put(artifactFields)
    const second = new ReportArtifactStore(domain)
    const c = await second.put(artifactFields)
    expect(c.id).toBe('artifact-3')
  })

  it('SastStore and BatchStore sharing ONE ReportArtifactStore never collide on an id, even interleaved', async () => {
    const domain = await domainBench()
    const shared = new ReportArtifactStore(domain)
    const sastStore = new SastStore(new Context(), () => Date.now(), domain, shared)
    const batchStore = new BatchStore(domain, () => Date.now(), shared)

    const results = await Promise.all([
      sastStore.putReportArtifact({ kind: 'repo-markdown', uri: 'file:///a', sha256: 'a'.repeat(64), bytes: 1 }),
      batchStore.putReportArtifact({ kind: 'batch-markdown', uri: 'file:///b', sha256: 'b'.repeat(64), bytes: 1 }),
      sastStore.putReportArtifact({ kind: 'repo-sarif', uri: 'file:///c', sha256: 'c'.repeat(64), bytes: 1 }),
      batchStore.putReportArtifact({ kind: 'batch-json', uri: 'file:///d', sha256: 'd'.repeat(64), bytes: 1 }),
    ])
    const ids = results.map(r => r.id)
    expect(new Set(ids).size).toBe(4) // no two writes landed on the same id
    expect(ids.sort()).toEqual(['artifact-1', 'artifact-2', 'artifact-3', 'artifact-4'])
  })

  it('WITHOUT sharing (each store given its own ReportArtifactStore), two stores over the same domain DO collide — demonstrating why sharing is required', async () => {
    const domain = await domainBench()
    // Deliberately NOT shared: each store builds its own private instance
    // (the constructors' own default when no `artifacts` argument is given).
    const sastStore = new SastStore(new Context(), () => Date.now(), domain)
    const batchStore = new BatchStore(domain, () => Date.now())

    const [fromSast, fromBatch] = await Promise.all([
      sastStore.putReportArtifact({ kind: 'repo-markdown', uri: 'file:///a', sha256: 'a'.repeat(64), bytes: 1 }),
      batchStore.putReportArtifact({ kind: 'batch-markdown', uri: 'file:///b', sha256: 'b'.repeat(64), bytes: 1 }),
    ])
    // Both stores independently computed "no prior rows -> next id is
    // artifact-1" before either write landed — the exact collision the
    // shared allocator exists to prevent.
    expect(fromSast.id).toBe('artifact-1')
    expect(fromBatch.id).toBe('artifact-1')
  })
})
