/**
 * In-memory-forwarding, durably-backed store for the white-box audit graph.
 *
 * Reads are synchronous from the authoritative in-memory state (as served by
 * the storage-domain facility); writes are queued per-session, persisted to
 * the routed backend first, then applied to memory and emitted via
 * `domain/changed`. The domain is opened lazily on first use and closed on
 * plugin dispose.
 *
 * The store owns the audit discipline: one scan per session (a new scan
 * resets the whole graph and every registered Skill snapshot), every
 * node/edge write validates its references against the same session, every
 * `fact`/`finding.codePath`/file-or-module `asset` write is hardened against
 * the scan workspace (ADR-03, via `paths.ts`), and node/edge ids are
 * deterministic (`<kind>-<n>`, per-session counters) so the session
 * projection can replicate the graph purely from the logged tool calls.
 * @module @tangxiaofeng7/dsh-sast-host/src/store
 */

import type { Context } from '@deepseek-ai/cordis'
import type { Domain } from '@deepseek-ai/dsh-storage-domain'
import { type CoverageView, coverageOf } from './coverage.ts'
import { clampLine, normalizeRepoPath, requireExistingFile } from './paths.ts'
import { ReportArtifactStore } from './report/artifact-store.ts'
import {
  sastDomainSpec,
  type SastAsset,
  type SastAssetType,
  type SastEdge,
  type SastEdgeKind,
  type SastFact,
  type SastFactKind,
  type SastFinding,
  type SastFindingStatus,
  type SastIntent,
  type SastIntentCategory,
  type SastIntentStatus,
  type SastProvider,
  type SastReportArtifact,
  type SastScan,
  type SastSeverity,
  type SastSkill,
  type SastSkillCheck,
  type SastSkillSourceGroup,
  type SastVulnClass,
} from './spec.ts'

/** Deterministic id namespace per node/edge kind (ids read `<kind>-<n>`). Skills use a stable DSH name, not a counter. */
type IdKind = 'scan' | 'intent' | 'fact' | 'finding' | 'asset' | 'edge'

/** The record table owning each id kind. */
const TABLE_OF_ID_KIND = {
  scan: 'scans',
  intent: 'intents',
  fact: 'facts',
  finding: 'findings',
  asset: 'assets',
  edge: 'edges',
} as const satisfies Record<IdKind, string>

/** Tables whose ids participate in the per-session `<kind>-<n>` sequence. */
const SEQUENCED_TABLES = ['intents', 'facts', 'findings', 'assets', 'edges'] as const

/** Every table cleared on scan reset: the graph plus the Skill snapshot list. */
const CLEARED_ON_RESET_TABLES = ['skills', ...SEQUENCED_TABLES] as const

/** Every Skill may declare at most this many checks (mirrors `spec.ts`'s zod `.max(256)`, enforced again here for defense in depth). */
const MAX_CHECKS_PER_SKILL = 256
/** A session may register at most this many Skills. */
const MAX_SKILLS_PER_SESSION = 64
/** A session's Skills may declare at most this many checks in total. */
const MAX_CHECKS_PER_SESSION = 2048

/** Physical key for a session-local graph node, edge, or Skill snapshot. */
function recordKey(sessionId: string, id: string): string {
  return `${sessionId}:${id}`
}

/** Copy and freeze one record before it crosses the service boundary. */
function snapshot<T extends object>(value: T): T {
  return Object.freeze({ ...value })
}

/** Options for creating (or resetting) one session's scan. */
export interface ScanInput {
  readonly provider: SastProvider
  /** Already redacted (ADR-07); the store does not strip credentials itself. */
  readonly repoUrl: string
  readonly branch: string
  readonly commit: string
  readonly workspacePath: string
  readonly objective: string
  readonly scope: readonly string[]
  readonly authorization: string
  readonly languages: readonly string[]
  readonly fileCount: number
  readonly batchId?: string
  readonly jobId?: string
}

/** Options for registering (or idempotently retrying) one Skill snapshot. */
export interface SkillRegistrationInput {
  readonly id: string
  readonly title: string
  readonly source: string
  readonly sourceGroup: SastSkillSourceGroup
  readonly provider: string
  readonly category: SastIntentCategory
  readonly applicability: { readonly languages: readonly string[]; readonly frameworks: readonly string[]; readonly paths: readonly string[] }
  readonly checks: readonly SastSkillCheck[]
  readonly enabled: boolean
  readonly manifestDigest: string
}

/** Options for recording one audit intent (exactly one anchor required). */
export interface IntentInput {
  readonly title: string
  readonly detail: string
  readonly category: SastIntentCategory
  readonly scope: readonly string[]
  /** Driving methodology check (ADR-14); must be provided together with `checkId` or omitted entirely. */
  readonly skillId?: string
  readonly checkId?: string
  /** Anchor one: `spawns` edge from the scan. */
  readonly scanId?: string
  /** Anchor two: `derived_from` edge from a fact. */
  readonly derivedFromFactId?: string
}

/** Options for updating one intent's lifecycle status. */
export interface IntentUpdateInput {
  readonly status: SastIntentStatus
  readonly note?: string
  readonly delegatedSessionId?: string
}

/** One hop input for a finding's code evidence chain, before path hardening. */
export interface CodePathHopInput {
  readonly path: string
  readonly line?: number
  readonly symbol?: string
  readonly note?: string
}

