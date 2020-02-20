import RegionModel from 'models/regions/LandRegionModel';
import SeaRegionModel from 'models/regions/SeaRegionModel';

const SeaRegionNorthFI115978Model = SeaRegionModel.extend({
  defaults: {
    neighbours: [],
    lift: 4,
    order: 30130,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Saimaan pohjoisosa'));
  },
});
_.defaults(
  SeaRegionNorthFI115978Model.prototype.defaults,
  SeaRegionModel.prototype.defaults
);

export default SeaRegionNorthFI115978Model;
