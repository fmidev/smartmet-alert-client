import RegionModel from 'models/regions/RegionModel';
import CountyModel from 'models/regions/CountyModel';

const County6Model = CountyModel.extend({
  defaults: {
    neighbours: [],
    order: 10090,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Pirkanmaa'));
  },
});
_.defaults(County6Model.prototype.defaults, CountyModel.prototype.defaults);

export default County6Model;
