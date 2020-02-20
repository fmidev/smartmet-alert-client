import RegionModel from 'models/regions/MunicipalityModel';
import MunicipalityModel from 'models/regions/MunicipalityModel';

const Municipality261Model = MunicipalityModel.extend({
  defaults: {
    neighbours: [
      'municipality_148',
      'municipality_758',
      'municipality_698',
      'municipality_273',
      'municipality_498',
      'municipality_47',
    ],
    parent: 'county_19',
    order: 20180,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Kittilä'));
  },
});
_.defaults(
  Municipality261Model.prototype.defaults,
  MunicipalityModel.prototype.defaults
);

export default Municipality261Model;
