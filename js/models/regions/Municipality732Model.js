import RegionModel from 'models/regions/MunicipalityModel';
import MunicipalityModel from 'models/regions/MunicipalityModel';

const Municipality732Model = MunicipalityModel.extend({
  defaults: {
    neighbours: [
      'municipality_614',
      'municipality_320',
      'municipality_583',
      'municipality_742',
    ],
    parent: 'county_19',
    order: 20150,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Salla'));
  },
});
_.defaults(
  Municipality732Model.prototype.defaults,
  MunicipalityModel.prototype.defaults
);

export default Municipality732Model;
