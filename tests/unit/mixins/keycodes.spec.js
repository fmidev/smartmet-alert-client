import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import keycodes from '@/mixins/keycodes'

const TestComponent = {
  mixins: [keycodes],
  template: '<div></div>',
}

describe('keycodes mixin', () => {
  it('should define KEY_CODE_END', () => {
    const wrapper = mount(TestComponent)
    expect(wrapper.vm.KEY_CODE_END).toBe(35)
  })

  it('should define KEY_CODE_HOME', () => {
    const wrapper = mount(TestComponent)
    expect(wrapper.vm.KEY_CODE_HOME).toBe(36)
  })

  it('should define KEY_CODE_LEFT', () => {
    const wrapper = mount(TestComponent)
    expect(wrapper.vm.KEY_CODE_LEFT).toBe(37)
  })

  it('should define KEY_CODE_RIGHT', () => {
    const wrapper = mount(TestComponent)
    expect(wrapper.vm.KEY_CODE_RIGHT).toBe(39)
  })

  it('should have all arrow key codes', () => {
    const wrapper = mount(TestComponent)

    expect(wrapper.vm.KEY_CODE_LEFT).toBeLessThan(wrapper.vm.KEY_CODE_RIGHT)
    expect(wrapper.vm.KEY_CODE_HOME).toBeLessThan(wrapper.vm.KEY_CODE_RIGHT)
  })
})
