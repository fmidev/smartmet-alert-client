import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import RegionWarning from '@/components/RegionWarning.vue'

const mockWarning = {
  type: 'wind',
  severity: 3,
  text: '15',
  direction: 180,
  key: 'test-warning-1',
}

describe('RegionWarning.vue snapshots', () => {
  let wrapper

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('should match snapshot for wind warning', () => {
    wrapper = mount(RegionWarning, {
      props: {
        input: mockWarning,
        language: 'fi',
      },
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should match snapshot for different warning types', () => {
    const types = ['wind', 'rain', 'thunderstorm', 'forestFire']

    types.forEach((type) => {
      wrapper = mount(RegionWarning, {
        props: {
          input: { ...mockWarning, type },
          language: 'fi',
        },
      })

      expect(wrapper.html()).toMatchSnapshot(`type-${type}`)
      wrapper.unmount()
    })
  })

  it('should match snapshot without wind speed', () => {
    wrapper = mount(RegionWarning, {
      props: {
        input: { ...mockWarning, text: null, direction: null },
        language: 'fi',
      },
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should match snapshot for all severity levels', () => {
    for (let severity = 1; severity <= 4; severity++) {
      wrapper = mount(RegionWarning, {
        props: {
          input: { ...mockWarning, severity },
          language: 'fi',
        },
      })

      expect(wrapper.html()).toMatchSnapshot(`severity-${severity}`)
      wrapper.unmount()
    }
  })
})
