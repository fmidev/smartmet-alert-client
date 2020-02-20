import RegionModel from 'models/regions/LandRegionModel';
import SeaRegionModel from 'models/regions/SeaRegionModel';

const SeaRegionB3NModel = SeaRegionModel.extend({
  defaults: {
    neighbours: [],
    order: 30080,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Selkämeren pohjoisosa'));
  },
});
_.defaults(
  SeaRegionB3NModel.prototype.defaults,
  SeaRegionModel.prototype.defaults
);

export default SeaRegionB3NModel;
