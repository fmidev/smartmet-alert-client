import RegionModel from 'models/regions/MunicipalityModel';
import MunicipalityModel from 'models/regions/MunicipalityModel';

const Municipality305Model = MunicipalityModel.extend({
  defaults: {
    neighbours: [
      'municipality_832',
    ],
    parent: 'county_17',
    order: 20030,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Kuusamo'));
  },
});
_.defaults(
  Municipality305Model.prototype.defaults,
  MunicipalityModel.prototype.defaults
);

export default Municipality305Model;
