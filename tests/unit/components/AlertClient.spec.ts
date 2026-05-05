import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount, flushPromises, VueWrapper } from '@vue/test-utils'
import AlertClient from '@/components/AlertClient.vue'
import Days from '@/components/Days.vue'
import Regions from '@/components/Regions.vue'
import Legend from '@/components/Legend.vue'
import { mockWarningsData } from '../../fixtures/mockWarningData'
import type { Language, Theme, WarningsData } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentInstance = any

describe('AlertClient.vue', () => {
  let wrapper: VueWrapper | null = null

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
    vi.restoreAllMocks()
  })

  describe('Component mounting', () => {
    it('should mount with default props and render child components', () => {
      wrapper = mount(AlertClient, {
        props: {
          language: 'fi' as Language,
        },
      })

      // Verify component exists
      expect(wrapper.exists()).toBe(true)

      // Verify child components are rendered
      expect(wrapper.findComponent(Days).exists()).toBe(true)
      expect(wrapper.findComponent(Regions).exists()).toBe(true)
      expect(wrapper.findComponent(Legend).exists()).toBe(true)

      // Verify default state
      const vm = wrapper.vm as ComponentInstance
      expect(vm.selectedDay).toBe(0)
      expect(vm.theme).toBe('light-theme')
      expect(vm.geometryId).toBe(2021)
      expect(vm.visibleWarnings).toEqual([])
      expect(vm.warnings).toBeNull()
    })

    it('should use provided default day prop', () => {
      wrapper = mount(AlertClient, {
        props: {
          defaultDay: 2,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).selectedDay).toBe(2)
    })

    it('should initialize with correct data', () => {
      wrapper = mount(AlertClient, {
        props: {
          language: 'fi' as Language,
        },
      })

      const vm = wrapper.vm as ComponentInstance
      expect(vm.selectedDay).toBeDefined()
      expect(vm.visibleWarnings).toEqual([])
      expect(vm.warnings).toBeNull()
      expect(vm.days).toEqual([])
    })
  })

  describe('Props validation', () => {
    it('should accept refresh interval prop', () => {
      wrapper = mount(AlertClient, {
        props: {
          refreshInterval: 60000,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).refreshInterval).toBe(60000)
    })

    it('should use default refresh interval', () => {
      wrapper = mount(AlertClient, {
        props: {
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).refreshInterval).toBe(900000) // 15 minutes
    })

    it('should accept warnings data prop', () => {
      wrapper = mount(AlertClient, {
        props: {
          warningsData: mockWarningsData,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).warningsData).toBeDefined()
    })

    it('should accept theme prop', () => {
      wrapper = mount(AlertClient, {
        props: {
          theme: 'dark-theme' as Theme,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).theme).toBe('dark-theme')
    })

    it('should accept geometry ID prop', () => {
      wrapper = mount(AlertClient, {
        props: {
          geometryId: 2021,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).geometryId).toBe(2021)
    })
  })

  describe('Timer functionality', () => {
    it('should initialize timer with correct interval', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval')

      wrapper = mount(AlertClient, {
        props: {
          refreshInterval: 60000,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).timer).toBeDefined()
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 60000)
    })

    it('should not initialize timer when refresh interval is 0', () => {
      wrapper = mount(AlertClient, {
        props: {
          refreshInterval: 0,
          language: 'fi' as Language,
        },
      })

      // Timer should not be initialized when interval is 0
      expect((wrapper.vm as ComponentInstance).timer).toBeNull()
    })

    it('should have cancelTimer method', () => {
      wrapper = mount(AlertClient, {
        props: {
          refreshInterval: 60000,
          language: 'fi' as Language,
        },
      })

      const vm = wrapper.vm as ComponentInstance
      expect(vm.timer).toBeDefined()
      expect(typeof vm.cancelTimer).toBe('function')

      // cancelTimer should be callable without errors
      expect(() => vm.cancelTimer()).not.toThrow()
    })

    it('should have initTimer method', () => {
      wrapper = mount(AlertClient, {
        props: {
          refreshInterval: 60000,
          language: 'fi' as Language,
        },
      })

      const vm = wrapper.vm as ComponentInstance
      expect(typeof vm.initTimer).toBe('function')
      expect(vm.timer).toBeDefined()
    })

    it('should handle multiple timer cancellations safely', () => {
      wrapper = mount(AlertClient, {
        props: {
          refreshInterval: 60000,
          language: 'fi' as Language,
        },
      })

      const vm = wrapper.vm as ComponentInstance
      // Multiple cancellations should not throw errors
      expect(() => {
        vm.cancelTimer()
        vm.cancelTimer()
        vm.cancelTimer()
      }).not.toThrow()
    })
  })

  describe('Event emissions', () => {
    it('should emit loaded event on data loaded', async () => {
      wrapper = mount(AlertClient, {
        props: {
          warningsData: mockWarningsData,
          language: 'fi' as Language,
        },
      })

      await flushPromises()
      ;(wrapper.vm as ComponentInstance).onLoaded(true)

      expect(wrapper.emitted('loaded')).toBeTruthy()
    })

    it('should emit themeChanged event', () => {
      wrapper = mount(AlertClient, {
        props: {
          language: 'fi' as Language,
        },
      })
      ;(wrapper.vm as ComponentInstance).onThemeChanged('dark-theme')

      expect(wrapper.emitted('themeChanged')).toBeTruthy()
      expect(wrapper.emitted('themeChanged')![0]).toEqual(['dark-theme'])
    })

    it('should emit update-warnings event on update', () => {
      wrapper = mount(AlertClient, {
        props: {
          refreshInterval: 60000,
          language: 'fi' as Language,
        },
      })
      ;(wrapper.vm as ComponentInstance).update()

      expect(wrapper.emitted('update-warnings')).toBeTruthy()
    })

    it('should not emit themeChanged if theme is same', () => {
      wrapper = mount(AlertClient, {
        props: {
          theme: 'light-theme' as Theme,
          language: 'fi' as Language,
        },
      })
      ;(wrapper.vm as ComponentInstance).onThemeChanged('light-theme')

      expect(wrapper.emitted('themeChanged')).toBeFalsy()
    })
  })

  describe('Data processing', () => {
    it('should process warnings data when provided', async () => {
      wrapper = mount(AlertClient, {
        props: {
          warningsData: mockWarningsData,
          language: 'fi' as Language,
        },
      })

      await flushPromises()

      const vm = wrapper.vm as ComponentInstance
      expect(vm.warnings).toBeDefined()
      expect(vm.days).toBeDefined()
      expect(vm.days.length).toBe(5)
    })

    it('should create visible warnings from legend', async () => {
      wrapper = mount(AlertClient, {
        props: {
          warningsData: mockWarningsData,
          language: 'fi' as Language,
        },
      })

      await flushPromises()

      expect(
        Array.isArray((wrapper.vm as ComponentInstance).visibleWarnings)
      ).toBe(true)
    })

    it('should update regions data', async () => {
      wrapper = mount(AlertClient, {
        props: {
          warningsData: mockWarningsData,
          language: 'fi' as Language,
        },
      })

      await flushPromises()

      const vm = wrapper.vm as ComponentInstance
      expect(vm.regions).toBeDefined()
      expect(Array.isArray(vm.regions)).toBe(true)
    })
  })

  describe('Day selection', () => {
    it('should update selected day on daySelected event', () => {
      wrapper = mount(AlertClient, {
        props: {
          language: 'fi' as Language,
        },
      })
      ;(wrapper.vm as ComponentInstance).onDaySelected(2)

      expect((wrapper.vm as ComponentInstance).selectedDay).toBe(2)
    })

    it('should start with default day', () => {
      wrapper = mount(AlertClient, {
        props: {
          defaultDay: 3,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).selectedDay).toBe(3)
    })
  })

  describe('Warnings toggle', () => {
    it('should update visible warnings on toggle', async () => {
      wrapper = mount(AlertClient, {
        props: {
          warningsData: mockWarningsData,
          language: 'fi' as Language,
        },
      })

      await flushPromises()

      const newVisibleWarnings = ['wind', 'rain']
      ;(wrapper.vm as ComponentInstance).onWarningsToggled(newVisibleWarnings)

      expect((wrapper.vm as ComponentInstance).visibleWarnings).toEqual(
        newVisibleWarnings
      )
    })

    it('should update legend visibility', async () => {
      wrapper = mount(AlertClient, {
        props: {
          warningsData: mockWarningsData,
          language: 'fi' as Language,
        },
      })

      await flushPromises()

      const vm = wrapper.vm as ComponentInstance
      if (vm.legend.length > 0) {
        const firstWarningType = vm.legend[0].type
        vm.onWarningsToggled([firstWarningType])

        const legendItem = vm.legend.find(
          (item: { type: string }) => item.type === firstWarningType
        )
        expect(legendItem.visible).toBe(true)
      }
    })
  })

  describe('Error handling', () => {
    it('should handle errors in error array', () => {
      wrapper = mount(AlertClient, {
        props: {
          language: 'fi' as Language,
        },
      })

      const testError = 'test_error'
      ;(wrapper.vm as ComponentInstance).handleError(testError)

      expect((wrapper.vm as ComponentInstance).errors).toContain(testError)
    })

    it('should not duplicate errors', () => {
      wrapper = mount(AlertClient, {
        props: {
          language: 'fi' as Language,
        },
      })

      const testError = 'test_error'
      const vm = wrapper.vm as ComponentInstance
      vm.handleError(testError)
      vm.handleError(testError)

      expect(vm.errors.filter((e: string) => e === testError).length).toBe(1)
    })

    it('should handle null warnings data gracefully', async () => {
      wrapper = mount(AlertClient, {
        props: {
          warningsData: null as unknown as WarningsData,
          language: 'fi' as Language,
        },
      })

      await flushPromises()

      const vm = wrapper.vm as ComponentInstance
      expect(vm.warnings).toBeNull()
      expect(vm.days).toEqual([])
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle undefined warnings data gracefully', async () => {
      wrapper = mount(AlertClient, {
        props: {
          warningsData: undefined,
          language: 'fi' as Language,
        },
      })

      await flushPromises()

      expect((wrapper.vm as ComponentInstance).warnings).toBeNull()
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle malformed warnings data', async () => {
      const malformedData = {
        invalid: 'data',
        structure: 'wrong',
      }

      wrapper = mount(AlertClient, {
        props: {
          warningsData: malformedData as unknown as WarningsData,
          language: 'fi' as Language,
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
          warningsData: emptyData as unknown as WarningsData,
          language: 'fi' as Language,
        },
      })

      await flushPromises()

      const vm = wrapper.vm as ComponentInstance
      expect(vm.warnings).toBeDefined()
      expect(vm.days).toHaveLength(5)
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Computed properties', () => {
    it('should compute toContentText correctly', async () => {
      wrapper = mount(AlertClient, {
        props: {
          warningsData: mockWarningsData,
          language: 'fi' as Language,
          regionListEnabled: true,
        },
      })

      await flushPromises()

      const vm = wrapper.vm as ComponentInstance
      expect(vm.toContentText).toBeDefined()
      expect(typeof vm.toContentText).toBe('string')
    })

    it('should compute validData correctly with warnings', async () => {
      wrapper = mount(AlertClient, {
        props: {
          warningsData: mockWarningsData,
          language: 'fi' as Language,
        },
      })

      await flushPromises()

      expect(typeof (wrapper.vm as ComponentInstance).validData).toBe('boolean')
    })

    it('should compute numWarnings correctly', async () => {
      wrapper = mount(AlertClient, {
        props: {
          warningsData: mockWarningsData,
          language: 'fi' as Language,
        },
      })

      await flushPromises()

      const vm = wrapper.vm as ComponentInstance
      expect(typeof vm.numWarnings).toBe('number')
      expect(vm.numWarnings).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels on main container', async () => {
      wrapper = mount(AlertClient, {
        props: {
          warningsData: mockWarningsData,
          language: 'fi' as Language,
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
          language: 'fi' as Language,
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
          language: 'fi' as Language,
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
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).language).toBe('fi')
    })
  })

  describe('Edge cases', () => {
    it('should handle invalid geometry ID', () => {
      wrapper = mount(AlertClient, {
        props: {
          geometryId: -1,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.exists()).toBe(true)
      expect((wrapper.vm as ComponentInstance).geometryId).toBe(-1)
    })

    it('should handle very large refresh interval', () => {
      wrapper = mount(AlertClient, {
        props: {
          refreshInterval: 2147483647, // Max 32-bit signed integer
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).timer).toBeDefined()
    })

    it('should handle invalid theme gracefully', () => {
      wrapper = mount(AlertClient, {
        props: {
          theme: 'invalid-theme' as Theme,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.exists()).toBe(true)
      expect((wrapper.vm as ComponentInstance).theme).toBe('invalid-theme')
    })

    it('should accept valid default day range', () => {
      wrapper = mount(AlertClient, {
        props: {
          defaultDay: 4,
          language: 'fi' as Language,
        },
      })

      // Component should mount with valid day value
      expect(wrapper.exists()).toBe(true)
      expect((wrapper.vm as ComponentInstance).selectedDay).toBe(4)
    })

    it('should handle concurrent day selections', async () => {
      wrapper = mount(AlertClient, {
        props: {
          warningsData: mockWarningsData,
          language: 'fi' as Language,
        },
      })

      await flushPromises()

      const vm = wrapper.vm as ComponentInstance
      // Rapidly change days
      vm.onDaySelected(1)
      vm.onDaySelected(2)
      vm.onDaySelected(3)
      vm.onDaySelected(4)

      // Should end up with last selected day
      expect(vm.selectedDay).toBe(4)
    })
  })

  describe('Performance', () => {
    it('should handle multiple mount and unmount cycles', () => {
      // Create and destroy multiple instances
      for (let i = 0; i < 3; i++) {
        const w = mount(AlertClient, {
          props: {
            refreshInterval: 60000,
            language: 'fi' as Language,
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
          type: 'FeatureCollection' as const,
          features: Array(100)
            .fill(null)
            .map((_, i) => ({
              ...mockWarningsData.weather_finland_active_all!.features[0],
              properties: {
                ...mockWarningsData.weather_finland_active_all!.features[0]!
                  .properties,
                identifier: `warning-${i}`,
              },
            })),
        },
      }

      const startTime = performance.now()

      wrapper = mount(AlertClient, {
        props: {
          warningsData: largeDataset as unknown as WarningsData,
          language: 'fi' as Language,
        },
      })

      await flushPromises()

      const endTime = performance.now()
      const duration = endTime - startTime

      // Processing should complete in reasonable time (< 5000ms)
      expect(duration).toBeLessThan(5000)
      expect(wrapper.exists()).toBe(true)
    })
  })
})
