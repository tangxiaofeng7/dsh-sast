#!/usr/bin/env node
/**
 * `npx dsh-sast` quick start: a convenience wrapper around the exact steps
 * documented in README.md ("dsh plugin --profile web add" + "dsh web") — not
 * a separate install code path. It pins `@deepseek-ai/dsh@0.1.0-rc.6` (the
 * version this bundle's peerDependencies are locked to) so the CLI it
 * spawns never drifts ahead of the bundle it is installing.
 *
 * The install step adds THIS package by exact registry spec
 * (`@tangxiaofeng7/dsh-sast@<own version>`), so the profile manifest and
 * lockfile record a durable version, not a path. Two earlier approaches
 * failed: passing the live package directory (the npx cache this bin runs
 * from) breaks because `npx --legacy-peer-deps` installs no peerDependencies,
 * so the profile keeps referencing the npx cache copy, whose `lib/*.js` then
 * fail to resolve `@deepseek-ai/dsh-*` peers at boot
 * (ERR_MODULE_NOT_FOUND from the plugin tree loader); and installing from a
 * tarball packed into a temp directory (rc.2→rc.3) breaks on every run
 * AFTER the first: pnpm records the ephemeral `file:/var/folders/...` path
 * in the profile's package.json/pnpm-lock.yaml, the temp dir is cleaned up,
 * and the next `pnpm add` — which re-resolves existing dependencies first —
 * dies with ENOENT opening that dead path. Before installing, heal profiles
 * poisoned that way (see healStalePluginSpec).
 *
 * This script never accepts or forwards any repository credential, URL, or
 * authorization value (ADR-07) — it only prepares the `web`
 * profile and hands off to the already-audited `dsh web` UI, through which
 * the user supplies scan targets and credentials via the normal
 * GIT_ASKPASS/env-var flow. Do not add a `--token`-shaped flag here.
 */

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const DSH_CLI_SPEC = '@deepseek-ai/dsh@0.1.0-rc.6'
const MIN_NODE_VERSION = '22.5.0'
const PLUGIN_NAME = '@tangxiaofeng7/dsh-sast'

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
  if (manifest.name !== PLUGIN_NAME) {
    throw new Error(`dsh-sast: internal error — resolved package root ${ownRoot} is not ${PLUGIN_NAME}`)
  }
  return ownRoot
}

export function readOwnVersion(baseUrl = import.meta.url) {
  return JSON.parse(readFileSync(new URL('../package.json', baseUrl), 'utf8')).version
}

/**
 * Resolve the `web` profile directory the way dsh does: `$DSH_HOME/profiles/<name>`,
 * `DSH_HOME` defaulting to `~/.dsh` (empty/whitespace value treated as unset).
 * @param env - environment mapping to read `DSH_HOME` from.
 * @returns the absolute profile directory path.
 */
export function resolveWebProfileDir(env = process.env) {
  const override = env.DSH_HOME
  const home = override !== undefined && override.trim().length > 0 ? override : join(homedir(), '.dsh')
  return join(resolve(home), 'profiles', 'web')
}

/**
 * Remove a stale quick-start entry that breaks every later install: rc.3
 * installed from a temp-dir tarball, pnpm recorded that `file:` path under
 * this package's name in the profile's package.json, and once the temp dir
 * was cleaned any subsequent `pnpm add` in the profile fails with ENOENT
 * re-resolving it. Only this package's own entry is touched, and only when
 * its `file:` target no longer exists (a `file:` spec whose tarball is still
 * there, or a version spec, is left for pnpm to handle). pnpm prunes the
 * orphaned lockfile key on the next successful add.
 * @param profileDir - the `web` profile directory.
 * @returns true when a dead entry was removed.
 */
export function healStalePluginSpec(profileDir) {
  const manifestPath = join(profileDir, 'package.json')
  let manifest
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  } catch {
    return false // no profile yet (dsh initializes it) or unreadable manifest
  }
  const spec = manifest.dependencies?.[PLUGIN_NAME]
  if (typeof spec !== 'string' || !spec.startsWith('file:')) return false
  if (existsSync(resolve(profileDir, spec.slice('file:'.length)))) return false
  delete manifest.dependencies[PLUGIN_NAME]
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  return true
}

