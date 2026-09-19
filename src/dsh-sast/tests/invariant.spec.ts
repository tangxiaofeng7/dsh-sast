/**
 * The sast invariant companion: referential discipline on `domain/changed`
 * — every record references an existing scan of the sast domain, every edge
 * references source/target nodes of the exact kinds its kind demands within
 * one session (including the SAST-specific `flows_to` fact→fact edge), and
 * scans rows carry their own key as sessionId.
 * @module
 */

import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import InvariantRegistry, { type InvariantError } from '@deepseek-ai/dsh-invariants'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import type { DomainChanged } from '@deepseek-ai/dsh-storage-domain'
import * as Companion from '../src/invariant.ts'
import { sastDomainSpec, type SastEdge } from '../src/spec.ts'
import { MemoryStorageBackend } from './memory-backend.ts'

/** One well-formed edge of every kind for session s1. */
const edge = (kind: SastEdge['kind'], sourceId: string, targetId: string): SastEdge => ({
  id: `e-${kind}`, sessionId: 's1', kind, sourceId, targetId,
})

async function setup(open = true): Promise<{ ctx: Context }> {
  const ctx = new Context()
  await ctx.plugin(Storage)
  await ctx.plugin(InvariantRegistry, { enabled: true })
  await ctx.plugin(Companion)
  ctx.storage.backend.register('memory', new MemoryStorageBackend())
  const facility = new DomainFacility(ctx, { backend: 'memory', routes: {} })
  ctx.storage.mount('domain', facility)
  if (open) {
    const domain = await facility.open(sastDomainSpec)
    await domain.table('scans').put('s1', {
      id: 'scan-1', sessionId: 's1', provider: 'local', repoUrl: '/repo', branch: '', commit: '',
      workspacePath: '/repo', objective: 'o', scope: [], authorization: '', languages: [], fileCount: 0,
    })
    await domain.table('scans').put('s9', {
      id: 'scan-1', sessionId: 's9', provider: 'local', repoUrl: '/other', branch: '', commit: '',
      workspacePath: '/other', objective: 'o', scope: [], authorization: '', languages: [], fileCount: 0,
    })
    await domain.table('intents').put('intent-1', { id: 'intent-1', sessionId: 's1', title: 'a', detail: '', category: 'custom', scope: [], status: 'pending', note: '', createdAt: 0 })
    await domain.table('intents').put('intent-2', { id: 'intent-2', sessionId: 's1', title: 'b', detail: '', category: 'custom', scope: [], status: 'pending', note: '', createdAt: 0 })
    await domain.table('intents').put('intent-9', { id: 'intent-9', sessionId: 's9', title: 'foreign', detail: '', category: 'custom', scope: [], status: 'pending', note: '', createdAt: 0 })
    await domain.table('facts').put('fact-1', { id: 'fact-1', sessionId: 's1', intentId: 'intent-1', kind: 'sink', path: 'a', line: 0, lineAdjusted: false, detail: 'd', confidence: 1, source: 'llm', engineRule: '', at: 0 })
    await domain.table('facts').put('fact-2', { id: 'fact-2', sessionId: 's1', intentId: 'intent-1', kind: 'source', path: 'b', line: 0, lineAdjusted: false, detail: 'd2', confidence: 1, source: 'llm', engineRule: '', at: 0 })
    await domain.table('findings').put('finding-1', {
      id: 'finding-1', sessionId: 's1', intentId: 'intent-2', title: 'n', severity: 'high',
      confidence: 0.5, description: '', codePath: [{ path: 'a', line: 1 }], remediation: '', poc: '',
      status: 'open', triageReason: '', affectedAssetId: 'asset-1', at: 0,
    })
    await domain.table('assets').put('asset-1', { id: 'asset-1', sessionId: 's1', type: 'repo', value: 'repo-root', meta: '', at: 0 })
    await domain.table('assets').put('asset-2', { id: 'asset-2', sessionId: 's1', type: 'file', value: 'a', meta: '', at: 0 })
    await domain.table('assets').put('asset-9', { id: 'asset-9', sessionId: 's9', type: 'file', value: 'x', meta: '', at: 0 })
    await domain.table('edges').put('e-spawns', edge('spawns', 'scan-1', 'intent-1'))
    await domain.table('edges').put('e-yields', edge('yields', 'intent-1', 'fact-1'))
    await domain.table('edges').put('e-derived', edge('derived_from', 'fact-1', 'intent-2'))
    await domain.table('edges').put('e-proves', edge('proves', 'intent-2', 'finding-1'))
    await domain.table('edges').put('e-flows', edge('flows_to', 'fact-1', 'fact-2'))
    await domain.table('edges').put('e-parent', edge('parent', 'asset-1', 'asset-2'))
  }
  return { ctx }
}

