/**
 * Report artifact persistence (M4, `report_artifacts` table): writes a
 * finished report to disk under a configured root and returns the
 * durable-record fields a `SastStore` write needs — digest, byte count, and
 * URI. A pure I/O boundary, independent of the domain: `sha256` is computed
 * over the exact `Buffer` written (not the source string, to avoid encoding
 * ambiguity for multi-byte content). `id` and `createdAt` are NOT assigned
 * here — like every other durable write in this package, those come from
 * `SastStore.putReportArtifact` (deterministic id allocation, injected
 * clock, ADR-10), never from this I/O-only boundary.
 * @module @tangxiaofeng7/dsh-sast-host/src/report/artifacts
 */

import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { SastReportArtifact } from '../spec.ts'

/** File extension for each artifact kind (matches its `content` format). */
const EXTENSION_OF_KIND: Record<SastReportArtifact['kind'], string> = {
  'repo-markdown': 'md',
  'repo-sarif': 'sarif.json',
  'repo-summary': 'json',
  'batch-markdown': 'md',
  'batch-json': 'json',
  'methodology-content': 'md',
}

/** Input to {@link writeArtifact}: everything needed to place and write one report file. */
export interface WriteArtifactInput {
  /** Directory artifacts are written under (typically `$DSH_HOME/sast-reports`, see `SastToolsConfig.reportRoot`). */
  readonly root: string
  /** The owning repository-worker session id (used to namespace the on-disk path for a non-batch artifact). */
  readonly sessionId: string
  /** Present only for a batch-scoped artifact (`batch-markdown` / `batch-json` / `methodology-content`). */
  readonly batchId?: string
  /** Present only for a per-job artifact written by a batch repository worker. */
  readonly jobId?: string
  readonly kind: SastReportArtifact['kind']
  /**
   * Discriminator appended to the filename for a kind that may recur more
   * than once per batch/session (currently only `methodology-content`, one
   * per pinned methodology name) — must already be a safe filename segment
   * (a validated Skill name, never raw model input).
   */
  readonly nameHint?: string
  /** The report's rendered content (Markdown text, or SARIF/JSON serialized to a string). */
  readonly content: string
}

/** Everything {@link writeArtifact} produces for the store to persist (all of `SastReportArtifact` except the store-assigned `id`/`createdAt`). */
export type WrittenArtifact = Omit<SastReportArtifact, 'id' | 'createdAt'>

/**
 * Directory an artifact of one session/batch is written under:
 * `<root>/<batchId>/<jobId>` when both are known (a batch job's own report),
 * `<root>/<batchId>` for a batch-scoped rollup, otherwise `<root>/<sessionId>`
 * for a plain single-repo session.
 */
function artifactDir(root: string, sessionId: string, batchId: string | undefined, jobId: string | undefined): string {
  if (batchId !== undefined && jobId !== undefined) return join(root, batchId, jobId)
  if (batchId !== undefined) return join(root, batchId)
  return join(root, sessionId)
}

/**
 * Write one report artifact to disk under `root` and return the fields
 * `SastStore.putReportArtifact` needs to persist it. The written path never
 * escapes `root` — it is built entirely from validated internal identifiers
 * (session/batch/job ids, a fixed per-kind filename, an optional caller-
 * validated `nameHint`), never from model-supplied content.
 */
export async function writeArtifact(input: WriteArtifactInput): Promise<WrittenArtifact> {
  const rootAbsolute = resolve(input.root)
  const dir = artifactDir(rootAbsolute, input.sessionId, input.batchId, input.jobId)
  const filename = input.nameHint !== undefined
    ? `${input.kind}-${input.nameHint}.${EXTENSION_OF_KIND[input.kind]}`
    : `${input.kind}.${EXTENSION_OF_KIND[input.kind]}`
  const absolute = resolve(dir, filename)
  if (absolute !== rootAbsolute && !absolute.startsWith(rootAbsolute + sep)) {
    // Defensive: every path component above is a fixed literal or a
    // validated internal id (session/batch/job id), so this can only trip on
    // a caller bug, not model input.
    throw new Error(`sast: report artifact path ${absolute} escaped its root`)
  }
  await mkdir(dir, { recursive: true })
  const buffer = Buffer.from(input.content, 'utf8')
  await writeFile(absolute, buffer)
  return {
    ...(input.batchId !== undefined ? { batchId: input.batchId } : {}),
    ...(input.jobId !== undefined ? { jobId: input.jobId } : {}),
    kind: input.kind,
    uri: pathToFileURL(absolute).toString(),
    sha256: createHash('sha256').update(buffer).digest('hex'),
    bytes: buffer.byteLength,
  }
}
