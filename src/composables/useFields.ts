/**
 * Warning field computations composable
 *
 * Provides computed values for warning icon display based on input data.
 */

import { computed, type Ref, type ComputedRef } from 'vue'
import type { WarningIconInput, Severity } from '@/types'

export interface UseFieldsReturn {
  typeClass: ComputedRef<string>
  rotation: ComputedRef<number>
  invertedRotation: ComputedRef<number>
  severity: ComputedRef<Severity>
}

export function useFields(input: Ref<WarningIconInput>): UseFieldsReturn {
  /**
   * Convert camelCase type to kebab-case CSS class
   * e.g., "thunderStorm" -> "thunder-storm"
   */
  const typeClass = computed<string>(() => {
    return input.value.type
      .split(/(?=[A-Z])/)
      .reduce(
        (acc: string, part: string) =>
          acc + (acc.length ? '-' : '') + part.toLowerCase(),
        ''
      )
  })

  /**
   * Normalize rotation to nearest 5 degrees (0-355)
   */
  const rotation = computed<number>(() => {
    const direction = input.value.direction
    return Number.isFinite(direction)
      ? Math.round(Math.round((direction! + 360) % 360) / 5) * 5
      : 0
  })

  /**
   * Inverted rotation for counter-rotating elements
   */
  const invertedRotation = computed<number>(() => {
    return 360 - rotation.value
  })

  /**
   * Validated severity (only 2, 3, 4 are valid warning levels)
   */
  const severity = computed<Severity>(() => {
    const sev = input.value.severity
    if (sev < 2 || sev > 4) {
      return 0
    }
    return sev as Severity
  })

  return {
    typeClass,
    rotation,
    invertedRotation,
    severity,
  }
}