const invariantViolation: unknown = expect.objectContaining<Partial<InvariantError>>({
  code: 'INVARIANT',
  packageName: '@tangxiaofeng7/dsh-sast',
})

function emit(ctx: Context, change: Omit<DomainChanged, 'domain'> & { domain?: string }): void {
  ctx.emit('domain/changed', { domain: 'sast', ...change } as DomainChanged)
}

describe('sast invariant companion', () => {
  it('accepts well-formed records of every sast table, including flows_to', async () => {
    const { ctx } = await setup()
    expect(() => {
      emit(ctx, {
        table: 'scans', key: 's2', operation: 'put',
        value: { id: 'scan-1', sessionId: 's2', provider: 'local', repoUrl: '/x', branch: '', commit: '', workspacePath: '/x', objective: 'o', scope: [], authorization: '', languages: [], fileCount: 0 },
      })
    }).not.toThrow()
    expect(() => {
      emit(ctx, {
        table: 'intents', key: 'intent-3', operation: 'put',
        value: { id: 'intent-3', sessionId: 's1', title: 'c', detail: '', category: 'custom', scope: [], status: 'pending', note: '', createdAt: 0 },
      })
    }).not.toThrow()
    expect(() => {
      emit(ctx, {
        table: 'edges', key: 'e-new', operation: 'put',
        value: edge('derived_from', 'fact-1', 'intent-2'),
      })
    }).not.toThrow()
    expect(() => {
      emit(ctx, { table: 'edges', key: 'e-flows-new', operation: 'put', value: edge('flows_to', 'fact-1', 'fact-2') })
    }).not.toThrow()
  })

  it('rejects a scans row whose key does not match its sessionId', async () => {
    const { ctx } = await setup()
    expect(() => {
      emit(ctx, {
        table: 'scans', key: 's2', operation: 'put',
        value: { id: 'scan-1', sessionId: 's9', provider: 'local', repoUrl: '/x', branch: '', commit: '', workspacePath: '/x', objective: 'o', scope: [], authorization: '', languages: [], fileCount: 0 },
      })
    }).toThrow(invariantViolation)
  })

  it('accepts a well-formed report_artifacts row', async () => {
    const { ctx } = await setup()
    expect(() => {
      emit(ctx, {
        table: 'report_artifacts', key: 'artifact-1', operation: 'put',
        value: { id: 'artifact-1', kind: 'repo-markdown', uri: 'file:///x', sha256: 'a'.repeat(64), bytes: 10, createdAt: 0 },
      })
    }).not.toThrow()
  })

  it('rejects a report_artifacts row whose key does not match its id', async () => {
    const { ctx } = await setup()
    expect(() => {
      emit(ctx, {
        table: 'report_artifacts', key: 'artifact-9', operation: 'put',
        value: { id: 'artifact-1', kind: 'repo-markdown', uri: 'file:///x', sha256: 'a'.repeat(64), bytes: 10, createdAt: 0 },
      })
    }).toThrow(invariantViolation)
  })

  it('rejects a report_artifacts row whose sha256 is not a lowercase hex digest', async () => {
    const { ctx } = await setup()
    expect(() => {
      emit(ctx, {
        table: 'report_artifacts', key: 'artifact-1', operation: 'put',
        value: { id: 'artifact-1', kind: 'repo-markdown', uri: 'file:///x', sha256: 'not-a-digest', bytes: 10, createdAt: 0 },
      })
    }).toThrow(invariantViolation)
    expect(() => {
      emit(ctx, {
        table: 'report_artifacts', key: 'artifact-1', operation: 'put',
        value: { id: 'artifact-1', kind: 'repo-markdown', uri: 'file:///x', sha256: 'A'.repeat(64), bytes: 10, createdAt: 0 },
      })
    }).toThrow(invariantViolation)
  })

  it('rejects a report_artifacts row whose bytes is negative or non-integer', async () => {
    const { ctx } = await setup()
    expect(() => {
      emit(ctx, {
        table: 'report_artifacts', key: 'artifact-1', operation: 'put',
        value: { id: 'artifact-1', kind: 'repo-markdown', uri: 'file:///x', sha256: 'a'.repeat(64), bytes: -1, createdAt: 0 },
      })
    }).toThrow(invariantViolation)
    expect(() => {
      emit(ctx, {
        table: 'report_artifacts', key: 'artifact-1', operation: 'put',
        value: { id: 'artifact-1', kind: 'repo-markdown', uri: 'file:///x', sha256: 'a'.repeat(64), bytes: 1.5, createdAt: 0 },
      })
    }).toThrow(invariantViolation)
  })

  it('rejects records referencing an unknown session', async () => {
    const { ctx } = await setup()
    expect(() => {
      emit(ctx, {
        table: 'intents', key: 'i-ghost', operation: 'put',
        value: { id: 'i-ghost', sessionId: 'ghost', title: 'a', detail: '', category: 'custom', scope: [], status: 'pending', note: '', createdAt: 0 },
      })
    }).toThrow(invariantViolation)
    expect(() => {
      emit(ctx, {
        table: 'edges', key: 'e-ghost', operation: 'put',
        value: { ...edge('spawns', 'scan-1', 'intent-1'), sessionId: 'ghost' },
      })
    }).toThrow(invariantViolation)
  })

  it('rejects edges whose source is not the required node kind of the session', async () => {
    const { ctx } = await setup()
    expect(() => {
      emit(ctx, { table: 'edges', key: 'e1', operation: 'put', value: edge('spawns', 'intent-1', 'intent-2') })
    }).toThrow(invariantViolation)
    expect(() => {
      emit(ctx, { table: 'edges', key: 'e1', operation: 'put', value: edge('yields', 'fact-1', 'fact-1') })
    }).toThrow(invariantViolation)
    expect(() => {
      emit(ctx, { table: 'edges', key: 'e1', operation: 'put', value: edge('derived_from', 'intent-1', 'intent-2') })
    }).toThrow(invariantViolation)
    expect(() => {
      emit(ctx, { table: 'edges', key: 'e1', operation: 'put', value: edge('proves', 'fact-1', 'finding-1') })
    }).toThrow(invariantViolation)
    expect(() => {
      emit(ctx, { table: 'edges', key: 'e1', operation: 'put', value: edge('flows_to', 'intent-1', 'fact-1') })
    }).toThrow(invariantViolation)
    expect(() => {
      emit(ctx, { table: 'edges', key: 'e1', operation: 'put', value: edge('parent', 'intent-1', 'asset-2') })
    }).toThrow(invariantViolation)
    expect(() => {
      emit(ctx, { table: 'edges', key: 'e1', operation: 'put', value: edge('spawns', 'scan-9', 'intent-1') })
    }).toThrow(invariantViolation)
  })

  it('rejects edges whose target is not the node kind the edge points at', async () => {
    const { ctx } = await setup()
    expect(() => {
      emit(ctx, { table: 'edges', key: 'e1', operation: 'put', value: edge('spawns', 'scan-1', 'fact-1') })
    }).toThrow(invariantViolation)
    expect(() => {
      emit(ctx, { table: 'edges', key: 'e1', operation: 'put', value: edge('proves', 'intent-2', 'intent-1') })
    }).toThrow(invariantViolation)
    expect(() => {
      emit(ctx, { table: 'edges', key: 'e1', operation: 'put', value: edge('flows_to', 'fact-1', 'intent-1') })
    }).toThrow(invariantViolation)
    expect(() => {
      emit(ctx, { table: 'edges', key: 'e1', operation: 'put', value: edge('parent', 'asset-1', 'finding-1') })
    }).toThrow(invariantViolation)
  })

  it('rejects edges referencing nodes of another session', async () => {
    const { ctx } = await setup()
    expect(() => {
      emit(ctx, { table: 'edges', key: 'e1', operation: 'put', value: edge('yields', 'intent-9', 'fact-1') })
    }).toThrow(invariantViolation)
    expect(() => {
      emit(ctx, { table: 'edges', key: 'e1', operation: 'put', value: edge('parent', 'asset-9', 'asset-2') })
    }).toThrow(invariantViolation)
  })

  it('rejects findings referencing an unknown or foreign-session asset', async () => {
    const { ctx } = await setup()
    expect(() => {
      emit(ctx, {
        table: 'findings', key: 'finding-2', operation: 'put',
        value: {
          id: 'finding-2', sessionId: 's1', intentId: 'intent-2', title: 'n', severity: 'low',
          confidence: 0.5, description: '', codePath: [{ path: 'a', line: 1 }], remediation: '', poc: '',
          status: 'open', triageReason: '', affectedAssetId: 'missing', at: 0,
        },
      })
    }).toThrow(invariantViolation)
    expect(() => {
      emit(ctx, {
        table: 'findings', key: 'finding-2', operation: 'put',
        value: {
          id: 'finding-2', sessionId: 's1', intentId: 'intent-2', title: 'n', severity: 'low',
          confidence: 0.5, description: '', codePath: [{ path: 'a', line: 1 }], remediation: '', poc: '',
          status: 'open', triageReason: '', affectedAssetId: 'asset-9', at: 0,
        },
      })
    }).toThrow(invariantViolation)
    // No affected asset is fine.
    expect(() => {
      emit(ctx, {
        table: 'findings', key: 'finding-2', operation: 'put',
        value: {
          id: 'finding-2', sessionId: 's1', intentId: 'intent-2', title: 'n', severity: 'low',
          confidence: 0.5, description: '', codePath: [{ path: 'a', line: 1 }], remediation: '', poc: '',
          status: 'open', triageReason: '', at: 0,
        },
      })
    }).not.toThrow()
  })

  it('rejects a sast event emitted while the domain is not open', async () => {
    const { ctx } = await setup(false)
    expect(() => {
      emit(ctx, {
        table: 'intents', key: 'i1', operation: 'put',
        value: { id: 'i1', sessionId: 's1', title: 'a', detail: '', category: 'custom', scope: [], status: 'pending', note: '', createdAt: 0 },
      })
    }).toThrow(invariantViolation)
  })

  it('ignores deletions, events of other domains, and unknown sast tables', async () => {
    const { ctx } = await setup()
    expect(() => {
      emit(ctx, { table: 'intents', key: 'i1', operation: 'deleted', value: {} })
    }).not.toThrow()
    expect(() => {
      emit(ctx, { table: 'mystery', key: 'm1', operation: 'put', value: {} })
    }).not.toThrow()
    ctx.emit('domain/changed', { domain: 'other', table: 'rows', key: 'a', operation: 'put', value: {} } as DomainChanged)
  })
})
