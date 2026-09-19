/**
 * Shared `report_artifacts` allocator/store (M4+M5): both `SastStore`
 * (single-repo `sast_report`) and `BatchStore` (`sast_batch_report`, pinned
 * methodology content) write into the SAME domain table, so they must share
 * ONE id counter and ONE write queue for it — two independently-cached
 * counters over the same table could allocate the same `artifact-<n>` id
 * once both stores are composed together against the same open domain
 * (M5's `index.ts` wiring). Constructed once by the composing plugin and
 * passed to both stores, rather than each store owning its own instance.
 * @module @tangxiaofeng7/dsh-sast-host/src/report/artifact-store
 */

import type { Domain } from '@deepseek-ai/dsh-storage-domain'
import type { sastDomainSpec, SastReportArtifact } from '../spec.ts'

/** Copy and freeze one record before it crosses the service boundary. */
function snapshot<T extends object>(value: T): T {
  return Object.freeze({ ...value })
}

/**
 * Owning handle for the `report_artifacts` table — the single writer both
 * `SastStore` and `BatchStore` delegate to once M5 composes them against
 * the same domain.
 */
export class ReportArtifactStore {
  private queue: Promise<void> = Promise.resolve()
  private counter: number | undefined

  constructor(
    private readonly domain: () => Promise<Domain<typeof sastDomainSpec>>,
    private readonly now: () => number = () => Date.now(),
  ) {}

  /** Serialize id allocation and writes across every caller (SastStore and BatchStore alike). */
  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const current = this.queue.then(operation)
    this.queue = current.then(() => undefined, () => undefined)
    return current
  }

  private async nextId(): Promise<string> {
    if (this.counter === undefined) {
      let max = 0
      for (const [, row] of (await this.domain()).table('report_artifacts').entries()) {
        const seq = /^artifact-(\d+)$/.exec(row.id)?.[1]
        if (seq !== undefined) max = Math.max(max, Number(seq))
      }
      this.counter = max
    }
    this.counter += 1
    return `artifact-${this.counter}`
  }

  /** Allocate an id and clock value, then persist one report artifact row. */
  async put(fields: Omit<SastReportArtifact, 'id' | 'createdAt'>): Promise<SastReportArtifact> {
    return this.enqueue(async () => {
      const id = await this.nextId()
      const record = snapshot<SastReportArtifact>({ id, ...fields, createdAt: this.now() })
      await (await this.domain()).table('report_artifacts').put(id, record)
      return record
    })
  }

  /** Read one report artifact row by its durable id, if present. */
  async get(id: string): Promise<SastReportArtifact | undefined> {
    return (await this.domain()).table('report_artifacts').get(id)
  }

  /** Reset in-memory state (mirrors the owning store's own `dispose()`). Never resets the underlying table. */
  reset(): void {
    this.counter = undefined
    this.queue = Promise.resolve()
  }
}
