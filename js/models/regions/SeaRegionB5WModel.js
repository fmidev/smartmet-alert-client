import RegionModel from 'models/regions/LandRegionModel';
import SeaRegionModel from 'models/regions/SeaRegionModel';

const SeaRegionB5WModel = SeaRegionModel.extend({
  defaults: {
    neighbours: [],
    order: 30020,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Suomenlahden länsiosa'));
  },
});
_.defaults(
  SeaRegionB5WModel.prototype.defaults,
  SeaRegionModel.prototype.defaults
);

export default SeaRegionB5WModel;
