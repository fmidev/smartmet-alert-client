import RegionModel from 'models/regions/MunicipalityModel';
import MunicipalityModel from 'models/regions/MunicipalityModel';

const Municipality241Model = MunicipalityModel.extend({
  defaults: {
    neighbours: [
      'municipality_845',
      'municipality_751',
      'municipality_240',
      'municipality_851',
    ],
    parent: 'county_19',
    order: 20080,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Keminmaa'));
  },
});
_.defaults(
  Municipality241Model.prototype.defaults,
  MunicipalityModel.prototype.defaults
);

export default Municipality241Model;
