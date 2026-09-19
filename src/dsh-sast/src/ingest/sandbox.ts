/**
 * Read-only workspace hardening (ADR-13): after a clone (or validating a
 * local path), remove write permission from every file and directory so the
 * audited code cannot be modified by anything running against that path —
 * defense in depth alongside "no shell" (ADR-04).
 * @module @tangxiaofeng7/dsh-sast-host/src/ingest/sandbox
 */

import { chmod, readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'

/** POSIX mode with every write bit cleared, read/execute bits kept. */
function withoutWriteBits(mode: number): number {
  return mode & ~0o222
}

/**
 * Recursively strip write permission from every entry under `workspacePath`
 * (POSIX `chmod -R a-w`; Windows write-ACL removal is not implemented here —
 * `dsh` deployments targeting Windows must layer an OS-level ACL step, since
 * Node's `fs.chmod` on Windows only toggles the read-only attribute for
 * files, not directories, and does not model ACL inheritance).
 */
export async function hardenWorkspaceReadOnly(workspacePath: string): Promise<void> {
  const entries = await readdir(workspacePath, { withFileTypes: true })
  for (const entry of entries) {
    const entryPath = join(workspacePath, entry.name)
    if (entry.isSymbolicLink()) continue
    if (entry.isDirectory()) await hardenWorkspaceReadOnly(entryPath)
    const current = await stat(entryPath)
    await chmod(entryPath, withoutWriteBits(current.mode))
  }
  const rootStat = await stat(workspacePath)
  await chmod(workspacePath, withoutWriteBits(rootStat.mode))
}
