/**
 * Structural loop protection for the sast write tools (tools-protocol.md §3
 * "循环防护"): a per-session, tool-layer guard that mechanically breaks the
 * two repeat signatures behind the audit agent's run-away loops —
 *
 * 1. an identical write re-issued after it already SUCCEEDED (every success
 *    appends a node, so a repeat is a pure duplicate: intent / fact /
 *    finding / asset, or a duplicate delegated submission), and
 * 2. an identical write re-issued after it already FAILED twice with the
 *    same arguments (the model retrying a rejected path/reference instead of
 *    re-orienting, the exact pattern the protocol prose forbids).
 *
 * The guard is deliberately mechanical, not prompt-level: instructions.ts
 * asks the model not to loop, and this wrapper guarantees it — a looping
 * call is rejected before it executes, with an error that names the way out
 * (sast_state / the lighter sast_checkpoint, reuse the returned ids, or
 * change direction). Reads (sast_state/sast_graph/sast_coverage/
 * sast_checkpoint) and idempotent mutations (sast_register_skill,
 * sast_set_skill_enabled, sast_update_intent, sast_triage) are not wrapped.
 * `sast_start_scan` keeps its documented reset semantics — an identical
 * re-scan is a legitimate restart and only its failure-retry storm is capped.
 * @module @tangxiaofeng7/dsh-sast-host/src/loop-guard
 */

import type { ToolDefinition, ToolRunContext } from '@deepseek-ai/dsh-tools'

/** Resolve the calling session id or fail a non-agent caller (like todo_write). */
export function sessionIdOf(exec: { agent?: { session: { id: string } } }): string {
  if (!exec.agent) {
    throw new Error('sast_* tools require an owning agent session')
  }
  return exec.agent.session.id
}

/** How many identical consecutive failures may retry before the guard blocks the next identical attempt. */
const MAX_IDENTICAL_FAILURES = 2

/**
 * Guarded writes exempt from the duplicate-success rule: `sast_start_scan`'s
 * documented contract is that an identical re-scan RESETS the session's whole
 * graph (a legitimate restart), so only its failure-retry storm is capped.
 */
const DUPLICATE_SUCCESS_EXEMPT = new Set(['sast_start_scan'])

/** The last guarded write of one session: its identity and repeat counters. */
interface LastWrite {
  readonly key: string
  /** Consecutive identical successes — a second one is a duplicate write. */
  okStreak: number
  /** Consecutive identical failures — one past {@link MAX_IDENTICAL_FAILURES} is a retry loop. */
  errStreak: number
}

/** Stable, key-order-independent fingerprint of one call's arguments. */
function fingerprint(args: unknown): string {
  if (Array.isArray(args)) return `[${args.map(fingerprint).join(',')}]`
  if (args !== null && typeof args === 'object') {
    const entries = Object.entries(args as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    return `{${entries.map(([key, value]) => `${JSON.stringify(key)}:${fingerprint(value)}`).join(',')}}`
  }
  return JSON.stringify(args) ?? 'undefined'
}

/**
 * Per-plugin-instance guard state over the write tools. Keyed by session id,
 * remembering each session's LAST guarded write only: a different guarded
 * write resets the state (progress happened), while read-only tools leave it
 * untouched (re-orienting between repeats does not launder the loop).
 */
export class SastLoopGuard {
  private readonly lastWriteOfSession = new Map<string, LastWrite>()

  /**
   * Run one guarded write: reject the loop signatures before they execute,
   * then delegate to the real execute and record the outcome.
   * @param toolName - registry name of the wrapped tool.
   * @param execute - the tool's real execute function.
   * @param args - validated tool arguments.
   * @param exec - execution identity (the guard keys on the owning session).
   */
  run(
    toolName: string,
    execute: (args: unknown, exec: ToolRunContext) => Promise<unknown>,
    args: unknown,
    exec: ToolRunContext,
  ): Promise<unknown> {
    const sessionId = sessionIdOf(exec)
    const key = `${toolName}\u0000${fingerprint(args)}`
    const last = this.lastWriteOfSession.get(sessionId)
    if (last !== undefined && last.key === key) {
      if (last.okStreak >= 1 && !DUPLICATE_SUCCESS_EXEMPT.has(toolName)) {
        throw new Error(
          `sast: loop guard rejected ${toolName} — this exact call already succeeded in this session, so repeating it only writes a duplicate record. `
          + 'Stop retrying: call sast_state (or the lighter sast_checkpoint) to review what is already recorded, reuse the returned ids, '
          + 'or record genuinely new evidence under a different path/detail. To start the audit over, say so to the user instead of re-scanning silently.',
        )
      }
      if (last.errStreak >= MAX_IDENTICAL_FAILURES) {
        throw new Error(
          `sast: loop guard rejected ${toolName} — this exact call already failed ${last.errStreak} times in a row, and identical arguments will fail the same way. `
          + 'Call sast_state (or sast_checkpoint) to re-orient, then change direction or fix the arguments before writing again.',
        )
      }
    }
    return execute(args, exec).then(
      (result) => {
        this.record(sessionId, key, true)
        return result
      },
      (error) => {
        this.record(sessionId, key, false)
        throw error
      },
    )
  }

  /** Fold one outcome into the session's last-write state (re-read, so an interleaved different write is never clobbered). */
  private record(sessionId: string, key: string, ok: boolean): void {
    const last = this.lastWriteOfSession.get(sessionId)
    if (last === undefined || last.key !== key) {
      this.lastWriteOfSession.set(sessionId, { key, okStreak: ok ? 1 : 0, errStreak: ok ? 0 : 1 })
      return
    }
    if (ok) {
      last.okStreak += 1
      last.errStreak = 0
    } else {
      last.errStreak += 1
      last.okStreak = 0
    }
  }
}

/** Wrap one write tool's definition so every call passes through `guard` (schema, render, and presenters pass through untouched). The wrapper is async so guard rejections are promise rejections, matching the execute contract. */
export function guardedAgainstLoops(tool: ToolDefinition, guard: SastLoopGuard): ToolDefinition {
  return {
    ...tool,
    execute: async (args, exec) => guard.run(tool.name, tool.execute.bind(tool), args, exec),
  }
}