/** Options for recording one fact yielded by an intent. */
export interface FactInput {
  readonly intentId: string
  readonly kind: SastFactKind
  readonly path: string
  readonly line?: number
  readonly endLine?: number
  readonly symbol?: string
  readonly detail: string
  readonly snippet?: string
  readonly confidence: number
  /** Upstream fact id; when given, an additional `flows_to` edge records taint propagation (ADR-05). */
  readonly fromFactId?: string
}

/** Options for recording one vulnerability finding proved by an intent. */
export interface FindingInput {
  readonly intentId: string
  readonly title: string
  readonly severity: SastSeverity
  readonly codePath: readonly CodePathHopInput[]
  readonly vulnClass?: SastVulnClass
  readonly cwe?: string
  readonly confidence: number
  readonly description?: string
  readonly remediation?: string
  readonly poc?: string
  readonly affectedAssetId?: string
  /** Must match the proving intent's own skillId/checkId when provided (ADR-14); omitted for incidental findings. */
  readonly skillId?: string
  readonly checkId?: string
}

/** Options for recording one code asset (optionally parented to another asset). */
export interface AssetInput {
  readonly type: SastAssetType
  readonly value: string
  readonly parentId?: string
  readonly meta: string
}

/** The model-visible state of one session's audit. */
export interface SastStateView {
  readonly initialized: boolean
  readonly scan?: SastScan
  readonly skills: SastSkill[]
  readonly intents: SastIntent[]
  readonly facts: SastFact[]
  readonly findings: SastFinding[]
  readonly assets: SastAsset[]
  readonly edges: SastEdge[]
  readonly counts: { skills: number; intents: number; facts: number; findings: number; assets: number }
}

/** One newly minted node and its optional connecting edge. */
export interface NodeWrite {
  readonly nodeId: string
  /** The edge linking the anchor to the new node; absent for root assets. */
  readonly edge?: { readonly id: string; readonly kind: SastEdgeKind; readonly sourceId: string; readonly targetId: string }
}

/** A fact write, plus the resolved line/lineAdjusted and the optional `flows_to` edge recording taint propagation from an upstream fact. */
export interface FactWrite extends NodeWrite {
  readonly line: number
  readonly lineAdjusted: boolean
  readonly flowEdge?: { readonly id: string; readonly sourceId: string; readonly targetId: string }
}

/**
 * Owning handle for the lazily opened sast domain. Not a Cordis service: it
 * is a private helper owned by the plugin `apply` fiber and disposed with it.
 *
 * `domain` is an optional shared opener — the sast domain can be opened only
 * ONCE per `DomainFacility` (`already-open` otherwise), so when a
 * `BatchStore` shares the same context (M5), `index.ts` opens the domain a
 * single time and hands both stores the same `() => Promise<Domain>`
 * accessor. Omitted (single-repo-only composition, or every existing test),
 * this store opens the domain itself exactly as before.
 */
export class SastStore {
  private domainPromise: Promise<Domain<typeof sastDomainSpec>> | undefined
  private readonly sessionQueues = new Map<string, Promise<void>>()
  /** Per-session max id sequence per kind, mirroring the durable tables. */
  private readonly sessionCounters = new Map<string, Map<IdKind, number>>()
  /** Shared `report_artifacts` allocator/writer — shared with `BatchStore` once M5 composes both against the same domain (two independent counters over the same table could collide). Defaults to a private instance when the composing plugin supplies none (single-repo-only composition, or every existing test). */
  private readonly artifacts: ReportArtifactStore

  /**
   * @param ctx - carries `storageDomain` when no shared `domain` opener is supplied; may be omitted when `sharedDomain` is given (e.g. `batch/orchestrator.ts`'s worker-outcome readers, which never open their own domain).
   * @param now - injected clock (ADR-10): timestamps are never trusted from model input, only from here.
   * @param sharedDomain - optional shared opener (see class doc); defaults to opening the domain itself via `ctx`.
   * @param artifacts - optional shared `report_artifacts` store (see field doc); defaults to a private instance over this store's own `domain()`.
   */
  constructor(
    private readonly ctx: Context | undefined,
    private readonly now: () => number = () => Date.now(),
    private readonly sharedDomain?: () => Promise<Domain<typeof sastDomainSpec>>,
    artifacts?: ReportArtifactStore,
  ) {
    this.artifacts = artifacts ?? new ReportArtifactStore(() => this.domain(), now)
  }

  /** Resolve the opened domain, opening it lazily on first use (or delegating to the shared opener, see class doc). */
  private domain(): Promise<Domain<typeof sastDomainSpec>> {
    if (this.sharedDomain !== undefined) return this.sharedDomain()
    if (this.ctx === undefined) throw new Error('sast: SastStore constructed without ctx and without sharedDomain — cannot open the domain')
    if (this.domainPromise === undefined) {
      this.domainPromise = this.ctx.storageDomain.open(sastDomainSpec)
    }
    return this.domainPromise
  }

  /**
   * The shared-opener form of {@link domain}, for another plugin composed
   * alongside this one to reuse this exact open domain (`DomainFacility.open`
   * rejects a second open of the same name) — e.g. the `sast-batch` plugin's
   * `BatchStore`/outcome-reading `SastStore`, provided this instance via
   * `ctx.provide('sastStore', store)` in `index.ts`.
   */
  openedDomain(): Promise<Domain<typeof sastDomainSpec>> {
    return this.domain()
  }

