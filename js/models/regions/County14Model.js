import RegionModel from 'models/regions/RegionModel';
import CountyModel from 'models/regions/CountyModel';

const County14Model = CountyModel.extend({
  defaults: {
    neighbours: [],
    order: 10140,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Etelä-Pohjanmaa'));
  },
});
_.defaults(County14Model.prototype.defaults, CountyModel.prototype.defaults);

export default County14Model;
