import WarningModel from 'models/warnings/WarningModel';

const TrafficWeatherModel = WarningModel.extend({
  defaults: {
    regionType: 'land',
    priority: 4,
  },
  validation: {},
  initialize(...args) {
    WarningModel.prototype.initialize.apply(this, args);
    this.set('name', __('trafficWeather'));
    this.set('description', {
      level2: __('trafficWeatherDescriptionLevel2'),
      level3: __('trafficWeatherDescriptionLevel3'),
      level4: __('trafficWeatherDescriptionLevel4'),
    });
  },
  getSymbol(size) {
    return '<svg width="' + size + 'px" height="' + size + 'px" viewBox="0 0 21 23" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 3.7.1 (28215) - http://www.bohemiancoding.com/sketch --> <title>traffic-symbol-1</title> <desc>Created with Sketch.</desc> <defs> <polygon id="path-1" points="14.5303264 7.30681467 14.5303264 0.0432352892 0.0290014249 0.0432352892 0.0290014249 7.30681467 14.5303264 7.30681467"></polygon> <polygon id="path-3" points="4.0562395 10.2815661 0 10.2815661 0 0.0191412134 8.112479 0.0191412134 8.112479 10.2815661 4.0562395 10.2815661"></polygon> </defs> <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Symbols" transform="translate(-856.000000, -452.000000)"> <g id="traffic-symbol-1" transform="translate(847.750000, 445.000000)"> <rect id="icon-bg" fill-opacity="0" fill="#E8E8E8" x="0" y="0" width="38" height="38" rx="100"></rect> <g id="fill-6" transform="translate(13.900164, 11.172461)"> <mask id="mask-2" fill="white"> <use xlink:href="#path-1"></use> </mask> <g id="Clip-2"></g> <path d="M14.1115399,2.36617665 C14.4070217,2.41840481 14.5879879,2.69956189 14.513681,2.99100054 L13.5257594,6.86348677 C13.4513979,7.15492542 13.1488237,7.35060331 12.8532874,7.29837514 L7.25942925,6.30964943 C6.96394749,6.25742127 6.70507361,6.21164642 6.68423276,6.20798225 C6.66344647,6.20431807 6.40457259,6.15854323 6.10909083,6.10631506 L0.515232678,5.11758935 C0.219696362,5.06536118 0.00212227482,4.77769609 0.0316922736,4.4783822 L0.424667737,0.500728674 C0.454237736,0.201360096 0.720204054,-0.000771117455 1.01568581,0.0514570506 L14.1115399,2.36617665 Z" id="Fill-1" fill="#221F20" mask="url(#mask-2)"></path> </g> <path d="M18.6104736,7.60000547 C18.3402519,7.60000547 18.0452611,7.76095573 17.9165607,7.99185345 L15.9281147,11.5601585 C15.7817923,11.8227759 15.6921003,12.2818916 15.7288172,12.5803851 C15.7288172,12.5803851 16.0717638,15.3679474 20.5712592,16.2154656 C21.2097966,16.3357271 21.7909943,16.3874084 22.3174167,16.3874084 C25.5006653,16.3874084 26.6991231,14.5015067 26.6991231,14.5015067 C26.8603942,14.2478583 26.9531414,13.7973288 26.9052402,13.5004212 L26.2541547,9.46550813 C26.2062534,9.16860056 25.9252839,8.88290428 25.6298021,8.83067611 L18.7199154,7.60935732 C18.684235,7.60306806 18.6475725,7.60000547 18.6104736,7.60000547 M19.0154517,9.27201781 L24.7847658,10.291807 L25.3322472,13.6846144 C25.1154369,13.9379894 24.2357022,14.8014222 22.3174167,14.8014222 C21.8621915,14.8014222 21.3730317,14.7527488 20.8634675,14.6567693 C17.9739003,14.1124479 17.400286,12.7081391 17.3069386,12.393895 C17.311576,12.3628863 17.3193777,12.326518 17.3269611,12.3020172 L19.0154517,9.27201781" id="fill-5" fill="#221F20"></path> <path d="M23.8419956,18.9977066 C23.7898935,19.2939032 23.9890273,19.5789979 24.2845636,19.6312808 L25.3191317,19.8141067 C25.6146134,19.8663349 25.8990201,19.6667194 25.9511222,19.3705228 L26.1870275,18.0295987 C26.2391296,17.7333474 26.0399413,17.4482527 25.7444595,17.3960246 L24.7098915,17.2131986 C24.4143552,17.1609705 24.1299485,17.360586 24.0778464,17.6567826 L23.8419956,18.9977066 Z" id="fill-4" fill="#221F20"></path> <path d="M14.8623563,17.4105227 C14.8102541,17.7067193 15.0093879,17.991814 15.3049242,18.0440968 L16.3394923,18.2269228 C16.634974,18.2791509 16.9193807,18.0795354 16.9714828,17.7833388 L17.2073881,16.4424148 C17.2594902,16.1461635 17.0603019,15.8610688 16.7648202,15.8088406 L15.7302521,15.6260147 C15.4347158,15.5737865 15.1503091,15.773402 15.098207,16.0695986 L14.8623563,17.4105227 Z" id="fill-3" fill="#221F20"></path> <g id="fill-2" transform="translate(8.444444, 18.993014)"> <mask id="mask-4" fill="white"> <use xlink:href="#path-3"></use> </mask> <g id="Clip-11"></g> <path d="M5.19038588,10.2815661 C5.22137437,10.1008183 5.26987571,9.90103874 5.34090918,9.68463365 C5.44036694,9.37241312 5.58308856,9.02836348 5.75150661,8.66621172 C5.92025201,8.3038959 6.11671247,7.92227479 6.3228841,7.5289502 C6.52971042,7.13447713 6.74597513,6.72791776 6.95487463,6.31020179 C7.16333766,5.89226707 7.36470826,5.46481643 7.5374909,5.02828739 C7.7115829,4.59416467 7.85506832,4.14910411 7.95545355,3.7139423 C8.05332916,3.27642885 8.10815914,2.84903289 8.11208726,2.45313791 C8.11694285,2.05718824 8.07624318,1.69711467 8.01322962,1.38954272 C7.95076164,1.08142387 7.8682166,0.824658163 7.78861766,0.621487855 C7.76859517,0.570353471 7.75119142,0.523156707 7.73193273,0.477272484 C7.71174657,0.431114815 7.69276067,0.387855673 7.67513869,0.347604436 C7.65740761,0.307845401 7.64104045,0.271094271 7.62603722,0.237405736 C7.61103399,0.209131429 7.59739469,0.183427514 7.58517388,0.160348679 C7.53639975,0.0682520981 7.51037597,0.0191412134 7.51037597,0.0191412134 L6.91750295,0.212959672 C6.91750295,0.212959672 6.9231769,0.268742636 6.93381555,0.373308351 C6.93648885,0.39944978 6.93943494,0.428653802 6.94270837,0.460811041 C6.94379952,0.491108847 6.94494522,0.524141113 6.94625459,0.559907837 C6.94745485,0.595072981 6.94870967,0.632863205 6.9500736,0.673169131 C6.9508374,0.713639126 6.94936435,0.758210808 6.94903701,0.803930964 C6.94794586,0.987467856 6.93125136,1.20797463 6.88553244,1.4492633 C6.84052275,1.69055197 6.76517927,1.95202094 6.65104562,2.2181385 C6.5375121,2.48463888 6.3804965,2.75513157 6.19047379,3.02414765 C5.99646841,3.29316374 5.76896492,3.56103134 5.50692672,3.828188 C5.24723448,4.09561809 4.95508071,4.36266536 4.64415926,4.63425184 C4.33280136,4.90578362 4.00065717,5.18245619 3.65891091,5.47110569 C3.3164554,5.76079428 2.96439784,6.06262387 2.61277672,6.38971986 C2.26159207,6.71741744 1.91057109,7.06808447 1.57728119,7.46031528 C1.24366396,7.84904598 0.928814394,8.28333276 0.656901342,8.75294876 C0.387279693,9.22579142 0.161740255,9.73533052 0.00870732806,10.2508307 C0.00565212523,10.2611123 0.00303337995,10.2713392 -2.1822877e-05,10.2815661 L5.19038588,10.2815661 Z" id="Fill-10" fill="#221F20" mask="url(#mask-4)"></path> </g> <path d="M22.9120465,29.2745804 C22.9383976,29.1208491 22.9796428,28.9509298 23.0400922,28.7669007 C23.1246558,28.50133 23.2460456,28.2086882 23.3892582,27.9006788 C23.5328528,27.5925052 23.6999069,27.2679249 23.8752537,26.9333912 C24.0511461,26.5979278 24.235113,26.2520734 24.4128057,25.8968125 C24.5901166,25.5413328 24.7613716,25.1778138 24.9082942,24.8065289 C25.0564169,24.4373223 25.1784068,24.0587638 25.2638434,23.6886821 C25.3470431,23.3165222 25.3936895,22.9530032 25.3970175,22.6162819 C25.4011638,22.2795606 25.36652,21.9733012 25.3129449,21.7116682 C25.2598062,21.4495976 25.1896456,21.2312237 25.1218856,21.0584606 C25.1048637,21.014928 25.0900787,20.9747862 25.0737116,20.9357381 C25.0565261,20.8965259 25.0403771,20.8597201 25.0253739,20.8254847 C25.0103161,20.7916868 24.996404,20.7604046 24.9836376,20.7318021 C24.9708713,20.7076842 24.9592506,20.6858085 24.9488847,20.6662298 C24.9073667,20.5879149 24.885271,20.5461324 24.885271,20.5461324 L24.3809989,20.7109655 C24.3809989,20.7109655 24.3857999,20.7583811 24.3948564,20.8473604 C24.3971478,20.8696189 24.3996574,20.8944477 24.4024399,20.9217376 C24.4033673,20.9475509 24.4043494,20.9756612 24.4054405,21.0060684 C24.4064771,21.0359833 24.4075682,21.0680859 24.4087139,21.102376 C24.4093141,21.1367755 24.4081138,21.1747298 24.407841,21.2136138 C24.4069136,21.3696967 24.3926741,21.5572806 24.3538294,21.7624744 C24.3155303,21.9677229 24.2514256,22.1900891 24.1543683,22.4164477 C24.0578021,22.6430796 23.9242461,22.873157 23.7626477,23.1019765 C23.5976667,23.3307961 23.4041523,23.5585765 23.1812317,23.7858101 C22.9604387,24.0132624 22.7119307,24.2403865 22.4474374,24.4713936 C22.1826713,24.7023461 21.9001742,24.9376736 21.6094935,25.1831733 C21.3182126,25.4295481 21.0188027,25.6862591 20.7197202,25.964463 C20.4210741,26.243159 20.1224826,26.5414338 19.8390034,26.8750378 C19.5552515,27.2056886 19.2874848,27.5750047 19.0562168,27.9744545 C18.8268584,28.376584 18.6350353,28.8099958 18.5049164,29.2484389 C18.5022976,29.2571892 18.5000608,29.2658848 18.4974966,29.2745804 L22.9120465,29.2745804 Z" id="fill-1" fill="#221F20"></path> </g> </g> </g> </svg>';
  },
});
_.defaults(
  TrafficWeatherModel.prototype.defaults,
  WarningModel.prototype.defaults
);

export default TrafficWeatherModel;
