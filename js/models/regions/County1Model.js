import RegionModel from 'models/regions/RegionModel';
import CountyModel from 'models/regions/CountyModel';

const County1Model = CountyModel.extend({
  defaults: {
    neighbours: [],
    order: 10040,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Uusimaa'));
  },
});
_.defaults(County1Model.prototype.defaults, CountyModel.prototype.defaults);

export default County1Model;
