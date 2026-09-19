/**
 * @module
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { collectRepoMetadata } from '../../src/ingest/metadata.ts'

let workspacePath: string

beforeEach(() => {
  workspacePath = mkdtempSync(join(tmpdir(), 'sast-metadata-'))
})

afterEach(() => {
  rmSync(workspacePath, { recursive: true, force: true })
})

describe('collectRepoMetadata', () => {
  it('detects the dominant language by file count, most-prevalent first', async () => {
    mkdirSync(join(workspacePath, 'src'))
    for (let i = 0; i < 3; i++) writeFileSync(join(workspacePath, 'src', `f${i}.java`), 'class X {}')
    writeFileSync(join(workspacePath, 'src', 'g.py'), 'x = 1')
    const meta = await collectRepoMetadata(workspacePath)
    expect(meta.languages).toEqual(['java', 'python'])
  })

  it('finds a dependency manifest at the root', async () => {
    writeFileSync(join(workspacePath, 'package.json'), '{}')
    const meta = await collectRepoMetadata(workspacePath)
    expect(meta.dependencyManifests).toEqual(['package.json'])
  })

  it('finds an entrypoint hint nested in a subdirectory, with a repo-relative path', async () => {
    mkdirSync(join(workspacePath, 'src'))
    writeFileSync(join(workspacePath, 'src', 'main.py'), 'if __name__ == "__main__": pass')
    const meta = await collectRepoMetadata(workspacePath)
    expect(meta.entrypointHints).toEqual([join('src', 'main.py')])
  })

  it('ignores node_modules and other noisy directories', async () => {
    mkdirSync(join(workspacePath, 'node_modules', 'dep'), { recursive: true })
    writeFileSync(join(workspacePath, 'node_modules', 'dep', 'index.js'), 'module.exports = {}')
    writeFileSync(join(workspacePath, 'index.js'), 'console.log(1)')
    const meta = await collectRepoMetadata(workspacePath)
    expect(meta.fileCount).toBe(1)
  })

  it('reports zero languages/manifests/hints for an empty repository', async () => {
    const meta = await collectRepoMetadata(workspacePath)
    expect(meta).toEqual({ languages: [], dependencyManifests: [], entrypointHints: [], fileCount: 0 })
  })
})
