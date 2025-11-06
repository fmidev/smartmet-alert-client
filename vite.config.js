// vite.config.js
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { visualizer } from 'rollup-plugin-visualizer'
import { BootstrapVueNextResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import banner from 'vite-plugin-banner'
import { viteStaticCopy } from 'vite-plugin-static-copy'

import pkg from './package.json'

export default defineConfig({
  base: './',
  plugins: [
    vue({
      customElement: true,
    }),
    Components({
      resolvers: [BootstrapVueNextResolver()],
    }),
    banner(
      `/**\n * name: ${pkg.name}\n * version: v${pkg.version}\n * description: ${pkg.description}\n * author: ${pkg.author}\n * homepage: ${pkg.homepage}\n */`
    ),
    visualizer(),
    viteStaticCopy({
      targets: [
        {
          src: 'dist/index.mjs',
          dest: './',
          rename: 'index.js',
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: '',
    sourcemap: false,
    minify: 'esbuild',
    cssCodeSplit: false,
    cssMinify: true,
    rollupOptions: {
      output: {
        entryFileNames: 'index.mjs',
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
            if (id.includes('vue') || id.includes('bootstrap')) {
              return 'vendor'
            }
          }
        },
        generatedCode: {
          constBindings: true,
          objectShorthand: true,
        },
      },
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
})
