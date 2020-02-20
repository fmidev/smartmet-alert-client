import RegionModel from 'models/regions/RegionModel';
import CountyModel from 'models/regions/CountyModel';

const County10Model = CountyModel.extend({
  defaults: {
    neighbours: [],
    order: 10110,
  },
  initialize(...args) {
    RegionModel.prototype.initialize.apply(this, args);
    this.set('name', __('Etelä-Savo'));
  },
});
_.defaults(County10Model.prototype.defaults, CountyModel.prototype.defaults);

export default County10Model;
