import RegionModel from 'models/regions/RegionModel';
import CountyModel from 'models/regions/CountyModel';

const Municipality139_208_244_317_425_436_483_494_535_563_564_625_626_630_678_69_691_71_72_746_748_785_791_859_889_9_977Model = CountyModel.extend(
  {
    defaults: {
      neighbours: [],
      parent: 'county_17',
      order: 19000,
    },
    initialize() {
      RegionModel.prototype.initialize.call(this);
      this.set('name', __('Pohjois-Pohjanmaan länsiosa'));
    },
  }
);
_.defaults(
  Municipality139_208_244_317_425_436_483_494_535_563_564_625_626_630_678_69_691_71_72_746_748_785_791_859_889_9_977Model
    .prototype.defaults,
  CountyModel.prototype.defaults
);

export default Municipality139_208_244_317_425_436_483_494_535_563_564_625_626_630_678_69_691_71_72_746_748_785_791_859_889_9_977Model;
