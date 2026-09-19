/**
 * @module
 */

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  checkGitAvailable,
  checkNodeVersion,
  checkPnpmAvailable,
  ensurePeerWarningSuppression,
  healStalePluginSpec,
  parseArgs,
  resolveWebProfileDir,
  runSteps,
} from '../bin/dsh-sast.js'

describe('parseArgs', () => {
  it('recognizes --help', () => {
    expect(parseArgs(['--help'])).toEqual({ mode: 'help' })
    expect(parseArgs(['-h'])).toEqual({ mode: 'help' })
  })

  it('recognizes --version', () => {
    expect(parseArgs(['--version'])).toEqual({ mode: 'version' })
    expect(parseArgs(['-V'])).toEqual({ mode: 'version' })
  })

  it('treats no arguments as run mode with no passthrough args', () => {
    expect(parseArgs([])).toEqual({ mode: 'run', passthroughArgs: [] })
  })

  it('preserves unrecognized arguments in order as passthrough args', () => {
    expect(parseArgs(['--port', '8080'])).toEqual({ mode: 'run', passthroughArgs: ['--port', '8080'] })
  })
})

describe('checkNodeVersion', () => {
  it('passes at the minimum version', () => {
    expect(checkNodeVersion('22.5.0')).toEqual({ ok: true })
  })

  it('passes above the minimum version', () => {
    expect(checkNodeVersion('22.6.1')).toEqual({ ok: true })
    expect(checkNodeVersion('23.0.0')).toEqual({ ok: true })
  })

  it('fails below the minimum version', () => {
    const result = checkNodeVersion('22.4.9')
    expect(result.ok).toBe(false)
    expect(result.message).toContain('22.5.0')
    expect(result.message).toContain('22.4.9')
  })
})

describe('checkGitAvailable', () => {
  it('passes when git responds successfully', () => {
    const spawnFn = vi.fn().mockReturnValue({ status: 0, error: undefined })
    expect(checkGitAvailable(spawnFn)).toEqual({ ok: true })
    expect(spawnFn).toHaveBeenCalledWith('git', ['--version'])
  })

  it('fails when git is missing from PATH', () => {
    const spawnFn = vi.fn().mockReturnValue({ status: null, error: new Error('ENOENT') })
    const result = checkGitAvailable(spawnFn)
    expect(result.ok).toBe(false)
    expect(result.message).toContain('git was not found on PATH')
  })

  it('fails when git exits nonzero', () => {
    const spawnFn = vi.fn().mockReturnValue({ status: 1, error: undefined })
    expect(checkGitAvailable(spawnFn).ok).toBe(false)
  })
})

describe('checkPnpmAvailable', () => {
  it('passes when pnpm responds successfully', () => {
    const spawnFn = vi.fn().mockReturnValue({ status: 0, error: undefined })
    expect(checkPnpmAvailable(spawnFn)).toEqual({ ok: true })
    expect(spawnFn).toHaveBeenCalledWith('pnpm', ['--version'])
  })

  it('fails when pnpm is missing from PATH', () => {
    const spawnFn = vi.fn().mockReturnValue({ status: null, error: new Error('ENOENT') })
    const result = checkPnpmAvailable(spawnFn)
    expect(result.ok).toBe(false)
    expect(result.message).toContain('pnpm was not found')
  })
})

describe('resolveWebProfileDir', () => {
  it('honors DSH_HOME and lands under profiles/web', () => {
    expect(resolveWebProfileDir({ DSH_HOME: '/isolated/home' })).toBe('/isolated/home/profiles/web')
  })

  it('treats an empty or whitespace-only DSH_HOME as unset', () => {
    const fromEnv = resolveWebProfileDir({ DSH_HOME: '' })
    const fromWhitespace = resolveWebProfileDir({ DSH_HOME: '   ' })
    const unset = resolveWebProfileDir({})
    expect(fromEnv).toBe(unset)
    expect(fromWhitespace).toBe(unset)
    expect(unset.endsWith(join('.dsh', 'profiles', 'web'))).toBe(true)
  })
})

