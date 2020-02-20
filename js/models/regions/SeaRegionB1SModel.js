import RegionModel from 'models/regions/LandRegionModel';
import SeaRegionModel from 'models/regions/SeaRegionModel';

const SeaRegionB1SModel = SeaRegionModel.extend({
  defaults: {
    neighbours: [],
    order: 30100,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Perämeren eteläosa'));
  },
});
_.defaults(
  SeaRegionB1SModel.prototype.defaults,
  SeaRegionModel.prototype.defaults
);

export default SeaRegionB1SModel;
