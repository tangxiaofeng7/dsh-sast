/**
 * Durable storage-domain declaration for white-box audit mode: the per-repo
 * audit graph plus the durable multi-repo batch control plane.
 *
 * One scan (per repository worker session) starts at **scan-1**; the audit
 * advances along a chain — a scan spawns **intents**, an intent yields
 * **facts**, a fact derives a new intent, and an intent proves a **finding**
 * (vulnerability with a code evidence chain). Facts also carry a `flows_to`
 * edge between an upstream and downstream fact for taint propagation.
 * **Assets** (repo / module / file / entrypoint / package / datastore) form a
 * second, parent-linked graph. **Skills** are the per-scan minimal snapshot
 * of a registered user audit methodology's checks — they never join the
 * `edges` graph; intents reference a skill/check by id so a check with no
 * intent yet still exists as `todo`. Every graph relationship is an explicit
 * **edge** row, so both graphs are fully reconstructible.
 *
 * The batch control plane (`batches`/`scan_jobs`/`job_events`/
 * `report_artifacts`) is declared now — at domain `version: 2` from the
 * start — so the durable schema never needs a breaking bump once M5 fills it
 * in; its fields track docs/architecture.md §2 at outline depth and may
 * still grow.
 *
 * Everything single-repo is scoped to one session: every record carries the
 * owning `sessionId`. Record schemas are zod; the domain schema validates
 * every stored record at the durable boundary (the storage-domain facility
 * is the package's guard, so no separate event invariant companion is
 * needed for referential shape — cross-table reference *existence* is still
 * checked by the store, see store.ts).
 * @module @tangxiaofeng7/dsh-sast-host/src/spec
 */

import { z } from 'zod'
import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain'

/** Kind of a recorded code fact / taint-chain element. */
export const sastFactKindSchema = z.enum(['source', 'sink', 'sanitizer', 'route', 'config', 'dependency', 'secret', 'pattern', 'info'])
/** Severity of a vulnerability finding. */
export const sastSeveritySchema = z.enum(['critical', 'high', 'medium', 'low', 'info'])
/** Vulnerability class of a finding. */
export const sastVulnClassSchema = z.enum([
  'injection', 'xss', 'deserialization', 'path-traversal', 'ssrf', 'auth', 'access-control',
  'crypto', 'secret', 'config', 'dependency', 'dos', 'logic', 'other',
])
/** Lifecycle status of an audit intent; monotonic (`done` never reverts). */
export const sastIntentStatusSchema = z.enum(['pending', 'running', 'done', 'blocked'])
/** Category grouping for an audit intent. */
export const sastIntentCategorySchema = z.enum(['recon', 'attack-surface', 'taint', 'config', 'dependency', 'verify', 'custom'])
/** Triage status of a finding. */
export const sastFindingStatusSchema = z.enum(['open', 'confirmed', 'false-positive', 'wont-fix'])
/** Kind of a recorded code asset. */
export const sastAssetTypeSchema = z.enum(['repo', 'module', 'file', 'entrypoint', 'package', 'datastore'])
/** Kind of an audit/asset graph edge. */
export const sastEdgeKindSchema = z.enum(['spawns', 'yields', 'derived_from', 'proves', 'flows_to', 'parent'])
/** Repository hosting provider. */
export const sastProviderSchema = z.enum(['gitlab', 'github', 'local'])
/** Trust/origin grouping of a registered audit methodology Skill. */
export const sastSkillSourceGroupSchema = z.enum(['builtin', 'workspace', 'user'])
/** Origin of a recorded fact: v1 is always `llm`; reserved for external engines (ADR-06). */
export const sastFactSourceSchema = z.enum(['llm', 'engine'])

/** Non-empty id. */
const id = z.string().min(1)

/** One hop of a finding's code evidence chain. */
export const sastCodePathHopSchema = z.object({
  path: z.string().min(1),
  line: z.number().int().min(0).optional(),
  lineAdjusted: z.boolean().optional(),
  symbol: z.string().optional(),
  note: z.string().optional(),
})

