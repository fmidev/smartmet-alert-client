import WarningModel from 'models/warnings/WarningModel';

const map = require(`toml!../../config/${CONFIG_PATH}/map.toml`);

const WindModel = WarningModel.extend({
  defaults: {
    regionType: 'land',
    priority: 2,
  },
  validation: {},
  initialize(...args) {
    WarningModel.prototype.initialize.apply(this, args);
    this.set('name', __('wind'));
    this.set('description', {
      level2: __('windDescriptionLevel2'),
      level3: __('windDescriptionLevel3'),
      level4: __('windDescriptionLevel4'),
    });
    const direction = this.get('direction');
    if (_.isNumber(direction)) {
      this.set('direction', direction - 90);
    }
  },
  getSymbol() {
    // Notice, it is enough to provide svg-element that is existing by itself for Snap.
    const paper = Snap(
      jQuery(
        '<svg height="0" width="0" version="1.1" xmlns="http://www.w3.org/2000/svg"><desc>WindModel</desc><defs></defs></svg>'
      ).get(0)
    );
    let polygon = paper
      .polygon([
        16.4745754,
        12.6666667,
        9.28888889,
        19.0539118,
        16.4745754,
        25.441157,
        16.4745754,
        22.247563,
        27.8666667,
        22.247563,
        27.8666667,
        15.8603178,
        16.4745754,
        15.8603178,
      ])
      .transform(`R${this.get('direction')},18.577777795,19.0539118S0.9`)
      .attr({
        fill: '#221F20',
      });
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="10 10 20 20">${polygon.outerSVG()}</svg>`;
  },
  getDirection() {
    const direction = this.get('direction');
    return _.isFinite(direction) ? Math.round((direction + 360) % 360) : 0;
  },
  getText() {
    return '';
  },
});
_.defaults(WindModel.prototype.defaults, WarningModel.prototype.defaults);

export default WindModel;
