import RegionModel from 'models/regions/MunicipalityModel';
import MunicipalityModel from 'models/regions/MunicipalityModel';

const Municipality498Model = MunicipalityModel.extend({
  defaults: {
    neighbours: ['municipality_47', 'municipality_261', 'municipality_273'],
    parent: 'county_19',
    order: 20170,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Muonio'));
  },
});
_.defaults(
  Municipality498Model.prototype.defaults,
  MunicipalityModel.prototype.defaults
);

export default Municipality498Model;
