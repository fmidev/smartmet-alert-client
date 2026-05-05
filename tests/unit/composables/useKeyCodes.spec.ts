import { describe, it, expect } from 'vitest'
import { useKeyCodes } from '@/composables/useKeyCodes'

describe('useKeyCodes composable', () => {
  const keyCodes = useKeyCodes()

  it('should define KEY_CODE_END', () => {
    expect(keyCodes.KEY_CODE_END).toBe(35)
  })

  it('should define KEY_CODE_HOME', () => {
    expect(keyCodes.KEY_CODE_HOME).toBe(36)
  })

  it('should define KEY_CODE_LEFT', () => {
    expect(keyCodes.KEY_CODE_LEFT).toBe(37)
  })

  it('should define KEY_CODE_RIGHT', () => {
    expect(keyCodes.KEY_CODE_RIGHT).toBe(39)
  })

  it('should have all arrow key codes', () => {
    expect(keyCodes.KEY_CODE_LEFT).toBeLessThan(keyCodes.KEY_CODE_RIGHT)
    expect(keyCodes.KEY_CODE_HOME).toBeLessThan(keyCodes.KEY_CODE_RIGHT)
  })
})
