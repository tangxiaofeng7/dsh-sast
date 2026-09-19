import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'bundle',
          include: ['tests/**/*.spec.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'host',
          root: 'src/dsh-sast',
          include: ['tests/**/*.spec.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'client',
          root: 'src/dsh-client-ui-sast',
          include: ['tests/**/*.spec.{ts,tsx}'],
          environment: 'node',
        },
        resolve: {
          alias: {
            '@tangxiaofeng7/dsh-sast-host/client': fileURLToPath(new URL('./src/dsh-sast/src/client.ts', import.meta.url)),
          },
        },
      },
    ],
  },
})
