import { readFile } from 'node:fs/promises'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { createRequire } from 'node:module'
import { realpathSync } from 'node:fs'

const RAW_CSS_PREFIX = '\0dsh-raw-css:'
const RAW_CSS_SUFFIX = '.mjs'

/**
 * The virtual module id carries the CSS file path RELATIVE to the build cwd.
 * An absolute id leaks into rolldown's emitted `//#region` comment, which
 * made lib/ui-sast.client.js differ between machines and broke CI's
 * `git diff --exit-code lib/` reproducibility gate.
 */
function stableVirtualId(absPath) {
  return relative(realpathSync(process.cwd()), absPath)
}

function rawCssInline(pluginId) {
  const require = createRequire(import.meta.url)
  return {
    name: 'dsh-raw-css-inline',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!source.endsWith('.css') || source.endsWith('.module.css')) return null
      const abs = importer !== undefined
        ? require.resolve(source, { paths: [dirname(importer)] })
        : source
      return RAW_CSS_PREFIX + stableVirtualId(abs) + RAW_CSS_SUFFIX
    },
    async load(id) {
      if (!id.startsWith(RAW_CSS_PREFIX)) return null
      const fileId = id.slice(RAW_CSS_PREFIX.length, -RAW_CSS_SUFFIX.length)
      const fileIdAbs = isAbsolute(fileId) ? fileId : resolve(realpathSync(process.cwd()), fileId)
      this.addWatchFile(fileIdAbs)
      const css = (await readFile(fileIdAbs)).toString()
      const tagId = `${pluginId}/raw`
      return [
        `const css = ${JSON.stringify(css)};`,
        `const tagId = ${JSON.stringify(tagId)};`,
        'if (typeof document !== \'undefined\' && document.querySelector(\'style[data-plugin-css=\' + JSON.stringify(tagId) + \']\') === null) {',
        '  const tag = document.createElement(\'style\');',
        `  tag.dataset.plugin = ${JSON.stringify(pluginId)};`,
        '  tag.dataset.pluginCss = tagId;',
        '  tag.textContent = css;',
        '  document.head.appendChild(tag);',
        '}',
        'export default {};',
      ].join('\n')
    },
  }
}

export default {
  entry: { client: 'src/client/index.ts' },
  format: 'esm',
  platform: 'browser',
  dts: false,
  outDir: 'dist',
  // CSS Modules scoped-class naming: lightningcss's default pattern hashes
  // the file's ABSOLUTE path, so the built lib/ui-sast.client.js differed
  // between machines and CI failed its `git diff --exit-code lib/`
  // reproducibility gate. `[name]__[local]` (file base name + original local
  // name) is deterministic across platforms, and every .module.css here
  // lives flat in src/client with unique basenames, so scoped names stay
  // unique within the bundle.
  css: {
    modules: {
      generateScopedName: '[name]__[local]',
    },
  },
  // React/@xyflow/react read `process.env.NODE_ENV` internally; tsdown does
  // NOT strip/replace it by default (verified via real-browser V12
  // check — the client threw "process is not defined" at import time on a
  // host that provides no polyfill for the Node `process` global). `env`
  // makes tsdown replace `process.env.NODE_ENV` at compile time with the
  // literal below, so no runtime `process` reference survives into the
  // browser bundle.
  env: { NODE_ENV: 'production' },
  // the host only provides react / react/jsx-runtime / react-dom at runtime,
  // so @xyflow/react (declared in dependencies, externalized by default) must
  // be inlined — JS and its CSS import both need to end up in the bundle.
  // tsdown's alwaysBundle matcher does exact/glob matching per specifier, so
  // the bare package name alone does not cover subpaths like
  // '@xyflow/react/dist/style.css' — an explicit glob is required.
  noExternal: ['@xyflow/react', '@xyflow/react/**'],
  // CSS Modules content is emitted as a separate dist/style.css chunk by
  // @tsdown/css. package.json `files` only ships lib/**/*.js, so that chunk
  // would never reach the tarball — the build script (scripts/build.mjs)
  // inlines dist/style.css into the final client bundle as a <style> tag
  // through the same runtime channel the raw-css plugin above uses.
  plugins: [rawCssInline('@tangxiaofeng7/dsh-sast')],
}
