/**
 * @module
 */

import { describe, expect, it, vi } from 'vitest'
import {
  checkGitAvailable,
  checkNodeVersion,
  checkPnpmAvailable,
  parseArgs,
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
    expect(result.message).toContain('pnpm was not found on PATH')
  })
})

describe('runSteps', () => {
  const passingDeps = {
    checkNodeVersion: () => ({ ok: true }),
    checkGitAvailable: () => ({ ok: true }),
    checkPnpmAvailable: () => ({ ok: true }),
    resolveOwnRoot: () => '/abs/path/to/dsh-sast',
  }

  it('runs preflight checks before any subprocess call', () => {
    const order: string[] = []
    const deps = {
      checkNodeVersion: () => { order.push('node'); return { ok: true } },
      checkGitAvailable: () => { order.push('git'); return { ok: true } },
      checkPnpmAvailable: () => { order.push('pnpm'); return { ok: true } },
      resolveOwnRoot: () => '/abs/path/to/dsh-sast',
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

  it('installs the plugin before booting the web server, with the expected arguments', () => {
    const calls: unknown[][] = []
    const spawnFn = vi.fn().mockImplementation((...args) => { calls.push(args); return { status: 0 } })
    runSteps(spawnFn, [], passingDeps)
    expect(calls[0]).toEqual(['npx', ['--yes', '@deepseek-ai/dsh@0.1.0-rc.6', 'plugin', '--profile', 'web', 'add', '/abs/path/to/dsh-sast'], { stdio: 'inherit' }])
    expect(calls[1]).toEqual(['npx', ['--yes', '@deepseek-ai/dsh@0.1.0-rc.6', 'web'], { stdio: 'inherit' }])
  })

  it('never boots the web server when the plugin install fails', () => {
    const spawnFn = vi.fn().mockReturnValueOnce({ status: 1 })
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
    const spawnFn = vi.fn().mockReturnValueOnce({ status: 0 }).mockReturnValueOnce({ status: 7 })
    expect(runSteps(spawnFn, [], passingDeps)).toBe(7)
  })
})
