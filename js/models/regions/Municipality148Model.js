import RegionModel from 'models/regions/MunicipalityModel';
import MunicipalityModel from 'models/regions/MunicipalityModel';

const Municipality148Model = MunicipalityModel.extend({
  defaults: {
    neighbours: [
      'municipality_890',
      'municipality_758',
      'municipality_261',
      'municipality_47',
    ],
    parent: 'county_19',
    order: 20230,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Inari'));
  },
});
_.defaults(
  Municipality148Model.prototype.defaults,
  MunicipalityModel.prototype.defaults
);

export default Municipality148Model;
