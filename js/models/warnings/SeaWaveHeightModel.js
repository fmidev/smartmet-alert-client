import WarningModel from 'models/warnings/WarningModel';

const SeaWaveHeightModel = WarningModel.extend({
  defaults: {
    regionType: 'sea',
    priority: 16,
  },
  validation: {},
  initialize(...args) {
    WarningModel.prototype.initialize.apply(this, args);
    this.set('name', __('seaWaveHeight'));
    this.set('description', {
      level2: __('seaWaveHeightDescriptionLevel2'),
      level3: __('seaWaveHeightDescriptionLevel3'),
      level4: __('seaWaveHeightDescriptionLevel4'),
    });
  },
  getAspectRatio() {
    return 19/18;
  },
  getSymbol(size) {
    return '<svg width="' + this.getAspectRatio() * size + 'px" height="' + size + 'px" viewBox="0 0 19 18" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 3.7.1 (28215) - http://www.bohemiancoding.com/sketch --> <title>waveheight-symbol-1</title> <desc>Created with Sketch.</desc> <defs> <polygon id="path-1" points="9.27692134 16.8837555 18.5538356 16.8837555 18.5538356 0.0260879433 9.27692134 0.0260879433 7.07775826e-06 0.0260879433 7.07775826e-06 16.8837555"></polygon> </defs> <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Symbols" transform="translate(-308.000000, -455.000000)"> <g id="waveheight-symbol-1" transform="translate(297.000000, 445.000000)"> <rect id="icon-bg" fill-opacity="0" fill="#E8E8E8" x="0" y="0" width="38" height="38" rx="100"></rect> <g id="fill-2" transform="translate(10.977778, 10.163713)"> <mask id="mask-2" fill="white"> <use xlink:href="#path-1"></use> </mask> <g id="fill"></g> <path d="M9.68429628,7.1873413 C9.68429628,5.58451388 10.9836114,4.28519878 12.5864388,4.28519878 C13.2691862,4.28519878 13.9553782,4.55116028 14.4510491,4.94575454 C14.4463059,4.94332644 14.4419014,4.94106775 14.4515009,4.94609335 C14.4613262,4.95111895 14.4564135,4.94852145 14.4514444,4.94598041 C13.83962,2.11877015 11.3658393,0.0260879433 8.35550519,0.0260879433 C7.24490418,0.0260879433 6.20189466,0.314805809 5.29672208,0.820640865 C-0.989229963,3.76439986 0.0573934752,15.1397595 0.0763665248,16.8837555 L18.5538582,16.8837555 C15.7054162,14.7519414 9.68429628,10.5359716 9.68429628,7.1873413" id="fill" fill="#221F20" mask="url(#mask-2)"></path> </g> <path d="M25.1761522,18.2911461 C26.2413534,17.6778536 25.5488936,15.686361 25.5358496,15.6155509 C25.0391623,15.3225415 24.439309,15.1380624 23.8413191,15.1380624 C22.8125958,15.1380624 21.897372,15.6214799 21.3084734,16.3728918 C22.7123097,17.4348743 24.5487993,18.6523681 25.1761522,18.2911461" id="fill-1" fill="#221F20"></path> </g> </g> </g> </svg>';
  },
});
_.defaults(
  SeaWaveHeightModel.prototype.defaults,
  WarningModel.prototype.defaults
);

export default SeaWaveHeightModel;
