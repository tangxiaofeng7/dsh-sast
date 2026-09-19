/**
 * @module
 */

import { describe, expect, it } from 'vitest'
import { permalinkOf } from '../src/client/permalink.ts'

describe('permalinkOf', () => {
  it('builds a GitLab blob permalink with a single line fragment', () => {
    const url = permalinkOf(
      { provider: 'gitlab', repoUrl: 'https://gitlab.com/group/project.git', commit: 'abc123' },
      { path: 'src/dao/OrderDao.java', line: 88 },
    )
    expect(url).toBe('https://gitlab.com/group/project/-/blob/abc123/src/dao/OrderDao.java#L88')
  })

  it('builds a GitHub blob permalink with a single line fragment', () => {
    const url = permalinkOf(
      { provider: 'github', repoUrl: 'https://github.com/org/repo.git', commit: 'abc123' },
      { path: 'src/index.ts', line: 42 },
    )
    expect(url).toBe('https://github.com/org/repo/blob/abc123/src/index.ts#L42')
  })

  it('builds a line-range fragment when endLine is greater than line', () => {
    const url = permalinkOf(
      { provider: 'github', repoUrl: 'https://github.com/org/repo', commit: 'abc123' },
      { path: 'a.ts', line: 10, endLine: 15 },
    )
    expect(url).toBe('https://github.com/org/repo/blob/abc123/a.ts#L10-L15')
  })

  it('omits the range when endLine is not greater than line', () => {
    const url = permalinkOf(
      { provider: 'github', repoUrl: 'https://github.com/org/repo', commit: 'abc123' },
      { path: 'a.ts', line: 10, endLine: 10 },
    )
    expect(url).toBe('https://github.com/org/repo/blob/abc123/a.ts#L10')
  })

  it('omits the line fragment entirely for a whole-file (line 0) location', () => {
    const url = permalinkOf(
      { provider: 'github', repoUrl: 'https://github.com/org/repo', commit: 'abc123' },
      { path: 'a.ts', line: 0 },
    )
    expect(url).toBe('https://github.com/org/repo/blob/abc123/a.ts')
  })

  it('omits the line fragment when line is undefined', () => {
    const url = permalinkOf(
      { provider: 'github', repoUrl: 'https://github.com/org/repo', commit: 'abc123' },
      { path: 'a.ts' },
    )
    expect(url).toBe('https://github.com/org/repo/blob/abc123/a.ts')
  })

  it('returns undefined for provider local', () => {
    const url = permalinkOf(
      { provider: 'local', repoUrl: '/repo', commit: 'abc123' },
      { path: 'a.ts', line: 1 },
    )
    expect(url).toBeUndefined()
  })

  it('returns undefined when the scan has no resolved commit yet', () => {
    const url = permalinkOf(
      { provider: 'github', repoUrl: 'https://github.com/org/repo', commit: '' },
      { path: 'a.ts', line: 1 },
    )
    expect(url).toBeUndefined()
  })

  it('strips a trailing .git and trailing slash from repoUrl', () => {
    const url = permalinkOf(
      { provider: 'gitlab', repoUrl: 'https://gitlab.com/group/project.git/', commit: 'abc123' },
      { path: 'a.ts', line: 1 },
    )
    expect(url).toBe('https://gitlab.com/group/project/-/blob/abc123/a.ts#L1')
  })
})
