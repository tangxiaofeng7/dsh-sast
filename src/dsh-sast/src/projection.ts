/**
 * The standing `sast` session-projection unit: folds the logged `sast_*` tool
 * calls into the audit's current graph, so the UI reconstructs the same
 * graph from the session log alone — pure mathematics, replay-safe, no
 * storage-domain reads. Node/edge ids replicate the store's deterministic
 * `<kind>-<n>` counters, so edges resolve across the fold. Writes that would
 * violate the store's referential discipline are skipped, mirroring the
 * store's rejection (it does NOT mirror path existence checks — a pure fold
 * never touches the filesystem, so a rejected write here never diverges from
 * a rejected write there: neither happens). Malformed or foreign events
 * leave the state untouched.
 *
 * Skill/check snapshots are never windowed (docs/architecture.md §2/§4 ADR-11) — otherwise
 * the coverage denominator would drift as old checks age out.
 * @module @tangxiaofeng7/dsh-sast-host/src/projection
 */

import { z } from 'zod'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import type {
  SastAssetType,
  SastEdgeKind,
  SastFactKind,
  SastIntentCategory,
  SastIntentStatus,
  SastProvider,
  SastSeverity,
  SastSkillSourceGroup,
  SastVulnClass,
} from './spec.ts'
import type {
  SastProjection,
  SastProjectionAsset,
  SastProjectionEdge,
  SastProjectionNode,
  SastProjectionScan,
  SastProjectionSkill,
} from './types.ts'

/** How many nodes/assets/edges the standing projection retains (oldest kept); a single code-audit scan yields far more facts than a typical engagement, so the cap is set generously (architecture.md §2). */
export const NODE_CAP = 600
export const ASSET_CAP = 400
export const EDGE_CAP = 800

/** Durable-layer snippets are capped at 2000 chars (spec.ts); the projection keeps only a short preview. */
const SNIPPET_PREVIEW_LIMIT = 240

/** Wire payload schema of the `sast` projection (standing state or pre-init null). */
export const sastProjectionSchema: z.ZodType<SastProjection | null> = z.union([
  z.object({
    scan: z.object({
      id: z.string(),
      provider: z.enum(['gitlab', 'github', 'local']),
      repoUrl: z.string(),
      branch: z.string(),
      commit: z.string(),
      objective: z.string(),
      authorization: z.string(),
    }),
    skills: z.array(z.object({
      id: z.string(),
      title: z.string(),
      source: z.string(),
      sourceGroup: z.enum(['builtin', 'workspace', 'user']),
      enabled: z.boolean(),
      checks: z.array(z.object({
        id: z.string(),
        title: z.string(),
        scope: z.array(z.string()),
      })),
    })),
    nodes: z.array(z.union([
      z.object({
        id: z.string(),
        kind: z.literal('intent'),
        title: z.string(),
        detail: z.string(),
        category: z.enum(['recon', 'attack-surface', 'taint', 'config', 'dependency', 'verify', 'custom']),
        status: z.enum(['pending', 'running', 'done', 'blocked']),
        skillId: z.string().optional(),
        checkId: z.string().optional(),
      }),
      z.object({
        id: z.string(),
        kind: z.literal('fact'),
        factKind: z.enum(['source', 'sink', 'sanitizer', 'route', 'config', 'dependency', 'secret', 'pattern', 'info']),
        intentId: z.string(),
        path: z.string(),
        line: z.number(),
        detail: z.string(),
        confidence: z.number(),
        snippetPreview: z.string().optional(),
      }),
      z.object({
        id: z.string(),
        kind: z.literal('finding'),
        intentId: z.string(),
        title: z.string(),
        severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
        vulnClass: z.enum([
          'injection', 'xss', 'deserialization', 'path-traversal', 'ssrf', 'auth', 'access-control',
          'crypto', 'secret', 'config', 'dependency', 'dos', 'logic', 'other',
        ]).optional(),
        cwe: z.string().optional(),
        description: z.string(),
        codePath: z.array(z.object({
          path: z.string(),
          line: z.number(),
          symbol: z.string().optional(),
        })),
        affectedAssetId: z.string().optional(),
        skillId: z.string().optional(),
        checkId: z.string().optional(),
      }),
    ])),
    assets: z.array(z.object({
      id: z.string(),
      type: z.enum(['repo', 'module', 'file', 'entrypoint', 'package', 'datastore']),
      value: z.string(),
      meta: z.string(),
    })),
    edges: z.array(z.object({
      id: z.string(),
      kind: z.enum(['spawns', 'yields', 'derived_from', 'proves', 'flows_to', 'parent']),
      sourceId: z.string(),
      targetId: z.string(),
    })),
    counts: z.object({
      intents: z.number().int().nonnegative(),
      facts: z.number().int().nonnegative(),
      findings: z.number().int().nonnegative(),
      assets: z.number().int().nonnegative(),
    }),
  }),
  z.null(),
])