describe('healStalePluginSpec', () => {
  const tempRoots: string[] = []
  const makeProfile = (manifest) => {
    const dir = mkdtempSync(join(tmpdir(), 'dsh-sast-heal-'))
    tempRoots.push(dir)
    writeFileSync(join(dir, 'package.json'), JSON.stringify(manifest, null, 2))
    return dir
  }
  afterEach(() => {
    while (tempRoots.length > 0) rmSync(tempRoots.pop() as string, { recursive: true, force: true })
  })

  const NAME = '@tangxiaofeng7/dsh-sast'

  it('removes the entry when its file: tarball no longer exists', () => {
    const dir = makeProfile({
      name: 'dsh-profile-web',
      dependencies: { [NAME]: 'file:/var/folders/xx/gone/dsh-sast-pack-CUbrI8/tangxiaofeng7-dsh-sast-0.1.0-rc.3.tgz', 'other-pkg': '^1.0.0' },
      dsh: { profile: { bundles: ['@deepseek-ai/dsh-base'] } },
    })
    expect(healStalePluginSpec(dir)).toBe(true)
    const after = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
    expect(after.dependencies).toEqual({ 'other-pkg': '^1.0.0' })
    expect(after.dsh).toEqual({ profile: { bundles: ['@deepseek-ai/dsh-base'] } })
  })

  it('resolves relative file: specs against the profile directory', () => {
    const dir = makeProfile({ dependencies: { [NAME]: 'file:./missing.tgz' } })
    expect(healStalePluginSpec(dir)).toBe(true)
    expect(JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).dependencies).toEqual({})
  })

  it('keeps the entry when its file: target still exists', () => {
    const dir = makeProfile({ dependencies: { [NAME]: 'file:./bundle.tgz' } })
    writeFileSync(join(dir, 'bundle.tgz'), 'tarball bytes')
    expect(healStalePluginSpec(dir)).toBe(false)
    expect(JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).dependencies[NAME]).toBe('file:./bundle.tgz')
  })

  it('keeps version specs untouched', () => {
    const dir = makeProfile({ dependencies: { [NAME]: '0.1.0-rc.4' } })
    expect(healStalePluginSpec(dir)).toBe(false)
    expect(JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).dependencies[NAME]).toBe('0.1.0-rc.4')
  })

  it('is a no-op without a profile manifest', () => {
    const dir = mkdtempSync(join(tmpdir(), 'dsh-sast-heal-'))
    tempRoots.push(dir)
    expect(healStalePluginSpec(dir)).toBe(false)
    expect(healStalePluginSpec(join(dir, 'nested'))).toBe(false)
  })
})

describe('ensurePeerWarningSuppression', () => {
  const tempRoots: string[] = []
  const freshDir = () => {
    const dir = mkdtempSync(join(tmpdir(), 'dsh-sast-peer-'))
    tempRoots.push(dir)
    return dir
  }
  afterEach(() => {
    while (tempRoots.length > 0) rmSync(tempRoots.pop() as string, { recursive: true, force: true })
  })

  const STANZA = 'peerDependencyRules:\n  ignoreMissing:\n    - "@deepseek-ai/*"\n'

  it('writes the dsh template plus the stanza when no workspace file exists', () => {
    const dir = freshDir()
    expect(ensurePeerWarningSuppression(join(dir, 'profiles', 'web'))).toBe(true)
    const content = readFileSync(join(dir, 'profiles', 'web', 'pnpm-workspace.yaml'), 'utf8')
    expect(content).toBe(`packages:\n  - .\n\nnodeLinker: hoisted\nautoInstallPeers: false\n${STANZA}`)
  })

  it('appends the stanza to an existing dsh workspace file, keeping its keys', () => {
    const dir = freshDir()
    writeFileSync(join(dir, 'pnpm-workspace.yaml'), 'packages:\n  - .\n\nnodeLinker: hoisted\nautoInstallPeers: false\n')
    expect(ensurePeerWarningSuppression(dir)).toBe(true)
    const content = readFileSync(join(dir, 'pnpm-workspace.yaml'), 'utf8')
    expect(content.startsWith('packages:\n  - .\n')).toBe(true)
    expect(content.endsWith(`autoInstallPeers: false\n${STANZA}`)).toBe(true)
  })

  it('repairs a missing trailing newline before appending', () => {
    const dir = freshDir()
    writeFileSync(join(dir, 'pnpm-workspace.yaml'), 'nodeLinker: hoisted')
    ensurePeerWarningSuppression(dir)
    const content = readFileSync(join(dir, 'pnpm-workspace.yaml'), 'utf8')
    expect(content).toBe(`nodeLinker: hoisted\n${STANZA}`)
  })

  it('is a no-op when the stanza is already present', () => {
    const dir = freshDir()
    const original = `packages:\n  - .\n\nnodeLinker: hoisted\nautoInstallPeers: false\n${STANZA}`
    writeFileSync(join(dir, 'pnpm-workspace.yaml'), original)
    expect(ensurePeerWarningSuppression(dir)).toBe(false)
    expect(readFileSync(join(dir, 'pnpm-workspace.yaml'), 'utf8')).toBe(original)
  })
})

