const DayView = Backbone.View.extend({
  template: require('templates/DaySmallTemplate.mustache'),
  tagName: 'li',

  render() {
    if (this.model.get('active')) {
      this.$el.addClass('active');
    } else {
      this.$el.removeClass('active');
    }
    const index = this.model.get('index');
    this.$el.html(
      this.template({
        index,
        weekday: this.model.get('weekdayName'),
        date: `${this.model.get('date')}.${this.model.get('month')}.`,
        severity: this.model.collection.warnings.getMaxSeverity('days', index),
      })
    );
    return this;
  },
});

export default DayView;
