import WarningModel from 'models/warnings/WarningModel';

const SeaThunderStormModel = WarningModel.extend({
  defaults: {
    regionType: 'sea',
    priority: 13,
  },
  validation: {},
  initialize(...args) {
    WarningModel.prototype.initialize.apply(this, args);
    this.set('name', __('seaThunderStorm'));
    this.set('description', {
      level2: __('seaThunderStormDescriptionLevel2'),
      level3: __('seaThunderStormDescriptionLevel3'),
      level4: __('seaThunderStormDescriptionLevel4'),
    });
  },
  handleProperties(properties) {},
  getAspectRatio() {
    return 12/22;
  },
  getSymbol(size) {
    return '<svg width="' + this.getAspectRatio() * size + 'px" height="' + size + 'px" viewBox="0 0 12 22" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 3.7.1 (28215) - http://www.bohemiancoding.com/sketch --> <title>seathunder-symbol-1</title> <desc>Created with Sketch.</desc> <defs></defs> <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Symbols" transform="translate(-311.000000, -299.000000)"> <g id="seathunder-symbol-1" transform="translate(297.250000, 289.000000)"> <rect id="icon-bg" fill-opacity="0" fill="#E8E8E8" x="0" y="0" width="38" height="38" rx="100"></rect> <polygon id="fill-1" fill="#221F20" points="17.0901717 10.1333333 14.3555556 19.6392257 19.145299 19.6392257 16.4375313 31.2444444 25.636046 16.1625097 20.6584695 16.1625097 23.3706411 10.1333333"></polygon> </g> </g> </g> </svg>';
  },
});
_.defaults(
  SeaThunderStormModel.prototype.defaults,
  WarningModel.prototype.defaults
);

export default SeaThunderStormModel;
