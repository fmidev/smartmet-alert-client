import MapView from 'views/MapView';

const MapSmallView = MapView.extend({
  geometry: {},
  config: null,
  initialize() {
    const self = this;
    const defaults = require(`toml!../config/${CONFIG_PATH}/map.toml`);
    this.projection = defaults.projection;
    const regionFeatures = [];
    const index = this.model.get('index');
    jQuery(`.day-map-large-${index} .day-map-large`).attr(
      'id',
      'day-map-large'
    );
    const regionWarnings = self.model.get('regionWarnings')[index];
    const createRegionArrays = () => ({
      full: [],
      part: [],
    });
    this.model.collection.warnings
      .getModelsWhere('days', index)
      .forEach((warning) => {
        warning.get('regions').forEach((region) => {
          if (typeof regionWarnings[region] === 'undefined') {
            regionWarnings[region] = createRegionArrays();
          }
          regionWarnings[region]['full'].push(warning);
        });
        warning.get('coverages').forEach((region) => {
          if (typeof regionWarnings[region] === 'undefined') {
            regionWarnings[region] = createRegionArrays();
          }
          regionWarnings[region]['part'].push(warning);
        });
      });
    this.model.collection.regions.forEach((regionModel) => {
      if (typeof regionModel === 'undefined') {
        return;
      }
      const regionType = regionModel.get('regionType');
      const region = regionModel.get('region');
      const color = self.colors[regionModel.get('regionType')];
      const feature = regionModel.get('feature');
      // _.isNil(feature)
      if (typeof feature === 'undefined' || feature === null) {
        return;
      }
      if (feature.geometry === null) {
        return;
      }
      if (typeof self.geometry[region] === 'undefined') {
        self.geometry[region] = feature.geometry.geometries.reduce(
          (newArray, { coordinates, type }) => {
            if (typeof coordinates !== 'undefined') {
              switch (type) {
                case 'Polygon':
                  newArray.push(coordinates);
                  break;
                case 'MultiPolygon':
                  coordinates.forEach((coordinates) => {
                    newArray.push(coordinates);
                  });
                  break;
              }
            }
            return newArray;
          },
          []
        );
      }
      regionFeatures.push({
        type: 'MultiPolygon',
        geometry: self.geometry[region],
        style: [
          {
            fill: {
              color,
            },
            stroke: {
              color: 'rgba(0, 0, 0, 0)',
            },
          },
          {
            stroke: {
              color: 'rgba(0, 0, 0, 0)',
              width: 1,
            },
          },
        ],
        defaultOpacity: regionModel.get('defaultOpacity'),
        region: regionModel.get('region'),
        priority: regionModel.get('priority'),
        lift: regionModel.get('lift'),
        regionType,
        reference: feature.properties.reference,
      });
    });
    const config = {
      project: 'fmiwarnings',
      map: {
        model: {
          layers: [
            {
              className: 'Vector',
              title: 'Regions',
              type: 'features',
              visible: true,
              source: {
                projection: self.projection,
                features: regionFeatures,
                useSpatialIndex: false,
              },
            },
          ],
        },
        view: {
          container: `day-map-small-${this.model.get('index')}`,
          mapContainer: `day-map-small-base-${this.model.get('index')}`,
          projection: self.projection,
          extent: defaults.extent,
          resolutions: [12000],
          defaultCenterLocation: defaults.center,
          defaultCenterProjection: self.projection,
          defaultZoomLevel: 0,
          showLegend: false,
          maxAsyncLoadCount: 5,
          staticControls: true,
        },
      },
      time: {
        view: {
          showTimeSlider: false,
        },
      },
      localization: {
        locale: __('metoclientLanguage'),
      },
    };
    config.localization[__('metoclientLanguage')] = {
      // Add Metoclient 3 custom localizations here
    };
    // Save memory on mobile devices
    if (jQuery(`#day-map-small-${index}.map-small`).css('display') !== 'none') {
      this.visualizer = new fi.fmi.metoclient.ui.animator.MapLibrary(config);
      this.visualizer.createAnimation();
    } else {
      this.config = config;
    }
  },

  render() {
    const index = this.model.get('index');
    if (jQuery(`#day-map-small-${index}.map-small`).css('display') !== 'none') {
      if (this.config != null) {
        this.visualizer = new fi.fmi.metoclient.ui.animator.MapLibrary(
          this.config
        );
        this.visualizer.createAnimation();
        this.config = null;
      }
      MapView.prototype.render.call(this);
    }
    return this;
  },
});

export default MapSmallView;
