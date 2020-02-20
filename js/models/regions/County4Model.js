import RegionModel from 'models/regions/RegionModel';
import CountyModel from 'models/regions/CountyModel';

const County4Model = CountyModel.extend({
  defaults: {
    neighbours: [],
    order: 10030,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Satakunta'));
  },
});
_.defaults(County4Model.prototype.defaults, CountyModel.prototype.defaults);

export default County4Model;
