/**
 * White-box audit surface plugin, browser half: the 白盒审计
 * conversation-view tab. Projection-mode surface — the live sast state
 * arrives through `useProjection('sast')` (seeded by the history tail page,
 * updated by session/projection frames), so this plugin owns no store, no
 * refresh chain, and no event listener.
 *
 * The tab is a per-session surface: the view entry registers only while the
 * CURRENT session (or a listed ancestor) carries the sast capability. Two
 * signals are accepted, because presets are neither composable nor
 * introspectable from a browser:
 *
 * - the sessions list's `agentPreset` fact, whichever wire carries it — the
 *   shipped `sast` preset and its copies named `sast-*` register before the
 *   session has run a single turn;
 * - the `sastMounted` projection value, folded host-side from that
 *   session's own log (a `sast_*` tool in the assembled request header, a
 *   logged call, or a delegated submission) — any preset name, at the price
 *   of waiting for the session's first request.
 *
 * The projection KEY is deliberately unused: the session-projection registry
 * is host-wide, so once any sast preset is mounted the `sast` and
 * `sastMounted` keys exist in EVERY session's baseline (as `null` /
 * `false`). Only the per-session value distinguishes sessions. Sessions drive
 * the entry — switching the current session (or switching the session's
 * preset in place) toggles the registration, and the view ring re-reads its
 * entries on every slots version bump.
 */
import type { ClientContext, SessionListState } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the ui-conversation SlotMap merge (the conversation.view
// entry).
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { SastView } from './SastView.tsx'
import { en, NS, zh, type SastKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** The sast view tab copy. */
    sast: SastKey
  }
}

/** The current-session id carried by the sessions list snapshot. */
type CurrentSessionId = SessionListState['current']

/** The agent-preset id whose sessions carry the sast capability. */
const SAST_PRESET = 'sast'
/** A copy of the shipped preset keeps this id prefix (the documented convention). */
const SAST_PRESET_PREFIX = `${SAST_PRESET}-`
/** Client-visible marker: this session's own log proved the row is mounted. */
const SAST_MOUNTED_KEY = 'sastMounted'

/**
 * One sessions-list row as the gate reads it, across both wires: 0.1.1 and
 * earlier carried the preset id straight on the row, while 0.1.2+ dropped
 * that field and publishes the preset as the client-visible `agentPreset`
 * session projection, retained per row in `projectionValues` (`null` when the
 * deployment composes no presets). `projectionValues` likewise carries the
 * host-folded `sastMounted` marker, absent on hosts without the projection
 * seam.
 */
interface SessionRow {
  agentPreset?: string
  projectionValues?: Readonly<Record<string, unknown>>
  parentId?: string
}

/** The agent-preset id one row carries, off whichever wire supplies it. */
function presetOf(row: SessionRow | undefined): string | undefined {
  const projected = row?.projectionValues?.agentPreset
  if (typeof projected === 'string') return projected
  return row?.agentPreset
}

/** Whether one preset id names the sast composition or a copy of it. */
function isSastPresetId(id: string | undefined): boolean {
  return id === SAST_PRESET || (id !== undefined && id.startsWith(SAST_PRESET_PREFIX))
}

/**
 * Whether one row's session holds the mount marker: its own log proved the
 * sast row is mounted, so the tab follows copied/renamed presets too. Read
 * strictly (`=== true`) — an absent key on 0.1.1-and-earlier hosts, a `false`
 * baseline for foreign sessions, and a malformed wire all mean "no evidence".
 */
function mountedOf(row: SessionRow | undefined): boolean {
  const marker = row?.projectionValues?.[SAST_MOUNTED_KEY]
  return typeof marker === 'boolean' && marker
}

/**
 * Whether a session carries the sast capability — the session itself or any
 * listed ancestor (subagents of a sast session inherit its preset; their own
 * rows may or may not carry the preset on the wire, and they prove their own
 * mount as soon as they call the delegated submission tool).
 */
function isSastSession(snapshot: SessionListState, id: string): boolean {
  let cursor: string | undefined = id
  const seen = new Set<string>()
  const byId = snapshot.byId as Readonly<Record<string, SessionRow | undefined>>
  while (cursor !== undefined && !seen.has(cursor)) {
    seen.add(cursor)
    const row: SessionRow | undefined = byId[cursor]
    if (isSastPresetId(presetOf(row)) || mountedOf(row)) return true
    cursor = row?.parentId
  }
  return false
}

/** Required services for the view registration and its copy. */
export const inject = ['slots', 'locale', 'sessions']

/**
 * Client plugin body: the 白盒审计 view tab over the sast projection,
 * mounted per-session (registered while the current session — or a listed
 * ancestor — carries the `sast` preset or proves the mount in its own log,
 * disposed as soon as it does neither).
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-sast: dictionaries')
  // Registration-time text (the view tab label) reads through the bound
  // translate as a thunk, so it follows the active locale without
  // re-registration.
  const t = ctx.locale.bind(NS)
  const sessions = ctx.sessions

  ctx.slots.inject('conversation.view', () => {
    let disposeEntry: (() => void) | undefined
    let sessionId: CurrentSessionId
    let sessionSast: boolean | undefined

    const sync = (): void => {
      const snapshot = sessions.list.getSnapshot()
      const current = snapshot.current
      const sast = current === undefined ? undefined : isSastSession(snapshot, current)
      if (current === sessionId && sast === sessionSast) return
      disposeEntry?.()
      disposeEntry = undefined
      sessionId = current
      sessionSast = sast
      if (current === undefined || sast !== true) return
      disposeEntry = ctx.slots.register({
        name: 'conversation.view',
        id: 'sast',
        order: 20,
        locale: NS,
        label: () => t('view.sast'),
      }, SastView)
    }

    sync()
    const offList = sessions.list.subscribe(sync)
    return () => {
      offList()
      disposeEntry?.()
    }
  })
}
