const DescriptionWarningView = Backbone.View.extend({
  template: require('templates/DescriptionWarningTemplate.mustache'),
  tagName: 'div',

  initialize(options) {
    const timeDefaults = require(`toml!../config/${CONFIG_PATH}/time.toml`);
    this.timeZone = timeDefaults.timeZone;
    this.options = options;
  },

  render() {
    const days = this.model.get('days');
    if (days.length > 0) {
      const self = this;
      days.forEach((day) => {
        self.$el.addClass(`visible-day-${day}`);
      });
      this.$el.addClass('current-description-row');
      const severity = this.model.get('severity');
      if (severity < 2 || severity > 4) {
        return null;
      }
      this.$el.html(
        this.template({
          direction: this.model.getDirection(),
          text: this.model.getText(),
          severity: this.model.get('severity'),
          warningContext: this.model.get('context'),
          warningTitle: this.model.get('name'),
          areaInfo: this.model.get('areaInfo'),
          validText: __('valid'),
          validFrom: this.model
            .get('effectiveFrom')
            .tz(self.timeZone)
            .format('D.M. HH:mm'),
          validUntil: this.model
            .get('effectiveUntil')
            .tz(self.timeZone)
            .format('D.M. HH:mm'),
          description: he.decode(
            this.model.get('description')[`level${severity}`]
          ),
          region: this.options.region,
          link: this.model.get('link'),
          linkText: this.model.get('linkText'),
          linkHidden: this.model.get('link').length > 0 ? '' : 'hidden',
        })
      );
    }
    return this;
  }
});

export default DescriptionWarningView;
