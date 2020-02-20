import RegionModel from 'models/regions/LandRegionModel';
import SeaRegionModel from 'models/regions/SeaRegionModel';

const SeaRegionB4EModel = SeaRegionModel.extend({
  defaults: {
    neighbours: [],
    order: 30060,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Saaristomeri'));
  },
});
_.defaults(
  SeaRegionB4EModel.prototype.defaults,
  SeaRegionModel.prototype.defaults
);

export default SeaRegionB4EModel;
