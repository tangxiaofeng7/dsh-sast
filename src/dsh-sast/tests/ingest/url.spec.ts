/**
 * @module
 */

import { describe, expect, it } from 'vitest'
import { parseRepoUrl, redactUrl } from '../../src/ingest/url.ts'

describe('redactUrl', () => {
  it('strips userinfo from an https URL', () => {
    expect(redactUrl('https://oauth2:secrettoken@gitlab.com/group/project.git')).toBe('https://gitlab.com/group/project.git')
  })

  it('strips known credential query params', () => {
    expect(redactUrl('https://gitlab.com/group/project.git?private_token=abc123')).toBe('https://gitlab.com/group/project.git')
    expect(redactUrl('https://github.com/org/repo.git?access_token=xyz')).toBe('https://github.com/org/repo.git')
  })

  it('strips both userinfo and query params together', () => {
    expect(redactUrl('https://x:y@github.com/org/repo.git?token=z')).toBe('https://github.com/org/repo.git')
  })

  it('returns a non-URL string unchanged (e.g. SSH shorthand)', () => {
    expect(redactUrl('git@github.com:org/repo.git')).toBe('git@github.com:org/repo.git')
  })
})

describe('parseRepoUrl', () => {
  it('parses a github.com URL', () => {
    const parsed = parseRepoUrl('https://github.com/org/repo.git')
    expect(parsed).toMatchObject({ provider: 'github', host: 'github.com', namespace: 'org', project: 'repo' })
    expect(parsed.redacted).toBe('https://github.com/org/repo.git')
  })

  it('parses a gitlab URL with a nested namespace', () => {
    const parsed = parseRepoUrl('https://gitlab.example.com/group/subgroup/project.git')
    expect(parsed).toMatchObject({ provider: 'gitlab', host: 'gitlab.example.com', namespace: 'group/subgroup', project: 'project' })
  })

  it('redacts credentials in the returned redacted field', () => {
    const parsed = parseRepoUrl('https://oauth2:secret@gitlab.com/group/project.git')
    expect(parsed.redacted).toBe('https://gitlab.com/group/project.git')
  })

  it('rejects an unparseable URL', () => {
    expect(() => parseRepoUrl('not a url')).toThrow(/not a valid URL/)
  })

  it('rejects a non-http(s) protocol', () => {
    expect(() => parseRepoUrl('ssh://git@github.com/org/repo.git')).toThrow(/must use http/)
  })

  it('rejects a URL with no repository path', () => {
    expect(() => parseRepoUrl('https://github.com/')).toThrow(/has no repository path/)
  })
})
