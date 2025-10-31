import { vi } from 'vitest'
import '@testing-library/jest-dom'
import { config } from '@vue/test-utils'

// Mock environment variables
process.env.VITE_LANGUAGE = 'fi'

// Configure global stubs for Bootstrap Vue Next components
config.global.stubs = {
  BSpinner: true,
  BTabs: true,
  BTab: true,
  BButton: true,
  BCard: true,
  BCardHeader: true,
  BCardBody: true,
  BCollapse: true,
  GrayScaleToggle: true,
}

// Mock window.getComputedStyle
global.window.getComputedStyle = vi.fn(() => ({
  fontSize: '16px',
}))

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock fetch if not available
if (!global.fetch) {
  global.fetch = vi.fn()
}
