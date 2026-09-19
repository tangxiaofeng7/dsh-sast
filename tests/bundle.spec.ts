/**
 * The sast bundle package: the patch layer parses and names the rows it
 * composes, and the shipped manifest declares the sqlite backend's runtime
 * import contract. The inert node loader seat (`lib/index.js`) mounts
 * without a host context.
 *
 * `npm run build` regenerates every `lib/**\/*.js` file from the `src/`
 * snapshots (host plugin from `src/dsh-sast`, batch control plane from
 * `src/dsh-sast/src/batch-plugin.ts`, browser half from
 * `src/dsh-client-ui-sast`) — this file also asserts the shape of that
 * output: every `exports` entry resolves to a file that exists on disk, the
 * browser half is a `window.__ModuleLoader__.load(...)` factory keyed by
 * the exact package name and carries xyflow's inlined global styles, and
 * `files` covers every exported path so a published tarball is never a
 * partial shell.
 * @module
 */

import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import * as yaml from 'js-yaml'
import { describe, expect, it } from 'vitest'
import { apply as nodeApply } from '../lib/index.js'

const PATCH_PATH = fileURLToPath(new URL('../cordis.patch.yml', import.meta.url))
const PACKAGE_PATH = fileURLToPath(new URL('../package.json', import.meta.url))
const AGENT_PRESET_PATH = fileURLToPath(new URL('../preset/sast/agent.cordis.yml', import.meta.url))
const PRESET_YML_PATH = fileURLToPath(new URL('../preset/sast/preset.yml', import.meta.url))
const CLIENT_BUNDLE_PATH = fileURLToPath(new URL('../lib/ui-sast.client.js', import.meta.url))

/**
 * Whether one repo-relative path is covered by one `package.json` `files`
 * glob entry. Only the shapes this manifest actually uses need supporting:
 * a literal path, a `dir/**` prefix, or a `dir/**\/*.ext` suffix match.
 */
function coveredByFilesEntry(relativePath: string, pattern: string): boolean {
  if (pattern === relativePath) return true
  if (pattern.endsWith('/**')) return relativePath.startsWith(pattern.slice(0, -2))
  const starIndex = pattern.indexOf('**/')
  if (starIndex === -1) return false
  const prefix = pattern.slice(0, starIndex)
  const suffix = pattern.slice(starIndex + 3)
  return relativePath.startsWith(prefix) && relativePath.endsWith(suffix.replace('*', ''))
}

/** The loader's `!!js` scalar: parse as its raw expression string. */
const jsExprTag = new yaml.Type('tag:yaml.org,2002:js', {
  kind: 'scalar',
  resolve: (data: unknown) => typeof data === 'string',
  construct: (data: unknown) => data,
})
const patchSchema = yaml.JSON_SCHEMA.extend(jsExprTag)

