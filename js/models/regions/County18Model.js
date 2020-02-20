import RegionModel from 'models/regions/RegionModel';
import CountyModel from 'models/regions/CountyModel';

const County18Model = CountyModel.extend({
  defaults: {
    neighbours: [],
    order: 10180,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Kainuu'));
  },
});
_.defaults(County18Model.prototype.defaults, CountyModel.prototype.defaults);

export default County18Model;
