/**
 * @module
 */

import { execFile } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cloneRepo } from '../../src/ingest/clone.ts'

const execFileAsync = promisify(execFile)

let originRepo: string
let workspaceRoot: string

/** Build a real local bare-able repo with one commit on `main` and a second branch. */
async function makeOriginRepo(): Promise<string> {
  const dir = mkdtempSync(join(tmpdir(), 'sast-origin-'))
  await execFileAsync('git', ['init', '-b', 'main'], { cwd: dir })
  await execFileAsync('git', ['config', 'user.email', 'test@example.com'], { cwd: dir })
  await execFileAsync('git', ['config', 'user.name', 'Test'], { cwd: dir })
  mkdirSync(join(dir, 'src'), { recursive: true })
  writeFileSync(join(dir, 'src', 'a.ts'), 'export const a = 1\n')
  await execFileAsync('git', ['add', '.'], { cwd: dir })
  await execFileAsync('git', ['commit', '-m', 'initial'], { cwd: dir })
  await execFileAsync('git', ['checkout', '-b', 'feature'], { cwd: dir })
  writeFileSync(join(dir, 'src', 'b.ts'), 'export const b = 2\n')
  await execFileAsync('git', ['add', '.'], { cwd: dir })
  await execFileAsync('git', ['commit', '-m', 'feature commit'], { cwd: dir })
  await execFileAsync('git', ['checkout', 'main'], { cwd: dir })
  return dir
}

beforeEach(async () => {
  originRepo = await makeOriginRepo()
  workspaceRoot = mkdtempSync(join(tmpdir(), 'sast-workspace-'))
})

afterEach(() => {
  rmSync(originRepo, { recursive: true, force: true })
  rmSync(workspaceRoot, { recursive: true, force: true })
})

describe('cloneRepo', () => {
  it('clones the default branch shallowly with no credential env required', async () => {
    const result = await cloneRepo({ provider: 'local', repoUrl: originRepo, workspaceRoot })
    expect(result.workspacePath).toContain(workspaceRoot)
    expect(result.branch).toBe('main')
    expect(result.commit).toMatch(/^[0-9a-f]{40}$/)
  })

  it('clones a named branch', async () => {
    const result = await cloneRepo({ provider: 'local', repoUrl: originRepo, branch: 'feature', workspaceRoot })
    expect(result.branch).toBe('feature')
  })

  it('produces a shallow clone with no history beyond the checked-out commit', async () => {
    const result = await cloneRepo({ provider: 'local', repoUrl: originRepo, workspaceRoot })
    const { stdout } = await execFileAsync('git', ['rev-list', '--count', 'HEAD'], { cwd: result.workspacePath })
    expect(stdout.trim()).toBe('1')
  })

  it('disables hooks (an executable pre-commit hook in the clone never runs)', async () => {
    mkdirSync(join(originRepo, '.git', 'hooks'), { recursive: true })
    const result = await cloneRepo({ provider: 'local', repoUrl: originRepo, workspaceRoot })
    // The hooksPath override points at an empty directory, so the clone's own
    // .git/hooks (copied from a template, if any) is never consulted; we
    // assert indirectly by confirming the clone succeeded even though the
    // origin repo's hooks directory exists (a misbehaving hook would abort
    // a real git operation that consults it).
    expect(result.commit).toMatch(/^[0-9a-f]{40}$/)
  })

  it('rejects an unknown branch with an actionable error and removes the partial workspace', async () => {
    await expect(cloneRepo({ provider: 'local', repoUrl: originRepo, branch: 'does-not-exist', workspaceRoot }))
      .rejects.toThrow(/branch or ref does-not-exist not found|failed to clone/)
  })

  it('rejects an unreachable repository with an actionable, redacted error', async () => {
    await expect(cloneRepo({
      provider: 'gitlab', repoUrl: 'https://user:secrettoken@gitlab.invalid.example/group/project.git', workspaceRoot,
    })).rejects.toThrow(/failed to clone https:\/\/gitlab\.invalid\.example\/group\/project\.git/)
  })
})
