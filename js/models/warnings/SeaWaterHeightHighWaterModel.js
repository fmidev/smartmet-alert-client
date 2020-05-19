import WarningModel from 'models/warnings/WarningModel';

const SeaWaterHeightHighWaterModel = WarningModel.extend({
  defaults: {
    regionType: 'sea',
    priority: 14,
  },
  validation: {},
  initialize(...args) {
    WarningModel.prototype.initialize.apply(this, args);
    this.set('name', __('seaWaterHeightHighWater'));
    this.set('description', {
      level2: __('seaWaterHeightHighWaterDescriptionLevel2'),
      level3: __('seaWaterHeightHighWaterDescriptionLevel3'),
      level4: __('seaWaterHeightHighWaterDescriptionLevel4'),
    });
  },
  getAspectRatio() {
    return 23/22;
  },
  getSymbol(size) {
    return '<svg width="' + this.getAspectRatio() * size + 'px" height="' + size + 'px" viewBox="0 0 23 22" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 3.7.1 (28215) - http://www.bohemiancoding.com/sketch --> <title>highsealevel-symbol-1</title> <desc>Created with Sketch.</desc> <defs> <polygon id="path-1" points="21.9141698 4.50783633 21.9141698 0.0397776943 5.15388638e-06 0.0397776943 5.15388638e-06 4.50783633 21.9141698 4.50783633"></polygon> <polygon id="path-3" points="21.9141698 4.48308221 21.9141698 0.0150235785 5.15388638e-06 0.0150235785 5.15388638e-06 4.48308221 21.9141698 4.48308221"></polygon> <polygon id="path-5" points="10.9570875 4.48388106 21.9141698 4.48388106 21.9141698 0.0158224309 5.15388638e-06 0.0158224309 5.15388638e-06 4.48388106 10.9570875 4.48388106"></polygon> </defs> <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Symbols" transform="translate(-305.000000, -349.000000)"> <g id="highsealevel-symbol-1" transform="translate(297.000000, 341.000000)"> <rect id="icon-bg" fill-opacity="0" fill="#E8E8E8" x="0" y="0" width="38" height="38" rx="100"></rect> <g id="icon-varoitus-korkeasta-merivedenkorkeudesta" transform="translate(8.444444, 8.444444)"> <g id="fill-4" transform="translate(0.000000, 12.803130)"> <mask id="mask-2" fill="white"> <use xlink:href="#path-1"></use> </mask> <g id="fill"></g> <path d="M16.4354393,4.50783633 C14.7308429,4.50783633 13.8443745,3.56225281 13.1320559,2.80251844 C12.4948294,2.12282391 11.9915008,1.58594358 10.9567551,1.58594358 C9.9221124,1.58594358 9.41873233,2.12282391 8.78155737,2.80251844 C8.06929029,3.56225281 7.18287339,4.50783633 5.47827704,4.50783633 C3.77378377,4.50783633 2.88736686,3.56225281 2.17515132,2.80251844 C1.53792482,2.12282391 1.03464782,1.58594358 5.15388638e-06,1.58594358 L5.15388638e-06,0.0397776943 C1.70449842,0.0397776943 2.59091533,0.985309671 3.30313087,1.74509559 C3.94035737,2.42479011 4.44363437,2.96167044 5.47827704,2.96167044 C6.51297125,2.96167044 7.01629978,2.42479011 7.65352628,1.74509559 C8.36579336,0.985309671 9.25221027,0.0397776943 10.9567551,0.0397776943 C12.6612999,0.0397776943 13.5478199,0.985258132 14.2600869,1.74504405 C14.8973134,2.42479011 15.4006935,2.96167044 16.4354393,2.96167044 C17.470185,2.96167044 17.9735651,2.42479011 18.6107916,1.74509559 C19.3231102,0.985258132 20.2095787,0.0397776943 21.914175,0.0397776943 L21.914175,1.58594358 C20.8794293,1.58594358 20.3760492,2.12282391 19.7388227,2.80251844 C19.0264525,3.56230435 18.1400356,4.50783633 16.4354393,4.50783633" id="fill" fill="#221F20" mask="url(#mask-2)"></path> </g> <g id="fill-3" transform="translate(0.000000, 9.143870)"> <mask id="mask-4" fill="white"> <use xlink:href="#path-3"></use> </mask> <g id="fill"></g> <path d="M16.4354393,4.48308221 C14.7308429,4.48308221 13.8443745,3.5374987 13.1320559,2.77776432 C12.4948294,2.0980698 11.9915008,1.56118946 10.9567551,1.56118946 C9.9221124,1.56118946 9.41873233,2.0980698 8.78155737,2.77776432 C8.06929029,3.5374987 7.18287339,4.48308221 5.47827704,4.48308221 C3.77378377,4.48308221 2.88736686,3.5374987 2.17515132,2.77776432 C1.53792482,2.0980698 1.03464782,1.56118946 5.15388638e-06,1.56118946 L5.15388638e-06,0.0150235785 C1.70449842,0.0150235785 2.59091533,0.960555556 3.30313087,1.72034147 C3.94035737,2.40003599 4.44363437,2.93691633 5.47827704,2.93691633 C6.51297125,2.93691633 7.01629978,2.40003599 7.65352628,1.72034147 C8.36579336,0.960555556 9.25221027,0.0150235785 10.9567551,0.0150235785 C12.6612999,0.0150235785 13.5478199,0.960504017 14.2600869,1.72028993 C14.8973134,2.40003599 15.4006935,2.93691633 16.4354393,2.93691633 C17.470185,2.93691633 17.9735651,2.40003599 18.6107916,1.72034147 C19.3231102,0.960504017 20.2095787,0.0150235785 21.914175,0.0150235785 L21.914175,1.56118946 C20.8794293,1.56118946 20.3760492,2.0980698 19.7388227,2.77776432 C19.0264525,3.53755023 18.1400356,4.48308221 16.4354393,4.48308221" id="fill" fill="#221F20" mask="url(#mask-4)"></path> </g> <g id="fill-2" transform="translate(0.000000, 16.359311)"> <mask id="mask-6" fill="white"> <use xlink:href="#path-5"></use> </mask> <g id="fill"></g> <path d="M16.4354393,4.48388106 C14.7308429,4.48388106 13.8443745,3.53829755 13.1320559,2.77856317 C12.4948294,2.09886865 11.9915008,1.56198832 10.9567551,1.56198832 C9.9221124,1.56198832 9.41873233,2.09886865 8.78155737,2.77856317 C8.06929029,3.53829755 7.18287339,4.48388106 5.47827704,4.48388106 C3.77378377,4.48388106 2.88736686,3.53829755 2.17515132,2.77856317 C1.53792482,2.09886865 1.03464782,1.56198832 5.15388638e-06,1.56198832 L5.15388638e-06,0.0158224309 C1.70449842,0.0158224309 2.59091533,0.961354408 3.30313087,1.72114032 C3.94035737,2.40083485 4.44363437,2.93771518 5.47827704,2.93771518 C6.51297125,2.93771518 7.01629978,2.40083485 7.65352628,1.72114032 C8.36579336,0.961354408 9.25221027,0.0158224309 10.9567551,0.0158224309 C12.6612999,0.0158224309 13.5478199,0.961302869 14.2600869,1.72108878 C14.8973134,2.40083485 15.4006935,2.93771518 16.4354393,2.93771518 C17.470185,2.93771518 17.9735651,2.40083485 18.6107916,1.72114032 C19.3231102,0.961302869 20.2095787,0.0158224309 21.914175,0.0158224309 L21.914175,1.56198832 C20.8794293,1.56198832 20.3760492,2.09886865 19.7388227,2.77856317 C19.0264525,3.53834909 18.1400356,4.48388106 16.4354393,4.48388106" id="fill" fill="#221F20" mask="url(#mask-6)"></path> </g> <polygon id="fill-1" fill="#221F20" points="14.1920453 4.84347802 14.1920453 8.61060812 18.4973442 8.61060812 18.4973442 4.84347802 20.6499679 4.84347802 16.344669 1.03077728e-05 12.0393701 4.84347802"></polygon> </g> </g> </g> </g> </svg>';
  },
});
_.defaults(
  SeaWaterHeightHighWaterModel.prototype.defaults,
  WarningModel.prototype.defaults
);

export default SeaWaterHeightHighWaterModel;
