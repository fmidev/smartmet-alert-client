import RegionModel from 'models/regions/MunicipalityModel';
import MunicipalityModel from 'models/regions/MunicipalityModel';

const Municipality845Model = MunicipalityModel.extend({
  defaults: {
    neighbours: [
      'municipality_698',
      'municipality_683',
      'municipality_751',
      'municipality_241',
      'municipality_851',
    ],
    parent: 'county_19',
    order: 20110,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Tervola'));
  },
});
_.defaults(
  Municipality845Model.prototype.defaults,
  MunicipalityModel.prototype.defaults
);

export default Municipality845Model;
