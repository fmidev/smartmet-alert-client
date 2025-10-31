import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Warning from '@/components/Warning.vue'

const mockWarning = {
  type: 'wind',
  severity: 3,
  visible: true,
}

describe('Warning.vue snapshots', () => {
  let wrapper

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('should match snapshot for default state', () => {
    wrapper = mount(Warning, {
      props: {
        input: mockWarning,
        hideable: true,
        language: 'fi',
        theme: 'light-theme',
      },
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should match snapshot for hidden warning', () => {
    wrapper = mount(Warning, {
      props: {
        input: { ...mockWarning, visible: false },
        hideable: true,
        language: 'fi',
        theme: 'light-theme',
      },
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should match snapshot for different severity levels', () => {
    const severities = [1, 2, 3, 4]

    severities.forEach((severity) => {
      wrapper = mount(Warning, {
        props: {
          input: { ...mockWarning, severity },
          hideable: true,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      expect(wrapper.html()).toMatchSnapshot(`severity-${severity}`)
      wrapper.unmount()
    })
  })

  it('should match snapshot for dark theme', () => {
    wrapper = mount(Warning, {
      props: {
        input: mockWarning,
        hideable: true,
        language: 'fi',
        theme: 'dark-theme',
      },
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should match snapshot for different languages', () => {
    const languages = ['fi', 'sv', 'en']

    languages.forEach((language) => {
      wrapper = mount(Warning, {
        props: {
          input: mockWarning,
          hideable: true,
          language,
          theme: 'light-theme',
        },
      })

      expect(wrapper.html()).toMatchSnapshot(`language-${language}`)
      wrapper.unmount()
    })
  })

  it('should match snapshot when not hideable', () => {
    wrapper = mount(Warning, {
      props: {
        input: mockWarning,
        hideable: false,
        language: 'fi',
        theme: 'light-theme',
      },
    })

    expect(wrapper.html()).toMatchSnapshot()
  })
})