  /** The shared `report_artifacts` allocator this instance is using (own or injected) — for `sast-batch`'s `BatchStore` to pass into its own constructor, so `report_artifacts` id allocation is never split across two independent in-memory counters over the same domain table. See {@link openedDomain}'s doc. */
  artifactStore(): ReportArtifactStore {
    return this.artifacts
  }

  /** Close the domain and release its backend unit (idempotent). A no-op on the domain itself when `sharedDomain` was supplied — the opener's owner closes it exactly once. */
  async dispose(): Promise<void> {
    // Drain queued writes before closing the domain. Keep domainPromise intact
    // while draining so an in-flight operation cannot reopen a second domain.
    await Promise.all([...this.sessionQueues.values()])
    if (this.sharedDomain === undefined) {
      const pending = this.domainPromise
      if (pending !== undefined) {
        this.domainPromise = undefined
        await (await pending).close()
      }
    }
    this.sessionQueues.clear()
    this.sessionCounters.clear()
  }

  /** Serialize read/allocate/write transactions for one session. */
  private enqueue<T>(sessionId: string, operation: () => Promise<T>): Promise<T> {
    const previous = this.sessionQueues.get(sessionId) ?? Promise.resolve()
    const current = previous.then(operation)
    const settled = current.then(() => undefined, () => undefined)
    this.sessionQueues.set(sessionId, settled)
    return current
  }

  /** Read one session's scan row, if present. */
  async getScan(sessionId: string): Promise<SastScan | undefined> {
    return (await this.domain()).table('scans').get(sessionId)
  }

  /** Read the scan row, failing with a guiding error when absent. */
  private async requireScan(sessionId: string): Promise<SastScan> {
    const scan = await this.getScan(sessionId)
    if (scan === undefined) {
      throw new Error('sast: scan is not initialized; call sast_start_scan with repoUrl and objective first')
    }
    return scan
  }

  /**
   * The next deterministic id for one kind in one session. Allocation is O(1)
   * from the in-memory max-sequence cache (the store is the domain's single
   * writer, and every allocation runs inside the session's serialized queue);
   * the cache is (re)built from the durable tables on first touch of a
   * session and dropped wholesale when the session's scan resets.
   */
  private async nextId(kind: IdKind, sessionId: string): Promise<string> {
    let counters = this.sessionCounters.get(sessionId)
    if (counters === undefined) {
      counters = new Map()
      for (const name of SEQUENCED_TABLES) {
        const table = (await this.domain()).table(name)
        for (const [, row] of table.entries()) {
          const record = row as { sessionId: string; id: string }
          if (record.sessionId !== sessionId) continue
          const [kindOfId, seq] = /^([a-z]+)-(\d+)$/.exec(record.id)?.slice(1) ?? []
          if (kindOfId === undefined || seq === undefined) continue
          if (kindOfId === 'intent' || kindOfId === 'fact' || kindOfId === 'finding' || kindOfId === 'asset' || kindOfId === 'edge') {
            counters.set(kindOfId, Math.max(counters.get(kindOfId) ?? 0, Number(seq)))
          }
        }
      }
      this.sessionCounters.set(sessionId, counters)
    }
    const next = (counters.get(kind) ?? 0) + 1
    counters.set(kind, next)
    return `${kind}-${next}`
  }

  /** Delete every audit-graph and Skill-snapshot row of one session (scan reset). */
  private async clearSession(sessionId: string): Promise<void> {
    const domain = await this.domain()
    for (const name of CLEARED_ON_RESET_TABLES) {
      const table = domain.table(name)
      for (const [key, row] of table.entries()) {
        if ((row as { sessionId: string }).sessionId === sessionId) await table.delete(key)
      }
    }
  }

  /**
   * Create or reset the scan. A new scan clears the whole audit graph and
   * every registered Skill snapshot of the session, and restarts fresh
   * counters. The caller (ingest, M2) must only reach this after a successful
   * clone/local-path validation — a failed clone must never call this, so the
   * old scan (if any) stays intact.
   */
  async initScan(sessionId: string, input: ScanInput): Promise<SastScan> {
    return this.enqueue(sessionId, async () => {
      const scan = snapshot<SastScan>({
        id: 'scan-1',
        sessionId,
        provider: input.provider,
        repoUrl: input.repoUrl,
        branch: input.branch,
        commit: input.commit,
        workspacePath: input.workspacePath,
        objective: input.objective,
        scope: [...input.scope],
        authorization: input.authorization,
        languages: [...input.languages],
        fileCount: input.fileCount,
        ...(input.batchId !== undefined ? { batchId: input.batchId } : {}),
        ...(input.jobId !== undefined ? { jobId: input.jobId } : {}),
      })
      await (await this.domain()).table('scans').put(sessionId, scan)
      await this.clearSession(sessionId)
      // A fresh scan restarts every per-session counter.
      this.sessionCounters.delete(sessionId)
      return scan
    })
  }

