import WarningModel from 'models/warnings/WarningModel';

const RainModel = WarningModel.extend({
  defaults: {
    regionType: 'land',
    priority: 3,
  },
  validation: {},
  initialize(...args) {
    WarningModel.prototype.initialize.apply(this, args);
    this.set('name', __('rain'));
    this.set('description', {
      level2: __('rainDescriptionLevel2'),
      level3: __('rainDescriptionLevel3'),
      level4: __('rainDescriptionLevel4'),
    });
  },
  getAspectRatio() {
    return 18/17;
  },
  getSymbol(size) {
    return '<svg width="' + this.getAspectRatio() * size + 'px" height="' + size + 'px" viewBox="0 0 18 17" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 3.7.1 (28215) - http://www.bohemiancoding.com/sketch --> <title>rain-symbol-1</title> <desc>Created with Sketch.</desc> <defs> <polygon id="path-1" points="9.6929176 9.72534332 0 9.72534332 0 0.0324257179 9.6929176 0.0324257179 9.6929176 9.72534332"></polygon> </defs> <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Symbols" transform="translate(-858.000000, -403.000000)"> <g id="rain-symbol-1" transform="translate(847.750000, 393.000000)"> <rect id="icon-bg" fill-opacity="0" fill="#E8E8E8" x="0" y="0" width="38" height="38" rx="100"></rect> <g id="fill-3" transform="translate(10.977778, 17.233119)"> <mask id="mask-2" fill="white"> <use xlink:href="#path-1"></use> </mask> <g id="Clip-2"></g> <path d="M9.6929176,0.0324257179 C9.6929176,0.0324257179 7.06650562,7.14905243 5.42021848,8.79538702 C4.18026092,10.0353446 2.16991386,10.0353446 0.929956305,8.79538702 C-0.310001248,7.55542946 -0.310001248,5.5450824 0.929956305,4.30512484 C2.57629089,2.6588377 9.6929176,0.0324257179 9.6929176,0.0324257179" id="Fill-1" fill="#221F20" mask="url(#mask-2)"></path> </g> <path d="M27.8436816,18.7404567 C27.8436816,18.7404567 25.8395968,24.1708986 24.583367,25.4271283 C23.6372097,26.3732382 22.1031673,26.3732382 21.15701,25.4271283 C20.2109001,24.480971 20.2109001,22.9469286 21.15701,22.0007713 C22.4132397,20.7445416 27.8436816,18.7404567 27.8436816,18.7404567" id="fill-2" fill="#221F20"></path> <path d="M19.260236,10.1333571 C19.260236,10.1333571 17.2561511,15.563799 15.9999213,16.8200287 C15.053764,17.7661386 13.5197216,17.7661386 12.5735643,16.8200287 C11.6274544,15.8738714 11.6274544,14.339829 12.5735643,13.3936717 C13.829794,12.1374419 19.260236,10.1333571 19.260236,10.1333571" id="fill-1" fill="#221F20"></path> </g> </g> </g> </svg>';
  },
});
_.defaults(RainModel.prototype.defaults, WarningModel.prototype.defaults);

export default RainModel;
