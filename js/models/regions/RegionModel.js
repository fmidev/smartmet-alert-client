const RegionModel = Backbone.Model.extend({
  defaults: {
    region: '',
    name: '',
    order: 0,
    reference: null,
    severity: 0,
    priority: 0,
    lift: 0,
    children: [],
    parent: null,
    virtual: false,
    infoAvailable: true,
    weight: 1,
  },
  validators: {
    region: {
      required: '',
    },
    reference: {
      required: true,
    },
  },
  initialize() {
    this.set('region', this.get('region').replace('.', '_'));
  },
});

export default RegionModel;
