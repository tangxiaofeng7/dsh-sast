/**
 * Repository URL parsing and redaction (ADR-07): pure functions, no
 * filesystem or network access, so they can be unit tested with fixture
 * strings alone.
 * @module @tangxiaofeng7/dsh-sast-host/src/ingest/url
 */

import type { SastProvider } from '../spec.ts'

/** Parsed shape of a GitLab/GitHub repository URL. */
export interface ParsedRepoUrl {
  readonly provider: SastProvider
  readonly host: string
  /** GitLab-style group/subgroup path (may be empty for GitHub). */
  readonly namespace: string
  readonly project: string
  /** Redacted URL suitable for storage, returns, logs, and reports. */
  readonly redacted: string
}

/** Query parameters known to carry credentials; stripped before storage (ADR-07). */
const CREDENTIAL_QUERY_PARAMS = ['private_token', 'access_token', 'token']

/**
 * Strip userinfo (`user:pass@`) and credential query parameters from a URL,
 * returning the URL unchanged if it isn't parseable as one (e.g. a bare
 * `git@host:path` SSH form, which carries no userinfo to strip).
 */
export function redactUrl(raw: string): string {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return raw
  }
  url.username = ''
  url.password = ''
  for (const param of CREDENTIAL_QUERY_PARAMS) url.searchParams.delete(param)
  return url.toString()
}

/**
 * Parse a GitLab/GitHub HTTPS repository URL into its provider, host,
 * namespace, and project, along with a redacted copy for storage. Throws a
 * guiding error when the URL cannot be parsed or infers no host.
 */
export function parseRepoUrl(raw: string): ParsedRepoUrl {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw new Error(`sast: repoUrl ${raw} is not a valid URL`)
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error(`sast: repoUrl ${raw} must use http(s); other protocols are not supported`)
  }
  const path = url.pathname.replace(/^\/+/, '').replace(/\.git$/, '').replace(/\/+$/, '')
  if (path === '') {
    throw new Error(`sast: repoUrl ${raw} has no repository path`)
  }
  const segments = path.split('/')
  const project = segments.at(-1)!
  const namespace = segments.slice(0, -1).join('/')
  const provider: SastProvider = url.hostname === 'github.com' ? 'github' : 'gitlab'
  return { provider, host: url.hostname, namespace, project, redacted: redactUrl(raw) }
}
