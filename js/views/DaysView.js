import DaySmallView from 'views/DaySmallView';
import DayLargeView from 'views/DayLargeView';
import MapSmallView from 'views/MapSmallView';
import MapLargeView from 'views/MapLargeView';

const DaysView = Backbone.View.extend({
  el: '#fmi-days-view',
  template: require('templates/DaysTemplate.mustache'),
  NUMBER_OF_DAYS: 5,

  initialize() {
    const self = this;
    this.$el.html(this.template());
    this.daySmallViews = [];
    this.$el.find('ul#fmi-day-small-view').append(
      _.map(this.collection.models, (model) => {
        self.daySmallViews.push(
          new DaySmallView({
            model,
          })
        );
        return _.last(self.daySmallViews).render().el;
      })
    );
    this.daySmallViews.forEach((daySmallView) => {
      daySmallView.mapView = new MapSmallView({
        model: daySmallView.model,
      }).render();
    });
    this.dayLargeViews = [];
    this.$el.find('#fmi-day-large-view').append(
      _.map(this.collection.models, (model) => {
        self.dayLargeViews.push(
          new DayLargeView({
            model,
          })
        );
        return _.last(self.dayLargeViews).render().el;
      })
    );
    this.dayLargeViews.forEach((dayLargeView) => {
      dayLargeView.mapView = new MapLargeView({
        model: dayLargeView.model,
        parentDayView: self,
      }).render();
    });
  },

  render() {
    return this;
  },

  renderMapSmallViews() {
    const self = this;
    _.range(this.NUMBER_OF_DAYS).forEach((day) => {
      self.daySmallViews[day].mapView.render();
    });
  },

  renderMapLargeView(day) {
    this.dayLargeViews[day].mapView.render();
  },
});

export default DaysView;
