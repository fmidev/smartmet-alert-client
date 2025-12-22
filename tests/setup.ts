import { vi } from 'vitest'
import '@testing-library/jest-dom'
import { config } from '@vue/test-utils'

// Mock environment variables
process.env.VITE_LANGUAGE = 'fi'

// Configure global stubs for components
config.global.stubs = {
  GrayScaleToggle: true,
  CollapsiblePanel: true,
}

// Mock window.getComputedStyle
global.window.getComputedStyle = vi.fn(() => ({
  fontSize: '16px',
})) as unknown as typeof window.getComputedStyle

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as unknown as typeof ResizeObserver

// Mock fetch if not available
if (!global.fetch) {
  global.fetch = vi.fn() as unknown as typeof fetch
}
