/**
 * @module
 */

import { chmodSync, mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { hardenWorkspaceReadOnly } from '../../src/ingest/sandbox.ts'

let workspacePath: string

beforeEach(() => {
  workspacePath = mkdtempSync(join(tmpdir(), 'sast-sandbox-'))
  mkdirSync(join(workspacePath, 'src'), { recursive: true })
  writeFileSync(join(workspacePath, 'src', 'a.ts'), 'export const a = 1\n')
  writeFileSync(join(workspacePath, 'README.md'), 'hello\n')
})

afterEach(() => {
  // Restore write permission before cleanup so rmSync can actually delete.
  chmodSync(join(workspacePath, 'src'), 0o700)
  chmodSync(join(workspacePath, 'src', 'a.ts'), 0o600)
  chmodSync(join(workspacePath, 'README.md'), 0o600)
  chmodSync(workspacePath, 0o700)
  rmSync(workspacePath, { recursive: true, force: true })
})

describe('hardenWorkspaceReadOnly', () => {
  it('strips write bits from every file, subdirectory, and the root, recursively', async () => {
    await hardenWorkspaceReadOnly(workspacePath)
    const rootMode = statSync(workspacePath).mode & 0o777
    const dirMode = statSync(join(workspacePath, 'src')).mode & 0o777
    const fileMode = statSync(join(workspacePath, 'src', 'a.ts')).mode & 0o777
    const readmeMode = statSync(join(workspacePath, 'README.md')).mode & 0o777
    expect(rootMode & 0o222).toBe(0)
    expect(dirMode & 0o222).toBe(0)
    expect(fileMode & 0o222).toBe(0)
    expect(readmeMode & 0o222).toBe(0)
    // Read/execute bits survive.
    expect(fileMode & 0o444).not.toBe(0)
  })
})
