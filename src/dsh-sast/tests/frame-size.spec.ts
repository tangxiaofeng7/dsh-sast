/**
 * Spike-C (docs/architecture.md §4, gates M3): measures the serialized JSON size of a
 * fully-saturated `sast` projection frame (NODE_CAP=600 facts, each with a
 * realistic detail/snippet-preview payload) against a session/projection
 * wire budget. Measured at ~224 KiB for 600 facts with realistic ~180-byte
 * detail strings and ~90-byte snippet previews — comfortably inside the
 * budget below, so no fallback is needed yet. If this ever regresses past
 * the budget, the documented fallback (docs/architecture.md §4) is to lower the caps or
 * trim `fact` payloads down to `path`/`line`/`kind` only — the store is
 * unaffected either way, since only the projection's wire shape would
 * change.
 * @module
 */

import { describe, expect, it } from 'vitest'
import { applySastEvent, NODE_CAP, sastInitialState, viewSastState } from '../src/projection.ts'

/** A conservative per-frame wire budget (bytes): well under the ~1MB range where a single session/projection frame would start being a practical transport concern. */
const FRAME_BUDGET_BYTES = 512 * 1024

describe('spike-C: projection frame size at NODE_CAP', () => {
  it('stays within the wire budget once the fact list is fully saturated at NODE_CAP with realistic payloads', () => {
    const scanEvent = { type: 'tool/call', seq: 1, time: 1, data: { turn: 1, step: 1, callId: 'c1', name: 'sast_start_scan', arguments: JSON.stringify({ repoUrl: 'https://github.com/org/repo', objective: 'audit the payment service for injection and auth bypass issues across the checkout and refund flows' }) } } as never
    const intentEvent = { type: 'tool/call', seq: 2, time: 2, data: { turn: 1, step: 2, callId: 'c2', name: 'sast_add_intent', arguments: JSON.stringify({ scanId: 'scan-1', title: 'map every controller and route under src/web' }) } } as never
    let state = applySastEvent(applySastEvent(sastInitialState, scanEvent), intentEvent)
    for (let i = 0; i < NODE_CAP; i++) {
      const args = {
        intentId: 'intent-1',
        kind: 'sink',
        path: `src/dao/module${i % 20}/Repository${i}.java`,
        line: 40 + (i % 200),
        symbol: `selectByKeywordAndStatusAndDateRange${i}`,
        detail: `Detected string concatenation building a raw SQL fragment from an unsanitized request parameter in method ${i}`,
        snippet: 'String sql = "SELECT * FROM orders WHERE keyword = \'" + keyword + "\' AND status = " + status;',
        confidence: 0.5 + (i % 5) / 10,
      }
      const event = { type: 'tool/call', seq: 3 + i, time: 3 + i, data: { turn: 1, step: 3 + i, callId: `c${3 + i}`, name: 'sast_add_fact', arguments: JSON.stringify(args) } } as never
      state = applySastEvent(state, event)
    }
    const view = viewSastState(state)
    expect(view).not.toBeNull()
    expect(view!.nodes.filter(node => node.kind === 'fact')).toHaveLength(NODE_CAP)

    const wireBytes = Buffer.byteLength(JSON.stringify(view), 'utf8')
    expect(wireBytes).toBeLessThan(FRAME_BUDGET_BYTES)
  })
})
