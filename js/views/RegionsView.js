import RegionView from 'views/RegionView';
const container = require(`toml!../config/${CONFIG_PATH}/container.toml`);

const RegionsView = Backbone.View.extend({
  el: '#fmi-regions-view',
  template: require('templates/RegionsTemplate.mustache'),
  NUMBER_OF_DAYS: 5,

  initialize() {
    const self = this;
    this.$el.html(
      this.template({
        land: __('regionLand'),
        sea: __('regionSea'),
      })
    );
    ['land', 'sea'].forEach((regionType) => {
      self.$el
        .find(`#accordion-${regionType}`)
        .empty()
        .append(
          self.collection
            .where({
              regionType,
            })
            .map(
              (model) =>
                new RegionView({
                  model,
                }).render().el
            )
        );
    });
  },

  render(day) {
    const selector = `#${container.id}`;
    jQuery(`${selector} .panel-collapse.collapse.in`).removeClass('in');
    _.range(this.NUMBER_OF_DAYS)
      .filter((item) => item !== parseInt(day))
      .forEach((hiddenDay) => {
        jQuery(`${selector} .visible-day-${hiddenDay}`).addClass('hidden');
      });
    ['current-warning-image', 'current-description-row'].forEach(
      (elementClass) => {
        jQuery(`${selector} .${elementClass}:not(visible-day-${day})`)
          .parent(`${selector} .current-warning-heading`)
          .addClass('hidden');
        jQuery(`${selector} .${elementClass}.visible-day-${day}`)
          .parent(`${selector} .current-warning-heading`)
          .removeClass('hidden');
      }
    );
    jQuery(`${selector} .visible-day-${day}`).removeClass('hidden');
    ['land', 'sea'].forEach((regionType) => {
      jQuery(`${selector} #header-${regionType}`).css({
        visibility:
          jQuery(
            `${selector} #accordion-${regionType} .current-warning-heading:not(.hidden)`
          ).length > 0
            ? 'visible'
            : 'hidden',
      });
    });
    const descriptionTexts = jQuery(`${selector} .current-description-row`)
      .not('.hidden')
      .find('.description-indent-text');
    const numDescriptionTexts = descriptionTexts.length;
    let descriptionText = jQuery(descriptionTexts[0]);
    let region = descriptionText.data('region');
    let context = descriptionText.data('context');
    let severity = descriptionText.data('severity');
    let nextDescriptionText;
    let nextRegion;
    let nextContext;
    let nextSeverity;
    for (let i = 1; i < numDescriptionTexts; i++) {
      nextDescriptionText = jQuery(descriptionTexts[i]);
      nextRegion = nextDescriptionText.data('region');
      nextContext = nextDescriptionText.data('context');
      nextSeverity = nextDescriptionText.data('severity');
      if (
        region === nextRegion &&
        context === nextContext &&
        severity === nextSeverity
      ) {
        descriptionText.addClass('hidden');
      } else {
        descriptionText.removeClass('hidden');
      }
      descriptionText = nextDescriptionText;
      region = nextRegion;
      context = nextContext;
      severity = nextSeverity;
    }
    jQuery(descriptionTexts[numDescriptionTexts - 1]).removeClass('hidden');
    return this;
  },
});

export default RegionsView;
