/**
 * Report artifact persistence (M4): the pure `writeArtifact` disk writer
 * (digest determinism, multi-byte byte counts, root-escape hardening) and
 * its integration with `SastStore.putReportArtifact` (id allocation,
 * injected-clock `createdAt`) and the `sast_report` tool (returned
 * artifactId/uri/sha256/bytes point at a real file whose content matches).
 * @module
 */

import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import { writeArtifact } from '../../src/report/artifacts.ts'
import { SastStore } from '../../src/store.ts'
import { MemoryStorageBackend } from '../memory-backend.ts'
import { sastHarness, SESSION_ID } from '../harness.ts'

let root: string

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'sast-artifacts-'))
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

describe('writeArtifact', () => {
  it('produces the same sha256 for the same content, and a different one for different content', async () => {
    const a1 = await writeArtifact({ root, sessionId: 's1', kind: 'repo-markdown', content: '# report\n' })
    const a2 = await writeArtifact({ root, sessionId: 's1', kind: 'repo-markdown', content: '# report\n' })
    const b = await writeArtifact({ root, sessionId: 's1', kind: 'repo-markdown', content: '# different\n' })
    expect(a1.sha256).toBe(a2.sha256)
    expect(a1.sha256).not.toBe(b.sha256)
  })

  it('bytes equals the actual byte length written, including multi-byte characters', async () => {
    const content = '# 白盒审计报告\n'
    const written = await writeArtifact({ root, sessionId: 's1', kind: 'repo-markdown', content })
    expect(written.bytes).toBe(Buffer.byteLength(content, 'utf8'))
    expect(written.bytes).toBeGreaterThan(content.length) // multi-byte chars: bytes > code units
  })

  it('writes under the configured root, never escaping it', async () => {
    const written = await writeArtifact({ root, sessionId: 's1', kind: 'repo-sarif', content: '{}' })
    const absolute = fileURLToPath(written.uri)
    expect(absolute.startsWith(root)).toBe(true)
    expect(readFileSync(absolute, 'utf8')).toBe('{}')
  })

  it('separates batch job artifacts from a plain session artifact by path', async () => {
    const session = await writeArtifact({ root, sessionId: 's1', kind: 'repo-markdown', content: 'a' })
    const job = await writeArtifact({ root, sessionId: 's1', batchId: 'batch-1', jobId: 'job-1', kind: 'repo-markdown', content: 'b' })
    expect(session.uri).not.toBe(job.uri)
    expect(fileURLToPath(job.uri)).toContain(join('batch-1', 'job-1'))
  })
})

describe('SastStore.putReportArtifact', () => {
  async function storeBench(now: () => number): Promise<{ store: SastStore; ctx: Context }> {
    const ctx = new Context()
    await ctx.plugin(Storage)
    ctx.storage.backend.register('memory', new MemoryStorageBackend())
    const facility = new DomainFacility(ctx, { backend: 'memory', routes: {} })
    ctx.storage.mount('domain', facility)
    ctx.provide('storageDomain', facility)
    return { store: new SastStore(ctx, now), ctx }
  }

  it('assigns a deterministic artifact-<n> id and the injected clock value as createdAt', async () => {
    const { store } = await storeBench(() => 1234)
    const written = await writeArtifact({ root, sessionId: 's1', kind: 'repo-markdown', content: 'x' })
    const artifact = await store.putReportArtifact(written)
    expect(artifact.id).toBe('artifact-1')
    expect(artifact.createdAt).toBe(1234)
    const second = await store.putReportArtifact(await writeArtifact({ root, sessionId: 's1', kind: 'repo-sarif', content: 'y' }))
    expect(second.id).toBe('artifact-2')
  })
})

describe('sast_report artifact wiring', () => {
  it('returns an artifactId/uri/sha256/bytes whose file exists and matches the returned markdown', async () => {
    const { call } = await sastHarness({ reportRoot: root })
    await call('sast_start_scan', { repoUrl: root, objective: 'find sqli', authorization: 'CTO signed off' }, SESSION_ID)
    const report = await call('sast_report', {}, SESSION_ID) as {
      markdown: string
      artifactId: string
      uri: string
      sha256: string
      bytes: number
    }
    expect(report.artifactId).toBe('artifact-1')
    const absolute = fileURLToPath(report.uri)
    const onDisk = readFileSync(absolute, 'utf8')
    expect(onDisk).toBe(report.markdown)
    expect(report.bytes).toBe(Buffer.byteLength(report.markdown, 'utf8'))
  })

  it('a repeat sast_start_scan on the same session does not delete previously delivered report_artifacts rows', async () => {
    const { call, getReportArtifact } = await sastHarness({ reportRoot: root })
    await call('sast_start_scan', { repoUrl: root, objective: 'first pass', authorization: 'ok' }, SESSION_ID)
    const first = await call('sast_report', {}, SESSION_ID) as { artifactId: string }
    await call('sast_start_scan', { repoUrl: root, objective: 'second pass', authorization: 'ok' }, SESSION_ID)
    expect(await getReportArtifact(first.artifactId)).toBeDefined()
  })
})
