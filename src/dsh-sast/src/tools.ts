/**
 * Model-facing `sast_*` tools: record the audit graph
 * (scan → intent → fact → intent → finding), register audit-methodology
 * Skills, record assets, triage findings, read the current state, and dump
 * the graph or the final report for one session.
 *
 * Record ownership discipline: the repository worker (decision agent) writes
 * and reads its own graph with `sast_add_*` and read tools. Execution
 * subagents use only `sast_submit`, which resolves the parent session from
 * session ancestry.
 *
 * Every graph-writing tool (`sast_start_scan`, `sast_add_*`, `sast_submit`)
 * is wrapped with the structural loop guard (`loop-guard.ts`): an identical
 * write repeated after success, or retried identically past two failures, is
 * rejected before executing with an error that names the way out. This is
 * the mechanical half of the loop protection whose prompt half lives in
 * `instructions.ts` (tools-protocol.md §3 "循环防护").
 *
 * This module implements the 15 single-repo tools (tools-protocol.md
 * §2.1–2.12, including `sast_checkpoint`); the 4 batch-control tools belong
 * to M5's `batch/tools.ts`.
 * @module @tangxiaofeng7/dsh-sast-host/src/tools
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { ToolResult, ToolResultView } from '@deepseek-ai/dsh-tools'
import { existsSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import type { CoverageView } from './coverage.ts'
import { cloneRepo } from './ingest/clone.ts'
import { checkGuardrails } from './ingest/guardrails.ts'
import { collectRepoMetadata } from './ingest/metadata.ts'
import { hardenWorkspaceReadOnly } from './ingest/sandbox.ts'
import { parseRepoUrl } from './ingest/url.ts'
import { guardedAgainstLoops, SastLoopGuard, sessionIdOf } from './loop-guard.ts'
import { writeArtifact } from './report/artifacts.ts'
import { buildReport } from './report/markdown.ts'
import { buildSarif } from './report/sarif.ts'
import { parseSkillManifest } from './skill-manifest.ts'
import type {
  AssetInput,
  CodePathHopInput,
  FactInput,
  FindingInput,
  SastStateView,
  SastStore,
} from './store.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /**
     * Resolves the `(batchId, jobId)` a calling session was created for, so
     * `sast_start_scan`/`sast_report` can auto-tag their durable rows
     * without ever accepting `batchId`/`jobId` as model-suppliable tool
     * arguments — a worker session is already scoped to exactly one job, so
     * this is a structural fact about the session, not something the model
     * states. Provided by the `sast-batch` plugin (`batch-plugin.ts`), via
     * its `RepositoryWorkerFactory.lineageOf`; absent when only this
     * plugin (no `sast-batch`) is composed.
     */
    sastBatchLineageOf?: (sessionId: string) => { readonly batchId: string; readonly jobId: string } | undefined
  }
}

/** Read `ctx.sastBatchLineageOf` via `ctx.get()` (never a direct `ctx.sastBatchLineageOf` property access, which throws when no plugin has `inject`-declared it) and resolve one session's `(batchId, jobId)`, or `undefined` outside batch execution. */
function batchLineageOf(ctx: Context, sessionId: string): { readonly batchId: string; readonly jobId: string } | undefined {
  const resolver = ctx.get('sastBatchLineageOf') as Context['sastBatchLineageOf']
  return resolver?.(sessionId)
}

/** Resolve the only graph a delegated child is allowed to submit into. */
function parentSessionIdOf(exec: { agent?: { session: { header?: { parentSession?: string } } } }): string {
  const parentSessionId = exec.agent?.session.header?.parentSession
  if (parentSessionId === undefined || parentSessionId === '') {
    throw new Error('sast_submit is only available to a delegated subagent with a parent session')
  }
  return parentSessionId
}

function requiredString(value: unknown, name: string): string {
  if (typeof value !== 'string' || value === '') throw new Error(`sast_* requires ${name}`)
  return value
}

/** Reject prompt variables before they are mistaken for a parent graph id. */
function concreteIntentId(value: string): string {
  const normalized = value.trim()
  if (/^(?:[<{[]\s*)?(?:delegation[-_])?intent[-_]?id(?:\s*[>}\]])?$/i.test(normalized)) {
    throw new Error(`sast_submit requires the concrete parent intent ID returned by sast_add_intent; received placeholder ${JSON.stringify(value)}`)
  }
  return normalized
}

function optionalString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function submissionList(value: unknown, name: string): Record<string, unknown>[] {
  if (!Array.isArray(value) || !value.every(item => item !== null && typeof item === 'object' && !Array.isArray(item))) {
    throw new Error(`sast_submit requires ${name} to be an array of objects`)
  }
  return value as Record<string, unknown>[]
}

function enumValue<T extends readonly string[]>(value: unknown, allowed: T, fallback: T[number], name: string): T[number] {
  if (value === undefined) return fallback
  if (typeof value === 'string' && (allowed as readonly string[]).includes(value)) return value as T[number]
  throw new Error(`sast_submit ${name} must be one of: ${allowed.join(', ')}`)
}

/** Confidence input parsing is intentionally asymmetric with normalizeConfidence in projection.ts: the tool
 * layer HARD-REJECTS an out-of-range value (protects the durable write), while the pure projection fold
 * clamps and defaults instead of throwing (a fold must never fail on a malformed replayed event). This is
 * an accepted, deliberate asymmetry — not a bug. */
function confidenceValue(value: unknown): number {
  if (value === undefined) return 0.5
  const text = typeof value === 'string' ? value.trim() : undefined
  const isPercent = text?.endsWith('%') === true
  const parsed = typeof value === 'number'
    ? value
    : text === undefined || text === '' ? Number.NaN : Number(isPercent ? text.slice(0, -1) : text)
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error('sast_submit confidence must be 0..1 or a percentage from 0 to 100')
  }
  if (isPercent || parsed > 1) {
    if (parsed > 100) throw new Error('sast_submit confidence must be 0..1 or a percentage from 0 to 100')
    return parsed / 100
  }
  return parsed
}

/** Parse one raw codePath hop argument into `store.ts`'s input shape. */
function codePathHopInput(value: unknown, index: number): CodePathHopInput {
  if (value === null || typeof value !== 'object') {
    throw new Error(`sast_add_finding codePath[${index}] must be an object`)
  }
  const raw = value as Record<string, unknown>
  const path = requiredString(raw.path, `codePath[${index}].path`)
  return {
    path,
    ...(typeof raw.line === 'number' ? { line: raw.line } : {}),
    ...(typeof raw.symbol === 'string' ? { symbol: raw.symbol } : {}),
    ...(typeof raw.note === 'string' ? { note: raw.note } : {}),
  }
}