/** Per-kind per-session counters replicating the store's deterministic ids. */
export interface SastFoldCounters {
  intent: number
  fact: number
  finding: number
  asset: number
  edge: number
}

/** Fold state of the `sast` unit (the standing audit graph). */
export interface SastFoldState {
  scan: SastProjectionScan | null
  skills: SastProjectionSkill[]
  nodes: SastProjectionNode[]
  assets: SastProjectionAsset[]
  edges: SastProjectionEdge[]
  counters: SastFoldCounters
}

/** Initial state: an unstarted scan (view projects to null). */
export const sastInitialState: SastFoldState = {
  scan: null,
  skills: [],
  nodes: [],
  assets: [],
  edges: [],
  counters: { intent: 0, fact: 0, finding: 0, asset: 0, edge: 0 },
}

/** The closed enum values of the wire payloads. */
const FACT_KINDS: ReadonlySet<string> = new Set(['source', 'sink', 'sanitizer', 'route', 'config', 'dependency', 'secret', 'pattern', 'info'])
const SEVERITIES: ReadonlySet<string> = new Set(['critical', 'high', 'medium', 'low', 'info'])
const VULN_CLASSES: ReadonlySet<string> = new Set([
  'injection', 'xss', 'deserialization', 'path-traversal', 'ssrf', 'auth', 'access-control',
  'crypto', 'secret', 'config', 'dependency', 'dos', 'logic', 'other',
])
const ASSET_TYPES: ReadonlySet<string> = new Set(['repo', 'module', 'file', 'entrypoint', 'package', 'datastore'])
const INTENT_CATEGORIES: ReadonlySet<string> = new Set(['recon', 'attack-surface', 'taint', 'config', 'dependency', 'verify', 'custom'])
const INTENT_STATUSES: ReadonlySet<string> = new Set(['pending', 'running', 'done', 'blocked'])
const SKILL_SOURCE_GROUPS: ReadonlySet<string> = new Set(['builtin', 'workspace', 'user'])
const PROVIDERS: ReadonlySet<string> = new Set(['gitlab', 'github', 'local'])

/** Every model-facing tool this package registers carries this name prefix. */
export const SAST_TOOL_PREFIX = 'sast_'

/** Wire payload schema of the `sastMounted` marker (a plain boolean). */
export const sastMountedSchema: z.ZodType<boolean> = z.boolean()

/** Read one tool call's raw arguments as an object, or undefined when absent/malformed. */
function argsOf(event: SessionEvent): Record<string, unknown> | undefined {
  if (event.type !== 'tool/call' || !event.data.name.startsWith(SAST_TOOL_PREFIX)) return undefined
  try {
    const parsed: unknown = JSON.parse(event.data.arguments)
    return typeof parsed === 'object' && parsed !== null ? parsed as Record<string, unknown> : undefined
  } catch {
    return undefined
  }
}

