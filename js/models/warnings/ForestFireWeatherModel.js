import WarningModel from 'models/warnings/WarningModel';

const ForestFireWeatherModel = WarningModel.extend({
  defaults: {
    regionType: 'land',
    priority: 6,
  },
  validation: {},
  initialize(...args) {
    WarningModel.prototype.initialize.apply(this, args);
    this.set('name', __('forestFireWeather'));
    this.set('description', {
      level2: __('forestFireWeatherDescriptionLevel2'),
      level3: __('forestFireWeatherDescriptionLevel3'),
      level4: __('forestFireWeatherDescriptionLevel4'),
    });
  },
  getSymbol(size) {
    return '<svg width="' + size + 'px" height="' + size + 'px" viewBox="0 0 17 22" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 3.7.1 (28215) - http://www.bohemiancoding.com/sketch --> <title>forestfire-symbol-1</title> <desc>Created with Sketch.</desc> <defs></defs> <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Symbols" transform="translate(-583.000000, -453.000000)"> <g id="forestfire-symbol-1" transform="translate(573.000000, 445.000000)"> <rect id="icon-bg" fill-opacity="0" fill="#E8E8E8" x="0" y="0" width="38" height="38" rx="100"></rect> <path d="M22.0016813,16.0214868 L23.30775,16.0214868 L19.9997421,9.40547101 L17.7864237,13.8321078 C17.9589906,14.2241016 18.1061411,14.6440585 18.2223232,15.0852553 C18.5472869,16.3193023 18.6054034,17.5711764 18.3860784,18.6103471 C18.182696,19.5738287 17.6992234,20.4927933 16.9491074,21.3417227 C16.3155301,22.0586802 15.5120855,22.6945495 14.6256681,23.1805179 L14.4765312,23.2622173 L12.9869446,26.3253309 L18.9587887,26.3253309 L18.9587887,29.2535184 L19.9997421,29.2535184 L21.0407464,29.2535184 L21.0407464,26.3253309 L27.0125905,26.3253309 L22.0016813,16.0214868 Z" id="fill-2" fill="#221F20"></path> <path d="M15.7193339,12.6040711 C15.8899143,13.711698 16.1686802,15.6823124 15.4271212,16.476436 C14.2035159,14.9510422 15.1132104,13.5838009 15.2900049,12.3620801 C15.4945588,10.9488956 15.0258573,9.39329761 13.7824893,8.44448519 C14.0111863,9.86031828 13.4222278,10.9810355 12.6174589,12.0756231 C11.7201415,13.2960705 10.9819442,14.5362297 10.9778185,16.1008941 C10.9731325,17.8647643 11.7384271,19.6208924 12.8253745,21.0608685 C13.1050572,20.4372745 13.3771506,19.6317924 13.3350785,18.9213546 C14.3635019,20.3800238 14.0989469,22.0055043 14.0240728,22.3618438 C15.5175304,21.5431187 16.9590855,20.1264197 17.3198054,18.4175081 C17.7020197,16.6066761 17.0628396,13.9140618 15.7193339,12.6040711" id="fill-1" fill="#221F20"></path> </g> </g> </g> </svg>';
  },
});
_.defaults(
  ForestFireWeatherModel.prototype.defaults,
  WarningModel.prototype.defaults
);

export default ForestFireWeatherModel;
