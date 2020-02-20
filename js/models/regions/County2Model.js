import RegionModel from 'models/regions/RegionModel';
import CountyModel from 'models/regions/CountyModel';

const County2Model = CountyModel.extend({
  defaults: {
    neighbours: [],
    order: 10020,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Varsinais-Suomi'));
  },
});
_.defaults(County2Model.prototype.defaults, CountyModel.prototype.defaults);

export default County2Model;
