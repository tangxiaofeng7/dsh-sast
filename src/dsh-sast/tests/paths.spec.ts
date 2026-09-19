/**
 * @module
 */

import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { clampLine, normalizeRepoPath, requireExistingFile } from '../src/paths.ts'

describe('normalizeRepoPath', () => {
  it('converts backslashes to forward slashes', () => {
    expect(normalizeRepoPath('src\\index.ts')).toBe('src/index.ts')
  })

  it('strips a leading ./', () => {
    expect(normalizeRepoPath('./src/index.ts')).toBe('src/index.ts')
  })

  it('collapses repeated slashes', () => {
    expect(normalizeRepoPath('src//utils///index.ts')).toBe('src/utils/index.ts')
  })

  it('strips a single trailing slash', () => {
    expect(normalizeRepoPath('src/utils/')).toBe('src/utils')
  })

  it('rejects an empty path', () => {
    expect(() => normalizeRepoPath('')).toThrow('is not a valid repo-relative path')
  })

  it('rejects the bare current-directory marker', () => {
    expect(() => normalizeRepoPath('.')).toThrow('is not a valid repo-relative path')
  })

  it('rejects a POSIX absolute path', () => {
    expect(() => normalizeRepoPath('/etc/passwd')).toThrow('is not a valid repo-relative path')
  })

  it('rejects a drive-letter absolute path', () => {
    expect(() => normalizeRepoPath('C:/Windows/System32')).toThrow('is not a valid repo-relative path')
  })

  it('rejects a .. workspace-escape segment', () => {
    expect(() => normalizeRepoPath('../secret.txt')).toThrow('is not a valid repo-relative path')
  })

  it('rejects a .. segment buried in the middle of the path', () => {
    expect(() => normalizeRepoPath('src/../../secret.txt')).toThrow('is not a valid repo-relative path')
  })
})

describe('requireExistingFile', () => {
  let workspacePath: string

  beforeEach(() => {
    workspacePath = mkdtempSync(join(tmpdir(), 'sast-paths-'))
    mkdirSync(join(workspacePath, 'src'))
    writeFileSync(join(workspacePath, 'src', 'index.ts'), 'export const x = 1\n')
    mkdirSync(join(workspacePath, 'src', 'utils'))
  })

  afterEach(() => {
    rmSync(workspacePath, { recursive: true, force: true })
  })

  it('accepts an existing file', () => {
    expect(() => requireExistingFile(workspacePath, 'src/index.ts', 'file')).not.toThrow()
  })

  it('accepts an existing directory as a module', () => {
    expect(() => requireExistingFile(workspacePath, 'src/utils', 'module')).not.toThrow()
  })

  it('rejects a missing file with the exact ADR-03 error text', () => {
    expect(() => requireExistingFile(workspacePath, 'src/missing.ts', 'file'))
      .toThrow('sast: path src/missing.ts does not exist in the scan workspace; only cite files you actually read')
  })

  it('rejects a missing module', () => {
    expect(() => requireExistingFile(workspacePath, 'src/missing-dir', 'module'))
      .toThrow('sast: path src/missing-dir does not exist in the scan workspace; only cite files you actually read')
  })

  it('rejects a directory cited as a file', () => {
    expect(() => requireExistingFile(workspacePath, 'src/utils', 'file'))
      .toThrow('does not exist in the scan workspace')
  })

  it('rejects a file cited as a module', () => {
    expect(() => requireExistingFile(workspacePath, 'src/index.ts', 'module'))
      .toThrow('does not exist in the scan workspace')
  })

  it('rejects a workspace-escaping path even if the target happens to exist on disk', () => {
    expect(() => requireExistingFile(workspacePath, '../index.ts', 'file'))
      .toThrow('is not a valid repo-relative path')
  })

  it('rejects a symlink to a real file inside the workspace', () => {
    symlinkSync(join(workspacePath, 'src', 'index.ts'), join(workspacePath, 'src', 'link.ts'))
    expect(() => requireExistingFile(workspacePath, 'src/link.ts', 'file'))
      .toThrow('sast: path src/link.ts does not exist in the scan workspace; only cite files you actually read')
  })

  it('rejects a symlink that escapes the workspace even if its target exists outside', () => {
    const outsideDir = mkdtempSync(join(tmpdir(), 'sast-outside-'))
    const outsideFile = join(outsideDir, 'secret.txt')
    writeFileSync(outsideFile, 'secret\n')
    symlinkSync(outsideFile, join(workspacePath, 'src', 'escape.ts'))
    try {
      expect(() => requireExistingFile(workspacePath, 'src/escape.ts', 'file'))
        .toThrow('sast: path src/escape.ts does not exist in the scan workspace; only cite files you actually read')
    } finally {
      rmSync(outsideDir, { recursive: true, force: true })
    }
  })
})

describe('clampLine', () => {
  let workspacePath: string

  beforeEach(() => {
    workspacePath = mkdtempSync(join(tmpdir(), 'sast-paths-'))
    writeFileSync(join(workspacePath, 'small.ts'), 'line1\nline2\nline3\n')
  })

  afterEach(() => {
    rmSync(workspacePath, { recursive: true, force: true })
  })

  it('treats line 0 as whole-file level and never adjusts it', () => {
    expect(clampLine(workspacePath, 'small.ts', 0)).toEqual({ line: 0, lineAdjusted: false })
  })

  it('treats a negative line the same as 0', () => {
    expect(clampLine(workspacePath, 'small.ts', -5)).toEqual({ line: 0, lineAdjusted: false })
  })

  it('passes through an in-range line unchanged', () => {
    expect(clampLine(workspacePath, 'small.ts', 2)).toEqual({ line: 2, lineAdjusted: false })
  })

  it('clamps a line beyond the file end and flags the adjustment', () => {
    expect(clampLine(workspacePath, 'small.ts', 99)).toEqual({ line: 3, lineAdjusted: true })
  })

  it('clamps to the exact last line without flagging it', () => {
    expect(clampLine(workspacePath, 'small.ts', 3)).toEqual({ line: 3, lineAdjusted: false })
  })

  it('does not fail when the file cannot be read, returning the line unadjusted', () => {
    expect(clampLine(workspacePath, 'missing.ts', 42)).toEqual({ line: 42, lineAdjusted: false })
  })
})
