/**
 * Keyboard navigation key codes composable
 *
 * Provides key code constants for keyboard navigation in the alert client.
 */

import { KEY_CODES } from '@/types'

export function useKeyCodes() {
  return {
    KEY_CODE_END: KEY_CODES.END,
    KEY_CODE_HOME: KEY_CODES.HOME,
    KEY_CODE_LEFT: KEY_CODES.LEFT,
    KEY_CODE_RIGHT: KEY_CODES.RIGHT,
  }
}
