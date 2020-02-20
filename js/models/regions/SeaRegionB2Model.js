import RegionModel from 'models/regions/LandRegionModel';
import SeaRegionModel from 'models/regions/SeaRegionModel';

const SeaRegionB2Model = SeaRegionModel.extend({
  defaults: {
    neighbours: [],
    order: 30090,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Merenkurkku'));
  },
});
_.defaults(
  SeaRegionB2Model.prototype.defaults,
  SeaRegionModel.prototype.defaults
);

export default SeaRegionB2Model;
