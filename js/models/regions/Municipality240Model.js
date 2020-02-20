import RegionModel from 'models/regions/MunicipalityModel';
import MunicipalityModel from 'models/regions/MunicipalityModel';

const Municipality240Model = MunicipalityModel.extend({
  defaults: {
    neighbours: ['municipality_241', 'municipality_751'],
    parent: 'county_19',
    order: 20070,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Kemi'));
  },
});
_.defaults(
  Municipality240Model.prototype.defaults,
  MunicipalityModel.prototype.defaults
);

export default Municipality240Model;
