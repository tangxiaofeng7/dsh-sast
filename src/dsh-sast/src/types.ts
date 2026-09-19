/**
 * Pure types of the sast projection domain: the ONE home of the `sast`
 * projection-key declaration plus its payload types, free of this package's
 * host-side value imports (zod, dsh-tools). Two namespace projections serve
 * it — `./types` for host consumers, `./client` (the client-namespace
 * re-export) for client aggregates — with zero content duplication.
 *
 * @module @tangxiaofeng7/dsh-sast-host/types
 */

import type {
  SastAssetType,
  SastBatchStatus,
  SastEdgeKind,
  SastFactKind,
  SastIntentCategory,
  SastIntentStatus,
  SastJobReviewStatus,
  SastJobStatus,
  SastProvider,
  SastSeverity,
  SastSkillSourceGroup,
  SastVulnClass,
} from './spec.ts'

// Client consumers need the closed enum types of the payloads; re-export them
// type-only so the `./client` outlet carries the full vocabulary.
export type {
  SastAssetType,
  SastBatchStatus,
  SastEdgeKind,
  SastFactKind,
  SastIntentCategory,
  SastIntentStatus,
  SastJobReviewStatus,
  SastJobStatus,
  SastProvider,
  SastSeverity,
  SastSkillSourceGroup,
  SastVulnClass,
} from './spec.ts'

declare module '@deepseek-ai/dsh-session-projection/types' {
  interface SessionProjectionStateMap {
    /** Host fold state of the mount marker (a plain boolean). */
    sastMounted: boolean
  }

  interface SessionProjectionMap {
    /**
     * The audit's current graph, folded from the logged `sast_*` tool calls
     * (scan plus skill/intent/fact/finding nodes, the asset graph, and every
     * edge); `null` before the first `sast_start_scan` of the session.
     */
    sast: SastProjection | null
    /**
     * Whether THIS session's own log proves its composition mounts the sast
     * row — a `sast_*` tool in the assembled request header, a logged call,
     * or a folded delegated submission. Sticky-true over the append-only
     * log; `false` for a session that never recorded sast evidence, whatever
     * preset it names. The Web tab gates on this value, because the
     * projection KEY is host-wide (one registered unit serves every session)
     * and therefore never proves per-session composition.
     */
    sastMounted: boolean
    /**
     * The calling (batch owner) session's own batch, folded from the logged
     * `sast_batch_*` tool calls — at most 100 job-summary rows and the
     * most-recent events, never a full per-repo graph (ADR-11); `null`
     * before the first `sast_start_batch` of the session.
     */
    sastBatch: SastBatchProjection | null
  }
}

/** The current scan (one per session; its node id is `scan-1`). */
export interface SastProjectionScan {
  readonly id: string
  readonly provider: SastProvider
  readonly repoUrl: string
  readonly branch: string
  readonly commit: string
  readonly objective: string
  readonly authorization: string
}

/** One registered audit-methodology check within the projection's Skill snapshot. */
export interface SastProjectionSkillCheck {
  readonly id: string
  readonly title: string
  readonly scope: readonly string[]
}

/** One registered audit-methodology Skill's minimal projected snapshot (never windowed). */
export interface SastProjectionSkill {
  readonly id: string
  readonly title: string
  readonly source: string
  readonly sourceGroup: SastSkillSourceGroup
  readonly enabled: boolean
  readonly checks: readonly SastProjectionSkillCheck[]
}

/** One audit-graph node, discriminated by kind. */
export type SastProjectionNode =
  | {
    readonly id: string
    readonly kind: 'intent'
    readonly title: string
    readonly detail: string
    readonly category: SastIntentCategory
    readonly status: SastIntentStatus
    readonly skillId?: string
    readonly checkId?: string
  }
  | {
    readonly id: string
    readonly kind: 'fact'
    readonly factKind: SastFactKind
    readonly intentId: string
    readonly path: string
    readonly line: number
    readonly detail: string
    readonly confidence: number
    /** Truncated preview of the full snippet (durable layer only, ADR-11). */
    readonly snippetPreview?: string
  }
  | {
    readonly id: string
    readonly kind: 'finding'
    readonly intentId: string
    readonly title: string
    readonly severity: SastSeverity
    readonly vulnClass?: SastVulnClass
    readonly cwe?: string
    readonly description: string
    readonly codePath: readonly { readonly path: string; readonly line: number; readonly symbol?: string }[]
    readonly affectedAssetId?: string
    readonly skillId?: string
    readonly checkId?: string
  }

/** One asset of the audit's asset graph. */
export interface SastProjectionAsset {
  readonly id: string
  readonly type: SastAssetType
  readonly value: string
  readonly meta: string
}

/** One directed graph edge (source → target). */
export interface SastProjectionEdge {
  readonly id: string
  readonly kind: SastEdgeKind
  readonly sourceId: string
  readonly targetId: string
}

/** The standing sast state shown by the Web view tabs. */
export interface SastProjection {
  readonly scan: SastProjectionScan | null
  readonly skills: readonly SastProjectionSkill[]
  readonly nodes: readonly SastProjectionNode[]
  readonly assets: readonly SastProjectionAsset[]
  readonly edges: readonly SastProjectionEdge[]
  readonly counts: {
    readonly intents: number
    readonly facts: number
    readonly findings: number
    readonly assets: number
  }
}

/** One redacted job-summary row for the batch overview / Review Inbox — never the full per-repo graph (ADR-11). */
export interface SastBatchProjectionJob {
  readonly ordinal: number
  /** Already-redacted repo URL (the tool boundary redacts before this ever reaches the log). */
  readonly repoUrl: string
  readonly branch?: string
  readonly status: SastJobStatus
  readonly reviewStatus: SastJobReviewStatus
  readonly attempt: number
  readonly fallback?: string
  readonly errorClass?: string
}

/** One batch-scoped lifecycle/decision event, most-recent-first-capped (never the full append-only log — ADR-11). */
export interface SastBatchProjectionEvent {
  readonly seq: number
  readonly jobId?: string
  readonly kind: string
  readonly detail: string
}

/** One methodology pinned at batch creation (name + digest only — never the body). */
export interface SastBatchProjectionMethodology {
  readonly name: string
  readonly manifestDigest: string
  readonly contentDigest: string
}

/** The standing sastBatch state shown by the batch-owner-only overview tab and Review Inbox. */
export interface SastBatchProjection {
  readonly id: string
  readonly objective: string
  readonly authorization: string
  readonly status: SastBatchStatus
  readonly total: number
  readonly methodologies: readonly SastBatchProjectionMethodology[]
  /** At most 100 rows, one per job, ordered by ordinal (ADR-11 windowing). */
  readonly jobs: readonly SastBatchProjectionJob[]
  /** Most-recent events only, capped — see `EVENT_CAP` in `batch/projection.ts`. */
  readonly recentEvents: readonly SastBatchProjectionEvent[]
}
