/**
 * @module
 */

import { describe, expect, it } from 'vitest'
import { TimeoutReason } from '@deepseek-ai/dsh-timeout'
import { classifyError, decideOutcome } from '../../src/batch/policy.ts'

describe('classifyError', () => {
  it('classifies a job-deadline TimeoutReason as timeout', () => {
    expect(classifyError(new TimeoutReason('SAST_JOB_TIMEOUT', 60_000))).toBe('timeout')
  })

  it('classifies a clone-deadline TimeoutReason as timeout', () => {
    expect(classifyError(new TimeoutReason('SAST_CLONE_TIMEOUT', 30_000))).toBe('timeout')
  })

  it('does not classify a differently-coded TimeoutReason as this package\'s timeout', () => {
    expect(classifyError(new TimeoutReason('SOME_OTHER_TIMEOUT', 1000))).toBe('unknown')
  })

  it('classifies clone.ts\'s authentication-failure message as auth', () => {
    expect(classifyError(new Error('sast: authentication failed cloning https://example.com/x.git; check the configured token env var'))).toBe('auth')
  })

  it('classifies clone.ts\'s branch/ref-not-found message as ref-not-found', () => {
    expect(classifyError(new Error('sast: branch or ref v9 not found in https://example.com/x.git'))).toBe('ref-not-found')
  })

  it('classifies guardrails.ts\'s scope-limit message as scope-exceeded', () => {
    expect(classifyError(new Error('sast: repository exceeds the 50000-file audit scope limit; narrow the scan scope or split the repository'))).toBe('scope-exceeded')
  })

  it('classifies a storage-unavailable message as infra', () => {
    expect(classifyError(new Error('sast: storage backend is unavailable'))).toBe('infra')
  })

  it('classifies git-not-available as infra', () => {
    expect(classifyError(new Error('sast: git is not available in this environment'))).toBe('infra')
  })

  it('falls back to unknown for unrecognized text, never guessing a more specific (more automatically retryable) class', () => {
    expect(classifyError(new Error('sast: something unexpected happened'))).toBe('unknown')
    expect(classifyError('a bare string')).toBe('unknown')
  })
})

describe('decideOutcome', () => {
  it('always fails the batch closed for an infra-class error, regardless of attempt count', () => {
    expect(decideOutcome('infra', 1, 3)).toEqual({ action: 'fail-closed' })
    expect(decideOutcome('infra', 3, 3)).toEqual({ action: 'fail-closed' })
  })

  it('never retries a blocked outcome — it always degrades with a coverageImpact note', () => {
    const decision = decideOutcome('blocked', 1, 5)
    expect(decision.action).toBe('degrade')
    expect((decision as { coverageImpact: string }).coverageImpact).toContain('blocked')
  })

  it('retries a timeout while attempts remain, then degrades once exhausted', () => {
    expect(decideOutcome('timeout', 1, 2)).toEqual({ action: 'retry' })
    const exhausted = decideOutcome('timeout', 2, 2)
    expect(exhausted.action).toBe('degrade')
  })

  it('retries an unknown error while attempts remain, then degrades once exhausted', () => {
    expect(decideOutcome('unknown', 1, 2)).toEqual({ action: 'retry' })
    expect(decideOutcome('unknown', 2, 2).action).toBe('degrade')
  })

  it('skips (never retries) auth once attempts are exhausted, and never guesses a credential', () => {
    const decision = decideOutcome('auth', 2, 2)
    expect(decision.action).toBe('skip')
    expect((decision as { coverageImpact: string }).coverageImpact).toContain('authentication failed')
  })

  it('skips ref-not-found once attempts are exhausted, and never substitutes another branch', () => {
    const decision = decideOutcome('ref-not-found', 2, 2)
    expect(decision.action).toBe('skip')
    expect((decision as { coverageImpact: string }).coverageImpact).toContain('branch/ref')
  })

  it('scope-exceeded retries when autoNarrowScope is enabled, but skips immediately when disabled', () => {
    expect(decideOutcome('scope-exceeded', 1, 2, true)).toEqual({ action: 'retry' })
    const disabled = decideOutcome('scope-exceeded', 1, 2, false)
    expect(disabled.action).toBe('skip')
    expect((disabled as { coverageImpact: string }).coverageImpact).toContain('not silently narrowed')
  })

  it('auth is never retried even on the first attempt (attempt < maxAttempts does not matter for this class)', () => {
    expect(decideOutcome('auth', 1, 5).action).toBe('skip')
  })

  it('ref-not-found is never retried even on the first attempt', () => {
    expect(decideOutcome('ref-not-found', 1, 5).action).toBe('skip')
  })
})
