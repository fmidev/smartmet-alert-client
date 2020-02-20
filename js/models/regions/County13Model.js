import RegionModel from 'models/regions/RegionModel';
import CountyModel from 'models/regions/CountyModel';

const County13Model = CountyModel.extend({
  defaults: {
    neighbours: [],
    order: 10100,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Keski-Suomi'));
  },
});
_.defaults(County13Model.prototype.defaults, CountyModel.prototype.defaults);

export default County13Model;
