// Two independent config entries (not one multi-entry config): tsdown/
// rolldown splits a shared chunk out to its own file whenever two entries in
// the SAME build import overlapping modules (store.ts, report/artifacts.ts,
// skill-manifest.ts are shared between index.ts and batch-plugin.ts) — a
// chunk that build.mjs's copyFile calls would silently never ship, breaking
// `import './lib/sast.js'` at runtime with a "Cannot find module" for a
// hash-named file nothing in this repo's `files`/copy step knows about.
// Two separate `build()` invocations each get their own fully self-contained
// output instead, matching every other entry here (invariant.mjs) being one
// complete file with no cross-entry chunk.
export default [
  {
    entry: { sast: 'src/index.ts', invariant: 'src/invariant.ts' },
    format: 'esm',
    platform: 'node',
    dts: false,
    outDir: 'dist',
    noExternal: ['zod', '@deepseek-ai/schemastery'],
  },
  {
    entry: { 'batch-scheduler': 'src/batch-plugin.ts' },
    format: 'esm',
    platform: 'node',
    dts: false,
    outDir: 'dist',
    noExternal: ['zod', '@deepseek-ai/schemastery'],
  },
]
