/**
 * Vue component exports for use in Vue/Nuxt applications.
 *
 * Usage:
 *   import { SmartMetAlertClient } from '@fmidev/smartmet-alert-client/vue'
 *   import '@fmidev/smartmet-alert-client/vue/style.css'
 *
 *   <SmartMetAlertClient
 *     :refresh-interval="900000"
 *     :selected-day="0"
 *     :geometry-id="2021"
 *     language="fi"
 *   />
 *
 * Props:
 *   language            String                   'fi'           Language code: 'fi', 'sv', 'en'
 *   theme               String                   'light'        Theme: 'light', 'dark', 'light-gray', 'dark-gray'
 *   geometry-id         String|Number            2021           Geometry version ID
 *   selected-day        String|Number            0              Initially selected day (0-4)
 *   refresh-interval    String|Number            900000         Data refresh interval in ms (0 to disable)
 *   region-list-enabled String|Boolean           true           Show region list below the map
 *   static-days         String|Boolean           true           Use static day labels
 *   spinner-enabled     String|Boolean           true           Show loading spinner
 *   gray-scale-selector String|Boolean           true           Show grayscale theme toggle
 *   sleep               String|Boolean           true           Pause updates when tab is hidden
 *   font-scale          String|Number            1              Font size multiplier
 *   base-url            String                   (FMI GeoServer) Base URL for WFS queries
 *   start-from          String                   ''             Start date override (ISO format)
 *   current-date        String|Date              null           Override current date for testing
 *   warnings            String|Object            null           Pre-loaded warnings data (skip fetch)
 *   weather-warnings    String                   ''             Custom weather warnings query
 *   flood-warnings      String                   ''             Custom flood warnings query
 *   weather-updated     String                   ''             Custom weather update time query
 *   flood-updated       String                   ''             Custom flood update time query
 *   daily-warning-types String|Array             []             Filter specific warning types
 *   debug-mode          String|Boolean           false          Enable debug logging
 */
import AlertClientVue from './AlertClientVue.vue'

export { AlertClientVue as SmartMetAlertClient }
export default AlertClientVue
