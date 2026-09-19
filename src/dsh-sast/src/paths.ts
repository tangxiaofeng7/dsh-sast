/**
 * Path hardening for white-box audit records (ADR-03): every `fact.path`,
 * `finding.codePath[].path`, and file/module `asset.value` written into the
 * durable store must be a repo-relative path that actually exists inside the
 * scan workspace. This module is a pure, store-independent boundary check —
 * it never touches the domain, so it can be unit tested against a fixture
 * directory alone.
 * @module @tangxiaofeng7/dsh-sast-host/src/paths
 */

import { lstatSync, readFileSync, statSync } from 'node:fs'
import { resolve, sep } from 'node:path'

/** Kind of filesystem entry a path is expected to resolve to. */
export type PathKind = 'file' | 'module'

/**
 * Normalize a repo-relative path: backslashes become forward slashes, a
 * leading `./` is stripped, and repeated `/` are collapsed. Rejects absolute
 * paths (POSIX or `C:`-style), and any `..` segment (workspace escape).
 * Throws `sast: path <p> is not a valid repo-relative path` on rejection.
 */
export function normalizeRepoPath(raw: string): string {
  const slashed = raw.replaceAll('\\', '/')
  const collapsed = slashed.replace(/\/+/g, '/')
  const stripped = collapsed.startsWith('./') ? collapsed.slice(2) : collapsed
  const trimmed = stripped.endsWith('/') && stripped.length > 1 ? stripped.slice(0, -1) : stripped
  if (trimmed === '' || trimmed === '.') {
    throw new Error(`sast: path ${raw} is not a valid repo-relative path`)
  }
  if (trimmed.startsWith('/') || /^[A-Za-z]:/.test(trimmed)) {
    throw new Error(`sast: path ${raw} is not a valid repo-relative path`)
  }
  if (trimmed.split('/').some(segment => segment === '..')) {
    throw new Error(`sast: path ${raw} is not a valid repo-relative path`)
  }
  return trimmed
}

/**
 * Require that `path` (already normalized) exists inside `workspacePath` as
 * the requested kind: `file` must be a regular file, not a symlink (checked
 * via `lstatSync` so a symlink is rejected even if its target is a real file
 * inside the workspace); `module` must be a directory. Throws the exact
 * ADR-03 error text on failure so every caller (fact/finding/asset/
 * submission) surfaces the same guidance.
 */
export function requireExistingFile(workspacePath: string, path: string, kind: PathKind): void {
  const normalized = normalizeRepoPath(path)
  const absolute = resolve(workspacePath, normalized)
  const fail: () => never = () => {
    throw new Error(`sast: path ${path} does not exist in the scan workspace; only cite files you actually read`)
  }
  if (absolute !== workspacePath && !absolute.startsWith(workspacePath + sep)) {
    fail()
  }
  let lstat
  try {
    lstat = lstatSync(absolute, { throwIfNoEntry: false })
  } catch {
    lstat = undefined
  }
  if (lstat === undefined) fail()
  if (kind === 'file' && lstat.isSymbolicLink()) fail()
  let stat
  try {
    stat = statSync(absolute, { throwIfNoEntry: false })
  } catch {
    stat = undefined
  }
  if (stat === undefined) fail()
  if (kind === 'module') {
    if (!stat.isDirectory()) fail()
    return
  }
  if (!stat.isFile()) fail()
}

/**
 * Soft-clamp a cited line number to the file's actual line count. `line: 0`
 * is always legal (whole-file level) and never adjusted. A line beyond the
 * file's last line is clamped to that last line with `lineAdjusted: true`
 * rather than rejected (ADR-03).
 */
export function clampLine(workspacePath: string, path: string, line: number): { line: number; lineAdjusted: boolean } {
  if (line <= 0) return { line: 0, lineAdjusted: false }
  const normalized = normalizeRepoPath(path)
  const absolute = resolve(workspacePath, normalized)
  let contents: string
  try {
    contents = readFileSync(absolute, 'utf8')
  } catch {
    return { line, lineAdjusted: false }
  }
  const withoutTrailingNewline = contents.endsWith('\n') ? contents.slice(0, -1) : contents
  const lineCount = withoutTrailingNewline.length === 0 ? 1 : withoutTrailingNewline.split('\n').length
  if (line > lineCount) return { line: lineCount, lineAdjusted: true }
  return { line, lineAdjusted: false }
}
