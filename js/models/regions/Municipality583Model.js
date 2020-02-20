import RegionModel from 'models/regions/MunicipalityModel';
import MunicipalityModel from 'models/regions/MunicipalityModel';

const Municipality583Model = MunicipalityModel.extend({
  defaults: {
    neighbours: [
      'municipality_742',
      'municipality_732',
      'municipality_320',
      'municipality_758',
    ],
    parent: 'county_19',
    order: 20200,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Pelkosenniemi'));
  },
});
_.defaults(
  Municipality583Model.prototype.defaults,
  MunicipalityModel.prototype.defaults
);

export default Municipality583Model;
