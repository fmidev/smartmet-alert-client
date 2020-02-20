import RegionModel from 'models/regions/RegionModel';
import CountyModel from 'models/regions/CountyModel';

const County7Model = CountyModel.extend({
  defaults: {
    neighbours: [],
    order: 10060,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Päijät-Häme'));
  },
});
_.defaults(County7Model.prototype.defaults, CountyModel.prototype.defaults);

export default County7Model;
