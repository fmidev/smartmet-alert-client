import RegionModel from 'models/regions/RegionModel';
import CountyModel from 'models/regions/CountyModel';

const County12Model = CountyModel.extend({
  defaults: {
    neighbours: [],
    order: 10130,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Pohjois-Karjala'));
  },
});
_.defaults(County12Model.prototype.defaults, CountyModel.prototype.defaults);

export default County12Model;
