import RegionModel from 'models/regions/LandRegionModel';
import SeaRegionModel from 'models/regions/SeaRegionModel';

const SeaRegionB7EModel = SeaRegionModel.extend({
  defaults: {
    neighbours: [],
    order: 30030,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Pohjois-Itämeren itäosa'));
  },
});
_.defaults(
  SeaRegionB7EModel.prototype.defaults,
  SeaRegionModel.prototype.defaults
);

export default SeaRegionB7EModel;
