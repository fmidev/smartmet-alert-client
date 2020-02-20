const DayLargeView = Backbone.View.extend({
  template: require('templates/DayLargeTemplate.mustache'),
  tagName: 'div',

  initialize(options = {}) {
    const timeDefaults = require(`toml!../config/${CONFIG_PATH}/time.toml`);
    this.timeZone = timeDefaults.timeZone;
    this.options = options;
  },

  render() {
    const self = this;
    this.$el.addClass('tab-pane');
    if (this.model.get('active')) {
      this.$el.addClass('active');
    } else {
      this.$el.removeClass('active');
    }
    this.$el.attr('id', `day${this.model.get('index').toString(10)}-map`);
    const dateFormat = 'DD.MM.YYYY';
    this.$el.html(
      this.template({
        warnings: __('warnings'),
        updated: __('updated'),
        atTime: __('atTime'),
        index: this.model.get('index'),
        warningsDate: this.model.get('dateTime').format(dateFormat),
        updatedDate: this.model
          .get('modificationTime')
          .tz(self.timeZone)
          .format(dateFormat),
        updatedTime: this.model
          .get('modificationTime')
          .tz(self.timeZone)
          .format('HH:mm'),
        dataProviderFirst: __('dataProviderFirst'),
        dataProviderSecond: __('dataProviderSecond'),
      })
    );
    return this;
  },
});

export default DayLargeView;