  /** Validate a reference row (same session, expected table) or fail loud. */
  private async requireRef(
    sessionId: string,
    tableName: 'intents' | 'facts' | 'findings' | 'assets',
    refId: string,
    label: string,
  ): Promise<void> {
    const row = (await this.domain()).table(tableName).get(recordKey(sessionId, refId))
    if (row === undefined) {
      throw new Error(`sast: unknown ${label} ${refId}`)
    }
    /* v8 ignore next -- session-scoped keys are normalized at write time and the domain has one writer. */
    if (row.sessionId !== sessionId) {
      throw new Error(`sast: ${label} ${refId} belongs to another session`)
    }
  }

  /** Validate an intent reference and return the row (callers need its skillId/checkId). */
  private async requireIntentRef(sessionId: string, intentId: string): Promise<SastIntent> {
    const row = (await this.domain()).table('intents').get(recordKey(sessionId, intentId))
    if (row === undefined || row.sessionId !== sessionId) {
      throw new Error(`sast: unknown intent ${intentId}`)
    }
    return row
  }

  /** Validate that a Skill/check reference is registered, enabled, and not already claimed by another intent. */
  private async requireEnabledSkillCheck(sessionId: string, skillId: string, checkId: string): Promise<SastSkill> {
    const domain = await this.domain()
    const skill = domain.table('skills').get(recordKey(sessionId, skillId))
    if (skill === undefined || skill.sessionId !== sessionId) {
      throw new Error(`sast: unknown skill ${skillId}`)
    }
    if (!skill.enabled) {
      throw new Error(`sast: skill ${skillId} is disabled`)
    }
    if (!skill.checks.some(check => check.id === checkId)) {
      throw new Error(`sast: unknown check ${checkId} in skill ${skillId}`)
    }
    const occupied = [...domain.table('intents').entries()]
      .some(([, row]) => row.sessionId === sessionId && row.skillId === skillId && row.checkId === checkId)
    if (occupied) {
      throw new Error(`sast: check ${checkId} of skill ${skillId} already has an intent`)
    }
    return skill
  }

  /** Register (or idempotently retry, or digest-replace) one Skill's minimal per-scan snapshot. */
  async registerSkill(sessionId: string, input: SkillRegistrationInput): Promise<SastSkill> {
    if (input.checks.length === 0 || input.checks.length > MAX_CHECKS_PER_SKILL) {
      throw new Error(`sast: skill ${input.id} must declare between 1 and ${MAX_CHECKS_PER_SKILL} checks`)
    }
    const checkIds = new Set<string>()
    for (const check of input.checks) {
      if (checkIds.has(check.id)) {
        throw new Error(`sast: duplicate check id ${check.id} in skill ${input.id}`)
      }
      checkIds.add(check.id)
    }
    return this.enqueue(sessionId, async () => {
      await this.requireScan(sessionId)
      const domain = await this.domain()
      const key = recordKey(sessionId, input.id)
      const existing = domain.table('skills').get(key)
      if (existing !== undefined && existing.manifestDigest === input.manifestDigest) {
        // Same name + same digest retry is idempotent: return the existing
        // snapshot unchanged, including its current enabled state (toggling
        // enablement is `sast_set_skill_enabled`'s job, not registration's).
        return existing
      }
      if (existing !== undefined) {
        const referenced = [...domain.table('intents').entries()]
          .some(([, row]) => row.sessionId === sessionId && row.skillId === input.id)
        if (referenced) {
          throw new Error(
            `sast: skill ${input.id} has a different manifest digest and is already referenced by an intent; use a new skill name or start a new scan`,
          )
        }
      } else {
        const otherSkills = [...domain.table('skills').entries()].map(([, row]) => row).filter(row => row.sessionId === sessionId)
        if (otherSkills.length >= MAX_SKILLS_PER_SESSION) {
          throw new Error(`sast: session already has ${MAX_SKILLS_PER_SESSION} registered skills`)
        }
        const totalChecks = otherSkills.reduce((sum, row) => sum + row.checks.length, 0) + input.checks.length
        if (totalChecks > MAX_CHECKS_PER_SESSION) {
          throw new Error(`sast: session would exceed ${MAX_CHECKS_PER_SESSION} total checks across all registered skills`)
        }
      }
      const skill = snapshot<SastSkill>({
        id: input.id,
        sessionId,
        title: input.title,
        source: input.source,
        sourceGroup: input.sourceGroup,
        provider: input.provider,
        category: input.category,
        applicability: { languages: [...input.applicability.languages], frameworks: [...input.applicability.frameworks], paths: [...input.applicability.paths] },
        checks: input.checks.map(check => ({ ...check, scope: [...check.scope] })),
        enabled: input.enabled,
        manifestDigest: input.manifestDigest,
      })
      await domain.table('skills').put(key, skill)
      return skill
    })
  }

  /** Enable or disable a registered Skill; existing intents/findings/snapshots are untouched. */
  async setSkillEnabled(sessionId: string, skillId: string, enabled: boolean): Promise<SastSkill> {
    return this.enqueue(sessionId, async () => {
      await this.requireScan(sessionId)
      const domain = await this.domain()
      const key = recordKey(sessionId, skillId)
      const existing = domain.table('skills').get(key)
      if (existing === undefined || existing.sessionId !== sessionId) {
        throw new Error(`sast: unknown skill ${skillId}`)
      }
      const updated = snapshot<SastSkill>({ ...existing, enabled })
      await domain.table('skills').put(key, updated)
      return updated
    })
  }

