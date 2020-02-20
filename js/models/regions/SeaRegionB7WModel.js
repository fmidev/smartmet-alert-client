import RegionModel from 'models/regions/LandRegionModel';
import SeaRegionModel from 'models/regions/SeaRegionModel';

const SeaRegionB7WModel = SeaRegionModel.extend({
  defaults: {
    neighbours: [],
    order: 30040,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Pohjois-Itämeren länsiosa'));
  },
});
_.defaults(
  SeaRegionB7WModel.prototype.defaults,
  SeaRegionModel.prototype.defaults
);

export default SeaRegionB7WModel;
