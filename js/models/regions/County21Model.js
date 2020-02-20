import RegionModel from 'models/regions/RegionModel';
import CountyModel from 'models/regions/CountyModel';

const County21Model = CountyModel.extend({
  defaults: {
    neighbours: [],
    order: 10010,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Ahvenanmaa'));
  },
});
_.defaults(County21Model.prototype.defaults, CountyModel.prototype.defaults);

export default County21Model;
