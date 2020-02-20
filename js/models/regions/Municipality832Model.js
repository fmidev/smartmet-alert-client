import RegionModel from 'models/regions/MunicipalityModel';
import MunicipalityModel from 'models/regions/MunicipalityModel';

const Municipality832Model = MunicipalityModel.extend({
  defaults: {
    neighbours: [],
    parent: 'county_17',
    order: 20020,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Taivalkoski'));
  },
});
_.defaults(
  Municipality832Model.prototype.defaults,
  MunicipalityModel.prototype.defaults
);

export default Municipality832Model;
