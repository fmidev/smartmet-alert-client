import RegionModel from 'models/regions/MunicipalityModel';
import MunicipalityModel from 'models/regions/MunicipalityModel';

const Municipality851Model = MunicipalityModel.extend({
  defaults: {
    neighbours: ['municipality_976', 'municipality_845', 'municipality_241'],
    parent: 'county_19',
    order: 20090,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Tornio'));
  },
});
_.defaults(
  Municipality851Model.prototype.defaults,
  MunicipalityModel.prototype.defaults
);

export default Municipality851Model;
