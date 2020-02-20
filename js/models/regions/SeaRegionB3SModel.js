import RegionModel from 'models/regions/LandRegionModel';
import SeaRegionModel from 'models/regions/SeaRegionModel';

const SeaRegionB3SModel = SeaRegionModel.extend({
  defaults: {
    neighbours: [],
    order: 30070,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Selkämeren eteläosa'));
  },
});
_.defaults(
  SeaRegionB3SModel.prototype.defaults,
  SeaRegionModel.prototype.defaults
);

export default SeaRegionB3SModel;
