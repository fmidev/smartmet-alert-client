import WarningModel from 'models/warnings/WarningModel';

const FloodLevelModel = WarningModel.extend({
  defaults: {
    regionType: 'land',
    priority: 11,
    severity: 0,
    link: __('floodLink'),
    linkText: __('floodLinkText'),
  },
  validation: {},

  initialize(...args) {
    WarningModel.prototype.initialize.apply(this, args);
    switch (this.get('rawSeverity').toLowerCase()) {
      case 'minor':
        this.set('severity', 1);
        break;
      case 'moderate':
        this.set('severity', 2);
        break;
      case 'severe':
        this.set('severity', 3);
        break;
      case 'extreme':
        this.set('severity', 4);
        break;
    }
    this.set('name', __('floodLevel'));
    this.set('description', {
      level2: __('floodLevelDescriptionLevel2'),
      level3: __('floodLevelDescriptionLevel3'),
      level4: __('floodLevelDescriptionLevel4'),
    });
  },
  getExtension() {
    return `-${this.get('severity').toString()}`;
  },
  getSymbol() {
    switch (this.get('severity')) {
      case 2:
        return '<svg width="24px" height="24px" viewBox="0 0 22 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 3.7.1 (28215) - http://www.bohemiancoding.com/sketch --> <title>flood-level-1-symbol-1</title> <desc>Created with Sketch.</desc> <defs></defs> <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Symbols" transform="translate(-1131.000000, -402.000000)"> <g id="flood-level-1-symbol-1" transform="translate(1123.000000, 393.000000)"> <rect id="icon-bg" fill-opacity="0" fill="#E8E8E8" x="0" y="0" width="38" height="38" rx="100"></rect> <path d="M13.4208411,22.8723364 L24.3977103,22.8723364 L24.3977103,15.5907477 L27.6678972,15.5907477 L18.9095327,9 L10.1501402,15.5907477 L13.4203271,15.5907477 L13.4203271,22.8723364 L13.4208411,22.8723364 Z M20.4557009,18.871729 L17.3099065,18.871729 L17.3099065,15.7259346 L20.4557009,15.7259346 L20.4557009,18.871729 L20.4557009,18.871729 Z" id="fill-2" fill="#231F20"></path> <path d="M29.2392523,25.4085047 L29.2392523,25.4085047 C27.6457944,25.4085047 26.8135981,26.2936449 26.1469159,27.0050467 C25.5501402,27.6414019 25.0792991,28.1441121 24.1103738,28.1441121 C23.1414486,28.1441121 22.6711215,27.6414019 22.0738318,27.0050467 C21.4056075,26.2936449 20.5770093,25.4085047 18.9814953,25.4085047 C17.3859813,25.4085047 16.5558411,26.2926168 15.8891589,27.0019626 C15.2923832,27.6383178 14.8215421,28.141028 13.8526168,28.141028 C12.8836916,28.141028 12.4133645,27.6383178 11.8165888,27.0019626 C11.1499065,26.2926168 10.3197664,25.4085047 8.72425234,25.4085047 L8.72425234,25.4085047 C8.32425882,25.4085047 8,25.7327635 8,26.132757 C8,26.5327505 8.32425882,26.8570093 8.72425234,26.8570093 L8.7396729,26.8570093 C9.69780374,26.8621495 10.1671028,27.3628037 10.7607944,27.9955607 C11.4290187,28.7069626 12.2576168,29.5921028 13.8531308,29.5921028 C15.4486449,29.5921028 16.278785,28.7069626 16.9454673,27.9955607 C17.542243,27.3592056 18.0130841,26.8564953 18.9820093,26.8564953 C19.9509346,26.8564953 20.4212617,27.3592056 21.0185514,27.9955607 C21.6867757,28.7069626 22.5153738,29.5921028 24.1108879,29.5921028 C25.7064019,29.5921028 26.5365421,28.7069626 27.2032243,27.9955607 C27.7964019,27.3628037 28.2657009,26.8647196 29.2238318,26.8570093 L29.2387383,26.8570093 C29.6387318,26.8571513 29.9631057,26.5330075 29.9632477,26.133014 C29.9633896,25.7330205 29.6392459,25.4086466 29.2392523,25.4085047 L29.2392523,25.4085047 Z" id="fill-1" fill="#231F20"></path> </g> </g> </g> </svg>';
      case 3:
        return '<svg width="24px" height="24px" viewBox="0 0 22 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 3.7.1 (28215) - http://www.bohemiancoding.com/sketch --> <title>flood-level-2-symbol-1</title> <desc>Created with Sketch.</desc> <defs></defs> <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Symbols" transform="translate(-1131.000000, -350.000000)"> <g id="flood-level-2-symbol-1" transform="translate(1123.000000, 341.000000)"> <rect id="icon-bg" fill-opacity="0" fill="#E8E8E8" x="0" y="0" width="38" height="38" rx="100"></rect> <path d="M29.2392523,24.3804673 L29.2392523,24.3804673 C27.6457944,24.3804673 26.8135981,25.2656075 26.1469159,25.9770093 C25.5501402,26.6133645 25.0792991,27.1160748 24.1103738,27.1160748 C23.1414486,27.1160748 22.6711215,26.6133645 22.0738318,25.9770093 C21.4056075,25.2656075 20.5770093,24.3804673 18.9814953,24.3804673 C17.3859813,24.3804673 16.5558411,25.2645794 15.8891589,25.9739252 C15.2923832,26.6102804 14.8215421,27.1129907 13.8526168,27.1129907 C12.8836916,27.1129907 12.4133645,26.6102804 11.8165888,25.9739252 C11.1499065,25.2645794 10.3197664,24.3804673 8.72425234,24.3804673 L8.72425234,24.3804673 C8.32425882,24.3804673 8,24.7047261 8,25.1047196 C8,25.5047131 8.32425882,25.828972 8.72425234,25.828972 L8.7396729,25.828972 C9.69780374,25.8341121 10.1671028,26.3347664 10.7607944,26.9675234 C11.4290187,27.6789252 12.2576168,28.5640654 13.8531308,28.5640654 C15.4486449,28.5640654 16.278785,27.6789252 16.9454673,26.9675234 C17.542243,26.3311682 18.0130841,25.8284579 18.9820093,25.8284579 C19.9509346,25.8284579 20.4212617,26.3311682 21.0185514,26.9675234 C21.6867757,27.6789252 22.5153738,28.5640654 24.1108879,28.5640654 C25.7064019,28.5640654 26.5365421,27.6789252 27.2032243,26.9675234 C27.7964019,26.3347664 28.2657009,25.8366822 29.2238318,25.828972 L29.2387383,25.828972 C29.6387318,25.8291139 29.9631057,25.5049702 29.9632477,25.1049766 C29.9633896,24.7049831 29.6392459,24.3806092 29.2392523,24.3804673 L29.2392523,24.3804673 Z" id="fill-3" fill="#231F20"></path> <path d="M29.2392523,21.072757 L29.2392523,21.072757 C27.6457944,21.072757 26.8146262,21.9578972 26.1479439,22.6692991 C25.5511682,23.3056542 25.0803271,23.8083645 24.1114019,23.8083645 C23.1424766,23.8083645 22.6721495,23.3056542 22.0748598,22.6692991 C21.4066355,21.9578972 20.5780374,21.072757 18.9825234,21.072757 C17.3870093,21.072757 16.5568692,21.9578972 15.8901869,22.6692991 C15.2934112,23.3056542 14.8225701,23.8083645 13.8536449,23.8083645 C12.8847196,23.8083645 12.4143925,23.3056542 11.8176168,22.6692991 C11.1493925,21.9578972 10.3207944,21.072757 8.72528037,21.072757 C8.32528685,21.072757 8.00102804,21.3970158 8.00102804,21.7970093 C8.00102804,22.1970029 8.32528685,22.5212617 8.72528037,22.5212617 L8.73761682,22.5212617 C9.69780374,22.5258879 10.1676168,23.0265421 10.7613084,23.6598131 C11.4269626,24.3701869 12.2545327,25.2542991 13.8526168,25.2542991 C15.4507009,25.2542991 16.278271,24.3701869 16.9449533,23.6608411 C17.541729,23.024486 18.0125701,22.5217757 18.9814953,22.5217757 C19.9504206,22.5217757 20.4207477,23.024486 21.0180374,23.6608411 C21.6862617,24.372243 22.5148598,25.2573832 24.1103738,25.2573832 C25.7058879,25.2573832 26.536028,24.3701869 27.2027103,23.6608411 C27.7964019,23.0275701 28.266215,22.5269159 29.2258879,22.5222897 L29.2382243,22.5222897 C29.4971584,22.5224734 29.7365213,22.3845034 29.8661474,22.1603517 C29.9957735,21.9362 29.9959694,21.6599207 29.8666614,21.4355853 C29.7373534,21.21125 29.4981864,21.0729407 29.2392523,21.072757 L29.2392523,21.072757 Z" id="fill-2" fill="#231F20"></path> <path d="M27.6684112,15.5907477 L18.9095327,9 L10.1501402,15.5907477 L13.4203271,15.5907477 L13.4203271,24.5243925 L13.444486,24.5243925 C14.4766355,24.5243925 14.9783178,23.988785 15.6141589,23.3107944 C16.3245327,22.5531308 17.2076168,21.6099065 18.9085047,21.6099065 C20.6093925,21.6099065 21.4924766,22.5531308 22.2028505,23.3107944 C22.8386916,23.988785 23.3403738,24.5243925 24.3725234,24.5243925 L24.3971963,24.5243925 L24.3971963,15.5907477 L27.6673832,15.5907477 L27.6684112,15.5907477 Z M20.4557009,18.872243 L17.3099065,18.872243 L17.3099065,15.7264486 L20.4557009,15.7264486 L20.4557009,18.872243 L20.4557009,18.872243 Z" id="fill-1" fill="#231F20"></path> </g> </g> </g> </svg>';
      case 4:
        return '<svg width="24px" height="24px" viewBox="0 0 22 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 3.7.1 (28215) - http://www.bohemiancoding.com/sketch --> <title>flood-level-2-symbol-1</title> <desc>Created with Sketch.</desc> <defs></defs> <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Symbols" transform="translate(-1131.000000, -350.000000)"> <g id="flood-level-2-symbol-1" transform="translate(1123.000000, 341.000000)"> <rect id="icon-bg" fill-opacity="0" fill="#E8E8E8" x="0" y="0" width="38" height="38" rx="100"></rect> <path d="M29.2392523,24.3804673 L29.2392523,24.3804673 C27.6457944,24.3804673 26.8135981,25.2656075 26.1469159,25.9770093 C25.5501402,26.6133645 25.0792991,27.1160748 24.1103738,27.1160748 C23.1414486,27.1160748 22.6711215,26.6133645 22.0738318,25.9770093 C21.4056075,25.2656075 20.5770093,24.3804673 18.9814953,24.3804673 C17.3859813,24.3804673 16.5558411,25.2645794 15.8891589,25.9739252 C15.2923832,26.6102804 14.8215421,27.1129907 13.8526168,27.1129907 C12.8836916,27.1129907 12.4133645,26.6102804 11.8165888,25.9739252 C11.1499065,25.2645794 10.3197664,24.3804673 8.72425234,24.3804673 L8.72425234,24.3804673 C8.32425882,24.3804673 8,24.7047261 8,25.1047196 C8,25.5047131 8.32425882,25.828972 8.72425234,25.828972 L8.7396729,25.828972 C9.69780374,25.8341121 10.1671028,26.3347664 10.7607944,26.9675234 C11.4290187,27.6789252 12.2576168,28.5640654 13.8531308,28.5640654 C15.4486449,28.5640654 16.278785,27.6789252 16.9454673,26.9675234 C17.542243,26.3311682 18.0130841,25.8284579 18.9820093,25.8284579 C19.9509346,25.8284579 20.4212617,26.3311682 21.0185514,26.9675234 C21.6867757,27.6789252 22.5153738,28.5640654 24.1108879,28.5640654 C25.7064019,28.5640654 26.5365421,27.6789252 27.2032243,26.9675234 C27.7964019,26.3347664 28.2657009,25.8366822 29.2238318,25.828972 L29.2387383,25.828972 C29.6387318,25.8291139 29.9631057,25.5049702 29.9632477,25.1049766 C29.9633896,24.7049831 29.6392459,24.3806092 29.2392523,24.3804673 L29.2392523,24.3804673 Z" id="fill-3" fill="#231F20"></path> <path d="M29.2392523,21.072757 L29.2392523,21.072757 C27.6457944,21.072757 26.8146262,21.9578972 26.1479439,22.6692991 C25.5511682,23.3056542 25.0803271,23.8083645 24.1114019,23.8083645 C23.1424766,23.8083645 22.6721495,23.3056542 22.0748598,22.6692991 C21.4066355,21.9578972 20.5780374,21.072757 18.9825234,21.072757 C17.3870093,21.072757 16.5568692,21.9578972 15.8901869,22.6692991 C15.2934112,23.3056542 14.8225701,23.8083645 13.8536449,23.8083645 C12.8847196,23.8083645 12.4143925,23.3056542 11.8176168,22.6692991 C11.1493925,21.9578972 10.3207944,21.072757 8.72528037,21.072757 C8.32528685,21.072757 8.00102804,21.3970158 8.00102804,21.7970093 C8.00102804,22.1970029 8.32528685,22.5212617 8.72528037,22.5212617 L8.73761682,22.5212617 C9.69780374,22.5258879 10.1676168,23.0265421 10.7613084,23.6598131 C11.4269626,24.3701869 12.2545327,25.2542991 13.8526168,25.2542991 C15.4507009,25.2542991 16.278271,24.3701869 16.9449533,23.6608411 C17.541729,23.024486 18.0125701,22.5217757 18.9814953,22.5217757 C19.9504206,22.5217757 20.4207477,23.024486 21.0180374,23.6608411 C21.6862617,24.372243 22.5148598,25.2573832 24.1103738,25.2573832 C25.7058879,25.2573832 26.536028,24.3701869 27.2027103,23.6608411 C27.7964019,23.0275701 28.266215,22.5269159 29.2258879,22.5222897 L29.2382243,22.5222897 C29.4971584,22.5224734 29.7365213,22.3845034 29.8661474,22.1603517 C29.9957735,21.9362 29.9959694,21.6599207 29.8666614,21.4355853 C29.7373534,21.21125 29.4981864,21.0729407 29.2392523,21.072757 L29.2392523,21.072757 Z" id="fill-2" fill="#231F20"></path> <path d="M27.6684112,15.5907477 L18.9095327,9 L10.1501402,15.5907477 L13.4203271,15.5907477 L13.4203271,24.5243925 L13.444486,24.5243925 C14.4766355,24.5243925 14.9783178,23.988785 15.6141589,23.3107944 C16.3245327,22.5531308 17.2076168,21.6099065 18.9085047,21.6099065 C20.6093925,21.6099065 21.4924766,22.5531308 22.2028505,23.3107944 C22.8386916,23.988785 23.3403738,24.5243925 24.3725234,24.5243925 L24.3971963,24.5243925 L24.3971963,15.5907477 L27.6673832,15.5907477 L27.6684112,15.5907477 Z M20.4557009,18.872243 L17.3099065,18.872243 L17.3099065,15.7264486 L20.4557009,15.7264486 L20.4557009,18.872243 L20.4557009,18.872243 Z" id="fill-1" fill="#231F20"></path> </g> </g> </g> </svg>';
    }
  },
});
_.defaults(FloodLevelModel.prototype.defaults, WarningModel.prototype.defaults);

export default FloodLevelModel;
