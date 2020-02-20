import RegionModel from 'models/regions/MunicipalityModel';
import MunicipalityModel from 'models/regions/MunicipalityModel';

const Municipality976Model = MunicipalityModel.extend({
  defaults: {
    neighbours: ['municipality_854', 'municipality_698', 'municipality_851'],
    parent: 'county_19',
    order: 20100,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Ylitornio'));
  },
});
_.defaults(
  Municipality976Model.prototype.defaults,
  MunicipalityModel.prototype.defaults
);

export default Municipality976Model;
