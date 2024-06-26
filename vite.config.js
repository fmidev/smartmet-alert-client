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
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2019',
    outDir: 'dist',
    assetsDir: '',
    sourcemap: true,
    minify: true,
    rollupOptions: {
      output: {
        entryFileNames: 'index.mjs',
      },
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
})
