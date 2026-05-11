// vite.config.js
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import banner from 'vite-plugin-banner'
import dts from 'vite-plugin-dts'

import pkg from './package.json'

// Check build mode: 'vue' for library build, default for web component
const buildMode = process.env.BUILD_MODE

export default defineConfig({
  base: './',
  plugins: [
    vue({
      // Only use customElement mode for web component build
      customElement: buildMode !== 'vue',
    }),
    banner(
      `/**\n * name: ${pkg.name}\n * version: v${pkg.version}\n * description: ${pkg.description}\n * author: ${pkg.author}\n * homepage: ${pkg.homepage}\n */`
    ),
    visualizer(),
    // Generate .d.ts files for Vue library build
    ...(buildMode === 'vue'
      ? [
          dts({
            include: ['src/vue.ts', 'src/AlertClientVue.vue'],
            outDir: 'dist/vue',
          }),
        ]
      : []),
  ],
  build:
    buildMode === 'vue'
      ? // Vue library build configuration
        {
          target: 'es2020',
          outDir: 'dist/vue',
          sourcemap: false,
          minify: 'esbuild',
          cssCodeSplit: false,
          cssMinify: true,
          copyPublicDir: false,
          lib: {
            entry: fileURLToPath(new URL('./src/vue.ts', import.meta.url)),
            name: 'SmartMetAlertClient',
            formats: ['es'],
            fileName: () => 'index.mjs',
          },
          rollupOptions: {
            external: ['vue'],
            output: {
              globals: {
                vue: 'Vue',
              },
              generatedCode: {
                constBindings: true,
                objectShorthand: true,
              },
            },
          },
        }
      : // Web component build configuration (default)
        {
          target: 'es2020',
          outDir: 'dist',
          assetsDir: '',
          sourcemap: false,
          minify: 'esbuild',
          cssCodeSplit: false,
          cssMinify: true,
          chunkSizeWarningLimit: 1500,
          lib: {
            entry: fileURLToPath(new URL('./src/main.ts', import.meta.url)),
            name: 'SmartMetAlertClient',
            formats: ['es', 'iife'],
          },
          rollupOptions: {
            output: [
              {
                format: 'es',
                entryFileNames: 'index.mjs',
                chunkFileNames: '[name]-[hash].js',
                compact: true,
                inlineDynamicImports: false,
                manualChunks: (id) => {
                  // XML parsers as separate chunk
                  if (id.includes('@xmldom/xmldom') || id.includes('xpath')) {
                    return 'xml-parser'
                  }
                  // Locale files as separate chunks
                  if (id.includes('/locales/')) {
                    const match = id.match(/locales\/(\w+)\.json/)
                    if (match) {
                      return `locale-${match[1]}`
                    }
                  }
                  // Core vendor libraries
                  if (id.includes('node_modules')) {
                    if (id.includes('vue')) {
                      return 'vendor'
                    }
                  }
                },
                generatedCode: {
                  constBindings: true,
                  objectShorthand: true,
                },
              },
              {
                format: 'iife',
                name: 'SmartMetAlertClient',
                entryFileNames: 'index.js',
                compact: true,
                inlineDynamicImports: true,
                generatedCode: {
                  constBindings: true,
                  objectShorthand: true,
                },
              },
            ],
          },
        },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['import', 'legacy-js-api'],
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    // In lib mode Vite does NOT auto-replace process.env.NODE_ENV, so Vue 3's
    // dev-mode guards end up referencing `process` in the browser. The Vue
    // library build (consumed by another app's bundler) leaves it alone so the
    // consumer decides; the web component build is consumed as-is and must
    // hard-code production.
    ...(buildMode !== 'vue'
      ? { 'process.env.NODE_ENV': JSON.stringify('production') }
      : {}),
  },
})
