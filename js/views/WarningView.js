const WarningView = Backbone.View.extend({
  template: require('templates/WarningTemplate.mustache'),
  tagName: 'div',

  render() {
    this.$el.addClass('row symbol-list-main-row');
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
    return this;
  },
});

export default WarningView;
