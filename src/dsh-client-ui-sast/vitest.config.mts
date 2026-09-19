import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

/**
 * This package's tests import the host package's client-namespace types via
 * its published import path (`@tangxiaofeng7/dsh-sast-host/client`), matching the
 * convention the bundle's own client re-export follows — but this bundle
 * repo has no build step producing an installed `@tangxiaofeng7/dsh-sast-host`
 * package for standalone sub-package test runs. This alias points that same
 * import path straight at the host package's TypeScript source for local
 * testing only; it does not change what a real DSH host resolves once the
 * bundle is actually built. The root `vitest.config.mjs` carries the same
 * alias for the unified `npm test` entry point — keep both in sync.
 */
export default defineConfig({
  test: {
    include: ['tests/**/*.spec.{ts,tsx}'],
    environment: 'node',
  },
  resolve: {
    alias: {
      '@tangxiaofeng7/dsh-sast-host/client': fileURLToPath(new URL('../dsh-sast/src/client.ts', import.meta.url)),
    },
  },
})
