/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LANGUAGE: string
  readonly VITE_THEME: string
  readonly VITE_GRAY_SCALE: string
  readonly VITE_REFRESH: string
  readonly VITE_JSON_PATH: string
  readonly VITE_GEOMETRY_ID: string
  readonly VITE_STATIC_DAYS: string
  // Add other env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Vue component shim for non-TypeScript components during migration
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}