/** The minimal per-scan snapshot of one registered audit methodology check. */
export const sastSkillCheckSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  scope: z.array(z.string()).default([]),
})

/** The current scan for a repository worker session: one per session, reset by the next scan. */
export const sastScanSchema = z.object({
  id,
  sessionId: id,
  provider: sastProviderSchema,
  /** Redacted repository URL (or absolute local path for `provider: 'local'`); userinfo/token query params stripped before storage (ADR-07). */
  repoUrl: z.string(),
  branch: z.string().default(''),
  commit: z.string().default(''),
  workspacePath: z.string(),
  objective: z.string(),
  scope: z.array(z.string()).default([]),
  /** Declarative authorization note (audit target / written-permission reference); recorded as an auditable fact, not a gate. */
  authorization: z.string().default(''),
  languages: z.array(z.string()).default([]),
  fileCount: z.number().int().min(0).default(0),
  /** Present only when this scan runs as a batch job (repository worker). */
  batchId: id.optional(),
  jobId: id.optional(),
})

/** The per-scan minimal snapshot of a registered user audit methodology. */
export const sastSkillSchema = z.object({
  id,
  sessionId: id,
  title: z.string().min(1),
  /** Raw DSH Skill `source` this snapshot was resolved from (e.g. `project-dsh`, `user-dsh`, `bundled`). */
  source: z.string(),
  sourceGroup: sastSkillSourceGroupSchema,
  provider: z.string(),
  category: sastIntentCategorySchema.default('custom'),
  applicability: z.object({
    languages: z.array(z.string()).default([]),
    frameworks: z.array(z.string()).default([]),
    paths: z.array(z.string()).default([]),
  }).default({ languages: [], frameworks: [], paths: [] }),
  checks: z.array(sastSkillCheckSchema).min(1).max(256),
  enabled: z.boolean().default(true),
  /** sha256 of the normalized methodology definition; same-name+same-digest registration is idempotent. */
  manifestDigest: z.string().min(1),
})

/** One audit intent (what to verify / pursue next). Anchor edges (`spawns`/`derived_from`) live only in `edges`. */
export const sastIntentSchema = z.object({
  id,
  sessionId: id,
  title: z.string().min(1),
  detail: z.string().default(''),
  category: sastIntentCategorySchema.default('custom'),
  scope: z.array(z.string()).default([]),
  status: sastIntentStatusSchema.default('pending'),
  note: z.string().default(''),
  delegatedSessionId: id.optional(),
  /** Driving methodology check, when this intent traces to one (ADR-14). */
  skillId: id.optional(),
  checkId: z.string().optional(),
  /** Store-injected clock timestamps (ms epoch); never trusted from model input (ADR-10). */
  createdAt: z.number(),
  startedAt: z.number().optional(),
  endedAt: z.number().optional(),
})

/** One recorded code fact (evidence) yielded by an intent. */
export const sastFactSchema = z.object({
  id,
  sessionId: id,
  /** Yielding intent (source of the `yields` edge). */
  intentId: id,
  kind: sastFactKindSchema,
  path: z.string().min(1),
  line: z.number().int().min(0).default(0),
  endLine: z.number().int().min(0).optional(),
  lineAdjusted: z.boolean().default(false),
  symbol: z.string().optional(),
  detail: z.string().min(1),
  /** Full code snippet (durable layer only; ≤2000 chars, enforced by the store before write). */
  snippet: z.string().max(2000).optional(),
  confidence: z.number().min(0).max(1).default(0.5),
  source: sastFactSourceSchema.default('llm'),
  engineRule: z.string().default(''),
  at: z.number(),
})

/** One vulnerability finding proved by an intent, with a code evidence chain. */
export const sastFindingSchema = z.object({
  id,
  sessionId: id,
  /** Proving intent (source of the `proves` edge). */
  intentId: id,
  title: z.string().min(1),
  severity: sastSeveritySchema,
  vulnClass: sastVulnClassSchema.optional(),
  cwe: z.string().optional(),
  confidence: z.number().min(0).max(1).default(0.5),
  description: z.string().default(''),
  /** Ordered code evidence chain (min one hop, ADR-03). */
  codePath: z.array(sastCodePathHopSchema).min(1),
  remediation: z.string().default(''),
  poc: z.string().default(''),
  status: sastFindingStatusSchema.default('open'),
  triageReason: z.string().default(''),
  /** Driving methodology check, when this finding traces to one; omitted for incidental findings. */
  skillId: id.optional(),
  checkId: z.string().optional(),
  affectedAssetId: id.optional(),
  at: z.number(),
  triagedAt: z.number().optional(),
})

