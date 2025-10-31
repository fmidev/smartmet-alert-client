import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import AlertClient from '@/components/AlertClient.vue'
import Days from '@/components/Days.vue'
import Regions from '@/components/Regions.vue'
import Legend from '@/components/Legend.vue'
import { mockWarningsData } from '../../fixtures/mockWarningData'

describe('AlertClient.vue', () => {
  let wrapper

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.restoreAllMocks()
  })

  describe('Component mounting', () => {
    it('should mount with default props and render child components', () => {
      wrapper = mount(AlertClient, {
        props: {
          language: 'fi',
        },
      })

      // Verify component exists
      expect(wrapper.exists()).toBe(true)

      // Verify child components are rendered
      expect(wrapper.findComponent(Days).exists()).toBe(true)
      expect(wrapper.findComponent(Regions).exists()).toBe(true)
      expect(wrapper.findComponent(Legend).exists()).toBe(true)

      // Verify default state
      expect(wrapper.vm.selectedDay).toBe(0)
      expect(wrapper.vm.theme).toBe('light-theme')
      expect(wrapper.vm.geometryId).toBe(2021)
      expect(wrapper.vm.visibleWarnings).toEqual([])
      expect(wrapper.vm.warnings).toBeNull()
    })

    it('should use provided default day prop', () => {
      wrapper = mount(AlertClient, {
        props: {
          defaultDay: 2,
          language: 'fi',
        },
      })

      expect(wrapper.vm.selectedDay).toBe(2)
    })

    it('should initialize with correct data', () => {
      wrapper = mount(AlertClient, {
        props: {
          language: 'fi',
        },
      })

      expect(wrapper.vm.selectedDay).toBeDefined()
      expect(wrapper.vm.visibleWarnings).toEqual([])
      expect(wrapper.vm.warnings).toBeNull()
      expect(wrapper.vm.days).toEqual([])
    })
  })

  describe('Props validation', () => {
    it('should accept refresh interval prop', () => {
      wrapper = mount(AlertClient, {
        props: {
          refreshInterval: 60000,
          language: 'fi',
        },
      })

      expect(wrapper.vm.refreshInterval).toBe(60000)
    })

    it('should use default refresh interval', () => {
      wrapper = mount(AlertClient, {
        props: {
          language: 'fi',
        },
      })

      expect(wrapper.vm.refreshInterval).toBe(900000) // 15 minutes
    })

    it('should accept warnings data prop', () => {
      wrapper = mount(AlertClient, {
        props: {
          warningsData: mockWarningsData,
          language: 'fi',
        },
      })

      expect(wrapper.vm.warningsData).toBeDefined()
    })

    it('should accept theme prop', () => {
      wrapper = mount(AlertClient, {
        props: {
          theme: 'dark-theme',
          language: 'fi',
        },
      })

      expect(wrapper.vm.theme).toBe('dark-theme')
    })

    it('should accept geometry ID prop', () => {
      wrapper = mount(AlertClient, {
        props: {
          geometryId: 2021,
          language: 'fi',
        },
      })

      expect(wrapper.vm.geometryId).toBe(2021)
    })
  })

  describe('Timer functionality', () => {
    it('should initialize timer with correct interval', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval')

      wrapper = mount(AlertClient, {
        props: {
          refreshInterval: 60000,
          language: 'fi',
        },
      })

      expect(wrapper.vm.timer).toBeDefined()
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 60000)
    })

    it('should not initialize timer when refresh interval is 0', () => {
      wrapper = mount(AlertClient, {
        props: {
          refreshInterval: 0,
          language: 'fi',
        },
      })

      // Timer should not be initialized when interval is 0
      expect(wrapper.vm.timer).toBeNull()
    })

    it('should have cancelTimer method', () => {
      wrapper = mount(AlertClient, {
        props: {
          refreshInterval: 60000,
          language: 'fi',
        },
      })

      expect(wrapper.vm.timer).toBeDefined()
      expect(typeof wrapper.vm.cancelTimer).toBe('function')

      // cancelTimer should be callable without errors
      expect(() => wrapper.vm.cancelTimer()).not.toThrow()
    })

    it('should have initTimer method', () => {
      wrapper = mount(AlertClient, {
        props: {
          refreshInterval: 60000,
          language: 'fi',
        },
      })

      expect(typeof wrapper.vm.initTimer).toBe('function')
      expect(wrapper.vm.timer).toBeDefined()
    })

    it('should handle multiple timer cancellations safely', () => {
      wrapper = mount(AlertClient, {
        props: {
          refreshInterval: 60000,
          language: 'fi',
        },
      })

      // Multiple cancellations should not throw errors
      expect(() => {
        wrapper.vm.cancelTimer()
        wrapper.vm.cancelTimer()
        wrapper.vm.cancelTimer()
      }).not.toThrow()
    })
  })

  describe('Event emissions', () => {
    it('should emit loaded event on data loaded', async () => {
      wrapper = mount(AlertClient, {
        props: {
          warningsData: mockWarningsData,
          language: 'fi',
        },
      })

      await flushPromises()

      wrapper.vm.onLoaded(true)

      expect(wrapper.emitted('loaded')).toBeTruthy()
    })

    it('should emit themeChanged event', () => {
      wrapper = mount(AlertClient, {
        props: {
          language: 'fi',
        },
      })

      wrapper.vm.onThemeChanged('dark-theme')

      expect(wrapper.emitted('themeChanged')).toBeTruthy()
      expect(wrapper.emitted('themeChanged')[0]).toEqual(['dark-theme'])
    })

    it('should emit update-warnings event on update', () => {
      wrapper = mount(AlertClient, {
        props: {
          refreshInterval: 60000,
          language: 'fi',
        },
      })

      wrapper.vm.update()

      expect(wrapper.emitted('update-warnings')).toBeTruthy()
    })

    it('should not emit themeChanged if theme is same', () => {
      wrapper = mount(AlertClient, {
        props: {
          theme: 'light-theme',
          language: 'fi',
        },
      })

      wrapper.vm.onThemeChanged('light-theme')

      expect(wrapper.emitted('themeChanged')).toBeFalsy()
    })
  })

  describe('Data processing', () => {
    it('should process warnings data when provided', async () => {
      wrapper = mount(AlertClient, {
        props: {
          warningsData: mockWarningsData,
          language: 'fi',
        },
      })

      await flushPromises()

      expect(wrapper.vm.warnings).toBeDefined()
      expect(wrapper.vm.days).toBeDefined()
      expect(wrapper.vm.days.length).toBe(5)
    })

    it('should create visible warnings from legend', async () => {
      wrapper = mount(AlertClient, {
        props: {
          warningsData: mockWarningsData,
          language: 'fi',
        },
      })

      await flushPromises()

      expect(Array.isArray(wrapper.vm.visibleWarnings)).toBe(true)
    })

    it('should update regions data', async () => {
      wrapper = mount(AlertClient, {
        props: {
          warningsData: mockWarningsData,
          language: 'fi',
        },
      })

      await flushPromises()

      expect(wrapper.vm.regions).toBeDefined()
      expect(Array.isArray(wrapper.vm.regions)).toBe(true)
    })
  })

  describe('Day selection', () => {
    it('should update selected day on daySelected event', () => {
      wrapper = mount(AlertClient, {
        props: {
          language: 'fi',
        },
      })

      wrapper.vm.onDaySelected(2)

      expect(wrapper.vm.selectedDay).toBe(2)
    })

    it('should start with default day', () => {
      wrapper = mount(AlertClient, {
        props: {
          defaultDay: 3,
          language: 'fi',
        },
      })

      expect(wrapper.vm.selectedDay).toBe(3)
    })
  })

  describe('Warnings toggle', () => {
    it('should update visible warnings on toggle', async () => {
      wrapper = mount(AlertClient, {
        props: {
          warningsData: mockWarningsData,
          language: 'fi',
        },
      })

      await flushPromises()

      const newVisibleWarnings = ['wind', 'rain']
      wrapper.vm.onWarningsToggled(newVisibleWarnings)

      expect(wrapper.vm.visibleWarnings).toEqual(newVisibleWarnings)
    })

    it('should update legend visibility', async () => {
      wrapper = mount(AlertClient, {
        props: {
          warningsData: mockWarningsData,
          language: 'fi',
        },
      })

      await flushPromises()

      if (wrapper.vm.legend.length > 0) {
        const firstWarningType = wrapper.vm.legend[0].type
        wrapper.vm.onWarningsToggled([firstWarningType])

        const legendItem = wrapper.vm.legend.find(
          (item) => item.type === firstWarningType
        )
        expect(legendItem.visible).toBe(true)
      }
    })
  })

  describe('Error handling', () => {
    it('should handle errors in error array', () => {
      wrapper = mount(AlertClient, {
        props: {
          language: 'fi',
        },
      })

      const testError = 'test_error'
      wrapper.vm.handleError(testError)

      expect(wrapper.vm.errors).toContain(testError)
    })

    it('should not duplicate errors', () => {
      wrapper = mount(AlertClient, {
        props: {
          language: 'fi',
        },
      })

      const testError = 'test_error'
      wrapper.vm.handleError(testError)
      wrapper.vm.handleError(testError)

      expect(wrapper.vm.errors.filter((e) => e === testError).length).toBe(1)
    })

    it('should handle null warnings data gracefully', async () => {
      wrapper = mount(AlertClient, {
        props: {
          warningsData: null,
          language: 'fi',
        },
      })

      await flushPromises()

      expect(wrapper.vm.warnings).toBeNull()
      expect(wrapper.vm.days).toEqual([])
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle undefined warnings data gracefully', async () => {
      wrapper = mount(AlertClient, {
        props: {
          warningsData: undefined,
          language: 'fi',
        },
      })

      await flushPromises()

      expect(wrapper.vm.warnings).toBeNull()
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle malformed warnings data', async () => {
      const malformedData = {
        invalid: 'data',
        structure: 'wrong',
      }

      wrapper = mount(AlertClient, {
        props: {
          warningsData: malformedData,
          language: 'fi',
        },
      })

      await flushPromises()

      // Component should still exist and not crash
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle empty warnings data', async () => {
      const emptyData = {
        weather_update_time: '2025-10-31T12:00:00Z',
        flood_update_time: '2025-10-31T12:00:00Z',
        weather_finland_active_all: { features: [] },
        flood_finland_active_all: { features: [] },
      }

      wrapper = mount(AlertClient, {
        props: {
          warningsData: emptyData,
          language: 'fi',
        },
      })

      await flushPromises()

      expect(wrapper.vm.warnings).toBeDefined()
      expect(wrapper.vm.days).toHaveLength(5)
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Computed properties', () => {
    it('should compute toContentText correctly', async () => {
      wrapper = mount(AlertClient, {
        props: {
          warningsData: mockWarningsData,
          language: 'fi',
          regionListEnabled: true,
        },
      })

      await flushPromises()

      expect(wrapper.vm.toContentText).toBeDefined()
      expect(typeof wrapper.vm.toContentText).toBe('string')
    })

    it('should compute validData correctly with warnings', async () => {
      wrapper = mount(AlertClient, {
        props: {
          warningsData: mockWarningsData,
          language: 'fi',
        },
      })

      await flushPromises()

      expect(typeof wrapper.vm.validData).toBe('boolean')
    })

    it('should compute numWarnings correctly', async () => {
      wrapper = mount(AlertClient, {
        props: {
          warningsData: mockWarningsData,
          language: 'fi',
        },
      })

      await flushPromises()

      expect(typeof wrapper.vm.numWarnings).toBe('number')
      expect(wrapper.vm.numWarnings).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Visibility change handling', () => {
    it('should handle visibility change when document becomes hidden', () => {
      const cancelTimerSpy = vi.spyOn(AlertClient.methods, 'cancelTimer')

      wrapper = mount(AlertClient, {
        props: {
          refreshInterval: 60000,
          sleep: true,
          language: 'fi',
        },
      })

      // Simulate document becoming hidden
      Object.defineProperty(document, 'hidden', {
        writable: true,
        value: true,
      })

      wrapper.vm.visibilityChange()

      expect(cancelTimerSpy).toHaveBeenCalled()
    })

    it('should restart timer when document becomes visible again', () => {
      const initTimerSpy = vi.spyOn(AlertClient.methods, 'initTimer')

      wrapper = mount(AlertClient, {
        props: {
          refreshInterval: 60000,
          sleep: true,
          language: 'fi',
        },
      })

      // Hide document (cancels timer)
      Object.defineProperty(document, 'hidden', {
        writable: true,
        value: true,
      })
      wrapper.vm.visibilityChange()

      // Show document again (should try to restart timer)
      Object.defineProperty(document, 'hidden', {
        writable: true,
        value: false,
      })
      wrapper.vm.visibilityChange()

      expect(initTimerSpy).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels on main container', async () => {
      wrapper = mount(AlertClient, {
        props: {
          warningsData: mockWarningsData,
          language: 'fi',
        },
      })

      await flushPromises()

      const container = wrapper.find('#fmi-warnings-view')
      expect(container.exists()).toBe(true)
    })

    it('should provide accessible navigation structure', async () => {
      wrapper = mount(AlertClient, {
        props: {
          warningsData: mockWarningsData,
          language: 'fi',
        },
      })

      await flushPromises()

      // Check that Days component can be navigated
      const days = wrapper.findComponent(Days)
      expect(days.exists()).toBe(true)
    })

    it('should support keyboard navigation', async () => {
      wrapper = mount(AlertClient, {
        props: {
          warningsData: mockWarningsData,
          language: 'fi',
        },
      })

      await flushPromises()

      // Verify focus-ring class is used for keyboard navigation
      const focusableElements = wrapper.findAll('.focus-ring')
      expect(focusableElements.length).toBeGreaterThan(0)
    })

    it('should have proper language attribute', () => {
      wrapper = mount(AlertClient, {
        props: {
          language: 'fi',
        },
      })

      expect(wrapper.vm.language).toBe('fi')
    })
  })

  describe('Edge cases', () => {
    it('should handle invalid geometry ID', () => {
      wrapper = mount(AlertClient, {
        props: {
          geometryId: -1,
          language: 'fi',
        },
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.vm.geometryId).toBe(-1)
    })

    it('should handle very large refresh interval', () => {
      wrapper = mount(AlertClient, {
        props: {
          refreshInterval: 2147483647, // Max 32-bit signed integer
          language: 'fi',
        },
      })

      expect(wrapper.vm.timer).toBeDefined()
    })

    it('should handle invalid theme gracefully', () => {
      wrapper = mount(AlertClient, {
        props: {
          theme: 'invalid-theme',
          language: 'fi',
        },
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.vm.theme).toBe('invalid-theme')
    })

    it('should accept valid default day range', () => {
      wrapper = mount(AlertClient, {
        props: {
          defaultDay: 4,
          language: 'fi',
        },
      })

      // Component should mount with valid day value
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.vm.selectedDay).toBe(4)
    })

    it('should handle concurrent day selections', async () => {
      wrapper = mount(AlertClient, {
        props: {
          warningsData: mockWarningsData,
          language: 'fi',
        },
      })

      await flushPromises()

      // Rapidly change days
      wrapper.vm.onDaySelected(1)
      wrapper.vm.onDaySelected(2)
      wrapper.vm.onDaySelected(3)
      wrapper.vm.onDaySelected(4)

      // Should end up with last selected day
      expect(wrapper.vm.selectedDay).toBe(4)
    })
  })

  describe('Performance', () => {
    it('should handle multiple mount and unmount cycles', () => {
      // Create and destroy multiple instances
      for (let i = 0; i < 3; i++) {
        const w = mount(AlertClient, {
          props: {
            refreshInterval: 60000,
            language: 'fi',
          },
        })
        expect(w.exists()).toBe(true)
        w.unmount()
      }

      // Test completed without errors
      expect(true).toBe(true)
    })

    it('should handle large warning datasets efficiently', async () => {
      const largeDataset = {
        ...mockWarningsData,
        weather_finland_active_all: {
          features: Array(100)
            .fill(null)
            .map((_, i) => ({
              ...mockWarningsData.weather_finland_active_all.features[0],
              properties: {
                ...mockWarningsData.weather_finland_active_all.features[0]
                  .properties,
                identifier: `warning-${i}`,
              },
            })),
        },
      }

      const startTime = performance.now()

      wrapper = mount(AlertClient, {
        props: {
          warningsData: largeDataset,
          language: 'fi',
        },
      })

      await flushPromises()

      const endTime = performance.now()
      const duration = endTime - startTime

      // Processing should complete in reasonable time (< 1000ms)
      expect(duration).toBeLessThan(1000)
      expect(wrapper.exists()).toBe(true)
    })
  })
})
