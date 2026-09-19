/**
 * @module
 */

import { readFile } from 'node:fs/promises'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { prepareCredentials } from '../../src/ingest/credentials.ts'

const ENV_VAR = 'SAST_TEST_TOKEN_VAR'

describe('prepareCredentials', () => {
  beforeEach(() => {
    delete process.env[ENV_VAR]
  })

  afterEach(() => {
    delete process.env[ENV_VAR]
  })

  it('returns anonymous env (no GIT_ASKPASS) when the configured env var is unset', async () => {
    const handle = await prepareCredentials(ENV_VAR)
    expect(handle.env.GIT_ASKPASS).toBeUndefined()
    expect(handle.env.GIT_TERMINAL_PROMPT).toBe('0')
    await handle.cleanup()
  })

  it('returns anonymous env when no env var name is configured at all', async () => {
    const handle = await prepareCredentials(undefined)
    expect(handle.env.GIT_ASKPASS).toBeUndefined()
    await handle.cleanup()
  })

  it('writes a helper script that echoes the token via env, never embedding the token value in the script text', async () => {
    process.env[ENV_VAR] = 'super-secret-token'
    const handle = await prepareCredentials(ENV_VAR)
    expect(handle.env.GIT_ASKPASS).toBeDefined()
    expect(handle.env.SAST_GIT_TOKEN).toBe('super-secret-token')
    const scriptBody = await readFile(handle.env.GIT_ASKPASS!, 'utf8')
    expect(scriptBody).not.toContain('super-secret-token')
    expect(scriptBody).toContain('SAST_GIT_TOKEN')
    await handle.cleanup()
  })

  it('cleanup removes the helper script directory', async () => {
    process.env[ENV_VAR] = 'super-secret-token'
    const handle = await prepareCredentials(ENV_VAR)
    const scriptPath = handle.env.GIT_ASKPASS!
    await expect(readFile(scriptPath, 'utf8')).resolves.toBeDefined()
    await handle.cleanup()
    await expect(readFile(scriptPath, 'utf8')).rejects.toThrow()
  })

  it('treats an empty-string token value the same as unset', async () => {
    process.env[ENV_VAR] = ''
    const handle = await prepareCredentials(ENV_VAR)
    expect(handle.env.GIT_ASKPASS).toBeUndefined()
    await handle.cleanup()
  })
})