function codePathInput(value: unknown): CodePathHopInput[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('sast_add_finding requires at least one code location')
  }
  return value.map((hop, index) => codePathHopInput(hop, index))
}

/** Completed generic card for the read-only projections: a domain title over the raw content. */
function titledCard(title: string, result: ToolResult): ToolResultView | undefined {
  if (result.isError) return undefined
  return { card: 'generic', title, content: result.content }
}

/** The closed enum values exposed by the tools. */
const FACT_KINDS = ['source', 'sink', 'sanitizer', 'route', 'config', 'dependency', 'secret', 'pattern', 'info'] as const
const SEVERITIES = ['critical', 'high', 'medium', 'low', 'info'] as const
const VULN_CLASSES = [
  'injection', 'xss', 'deserialization', 'path-traversal', 'ssrf', 'auth', 'access-control',
  'crypto', 'secret', 'config', 'dependency', 'dos', 'logic', 'other',
] as const
const INTENT_CATEGORIES = ['recon', 'attack-surface', 'taint', 'config', 'dependency', 'verify', 'custom'] as const
const INTENT_STATUSES = ['pending', 'running', 'done', 'blocked'] as const
const TRIAGE_STATUSES = ['confirmed', 'false-positive', 'wont-fix'] as const
const ASSET_TYPES = ['repo', 'module', 'file', 'entrypoint', 'package', 'datastore'] as const
const PROVIDERS = ['gitlab', 'github', 'local'] as const
const REPORT_FORMATS = ['markdown', 'sarif'] as const

let submissionProjectionEvent = 0

/**
 * Drive the live parent projection from a delegated write. The durable graph
 * lives in storage, while the Web client consumes the session projection;
 * regular tool calls are the shared, known event vocabulary that updates both
 * the projection and history replay without introducing a custom session event.
 */
function appendSubmissionProjection(
  parent: unknown,
  intentId: string,
  facts: FactInput[],
  assets: AssetInput[],
  findings: FindingInput[],
): void {
  const append = (parent as { append: (type: 'tool/call', data: Record<string, unknown>) => unknown }).append.bind(parent)
  const calls: Array<{ name: string; args: Record<string, unknown> }> = [
    ...facts.map(fact => ({ name: 'sast_add_fact', args: { ...fact, intentId } })),
    ...assets.map(asset => ({ name: 'sast_add_asset', args: { ...asset } })),
    ...findings.map(finding => ({ name: 'sast_add_finding', args: { ...finding, intentId } })),
  ]
  for (const call of calls) {
    submissionProjectionEvent += 1
    append('tool/call', {
      turn: 0,
      step: submissionProjectionEvent,
      callId: `sast-submit-${submissionProjectionEvent}`,
      name: call.name,
      arguments: JSON.stringify(call.args),
    })
  }
}

/** Build the full audit-graph dump for one session (pure projection over the durable view). */
function buildGraph(state: SastStateView): {
  scan: SastStateView['scan'] | null
  skills: SastStateView['skills']
  intents: SastStateView['intents']
  facts: SastStateView['facts']
  findings: SastStateView['findings']
  assets: SastStateView['assets']
  edges: SastStateView['edges']
} {
  return {
    scan: state.scan ?? null,
    skills: state.skills,
    intents: state.intents,
    facts: state.facts,
    findings: state.findings,
    assets: state.assets,
    edges: state.edges,
  }
}

/** Configuration for the ingest pipeline `sast_start_scan` drives (ADR-07: only env-var NAMEs, never token values). */
export interface SastToolsConfig {
  /** Env var holding the GitLab access token (default 'SAST_GITLAB_TOKEN'). */
  readonly gitlabTokenEnv?: string
  /** Env var holding the GitHub access token (default 'SAST_GITHUB_TOKEN'). */
  readonly githubTokenEnv?: string
  /** Root directory under which each scan's disposable clone workspace is created (default a subdirectory of the OS temp dir). */
  readonly workspaceRoot?: string
  /** Root directory report artifacts (`sast_report`) are written under (default a subdirectory of the OS temp dir; a real host wires `$DSH_HOME/sast-reports`). */
  readonly reportRoot?: string
}

