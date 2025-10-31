export const mockWeatherUpdateTime = {
  features: [
    {
      properties: {
        update_time: '2025-10-31T12:00:00Z',
      },
    },
  ],
}

export const mockFloodUpdateTime = {
  features: [
    {
      properties: {
        update_time: '2025-10-31T11:00:00Z',
      },
    },
  ],
}

export const mockWeatherWarning = {
  type: 'Feature',
  properties: {
    identifier: 'test-warning-wind-1',
    warning_context: 'wind',
    severity: 'level-3',
    effective_from: '2025-10-31T12:00:00Z',
    effective_until: '2025-11-01T12:00:00Z',
    reference: 'fi-warning#county.1',
    physical_direction: 270,
    physical_value: 25,
    info_fi: 'Kovaa tuulta',
    info_sv: 'Hårt blåsväder',
    info_en: 'Strong wind',
  },
  geometry: null,
}

export const mockThunderStormWarning = {
  type: 'Feature',
  properties: {
    identifier: 'test-warning-thunder-1',
    warning_context: 'thunder-storm',
    severity: 'level-4',
    effective_from: '2025-10-31T14:00:00Z',
    effective_until: '2025-10-31T20:00:00Z',
    reference: 'fi-warning#county.2',
    info_fi: 'Ukkosmyrsky',
    info_sv: 'Åskväder',
    info_en: 'Thunderstorm',
  },
  geometry: null,
}

export const mockSeaWindWarning = {
  type: 'Feature',
  properties: {
    identifier: 'test-warning-seawind-1',
    warning_context: 'sea-wind',
    severity: 'level-2',
    effective_from: '2025-10-31T12:00:00Z',
    effective_until: '2025-11-01T12:00:00Z',
    reference: 'fi-warning#sea_region.B1N',
    physical_direction: 180,
    physical_value: '15',
    info_fi: 'Kovaa tuulta merellä',
    info_sv: 'Hårt blåsväder på havet',
    info_en: 'Strong wind at sea',
  },
  geometry: null,
}

export const mockFloodWarning = {
  type: 'Feature',
  properties: {
    identifier: 'test-warning-flood-1',
    severity: 'Severe',
    onset: '2025-10-31T12:00:00Z',
    expires: '2025-11-02T12:00:00Z',
    reference: 'fi-warning#county.5',
    description: encodeURIComponent(JSON.stringify(['Tulvavaara'])),
    language: 'fi-FI',
  },
  geometry: null,
}

export const mockCoverageWarning = {
  type: 'Feature',
  properties: {
    identifier: 'test-warning-coverage-1',
    warning_context: 'rain',
    severity: 'level-3',
    effective_from: '2025-10-31T12:00:00Z',
    effective_until: '2025-11-01T12:00:00Z',
    reference: 'fi-warning#county.6',
    coverage_references: 'fi-warning#county.6?c=75',
    representative_x: 300000,
    representative_y: 7000000,
    info_fi: 'Runsasta sadetta',
    info_sv: 'Kraftigt regn',
    info_en: 'Heavy rain',
  },
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [300000, 7000000],
        [310000, 7000000],
        [310000, 7010000],
        [300000, 7010000],
        [300000, 7000000],
      ],
    ],
  },
}

export const mockWeatherWarnings = {
  features: [
    mockWeatherWarning,
    mockThunderStormWarning,
    mockSeaWindWarning,
    mockCoverageWarning,
  ],
}

export const mockFloodWarnings = {
  features: [mockFloodWarning],
}

export const mockWarningsData = {
  weather_update_time: mockWeatherUpdateTime,
  flood_update_time: mockFloodUpdateTime,
  weather_finland_active_all: mockWeatherWarnings,
  flood_finland_active_all: mockFloodWarnings,
}