describe('runSteps', () => {
  const passingDeps = {
    checkNodeVersion: () => ({ ok: true }),
    checkGitAvailable: () => ({ ok: true }),
    checkPnpmAvailable: () => ({ ok: true }),
    resolveOwnRoot: () => '/abs/path/to/dsh-sast',
    readOwnVersion: () => '0.1.0-rc.3',
    resolveWebProfileDir: () => '/abs/profile/web',
    healStalePluginSpec: () => false,
    ensurePeerWarningSuppression: () => false,
  }

  it('runs preflight checks before any subprocess call', () => {
    const order: string[] = []
    const deps = {
      ...passingDeps,
      checkNodeVersion: () => { order.push('node'); return { ok: true } },
      checkGitAvailable: () => { order.push('git'); return { ok: true } },
      checkPnpmAvailable: () => { order.push('pnpm'); return { ok: true } },
    }
    const spawnFn = vi.fn().mockImplementation(() => { order.push('spawn'); return { status: 0 } })
    runSteps(spawnFn, [], deps)
    expect(order).toEqual(['node', 'git', 'pnpm', 'spawn', 'spawn'])
  })

  it('short-circuits on a failing preflight check without spawning anything', () => {
    const spawnFn = vi.fn()
    const deps = { ...passingDeps, checkGitAvailable: () => ({ ok: false, message: 'no git' }) }
    const code = runSteps(spawnFn, [], deps)
    expect(code).toBe(1)
    expect(spawnFn).not.toHaveBeenCalled()
  })

  it('installs this package by exact registry spec, never the live package directory', () => {
    const calls: unknown[][] = []
    const spawnFn = vi.fn().mockImplementation((...args) => { calls.push(args); return { status: 0 } })
    runSteps(spawnFn, [], passingDeps)
    expect(calls[0]).toEqual(['npx', ['--yes', '@deepseek-ai/dsh@0.1.0-rc.6', 'plugin', '--profile', 'web', 'add', '@tangxiaofeng7/dsh-sast@0.1.0-rc.3'], { stdio: 'inherit' }])
    expect(calls[0][1].join(' ')).not.toContain('/abs/path/to/dsh-sast')
    expect(calls[1]).toEqual(['npx', ['--yes', '@deepseek-ai/dsh@0.1.0-rc.6', 'web'], { stdio: 'inherit' }])
  })

  it('heals a stale rc.3 tarball entry before installing', () => {
    const calls: unknown[][] = []
    const heal = vi.fn().mockReturnValue(true)
    const spawnFn = vi.fn().mockImplementation((...args) => { calls.push(args); return { status: 0 } })
    runSteps(spawnFn, [], { ...passingDeps, healStalePluginSpec: heal })
    expect(heal).toHaveBeenCalledWith('/abs/profile/web')
    expect(spawnFn).toHaveBeenCalledTimes(2)
    expect(calls[0][1].at(-1)).toBe('@tangxiaofeng7/dsh-sast@0.1.0-rc.3')
  })

  it('keeps going when the heal check itself throws', () => {
    const spawnFn = vi.fn().mockReturnValue({ status: 0 })
    const code = runSteps(spawnFn, [], { ...passingDeps, healStalePluginSpec: () => { throw new Error('EACCES') } })
    expect(code).toBe(0)
    expect(spawnFn).toHaveBeenCalledTimes(2)
  })

  it('suppresses peer warnings for the profile before installing, and survives its failure', () => {
    const suppress = vi.fn().mockReturnValue(true)
    const failing = vi.fn(() => { throw new Error('EACCES') })
    const ok = vi.fn().mockReturnValue({ status: 0 })
    runSteps(vi.fn().mockImplementation((...args: unknown[]) => { ok(...args); return { status: 0 } }), [], { ...passingDeps, ensurePeerWarningSuppression: suppress })
    expect(suppress).toHaveBeenCalledWith('/abs/profile/web')
    const code = runSteps(vi.fn().mockReturnValue({ status: 0 }), [], { ...passingDeps, ensurePeerWarningSuppression: failing })
    expect(code).toBe(0)
  })

  it('never boots the web server when the plugin install fails', () => {
    const spawnFn = vi.fn()
      .mockReturnValueOnce({ status: 1 }) // dsh plugin add fails
    const code = runSteps(spawnFn, [], passingDeps)
    expect(code).toBe(1)
    expect(spawnFn).toHaveBeenCalledTimes(1)
  })

  it('forwards passthrough args only to the web boot call', () => {
    const calls: unknown[][] = []
    const spawnFn = vi.fn().mockImplementation((...args) => { calls.push(args); return { status: 0 } })
    runSteps(spawnFn, ['--port', '8080'], passingDeps)
    expect(calls[0][1]).not.toContain('--port')
    expect(calls[1]).toEqual(['npx', ['--yes', '@deepseek-ai/dsh@0.1.0-rc.6', 'web', '--port', '8080'], { stdio: 'inherit' }])
  })

  it('exits with the web boot subprocess exit code', () => {
    const spawnFn = vi.fn()
      .mockReturnValueOnce({ status: 0 }) // dsh plugin add
      .mockReturnValueOnce({ status: 7 }) // dsh web
    expect(runSteps(spawnFn, [], passingDeps)).toBe(7)
  })
})
