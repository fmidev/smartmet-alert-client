import RegionModel from 'models/regions/RegionModel';

const RegionCollection = Backbone.Collection.extend({
  model: RegionModel,
  initialize(models, { warnings }) {
    this.warnings = warnings;
  },
  comparator(model) {
    return model.get('order');
  },
});

export default RegionCollection;