/** One recorded code asset; parent linkage lives on the `parent` edge row. */
export const sastAssetSchema = z.object({
  id,
  sessionId: id,
  type: sastAssetTypeSchema,
  value: z.string().min(1),
  meta: z.string().default(''),
  at: z.number(),
})

/** One graph edge: source → target with a semantic kind. */
export const sastEdgeSchema = z.object({
  id,
  sessionId: id,
  kind: sastEdgeKindSchema,
  sourceId: id,
  targetId: id,
})

// --- Batch control plane (outline depth; fields may still grow at M5, see docs/architecture.md §2/§5) ---

/** Lifecycle status of a batch. */
export const sastBatchStatusSchema = z.enum(['queued', 'running', 'awaiting_review', 'completed', 'completed_with_issues'])
/** Lifecycle status of one scan job. */
export const sastJobStatusSchema = z.enum([
  'queued', 'preparing', 'running', 'retry_wait',
  'succeeded', 'degraded', 'skipped', 'failed', 'timed_out', 'cancelled',
])
/** Review disposition of a terminal job awaiting owner confirmation. */
export const sastJobReviewStatusSchema = z.enum(['none', 'pending', 'accepted', 'retried', 'confirmed-skip'])

/** One durable multi-repo audit batch: owner session, fixed methodology references, immutable policy snapshot. */
export const sastBatchSchema = z.object({
  id,
  ownerSessionId: id,
  objective: z.string(),
  authorization: z.string().default(''),
  /** User-named methodology references fixed at batch creation (name + manifest/content digest + artifact ref). */
  methodologies: z.array(z.object({
    name: z.string().min(1),
    manifestDigest: z.string().min(1),
    contentDigest: z.string().min(1),
    artifactId: id,
  })).default([]),
  methodologyMode: z.enum(['explicit-only', 'explicit-plus-auto', 'auto']).default('explicit-only'),
  policy: z.object({
    maxAttempts: z.number().int().min(1).default(2),
    cloneTimeoutMs: z.number().int().min(1).optional(),
    jobTimeoutMs: z.number().int().min(1).optional(),
    autoNarrowScope: z.boolean().default(true),
    deduplicate: z.boolean().default(true),
    /** Fixed at 1 for the durable scheduler (ADR-16); recorded for report provenance, not tunable. */
    concurrency: z.literal(1).default(1),
  }),
  status: sastBatchStatusSchema.default('queued'),
  total: z.number().int().min(1).max(100),
  createdAt: z.number(),
})

/** One scan job within a batch; unique on `(batchId, ordinal)`. */
export const sastScanJobSchema = z.object({
  id,
  batchId: id,
  ordinal: z.number().int().min(1).max(100),
  /** Redacted repo spec (provider/repoUrl/branch/ref/scope/objective); no credentials. */
  repoSpec: z.object({
    provider: sastProviderSchema,
    repoUrl: z.string(),
    branch: z.string().optional(),
    ref: z.string().optional(),
    scope: z.array(z.string()).default([]),
    objective: z.string().optional(),
  }),
  workerSessionId: id.optional(),
  attempt: z.number().int().min(0).default(0),
  leaseOwner: z.string().optional(),
  leaseExpiresAt: z.number().optional(),
  deadlineAt: z.number().optional(),
  status: sastJobStatusSchema.default('queued'),
  errorClass: z.string().optional(),
  fallback: z.string().optional(),
  reviewStatus: sastJobReviewStatusSchema.default('none'),
  reportArtifactId: id.optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
})

