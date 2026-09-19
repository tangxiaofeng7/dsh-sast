/**
 * @module
 */

import { describe, expect, it } from 'vitest'
import { buildBatchJsonReport, buildBatchMarkdownReport, type BatchReportJobRow, type JobSummary } from '../../src/batch/report.ts'
import type { SastBatch, SastScanJob } from '../../src/spec.ts'

function batchFixture(overrides: Partial<SastBatch> = {}): SastBatch {
  return {
    id: 'batch-1',
    ownerSessionId: 'owner-1',
    objective: '审计全部支付相关仓库',
    authorization: 'CTO 签字授权',
    methodologies: [],
    methodologyMode: 'explicit-only',
    policy: { maxAttempts: 2, autoNarrowScope: true, deduplicate: true, concurrency: 1 },
    status: 'completed',
    total: 3,
    createdAt: 1000,
    ...overrides,
  }
}

function jobFixture(overrides: Partial<SastScanJob> = {}): SastScanJob {
  return {
    id: `job-${overrides.ordinal ?? 1}`,
    batchId: 'batch-1',
    ordinal: 1,
    repoSpec: { provider: 'local', repoUrl: '/repo-1', scope: [] },
    attempt: 1,
    status: 'succeeded',
    reviewStatus: 'none',
    createdAt: 1000,
    updatedAt: 1000,
    ...overrides,
  }
}

function summaryFixture(overrides: Partial<JobSummary> = {}): JobSummary {
  return {
    findingsBySeverity: { high: 1 },
    fileCoverageRatio: 0.8,
    checkCompletionRatio: 1,
    ...overrides,
  }
}

function rowsFixture(): BatchReportJobRow[] {
  return [
    { job: jobFixture({ ordinal: 1, repoSpec: { provider: 'local', repoUrl: '/repo-1', scope: [] } }), summary: summaryFixture({ findingsBySeverity: { critical: 1, high: 2 } }) },
    { job: jobFixture({ ordinal: 2, repoSpec: { provider: 'local', repoUrl: '/repo-2', scope: [] }, status: 'skipped', reviewStatus: 'pending', fallback: 'authentication failed' }), summary: summaryFixture({ findingsBySeverity: {}, fileCoverageRatio: undefined, checkCompletionRatio: undefined }) },
    { job: jobFixture({ ordinal: 3, repoSpec: { provider: 'local', repoUrl: '/repo-3', scope: [] }, status: 'degraded', reviewStatus: 'pending', fallback: 'unresolved blocked check' }), summary: summaryFixture({ findingsBySeverity: { medium: 3 } }) },
  ]
}

describe('buildBatchMarkdownReport', () => {
  it('lists every job exactly once, sorted by ordinal', () => {
    const report = buildBatchMarkdownReport(batchFixture(), rowsFixture())
    expect(report).toContain('### 1. /repo-1')
    expect(report).toContain('### 2. /repo-2')
    expect(report).toContain('### 3. /repo-3')
    expect(report.indexOf('### 1.')).toBeLessThan(report.indexOf('### 2.'))
    expect(report.indexOf('### 2.')).toBeLessThan(report.indexOf('### 3.'))
  })

  it('aggregates severity totals as the sum of each job\'s own summary (A20)', () => {
    const report = buildBatchMarkdownReport(batchFixture(), rowsFixture())
    // critical: 1 (job1) + 0 + 0 = 1; high: 2 (job1) + 0 + 0 = 2; medium: 0 + 0 + 3 (job3) = 3
    expect(report).toContain('critical 1 / high 2 / medium 3 / low 0 / info 0')
  })

  it('renders a skipped/unmeasured job\'s coverage as unknown, never as 0%', () => {
    const report = buildBatchMarkdownReport(batchFixture(), rowsFixture())
    const repo2Section = report.slice(report.indexOf('### 2.'), report.indexOf('### 3.'))
    expect(repo2Section).toContain('unknown（未审）')
    expect(repo2Section).not.toContain('0%')
  })

  it('renders a measured job\'s coverage as a real percentage', () => {
    const report = buildBatchMarkdownReport(batchFixture(), rowsFixture())
    const repo1Section = report.slice(report.indexOf('### 1.'), report.indexOf('### 2.'))
    expect(repo1Section).toContain('80%')
    expect(repo1Section).toContain('100%')
  })

  it('lists every reviewStatus=pending job in the Review Inbox section, and excludes reviewStatus=none jobs', () => {
    const report = buildBatchMarkdownReport(batchFixture(), rowsFixture())
    const reviewSection = report.slice(report.indexOf('## 待确认'))
    expect(reviewSection).toContain('ordinal 2')
    expect(reviewSection).toContain('authentication failed')
    expect(reviewSection).toContain('ordinal 3')
    expect(reviewSection).toContain('unresolved blocked check')
    expect(reviewSection).not.toContain('ordinal 1')
  })

  it('reports "0 findings" (not blank) for a job with an empty findingsBySeverity', () => {
    const report = buildBatchMarkdownReport(batchFixture(), rowsFixture())
    const repo2Section = report.slice(report.indexOf('### 2.'), report.indexOf('### 3.'))
    expect(repo2Section).toContain('0 findings')
  })

  it('handles a batch with zero rows without throwing', () => {
    const report = buildBatchMarkdownReport(batchFixture({ total: 0 }), [])
    expect(report).toContain('critical 0 / high 0 / medium 0 / low 0 / info 0')
    expect(report).toContain('待确认项: 0')
  })
})

describe('buildBatchJsonReport', () => {
  it('every input appears exactly once, keyed by ordinal', () => {
    const json = buildBatchJsonReport(batchFixture(), rowsFixture())
    expect(json.jobs).toHaveLength(3)
    expect(json.jobs.map(j => j.ordinal)).toEqual([1, 2, 3])
  })

  it('totals equal the sum of each job\'s own findingsBySeverity (A20)', () => {
    const json = buildBatchJsonReport(batchFixture(), rowsFixture())
    expect(json.totals).toEqual({ critical: 1, high: 2, medium: 3, low: 0, info: 0 })
  })

  it('represents an unmeasured ratio as the literal string "unknown", never as 0', () => {
    const json = buildBatchJsonReport(batchFixture(), rowsFixture())
    const repo2 = json.jobs.find(j => j.repoUrl === '/repo-2')
    expect(repo2?.fileCoverageRatio).toBe('unknown')
    expect(repo2?.checkCompletionRatio).toBe('unknown')
  })

  it('represents a measured ratio as its real number', () => {
    const json = buildBatchJsonReport(batchFixture(), rowsFixture())
    const repo1 = json.jobs.find(j => j.repoUrl === '/repo-1')
    expect(repo1?.fileCoverageRatio).toBe(0.8)
  })

  it('carries reportArtifactId through when the job has one, omits it otherwise', () => {
    const rows = rowsFixture()
    const withArtifact: BatchReportJobRow = { ...rows[0], job: { ...rows[0].job, reportArtifactId: 'artifact-7' } }
    const json = buildBatchJsonReport(batchFixture(), [withArtifact, rows[1], rows[2]])
    expect(json.jobs[0].reportArtifactId).toBe('artifact-7')
    expect(json.jobs[1]).not.toHaveProperty('reportArtifactId')
  })
})
