import LandRegionModel from 'models/regions/LandRegionModel';

const MunicipalityModel = LandRegionModel.extend({
  defaults: {
    priority: 3,
  },
  validation: {},
});
_.defaults(
  MunicipalityModel.prototype.defaults,
  LandRegionModel.prototype.defaults
);

export default MunicipalityModel;
