import RegionModel from 'models/regions/MunicipalityModel';
import MunicipalityModel from 'models/regions/MunicipalityModel';

const Municipality615Model = MunicipalityModel.extend({
  defaults: {
    neighbours: [],
    parent: 'county_17',
    order: 20010,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Pudasjärvi'));
  },
});
_.defaults(
  Municipality615Model.prototype.defaults,
  MunicipalityModel.prototype.defaults
);

export default Municipality615Model;
