const WarningView = Backbone.View.extend({
  template: require('templates/WarningTemplate.mustache'),
  tagName: 'div',

  render() {
    if (this.model.get('days').length > 0) {
      this.$el.html(
        this.template({
          warningContext: this.model.get('context'),
          name: this.model.get('name'),
          severity: this.model.get('severity'),
        })
      );
      this.$el.find('.symbol-list-select').tooltip({
        title:
          __('selectWarningTooltipLine1') +
          '\n' +
          __('selectWarningTooltipLine2'),
        placement: 'top',
      });
    }
    return this;
  },
});

export default WarningView;