describe('sast bundle', () => {
  it('the node apply is an inert loader seat', () => {
    expect(() => { nodeApply() }).not.toThrow()
  })

  it('the patch layer declares the UI and storage rows, and the route override', () => {
    const patch = yaml.load(readFileSync(PATCH_PATH, 'utf8'), { schema: patchSchema }) as Array<Record<string, unknown>>
    const insert = patch.find(entry => entry.insert !== undefined)
    expect(insert).toBeDefined()
    const rows = (insert!['insert'] as Array<{ id: string; name: string }>).map(row => ({ id: row.id, name: row.name }))
    // Every row resolves to a subpath of the self-contained bundle package,
    // so a single tarball installs the whole mode. The storage row's id is
    // package-scoped (`sast-storage-sqlite`, not the generic
    // `storage-sqlite`) — a sibling bundle (e.g. dsh-pentest) installed
    // alongside this one would otherwise crash the whole profile at boot
    // with "duplicate loader entry id: storage-sqlite" (reproduced against
    // a real host with both bundles installed; see V13 in plan.md).
    expect(rows).toEqual([
      { id: 'ui-sast', name: '@tangxiaofeng7/dsh-sast' },
      { id: 'sast-storage-sqlite', name: '@tangxiaofeng7/dsh-sast/storage-sqlite' },
    ])
    const sqlite = insert!['insert'].find((row: { id: string }) => row.id === 'sast-storage-sqlite') as { config?: { path?: string } }
    expect(sqlite.config).toEqual({ path: "dshHomePath('storages', 'sast-sessions.db')" })
    const override = patch.find(entry => entry.id === 'storage-domain') as { config: { backend: string; routes: Record<string, string> } }
    expect(override.config).toMatchObject({ backend: 'json', routes: { sast: 'sqlite' } })
    const presetRoot = patch.find(entry => {
      const inserted = entry.insert as Array<{ id: string; name: string }> | undefined
      return inserted?.some(row => row.id === 'sast-preset-root')
    })
    expect(presetRoot).toBeDefined()
    expect((presetRoot!.insert as Array<{ id: string; name: string }>)).toEqual([
      { id: 'sast-preset-root', name: '@tangxiaofeng7/dsh-sast/preset-root' },
    ])
  })

  it('every patch row id is package-scoped, never a generic name a sibling bundle could collide on', () => {
    // Cordis loader entry ids must be unique within their scope regardless
    // of which package registers them — a bare generic id like
    // "storage-sqlite" collides the instant a sibling bundle (dsh-pentest)
    // picks the same generic name for its own equivalent row, crashing the
    // whole profile at boot rather than merely overriding a route.
    const patch = yaml.load(readFileSync(PATCH_PATH, 'utf8'), { schema: patchSchema }) as Array<Record<string, unknown>>
    const genericIds = ['storage-sqlite', 'preset-root', 'ui', 'storage']
    const allIds: string[] = []
    for (const entry of patch) {
      const inserted = entry.insert as Array<{ id?: string }> | undefined
      if (inserted !== undefined) allIds.push(...inserted.map(row => row.id).filter((id): id is string => id !== undefined))
      if (typeof entry.id === 'string') allIds.push(entry.id)
    }
    expect(allIds.length).toBeGreaterThan(0)
    for (const id of allIds) {
      if (id === 'storage-domain') continue // the one row this patch legitimately targets by its host-defined generic id, not one it defines
      expect(genericIds).not.toContain(id)
    }
  })

  it('declares the sqlite backend runtime import contract', () => {
    const manifest = JSON.parse(readFileSync(PACKAGE_PATH, 'utf8')) as {
      name?: string
      dependencies?: Record<string, string>
      peerDependencies?: Record<string, string>
      peerDependenciesMeta?: unknown
    }
    expect(manifest.name).toBe('@tangxiaofeng7/dsh-sast')
    expect(manifest.dependencies?.['@deepseek-ai/schemastery']).toBe('3.18.1')
    expect(manifest.peerDependencies?.['@deepseek-ai/dsh-storage']).toBe('0.1.0-rc.6')
    expect(manifest.peerDependencies?.['@deepseek-ai/dsh-storage-domain']).toBe('0.1.0-rc.6')
    expect(manifest.peerDependencies?.['@deepseek-ai/dsh-tools']).toBe('0.1.0-rc.6')
    expect(manifest.peerDependenciesMeta).toBeUndefined()
  })

  it('declares OSS metadata and ships its own LICENSE (P4.6)', () => {
    // package.json claims "license": "MIT" — MIT requires the license text
    // to travel with the software, and a publishable manifest with no
    // repository/homepage/bugs is unusual enough to look like an oversight.
    const manifest = JSON.parse(readFileSync(PACKAGE_PATH, 'utf8')) as {
      license?: string
      repository?: { url?: string }
      homepage?: string
      bugs?: { url?: string }
      author?: string
      files?: string[]
    }
    expect(manifest.license).toBe('MIT')
    expect(manifest.repository?.url).toContain('tangxiaofeng7/dsh-sast')
    expect(manifest.homepage).toBeTruthy()
    expect(manifest.bugs?.url).toBeTruthy()
    expect(manifest.author).toBeTruthy()
    expect(manifest.files ?? []).toContain('LICENSE')
    const licensePath = fileURLToPath(new URL('../LICENSE', import.meta.url))
    expect(existsSync(licensePath)).toBe(true)
    expect(readFileSync(licensePath, 'utf8')).toContain('MIT License')
  })

  it('the vendored sqlite backend declares its real upstream license and version, never a fabricated one', () => {
    // P4.5: this project's own code is MIT, but packages/dsh-storage-sqlite/
    // is a vendored build of upstream @deepseek-ai/dsh-storage-sqlite — the
    // vendored files are byte-identical to the 0.1.0-rc.6 npm release, so the
    // manifest must say exactly that version and license, not an invented
    // one, and the LICENSE/NOTICE pair must exist so the terms travel with
    // the vendored code.
    const vendoredPackagePath = fileURLToPath(new URL('../packages/dsh-storage-sqlite/package.json', import.meta.url))
    const vendored = JSON.parse(readFileSync(vendoredPackagePath, 'utf8')) as { name?: string; version?: string; license?: string; private?: boolean }
    expect(vendored.name).toBe('@deepseek-ai/dsh-storage-sqlite')
    expect(vendored.version).toBe('0.1.0-rc.6')
    expect(vendored.license).toBe('MIT')
    expect(vendored.private).toBe(true)
    const licensePath = fileURLToPath(new URL('../packages/dsh-storage-sqlite/LICENSE', import.meta.url))
    const noticePath = fileURLToPath(new URL('../packages/dsh-storage-sqlite/NOTICE', import.meta.url))
    expect(existsSync(licensePath)).toBe(true)
    expect(readFileSync(licensePath, 'utf8')).toContain('MIT License')
    expect(existsSync(noticePath)).toBe(true)
    expect(readFileSync(noticePath, 'utf8')).toContain('0.1.0-rc.6')
  })

  it('exports the batch scheduler at ./batch-scheduler, backed by a real file (M5, spike-D-verified)', () => {
    const manifest = JSON.parse(readFileSync(PACKAGE_PATH, 'utf8')) as { exports?: Record<string, unknown> }
    expect(manifest.exports?.['./batch-scheduler']).toBe('./lib/batch-scheduler.js')
    expect(existsSync(fileURLToPath(new URL('../lib/batch-scheduler.js', import.meta.url)))).toBe(true)
  })

  it('preset.yml declares the white-box audit mode name and description', () => {
    const preset = yaml.load(readFileSync(PRESET_YML_PATH, 'utf8')) as { name?: string; description?: string }
    expect(preset.name).toBe('白盒审计模式')
    expect(preset.description).toContain('白盒 SAST 工作流')
  })

  it('agent.cordis.yml has no shell rows at all (ADR-04)', () => {
    const rows = yaml.load(readFileSync(AGENT_PRESET_PATH, 'utf8'), { schema: patchSchema }) as Array<{ id?: string; name?: string }>
    const ids = rows.map(row => row.id)
    expect(ids).not.toContain('tool-bash')
    expect(ids).not.toContain('tool-pwsh')
    expect(ids).not.toContain('tool-jobs')
  })

  it('agent.cordis.yml mounts sast/sast-batch under an isolate realm shielding their shared services from the root realm', () => {
    const rows = yaml.load(readFileSync(AGENT_PRESET_PATH, 'utf8'), { schema: patchSchema }) as Array<{ id?: string; name?: string; group?: boolean; isolate?: Record<string, unknown>; config?: Array<{ id?: string; name?: string }> }>
    const domainRow = rows.find(row => row.id === 'sast-domain')
    expect(domainRow?.group).toBe(true)
    // A bare ctx.provide() with no isolate realm publishes into the ROOT
    // realm (process-global) — rejected by a real host's preset-mount
    // validator with "row(s) published process-global service(s)" the
    // moment a second session tries to mount the same preset. Verified
    // against a real agentPreset.select call.
    expect(domainRow?.isolate?.sastStore).toBe(true)
    expect(domainRow?.isolate?.sastBatchLineageOf).toBe(true)
    const sastRow = domainRow?.config?.find(row => row.id === 'sast')
    expect(sastRow?.name).toBe('@tangxiaofeng7/dsh-sast/sast')
    const sastBatchRow = domainRow?.config?.find(row => row.id === 'sast-batch')
    expect(sastBatchRow?.name).toBe('@tangxiaofeng7/dsh-sast/batch-scheduler')
  })

  it('every subagent tool row denies every decision tool and delegation, and names no unregistered shell/background-job tool', () => {
    const rows = yaml.load(readFileSync(AGENT_PRESET_PATH, 'utf8'), { schema: patchSchema }) as Array<{ id?: string; config?: Array<{ id: string; config?: { toolFilter?: { deny?: string[] } } }> }>
    const delegation = rows.find(row => row.id === 'delegation')
    expect(delegation).toBeDefined()
    const subagentRows = delegation!.config!.filter(row => row.id === 'tool-subagent' || row.id === 'tool-subagent-fork')
    expect(subagentRows).toHaveLength(2)
    const decisionTools = [
      'sast_start_scan', 'sast_register_skill', 'sast_set_skill_enabled', 'sast_add_intent',
      'sast_update_intent', 'sast_add_fact', 'sast_add_finding', 'sast_add_asset', 'sast_triage',
      'sast_state', 'sast_graph', 'sast_coverage', 'sast_report',
      'sast_start_batch', 'sast_batch_state', 'sast_batch_report', 'sast_batch_resolve',
    ]
    for (const row of subagentRows) {
      const deny = row.config?.toolFilter?.deny ?? []
      for (const tool of [...decisionTools, 'subagent', 'subagent_fork']) {
        expect(deny).toContain(tool)
      }
      // bash/pwsh/run_in_background must NOT appear here: this preset never
      // registers those tools globally (no shell rows anywhere, ADR-04), and
      // a real host's tools.restrict() throws "unknown global tool" for a
      // denied name that was never registered — reproduced against a real
      // dsh host, where every subagent spawn failed until these three names
      // were removed. Their absence from the preset IS the safety
      // guarantee; naming them in deny is not defense-in-depth, it is a
      // fatal error at agent-creation time.
      for (const tool of ['bash', 'pwsh', 'run_in_background']) {
        expect(deny).not.toContain(tool)
      }
    }
  })

  it('agent.cordis.yml never names bash/pwsh/run_in_background in any toolFilter.deny (they are never registered, so denying them is a fatal tools.restrict() error, not defense-in-depth)', () => {
    const raw = readFileSync(AGENT_PRESET_PATH, 'utf8')
    const rows = yaml.load(raw, { schema: patchSchema }) as unknown
    const denyLists: string[][] = []
    const walk = (node: unknown): void => {
      if (Array.isArray(node)) { node.forEach(walk); return }
      if (node !== null && typeof node === 'object') {
        const obj = node as Record<string, unknown>
        if (Array.isArray(obj.deny)) denyLists.push(obj.deny as string[])
        Object.values(obj).forEach(walk)
      }
    }
    walk(rows)
    expect(denyLists.length).toBeGreaterThan(0)
    for (const deny of denyLists) {
      for (const tool of ['bash', 'pwsh', 'run_in_background']) {
        expect(deny).not.toContain(tool)
      }
    }
  })

  it('every ./lib/*.js export path exists on disk', () => {
    const manifest = JSON.parse(readFileSync(PACKAGE_PATH, 'utf8')) as { exports?: Record<string, string> }
    for (const [subpath, target] of Object.entries(manifest.exports ?? {})) {
      if (!target.startsWith('./lib/')) continue
      expect(existsSync(fileURLToPath(new URL(`../${target}`, import.meta.url))), `${subpath} -> ${target}`).toBe(true)
    }
  })

  it('the `files` field covers every exports target', () => {
    const manifest = JSON.parse(readFileSync(PACKAGE_PATH, 'utf8')) as { exports?: Record<string, string>; files?: string[] }
    const files = manifest.files ?? []
    // npm always includes package.json regardless of `files`.
    const alwaysIncluded = new Set(['package.json'])
    for (const [subpath, target] of Object.entries(manifest.exports ?? {})) {
      if (!target.startsWith('./')) continue
      if (!target.startsWith('./')) continue
      const relative = target.slice(2)
      if (alwaysIncluded.has(relative)) continue
      const covered = files.some(pattern => coveredByFilesEntry(relative, pattern))
      expect(covered, `${relative} not covered by any files[] entry`).toBe(true)
    }
  })

  it('lib/ui-sast.client.js is a window.__ModuleLoader__.load(...) factory keyed by the exact package name', () => {
    const manifest = JSON.parse(readFileSync(PACKAGE_PATH, 'utf8')) as { name?: string }
    const code = readFileSync(CLIENT_BUNDLE_PATH, 'utf8')
    expect(code.startsWith('window.__ModuleLoader__.load(')).toBe(true)
    expect(code).toContain(`id: ${JSON.stringify(manifest.name)}`)
  })

  it('lib/ui-sast.client.js inlines xyflow\'s global styles', () => {
    const code = readFileSync(CLIENT_BUNDLE_PATH, 'utf8')
    expect(code).toContain('react-flow__')
  })

  it('lib/ui-sast.client.js carries no reference to the old sub-package name', () => {
    const code = readFileSync(CLIENT_BUNDLE_PATH, 'utf8')
    expect(code).not.toContain('@deepseek-ai/dsh-client-ui-sast')
  })
})
