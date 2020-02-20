import LandRegionModel from 'models/regions/LandRegionModel';

const CountyModel = LandRegionModel.extend({
  defaults: {
    priority: 2,
  },
  validation: {},
});
_.defaults(CountyModel.prototype.defaults, LandRegionModel.prototype.defaults);

export default CountyModel;