  /** Mint one node (and its connecting edge) in one write. */
  private async addNode(
    sessionId: string,
    edgeKind: SastEdgeKind | undefined,
    sourceId: string,
    nodeKind: 'intent' | 'fact' | 'finding' | 'asset',
    node: Omit<SastIntent | SastFact | SastFinding | SastAsset, 'id' | 'sessionId'>,
  ): Promise<NodeWrite> {
    const domain = await this.domain()
    const nodeId = await this.nextId(nodeKind, sessionId)
    const record = snapshot({ id: nodeId, sessionId, ...node }) as SastIntent | SastFact | SastFinding | SastAsset
    await domain.table(TABLE_OF_ID_KIND[nodeKind]).put(recordKey(sessionId, nodeId), record)
    if (edgeKind === undefined) return { nodeId }
    const edgeId = await this.nextId('edge', sessionId)
    const edge = snapshot<SastEdge>({ id: edgeId, sessionId, kind: edgeKind, sourceId, targetId: nodeId })
    try {
      await domain.table('edges').put(recordKey(sessionId, edgeId), edge)
    } catch (error) {
      await domain.table(TABLE_OF_ID_KIND[nodeKind]).delete(recordKey(sessionId, nodeId))
      throw error
    }
    return { nodeId, edge: { id: edgeId, kind: edgeKind, sourceId, targetId: nodeId } }
  }

  /** Record one intent spawned by the scan or derived from a fact. */
  async addIntent(sessionId: string, input: IntentInput): Promise<NodeWrite> {
    const anchors = (input.scanId !== undefined ? 1 : 0) + (input.derivedFromFactId !== undefined ? 1 : 0)
    if (anchors !== 1) {
      throw new Error('sast_add_intent requires exactly one anchor: scanId (spawns) or derivedFromFactId (derived_from)')
    }
    if ((input.skillId === undefined) !== (input.checkId === undefined)) {
      throw new Error('sast_add_intent requires skillId and checkId together or neither')
    }
    return this.enqueue(sessionId, async () => {
      const scan = await this.requireScan(sessionId)
      if (input.skillId !== undefined && input.checkId !== undefined) {
        await this.requireEnabledSkillCheck(sessionId, input.skillId, input.checkId)
      }
      const node = {
        title: input.title,
        detail: input.detail,
        category: input.category,
        scope: [...input.scope],
        status: 'pending' as const,
        note: '',
        ...(input.skillId !== undefined ? { skillId: input.skillId, checkId: input.checkId! } : {}),
        createdAt: this.now(),
      }
      if (input.scanId !== undefined) {
        if (input.scanId !== scan.id) throw new Error(`sast: unknown scan ${input.scanId}`)
        return this.addNode(sessionId, 'spawns', input.scanId, 'intent', node)
      }
      const derivedFromFactId = input.derivedFromFactId!
      await this.requireRef(sessionId, 'facts', derivedFromFactId, 'fact')
      return this.addNode(sessionId, 'derived_from', derivedFromFactId, 'intent', node)
    })
  }

  /** Update one intent's lifecycle status; `done -> pending` is rejected (monotonic, ADR-10). */
  async updateIntent(sessionId: string, intentId: string, input: IntentUpdateInput): Promise<SastIntent> {
    return this.enqueue(sessionId, async () => {
      await this.requireScan(sessionId)
      const domain = await this.domain()
      const key = recordKey(sessionId, intentId)
      const existing = domain.table('intents').get(key)
      if (existing === undefined || existing.sessionId !== sessionId) {
        throw new Error(`sast: unknown intent ${intentId}`)
      }
      if (existing.status === 'done' && input.status === 'pending') {
        throw new Error('sast: intent status cannot move from done back to pending')
      }
      const now = this.now()
      const enteringProgress = input.status === 'running' || input.status === 'done' || input.status === 'blocked'
      const enteringTerminal = input.status === 'done' || input.status === 'blocked'
      const startedAt = existing.startedAt ?? (enteringProgress ? now : undefined)
      const endedAt = existing.endedAt ?? (enteringTerminal ? now : undefined)
      const updated = snapshot<SastIntent>({
        ...existing,
        status: input.status,
        note: input.note ?? existing.note,
        ...(input.delegatedSessionId !== undefined ? { delegatedSessionId: input.delegatedSessionId } : {}),
        ...(startedAt !== undefined ? { startedAt } : {}),
        ...(endedAt !== undefined ? { endedAt } : {}),
      })
      await domain.table('intents').put(key, updated)
      return updated
    })
  }

