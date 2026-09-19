/**
 * `MethodologyArtifactStore` (M5): resolves the user-named audit
 * methodologies a batch pins at creation time into the
 * `sastBatchSchema.methodologies` entries — name, `manifestDigest` (the
 * check-list digest `parseSkillManifest` already computes),
 * `contentDigest` (a sha256 over the resolved Skill's full body), and
 * `artifactId` (a read-only durable copy of that body, written through the
 * same `report/artifacts.ts` boundary M4 already uses).
 *
 * ADR-14/15 discipline: lookup uses the caller's OWN trusted scope/cwd,
 * never `scan.workspacePath` — the cloned repository is untrusted input and
 * must never become a Skill lookup root, so `cwd` is deliberately not a
 * parameter here; callers pass whatever trusted cwd their own session
 * already resolves Skills against. A batch fixes each methodology's digest
 * ONCE at creation (A22): every job in that batch reads the SAME pinned
 * content, so a mid-batch edit to the source Skill file never reaches
 * later jobs — this module's whole job is making that pin durable and
 * independent of anything still on disk.
 * @module @tangxiaofeng7/dsh-sast-host/src/batch/methodology
 */

import { createHash } from 'node:crypto'
import { writeArtifact, type WrittenArtifact } from '../report/artifacts.ts'
import { parseSkillManifest, type ResolvedSkillLike } from '../skill-manifest.ts'

/** One methodology reference as `sastBatchSchema.methodologies` stores it, minus the store-assigned `artifactId`. */
export interface PinnedMethodology {
  readonly name: string
  readonly manifestDigest: string
  readonly contentDigest: string
}

/** The full resolved Skill this module reads (`parseSkillManifest`'s input plus the body `content` it deliberately does not digest into `manifestDigest`). */
export type ResolvedMethodologySkill = ResolvedSkillLike & { readonly content: string }

/** Minimal trusted resolver this module depends on — a subset of `ctx.skills.get()`, narrowed for testability and to make the "never the cloned workspace" contract a type-level fact (no `cwd` parameter reaches this interface at all). */
export interface MethodologyResolver {
  /** Resolve one methodology by its exact registered name, or `undefined` if unknown. */
  resolve(name: string): Promise<ResolvedMethodologySkill | undefined>
}

/** One pinned methodology's fields, everything {@link pinMethodologies} produces before batch/job ids are assigned. */
export interface PinnedMethodologyArtifact {
  readonly methodology: PinnedMethodology
  readonly artifact: WrittenArtifact
}

/**
 * Resolve and pin every named methodology for one batch. Throws (naming the
 * unresolvable name) if any name fails to resolve or fails manifest
 * validation — batch creation is all-or-nothing (docs/architecture.md §3's
 * "非法定义不产生部分快照" ADR-16 discipline), so a partial pin set must
 * never reach the caller.
 */
export async function pinMethodologies(
  resolver: MethodologyResolver,
  names: readonly string[],
  writeRoot: { readonly root: string; readonly sessionId: string; readonly batchId: string },
): Promise<PinnedMethodologyArtifact[]> {
  const pinned: PinnedMethodologyArtifact[] = []
  for (const name of names) {
    const skill = await resolver.resolve(name)
    if (skill === undefined) {
      throw new Error(`sast: methodology '${name}' could not be resolved from the trusted Skill registry`)
    }
    // Validates the manifest (throws with an actionable message on any
    // malformation) and computes manifestDigest; content/body is
    // deliberately excluded from that digest (skill-manifest.ts), so it is
    // digested here instead.
    const manifest = parseSkillManifest(skill)
    const contentDigest = createHash('sha256').update(skill.content, 'utf8').digest('hex')
    const artifact = await writeArtifact({
      root: writeRoot.root,
      sessionId: writeRoot.sessionId,
      batchId: writeRoot.batchId,
      kind: 'methodology-content',
      nameHint: name,
      content: skill.content,
    })
    pinned.push({
      methodology: { name, manifestDigest: manifest.manifestDigest, contentDigest },
      artifact,
    })
  }
  return pinned
}
