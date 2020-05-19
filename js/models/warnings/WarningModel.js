const map = require(`toml!../../config/${CONFIG_PATH}/map.toml`);
const WarningModel = Backbone.Model.extend({
  defaults: {
    name: '',
    measure: '',
    direction: null,
    magnitude: null,
    magnitudeUnit: '',
    severity: 0,
    rawSeverity: '',
    regionType: null,
    description: '',
    effectiveFrom: null,
    effectiveUntil: null,
    modificationTime: null,
    context: null,
    active: false,
    areaInfo: [],
    link: '',
    linkText: '',
    days: [],
    regions: [],
    coverages: [],
  },
  validators: {
    severity: {
      isRequired: true,
    },
    regionType: {
      isRequired: true,
    },
    info: {
      isType: 'string',
    },
    effectiveFrom: {
      isRequired: true,
    },
    effectiveUntil: {
      isRequired: true,
    },
    modificationTime: {
      isRequired: true,
    },
    warningContext: {
      isType: 'string',
    },
  },
  initialize() {
    const rawSeverity = this.get('rawSeverity');
    this.set(
      'severity',
      rawSeverity != null ? parseInt(this.get('rawSeverity').slice(-1)) : ''
    );
  },
  handleProperties(properties) {},
  // Todo: nämä view:n puolelle
  getSymbol() {
    return '';
  },
  getScale() {
    return 0;
  },
  getDirection() {
    return 0;
  },
  getText() {
    return '';
  },
  getAspectRatio() {
    return 1;
  },
});

export default WarningModel;
