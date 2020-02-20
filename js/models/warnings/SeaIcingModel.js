import WarningModel from 'models/warnings/WarningModel';

const SeaIcingModel = WarningModel.extend({
  defaults: {
    regionType: 'sea',
    priority: 17,
  },
  validation: {},
  initialize(...args) {
    WarningModel.prototype.initialize.apply(this, args);
    this.set('name', __('seaIcing'));
    this.set('description', {
      level2: __('seaIcingDescriptionLevel2'),
      level3: __('seaIcingDescriptionLevel3'),
      level4: __('seaIcingDescriptionLevel4'),
    });
  },
  getSymbol() {
    return '<svg width="24px" height="24px" viewBox="0 0 19 17" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 3.7.1 (28215) - http://www.bohemiancoding.com/sketch --> <title>icing-symbol-1</title> <desc>Created with Sketch.</desc> <defs></defs> <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Symbols" transform="translate(-307.000000, -509.000000)"> <g id="icing-symbol-1" transform="translate(297.000000, 497.000000)"> <rect id="icon-bg" fill-opacity="0" fill="#E8E8E8" x="0" y="0" width="38" height="38" rx="100"></rect> <polygon id="fill-2" fill="#221F20" points="20.5886801 12.9777576 17.159897 21.5458388 19.7013269 28.9258988 22.9707137 18.3714051 24.3370614 22.5466725 28.6861243 12.9777576"></polygon> <polygon id="fill-1" fill="#221F20" points="10.1333333 12.9777576 14.7433913 24.8742315 19.5040853 12.9777576"></polygon> </g> </g> </g> </svg>';
  },
});
_.defaults(SeaIcingModel.prototype.defaults, WarningModel.prototype.defaults);

export default SeaIcingModel;
