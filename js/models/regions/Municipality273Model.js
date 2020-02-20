import RegionModel from 'models/regions/MunicipalityModel';
import MunicipalityModel from 'models/regions/MunicipalityModel';

const Municipality273Model = MunicipalityModel.extend({
  defaults: {
    neighbours: [
      'municipality_498',
      'municipality_261',
      'municipality_698',
      'municipality_854',
    ],
    parent: 'county_19',
    order: 20160,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Kolari'));
  },
});
_.defaults(
  Municipality273Model.prototype.defaults,
  MunicipalityModel.prototype.defaults
);

export default Municipality273Model;
