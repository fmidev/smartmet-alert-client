import RegionModel from 'models/regions/LandRegionModel';
import SeaRegionModel from 'models/regions/SeaRegionModel';

const SeaRegionB1NModel = SeaRegionModel.extend({
  defaults: {
    neighbours: [],
    order: 30110,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Perämeren pohjoisosa'));
  },
});
_.defaults(
  SeaRegionB1NModel.prototype.defaults,
  SeaRegionModel.prototype.defaults
);

export default SeaRegionB1NModel;
