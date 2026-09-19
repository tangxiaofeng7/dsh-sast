/**
 * Repository metadata heuristics: language detection by file extension,
 * dependency-manifest discovery, and entrypoint hints — all feed
 * `sast_start_scan`'s return value so the decision agent can plan its audit
 * without first delegating a full read pass.
 * @module @tangxiaofeng7/dsh-sast-host/src/ingest/metadata
 */

import { readdir } from 'node:fs/promises'
import { join, relative } from 'node:path'

/** File extension → language name, by prevalence heuristic. */
const LANGUAGE_BY_EXTENSION: Record<string, string> = {
  '.ts': 'typescript', '.tsx': 'typescript', '.js': 'javascript', '.jsx': 'javascript', '.mjs': 'javascript', '.cjs': 'javascript',
  '.py': 'python', '.java': 'java', '.kt': 'kotlin', '.go': 'go', '.rb': 'ruby', '.php': 'php', '.cs': 'csharp',
  '.c': 'c', '.h': 'c', '.cpp': 'cpp', '.cc': 'cpp', '.hpp': 'cpp', '.rs': 'rust', '.swift': 'swift', '.scala': 'scala',
}

/** Known dependency-manifest filenames, by ecosystem prevalence. */
const DEPENDENCY_MANIFEST_NAMES = new Set([
  'package.json', 'requirements.txt', 'pyproject.toml', 'Pipfile', 'pom.xml', 'build.gradle', 'build.gradle.kts',
  'go.mod', 'Gemfile', 'composer.json', 'Cargo.toml', 'packages.config', '*.csproj',
])

/** Known entrypoint-hint filenames/paths, by framework prevalence. */
const ENTRYPOINT_HINT_NAMES = new Set([
  'main.py', 'app.py', 'manage.py', 'wsgi.py', 'asgi.py',
  'index.js', 'index.ts', 'server.js', 'server.ts', 'main.go', 'main.rs',
])

const IGNORED_DIR_NAMES = new Set(['.git', 'node_modules', 'vendor', 'dist', 'build', '.venv', 'venv', '__pycache__'])

/** Result of scanning the workspace for language/dependency/entrypoint signals. */
export interface RepoMetadata {
  readonly languages: readonly string[]
  readonly dependencyManifests: readonly string[]
  readonly entrypointHints: readonly string[]
  readonly fileCount: number
}

/**
 * Walk `workspacePath` once, tallying language extensions and collecting
 * repo-relative paths of every recognized dependency manifest or entrypoint
 * hint. Languages are returned most-prevalent first.
 */
export async function collectRepoMetadata(workspacePath: string): Promise<RepoMetadata> {
  const languageCounts = new Map<string, number>()
  const dependencyManifests: string[] = []
  const entrypointHints: string[] = []
  let fileCount = 0

  async function walk(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory() && IGNORED_DIR_NAMES.has(entry.name)) continue
      const entryPath = join(dir, entry.name)
      if (entry.isSymbolicLink()) continue
      if (entry.isDirectory()) {
        await walk(entryPath)
        continue
      }
      if (!entry.isFile()) continue
      fileCount += 1
      const relativePath = relative(workspacePath, entryPath)
      const extension = extensionOf(entry.name)
      const language = LANGUAGE_BY_EXTENSION[extension]
      if (language !== undefined) languageCounts.set(language, (languageCounts.get(language) ?? 0) + 1)
      if (DEPENDENCY_MANIFEST_NAMES.has(entry.name)) dependencyManifests.push(relativePath)
      if (ENTRYPOINT_HINT_NAMES.has(entry.name)) entrypointHints.push(relativePath)
    }
  }

  await walk(workspacePath)
  const languages = [...languageCounts.entries()].sort((a, b) => b[1] - a[1]).map(([language]) => language)
  return { languages, dependencyManifests, entrypointHints, fileCount }
}

function extensionOf(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.')
  return dotIndex <= 0 ? '' : fileName.slice(dotIndex)
}
