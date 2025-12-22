/**
 * Type declarations for geojsonsvg.js mixin
 *
 * This mixin is adapted from mapshaper and provides GeoJSON to SVG conversion.
 * The implementation remains in JavaScript for stability.
 */

import type { ComponentOptionsMixin } from 'vue'

export interface GeoJSONFeature {
  type: 'Feature'
  id?: string
  geometry: GeoJSONGeometry | null
  properties: Record<string, unknown>
}

export interface GeoJSONGeometry {
  type: string
  coordinates?: unknown
  geometries?: GeoJSONGeometry[]
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
  totalFeatures?: number
  crs?: {
    type: string
    properties: {
      name: string
    }
  }
}

export interface SVGExportOptions {
  invert_y?: boolean
  rfc7946?: boolean
  v2?: boolean
  width?: number
  height?: number
}

declare const geojsonsvg: ComponentOptionsMixin & {
  methods: {
    /**
     * Convert GeoJSON data to SVG string
     */
    geoJSONToSVG(
      data: GeoJSONFeatureCollection,
      width: number,
      height: number,
      options?: SVGExportOptions
    ): string
  }
}

export default geojsonsvg
