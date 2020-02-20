import WarningModel from 'models/warnings/WarningModel';

const LandWarningModel = WarningModel.extend({
  defaults: {
    regionType: 'land',
  },
  validation: {
    regionType: {
      value: 'land',
    },
  },
});

export default LandWarningModel;
