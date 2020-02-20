import RegionModel from 'models/regions/RegionModel';
import CountyModel from 'models/regions/CountyModel';

const County11Model = CountyModel.extend({
  defaults: {
    neighbours: [],
    order: 10120,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Pohjois-Savo'));
  },
});
_.defaults(County11Model.prototype.defaults, CountyModel.prototype.defaults);

export default County11Model;
