import RegionModel from 'models/regions/LandRegionModel';
import SeaRegionModel from 'models/regions/SeaRegionModel';

const SeaRegionB4WModel = SeaRegionModel.extend({
  defaults: {
    neighbours: [],
    order: 30050,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Ahvenanmeri'));
  },
});
_.defaults(
  SeaRegionB4WModel.prototype.defaults,
  SeaRegionModel.prototype.defaults
);

export default SeaRegionB4WModel;
