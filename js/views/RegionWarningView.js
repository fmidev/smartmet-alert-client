const RegionWarningView = Backbone.View.extend({
  tagName: 'div',

  initialize(options) {
    this.options = options;
  },

  render() {
    const self = this;
    const direction = this.model.getDirection();
    this.$el.addClass(
      `symbol-image symbol-image-rotate-${this.model.getDirection()} level-${this.model.get(
        'severity'
      )} symbol-rotate-${direction} warning-image current-warning-image hidden ${this.model.get(
        'context'
      )}`
    );
    // if (this.options.index > 1) {
    //     this.$el.addClass('hidden-xs');
    // }
    this.model.get('days').forEach((day) => {
      self.$el.addClass(`visible-day-${day}`);
    });
    this.$el.append(
      `<span class="symbol-text symbol-text-rotate-${direction} warning-symbol-text">${this.model.getText()}</span>`
    );
    return this;
  },
});

export default RegionWarningView;
