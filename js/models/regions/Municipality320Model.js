import RegionModel from 'models/regions/MunicipalityModel';
import MunicipalityModel from 'models/regions/MunicipalityModel';

const Municipality320Model = MunicipalityModel.extend({
  defaults: {
    neighbours: [
      'municipality_583',
      'municipality_732',
      'municipality_614',
      'municipality_698',
    ],
    parent: 'county_19',
    order: 20140,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Kemijärvi'));
  },
});
_.defaults(
  Municipality320Model.prototype.defaults,
  MunicipalityModel.prototype.defaults
);

export default Municipality320Model;