  /** Record one fact yielded by an intent, hardening `path` against the scan workspace (ADR-03). */
  async addFact(sessionId: string, input: FactInput): Promise<FactWrite> {
    return this.enqueue(sessionId, async () => {
      const scan = await this.requireScan(sessionId)
      await this.requireRef(sessionId, 'intents', input.intentId, 'intent')
      if (input.fromFactId !== undefined) await this.requireRef(sessionId, 'facts', input.fromFactId, 'fact')
      const normalized = normalizeRepoPath(input.path)
      requireExistingFile(scan.workspacePath, normalized, 'file')
      const { line, lineAdjusted } = clampLine(scan.workspacePath, normalized, input.line ?? 0)
      const write = await this.addNode(sessionId, 'yields', input.intentId, 'fact', {
        intentId: input.intentId,
        kind: input.kind,
        path: normalized,
        line,
        ...(input.endLine !== undefined ? { endLine: input.endLine } : {}),
        lineAdjusted,
        ...(input.symbol !== undefined ? { symbol: input.symbol } : {}),
        detail: input.detail,
        ...(input.snippet !== undefined ? { snippet: input.snippet } : {}),
        confidence: input.confidence,
        source: 'llm',
        engineRule: '',
        at: this.now(),
      })
      if (input.fromFactId === undefined) return { ...write, line, lineAdjusted }
      const domain = await this.domain()
      try {
        const flowEdgeId = await this.nextId('edge', sessionId)
        const flowEdge = snapshot<SastEdge>({ id: flowEdgeId, sessionId, kind: 'flows_to', sourceId: input.fromFactId, targetId: write.nodeId })
        await domain.table('edges').put(recordKey(sessionId, flowEdgeId), flowEdge)
        return { ...write, line, lineAdjusted, flowEdge: { id: flowEdgeId, sourceId: input.fromFactId, targetId: write.nodeId } }
      } catch (error) {
        // The fact must not outlive its failed flows_to edge, so roll both
        // the fact node and its yields edge back before re-throwing.
        if (write.edge !== undefined) await domain.table('edges').delete(recordKey(sessionId, write.edge.id))
        await domain.table('facts').delete(recordKey(sessionId, write.nodeId))
        throw error
      }
    })
  }

  /** Harden one code-path hop against the scan workspace, rewrapping any failure with its index (ADR-03). */
  private hardenHop(workspacePath: string, hop: CodePathHopInput, describeFailure: (raw: string) => string) {
    try {
      const normalized = normalizeRepoPath(hop.path)
      requireExistingFile(workspacePath, normalized, 'file')
      const { line, lineAdjusted } = clampLine(workspacePath, normalized, hop.line ?? 0)
      return {
        path: normalized,
        line,
        ...(lineAdjusted ? { lineAdjusted } : {}),
        ...(hop.symbol !== undefined ? { symbol: hop.symbol } : {}),
        ...(hop.note !== undefined ? { note: hop.note } : {}),
      }
    } catch {
      throw new Error(describeFailure(hop.path))
    }
  }

  /** Validate the skillId/checkId pairing and cross-reference rule shared by `addFinding` and `addSubmission`. */
  private checkFindingSkillRef(input: { readonly skillId?: string; readonly checkId?: string }, intent: SastIntent): void {
    if ((input.skillId === undefined) !== (input.checkId === undefined)) {
      throw new Error('sast_add_finding requires skillId and checkId together or neither')
    }
    if (input.skillId !== undefined && (input.skillId !== intent.skillId || input.checkId !== intent.checkId)) {
      throw new Error("sast: finding skillId/checkId must match the proving intent's own skillId/checkId")
    }
  }

  /** Record one finding proved by an intent, with a hardened code evidence chain (ADR-03). */
  async addFinding(sessionId: string, input: FindingInput): Promise<NodeWrite> {
    if (input.codePath.length === 0) {
      throw new Error('sast_add_finding requires at least one code location')
    }
    return this.enqueue(sessionId, async () => {
      const scan = await this.requireScan(sessionId)
      const intent = await this.requireIntentRef(sessionId, input.intentId)
      if (input.affectedAssetId !== undefined) await this.requireRef(sessionId, 'assets', input.affectedAssetId, 'asset')
      this.checkFindingSkillRef(input, intent)
      const codePath = input.codePath.map((hop, index) => this.hardenHop(
        scan.workspacePath,
        hop,
        raw => `sast: codePath[${index}].path ${raw} does not exist in the scan workspace; only cite files you actually read`,
      ))
      return this.addNode(sessionId, 'proves', input.intentId, 'finding', {
        intentId: input.intentId,
        title: input.title,
        severity: input.severity,
        ...(input.vulnClass !== undefined ? { vulnClass: input.vulnClass } : {}),
        ...(input.cwe !== undefined ? { cwe: input.cwe } : {}),
        confidence: input.confidence,
        description: input.description ?? '',
        codePath,
        remediation: input.remediation ?? '',
        poc: input.poc ?? '',
        status: 'open',
        triageReason: '',
        ...(input.skillId !== undefined ? { skillId: input.skillId, checkId: input.checkId! } : {}),
        ...(input.affectedAssetId !== undefined ? { affectedAssetId: input.affectedAssetId } : {}),
        at: this.now(),
      })
    })
  }

  /** Record one asset; `file`/`module` values are path-hardened (ADR-03), other types are opaque. */
  async addAsset(sessionId: string, input: AssetInput): Promise<NodeWrite> {
    // An empty-string parentId means "root asset" (the model often sends the
    // field with '' instead of omitting it); only a non-empty id is a real
    // parent reference.
    const parentId = input.parentId === '' ? undefined : input.parentId
    return this.enqueue(sessionId, async () => {
      const scan = await this.requireScan(sessionId)
      if (parentId !== undefined) await this.requireRef(sessionId, 'assets', parentId, 'asset')
      let value = input.value
      if (input.type === 'file' || input.type === 'module') {
        value = normalizeRepoPath(input.value)
        requireExistingFile(scan.workspacePath, value, input.type)
      }
      return this.addNode(sessionId, parentId === undefined ? undefined : 'parent', parentId ?? '', 'asset', {
        type: input.type,
        value,
        meta: input.meta,
        at: this.now(),
      })
    })
  }

