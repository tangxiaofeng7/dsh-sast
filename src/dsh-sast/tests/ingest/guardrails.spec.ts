/**
 * @module
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { checkGuardrails, type GuardrailLimits } from '../../src/ingest/guardrails.ts'

let workspacePath: string

beforeEach(() => {
  workspacePath = mkdtempSync(join(tmpdir(), 'sast-guardrails-'))
})

afterEach(() => {
  rmSync(workspacePath, { recursive: true, force: true })
})

describe('checkGuardrails', () => {
  it('counts files and total bytes under the default limits', async () => {
    writeFileSync(join(workspacePath, 'a.ts'), 'x'.repeat(100))
    writeFileSync(join(workspacePath, 'b.ts'), 'y'.repeat(200))
    const result = await checkGuardrails(workspacePath)
    expect(result).toEqual({ fileCount: 2, totalBytes: 300 })
  })

  it('ignores .git metadata', async () => {
    mkdirSync(join(workspacePath, '.git'), { recursive: true })
    writeFileSync(join(workspacePath, '.git', 'HEAD'), 'ref: refs/heads/main\n')
    writeFileSync(join(workspacePath, 'a.ts'), 'x')
    const result = await checkGuardrails(workspacePath)
    expect(result.fileCount).toBe(1)
  })

  it('rejects a repository exceeding the file-count limit', async () => {
    for (let i = 0; i < 5; i++) writeFileSync(join(workspacePath, `f${i}.ts`), 'x')
    const limits: GuardrailLimits = { maxFiles: 3, maxTotalBytes: 1024 * 1024 }
    await expect(checkGuardrails(workspacePath, limits)).rejects.toThrow(/exceeds the 3-file/)
  })

  it('rejects a repository exceeding the byte-size limit', async () => {
    writeFileSync(join(workspacePath, 'big.bin'), 'x'.repeat(1000))
    const limits: GuardrailLimits = { maxFiles: 1000, maxTotalBytes: 500 }
    await expect(checkGuardrails(workspacePath, limits)).rejects.toThrow(/exceeds the 0MB/)
  })

  it('recurses into nested directories', async () => {
    mkdirSync(join(workspacePath, 'src', 'nested'), { recursive: true })
    writeFileSync(join(workspacePath, 'src', 'nested', 'deep.ts'), 'z'.repeat(50))
    const result = await checkGuardrails(workspacePath)
    expect(result).toEqual({ fileCount: 1, totalBytes: 50 })
  })
})
