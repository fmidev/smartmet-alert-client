import WarningModel from 'models/warnings/WarningModel';

const SeaWarningModel = WarningModel.extend({
  defaults: {
    regionType: 'sea',
  },
  validation: {
    regionType: {
      value: 'sea',
    },
  },
});

export default SeaWarningModel;
