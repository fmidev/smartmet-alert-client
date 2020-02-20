import RegionModel from 'models/regions/RegionModel';
import CountyModel from 'models/regions/CountyModel';

const County9Model = CountyModel.extend({
  defaults: {
    neighbours: [],
    order: 10080,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Etelä-Karjala'));
  },
});
_.defaults(County9Model.prototype.defaults, CountyModel.prototype.defaults);

export default County9Model;
