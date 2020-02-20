import WarningView from 'views/WarningView';

const WarningsView = Backbone.View.extend({
  el: '#fmi-warnings-view',

  template: require('templates/WarningsTemplate.mustache'),

  render() {
    this.$el.html(
      this.template({
        warningSymbols:
          this.collection.size() > 0 ? __('warningSymbols') : __('noWarnings'),
        showWarnings: __('showWarnings'),
        severalWarnings: __('severalWarnings'),
        warningLevel1: __('warningLevel1'),
        warningLevel2: __('warningLevel2'),
        warningLevel3: __('warningLevel3'),
        warningLevel4: __('warningLevel4'),
      })
    );
    const warnings = this.collection.getFiltered();
    this.$el.find('#fmi-warnings-list').append(
      warnings.map(
        (model) =>
          new WarningView({
            model,
          }).render().el
      )
    );
    if (warnings.length > 0) {
      this.$el.find('.symbol-list-main-row').removeClass('hidden');
    }
    if (warnings.length > 1) {
      this.$el.find('.symbol-list-select').removeClass('hidden');
    }
    return this;
  },
});

export default WarningsView;
