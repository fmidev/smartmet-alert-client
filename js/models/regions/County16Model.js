import RegionModel from 'models/regions/RegionModel';
import CountyModel from 'models/regions/CountyModel';

const County16Model = CountyModel.extend({
  defaults: {
    neighbours: [],
    order: 10160,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Keski-Pohjanmaa'));
  },
});
_.defaults(County16Model.prototype.defaults, CountyModel.prototype.defaults);

export default County16Model;
