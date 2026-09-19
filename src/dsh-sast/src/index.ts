/**
 * White-box audit mode for the DeepSeek Harness.
 *
 * A single plugin package that wires the durable `sast` storage domain, the
 * 14 model-facing single-repo `sast_*` tools (audit graph + methodology
 * Skills + assets + coverage + report), and the decision-agent protocol
 * prompt section. Compose it in a profile overlay together with a decision
 * agent persona, subagent delegation tools, goal continuation, ask-user, and
 * the storage hub (`dsh-storage`), backend (`dsh-storage-sqlite`), and
 * domain facility. Subagents return their structured output to the
 * repository worker (decision agent), which owns every `sast_*` record.
 *
 * The 4 batch-control tools and the durable multi-repo scheduler live in the
 * separate `sast-batch` plugin (`batch-plugin.ts`, built to
 * `lib/batch-scheduler.js`) so M5 stays independently composable/removable
 * from this M1-M4 surface — this plugin only registers the `sastBatch`
 * session-projection fold unconditionally (a no-op when `sast-batch` is not
 * composed) and provides its `SastStore` instance on `ctx.sastStore` so
 * `sast-batch` can share this exact open domain (`DomainFacility.open`
 * rejects a second open of the same name) rather than opening its own.
 * @module @tangxiaofeng7/dsh-sast-host
 */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-session-projection'
import type {} from '@deepseek-ai/dsh-system-prompt'
import { SAST_INSTRUCTIONS, SAST_SECTION_ORDER } from './instructions.ts'
import { applySastBatchEvent, sastBatchProjectionSchema, viewSastBatchState } from './batch/projection.ts'
import {
  applySastEvent,
  applySastMounted,
  sastInitialState,
  sastMountedSchema,
  sastProjectionSchema,
  viewSastState,
} from './projection.ts'
import { SastStore } from './store.ts'
import { registerSastTools } from './tools.ts'
import type { SastToolsConfig } from './tools.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Provided by this plugin so `sast-batch` (batch-plugin.ts) can share this exact open `sast` domain and report-artifact allocator instead of opening its own. Absent when only this plugin (no `sast-batch`) is composed. */
    sastStore?: SastStore
  }
}

export type { SastStateView } from './store.ts'
export type { SastToolsConfig } from './tools.ts'
export {
  sastAssetSchema,
  sastAssetTypeSchema,
  sastDomainSpec,
  sastEdgeKindSchema,
  sastEdgeSchema,
  sastFactKindSchema,
  sastFactSchema,
  sastFindingSchema,
  sastIntentSchema,
  sastScanSchema,
  sastSeveritySchema,
  sastSkillSchema,
} from './spec.ts'
export type {
  SastAsset,
  SastAssetType,
  SastEdge,
  SastEdgeKind,
  SastFact,
  SastFactKind,
  SastFinding,
  SastIntent,
  SastProvider,
  SastScan,
  SastSeverity,
  SastSkill,
} from './spec.ts'

/** Plugin identity. */
export const name = 'sast'
/** Services required before the plugin can register tools and open the domain. */
export const inject = ['tools', 'storageDomain', 'sessions']

/**
 * Activate white-box audit mode on a context carrying the tool registry and
 * the storage-domain facility. The domain is opened lazily on first tool use
 * and closed when the plugin fiber is disposed.
 * @param ctx - registrant context.
 * @param config - env-var NAMEs for GitLab/GitHub tokens (ADR-07, never the
 * token values themselves) and the disposable clone workspace root.
 */
export function apply(ctx: Context, config: SastToolsConfig = {}): void {
  const store = new SastStore(ctx)
  ctx.effect(() => async () => {
    await store.dispose()
  }, 'sast.domainClose')
  // Provided for the sibling `sast-batch` plugin (batch-plugin.ts) to reuse
  // this exact open `sast` domain and the shared report_artifacts allocator
  // (`DomainFacility.open` rejects a second open of the same domain name,
  // and two independent id counters over one table can collide) — never
  // consumed by anything in this file itself.
  ctx.provide('sastStore', store)
  registerSastTools(ctx, store, config)
  ctx.inject(['sessionProjections'], (projectionCtx) => {
    // The unit child activates only when a projection registry is composed
    // (headless assemblies without the seam stay unaffected). Standing fold:
    // the audit graph rebuilt from the logged sast_* tool calls; null before
    // the first sast_start_scan of the session.
    projectionCtx.sessionProjections.register({
      key: 'sast',
      schema: sastProjectionSchema,
      stateSchema: sastProjectionSchema,
      init: () => sastInitialState,
      apply: applySastEvent,
      view: viewSastState,
      wire: {
        viewSchema: sastProjectionSchema,
        view: viewSastState,
      },
      stateVersion: 1,
    } as unknown as Parameters<typeof projectionCtx.sessionProjections.register>[0])
    // Companion marker unit: the per-session answer to "does this session's
    // composition mount the sast row", folded from the session's own log
    // (assembled request-header tools, logged calls, folded submissions) —
    // never from the preset name. The registration is host-wide like every
    // projection key, so only this per-session VALUE can gate a session-scoped
    // surface; see `sastMounted` in ./types.ts.
    projectionCtx.sessionProjections.register({
      key: 'sastMounted',
      schema: sastMountedSchema,
      stateSchema: sastMountedSchema,
      init: () => false,
      apply: applySastMounted,
      view: (mounted: boolean) => mounted,
      wire: {
        viewSchema: sastMountedSchema,
        view: (mounted: boolean) => mounted,
      },
      stateVersion: 1,
    } as unknown as Parameters<typeof projectionCtx.sessionProjections.register>[0])
    // The batch owner's own overview + Review Inbox state, folded from the
    // logged sast_batch_* tool calls (M6). Registration is unconditional
    // (same host-wide-key discipline as `sast`/`sastMounted` above) even
    // though the 4 batch tools are not yet composed by this plugin's
    // registerSastTools call (M5's DurableBatchScheduler still needs a real
    // RepositoryWorkerFactory, spike-D) — an unregistered tool simply never
    // fires the events this fold reacts to, so the projection value stays
    // `null` and this registration is a harmless no-op until that lands.
    projectionCtx.sessionProjections.register({
      key: 'sastBatch',
      schema: sastBatchProjectionSchema,
      stateSchema: sastBatchProjectionSchema,
      init: () => null,
      apply: applySastBatchEvent,
      view: viewSastBatchState,
      wire: {
        viewSchema: sastBatchProjectionSchema,
        view: viewSastBatchState,
      },
      stateVersion: 1,
    } as unknown as Parameters<typeof projectionCtx.sessionProjections.register>[0])
  })
  ctx.inject(['systemPrompt'], (scope) => {
    scope.systemPrompt.section({
      name: 'sast:protocol',
      order: SAST_SECTION_ORDER,
      text: () => SAST_INSTRUCTIONS,
    })
  })
}