  /** Triage one finding; only `status`/`triageReason`/`triagedAt` change, the finding is never deleted. */
  async triage(sessionId: string, findingId: string, status: SastFindingStatus, reason: string): Promise<SastFinding> {
    return this.enqueue(sessionId, async () => {
      await this.requireScan(sessionId)
      const domain = await this.domain()
      const key = recordKey(sessionId, findingId)
      const existing = domain.table('findings').get(key)
      if (existing === undefined || existing.sessionId !== sessionId) {
        throw new Error(`sast: unknown finding ${findingId}`)
      }
      const updated = snapshot<SastFinding>({ ...existing, status, triageReason: reason, triagedAt: this.now() })
      await domain.table('findings').put(key, updated)
      return updated
    })
  }

  /**
   * Persist one delegated submission as an all-or-nothing session write.
   * Every reference (`fromFactId`/`parentId`/`affectedAssetId`/skillId+checkId
   * pairing) is validated up front; path hardening happens per item during
   * the write pass so a bad path can be reported with its exact index, but a
   * failure at any point rolls back every row this call has written so far —
   * the batch is genuinely all-or-nothing, matching `sast_submit`'s contract.
   */
  async addSubmission(
    sessionId: string,
    intentId: string,
    facts: readonly FactInput[],
    assets: readonly AssetInput[],
    findings: readonly FindingInput[],
  ): Promise<{ facts: number; assets: number; findings: number }> {
    return this.enqueue(sessionId, async () => {
      const scan = await this.requireScan(sessionId)
      const intent = await this.requireIntentRef(sessionId, intentId)

      for (const fact of facts) {
        if (fact.fromFactId !== undefined) await this.requireRef(sessionId, 'facts', fact.fromFactId, 'fact')
      }
      for (const asset of assets) {
        const parentId = asset.parentId === '' ? undefined : asset.parentId
        if (parentId !== undefined) await this.requireRef(sessionId, 'assets', parentId, 'asset')
      }
      for (const finding of findings) {
        if (finding.codePath.length === 0) throw new Error('sast_add_finding requires at least one code location')
        if (finding.affectedAssetId !== undefined) await this.requireRef(sessionId, 'assets', finding.affectedAssetId, 'asset')
        this.checkFindingSkillRef(finding, intent)
      }

      const domain = await this.domain()
      const created: Array<{ readonly table: 'facts' | 'assets' | 'findings' | 'edges'; readonly key: string }> = []
      try {
        for (const [index, fact] of facts.entries()) {
          const normalized = normalizeRepoPath(fact.path)
          try {
            requireExistingFile(scan.workspacePath, normalized, 'file')
          } catch {
            throw new Error(`sast: facts[${index}].path ${fact.path} does not exist in the scan workspace; only cite files you actually read`)
          }
          const { line, lineAdjusted } = clampLine(scan.workspacePath, normalized, fact.line ?? 0)
          const write = await this.addNode(sessionId, 'yields', intentId, 'fact', {
            intentId,
            kind: fact.kind,
            path: normalized,
            line,
            ...(fact.endLine !== undefined ? { endLine: fact.endLine } : {}),
            lineAdjusted,
            ...(fact.symbol !== undefined ? { symbol: fact.symbol } : {}),
            detail: fact.detail,
            ...(fact.snippet !== undefined ? { snippet: fact.snippet } : {}),
            confidence: fact.confidence,
            source: 'llm',
            engineRule: '',
            at: this.now(),
          })
          created.push({ table: 'facts', key: recordKey(sessionId, write.nodeId) })
          if (write.edge !== undefined) created.push({ table: 'edges', key: recordKey(sessionId, write.edge.id) })
          if (fact.fromFactId !== undefined) {
            const flowEdgeId = await this.nextId('edge', sessionId)
            const flowEdge = snapshot<SastEdge>({ id: flowEdgeId, sessionId, kind: 'flows_to', sourceId: fact.fromFactId, targetId: write.nodeId })
            await domain.table('edges').put(recordKey(sessionId, flowEdgeId), flowEdge)
            created.push({ table: 'edges', key: recordKey(sessionId, flowEdgeId) })
          }
        }
        for (const asset of assets) {
          const parentId = asset.parentId === '' ? undefined : asset.parentId
          let value = asset.value
          if (asset.type === 'file' || asset.type === 'module') {
            try {
              value = normalizeRepoPath(asset.value)
              requireExistingFile(scan.workspacePath, value, asset.type)
            } catch {
              throw new Error(`sast: asset ${asset.value} does not exist in the scan workspace; only cite files you actually read`)
            }
          }
          const write = await this.addNode(sessionId, parentId === undefined ? undefined : 'parent', parentId ?? '', 'asset', {
            type: asset.type,
            value,
            meta: asset.meta,
            at: this.now(),
          })
          created.push({ table: 'assets', key: recordKey(sessionId, write.nodeId) })
          if (write.edge !== undefined) created.push({ table: 'edges', key: recordKey(sessionId, write.edge.id) })
        }
        for (const [index, finding] of findings.entries()) {
          const codePath = finding.codePath.map((hop, hopIndex) => this.hardenHop(
            scan.workspacePath,
            hop,
            raw => `sast: findings[${index}].codePath[${hopIndex}].path ${raw} does not exist in the scan workspace; only cite files you actually read`,
          ))
          const write = await this.addNode(sessionId, 'proves', intentId, 'finding', {
            intentId,
            title: finding.title,
            severity: finding.severity,
            ...(finding.vulnClass !== undefined ? { vulnClass: finding.vulnClass } : {}),
            ...(finding.cwe !== undefined ? { cwe: finding.cwe } : {}),
            confidence: finding.confidence,
            description: finding.description ?? '',
            codePath,
            remediation: finding.remediation ?? '',
            poc: finding.poc ?? '',
            status: 'open',
            triageReason: '',
            ...(finding.skillId !== undefined ? { skillId: finding.skillId, checkId: finding.checkId! } : {}),
            ...(finding.affectedAssetId !== undefined ? { affectedAssetId: finding.affectedAssetId } : {}),
            at: this.now(),
          })
          created.push({ table: 'findings', key: recordKey(sessionId, write.nodeId) })
          if (write.edge !== undefined) created.push({ table: 'edges', key: recordKey(sessionId, write.edge.id) })
        }
      } catch (error) {
        for (const { table, key } of created.reverse()) {
          // Each cleanup failure is collected (not thrown) so the ORIGINAL
          // error survives and the remaining rows still get their best-effort
          // removal — a second backend failure must not strand the rest.
          try {
            await domain.table(table).delete(key)
          } catch {
            // Rollback already lost the race with a failing backend; the
            // original error is the actionable one.
          }
        }
        throw error
      }
      return { facts: facts.length, assets: assets.length, findings: findings.length }
    })
  }

