#!/usr/bin/env node
/**
 * Rebuilds every published `lib/**\/*.js` file from its `src/` snapshot,
 * automating the manual steps documented in AGENTS.md's "Rebuild Workflow".
 *
 * Host and invariant bundles are produced by tsdown directly (their
 * tsdown.config.mjs already targets the node platform with the right
 * noExternal set). The Web client needs an extra step: tsdown only knows how
 * to emit a plain CJS/ESM module, but DSH's browser loader expects a
 * `window.__ModuleLoader__.load({ id, factory })` wrapper keyed by the exact
 * package name — so this script builds the client as CJS, wraps it, and
 * folds the CSS-modules chunk in as a second `<style>` injector (mirroring
 * the raw-css plugin already used for `@xyflow/react`'s global stylesheet).
 */
import { build } from 'tsdown'
import { readFile, writeFile, copyFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const LIB = join(ROOT, 'lib')
const HOST_DIR = join(ROOT, 'src/dsh-sast')
const CLIENT_DIR = join(ROOT, 'src/dsh-client-ui-sast')
const SQLITE_SRC = join(ROOT, 'packages/dsh-storage-sqlite/lib/index.js')

const PACKAGE_NAME = '@tangxiaofeng7/dsh-sast'
const OLD_CLIENT_PACKAGE_NAME = '@tangxiaofeng7/dsh-sast-client'

async function buildHost() {
  await build({ cwd: HOST_DIR, config: true })
  await copyFile(join(HOST_DIR, 'dist/sast.mjs'), join(LIB, 'sast.js'))
  await copyFile(join(HOST_DIR, 'dist/invariant.mjs'), join(LIB, 'invariant.js'))
  await copyFile(join(HOST_DIR, 'dist/batch-scheduler.mjs'), join(LIB, 'batch-scheduler.js'))
}

async function buildStorageSqlite() {
  await copyFile(SQLITE_SRC, join(LIB, 'storage-sqlite.js'))
}

async function buildClient() {
  await build({
    cwd: CLIENT_DIR,
    config: true,
    format: 'cjs',
    outDir: 'dist',
  })

  let code = await readFile(join(CLIENT_DIR, 'dist/client.cjs'), 'utf8')
  let css = ''
  try {
    css = await readFile(join(CLIENT_DIR, 'dist/style.css'), 'utf8')
  } catch {
    // no CSS-modules chunk emitted (nothing used a .module.css this build)
  }

  code = code.replaceAll(OLD_CLIENT_PACKAGE_NAME, PACKAGE_NAME)

  const wrapped = wrapModule(code, css)
  await mkdir(LIB, { recursive: true })
  await writeFile(join(LIB, 'ui-sast.client.js'), wrapped)
}

/**
 * Wraps a CJS module body in the `window.__ModuleLoader__.load({...})`
 * factory DSH's browser runtime expects, and — when present — prepends the
 * CSS-modules stylesheet as a `<style data-plugin-css>` injector so it rides
 * along even though `package.json`'s `files` only ships `lib/**\/*.js`.
 * @param {string} code - CJS module body (must reference `require`/`exports`/`module` only).
 * @param {string} css - CSS-modules chunk content, or '' if none was emitted.
 * @returns {string} the wrapped `lib/ui-sast.client.js` source.
 */
function wrapModule(code, css) {
  // Wrapped in its own IIFE: the bundled body below may itself declare
  // top-level `const css`/`tagId` (the raw-css-inline plugin's injector for
  // @xyflow/react's stylesheet) — sharing scope would be a redeclaration
  // SyntaxError under a CJS `require()` (which loads this as its own module,
  // but the two injectors would still collide if concatenated into one
  // function body without their own scope).
  const cssInjector = css.length > 0
    ? [
      '    (function () {',
      `      var css = ${JSON.stringify(css)};`,
      `      var tagId = ${JSON.stringify(`${PACKAGE_NAME}/modules`)};`,
      '      if (typeof document !== \'undefined\' && document.querySelector(\'style[data-plugin-css=\' + JSON.stringify(tagId) + \']\') === null) {',
      '        var tag = document.createElement(\'style\');',
      `        tag.dataset.plugin = ${JSON.stringify(PACKAGE_NAME)};`,
      '        tag.dataset.pluginCss = tagId;',
      '        tag.textContent = css;',
      '        document.head.appendChild(tag);',
      '      }',
      '    })();',
    ].join('\n') + '\n'
    : ''

  const indented = code
    .split('\n')
    .map((line) => (line.length > 0 ? `    ${line}` : line))
    .join('\n')

  return [
    'window.__ModuleLoader__.load({',
    `  id: ${JSON.stringify(PACKAGE_NAME)},`,
    '  factory: (require) => {',
    '    var module = { exports: {} };',
    '    var exports = module.exports;',
    cssInjector + indented,
    '    return module.exports;',
    '  }',
    '});',
    '',
  ].join('\n')
}

async function main() {
  await buildHost()
  await buildStorageSqlite()
  await buildClient()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
