import WarningModel from 'models/warnings/WarningModel';

const SeaWindModel = WarningModel.extend({
  defaults: {
    regionType: 'sea',
    priority: 12,
  },
  validation: {},
  initialize(...args) {
    WarningModel.prototype.initialize.apply(this, args);
    this.set('name', __('seaWind'));
    this.set('description', {
      level2: __('seaWindDescriptionLevel2'),
      level3: __('seaWindDescriptionLevel3'),
      level4: __('seaWindDescriptionLevel4'),
    });
    const direction = this.get('direction');
    if (_.isNumber(direction)) {
      this.set('direction', direction - 180);
    }
  },
  handleProperties(properties) {
    if (this.get('severity') === 1 && this.get('magnitude') > 0) {
      this.set('severity', 2);
    }
  },
  getSymbol(size, magnitude = true) {
    // Notice, it is enough to provide svg-element that is existing by itself for Snap.
    const paper = Snap(
      jQuery(
        '<svg height="0" width="0" version="1.1" xmlns="http://www.w3.org/2000/svg"><desc>WindModel</desc><defs></defs></svg>'
      ).get(0)
    );
    const circle = paper.circle(10, 10, 6.0).attr({
      fill: '#000000',
    });
    const path = paper
      .path('M10.0 0.0L14.0 8.0 L6.0 8.0z')
      .transform(`R${this.get('direction')},10,10`);
    const text = paper
      .text(10, 12.45, magnitude ? this.get('magnitude') : 'm/s')
      .attr({
        'font-family': 'sans-serif',
        'font-size': 7,
        fill: '#ffffff',
        'text-anchor': 'middle',
        'font-weight': 'bold',
      });
    const group = paper.group(circle, path, text);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${this.getAspectRatio() * size}px" height="${size}px" viewBox="0 0 20 20">${group.outerSVG()}</svg>`;
  },
  getScale() {
    return 7;
  },
  getDirection() {
    const direction = this.get('direction');
    return _.isFinite(direction) ? Math.round((direction + 360) % 360) : 0;
  },
  getText() {
    return Math.round(this.get('magnitude')).toString();
  },
});
_.defaults(SeaWindModel.prototype.defaults, WarningModel.prototype.defaults);

export default SeaWindModel;
