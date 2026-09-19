/**
 * Package-owned invariant companion for `@tangxiaofeng7/dsh-sast-host`: every sast
 * write must honor the audit-graph discipline — records carry the session id
 * of an existing scan row, and every edge references source/target nodes of
 * the exact kinds its kind demands, all within one session. The store
 * enforces the same rules at its write boundary, so a violation here means a
 * write path bypassed the store or landed a torn record.
 *
 * Not loaded in production — mounted only by `invariant.spec.ts` to
 * independently re-verify the store's own referential discipline.
 * @module @tangxiaofeng7/dsh-sast-host/invariant
 */

import type { Context } from '@deepseek-ai/cordis'
import type { InvariantFailure, InvariantInstaller } from '@deepseek-ai/dsh-invariants'
import type { DomainChanged } from '@deepseek-ai/dsh-storage-domain'
import type { SastEdgeKind } from './spec.ts'
import type {} from '@deepseek-ai/dsh-storage'

const PACKAGE_NAME = '@tangxiaofeng7/dsh-sast'
const DOMAIN_NAME = 'sast'

/** Tables whose records must reference an existing scan row of the session. */
const SCAN_OWNED_TABLES = ['intents', 'facts', 'findings', 'assets', 'edges'] as const

/** A lowercase hex-encoded SHA-256 digest: exactly 64 hex characters. */
const SHA256_HEX_RE = /^[0-9a-f]{64}$/

/** The source table an edge kind anchors on (validated for the same session). */
const SOURCE_TABLE_OF_EDGE: Record<SastEdgeKind, 'scans' | 'intents' | 'facts' | 'assets'> = {
  spawns: 'scans',
  yields: 'intents',
  derived_from: 'facts',
  proves: 'intents',
  flows_to: 'facts',
  parent: 'assets',
}

/** The target table an edge kind points at. */
const TARGET_TABLE_OF_EDGE: Record<SastEdgeKind, 'intents' | 'facts' | 'findings' | 'assets'> = {
  spawns: 'intents',
  yields: 'facts',
  derived_from: 'intents',
  proves: 'findings',
  flows_to: 'facts',
  parent: 'assets',
}

/** Cordis companion plugin name. */
export const name = 'sast-invariant'
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants']

/** Install the audit-graph checks against the open sast domain. */
const install: InvariantInstaller = Object.assign((ctx: Context, fail: InvariantFailure) => {
  ctx.on('domain/changed', (change: DomainChanged) => {
    if (change.domain !== DOMAIN_NAME || change.operation !== 'put') return
    const domain = ctx.storage.form('domain').get(DOMAIN_NAME)
    if (domain === undefined) {
      return fail(`domain/changed for '${DOMAIN_NAME}' emitted while that domain is not open`)
    }
    if (change.table === 'scans') {
      const scan = change.value as { readonly sessionId: string }
      if (scan.sessionId !== change.key) {
        return fail(`scans row key '${change.key}' does not match its sessionId`)
      }
      return
    }
    if (change.table === 'report_artifacts') {
      const artifact = change.value as { readonly id: string; readonly sha256: string; readonly bytes: number }
      if (artifact.id !== change.key) {
        return fail(`report_artifacts row key '${change.key}' does not match its id`)
      }
      if (!SHA256_HEX_RE.test(artifact.sha256)) {
        return fail(`report_artifacts['${change.key}'].sha256 '${artifact.sha256}' is not a lowercase hex SHA-256 digest`)
      }
      if (!Number.isInteger(artifact.bytes) || artifact.bytes < 0) {
        return fail(`report_artifacts['${change.key}'].bytes ${artifact.bytes} is not a non-negative integer`)
      }
      return
    }
    if (!SCAN_OWNED_TABLES.includes(change.table as typeof SCAN_OWNED_TABLES[number])) return
    const record = change.value as { readonly sessionId: string }
    const scan = [...domain.table('scans').entries()].find(([, row]) =>
      (row as { readonly sessionId?: string }).sessionId === record.sessionId)
    if (scan === undefined) {
      return fail(`'${DOMAIN_NAME}'.'${change.table}'['${change.key}'] references unknown session '${record.sessionId}'`)
    }
    const sameSession = (tableName: 'scans' | 'intents' | 'facts' | 'findings' | 'assets', id: string): boolean => {
      if (tableName === 'scans') {
        return (scan[1] as { readonly id?: string }).id === id
      }
      const row = domain.table(tableName).get(id) as { readonly sessionId?: string } | undefined
      return row !== undefined && row.sessionId === record.sessionId
    }
    if (change.table === 'edges') {
      const edge = record as unknown as { readonly kind: SastEdgeKind; readonly sourceId: string; readonly targetId: string }
      if (!sameSession(SOURCE_TABLE_OF_EDGE[edge.kind], edge.sourceId)) {
        return fail(`'${DOMAIN_NAME}'.edges['${change.key}'] ${edge.kind} source '${edge.sourceId}' is not a same-session ${SOURCE_TABLE_OF_EDGE[edge.kind]} row`)
      }
      if (!sameSession(TARGET_TABLE_OF_EDGE[edge.kind], edge.targetId)) {
        return fail(`'${DOMAIN_NAME}'.edges['${change.key}'] ${edge.kind} target '${edge.targetId}' is not a same-session ${TARGET_TABLE_OF_EDGE[edge.kind]} row`)
      }
      return
    }
    if (change.table === 'findings') {
      const affectedAssetId = (record as { readonly affectedAssetId?: string }).affectedAssetId
      if (affectedAssetId !== undefined && !sameSession('assets', affectedAssetId)) {
        return fail(`'${DOMAIN_NAME}'.findings['${change.key}'] references unknown asset '${affectedAssetId}'`)
      }
    }
  }, { global: true })
}, { inject: ['storage'] })

/**
 * Register this package's invariant companion.
 * @param ctx - Cordis context carrying the invariant service.
 * @returns the installed registration's disposer after setup succeeds.
 */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
