import RegionModel from 'models/regions/RegionModel';

const LandRegionModel = RegionModel.extend({
  defaults: {
    regionType: 'land',
    defaultOpacity: 1,
    priority: 1,
    children: [],
  },
  validation: {},
});
_.defaults(LandRegionModel.prototype.defaults, RegionModel.prototype.defaults);

export default LandRegionModel;
