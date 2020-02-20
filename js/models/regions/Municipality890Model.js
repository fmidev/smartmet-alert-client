import RegionModel from 'models/regions/MunicipalityModel';
import MunicipalityModel from 'models/regions/MunicipalityModel';

const Municipality890Model = MunicipalityModel.extend({
  defaults: {
    neighbours: ['municipality_148'],
    parent: 'county_19',
    order: 20240,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Utsjoki'));
  },
});
_.defaults(
  Municipality890Model.prototype.defaults,
  MunicipalityModel.prototype.defaults
);

export default Municipality890Model;
