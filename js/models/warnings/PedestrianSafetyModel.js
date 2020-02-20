import WarningModel from 'models/warnings/WarningModel';

const PedestrianSafetyModel = WarningModel.extend({
  defaults: {
    regionType: 'land',
    priority: 5,
  },
  validation: {},
  initialize(...args) {
    WarningModel.prototype.initialize.apply(this, args);
    this.set('name', __('pedestrianSafety'));
    this.set('description', {
      level2: __('pedestrianSafetyDescriptionLevel2'),
      level3: __('pedestrianSafetyDescriptionLevel3'),
      level4: __('pedestrianSafetyDescriptionLevel4'),
    });
  },
  getSymbol() {
    return '<svg width="24px" height="24px" viewBox="0 0 20 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 3.7.1 (28215) - http://www.bohemiancoding.com/sketch --> <title>pedestrian-symbol-1</title> <desc>Created with Sketch.</desc> <defs></defs> <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Symbols" transform="translate(-857.000000, -505.000000)"> <g id="pedestrian-symbol-1" transform="translate(847.750000, 497.000000)"> <rect id="icon-bg" fill-opacity="0" fill="#E8E8E8" x="0" y="0" width="38" height="38" rx="100"></rect> <polygon id="fill-3" fill="#221F20" points="10.1333333 28.7823253 28.7029683 28.7823253 28.7029683 26.9156198 10.1333333 26.9156198"></polygon> <polygon id="fill-2" fill="#221F20" points="17.7602168 8.54884928 17.212293 13.200306 18.9329089 13.8360437 16.9093787 15.1362041 13.462839 14.2454745 10.8030803 19.5787143 11.8224454 20.1085475 14.5542232 16.6858186 16.4373946 17.7587387 14.0666771 20.2827734 16.1396073 25.185862 17.0890041 24.8402104 16.0764549 21.1000793 22.8892517 15.7857554 24.3157597 16.7503443 23.2418073 20.182158 24.0567565 20.5347786 26.1686517 16.3704076 22.3281787 12.6851576 18.8623978 11.9061191 18.8669819 8.44443822"></polygon> <path d="M22.3791349,11.9361793 C23.3095317,12.0035052 24.1166397,11.2800323 24.1819635,10.3202968 C24.247227,9.36049906 23.5459159,8.52782396 22.615519,8.46049811 C21.6851825,8.39317227 20.8780143,9.11658287 20.8127508,10.0763806 C20.747427,11.0361784 21.4487381,11.8688535 22.3791349,11.9361793" id="fill-1" fill="#221F20"></path> </g> </g> </g> </svg>';
  },
});
_.defaults(
  PedestrianSafetyModel.prototype.defaults,
  WarningModel.prototype.defaults
);

export default PedestrianSafetyModel;
