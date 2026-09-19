/**
 * Git credential handling for repository ingest (ADR-07): the configured
 * environment-variable NAME is resolved to its value only at clone time, and
 * only ever reaches the git subprocess through a `GIT_ASKPASS` helper script
 * plus an environment variable — never argv, never `.git/config`, never a
 * log line. The helper script's own body contains no secret, only an `echo`
 * of the environment variable name.
 * @module @tangxiaofeng7/dsh-sast-host/src/ingest/credentials
 */

import { chmod, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/** One prepared credential handle: env vars to set on the clone subprocess, plus a cleanup. */
export interface CredentialHandle {
  readonly env: Record<string, string>
  readonly cleanup: () => Promise<void>
}

/** The environment variable the GIT_ASKPASS helper script echoes; never the token's own env var name directly, so the helper script text never needs to change per-provider. */
const ASKPASS_TOKEN_VAR = 'SAST_GIT_TOKEN'

/**
 * Resolve `tokenEnvVar`'s value from `process.env` (never store the value
 * itself in config — only the variable NAME is configuration) and prepare a
 * one-time `GIT_ASKPASS` helper script plus the environment git needs to use
 * it. When the variable is unset or empty, returns a handle with no
 * credential env at all (anonymous clone) rather than failing — the caller
 * (clone.ts) surfaces git's own authentication failure if the repo actually
 * needs one.
 */
export async function prepareCredentials(tokenEnvVar: string | undefined): Promise<CredentialHandle> {
  const token = tokenEnvVar === undefined ? undefined : process.env[tokenEnvVar]
  if (token === undefined || token === '') {
    return { env: { GIT_TERMINAL_PROMPT: '0' }, cleanup: async () => {} }
  }
  const dir = await mkdtemp(join(tmpdir(), 'sast-askpass-'))
  const scriptPath = join(dir, process.platform === 'win32' ? 'askpass.cmd' : 'askpass.sh')
  const scriptBody = process.platform === 'win32'
    ? `@echo %${ASKPASS_TOKEN_VAR}%\r\n`
    : `#!/bin/sh\necho "$${ASKPASS_TOKEN_VAR}"\n`
  await writeFile(scriptPath, scriptBody, 'utf8')
  if (process.platform !== 'win32') await chmod(scriptPath, 0o700)
  return {
    env: {
      GIT_TERMINAL_PROMPT: '0',
      GIT_ASKPASS: scriptPath,
      [ASKPASS_TOKEN_VAR]: token,
    },
    cleanup: async () => {
      await rm(dir, { recursive: true, force: true })
    },
  }
}
