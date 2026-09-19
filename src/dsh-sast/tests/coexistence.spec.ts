/**
 * spike-B (architecture.md §4, non-blocking for M1): the sast domain opens
 * correctly under a `storage-domain` config that also routes a second,
 * unrelated domain — proving the coexistence fallback README.md documents
 * (a single merged `routes` map naming both domains) actually resolves both
 * routes independently rather than one silently winning. This is the "M1
 * real coexistence test" leg of ADR-12's three-layer mitigation (the other
 * two are tests/bundle.spec.ts's routes assertion and this README fallback).
 * @module
 */

import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import { z } from 'zod'
import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain'
import { sastDomainSpec } from '../src/spec.ts'
import { MemoryStorageBackend } from './memory-backend.ts'

/** A minimal stand-in for another plugin's own storage-domain shape: just enough to prove independent routing, without depending on any real sibling package. */
const neighborDomainSpec = defineDomain({
  name: 'neighbor',
  version: 1,
  tables: {
    goals: domainTable<string, { id: string; sessionId: string }>(z.object({ id: z.string(), sessionId: z.string() })),
  },
})

/** Records every unit name opened against the wrapped backend, so a test can assert WHICH physical backend actually served a given domain — round-tripping alone doesn't prove routing, since every test backend here is behaviorally identical. */
class TrackingBackend extends MemoryStorageBackend {
  readonly openedUnitNames: string[] = []

  constructor() {
    super()
    const realOpen = this.kv.open.bind(this.kv)
    this.kv.open = async (descriptor) => {
      this.openedUnitNames.push(descriptor.name)
      return realOpen(descriptor)
    }
  }
}

describe('spike-B: sast domain coexists with a second routed domain', () => {
  it('opens both domains under one merged routes map, each resolving to the SAME named route rather than either falling back to the default', async () => {
    const ctx = new Context()
    await ctx.plugin(Storage)
    const sqliteBackend = new TrackingBackend()
    const jsonBackend = new TrackingBackend()
    ctx.storage.backend.register('sqlite', sqliteBackend)
    ctx.storage.backend.register('json', jsonBackend)
    // The README's documented manual-merge fallback: one storage-domain row
    // naming both domains, exactly as a user would hand-edit cordis.yml
    // after discovering two single-key overrides had clobbered each other.
    const facility = new DomainFacility(ctx, { backend: 'json', routes: { neighbor: 'sqlite', sast: 'sqlite' } })
    ctx.storage.mount('domain', facility)

    const sast = await facility.open(sastDomainSpec)
    const neighbor = await facility.open(neighborDomainSpec)

    // Both domains opened their unit against the sqlite backend — the
    // routed backend — and neither touched the default (json) backend.
    expect(sqliteBackend.openedUnitNames).toEqual(['sast', 'neighbor'])
    expect(jsonBackend.openedUnitNames).toEqual([])

    await sast.table('scans').put('session-a', {
      id: 'scan-1', sessionId: 'session-a', provider: 'local', repoUrl: '/repo', branch: '', commit: '',
      workspacePath: '/repo', objective: 'o', scope: [], authorization: '', languages: [], fileCount: 0,
    })
    await neighbor.table('goals').put('session-b', { id: 'goal-1', sessionId: 'session-b' })
    expect(sast.table('scans').get('session-a')).toMatchObject({ id: 'scan-1' })
    expect(neighbor.table('goals').get('session-b')).toMatchObject({ id: 'goal-1' })

    await sast.close()
    await neighbor.close()
  })

  it('routes sast to its own named entry when only its single-key override is present (routes: { sast: sqlite })', async () => {
    const ctx = new Context()
    await ctx.plugin(Storage)
    const sqliteBackend = new TrackingBackend()
    const jsonBackend = new TrackingBackend()
    ctx.storage.backend.register('sqlite', sqliteBackend)
    ctx.storage.backend.register('json', jsonBackend)
    const facility = new DomainFacility(ctx, { backend: 'json', routes: { sast: 'sqlite' } })
    ctx.storage.mount('domain', facility)

    const sast = await facility.open(sastDomainSpec)
    expect(sqliteBackend.openedUnitNames).toEqual(['sast'])
    expect(jsonBackend.openedUnitNames).toEqual([])
    await sast.close()
  })
})
