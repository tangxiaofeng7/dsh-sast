/**
 * Code permalink construction: `{ provider, repoUrl, commit } × { path,
 * line, endLine } → URL | undefined`, pure and store-independent so it can
 * be unit tested with fixture inputs alone.
 *
 * GitLab: `/-/blob/<commit>/<path>#L<line>`. GitHub: `/blob/<commit>/<path>#L<line>`.
 * `provider: 'local'` always returns `undefined` (no hosted view exists).
 * A missing/empty commit also returns `undefined` — a permalink pinned to
 * "no commit" is not a stable link.
 * @module @tangxiaofeng7/dsh-sast-client/permalink
 */

import type { SastProvider } from '@tangxiaofeng7/dsh-sast-host/client'

/** The minimal scan fields a permalink needs. */
export interface PermalinkScan {
  readonly provider: SastProvider
  readonly repoUrl: string
  readonly commit: string
}

/** The minimal code-location fields a permalink needs. */
export interface PermalinkLocation {
  readonly path: string
  readonly line?: number
  readonly endLine?: number
}

/** The line-range fragment: `#L<line>` or `#L<line>-L<endLine>` when both are given and distinct. */
function lineFragment(location: PermalinkLocation): string {
  if (location.line === undefined || location.line <= 0) return ''
  if (location.endLine !== undefined && location.endLine > location.line) {
    return `#L${location.line}-L${location.endLine}`
  }
  return `#L${location.line}`
}

/**
 * Build a permalink to one code location in the scanned repository, or
 * `undefined` when the provider has no hosted blob view (`local`) or the
 * scan has no resolved commit yet.
 */
export function permalinkOf(scan: PermalinkScan, location: PermalinkLocation): string | undefined {
  if (scan.commit === '') return undefined
  const base = scan.repoUrl.replace(/\/+$/, '').replace(/\.git$/, '')
  if (scan.provider === 'gitlab') return `${base}/-/blob/${scan.commit}/${location.path}${lineFragment(location)}`
  if (scan.provider === 'github') return `${base}/blob/${scan.commit}/${location.path}${lineFragment(location)}`
  return undefined
}
