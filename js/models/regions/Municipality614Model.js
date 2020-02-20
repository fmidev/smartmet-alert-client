import RegionModel from 'models/regions/MunicipalityModel';
import MunicipalityModel from 'models/regions/MunicipalityModel';

const Municipality614Model = MunicipalityModel.extend({
  defaults: {
    neighbours: [
      'municipality_683',
      'municipality_698',
      'municipality_320',
      'municipality_732',
    ],
    parent: 'county_19',
    order: 20060,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Posio'));
  },
});
_.defaults(
  Municipality614Model.prototype.defaults,
  MunicipalityModel.prototype.defaults
);

export default Municipality614Model;
