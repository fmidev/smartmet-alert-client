import RegionModel from 'models/regions/RegionModel';

const SeaRegionModel = RegionModel.extend({
  defaults: {
    regionType: 'sea',
    defaultOpacity: 1,
    priority: 0,
  },
  validation: {},
});
_.defaults(SeaRegionModel.prototype.defaults, RegionModel.prototype.defaults);

export default SeaRegionModel;
