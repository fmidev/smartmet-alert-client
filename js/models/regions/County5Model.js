import RegionModel from 'models/regions/RegionModel';
import CountyModel from 'models/regions/CountyModel';

const County5Model = CountyModel.extend({
  defaults: {
    neighbours: [],
    order: 10050,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Kanta-Häme'));
  },
});
_.defaults(County5Model.prototype.defaults, CountyModel.prototype.defaults);

export default County5Model;
