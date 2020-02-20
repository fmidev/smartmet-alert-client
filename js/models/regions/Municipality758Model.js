import RegionModel from 'models/regions/MunicipalityModel';
import MunicipalityModel from 'models/regions/MunicipalityModel';

const Municipality758Model = MunicipalityModel.extend({
  defaults: {
    neighbours: [
      'municipality_742',
      'municipality_583',
      'municipality_698',
      'municipality_261',
      'municipality_148',
    ],
    parent: 'county_19',
    order: 20190,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Sodankylä'));
  },
});
_.defaults(
  Municipality758Model.prototype.defaults,
  MunicipalityModel.prototype.defaults
);

export default Municipality758Model;
