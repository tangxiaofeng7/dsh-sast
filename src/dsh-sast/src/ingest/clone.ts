/**
 * Read-only shallow clone (ADR-04/ADR-13): fixed flags only — no history, no
 * hooks, no submodules — and no `depth` parameter exposed to the model (v1
 * has no git-history tool, so a deeper clone has no consumer). `provider:
 * 'local'` never reaches this module: `tools.ts` validates the given path
 * directly and skips cloning entirely.
 * @module @tangxiaofeng7/dsh-sast-host/src/ingest/clone
 */

import { execFile } from 'node:child_process'
import { mkdtemp, mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { promisify } from 'node:util'
import type { SastProvider } from '../spec.ts'
import { prepareCredentials } from './credentials.ts'
import { redactUrl } from './url.ts'

const execFileAsync = promisify(execFile)

/** Options for cloning one remote repository into a fresh scan workspace. */
export interface CloneInput {
  readonly provider: SastProvider
  /** The full https URL, credential-free (userinfo is stripped before this call). */
  readonly repoUrl: string
  readonly branch?: string
  readonly ref?: string
  readonly workspaceRoot: string
  /** Env var name whose value is the access token (never the value itself). */
  readonly tokenEnvVar?: string
}

/** Result of a successful clone: the workspace path git actually wrote into, plus the checked-out commit sha and branch. */
export interface CloneResult {
  readonly workspacePath: string
  readonly commit: string
  readonly branch: string
}

/** Classify a git failure by its stderr text into an actionable error, without ever echoing raw stderr (it may embed a token if credential redaction elsewhere ever slips). */
function classifyCloneError(stderr: string, redactedRepoUrl: string, ref: string | undefined): Error {
  const text = stderr.toLowerCase()
  if (text.includes('authentication failed') || text.includes('could not read username') || text.includes('403') || text.includes('401')) {
    return new Error(`sast: authentication failed cloning ${redactedRepoUrl}; check the configured token env var`)
  }
  if (ref !== undefined && (text.includes('couldn\'t find remote ref') || text.includes('not found in upstream'))) {
    return new Error(`sast: branch or ref ${ref} not found in ${redactedRepoUrl}`)
  }
  if (text.includes('command not found') || text.includes('is not recognized')) {
    return new Error('sast: git is not available in this environment')
  }
  return new Error(`sast: failed to clone ${redactedRepoUrl}: ${stderr.trim().slice(0, 500)}`)
}

/**
 * Clone one remote repository read-only into a fresh directory under
 * `workspaceRoot`. `--depth 1 --single-branch --no-tags`, hooks disabled via
 * an empty `core.hooksPath`, submodules never recursed. Credentials are
 * injected only via `GIT_ASKPASS` + env (never argv, never `.git/config`);
 * the credential helper is cleaned up in a `finally` that wraps only the
 * clone step itself. On any failure the partially written directory is
 * removed and no `scan` row may be written by the caller.
 */
export async function cloneRepo(input: CloneInput): Promise<CloneResult> {
  const workspacePath = await mktempWorkspace(input.workspaceRoot)
  const hooksDir = join(workspacePath, '..', `${basenameOf(workspacePath)}.hooks-empty`)
  await mkdir(hooksDir, { recursive: true })

  const credentials = await prepareCredentials(input.tokenEnvVar)
  try {
    const args = [
      'clone', '--depth', '1', '--single-branch', '--no-tags',
      '-c', `core.hooksPath=${hooksDir}`,
      '--no-recurse-submodules',
    ]
    if (input.branch !== undefined && input.branch !== '') args.push('--branch', input.branch)
    args.push(input.repoUrl, workspacePath)
    await execFileAsync('git', args, {
      env: { ...process.env, ...credentials.env },
      cwd: input.workspaceRoot,
    })
    if (input.ref !== undefined && input.ref !== '') {
      try {
        await execFileAsync('git', ['fetch', '--depth', '1', 'origin', input.ref], {
          env: { ...process.env, ...credentials.env },
          cwd: workspacePath,
        })
        await execFileAsync('git', ['checkout', '--detach', 'FETCH_HEAD'], { cwd: workspacePath })
      } catch (error) {
        throw classifyCloneError(errorText(error), redactUrl(input.repoUrl), input.ref)
      }
    }
    const { stdout: commitOut } = await execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: workspacePath })
    const { stdout: branchOut } = await execFileAsync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: workspacePath })
    const branch = branchOut.trim()
    return {
      workspacePath,
      commit: commitOut.trim(),
      branch: branch === 'HEAD' ? (input.branch ?? '') : branch,
    }
  } catch (error) {
    // A failed clone must not leave a partial workspace behind, and the
    // caller must never write a scan row for it (write-then-clear ordering,
    // ADR: initScan only runs after a successful clone).
    await rm(workspacePath, { recursive: true, force: true })
    if (error instanceof Error && error.message.startsWith('sast:')) throw error
    throw classifyCloneError(errorText(error), redactUrl(input.repoUrl), input.branch ?? input.ref)
  } finally {
    await credentials.cleanup()
  }
}

function errorText(error: unknown): string {
  return error !== null && typeof error === 'object' && 'stderr' in error ? String((error as { stderr: unknown }).stderr) : String(error)
}

async function mktempWorkspace(workspaceRoot: string): Promise<string> {
  await mkdir(workspaceRoot, { recursive: true })
  return mkdtemp(join(workspaceRoot, 'scan-'))
}

function basenameOf(path: string): string {
  return path.split(/[\\/]/).at(-1) ?? path
}
