const MapView = Backbone.View.extend({
  colors: require(`toml!../config/${CONFIG_PATH}/colors.toml`),
  initialize() {},

  isDesktop() {
    return jQuery('div#fmi-warnings div.map-small:visible').length > 0;
  },

  render() {
    const self = this;
    const index = this.model.get('index');
    const features = this.visualizer.getFeatures('Regions');
    features.forEach((feature) => {
      const region = feature.get('region');
      const regionType = feature.get('regionType');
      let fillColor = self.colors[regionType];
      fillColor[3] = feature.get('defaultOpacity');
      let severity = 1;
      const regionWarnings = self.model.get('regionWarnings')[index][region];
      if (typeof regionWarnings !== 'undefined') {
        regionWarnings['full']
          .filter((warning) => warning.get('active'))
          .filter(
            (warning, index, warnings) =>
              index === 0 ||
              warning.get('context') !== warnings[index - 1].get('context')
          )
          .forEach((warning) => {
            severity = Math.max(severity, warning.get('severity'));
          });
      }
      const severityLevel = `level-${severity}`;
      let priority = feature.get('priority');
      if (severity > 1) {
        fillColor = self.colors[severityLevel];
        fillColor[3] = 1;
        priority += feature.get('lift');
      }
      feature.set('severity', severityLevel);
      const style = feature.getStyle();
      style[0].getFill().setColor(fillColor);
      style[1].getStroke().setColor(`rgba(0, 0, 0, ${0.3 * fillColor[3]})`);
      style[0].setZIndex(10 * priority + severity);
      style[1].setZIndex(style[0].getZIndex() + 100 * priority + 1);
      feature.setStyle(style);
    });
  },
});

export default MapView;
