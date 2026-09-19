/**
 * Repository size/file-count guardrails: must run BEFORE `store.initScan()`
 * writes the `scan-1` row (write-then-clear ordering) so a repo exceeding
 * the limit never leaves a partial scan — the caller cleans up the
 * workspace and reports an actionable error, and any prior scan (if this
 * was meant to reset one) stays intact.
 * @module @tangxiaofeng7/dsh-sast-host/src/ingest/guardrails
 */

import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'

/** Guardrail thresholds; conservative defaults sized for a single-session audit scope. */
export interface GuardrailLimits {
  readonly maxFiles: number
  readonly maxTotalBytes: number
}

export const DEFAULT_GUARDRAIL_LIMITS: GuardrailLimits = {
  maxFiles: 50_000,
  maxTotalBytes: 2 * 1024 * 1024 * 1024, // 2 GiB
}

/** Directories never counted toward the file/byte guardrails (version-control metadata only). */
const IGNORED_DIR_NAMES = new Set(['.git'])

/** Walk-result of the guardrail scan. */
export interface GuardrailScan {
  readonly fileCount: number
  readonly totalBytes: number
}

/**
 * Walk `workspacePath` counting regular files and their total size,
 * stopping early and throwing as soon as either limit is exceeded — a huge
 * monorepo must fail fast, not after a full slow walk.
 */
export async function checkGuardrails(workspacePath: string, limits: GuardrailLimits = DEFAULT_GUARDRAIL_LIMITS): Promise<GuardrailScan> {
  let fileCount = 0
  let totalBytes = 0

  async function walk(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory() && IGNORED_DIR_NAMES.has(entry.name)) continue
      const entryPath = join(dir, entry.name)
      if (entry.isSymbolicLink()) continue
      if (entry.isDirectory()) {
        await walk(entryPath)
        continue
      }
      if (!entry.isFile()) continue
      fileCount += 1
      if (fileCount > limits.maxFiles) {
        throw new Error(`sast: repository exceeds the ${limits.maxFiles}-file audit scope limit; narrow the scan scope or split the repository`)
      }
      totalBytes += (await stat(entryPath)).size
      if (totalBytes > limits.maxTotalBytes) {
        throw new Error(`sast: repository exceeds the ${Math.floor(limits.maxTotalBytes / (1024 * 1024))}MB audit scope limit; narrow the scan scope or split the repository`)
      }
    }
  }

  await walk(workspacePath)
  return { fileCount, totalBytes }
}
