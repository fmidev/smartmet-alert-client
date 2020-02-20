import RegionModel from 'models/regions/RegionModel';
import CountyModel from 'models/regions/CountyModel';

const County15Model = CountyModel.extend({
  defaults: {
    neighbours: [],
    order: 10150,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Pohjanmaa'));
  },
});
_.defaults(County15Model.prototype.defaults, CountyModel.prototype.defaults);

export default County15Model;
