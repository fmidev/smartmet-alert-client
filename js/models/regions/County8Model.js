import RegionModel from 'models/regions/RegionModel';
import CountyModel from 'models/regions/CountyModel';

const County8Model = CountyModel.extend({
  defaults: {
    neighbours: [],
    order: 10070,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Kymenlaakso'));
  },
});
_.defaults(County8Model.prototype.defaults, CountyModel.prototype.defaults);

export default County8Model;
