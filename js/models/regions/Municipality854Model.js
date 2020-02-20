import RegionModel from 'models/regions/MunicipalityModel';
import MunicipalityModel from 'models/regions/MunicipalityModel';

const Municipality854Model = MunicipalityModel.extend({
  defaults: {
    neighbours: ['municipality_273', 'municipality_698', 'municipality_976'],
    parent: 'county_19',
    order: 20120,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Pello'));
  },
});
_.defaults(
  Municipality854Model.prototype.defaults,
  MunicipalityModel.prototype.defaults
);

export default Municipality854Model;
