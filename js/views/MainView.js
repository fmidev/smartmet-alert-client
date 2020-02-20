const MainView = Backbone.View.extend({
  el: '#fmi-warnings',
  template: require('templates/MainTemplate.mustache'),

  initialize() {
    this.render();
  },

  render() {
    jQuery('[data-toggle="tooltip"]').tooltip();
    this.$el.html(this.template());
  },
});

export default MainView;
