import RegionModel from 'models/regions/MunicipalityModel';
import MunicipalityModel from 'models/regions/MunicipalityModel';

const Municipality47Model = MunicipalityModel.extend({
  defaults: {
    neighbours: ['municipality_498', 'municipality_261', 'municipality_148'],
    parent: 'county_19',
    order: 20220,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Enontekiö'));
  },
});
_.defaults(
  Municipality47Model.prototype.defaults,
  MunicipalityModel.prototype.defaults
);

export default Municipality47Model;
