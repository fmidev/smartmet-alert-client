import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['import', 'legacy-js-api'],
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    // The tests that draw maps take up to a couple of seconds, and when all
    // test files run in parallel on a loaded machine with little memory, even
    // simple tests may exceed the default 5 s timeout
    testTimeout: 15000,
    // Custom reporter that writes tests/__artifacts__/review.html at the
    // end of every run for visual comparison of map SVG snapshots.
    reporters: ['default', './tests/reporters/snapshotReviewReporter.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        'public/',
        '*.config.js',
        '.eslintrc.js',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify('test-version'),
  },
})
