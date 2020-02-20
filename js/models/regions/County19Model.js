import RegionModel from 'models/regions/RegionModel';
import CountyModel from 'models/regions/CountyModel';

const County19Model = CountyModel.extend({
  defaults: {
    virtual: true,
    infoAvailable: false,
    neighbours: [],
    children: [
      'municipality_47', // Enontekiö
      'municipality_890', // Utsjoki
      'municipality_148', // Inari
      'municipality_498', // Muonio
      'municipality_273', // Kolari
      'municipality_261', // Kittilä
      'municipality_758', // Sodankylä
      'municipality_742', // Savukoski
      'municipality_583', // Pelkosenniemi
      'municipality_732', // Salla
      'municipality_854', // Pello
      'municipality_976', // Ylitornio
      'municipality_698', // Rovaniemi
      'municipality_320', // Kemijärvi
      'municipality_851', // Tornio
      'municipality_845', // Tervola
      'municipality_241', // Keminmaa
      'municipality_240', // Kemi
      'municipality_751', // Simo
      'municipality_683', // Ranua
      'municipality_614', // Posio
    ],
    order: 10190,
  },
  initialize() {
    RegionModel.prototype.initialize.call(this);
    this.set('name', __('Lappi'));
  },
});
_.defaults(County19Model.prototype.defaults, CountyModel.prototype.defaults);

export default County19Model;
