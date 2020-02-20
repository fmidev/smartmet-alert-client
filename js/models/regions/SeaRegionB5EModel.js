import RegionModel from 'models/regions/LandRegionModel';
import SeaRegionModel from 'models/regions/SeaRegionModel';

const SeaRegionB5EModel = SeaRegionModel.extend({
  defaults: {
    neighbours: [],
    order: 30010,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Suomenlahden itäosa'));
  },
});
_.defaults(
  SeaRegionB5EModel.prototype.defaults,
  SeaRegionModel.prototype.defaults
);

export default SeaRegionB5EModel;