/**
 * Keep pnpm from warning about this bundle's peerDependencies on every
 * install. dsh profiles provide the @deepseek-ai/* harness runtime from the
 * shared `profiles/node_modules` tree one level above the profile, and the
 * profile template pins `autoInstallPeers: false` so pnpm never duplicates
 * those peers into the profile (a single shared instance is the plugin
 * contract) — resolution works at boot, but pnpm still prints nine "missing
 * peer" warnings per install. Registering pnpm's own
 * `peerDependencyRules.ignoreMissing` for the harness scope silences exactly
 * those warnings. When the file does not exist yet (fresh profile), write it
 * with the exact dsh profile template content plus this stanza: dsh's
 * initProfile skips an existing pnpm-workspace.yaml, and this bin pins the
 * dsh CLI version, so the embedded template cannot drift.
 * @param profileDir - the `web` profile directory.
 * @returns true when the file was created or extended.
 */
export function ensurePeerWarningSuppression(profileDir) {
  const workspacePath = join(profileDir, 'pnpm-workspace.yaml')
  const stanza = 'peerDependencyRules:\n  ignoreMissing:\n    - "@deepseek-ai/*"\n'
  let existing
  try {
    existing = readFileSync(workspacePath, 'utf8')
  } catch {
    mkdirSync(profileDir, { recursive: true })
    writeFileSync(workspacePath, `packages:\n  - .\n\nnodeLinker: hoisted\nautoInstallPeers: false\n${stanza}`)
    return true
  }
  if (existing.includes('peerDependencyRules:')) return false
  writeFileSync(workspacePath, `${existing}${existing.endsWith('\n') ? '' : '\n'}${stanza}`)
  return true
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
  const readVersion = deps.readOwnVersion ?? readOwnVersion
  const resolveProfile = deps.resolveWebProfileDir ?? resolveWebProfileDir
  const heal = deps.healStalePluginSpec ?? healStalePluginSpec
  const suppressPeers = deps.ensurePeerWarningSuppression ?? ensurePeerWarningSuppression

  for (const check of [checkNode, () => checkGit(spawnFn), () => checkPnpm(spawnFn)]) {
    const result = check()
    if (!result.ok) {
      console.error(result.message)
      return 1
    }
  }

  resolveRoot() // throws unless ../package.json really is this package, whose version feeds the install spec below
  const version = readVersion()

  try {
    if (heal(resolveProfile())) {
      console.log('dsh-sast: removed a stale tarball entry left by an earlier rc.3 quick-start (its file: path pointed into a cleaned temp directory)')
    }
  } catch (error) {
    console.warn(`dsh-sast: could not check the profile manifest for a stale quick-start entry (${error instanceof Error ? error.message : error}) — continuing`)
  }
  try {
    suppressPeers(resolveProfile())
  } catch {
    // cosmetic only — pnpm prints its peer warnings and the install proceeds
  }

  console.log('dsh-sast: installing this bundle into the local "web" profile')
  const install = spawnFn('npx', ['--yes', DSH_CLI_SPEC, 'plugin', '--profile', 'web', 'add', `${PLUGIN_NAME}@${version}`], { stdio: 'inherit' })
  if (install.status !== 0) {
    console.error('dsh-sast: plugin install failed (see pnpm output above); aborting before starting the server')
    return install.status ?? 1
  }

  console.log('dsh-sast: starting the DSH web server (Ctrl+C to stop)')
  const boot = spawnFn('npx', ['--yes', DSH_CLI_SPEC, 'web', ...parsed.passthroughArgs], { stdio: 'inherit' })
  return boot.status ?? 1
}

const selfPath = realpathSync(fileURLToPath(import.meta.url))
let argvPath
try {
  argvPath = process.argv[1] === undefined ? undefined : realpathSync(process.argv[1])
} catch {
  argvPath = undefined // argv[1] not a real path (e.g. `node -e` importing this module) — imported, not executed
}

if (argvPath !== undefined && selfPath === argvPath) {
  process.exit(runSteps(spawnSync, process.argv.slice(2)))
}