/** Register all `sast_*` single-repo tools on the caller's tool registry. */
export function registerSastTools(ctx: Context, store: SastStore, config: SastToolsConfig = {}): void {
  const workspaceRoot = config.workspaceRoot ?? join(tmpdir(), 'dsh-sast-workspaces')
  const reportRoot = config.reportRoot ?? join(tmpdir(), 'dsh-sast-reports')
  const tokenEnvVarOf = (provider: 'gitlab' | 'github'): string =>
    provider === 'github' ? config.githubTokenEnv ?? 'SAST_GITHUB_TOKEN' : config.gitlabTokenEnv ?? 'SAST_GITLAB_TOKEN'
  const loopGuard = new SastLoopGuard()

  ctx.tools.register(guardedAgainstLoops(defineTool({
    name: 'sast_start_scan',
    description: 'Start a white-box audit: read-only clone the repository, collect metadata, and record scan-1 — RESETTING the whole audit graph and every Skill snapshot of this session (a new scan starts a fresh chain). Call this once before recording intents, facts, findings, or assets. Record the audit authorization (target / written-permission reference) as a declarative audit fact — the package enforces no gate by itself. Does not accept baseBranch (incremental/MR audit is a v2 feature).',
    parameters: {
      repoUrl: { type: 'string', required: true, description: 'GitLab/GitHub repository URL, or a local absolute path.' },
      branch: { type: 'string', description: 'Branch name (default: remote HEAD branch).' },
      ref: { type: 'string', description: 'A tag or commit sha, in place of branch.' },
      objective: { type: 'string', required: true, description: 'The audit objective / completion judgement.' },
      scope: { type: 'array', description: 'Audit scope globs (empty = whole repo).', items: { type: 'string' } },
      authorization: { type: 'string', description: 'Optional declarative authorization note (audit target or written-permission reference).' },
      provider: { type: 'string', enum: PROVIDERS, description: 'Repository provider (default: inferred from repoUrl).' },
    },
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        id: { type: 'string', required: true },
        provider: { type: 'string', required: true },
        repoUrl: { type: 'string', required: true },
        branch: { type: 'string', required: true },
        commit: { type: 'string', required: true },
        workspacePath: { type: 'string', required: true },
        fileCount: { type: 'number', required: true },
        languages: { type: 'array', required: true, items: { type: 'string' } },
        dependencyManifests: { type: 'array', required: true, items: { type: 'string' } },
        entrypointHints: { type: 'array', required: true, items: { type: 'string' } },
      } },
      render: (_a, v) => [{ type: 'text', text: `Started scan ${v.id} on ${v.repoUrl}@${v.branch} (${v.fileCount} files, ${v.languages.join('/') || 'unknown languages'}).` }],
    },
    execute: async (args, exec) => {
      const sessionId = sessionIdOf(exec)
      const requestedProvider = args.provider as typeof PROVIDERS[number] | undefined
      const lineage = batchLineageOf(ctx, sessionId)

      if (requestedProvider === 'local' || (requestedProvider === undefined && !/^https?:\/\//i.test(args.repoUrl))) {
        // provider 'local' (or an inferred bare filesystem path) skips
        // cloning entirely (tools-protocol.md §2.1) and validates the given
        // path directly as the workspace — never chmod'd read-only, since
        // this is very likely the caller's own working copy, not a
        // disposable clone this package owns.
        const workspacePath = resolve(args.repoUrl)
        if (!existsSync(workspacePath) || !statSync(workspacePath).isDirectory()) {
          throw new Error(`sast: local repoUrl ${args.repoUrl} does not exist or is not a directory`)
        }
        await checkGuardrails(workspacePath)
        const metadata = await collectRepoMetadata(workspacePath)
        const scan = await store.initScan(sessionId, {
          provider: 'local',
          repoUrl: workspacePath,
          branch: args.branch ?? '',
          commit: args.ref ?? '',
          workspacePath,
          objective: args.objective,
          scope: args.scope ?? [],
          authorization: args.authorization ?? '',
          languages: metadata.languages,
          fileCount: metadata.fileCount,
          ...(lineage !== undefined ? { batchId: lineage.batchId, jobId: lineage.jobId } : {}),
        })
        return {
          id: scan.id, provider: scan.provider, repoUrl: scan.repoUrl, branch: scan.branch, commit: scan.commit,
          workspacePath: scan.workspacePath, fileCount: scan.fileCount, languages: [...metadata.languages],
          dependencyManifests: [...metadata.dependencyManifests], entrypointHints: [...metadata.entrypointHints],
        }
      }

      const parsed = parseRepoUrl(args.repoUrl)
      const provider = requestedProvider ?? parsed.provider
      if (provider !== 'gitlab' && provider !== 'github') {
        throw new Error(`sast: provider ${provider} is not a remote provider; use 'local' for a filesystem path`)
      }
      // Clone → sandbox → guardrails → metadata, in that order; initScan()
      // only runs after all four succeed (write-then-clear ordering) — a
      // failure at any step must leave any prior scan of this session fully
      // intact and never write a partial scan row.
      const { workspacePath, commit, branch } = await cloneRepo({
        provider, repoUrl: args.repoUrl, branch: args.branch, ref: args.ref, workspaceRoot,
        tokenEnvVar: tokenEnvVarOf(provider),
      })
      await hardenWorkspaceReadOnly(workspacePath)
      await checkGuardrails(workspacePath)
      const metadata = await collectRepoMetadata(workspacePath)
      const scan = await store.initScan(sessionId, {
        provider,
        repoUrl: parsed.redacted,
        branch,
        commit,
        workspacePath,
        objective: args.objective,
        scope: args.scope ?? [],
        authorization: args.authorization ?? '',
        languages: metadata.languages,
        fileCount: metadata.fileCount,
        ...(lineage !== undefined ? { batchId: lineage.batchId, jobId: lineage.jobId } : {}),
      })
      return {
        id: scan.id, provider: scan.provider, repoUrl: scan.repoUrl, branch: scan.branch, commit: scan.commit,
        workspacePath: scan.workspacePath, fileCount: scan.fileCount, languages: [...metadata.languages],
        dependencyManifests: [...metadata.dependencyManifests], entrypointHints: [...metadata.entrypointHints],
      }
    },
  }), loopGuard))

  ctx.tools.register(defineTool({
    name: 'sast_register_skill',
    description: 'Register one user audit-methodology Skill as this scan\'s stable check list. Only accepts name — checks/source/provider/digest are resolved by the tool from the trusted ctx.skills registry, never accepted from the model. Same name + same digest retries are idempotent; a changed digest with no intent reference yet replaces atomically, with a reference it hard-fails (use a new Skill name or start a new scan).',
    parameters: {
      name: { type: 'string', required: true, description: 'DSH kebab-case Skill name.' },
      enabled: { type: 'boolean', description: 'Whether to enable immediately (default true).' },
    },
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        id: { type: 'string', required: true },
        title: { type: 'string', required: true },
        source: { type: 'string', required: true },
        sourceGroup: { type: 'string', required: true },
        provider: { type: 'string', required: true },
        enabled: { type: 'boolean', required: true },
        manifestDigest: { type: 'string', required: true },
        checks: { type: 'array', required: true, items: { type: 'object', additionalProperties: true, properties: {} } },
      } },
      render: (_a, v) => [{ type: 'text', text: `Registered skill ${v.id}「${v.title}」 with ${v.checks.length} checks (enabled: ${v.enabled}).` }],
    },
    execute: async (args, exec) => {
      const sessionId = sessionIdOf(exec)
      // Skill lookup uses the calling agent's OWN trusted scope/cwd, exactly
      // like the shipped `skill` tool (dsh-tool-skill resolves via
      // session.header.cwd) — never `scan.workspacePath`, which is
      // untrusted, potentially-malicious repository content (ADR-14/15, see
      // docs/architecture.md §3 "方法论信任边界").
      const cwd = (exec.agent?.session as { header?: { cwd?: string } } | undefined)?.header?.cwd
      const skills = ctx.get('skills') as { get: (name: string, options?: { cwd?: string }) => Promise<unknown> } | undefined
      if (skills === undefined) {
        throw new Error('sast_register_skill: no skill registry (ctx.skills) is composed on this agent; mount @deepseek-ai/dsh-tool-skill and a skill provider')
      }
      const resolved = await skills.get(args.name, { cwd })
      if (resolved === undefined) {
        throw new Error(`sast_register_skill: skill ${args.name} is unknown or no longer available`)
      }
      const registration = parseSkillManifest(resolved as Parameters<typeof parseSkillManifest>[0])
      const skill = await store.registerSkill(sessionId, {
        ...registration,
        enabled: args.enabled ?? true,
      })
      return {
        id: skill.id, title: skill.title, source: skill.source, sourceGroup: skill.sourceGroup,
        provider: skill.provider, enabled: skill.enabled, manifestDigest: skill.manifestDigest, checks: skill.checks,
      }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'sast_set_skill_enabled',
    description: 'Enable or disable a registered Skill for this scan. Disabling removes it from the active check denominator and blocks new intents against it; existing intents, findings, and the snapshot are not deleted, and history is preserved in the report. Re-enabling restores the same snapshot without re-reading the disk definition.',
    parameters: {
      skillId: { type: 'string', required: true, description: 'The registered Skill id.' },
      enabled: { type: 'boolean', required: true, description: 'The new enabled state.' },
    },
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        id: { type: 'string', required: true },
        enabled: { type: 'boolean', required: true },
      } },
      render: (_a, v) => [{ type: 'text', text: `Skill ${v.id} is now ${v.enabled ? 'enabled' : 'disabled'}.` }],
    },
    execute: async (args, exec) => {
      const sessionId = sessionIdOf(exec)
      const skill = await store.setSkillEnabled(sessionId, args.skillId, args.enabled)
      return { id: skill.id, enabled: skill.enabled }
    },
  }))

  ctx.tools.register(guardedAgainstLoops(defineTool({
    name: 'sast_add_intent',
    description: 'Record one audit intent (what to verify / pursue next) as a node in the audit chain. Anchor it with EXACTLY ONE of: scanId (spawns: an intent exploring toward the scan) or derivedFromFactId (derived_from: a new intent derived from a previously recorded fact). skillId and checkId must be provided together or omitted together — when provided, they must reference an already-registered, enabled Skill snapshot and a real check within it, and that Skill/check pair may only have one intent.',
    parameters: {
      title: { type: 'string', required: true, description: 'Short intent title (e.g. "回调验签是否可绕过").' },
      detail: { type: 'string', description: 'Scope, hypothesis, expected evidence.' },
      category: { type: 'string', enum: INTENT_CATEGORIES, description: 'Intent category (default custom).' },
      scope: { type: 'array', description: 'Path globs for this intent.', items: { type: 'string' } },
      skillId: { type: 'string', description: 'Driving audit-methodology Skill id (ADR-14).' },
      checkId: { type: 'string', description: 'The check id within that Skill.' },
      scanId: { type: 'string', description: 'Anchor one: spawns edge. Exactly one of scanId / derivedFromFactId is required.' },
      derivedFromFactId: { type: 'string', description: 'Anchor two: derived_from edge. Exactly one of scanId / derivedFromFactId is required.' },
    },
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        id: { type: 'string', required: true },
        title: { type: 'string', required: true },
        status: { type: 'string', required: true },
        edgeId: { type: 'string', required: true },
        edgeKind: { type: 'string', required: true },
        sourceId: { type: 'string', required: true },
      } },
      render: (_a, v) => [{ type: 'text', text: `Recorded intent ${v.id}「${v.title}」 (${v.edgeKind} ${v.sourceId} → ${v.id}, edge ${v.edgeId}).` }],
    },
    execute: async (args, exec) => {
      const sessionId = sessionIdOf(exec)
      const write = await store.addIntent(sessionId, {
        title: args.title,
        detail: args.detail ?? '',
        category: args.category ?? 'custom',
        scope: args.scope ?? [],
        ...(args.skillId !== undefined ? { skillId: args.skillId, checkId: args.checkId } : {}),
        ...(args.scanId !== undefined ? { scanId: args.scanId } : {}),
        ...(args.derivedFromFactId !== undefined ? { derivedFromFactId: args.derivedFromFactId } : {}),
      })
      /* v8 ignore next 1 -- unreachable: the store always writes the connecting edge for intent writes. */
      return { id: write.nodeId, title: args.title, status: 'pending', edgeId: write.edge?.id ?? '', edgeKind: write.edge?.kind ?? '', sourceId: write.edge?.sourceId ?? '' }
    },
  }), loopGuard))

  ctx.tools.register(defineTool({
    name: 'sast_update_intent',
    description: 'Update one intent\'s lifecycle status, blocking reason, and delegated session — the key observability tool that keeps the UI task board honest. done → pending is rejected (monotonic). Timestamps (startedAt/endedAt) are written by the store\'s injected clock on the relevant transitions, never accepted from the model.',
    parameters: {
      intentId: { type: 'string', required: true, description: 'The intent id to update.' },
      status: { type: 'string', required: true, enum: INTENT_STATUSES, description: 'New status: pending | running | done | blocked.' },
      note: { type: 'string', description: 'Status note / blocking reason.' },
      delegatedSessionId: { type: 'string', description: 'The child session now executing this intent.' },
    },
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        id: { type: 'string', required: true },
        status: { type: 'string', required: true },
        note: { type: 'string', required: true },
      } },
      render: (_a, v) => [{ type: 'text', text: `Intent ${v.id} is now ${v.status}${v.note === '' ? '' : ` (${v.note})`}.` }],
    },
    execute: async (args, exec) => {
      const sessionId = sessionIdOf(exec)
      const updated = await store.updateIntent(sessionId, args.intentId, {
        status: args.status,
        ...(args.note !== undefined ? { note: args.note } : {}),
        ...(args.delegatedSessionId !== undefined ? { delegatedSessionId: args.delegatedSessionId } : {}),
      })
      return { id: updated.id, status: updated.status, note: updated.note }
    },
  }))

  ctx.tools.register(guardedAgainstLoops(defineTool({
    name: 'sast_add_fact',
    description: 'Record one code fact (evidence) yielded by an intent. path must be a repo-relative path you actually read — the tool hardens it against the scan workspace: normalization then existence, rejecting the whole write with no partial persistence on failure. line beyond the file\'s actual line count is soft-clamped to the last line (lineAdjusted: true) rather than rejected; line: 0 is legal (whole-file level). source/engineRule are not model parameters — the tool always writes \'llm\'/\'\'. This is a decision-agent tool; execution subagents submit facts through sast_submit.',
    parameters: {
      intentId: { type: 'string', required: true, description: 'The intent id that yielded this fact (yields edge).' },
      kind: { type: 'string', required: true, enum: FACT_KINDS, description: 'Fact kind: source | sink | sanitizer | route | config | dependency | secret | pattern | info.' },
      path: { type: 'string', required: true, description: 'Repo-relative path.' },
      detail: { type: 'string', required: true, description: 'The fact content.' },
      line: { type: 'number', description: 'Starting line number (0 = whole-file level).' },
      endLine: { type: 'number', description: 'Ending line number.' },
      symbol: { type: 'string', description: 'Function / method / class / config key.' },
      snippet: { type: 'string', description: 'Code snippet.' },
      confidence: { oneOf: [
        { type: 'number', description: 'Confidence 0..1, or 0..100 as a percentage.' },
        { type: 'string', description: 'Percentage such as "90%".' },
      ], description: 'Confidence (default 0.5).' },
      fromFactId: { type: 'string', description: 'Upstream fact id — writes an additional flows_to edge for taint propagation (ADR-05).' },
    },
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        id: { type: 'string', required: true },
        kind: { type: 'string', required: true },
        path: { type: 'string', required: true },
        line: { type: 'number', required: true },
        lineAdjusted: { type: 'boolean', required: true },
        edgeId: { type: 'string', required: true },
        flowEdgeId: { type: 'string' },
      } },
      render: (_a, v) => [{ type: 'text', text: `Recorded fact ${v.id} [${v.kind}] ${v.path}:${v.line} (edge ${v.edgeId}${v.flowEdgeId === undefined ? '' : `, flows_to ${v.flowEdgeId}`}).` }],
    },
    execute: async (args, exec) => {
      const sessionId = sessionIdOf(exec)
      const write = await store.addFact(sessionId, {
        intentId: args.intentId,
        kind: args.kind,
        path: args.path,
        ...(args.line !== undefined ? { line: args.line } : {}),
        ...(args.endLine !== undefined ? { endLine: args.endLine } : {}),
        ...(args.symbol !== undefined ? { symbol: args.symbol } : {}),
        detail: args.detail,
        ...(args.snippet !== undefined ? { snippet: args.snippet } : {}),
        confidence: confidenceValue(args.confidence),
        ...(args.fromFactId !== undefined ? { fromFactId: args.fromFactId } : {}),
      })
      /* v8 ignore next 1 -- unreachable: the store always writes the connecting edge for fact writes. */
      return {
        id: write.nodeId,
        kind: args.kind,
        path: args.path,
        line: write.line,
        lineAdjusted: write.lineAdjusted,
        edgeId: write.edge?.id ?? '',
        ...(write.flowEdge !== undefined ? { flowEdgeId: write.flowEdge.id } : {}),
      }
    },
  }), loopGuard))

  ctx.tools.register(guardedAgainstLoops(defineTool({
    name: 'sast_add_finding',
    description: 'Record one vulnerability finding proved by an intent (proves edge). codePath MUST include at least one hop (each with a real, existing path) — the exact code evidence chain proving this vulnerability; every hop is hardened against the scan workspace, and any hop failing existence rejects the WHOLE finding with no partial persistence, reporting which hop index failed. skillId/checkId omitted means an incidental finding outside the checklist; when provided they must match the proving intent\'s own skillId/checkId exactly.',
    parameters: {
      intentId: { type: 'string', required: true, description: 'The intent id that proved this finding (proves edge).' },
      title: { type: 'string', required: true, description: 'Short finding title (e.g. "/api/order/query 存在 SQL 注入").' },
      severity: { type: 'string', required: true, enum: SEVERITIES, description: 'Severity: critical | high | medium | low | info.' },
      codePath: { type: 'array', required: true, description: 'Ordered code evidence chain (min one hop): { path(required), line, symbol, note }.', items: { type: 'object', additionalProperties: false, properties: {
        path: { type: 'string', required: true },
        line: { type: 'number' },
        symbol: { type: 'string' },
        note: { type: 'string' },
      } } },
      vulnClass: { type: 'string', enum: VULN_CLASSES, description: 'Vulnerability class.' },
      cwe: { type: 'string', description: 'e.g. \'CWE-89\'.' },
      confidence: { oneOf: [
        { type: 'number', description: 'Confidence 0..1, or 0..100 as a percentage.' },
        { type: 'string', description: 'Percentage such as "90%".' },
      ], description: 'Confidence (default 0.5).' },
      description: { type: 'string', description: 'Cause and impact.' },
      remediation: { type: 'string', description: 'Remediation advice.' },
      poc: { type: 'string', description: 'Trigger method / sample input.' },
      affectedAssetId: { type: 'string', description: 'Affected code asset id.' },
      skillId: { type: 'string', description: 'The audit-methodology Skill id that produced this finding (ADR-14).' },
      checkId: { type: 'string', description: 'The check id within that Skill.' },
    },
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        id: { type: 'string', required: true },
        title: { type: 'string', required: true },
        severity: { type: 'string', required: true },
        cwe: { type: 'string' },
        edgeId: { type: 'string', required: true },
      } },
      render: (_a, v) => [{ type: 'text', text: `Recorded finding ${v.id} [${v.severity}] ${v.title} (edge ${v.edgeId}).` }],
    },
    execute: async (args, exec) => {
      const sessionId = sessionIdOf(exec)
      const write = await store.addFinding(sessionId, {
        intentId: args.intentId,
        title: args.title,
        severity: args.severity,
        codePath: codePathInput(args.codePath),
        ...(args.vulnClass !== undefined ? { vulnClass: args.vulnClass } : {}),
        ...(args.cwe !== undefined ? { cwe: args.cwe } : {}),
        confidence: confidenceValue(args.confidence),
        ...(args.description !== undefined ? { description: args.description } : {}),
        ...(args.remediation !== undefined ? { remediation: args.remediation } : {}),
        ...(args.poc !== undefined ? { poc: args.poc } : {}),
        ...(args.affectedAssetId !== undefined ? { affectedAssetId: args.affectedAssetId } : {}),
        ...(args.skillId !== undefined ? { skillId: args.skillId, checkId: args.checkId } : {}),
      })
      /* v8 ignore next 1 -- unreachable: the store always writes the connecting edge for finding writes. */
      return { id: write.nodeId, title: args.title, severity: args.severity, ...(args.cwe !== undefined ? { cwe: args.cwe } : {}), edgeId: write.edge?.id ?? '' }
    },
  }), loopGuard))

  ctx.tools.register(guardedAgainstLoops(defineTool({
    name: 'sast_add_asset',
    description: 'Record one code asset: repo, module, file, entrypoint, package, or datastore. Optionally link it to a parent asset (parentId, e.g. a file under its module) so the asset graph reflects real ownership; an empty string means a root asset. Record parent assets BEFORE their children and reuse the returned ids — never invent one. file/module values are hardened against the scan workspace (module requires a directory); entrypoint/package/datastore values are opaque and skip that check.',
    parameters: {
      type: { type: 'string', required: true, enum: ASSET_TYPES, description: 'Asset type: repo | module | file | entrypoint | package | datastore.' },
      value: { type: 'string', required: true, description: 'The asset value (repo-relative path for file/module; opaque otherwise).' },
      parentId: { type: 'string', description: 'Optional parent asset id (parent edge); an empty string means a root asset.' },
      meta: { type: 'string', description: 'Optional free-form metadata (framework / language / version / auth requirement).' },
    },
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        id: { type: 'string', required: true },
        type: { type: 'string', required: true },
        value: { type: 'string', required: true },
        edgeId: { type: 'string' },
      } },
      render: (_a, v) => [{ type: 'text', text: `Recorded asset ${v.id} [${v.type}] ${v.value}${v.edgeId === undefined ? '' : ` (parent edge ${v.edgeId})`}.` }],
    },
    execute: async (args, exec) => {
      const sessionId = sessionIdOf(exec)
      const write = await store.addAsset(sessionId, {
        type: args.type,
        value: args.value,
        ...(args.parentId !== undefined ? { parentId: args.parentId } : {}),
        meta: args.meta ?? '',
      })
      return {
        id: write.nodeId,
        type: args.type,
        value: args.value,
        ...(write.edge !== undefined ? { edgeId: write.edge.id } : {}),
      }
    },
  }), loopGuard))

  ctx.tools.register(defineTool({
    name: 'sast_triage',
    description: 'Triage one finding: confirmed, false-positive, or wont-fix. A reason is required — it is the source of report credibility. Triage NEVER deletes the finding, only updates status/triageReason/triagedAt; the original conclusion stays auditable. On SARIF export, false-positive maps to suppressions[] rather than being dropped (ADR-09).',
    parameters: {
      findingId: { type: 'string', required: true, description: 'The finding id to triage.' },
      status: { type: 'string', required: true, enum: TRIAGE_STATUSES, description: 'Triage disposition: confirmed | false-positive | wont-fix.' },
      reason: { type: 'string', required: true, description: 'The reasoning (evidence or business context).' },
    },
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        id: { type: 'string', required: true },
        status: { type: 'string', required: true },
      } },
      render: (_a, v) => [{ type: 'text', text: `Finding ${v.id} triaged as ${v.status}.` }],
    },
    execute: async (args, exec) => {
      const sessionId = sessionIdOf(exec)
      const reason = requiredString(args.reason, 'reason')
      const updated = await store.triage(sessionId, args.findingId, args.status, reason)
      return { id: updated.id, status: updated.status }
    },
  }))

  ctx.tools.register(guardedAgainstLoops(defineTool({
    name: 'sast_submit',
    description: 'Immediately submit each newly confirmed delegated result directly into the specified parent intent. Available only to subagents: it records facts, assets, and confirmed findings in the parent graph, refreshes the parent projection, then returns only submission counts. Every path (any fact\'s path, or any finding\'s codePath hop) is validated BEFORE any of the batch is written — the whole submission rejects with no partial persistence and no synthetic event on any single bad path. parentId and affectedAssetId may reference only an existing parent-session asset supplied in the delegation. Use it as real-time checkpoints; never resubmit an item.',
    parameters: {
      intentId: { type: 'string', required: true, description: 'The parent intent id supplied in the delegation prompt.' },
      facts: { type: 'array', required: true, description: 'Observed facts to attach to the parent intent.', items: { type: 'object', additionalProperties: false, properties: {
        kind: { type: 'string', enum: FACT_KINDS, description: 'Fact kind (default info).' },
        path: { type: 'string', required: true, description: 'Repo-relative path.' },
        detail: { type: 'string', required: true, description: 'Confirmed evidence.' },
        line: { type: 'number', description: 'Starting line number.' },
        endLine: { type: 'number', description: 'Ending line number.' },
        symbol: { type: 'string', description: 'Function / method / class / config key.' },
        snippet: { type: 'string', description: 'Code snippet.' },
        confidence: { oneOf: [
          { type: 'number', description: 'Confidence 0..1, or 0..100 as a percentage.' },
          { type: 'string', description: 'Percentage such as "90%".' },
        ] },
        fromFactId: { type: 'string', description: 'Upstream fact id for taint propagation.' },
      } } },
      assets: { type: 'array', required: true, description: 'New assets discovered during execution. parentId may reference only an existing parent-session asset supplied in the delegation.', items: { type: 'object', additionalProperties: true, properties: {
        type: { type: 'string', required: true, enum: ASSET_TYPES, description: 'Asset type: repo | module | file | entrypoint | package | datastore.' },
        value: { type: 'string', required: true, description: 'Asset value.' },
        parentId: { type: 'string', description: 'Existing parent-session asset id, when known.' },
        meta: { type: 'string', description: 'Optional asset metadata.' },
      } } },
      findings: { type: 'array', required: true, description: 'New confirmed findings. affectedAssetId may reference only an existing parent-session asset supplied in the delegation.', items: { type: 'object', additionalProperties: false, properties: {
        title: { type: 'string', required: true, description: 'Short vulnerability title.' },
        severity: { type: 'string', enum: SEVERITIES, description: 'Severity (default info).' },
        codePath: { type: 'array', required: true, description: 'Ordered code evidence chain (min one hop).', items: { type: 'object', additionalProperties: false, properties: {
          path: { type: 'string', required: true },
          line: { type: 'number' },
          symbol: { type: 'string' },
          note: { type: 'string' },
        } } },
        vulnClass: { type: 'string', enum: VULN_CLASSES },
        cwe: { type: 'string' },
        confidence: { oneOf: [
          { type: 'number', description: 'Confidence 0..1, or 0..100 as a percentage.' },
          { type: 'string', description: 'Percentage such as "90%".' },
        ] },
        description: { type: 'string', description: 'Impact or root-cause description.' },
        remediation: { type: 'string' },
        poc: { type: 'string' },
        affectedAssetId: { type: 'string', description: 'Existing affected parent-session asset id, when known.' },
        skillId: { type: 'string' },
        checkId: { type: 'string' },
      } } },
    },
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        facts: { type: 'number', required: true },
        assets: { type: 'number', required: true },
        findings: { type: 'number', required: true },
      } },
      render: (_a, value) => [{ type: 'text', text: `Submitted ${value.facts} facts, ${value.assets} assets, and ${value.findings} findings to the parent session.` }],
    },
    execute: async (args, exec) => {
      const parentSessionId = parentSessionIdOf(exec)
      const input = args as Record<string, unknown>
      const intentId = concreteIntentId(requiredString(input.intentId, 'intentId'))
      const facts = submissionList(input.facts, 'facts')
      const assets = submissionList(input.assets, 'assets')
      const findings = submissionList(input.findings, 'findings')
      // Do not persist a partial submission which cannot be surfaced through
      // the parent session projection.
      const parent = ctx.sessions.get(parentSessionId as never)
      if (parent === undefined) throw new Error(`sast_submit parent session ${parentSessionId} is not live`)

      const factWrites: FactInput[] = facts.map(fact => ({
        intentId,
        kind: enumValue(fact.kind, FACT_KINDS, 'info', 'fact.kind'),
        path: requiredString(fact.path, 'fact.path'),
        detail: requiredString(fact.detail, 'fact.detail'),
        ...(typeof fact.line === 'number' ? { line: fact.line } : {}),
        ...(typeof fact.endLine === 'number' ? { endLine: fact.endLine } : {}),
        ...(typeof fact.symbol === 'string' ? { symbol: fact.symbol } : {}),
        ...(typeof fact.snippet === 'string' ? { snippet: fact.snippet } : {}),
        confidence: confidenceValue(fact.confidence),
        ...(typeof fact.fromFactId === 'string' ? { fromFactId: fact.fromFactId } : {}),
      }))
      const assetWrites: AssetInput[] = assets.map(asset => ({
        type: enumValue(asset.type, ASSET_TYPES, 'file', 'asset.type'),
        value: requiredString(asset.value, 'asset.value'),
        meta: optionalString(asset.meta),
        ...(typeof asset.parentId === 'string' ? { parentId: asset.parentId } : {}),
      }))
      const findingWrites: FindingInput[] = findings.map(finding => ({
        intentId,
        title: requiredString(finding.title, 'finding.title'),
        severity: enumValue(finding.severity, SEVERITIES, 'info', 'finding.severity'),
        codePath: codePathInput(finding.codePath),
        confidence: confidenceValue(finding.confidence),
        description: optionalString(finding.description),
        ...(typeof finding.vulnClass === 'string' ? { vulnClass: finding.vulnClass as typeof VULN_CLASSES[number] } : {}),
        ...(typeof finding.cwe === 'string' ? { cwe: finding.cwe } : {}),
        ...(typeof finding.remediation === 'string' ? { remediation: finding.remediation } : {}),
        ...(typeof finding.poc === 'string' ? { poc: finding.poc } : {}),
        ...(typeof finding.affectedAssetId === 'string' ? { affectedAssetId: finding.affectedAssetId } : {}),
        ...(typeof finding.skillId === 'string' ? { skillId: finding.skillId, checkId: finding.checkId as string } : {}),
      }))
      await store.addSubmission(parentSessionId, intentId, factWrites, assetWrites, findingWrites)
      appendSubmissionProjection(parent, intentId, factWrites, assetWrites, findingWrites)
      return { facts: facts.length, assets: assets.length, findings: findings.length }
    },
  }), loopGuard))

  ctx.tools.register(defineTool({
    name: 'sast_state',
    description: 'Read the current sast state for this session: scan, Skill snapshots, node counts, and short node/asset listings. Reads the storage layer directly, so it carries full records and real elapsed time (not limited by the projection\'s node window, ADR-11). Call this to decide the next audit step. For a lighter one-line progress check (e.g. when breaking a loop), use sast_checkpoint instead.',
    parameters: {},
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          initialized: { type: 'boolean', required: true },
          scan: { type: 'object', additionalProperties: true, properties: {} },
          counts: { type: 'object', additionalProperties: true, properties: {} },
          skills: { type: 'array', required: true, items: { type: 'object', additionalProperties: true, properties: {} } },
          intents: { type: 'array', required: true, items: { type: 'object', additionalProperties: true, properties: {} } },
          facts: { type: 'array', required: true, items: { type: 'object', additionalProperties: true, properties: {} } },
          findings: { type: 'array', required: true, items: { type: 'object', additionalProperties: true, properties: {} } },
          assets: { type: 'array', required: true, items: { type: 'object', additionalProperties: true, properties: {} } },
          edges: { type: 'array', required: true, items: { type: 'object', additionalProperties: true, properties: {} } },
        },
      },
      render: (_a, v) => {
        const view = v as unknown as SastStateView
        if (!view.initialized || view.scan === undefined) {
          return [{ type: 'text', text: 'Not initialized. Call sast_start_scan with repoUrl and objective.' }]
        }
        const scan = view.scan
        const join = (rows: readonly string[]): string => rows.join('; ') || 'none'
        const body = `Repo: ${scan.repoUrl}@${scan.branch} | Objective: ${scan.objective} | ${view.counts.skills} skills, ${view.counts.intents} intents, ${view.counts.facts} facts, ${view.counts.findings} findings, ${view.counts.assets} assets. Intents: ${join(view.intents.map(i => `${i.id}「${i.title}」[${i.status}]`))}. Findings: ${join(view.findings.map(f => `${f.id} [${f.severity}] ${f.title}`))}.`
        return [{ type: 'text', text: body }]
      },
    },
    presentResult: (_args, result) => titledCard('白盒审计状态', result),
    execute: async (_args, exec) => {
      const sessionId = sessionIdOf(exec)
      const view = await store.view(sessionId)
      // The view's record shapes are richer than the schema's permissive JSON
      // item types; the runtime value round-trips fine and the render below
      // re-narrows it.
      return view as never
    },
  }))

  ctx.tools.register(defineTool({
    name: 'sast_checkpoint',
    description: 'Lightweight progress checkpoint — call this when you\'re unsure what to do next or suspect you\'re repeating yourself. Returns a compact one-line summary of what has been recorded so far (intent/fact/finding/asset counts + last recorded item) and one concrete suggested next action. Use this to re-orient before making the next move; ALWAYS prefer calling this over generating repeated text.',
    parameters: {},
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        summary: { type: 'string', required: true },
        nextAction: { type: 'string', required: true },
      } },
      render: (_a, v) => [{ type: 'text', text: `${v.summary}\n→ ${v.nextAction}` }],
    },
    presentResult: (_args, result) => titledCard('审计检查点', result),
    execute: async (_args, exec) => {
      const sessionId = sessionIdOf(exec)
      const state = await store.view(sessionId)
      if (!state.initialized || state.scan === undefined) {
        return {
          summary: 'Progress: no scan recorded yet in this session.',
          nextAction: 'Call sast_start_scan with repoUrl and objective to begin the audit.',
        }
      }
      const intents = state.intents.length
      const facts = state.facts.length
      const findings = state.findings.length
      const assets = state.assets.length
      const lastIntent = state.intents[state.intents.length - 1]
      const lastFinding = state.findings[state.findings.length - 1]
      let summary = `Progress: ${intents} intents, ${facts} facts, ${findings} findings, ${assets} assets.`
      if (lastIntent !== undefined) summary += ` Last intent: 「${lastIntent.title}」[${lastIntent.status}].`
      if (lastFinding !== undefined) summary += ` Last finding: 「${lastFinding.title}」[${lastFinding.severity}].`
      let nextAction: string
      if (intents === 0 && assets > 0) {
        nextAction = 'Assets exist but no intents yet. Call sast_add_intent to create the first audit intent (e.g. category recon anchored on the scan).'
      } else if (intents > 0 && facts === 0 && findings === 0) {
        nextAction = 'Intents exist but no facts/findings yet. Record evidence: sast_submit (subagents) or sast_add_fact / sast_add_finding (worker).'
      } else if (findings > 0) {
        nextAction = 'Findings recorded. Call sast_state to review them, sast_triage to confirm, or sast_report to finalize.'
      } else if (facts > 0) {
        nextAction = 'Facts recorded. Derive new intents from them (sast_add_intent with derivedFromFactId) or prove findings (sast_add_finding).'
      } else {
        nextAction = 'Call sast_state to see the full audit state and decide the next step.'
      }
      return { summary, nextAction }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'sast_graph',
    description: 'Dump the full audit graph of this session as JSON: scan, skills, intents, facts, findings, assets, and every edge (spawns / yields / derived_from / proves / flows_to / parent). skills are not graph nodes — intents.skillId/checkId is the reference between the two. Use this to review the chain before reporting.',
    parameters: {},
    output: {
      schema: { type: 'object', additionalProperties: false, properties: { graph: { type: 'object', additionalProperties: true, properties: {} } } },
      render: (_a, v) => [{ type: 'text', text: JSON.stringify(v.graph) }],
    },
    presentResult: (_args, result) => titledCard('白盒审计图', result),
    execute: async (_args, exec) => {
      const sessionId = sessionIdOf(exec)
      const state = await store.view(sessionId)
      // The graph is richer than the schema's permissive object item type; the
      // runtime value round-trips fine and the render stringifies it.
      return { graph: buildGraph(state) } as never
    },
  }))

  ctx.tools.register(defineTool({
    name: 'sast_coverage',
    description: 'Read the two-dimensional coverage of this session (ADR-14): file coverage measures breadth (what has been examined), check coverage measures methodology commitment and progress. The active denominator counts only ENABLED Skills\' checks; a disabled Skill still appears in skills[] but drops out of the top-level totals. covered = state !== \'todo\' (has a real intent); completed = state === \'done\'. coverageRatio=100% only means every check is planned, not finished — completionRatio must be checked too.',
    parameters: {},
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        files: { type: 'object', additionalProperties: true, properties: {} },
        checks: { type: 'object', additionalProperties: true, properties: {} },
        incidentalFindings: { type: 'array', required: true, items: { type: 'string' } },
      } },
      render: (_a, v) => {
        const view = v as unknown as CoverageView
        return [{ type: 'text', text: `Files: ${view.files.touched}/${view.files.inScope} touched (${Math.round(view.files.ratio * 100)}%). Checks: ${view.checks.covered}/${view.checks.total} covered, ${view.checks.completed}/${view.checks.total} completed (blocked ${view.checks.blocked}, running ${view.checks.running}, planned ${view.checks.planned}, todo ${view.checks.todo}).` }]
      },
    },
    presentResult: (_args, result) => titledCard('审计覆盖率', result),
    execute: async (_args, exec) => {
      const sessionId = sessionIdOf(exec)
      // coverageOf(...) itself is a pure function over the session snapshot
      // (coverage.ts); wiring the store's sessionData() into it belongs to
      // the plugin apply() layer (index.ts), not this tool module.
      return store.coverage(sessionId) as never
    },
  }))

  ctx.tools.register(defineTool({
    name: 'sast_report',
    description: 'Generate the final report for this session: format markdown (default) or sarif (ADR-09). Markdown includes header metadata, audit summary with real elapsed time, methodology/check coverage, vulnerability detail with numbered codePath chains, excluded findings, code assets, and the audit chain timeline. SARIF maps finding→result, codePath→codeFlows, cwe→taxa, severity→level, and false-positive→suppressions (kept in results, not dropped). The report is also persisted to disk as a durable report_artifacts row (content digest + byte count); artifactId/uri/sha256/bytes identify that copy. Call this when the audit is done.',
    parameters: {
      format: { type: 'string', enum: REPORT_FORMATS, description: 'Report format (default markdown).' },
    },
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        markdown: { type: 'string' },
        sarif: { type: 'object', additionalProperties: true, properties: {} },
        artifactId: { type: 'string', required: true },
        uri: { type: 'string', required: true },
        sha256: { type: 'string', required: true },
        bytes: { type: 'number', required: true },
      } },
      render: (_a, v) => [{ type: 'text', text: v.markdown ?? JSON.stringify(v.sarif) }],
    },
    presentResult: (_args, result) => titledCard('白盒审计报告', result),
    execute: async (args, exec) => {
      const sessionId = sessionIdOf(exec)
      const format = (args.format as typeof REPORT_FORMATS[number] | undefined) ?? 'markdown'
      const lineage = batchLineageOf(ctx, sessionId)
      const state = await store.view(sessionId)
      // buildSarif's return type is far richer than the schema's permissive
      // JSON object type; the runtime value round-trips fine and the render
      // above stringifies it.
      if (format === 'sarif') {
        const sarif = buildSarif(state)
        const written = await writeArtifact({
          root: reportRoot, sessionId, kind: 'repo-sarif', content: JSON.stringify(sarif, null, 2),
          ...(lineage !== undefined ? { batchId: lineage.batchId, jobId: lineage.jobId } : {}),
        })
        const artifact = await store.putReportArtifact(written)
        return { sarif, artifactId: artifact.id, uri: artifact.uri, sha256: artifact.sha256, bytes: artifact.bytes } as never
      }
      const coverage = await store.coverage(sessionId)
      const markdown = buildReport(state, coverage)
      const written = await writeArtifact({
        root: reportRoot, sessionId, kind: 'repo-markdown', content: markdown,
        ...(lineage !== undefined ? { batchId: lineage.batchId, jobId: lineage.jobId } : {}),
      })
      const artifact = await store.putReportArtifact(written)
      return { markdown, artifactId: artifact.id, uri: artifact.uri, sha256: artifact.sha256, bytes: artifact.bytes }
    },
  }))
}
