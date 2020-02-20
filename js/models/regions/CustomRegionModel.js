import RegionModel from 'models/regions/RegionModel';

const CustomRegionModel = RegionModel.extend({
  defaults: {
    regionType: 'custom',
    infoAvailable: false,
    defaultOpacity: 0,
    priority: 5,
    neighbours: [],
  },
  validation: {},
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', '');
    const feature = this.get('feature');
    this.set('geometry', feature.geometry);
    this.set('properties', {
      reference: this.get('reference'),
      representative_x: feature.properties.representative_x,
      representative_y: feature.properties.representative_y,
    });
    this.set('simplifiedFeature', {
      type: 'Feature',
      id: `${feature.id}_simple`,
      geometry: feature.properties.geom_simple,
      geometry_name: 'geom_simple',
      properties: this.get('properties'),
    });
  },
});
_.defaults(
  CustomRegionModel.prototype.defaults,
  RegionModel.prototype.defaults
);

export default CustomRegionModel;