/** Read a string argument, or '' when absent/not a string. */
function str(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function normalizeConfidence(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.min(1, Math.max(0, value > 1 ? value / 100 : value))
  if (typeof value === 'string') {
    const text = value.trim()
    const percent = text.endsWith('%')
    const parsed = Number(percent ? text.slice(0, -1) : text)
    if (Number.isFinite(parsed) && parsed >= 0) return Math.min(1, Math.max(0, percent || parsed > 1 ? parsed / 100 : parsed))
  }
  return 0.5
}

/** Retain only edges whose endpoints are still present in the capped graph. */
function retainedEdges(
  state: SastFoldState,
  nodes: readonly SastProjectionNode[],
  assets: readonly SastProjectionAsset[],
  edges: readonly SastProjectionEdge[],
): SastProjectionEdge[] {
  const ids = new Set([state.scan?.id, ...nodes.map(node => node.id), ...assets.map(asset => asset.id)])
  return edges.filter(edge => ids.has(edge.sourceId) && ids.has(edge.targetId))
}

/** Append a node and its edge, capped (oldest dropped). */
function withNode(
  state: SastFoldState,
  edgeKind: SastEdgeKind,
  sourceId: string,
  node: SastProjectionNode,
  counters: SastFoldCounters,
): SastFoldState {
  const edge: SastProjectionEdge = {
    id: `edge-${counters.edge + 1}`,
    kind: edgeKind,
    sourceId,
    targetId: node.id,
  }
  const nodes = [...state.nodes, node].slice(-NODE_CAP)
  const edges = retainedEdges(state, nodes, state.assets, [...state.edges, edge].slice(-EDGE_CAP))
  return {
    ...state,
    counters: { ...counters, edge: counters.edge + 1 },
    nodes,
    edges,
  }
}

/** Append an asset and its optional parent edge, capped (oldest dropped). */
function withAsset(
  state: SastFoldState,
  asset: SastProjectionAsset,
  parentId: string | undefined,
  counters: SastFoldCounters,
): SastFoldState {
  const assets = [...state.assets, asset].slice(-ASSET_CAP)
  if (parentId === undefined) return { ...state, counters, assets }
  const edge: SastProjectionEdge = {
    id: `edge-${counters.edge + 1}`,
    kind: 'parent',
    sourceId: parentId,
    targetId: asset.id,
  }
  return {
    ...state,
    counters: { ...counters, edge: counters.edge + 1 },
    assets,
    edges: retainedEdges(state, state.nodes, assets, [...state.edges, edge].slice(-EDGE_CAP)),
  }
}

/** The next deterministic id of one node kind (the scan is fixed as `scan-1`). */
function nextNodeId(state: SastFoldState, kind: 'intent' | 'fact' | 'finding' | 'asset'): {
  id: string
  counters: SastFoldCounters
} {
  const counters = { ...state.counters, [kind]: state.counters[kind] + 1 }
  return { id: `${kind}-${counters[kind]}`, counters }
}

/** Look up an existing folded node by id and kind. */
function findNode(state: SastFoldState, id: string, kind: 'intent' | 'fact'): SastProjectionNode | undefined {
  return state.nodes.find(node => node.id === id && node.kind === kind)
}

/** Look up an existing folded Skill snapshot by id. */
function findSkill(state: SastFoldState, id: string): SastProjectionSkill | undefined {
  return state.skills.find(skill => skill.id === id)
}

/** Read a fact/finding line number argument, defaulting to 0 (whole-file level). */
function lineOf(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.trunc(value) : 0
}

/** Parse one codePath hop argument into its projected shape, or undefined when malformed. */
function hopOf(value: unknown): { path: string; line: number; symbol?: string } | undefined {
  if (value === null || typeof value !== 'object') return undefined
  const raw = value as Record<string, unknown>
  const path = str(raw.path)
  if (path === '') return undefined
  const symbol = str(raw.symbol)
  return { path, line: lineOf(raw.line), ...(symbol === '' ? {} : { symbol }) }
}

/** Fold one `sast_register_skill` (or replay of one) call into the standing Skill snapshot list. */
function applyRegisterSkill(state: SastFoldState, args: Record<string, unknown>): SastFoldState {
  const id = str(args.id)
  const title = str(args.title)
  if (id === '' || title === '') return state
  const sourceGroup = typeof args.sourceGroup === 'string' && SKILL_SOURCE_GROUPS.has(args.sourceGroup)
    ? args.sourceGroup as SastSkillSourceGroup
    : 'workspace'
  const checks = Array.isArray(args.checks)
    ? args.checks
      .filter((check): check is Record<string, unknown> => check !== null && typeof check === 'object')
      .map(check => ({ id: str(check.id), title: str(check.title), scope: Array.isArray(check.scope) ? check.scope.filter((s): s is string => typeof s === 'string') : [] }))
      .filter(check => check.id !== '' && check.title !== '')
    : []
  const skill: SastProjectionSkill = {
    id,
    title,
    source: str(args.source),
    sourceGroup,
    enabled: args.enabled !== false,
    checks,
  }
  const existing = findSkill(state, id)
  const skills = existing === undefined ? [...state.skills, skill] : state.skills.map(s => (s.id === id ? skill : s))
  return { ...state, skills }
}

/** Fold one `sast_set_skill_enabled` call into the standing Skill snapshot list. */
function applySetSkillEnabled(state: SastFoldState, args: Record<string, unknown>): SastFoldState {
  const skillId = str(args.skillId)
  const skill = findSkill(state, skillId)
  if (skill === undefined || typeof args.enabled !== 'boolean') return state
  return { ...state, skills: state.skills.map(s => (s.id === skillId ? { ...s, enabled: args.enabled as boolean } : s)) }
}

/** Fold one `sast_update_intent` call into the standing intent node. */
function applyUpdateIntent(state: SastFoldState, args: Record<string, unknown>): SastFoldState {
  const intentId = str(args.intentId)
  const node = findNode(state, intentId, 'intent')
  if (node === undefined || node.kind !== 'intent') return state
  const status = typeof args.status === 'string' && INTENT_STATUSES.has(args.status) ? args.status as SastIntentStatus : undefined
  if (status === undefined) return state
  return { ...state, nodes: state.nodes.map(n => (n.id === intentId ? { ...n, status } : n)) }
}

/** Fold one `sast_triage` call: triage never removes a finding, only its status changes (mirrored here as a no-op on the read-only projection view, since the projection does not track triage status — see types.ts). */
function applyTriage(state: SastFoldState, _args: Record<string, unknown>): SastFoldState {
  return state
}

/** Fold one session event into the standing sast state (pure, replay-safe). */
export function applySastEvent(state: SastFoldState, event: SessionEvent): SastFoldState {
  const submission = event as unknown as { type: string; data: Record<string, unknown> }
  if (submission.type === 'sast/submit') {
    const data = submission.data
    const intentId = str(data.intentId)
    if (intentId === '') return state
    const replay = (name: string, args: Record<string, unknown>, current: SastFoldState): SastFoldState =>
      applySastEvent(current, { type: 'tool/call', data: { name, arguments: JSON.stringify(args) } } as SessionEvent)
    let next = state
    for (const fact of Array.isArray(data.facts) ? data.facts : []) {
      if (fact !== null && typeof fact === 'object') next = replay('sast_add_fact', { ...(fact as Record<string, unknown>), intentId }, next)
    }
    for (const asset of Array.isArray(data.assets) ? data.assets : []) {
      if (asset !== null && typeof asset === 'object') next = replay('sast_add_asset', asset as Record<string, unknown>, next)
    }
    for (const finding of Array.isArray(data.findings) ? data.findings : []) {
      if (finding !== null && typeof finding === 'object') next = replay('sast_add_finding', { ...(finding as Record<string, unknown>), intentId }, next)
    }
    return next
  }
  if (event.type !== 'tool/call') return state
  const args = argsOf(event)
  if (args === undefined) return state
  switch (event.data.name) {
    case 'sast_start_scan': {
      const repoUrl = str(args.repoUrl)
      const objective = str(args.objective)
      if (repoUrl === '' || objective === '') return state
      const rawProvider = str(args.provider)
      const provider: SastProvider = PROVIDERS.has(rawProvider) ? rawProvider as SastProvider : 'local'
      return {
        scan: {
          id: 'scan-1',
          provider,
          repoUrl,
          branch: str(args.branch),
          commit: '',
          objective,
          authorization: str(args.authorization),
        },
        skills: [],
        nodes: [],
        assets: [],
        edges: [],
        counters: { intent: 0, fact: 0, finding: 0, asset: 0, edge: 0 },
      }
    }
    case 'sast_register_skill':
      return applyRegisterSkill(state, args)
    case 'sast_set_skill_enabled':
      return applySetSkillEnabled(state, args)
    case 'sast_add_intent': {
      if (state.scan === null) return state
      const title = str(args.title)
      const detail = str(args.detail)
      if (title === '') return state
      const scanId = str(args.scanId)
      const derivedFromFactId = str(args.derivedFromFactId)
      const anchors = (scanId !== '' ? 1 : 0) + (derivedFromFactId !== '' ? 1 : 0)
      if (anchors !== 1) return state
      const category = typeof args.category === 'string' && INTENT_CATEGORIES.has(args.category) ? args.category as SastIntentCategory : 'custom'
      const skillId = str(args.skillId)
      const checkId = str(args.checkId)
      if ((skillId === '') !== (checkId === '')) return state
      const skillFields = skillId === '' ? {} : { skillId, checkId }
      if (scanId !== '') {
        if (scanId !== state.scan.id) return state
        const { id, counters } = nextNodeId(state, 'intent')
        const node: SastProjectionNode = { id, kind: 'intent', title, detail, category, status: 'pending', ...skillFields }
        return withNode(state, 'spawns', scanId, node, counters)
      }
      if (findNode(state, derivedFromFactId, 'fact') === undefined) return state
      const { id: derivedId, counters: derivedCounters } = nextNodeId(state, 'intent')
      const node: SastProjectionNode = { id: derivedId, kind: 'intent', title, detail, category, status: 'pending', ...skillFields }
      return withNode(state, 'derived_from', derivedFromFactId, node, derivedCounters)
    }
    case 'sast_update_intent':
      return applyUpdateIntent(state, args)
    case 'sast_add_fact': {
      const intentId = str(args.intentId)
      if (findNode(state, intentId, 'intent') === undefined) return state
      const path = str(args.path)
      const detail = str(args.detail)
      if (path === '' || detail === '') return state
      const kind = typeof args.kind === 'string' && FACT_KINDS.has(args.kind) ? args.kind as SastFactKind : 'info'
      const confidence = normalizeConfidence(args.confidence)
      const line = lineOf(args.line)
      const snippet = str(args.snippet)
      const snippetPreview = snippet === '' ? undefined : snippet.slice(0, SNIPPET_PREVIEW_LIMIT)
      const { id, counters } = nextNodeId(state, 'fact')
      const node: SastProjectionNode = {
        id,
        kind: 'fact',
        factKind: kind,
        intentId,
        path,
        line,
        detail,
        confidence,
        ...(snippetPreview === undefined ? {} : { snippetPreview }),
      }
      let next = withNode(state, 'yields', intentId, node, counters)
      const fromFactId = str(args.fromFactId)
      if (fromFactId !== '' && findNode(next, fromFactId, 'fact') !== undefined) {
        const flowCounters = { ...next.counters, edge: next.counters.edge + 1 }
        const flowEdge: SastProjectionEdge = { id: `edge-${flowCounters.edge}`, kind: 'flows_to', sourceId: fromFactId, targetId: id }
        next = { ...next, counters: flowCounters, edges: [...next.edges, flowEdge].slice(-EDGE_CAP) }
      }
      return next
    }
    case 'sast_add_finding': {
      const intentId = str(args.intentId)
      if (findNode(state, intentId, 'intent') === undefined) return state
      const title = str(args.title)
      if (title === '') return state
      const codePath = Array.isArray(args.codePath) ? args.codePath.map(hopOf).filter((hop): hop is { path: string; line: number; symbol?: string } => hop !== undefined) : []
      if (codePath.length === 0) return state
      const severity = typeof args.severity === 'string' && SEVERITIES.has(args.severity) ? args.severity as SastSeverity : 'info'
      const vulnClass = typeof args.vulnClass === 'string' && VULN_CLASSES.has(args.vulnClass) ? args.vulnClass as SastVulnClass : undefined
      const cwe = str(args.cwe)
      const affectedAssetId = str(args.affectedAssetId)
      if (affectedAssetId !== '' && !state.assets.some(asset => asset.id === affectedAssetId)) return state
      const skillId = str(args.skillId)
      const checkId = str(args.checkId)
      if ((skillId === '') !== (checkId === '')) return state
      const { id, counters } = nextNodeId(state, 'finding')
      // The wire payload travels through Remote events, which require lossless
      // JSON: an own `affectedAssetId: undefined` key makes the host refuse to
      // forward the session summary, so the session can no longer be resumed.
      // Omit every optional key when absent — the same discipline the store's
      // snapshot already follows.
      const node: SastProjectionNode = {
        id,
        kind: 'finding',
        intentId,
        title,
        severity,
        ...(vulnClass === undefined ? {} : { vulnClass }),
        ...(cwe === '' ? {} : { cwe }),
        description: str(args.description),
        codePath,
        ...(affectedAssetId === '' ? {} : { affectedAssetId }),
        ...(skillId === '' ? {} : { skillId, checkId }),
      }
      return withNode(state, 'proves', intentId, node, counters)
    }
    case 'sast_add_asset': {
      const type = typeof args.type === 'string' && ASSET_TYPES.has(args.type) ? args.type as SastAssetType : undefined
      if (type === undefined) return state
      const value = str(args.value)
      if (value === '') return state
      const parentId = str(args.parentId)
      if (parentId !== '' && !state.assets.some(asset => asset.id === parentId)) return state
      const { id, counters } = nextNodeId(state, 'asset')
      const asset: SastProjectionAsset = { id, type, value, meta: str(args.meta) }
      return withAsset(state, asset, parentId === '' ? undefined : parentId, counters)
    }
    case 'sast_triage':
      return applyTriage(state, args)
    default:
      return state
  }
}

/**
 * Whether one logged event proves the session's composition mounts this
 * package. A fold cannot see a composition — a preset is mounted host-side
 * and never appears in the log — but it can see that the session actually
 * holds the capability: the loop's assembled request header carries
 * `sast_*` tool schemas, the session called one of those tools, or a
 * delegated submission folded in. Any of the three is durable, per-session,
 * and impossible without the row mounted, so it survives preset renames and
 * copied presets.
 */
function provesSastMounted(event: SessionEvent): boolean {
  const loose = event as unknown as {
    type: string
    data?: { name?: unknown; header?: { tools?: unknown } }
  }
  if (loose.type === 'sast/submit') return true
  if (loose.type === 'tool/call') return typeof loose.data?.name === 'string' && loose.data.name.startsWith(SAST_TOOL_PREFIX)
  if (loose.type !== 'request/header') return false
  const tools = loose.data?.header?.tools
  return Array.isArray(tools) && tools.some(schema => {
    const name = (schema as { name?: unknown } | null)?.name
    return typeof name === 'string' && name.startsWith(SAST_TOOL_PREFIX)
  })
}

/**
 * Fold one session event into the mount marker. Sticky-true: the log is
 * append-only evidence, so a session that once proved the capability keeps
 * the marker — and with it the Web tabs that reach its recorded audit.
 * @param mounted - the marker state covering all prior events.
 * @param event - the next committed session event.
 * @returns the next marker state (the same reference when unchanged).
 */
export function applySastMounted(mounted: boolean, event: SessionEvent): boolean {
  if (mounted) return mounted
  return provesSastMounted(event)
}

/** Project the fold state onto the wire payload (null before the first scan). */
export function viewSastState(state: SastFoldState): SastProjection | null {
  if (state.scan === null) return null
  return {
    scan: state.scan,
    skills: state.skills,
    nodes: state.nodes,
    assets: state.assets,
    edges: state.edges,
    counts: {
      intents: state.nodes.filter(node => node.kind === 'intent').length,
      facts: state.nodes.filter(node => node.kind === 'fact').length,
      findings: state.nodes.filter(node => node.kind === 'finding').length,
      assets: state.assets.length,
    },
  }
}
