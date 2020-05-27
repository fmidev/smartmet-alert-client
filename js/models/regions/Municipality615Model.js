import RegionModel from 'models/regions/MunicipalityModel';
import MunicipalityModel from 'models/regions/MunicipalityModel';

const Municipality615Model = MunicipalityModel.extend({
  defaults: {
    neighbours: [
      'municipality_832',
      'municipality_139_208_244_317_425_436_483_494_535_563_564_625_626_630_678_69_691_71_72_746_748_785_791_859_889_9_977',
    ],
    parent: 'county_17',
    order: 20010,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Pudasjärvi'));
  },
});
_.defaults(
  Municipality615Model.prototype.defaults,
  MunicipalityModel.prototype.defaults
);

export default Municipality615Model;
