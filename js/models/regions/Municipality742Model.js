import RegionModel from 'models/regions/MunicipalityModel';
import MunicipalityModel from 'models/regions/MunicipalityModel';

const Municipality742Model = MunicipalityModel.extend({
  defaults: {
    neighbours: ['municipality_732', 'municipality_583', 'municipality_758'],
    parent: 'county_19',
    order: 20210,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Savukoski'));
  },
});
_.defaults(
  Municipality742Model.prototype.defaults,
  MunicipalityModel.prototype.defaults
);

export default Municipality742Model;
