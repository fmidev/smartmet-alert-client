import MainView from 'views/MainView';

const Workspace = Backbone.Router.extend({
  routes: {
    '': 'main',
  },
  main() {
    new MainView();
  },
});

export default Workspace;
