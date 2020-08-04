export default {
  data() {
    return {
      warningTypes:
        [
          'thunderStorm',
          'wind',
          'rain',
          'trafficWeather',
          'pedestrianSafety',
          'forestFireWeather',
          'grassFireWeather',
          'hotWeather',
          'coldWeather',
          'uvNote',
          'floodLevel',
          'seaWind',
          'seaThunderStorm',
          'seaWaterHeightHighWater',
          'seaWaterHeightShallowWater',
          'seaWaveHeight',
          'seaIcing',
        ],
      regionIds:
        [
          'county.21',
          'county.2',
          'county.4',
          'county.1',
          'county.5',
          'county.7',
          'county.8',
          'county.9',
          'county.6',
          'county.13',
          'county.10',
          'county.11',
          'county.12',
          'county.14',
          'county.15',
          'county.16',
          'county.17',
          'county.18',
          'county.19',
          'municipality_139_208_244_317_425_436_483_494_535_563_564_625_626_630_678_69_691_71_72_746_748_785_791_859_889_9.977',
          'municipality.615',
          'municipality.832',
          'municipality.305',
          'municipality.751',
          'municipality.683',
          'municipality.614',
          'municipality.240',
          'municipality.241',
          'municipality.851',
          'municipality.976',
          'municipality.845',
          'municipality.854',
          'municipality.698',
          'municipality.320',
          'municipality.732',
          'municipality.273',
          'municipality.498',
          'municipality.261',
          'municipality.758',
          'municipality.583',
          'municipality.742',
          'municipality.47',
          'municipality.148',
          'municipality.890',
          'sea_region.B5E',
          'sea_region.B5W',
          'sea_region.B7E',
          'sea_region.B7W',
          'sea_region.B4W',
          'sea_region.B4E',
          'sea_region.B3S',
          'sea_region.B3N',
          'sea_region.B2',
          'sea_region.B1S',
          'sea_region.B1N',
          'sea_region_south.FI-115978',
          'sea_region_north.FI-115978',
        ],
      geometries: {
        'county.21': {
          name: 'Ahvenanmaa',
          type: 'land',
          parent: '',
        },
        'county.2': {
          name: 'Varsinais-Suomi',
          type: 'land',
          parent: '',
        },
        'county.4': {
          name: 'Satakunta',
          type: 'land',
          parent: '',
        },
        'county.1': {
          name: 'Uusimaa',
          type: 'land',
          parent: '',
        },
        'county.5': {
          name: 'Kanta-Häme',
          type: 'land',
          parent: '',
        },
        'county.7': {
          name: 'Päijät-Häme',
          type: 'land',
          parent: '',
        },
        'county.8': {
          name: 'Kymenlaakso',
          type: 'land',
          parent: '',
        },
        'county.9': {
          name: 'Etelä-Karjala',
          type: 'land',
          parent: '',
        },
        'county.6': {
          name: 'Pirkanmaa',
          type: 'land',
          parent: '',
        },
        'county.13': {
          name: 'Keski-Suomi',
          type: 'land',
          parent: '',
        },
        'county.10': {
          name: 'Etelä-Savo',
          type: 'land',
          parent: '',
        },
        'county.11': {
          name: 'Pohjois-Savo',
          type: 'land',
          parent: '',
        },
        'county.12': {
          name: 'Pohjois-Karjala',
          type: 'land',
          parent: '',
        },
        'county.14': {
          name: 'Etelä-Pohjanmaa',
          type: 'land',
          parent: '',
        },
        'county.15': {
          name: 'Pohjanmaa',
          type: 'land',
          parent: '',
        },
        'county.16': {
          name: 'Keski-Pohjanmaa',
          type: 'land',
          parent: '',
        },
        'county.17': {
          name: 'Pohjois-Pohjanmaa',
          type: 'land',
          parent: '',
        },
        'county.18': {
          name: 'Kainuu',
          type: 'land',
          parent: 'Kainuu',
        },
        'county.19': {
          name: 'Lappi',
          type: 'land',
          parent: '',
        },
        'municipality_139_208_244_317_425_436_483_494_535_563_564_625_626_630_678_69_691_71_72_746_748_785_791_859_889_9.977': {
          name: 'Pohjois-Pohjanmaan länsiosa',
          type: 'land',
          parent: 'county_17',
        },
        'municipality.615': {
          name: 'Pudasjärvi',
          type: 'land',
          parent: 'county.17',
        },
        'municipality.832': {
          name: 'Taivalkoski',
          type: 'land',
          parent: 'county.17',
        },
        'municipality.305': {
          name: 'Kuusamo',
          type: 'land',
          parent: 'county.17',
        },
        'municipality.751': {
          name: 'Simo',
          type: 'land',
          parent: 'county.19',
        },
        'municipality.683': {
          name: 'Ranua',
          type: 'land',
          parent: 'county.19',
        },
        'municipality.614': {
          name: 'Posio',
          type: 'land',
          parent: 'county.19',
        },
        'municipality.240': {
          name: 'Kemi',
          type: 'land',
          parent: 'county.19',
        },
        'municipality.241': {
          name: 'Keminmaa',
          type: 'land',
          parent: 'county.19',
        },
        'municipality.851': {
          name: 'Tornio',
          type: 'land',
          parent: 'county.19',
        },
        'municipality.976': {
          name: 'Ylitornio',
          type: 'land',
          parent: 'county.19',
        },
        'municipality.845': {
          name: 'Tervola',
          type: 'land',
          parent: 'county.19',
        },
        'municipality.854': {
          name: 'Pello',
          type: 'land',
          parent: 'county.19',
        },
        'municipality.698': {
          name: 'Rovaniemi',
          type: 'land',
          parent: 'county.19',
        },
        'municipality.320': {
          name: 'Kemijärvi',
          type: 'land',
          parent: 'county.19',
        },
        'municipality.732': {
          name: 'Salla',
          type: 'land',
          parent: 'county.19',
        },
        'municipality.273': {
          name: 'Kolari',
          type: 'land',
          parent: 'county.19',
        },
        'municipality.498': {
          name: 'Muonio',
          type: 'land',
          parent: 'county.19',
        },
        'municipality.261': {
          name: 'Kittilä',
          type: 'land',
          parent: 'county.19',
        },
        'municipality.758': {
          name: 'Sodankylä',
          type: 'land',
          parent: 'county.19',
        },
        'municipality.583': {
          name: 'Pelkosenniemi',
          type: 'land',
          parent: 'county.19',
        },
        'municipality.742': {
          name: 'Savukoski',
          type: 'land',
          parent: 'county.19',
        },
        'municipality.47': {
          name: 'Enontekiö',
          type: 'land',
          parent: 'county.19',
        },
        'municipality.148': {
          name: 'Inari',
          type: 'land',
          parent: 'county.19',
        },
        'municipality.890': {
          name: 'Utsjoki',
          type: 'land',
          parent: 'county.19',
        },
        'sea_region.B5E': {
          name: 'Suomenlahden itäosa',
          type: 'sea',
          parent: '',
        },
        'sea_region.B5W': {
          name: 'Suomenlahden länsiosa',
          type: 'sea',
          parent: '',
        },
        'sea_region.B7E': {
          name: 'Pohjois-Itämeren itäosa',
          type: 'sea',
          parent: '',
        },
        'sea_region.B7W': {
          name: 'Pohjois-Itämeren länsiosa',
          type: 'sea',
          parent: '',
        },
        'sea_region.B4W': {
          name: 'Ahvenanmeri',
          type: 'sea',
          parent: '',
        },
        'sea_region.B4E': {
          name: 'Saaristomeri',
          type: 'sea',
          parent: '',
        },
        'sea_region.B3S': {
          name: 'Selkämeren eteläosa',
          type: 'sea',
          parent: '',
        },
        'sea_region.B3N': {
          name: 'Selkämeren pohjoisosa',
          type: 'sea',
          parent: '',
        },
        'sea_region.B2': {
          name: 'Merenkurkku',
          type: 'sea',
          parent: '',
        },
        'sea_region.B1S': {
          name: 'Perämeren eteläosa',
          type: 'sea',
          parent: '',
        },
        'sea_region.B1N': {
          name: 'Perämeren pohjoisosa',
          type: 'sea',
          parent: '',
        },
        'sea_region_south.FI-115978': {
          name: 'Saimaan eteläosa',
          type: 'sea',
          parent: '',
        },
        'sea_region_north.FI-115978': {
          name: 'Saimaan pohjoisosa',
          type: 'sea',
          parent: '',
        },
      },
    };
  },
};