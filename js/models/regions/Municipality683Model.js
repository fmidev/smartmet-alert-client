import RegionModel from 'models/regions/MunicipalityModel';
import MunicipalityModel from 'models/regions/MunicipalityModel';

const Municipality683Model = MunicipalityModel.extend({
  defaults: {
    neighbours: [
      'municipality_614',
      'municipality_751',
      'municipality_845',
      'municipality_698',
    ],
    parent: 'county_19',
    order: 20050,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Ranua'));
  },
});
_.defaults(
  Municipality683Model.prototype.defaults,
  MunicipalityModel.prototype.defaults
);

export default Municipality683Model;
