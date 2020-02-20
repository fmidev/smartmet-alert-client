import RegionModel from 'models/regions/MunicipalityModel';
import MunicipalityModel from 'models/regions/MunicipalityModel';

const Municipality698Model = MunicipalityModel.extend({
  defaults: {
    neighbours: [
      'municipality_261',
      'municipality_758',
      'municipality_320',
      'municipality_614',
      'municipality_683',
      'municipality_845',
      'municipality_976',
      'municipality_854',
      'municipality_273',
    ],
    parent: 'county_19',
    order: 20130,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Rovaniemi'));
  },
});
_.defaults(
  Municipality698Model.prototype.defaults,
  MunicipalityModel.prototype.defaults
);

export default Municipality698Model;