/** One append-only batch/job decision or lifecycle event. */
export const sastJobEventSchema = z.object({
  id,
  batchId: id,
  jobId: id.optional(),
  seq: z.number().int().min(1),
  kind: z.string().min(1),
  detail: z.string().default(''),
  at: z.number(),
})

/** One durable report artifact (per-repo or per-batch Markdown/SARIF/JSON, or a pinned methodology content copy), with a content digest. */
export const sastReportArtifactSchema = z.object({
  id,
  batchId: id.optional(),
  jobId: id.optional(),
  kind: z.enum(['repo-markdown', 'repo-sarif', 'repo-summary', 'batch-markdown', 'batch-json', 'methodology-content']),
  uri: z.string().min(1),
  sha256: z.string().min(1),
  bytes: z.number().int().min(0),
  createdAt: z.number(),
})

/** The whole sast domain: single-repo audit graph (7 tables) + durable batch control plane (4 tables). */
export const sastDomainSpec = defineDomain({
  name: 'sast',
  version: 2,
  tables: {
    scans: domainTable<string, z.infer<typeof sastScanSchema>>(sastScanSchema),
    skills: domainTable<string, z.infer<typeof sastSkillSchema>>(sastSkillSchema),
    intents: domainTable<string, z.infer<typeof sastIntentSchema>>(sastIntentSchema),
    facts: domainTable<string, z.infer<typeof sastFactSchema>>(sastFactSchema),
    findings: domainTable<string, z.infer<typeof sastFindingSchema>>(sastFindingSchema),
    assets: domainTable<string, z.infer<typeof sastAssetSchema>>(sastAssetSchema),
    edges: domainTable<string, z.infer<typeof sastEdgeSchema>>(sastEdgeSchema),
    batches: domainTable<string, z.infer<typeof sastBatchSchema>>(sastBatchSchema),
    scan_jobs: domainTable<string, z.infer<typeof sastScanJobSchema>>(sastScanJobSchema),
    job_events: domainTable<string, z.infer<typeof sastJobEventSchema>>(sastJobEventSchema),
    report_artifacts: domainTable<string, z.infer<typeof sastReportArtifactSchema>>(sastReportArtifactSchema),
  },
})

export type SastFactKind = z.infer<typeof sastFactKindSchema>
export type SastSeverity = z.infer<typeof sastSeveritySchema>
export type SastVulnClass = z.infer<typeof sastVulnClassSchema>
export type SastIntentStatus = z.infer<typeof sastIntentStatusSchema>
export type SastIntentCategory = z.infer<typeof sastIntentCategorySchema>
export type SastFindingStatus = z.infer<typeof sastFindingStatusSchema>
export type SastAssetType = z.infer<typeof sastAssetTypeSchema>
export type SastEdgeKind = z.infer<typeof sastEdgeKindSchema>
export type SastProvider = z.infer<typeof sastProviderSchema>
export type SastSkillSourceGroup = z.infer<typeof sastSkillSourceGroupSchema>
export type SastFactSource = z.infer<typeof sastFactSourceSchema>
export type SastCodePathHop = z.infer<typeof sastCodePathHopSchema>
export type SastSkillCheck = z.infer<typeof sastSkillCheckSchema>
export type SastScan = z.infer<typeof sastScanSchema>
export type SastSkill = z.infer<typeof sastSkillSchema>
export type SastIntent = z.infer<typeof sastIntentSchema>
export type SastFact = z.infer<typeof sastFactSchema>
export type SastFinding = z.infer<typeof sastFindingSchema>
export type SastAsset = z.infer<typeof sastAssetSchema>
export type SastEdge = z.infer<typeof sastEdgeSchema>
export type SastBatchStatus = z.infer<typeof sastBatchStatusSchema>
export type SastJobStatus = z.infer<typeof sastJobStatusSchema>
export type SastJobReviewStatus = z.infer<typeof sastJobReviewStatusSchema>
export type SastBatch = z.infer<typeof sastBatchSchema>
export type SastScanJob = z.infer<typeof sastScanJobSchema>
export type SastJobEvent = z.infer<typeof sastJobEventSchema>
export type SastReportArtifact = z.infer<typeof sastReportArtifactSchema>
