#!/usr/bin/env node
/**
 * `npx dsh-sast` quick start: a convenience wrapper around the exact steps
 * documented in README.md ("dsh plugin --profile web add" + "dsh web") — not
 * a separate install code path. It pins `@deepseek-ai/dsh@0.1.0-rc.6` (the
 * version this bundle's peerDependencies are locked to) so the CLI it
 * spawns never drifts ahead of the bundle it is installing.
 *
 * This script never accepts or forwards any repository credential, URL, or
 * authorization value (ADR-07) — it only prepares the `web`
 * profile and hands off to the already-audited `dsh web` UI, through which
 * the user supplies scan targets and credentials via the normal
 * GIT_ASKPASS/env-var flow. Do not add a `--token`-shaped flag here.
 */

import { spawnSync } from 'node:child_process'
import { readFileSync, realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const DSH_CLI_SPEC = '@deepseek-ai/dsh@0.1.0-rc.6'
const MIN_NODE_VERSION = '22.5.0'

export function parseArgs(argv) {
  if (argv.includes('--help') || argv.includes('-h')) return { mode: 'help' }
  if (argv.includes('--version') || argv.includes('-V')) return { mode: 'version' }
  return { mode: 'run', passthroughArgs: argv }
}

function compareVersions(a, b) {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0)
  }
  return 0
}

export function checkNodeVersion(nodeVersion = process.versions.node) {
  if (compareVersions(nodeVersion, MIN_NODE_VERSION) < 0) {
    return {
      ok: false,
      message: `dsh-sast: Node.js ${MIN_NODE_VERSION} or newer is required (found ${nodeVersion}) — the sqlite backend uses node:sqlite`,
    }
  }
  return { ok: true }
}

export function checkGitAvailable(spawnFn = spawnSync) {
  const result = spawnFn('git', ['--version'])
  if (result.error !== undefined || result.status !== 0) {
    return {
      ok: false,
      message: 'dsh-sast: git was not found on PATH; sast_start_scan requires git to clone repositories — install git and re-run',
    }
  }
  return { ok: true }
}

export function checkPnpmAvailable(spawnFn = spawnSync) {
  const result = spawnFn('pnpm', ['--version'])
  if (result.error !== undefined || result.status !== 0) {
    return {
      ok: false,
      message: 'dsh-sast: pnpm was not found on PATH; "dsh plugin add" forwards to pnpm to install this plugin — install pnpm (npm install -g pnpm) and re-run',
    }
  }
  return { ok: true }
}

export function resolveOwnRoot(baseUrl = import.meta.url) {
  const ownRoot = fileURLToPath(new URL('..', baseUrl))
  const manifest = JSON.parse(readFileSync(new URL('../package.json', baseUrl), 'utf8'))
  if (manifest.name !== '@tangxiaofeng7/dsh-sast') {
    throw new Error(`dsh-sast: internal error — resolved package root ${ownRoot} is not @tangxiaofeng7/dsh-sast`)
  }
  return ownRoot
}

export function runSteps(spawnFn, argv, deps = {}) {
  const parsed = parseArgs(argv)
  if (parsed.mode === 'help') {
    console.log('Usage: dsh-sast [-- <args passed to "dsh web">]')
    console.log('Installs this bundle into the local DSH "web" profile, then boots it.')
    return 0
  }
  if (parsed.mode === 'version') {
    const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
    console.log(manifest.version)
    return 0
  }

  const checkNode = deps.checkNodeVersion ?? checkNodeVersion
  const checkGit = deps.checkGitAvailable ?? checkGitAvailable
  const checkPnpm = deps.checkPnpmAvailable ?? checkPnpmAvailable
  const resolveRoot = deps.resolveOwnRoot ?? resolveOwnRoot

  for (const check of [checkNode, () => checkGit(spawnFn), () => checkPnpm(spawnFn)]) {
    const result = check()
    if (!result.ok) {
      console.error(result.message)
      return 1
    }
  }

  const ownRoot = resolveRoot()

  console.log('dsh-sast: installing this bundle into the local "web" profile')
  const install = spawnFn('npx', ['--yes', DSH_CLI_SPEC, 'plugin', '--profile', 'web', 'add', ownRoot], { stdio: 'inherit' })
  if (install.status !== 0) {
    console.error('dsh-sast: plugin install failed (see pnpm output above); aborting before starting the server')
    return install.status ?? 1
  }

  console.log('dsh-sast: starting the DSH web server (Ctrl+C to stop)')
  const boot = spawnFn('npx', ['--yes', DSH_CLI_SPEC, 'web', ...parsed.passthroughArgs], { stdio: 'inherit' })
  return boot.status ?? 1
}

const selfPath = realpathSync(fileURLToPath(import.meta.url))
const argvPath = realpathSync(process.argv[1])

if (selfPath === argvPath) {
  process.exit(runSteps(spawnSync, process.argv.slice(2)))
}
