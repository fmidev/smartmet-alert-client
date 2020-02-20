import WarningModel from 'models/warnings/WarningModel';

const ThunderStormModel = WarningModel.extend({
  defaults: {
    regionType: 'land',
    priority: 1,
  },
  validation: {},
  initialize(...args) {
    WarningModel.prototype.initialize.apply(this, args);
    this.set('name', __('thunderStorm'));
    this.set('description', {
      level2: __('thunderStormDescriptionLevel2'),
      level3: __('thunderStormDescriptionLevel3'),
      level4: __('thunderStormDescriptionLevel4'),
    });
  },
  getSymbol() {
    return '<svg width="24px" height="24px" viewBox="0 0 12 22" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 3.7.1 (28215) - http://www.bohemiancoding.com/sketch --> <title>thunder-symbol-1</title> <desc>Created with Sketch.</desc> <defs></defs> <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Symbols" transform="translate(-861.000000, -299.000000)"> <g id="thunder-symbol-1" transform="translate(847.750000, 289.000000)"> <rect id="icon-bg" fill-opacity="0" fill="#E8E8E8" x="0" y="0" width="38" height="38" rx="100"></rect> <polygon id="fill-1" fill="#221F20" points="16.2457272 10.1333333 13.5111111 19.6392257 18.3008545 19.6392257 15.5930869 31.2444444 24.7916015 16.1625097 19.814025 16.1625097 22.5261967 10.1333333"></polygon> </g> </g> </g> </svg>';
  },
});
_.defaults(
  ThunderStormModel.prototype.defaults,
  WarningModel.prototype.defaults
);

export default ThunderStormModel;
