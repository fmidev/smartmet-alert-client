import WarningModel from 'models/warnings/WarningModel';

const GrassFireWeatherModel = WarningModel.extend({
  defaults: {
    regionType: 'land',
    priority: 7,
  },
  validation: {},
  initialize(...args) {
    WarningModel.prototype.initialize.apply(this, args);
    this.set('name', __('grassFireWeather'));
    this.set('description', {
      level2: __('grassFireWeatherDescriptionLevel2'),
      level3: __('grassFireWeatherDescriptionLevel3'),
      level4: __('grassFireWeatherDescriptionLevel4'),
    });
  },
  getAspectRatio() {
    return 18/22;
  },
  getSymbol(size) {
    return '<svg width="' + this.getAspectRatio() * size + 'px" height="' + size + 'px" viewBox="0 0 18 22" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 3.7.1 (28215) - http://www.bohemiancoding.com/sketch --> <title>grassfire-symbol-1</title> <desc>Created with Sketch.</desc> <defs></defs> <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Symbols" transform="translate(-1133.000000, -504.000000)"> <g id="grassfire-symbol-1" transform="translate(1123.000000, 497.000000)"> <rect id="icon-bg" fill-opacity="0" fill="#E8E8E8" x="0" y="0" width="38" height="38" rx="100"></rect> <polygon id="fill-2" fill="#221F20" points="10.9777778 28.3984473 27.8592641 28.3984473 27.8592641 26.7534257 10.9777778 26.7534257"></polygon> <path d="M24.4181968,17.520462 C24.788546,19.3327276 22.9168404,21.7413134 22.2493455,20.4766756 C21.92237,19.8571056 22.4555763,18.8569325 22.6410251,18.2693307 C22.9491925,17.2928459 23.1907913,16.2603206 23.1507076,15.2293307 C23.0287567,12.0899166 20.4292387,7.57016479 16.3441016,7.60015902 C18.6197149,10.3418618 12.8735994,12.8881359 14.0169443,18.8801821 C12.9992242,18.7040551 12.2623094,16.7711547 12.2623094,16.7711547 C12.2623094,16.7711547 9.87368312,25.4147016 17.0432358,25.4147016 C15.2656802,24.2971287 13.9621651,22.6562745 13.908976,20.7726698 C13.908976,20.7726698 15.4667567,22.062641 16.8475879,22.003804 C15.8107307,19.3079426 17.6801882,16.4897463 20.0069068,15.491931 C19.2368722,17.0951691 18.4269732,19.0994635 18.6661593,20.9069584 C19.0368924,23.7089786 22.1681911,23.5387737 24.1817524,21.784413 C24.1817524,22.9768892 22.5403498,24.4616309 21.5167625,25.4147016 C28.3893339,24.1143668 25.9141247,18.1740291 24.4181968,17.520462" id="fill-1" fill="#221F20"></path> </g> </g> </g> </svg>';
  },
});
_.defaults(
  GrassFireWeatherModel.prototype.defaults,
  WarningModel.prototype.defaults
);

export default GrassFireWeatherModel;