  /** Read all audit rows of one session, ordered by numeric id sequence (Skills sort by their stable name). */
  async sessionData(sessionId: string): Promise<{
    scan: SastScan | undefined
    skills: SastSkill[]
    intents: SastIntent[]
    facts: SastFact[]
    findings: SastFinding[]
    assets: SastAsset[]
    edges: SastEdge[]
  }> {
    const domain = await this.domain()
    const bySession = <T extends { readonly sessionId: string; readonly id: string }>(rows: Iterable<[string, T]>): T[] =>
      [...rows].map(([, row]) => row).filter(row => row.sessionId === sessionId).sort((a, b) => {
        const aSeq = Number(/-(\d+)$/.exec(a.id)?.[1] ?? Number.MAX_SAFE_INTEGER)
        const bSeq = Number(/-(\d+)$/.exec(b.id)?.[1] ?? Number.MAX_SAFE_INTEGER)
        return aSeq - bSeq
      })
    const skills = [...domain.table('skills').entries()]
      .map(([, row]) => row)
      .filter(row => row.sessionId === sessionId)
      .sort((a, b) => a.id.localeCompare(b.id))
    return {
      scan: await this.getScan(sessionId),
      skills,
      intents: bySession(domain.table('intents').entries()),
      facts: bySession(domain.table('facts').entries()),
      findings: bySession(domain.table('findings').entries()),
      assets: bySession(domain.table('assets').entries()),
      edges: bySession(domain.table('edges').entries()),
    }
  }

  /** Derive the two-dimensional coverage view for one session (pure over the session snapshot, coverage.ts). */
  async coverage(sessionId: string): Promise<CoverageView> {
    const { scan, skills, intents, facts, findings, assets } = await this.sessionData(sessionId)
    return coverageOf({ scan, skills, intents, facts, findings, assets })
  }

  /**
   * Persist one report artifact row (M4) through the shared allocator
   * (`ReportArtifactStore` — see this class's `artifacts` field doc for why
   * this delegates rather than allocating its own id). `fields` is
   * everything {@link writeArtifact} already computed (kind/uri/sha256/
   * bytes, plus batchId/jobId when present); the shared store assigns id
   * and createdAt (the injected clock, ADR-10 — never trusted from a
   * caller). Not part of the per-session audit graph — `report_artifacts`
   * carries no `sessionId` and is deliberately excluded from
   * `CLEARED_ON_RESET_TABLES`, so a repeat scan of the same session never
   * deletes a previously delivered report.
   */
  async putReportArtifact(fields: Omit<SastReportArtifact, 'id' | 'createdAt'>): Promise<SastReportArtifact> {
    return this.artifacts.put(fields)
  }

  /** Read one report artifact row by its durable id, if present. */
  async getReportArtifact(id: string): Promise<SastReportArtifact | undefined> {
    return this.artifacts.get(id)
  }

  /** Build the model-visible summary view for one session. */
  async view(sessionId: string): Promise<SastStateView> {
    const { scan, skills, intents, facts, findings, assets, edges } = await this.sessionData(sessionId)
    if (scan === undefined) {
      return {
        initialized: false,
        skills: [],
        intents: [],
        facts: [],
        findings: [],
        assets: [],
        edges: [],
        counts: { skills: 0, intents: 0, facts: 0, findings: 0, assets: 0 },
      }
    }
    return snapshot<SastStateView>({
      initialized: true,
      scan,
      skills,
      intents,
      facts,
      findings,
      assets,
      edges,
      counts: { skills: skills.length, intents: intents.length, facts: facts.length, findings: findings.length, assets: assets.length },
    })
  }
}
