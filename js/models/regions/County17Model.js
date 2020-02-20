import RegionModel from 'models/regions/RegionModel';
import CountyModel from 'models/regions/CountyModel';

const County17Model = CountyModel.extend({
  defaults: {
    virtual: true,
    infoAvailable: false,
    neighbours: [],
    children: [
      'municipality_305', // Kuusamo
      'municipality_615', // Pudasjärvi
      'municipality_832', // Taivalkoski
      'municipality_139_208_244_317_425_436_483_494_535_563_564_625_626_630_678_69_691_71_72_746_748_785_791_859_889_9_977',
    ],
    order: 10170,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Pohjois-Pohjanmaa'));
  },
});
_.defaults(County17Model.prototype.defaults, CountyModel.prototype.defaults);

export default County17Model;
