import WarningModel from 'models/warnings/WarningModel';

const UvNoteModel = WarningModel.extend({
  defaults: {
    regionType: 'land',
    priority: 10,
  },
  validation: {},
  initialize(...args) {
    WarningModel.prototype.initialize.apply(this, args);
    this.set('name', __('uvNote'));
    this.set('description', {
      level2: __('uvNoteDescriptionLevel2'),
      level3: __('uvNoteDescriptionLevel3'),
      level4: __('uvNoteDescriptionLevel4'),
    });
  },
  getSymbol(size) {
    return '<svg width="' + size + 'px" height="' + size + 'px" viewBox="0 0 21 12" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 3.7.1 (28215) - http://www.bohemiancoding.com/sketch --> <title>ultraviolet-symbol-1</title> <desc>Created with Sketch.</desc> <defs> <polygon id="path-1" points="8.83609467 11.1471698 0 11.1471698 0 5.58043434 0 0.0136988679 8.83609467 0.0136988679"></polygon> <polygon id="path-3" points="10.3481814 10.9604891 10.3481814 0.0137041509 0.0306107317 0.0137041509 0.0306107317 10.9604891 10.3481814 10.9604891"></polygon> </defs> <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Symbols" transform="translate(-582.000000, -406.000000)"> <g id="ultraviolet-symbol-1" transform="translate(572.500000, 393.000000)"> <rect id="icon-bg" fill-opacity="0" fill="#E8E8E8" x="0" y="0" width="38" height="38" rx="100"></rect> <g id="fill-2" transform="translate(10.133333, 13.550258)"> <mask id="mask-2" fill="white"> <use xlink:href="#path-1"></use> </mask> <g id="Clip-2"></g> <path d="M0,0.0136988679 L2.23735357,0.0136988679 L2.23735357,5.94256679 C2.23735357,6.88347245 2.26500163,7.49329132 2.32051165,7.7720234 C2.41618356,8.22007623 2.64421319,8.57979698 3.00454706,8.85102717 C3.36477398,9.12236302 3.8574121,9.25797811 4.48230099,9.25797811 C5.11719024,9.25797811 5.59587064,9.12986491 5.91844914,8.87342717 C6.24086721,8.61709509 6.43488491,8.30217434 6.50044878,7.9288234 C6.56590569,7.55547245 6.59868762,6.93572151 6.59868762,6.06951774 L6.59868762,0.0136988679 L8.83609467,0.0136988679 L8.83609467,5.76336679 C8.83609467,7.07757057 8.7756112,8.00606113 8.65464426,8.54862717 C8.5337308,9.09129887 8.31072809,9.54923094 7.98574309,9.92258189 C7.66070461,10.2959328 7.22608997,10.5934196 6.68184571,10.8148838 C6.13765492,11.0362951 5.42709449,11.1471857 4.55032484,11.1471857 C3.49210479,11.1471857 2.68956242,11.0264158 2.14285818,10.7850347 C1.59604697,10.5436536 1.16405276,10.2300008 0.846554652,9.84418189 C0.529110027,9.45841585 0.319958085,9.05394792 0.219205781,8.63077811 C0.07299729,8.00352528 0,7.07757057 0,5.85296679 L0,0.0136988679 Z" id="Fill-1" fill="#221F20" mask="url(#mask-2)"></path> </g> <g id="fill-1" transform="translate(19.491960, 13.550258)"> <mask id="mask-4" fill="white"> <use xlink:href="#path-3"></use> </mask> <g id="Clip-5"></g> <polygon id="Fill-4" fill="#221F20" mask="url(#mask-4)" points="3.99134208 10.9604891 0.0306107317 0.0137041509 2.45695509 0.0137041509 5.26117406 8.11553057 7.97474804 0.0137041509 10.3482028 0.0137041509 6.37987758 10.9604891"></polygon> </g> </g> </g> </g> </svg>';
  },
});
_.defaults(UvNoteModel.prototype.defaults, WarningModel.prototype.defaults);

export default UvNoteModel;
