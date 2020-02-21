import RegionWarningView from 'views/RegionWarningView';
import DescriptionWarningView from 'views/DescriptionWarningView';

const RegionView = Backbone.View.extend({
  template: require('templates/RegionTemplate.mustache'),
  tagName: 'div',

  render() {
    const region = this.model.get('region');
    const parent = this.model.get('parent');
    this.$el.addClass('panel panel-default current-warning-panel');
    this.$el.attr('id', `region-${this.model.get('region').toString(10)}`);
    this.$el.html(
      this.template({
        name: this.model.get('name'),
        regionType: this.model.get('regionType'),
        region,
      })
    );
    const parentWarnings = this.model.collection.warnings.getModelsWhere(
      'regions',
      parent
    );
    const numParentWarnings = parentWarnings.length;
    const regionWarnings = this.model.collection.warnings.getModelsWhere(
      'regions',
      region
    );
    const coverages = this.model.collection.warnings.getModelsWhere(
      'coverages',
      region
    );
    if (coverages != null) {
      coverages.forEach((coverage) => {
        const numRegionWarnings = regionWarnings.length;
        let k = 0;
        while (k < numRegionWarnings) {
          if (
            this.model.collection.warnings.comparator(
              coverage,
              regionWarnings[k]
            ) < 0
          ) {
            break;
          }
          k++;
        }
        regionWarnings.splice(k, 0, coverage);
      });
    }
    this.$el.find('.current-warning-heading').append(
      regionWarnings.reduce((regionWarningViews, warning, index) => {
        const warningText = warning.getText();
        const warningDirection = warning.getDirection();
        const context = warning.get('context');
        const severity = warning.get('severity');
        warning.get('days').forEach((day) => {
          for (let j = 0; j < numParentWarnings; j++) {
            if (
              _.includes(parentWarnings[j].get('days'), day) &&
              warning.collection.isIdentical(warning, parentWarnings[j]) &&
              numParentWarnings === regionWarnings.length
            ) {
              return;
            }
          }
          const numRegionWarningViews = regionWarningViews.length;
          for (let i = 0; i < numRegionWarningViews; i++) {
            const regionWarningView = jQuery(regionWarningViews[i]);
            if (regionWarningView == null) {
              continue;
            }
            if (regionWarningView.hasClass(context)) {
              if (regionWarningView.hasClass(`visible-day-${day}`)) {
                return;
              }
              if (
                regionWarningView.hasClass(`level-${severity}`) &&
                regionWarningView.hasClass(
                  `symbol-rotate-${warningDirection}`
                ) &&
                warningText ===
                  regionWarningView
                    .find('span.symbol-text')
                    .html()
                    .trim()
              ) {
                jQuery(regionWarningView).addClass(`visible-day-${day}`);
                return;
              }
            }
          }
          regionWarningViews.push(
            new RegionWarningView({
              model: warning,
              index,
            }).render().el
          );
        });
        return regionWarningViews;
      }, [])
    );
    // Time-based ordering within the same warning context
    const maxL = regionWarnings.length - 1;
    let minL = 0;
    let l = minL;
    while (l < maxL) {
      let next = l + 1;
      if (
        regionWarnings[l].get('context') !== regionWarnings[next].get('context')
      ) {
        minL = next;
      } else if (
        regionWarnings[l]
          .get('effectiveUntil')
          .isAfter(regionWarnings[next].get('effectiveUntil'))
      ) {
        let temp = regionWarnings[next];
        regionWarnings[next] = regionWarnings[l];
        regionWarnings[l] = temp;
        l = minL;
        continue;
      }
      l++;
    }
    this.$el.find('.current-description-table').append(
      regionWarnings.map(
        (warning) =>
          new DescriptionWarningView({
            model: warning,
            region,
          }).render().el
      )
    );
    return this;
  },
});

export default RegionView;
