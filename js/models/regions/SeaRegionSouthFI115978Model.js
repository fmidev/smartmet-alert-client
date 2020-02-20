import RegionModel from 'models/regions/LandRegionModel';
import SeaRegionModel from 'models/regions/SeaRegionModel';

const SeaRegionSouthFI115978Model = SeaRegionModel.extend({
  defaults: {
    neighbours: [],
    lift: 4,
    order: 30120,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Saimaan eteläosa'));
  },
});
_.defaults(
  SeaRegionSouthFI115978Model.prototype.defaults,
  SeaRegionModel.prototype.defaults
);

export default SeaRegionSouthFI115978Model;
