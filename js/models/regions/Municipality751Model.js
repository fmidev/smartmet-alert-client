import RegionModel from 'models/regions/MunicipalityModel';
import MunicipalityModel from 'models/regions/MunicipalityModel';

const Municipality751Model = MunicipalityModel.extend({
  defaults: {
    neighbours: [
      'municipality_240',
      'municipality_241',
      'municipality_845',
      'municipality_683',
    ],
    parent: 'county_19',
    order: 20040,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Simo'));
  },
});
_.defaults(
  Municipality751Model.prototype.defaults,
  MunicipalityModel.prototype.defaults
);

export default Municipality751Model;
