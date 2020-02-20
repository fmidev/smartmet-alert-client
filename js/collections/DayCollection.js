import DayModel from 'models/days/DayModel';

const DayCollection = Backbone.Collection.extend({
  model: DayModel,
  initialize(models, { warnings, regions }) {
    this.warnings = warnings;
    this.regions = regions;
  },
  getActiveDay() {
    const numModels = this.models.length;
    for (let i = 0; i < numModels; i++) {
      if (this.models[i].get('active')) {
        return i;
      }
    }
    return -1;
  },
  setActiveDay(day) {
    const activeDay = day.toString();
    this.models.forEach((dayModel) => {
      dayModel.set('active', dayModel.get('index').toString() === activeDay);
    });
  },
  getActiveModel() {
    for (let i = 0; i < this.length; i++) {
      if (this.models[i].get('active')) {
        return this.models[i];
      }
    }
    return null;
  },
  getActiveIndex() {
    for (let i = 0; i < this.length; i++) {
      if (this.models[i].get('active')) {
        return i;
      }
    }
    return null;
  },
});

export default DayCollection;
