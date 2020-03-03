import 'babel-polyfill';
import 'bootstrap-webpack!lib/bootstrap/bootstrap.config.js';
import 'lib/jquery/jalc';
import 'lib/jquery/attrchange';
import 'jquery-visibility-ci-dev';
import 'lib/metoclient/metoclient';
import 'lib/metoclient/ol.css';
import 'less/ol-popup.less';
import 'less/style.less';
import WarningCollection from 'collections/WarningCollection';
import * as warnings from 'glob:models/warnings/*.js';
import * as days from 'glob:models/days/*.js';
import * as regions from 'glob:models/regions/*.js';
import DayCollection from 'collections/DayCollection';
import RegionCollection from 'collections/RegionCollection';
import DaysView from 'views/DaysView';
import RegionsView from 'views/RegionsView';
import WarningsView from 'views/WarningsView';
import Workspace from 'routers/Router';
import findBootstrapEnvironment from 'tools/Layout';
import * as constants from 'tools/Constants';

export class SmartAlertClient {
  constructor(options = {}) {
    // Configuration
    this.urls = jQuery.extend(
      true,
      require(`toml!./config/${CONFIG_PATH}/urls.toml`),
      options.urls
    );
    this.geometries = jQuery.extend(
      true,
      require(`toml!./config/${CONFIG_PATH}/geometries.toml`),
      options.geometries
    );
    this.page = jQuery.extend(
      true,
      require(`toml!./config/${CONFIG_PATH}/page.toml`),
      options.page
    );
    this.flood = jQuery.extend(
      true,
      require(`toml!./config/${CONFIG_PATH}/flood.toml`),
      options.flood
    );
    this.time = jQuery.extend(
      true,
      require(`toml!./config/${CONFIG_PATH}/time.toml`),
      options.time
    );

    if (
      typeof this.page.refreshInterval === 'number' &&
      this.page.refreshInterval < constants.MINIMUM_REFRESH_INTERVAL
    ) {
      this.page.refreshInterval = constants.MINIMUM_REFRESH_INTERVAL;
    }

    this.defaultDay = 0;

    // Debug mode data
    this.debugInfo = null;

    // Collections
    this.warningCollection = null;
    this.regionCollection = null;
    this.dayCollection = null;

    // Views
    this.daysView = null;
    this.warningsView = null;
    this.regionsView = null;

    // Time
    this.currentTime = null;
    this.modificationTime = null;
    // Selection is initialized only once here
    // but updated by user actions. Then, state
    // is available between refresh.
    this.selectedDay =
      options.time != null && options.time.selectedDay != null
        ? options.time.selectedDay
        : this.defaultDay;

    // Refresh
    this.intervalId = null;
    this.workspace = null;
    this.windowEventsOff = null;
    // This holds the state of selection and should be
    // initialized only just before emptying and reloading content.
    this.unselectedDataWarnings = [];

    // Initialize
    this.createWorkspace_();

    // Refresh when the page gained visibility
    if (this.page.automaticOnPageVisible) {
      jQuery(document).on({
        show: () => {
          this.refresh();
        },
        hide: () => {
          this.stop();
        },
      });
    }
  }

  init_() {
    if (typeof this.page.refreshInterval === 'number') {
      this.intervalId = setTimeout(
        this.refresh.bind(this),
        this.page.refreshInterval
      );
    }

    // Debug mode data
    this.debugInfo = {};

    // Collections
    this.warningCollection = new WarningCollection();
    this.regionCollection = new RegionCollection([], {
      warnings: this.warningCollection,
    });
    this.dayCollection = new DayCollection([], {
      warnings: this.warningCollection,
      regions: this.regionCollection,
    });

    // Views
    this.daysView = undefined;
    this.warningsView = undefined;
    this.regionsView = undefined;

    // Time
    this.currentTime = moment();
    this.modificationTime = moment(null);

    // Refresh
    this.intervalId = undefined;

    // This may be called multiple times when using interval refresh.
    if (!Backbone.History.started) {
      // Workspace creates main view.
      // Router functionality handes the main view update here.
      this.workspace = new Workspace();
      // Backbone should be started only once.
      Backbone.history.start();
    } else {
      // Create new main view by hand.
      this.workspace.main();
    }
  }

  setUnselectedDataWarnings_() {
    jQuery.each(this.unselectedDataWarnings, (i, value) => {
      // Notice, if warnings have changed during refresh and corresponding element
      // is not available anymore, it does not matter because selector handles the case properly.
      jQuery(
        `#fmi-warnings-list .flag-selected[data-warning='${value}']`
      ).trigger('click');
    });
  }

  unselectAllDataWarnings_() {
    // State about data warning elements can be resetted
    // by unselecting data warnings before loading content
    // and setting it again after refresh. Without this
    // selections may not work properly.
    const self = this;
    this.unselectedDataWarnings = [];
    jQuery('#fmi-warnings-list .flag-unselected').each(function() {
      const value = jQuery(this).attr('data-warning');
      if (value) {
        self.unselectedDataWarnings.push(value);
      }
    });
    // Unselect all to make things work properly after reload.
    // Famework may set all selected properly after this. Then,
    // necessary elements may be unselected based on list created above.
    jQuery('#fmi-warnings-list .flag-selected').trigger('click');
  }

  getWarningTypeFromContext_(context) {
    return (
      context
        .split('-')
        .map(
          (part) =>
            part.charAt(0).toUpperCase() + part.replace(/[0-9]/g, '').slice(1)
        )
        .join('') + constants.MODEL_SUFFIX
    );
  }

  addReference_(model, reference, id) {
    const references = model.get(reference);
    const numReferences = references.length;
    let i = 0;
    while (i < numReferences) {
      if (id === references[i]) {
        return;
      }
      if (id < references[i]) {
        break;
      }
      i++;
    }
    references.splice(i, 0, id);
  }

  getRegionFromReference_(reference) {
    return this.geometries.types.reduce((region, type) => {
      const tempRegion = replace
        .all(`${this.geometries.reference + type}.xml#`)
        .from(region)
        .with('');
      return replace
        .all(`,${type}.`)
        .from(tempRegion)
        .with('+');
    }, reference);
  }

  createRegionModel_(regionFeature) {
    // Todo: _.isNil
    if (
      regionFeature.geometry === null ||
      typeof regionFeature.properties.reference === 'undefined' ||
      regionFeature.properties.reference.length === 0
    ) {
      return;
    }
    let region = this.getRegionFromReference_(
      regionFeature.properties.reference
    );
    let model = (
      region.charAt(0).toUpperCase() + region.slice(1)
    ).replace(/([._]+)(.?)/g, (a) => a.toUpperCase());
    region = replace
      .all('+')
      .from(region)
      .with('_');
    region = replace
      .all('.')
      .from(region)
      .with('_');
    model = `${['.', '_', '-'].reduce(
      (region, character) =>
        replace
          .all(character)
          .from(region)
          .with(''),
      model
    )}Model`;
    model = replace
      .all('+')
      .from(model)
      .with('_');
    if (typeof regions[model] !== 'undefined') {
      const regionModel = new regions[model]({
        region,
        reference: regionFeature.properties.reference,
        weight: regionFeature.properties.weight,
        feature: jQuery.extend(true, {}, regionFeature),
      });
      this.warningCollection
        .where({
          reference: regionModel.get('reference'),
        })
        .forEach((warning) => {
          this.addReference_(warning, 'regions', region.replace('.', '_'));
          regionModel.get('children').forEach((childRegion) => {
            this.addReference_(warning, 'regions', childRegion);
          });
        });
      this.regionCollection.add(regionModel);
    }
  }

  removeNonIdenticalParents_() {
    this.regionCollection
      .filter((region) => region.get('children').length > 0)
      .forEach((parent) => {
        let parentRegion = parent.get('region');
        let parentWarnings = this.warningCollection.filter((warning) =>
          warning.get('regions').includes(parentRegion)
        );
        let numParentWarnings = parentWarnings.length;
        if (numParentWarnings === 0) {
          return;
        }
        let children = parent.get('children');
        let numChildren = children.length;
        for (let i = 0; i < numChildren; i++) {
          let numChildWarnings = this.warningCollection.filter(
            (warning) =>
              warning.get('regions').includes(children[i]) ||
              warning.get('coverages').includes(children[i])
          ).length;
          if (numChildWarnings !== numParentWarnings) {
            parentWarnings.forEach((parentWarning) => {
              _.pull(parentWarning.get('regions'), parentRegion);
            });
            break;
          }
        }
      });
  }

  createWarningModelFromWOML_(warningData) {
    if (warningData.properties == null) {
      console.log('Invalid warning data.');
      return;
    }
    if (warningData.geometry !== null) {
      warningData.properties.reference = null;
    }
    const warningContext =
      warningData.properties.warning_context +
      (warningData.properties.context_extension
        ? '-' + warningData.properties.context_extension
        : '');
    const modelType = this.getWarningTypeFromContext_(warningContext);
    if (_.isUndefined(warnings[modelType])) {
      console.log('Unknown warning type.');
      return;
    }
    let info = '';
    if (warningData.properties[__('womlInfoField')] != null) {
      info = he.decode(warningData.properties[__('womlInfoField')]);
    }
    if (info == null) {
      info = '';
    }
    if (typeof warnings[modelType] === 'undefined') {
      console.log('Unknown warning type.');
      return;
    }
    if (warningData.properties.severity == null) {
      console.log('Unknown warning severity.');
      return;
    }
    const warning = new warnings[modelType]({
      identifier: warningData.properties.identifier,
      areaInfo: [
        {
          area: '',
          info,
        },
      ],
      rawSeverity: warningData.properties.severity,
      reference: warningData.properties.reference,
      effectiveFrom: moment.utc(warningData.properties.effective_from),
      effectiveUntil: moment.utc(warningData.properties.effective_until),
      modificationTime: moment.utc(warningData.properties.modification_time),
      context: warningContext,
      measure: warningData.properties.physical_reference,
      direction: Number(warningData.properties.physical_direction),
      magnitude: Number(warningData.properties.physical_value),
      magnitudeUnit: warningData.properties.physical_unit,
      active: true,
      days: [],
      regions: [],
      coverages: [],
    });
    warning.handleProperties(warningData.properties);
    this.warningCollection.add(warning);
    if (
      _.isEmpty(warningData.properties.reference) &&
      warningData.geometry !== null
    ) {
      const region = warningData.id.replace('.', '_');
      const regionModel = new regions['CustomRegionModel']({
        region,
        reference: '',
        feature: jQuery.extend(true, {}, warningData),
      });
      this.addReference_(warning, 'regions', region);
      const coverageReferences = _.uniq(
        warningData.properties.coverage_references
          .replace(/, /g, ';')
          .split(';')
      );
      coverageReferences.forEach((coverageReference) => {
        let refRegion = this.getRegionFromReference_(
          coverageReference.replace(/\s+/g, '')
        );
        refRegion = replace
          .all('+')
          .from(refRegion)
          .with('_');
        refRegion = replace
          .all('.')
          .from(refRegion)
          .with('_');
        this.addReference_(warning, 'coverages', refRegion);
      });
      this.regionCollection.add(regionModel);
    }
  }

  createWarningModelFromCAP_({ properties }) {
    if (
      properties.language == null ||
      properties.language !== __('capLanguage')
    ) {
      return;
    }
    if (
      properties.severity == null ||
      !this.flood.supportedSeverities.includes(
        properties.severity.toLowerCase()
      )
    ) {
      return;
    }
    if (properties.reference == null) {
      if (this.page.debugMode) {
        console.log('Unknown flood warning region.');
      }
      return;
    }
    const areaDescription = JSON.parse(
      decodeURIComponent(
        properties.area_desc != null ? properties.area_desc : '[%22%22]'
      ).replace(/\n/g, ' ')
    );
    const numAreaDescription = areaDescription.length;
    this.warningCollection.add(
      new warnings.FloodLevelModel({
        rawSeverity: properties.severity,
        reference: properties.reference,
        effectiveFrom: moment.utc(properties.onset),
        effectiveUntil: moment.utc(properties.expires),
        modificationTime: moment.utc(properties.sent),
        context: 'flood-level',
        areaInfo: JSON.parse(
          decodeURIComponent(
            properties.description != null ? properties.description : '[%22%22]'
          ).replace(/\n/g, ' ')
        ).reduce((areaInfo, info, index) => {
          areaInfo.push({
            // 14.12.2018: Source data does not contain individual flood locations anymore
            area: '',
            info,
          });
          return areaInfo;
        }, []),
        active: true,
        days: [],
        regions: [],
      }),
      {
        sort: false,
      }
    );
  }

  createDayModel_(index) {
    const dateTime = this.currentTime.clone().add(index, 'd');
    const dayModel = new days[`${dateTime.format('dddd')}Model`]({
      index,
      dateTime,
      modificationTime: this.modificationTime,
    });
    this.warningCollection.each((warning) => {
      if (
        dayModel.contains(
          warning.get('effectiveFrom'),
          warning.get('effectiveUntil')
        )
      ) {
        this.addReference_(warning, 'days', index);
      }
    });
    this.dayCollection.add(dayModel);
  }

  updateActiveWarnings_() {
    const activeWarnings = [];
    jQuery('#fmi-warnings-list .flag-selected').each((index, element) => {
      activeWarnings.push(jQuery(element).data('warning'));
    });
    this.warningCollection.forEach((warning) => {
      warning.set(
        'active',
        jQuery.inArray(warning.get('context'), activeWarnings) >= 0
      );
    });
    const day = this.dayCollection.getActiveDay();
    this.daysView.renderMapSmallViews();
    this.daysView.renderMapLargeView(day);
    this.regionsView.render(day);
  }

  loadData_() {
    const self = this;
    // The cacheTimestamp is used to change the query URLs every time.ajaxCacheTTL seconds.
    // This causes a client cache miss if the URL has changed from the previous query.
    // This is a sane mechanism only if jQuery.ajax.cache = true (and the server sends proper caching headers).
    let previousTTLEpoch =
      self.time.ajaxCacheTTL *
      Math.floor(moment().unix() / self.time.ajaxCacheTTL);
    let cacheTimestamp = moment
      .unix(previousTTLEpoch)
      .utc()
      .format('YYYYMMDDHHmmss');

    jQuery
      .when(
        // Browser cache should be allowed in ajax queries below.
        // Then, server proxies may also cache content to ease
        // load in backend. Server side caching does not work
        // if &_=some_timestamp -parameter is included in query URLs.
        // Notice, server needs to define proper expiration info
        // in HTTP response headers to make sure that content is
        // not kept in proxy or browser cache too long.
        jQuery.ajax({
          dataType: constants.DATA_TYPE,
          url:
            self.urls.cap +
            self.flood.supportedSeverities.reduce((filter, severity, index) => {
              return (
                filter +
                (index === 0 ? '' : ',') +
                '%27' +
                severity.toUpperCase() +
                '%27'
              );
            }, '&cql_filter=severity%20IN%20(') +
            ')%20AND%20language=%27' +
            __('capLanguage') +
            '%27' +
            '&t=' +
            cacheTimestamp,
          cache: true,
          localCache: false,
        }),
        jQuery.ajax({
          dataType: constants.DATA_TYPE,
          url: self.urls.capTime + '&t=' + cacheTimestamp,
          cache: true,
          localCache: false,
        })
      )
      .always((capData, capTime) => {
        jQuery
          .when(
            // Browser cache should be allowed in ajax queries below.
            // Then, server proxies may also cache content to ease
            // load in backend. Server side caching does not work
            // if &_=some_timestamp -parameter is included in query URLs.
            // Notice, server needs to define proper expiration info
            // in HTTP response headers to make sure that content is
            // not kept in proxy or browser cache too long.
            jQuery.ajax({
              dataType: constants.DATA_TYPE,
              url: self.urls.geom,
              cache: true,
              localCache: self.isLocalStorageAvailable_(),
              cacheTTL: 24 * 365,
              cacheKey: 'regions-finland-2020-01',
              isCacheValid() {
                return true;
              },
            }),
            jQuery.ajax({
              dataType: constants.DATA_TYPE,
              url: self.urls.womlTime + '&t=' + cacheTimestamp,
              cache: true,
              localCache: false,
            }),
            jQuery.ajax({
              dataType: constants.DATA_TYPE,
              url: self.urls.woml + '&t=' + cacheTimestamp,
              cache: true,
              localCache: false,
            })
          )
          .done((geomData, womlTime, womlData) => {
            jQuery('.loading-spinner').hide();
            if (self.page.debugMode) {
              self.debugInfo.womlData = womlData;
              self.debugInfo.capData = capData;
              // Set here custom date for debugging purposes
              // this.currentTime = moment('2020-02-05 19:50:00');
              // console.log(`Debug mode: Current time is ${currentTime}.`);
            }
            if (capTime[1] === constants.AJAX_SUCCESS) {
              const capModificationTime = moment.utc(
                capTime[0].features[0].properties.update_time
              );
              if (
                capModificationTime.isValid() &&
                (!self.modificationTime.isValid() ||
                  capModificationTime.isAfter(self.modificationTime))
              ) {
                self.modificationTime = capModificationTime;
              }
            }
            if (womlTime[1] === constants.AJAX_SUCCESS) {
              const womlModificationTime = moment.utc(
                womlTime[0].features[0].properties.update_time
              );
              if (
                womlModificationTime.isValid() &&
                (!self.modificationTime.isValid() ||
                  womlModificationTime.isAfter(self.modificationTime))
              ) {
                self.modificationTime = womlModificationTime;
              }
            }
            if (capData[1] === constants.AJAX_SUCCESS) {
              capData[0].features.forEach(
                self.createWarningModelFromCAP_,
                self
              );
            }
            if (womlData[1] === constants.AJAX_SUCCESS) {
              womlData[0].features.forEach(
                self.createWarningModelFromWOML_,
                self
              );
            }
            _.range(constants.NUMBER_OF_DAYS).forEach(
              self.createDayModel_,
              self
            );
            if (geomData[1] === constants.AJAX_SUCCESS) {
              geomData[0].features.forEach(self.createRegionModel_, self);
            }
            self.removeNonIdenticalParents_();
            self.dayCollection.setActiveDay(self.defaultDay);
            self.daysView = new DaysView({
              collection: self.dayCollection,
            }).render();
            self.warningsView = new WarningsView({
              collection: self.warningCollection,
            }).render();
            self.regionsView = new RegionsView({
              collection: self.regionCollection,
            }).render(self.defaultDay);

            const tab = jQuery('div#fmi-warnings a[data-toggle="tab"]');
            tab.off('shown.bs.tab').on('shown.bs.tab', ({ target }) => {
              jQuery(
                'div#fmi-warnings div#fmi-regions-view a.btn.btn-default.current-warning-toggle'
              ).addClass('collapsed');
              self.selectDay(parseInt(jQuery(target).data('day')));
            });
            // Fallbacks if parent class is changed before Bootstrap events
            tab.parent().attrchange({
              trackValues: true,
              callback: function({ attributeName, newValue }) {
                if (
                  attributeName === 'class' &&
                  newValue.split(' ').includes('active')
                ) {
                  self.selectDay(
                    parseInt(
                      jQuery(this)
                        .children('a.day')
                        .data('day')
                    )
                  );
                }
              },
            });
            jQuery('div#fmi-warnings a.current-warning-toggle').on(
              'click',
              function() {
                let collapseElem = jQuery(self)
                  .parent()
                  .parent()
                  .find('.panel-collapse');
                if (collapseElem.hasClass('in')) {
                  collapseElem.addClass('fmi-show');
                } else {
                  collapseElem.removeClass('fmi-show');
                }
              }
            );
            jQuery('div.collapse').on('show.bs.collapse', function(event) {
              var collapseElem = jQuery(this);
              if (collapseElem.parents('div#fmi-warnings').length === 0) {
                event.preventDefault();
                return;
              }
              if (collapseElem.hasClass('fmi-show')) {
                event.preventDefault();
                collapseElem.removeClass('fmi-show');
              } else {
                collapseElem.addClass('fmi-show');
              }
            });

            jQuery('div#fmi-warnings .show-text')
              .off('click')
              .on('click', () => {
                jQuery('.flag-unselected')
                  .removeClass('flag-unselected')
                  .addClass('flag-selected');
                jQuery('.disabled-warning').removeClass('disabled-warning');
                jQuery('div#fmi-warnings .show-text').addClass('hidden');
                jQuery('div#fmi-warnings .symbol-list-select').attr(
                  'data-original-title',
                  __('selectWarningTooltipLine1') +
                    '\n' +
                    __('selectWarningTooltipLine2')
                );
                self.updateActiveWarnings_();
              });

            jQuery('div#fmi-warnings .symbol-list-select')
              .off('click touchend')
              .on('click touchend', function(event) {
                if (event.type === 'touchend') {
                  event.preventDefault();
                }
                const elem = jQuery(this);
                elem
                  .toggleClass('flag-selected')
                  .toggleClass('flag-unselected');
                const warningType = elem.attr('data-warning');
                const icons = jQuery(`img[src*="${warningType}"]`);
                const related = elem
                  .parent()
                  .parent()
                  .parent()
                  .find('.symbol-list-cell-image, .symbol-list-text');
                if (elem.hasClass('flag-selected')) {
                  icons.show();
                  related.removeClass('disabled-warning');
                  if (
                    jQuery('div#fmi-warnings-list .disabled-warning').length ===
                    0
                  ) {
                    jQuery('div#fmi-warnings span.show-text').addClass(
                      'hidden'
                    );
                  }
                  elem.attr(
                    'data-original-title',
                    __('selectWarningTooltipLine1') +
                      '\n' +
                      __('selectWarningTooltipLine2')
                  );
                  if (
                    jQuery('.tooltip').is(':visible') &&
                    event.type !== 'touchend'
                  ) {
                    elem.tooltip('show');
                  }
                } else {
                  icons.hide();
                  related.addClass('disabled-warning');
                  jQuery('span.show-text').removeClass('hidden');
                  elem.attr(
                    'data-original-title',
                    __('selectDisabledWarningTooltipLine1') +
                      '\n' +
                      __('selectDisabledWarningTooltipLine2')
                  );
                  if (
                    jQuery('.tooltip').is(':visible') &&
                    event.type !== 'touchend'
                  ) {
                    elem.tooltip('show');
                  }
                }
                if (event.type === 'touchend') {
                  elem.tooltip('hide');
                }
                self.updateActiveWarnings_();
              });

            // IE11 fix to hide tooltip after a flag icon is clicked
            jQuery('div#fmi-warnings .symbol-list-select')
              .off('mouseleave')
              .on('mouseleave', function() {
                jQuery(this).tooltip('hide');
              });

            const scrollWarningsView = () => {
              const bootstrapEnvironment = findBootstrapEnvironment();
              if (['md', 'lg'].includes(bootstrapEnvironment)) {
                const warningsViewDiv = jQuery('#fmi-warnings-view');
                const windowScrollTop = jQuery(window).scrollTop();
                const column = jQuery('#fmi-warnings-view').parent();
                const columnHeight = column.height();
                const columnTop = column.offset().top;
                if (columnTop - windowScrollTop < 0) {
                  const bottom = columnTop + column.parent().height();
                  warningsViewDiv.offset({
                    top:
                      windowScrollTop + columnHeight > bottom
                        ? bottom - columnHeight
                        : windowScrollTop,
                  });
                } else {
                  warningsViewDiv.offset({
                    top: columnTop,
                  });
                }
              }
            };

            const resizer = () => {
              const warningsViewDiv = jQuery('#fmi-warnings-view');
              warningsViewDiv.offset({
                top: warningsViewDiv.parent().offset().top,
              });
              scrollWarningsView();
              // Mobile device memory saving
              self.daysView.renderMapSmallViews();
            };

            jQuery(window).resize(resizer);

            jQuery(window).scroll(scrollWarningsView);

            self.windowEventsOff = () => {
              jQuery(window).off('resize', resizer);
              jQuery(window).off('scroll', scrollWarningsView);
            };

            // By simulating UI component click, we make sure all element and
            // objects are properly updated if selected item differs from default.
            jQuery(`#day${self.selectedDay}`).trigger('click');

            // Like above trigger clicks to set proper selection for warning flag selection.
            self.setUnselectedDataWarnings_();

            // TODO: Better fix needed to avoid unnecessary switching.
            // This is just a quick fix to show the warnings information.
            // So, this if-clause and its content should be removed when better fix implemented.
            if (self.selectedDay === self.defaultDay) {
              // This temporary switching makes sure warning information is shown.
              // Notice, better fix should be done when actual reason to problem is known.
              jQuery(`#day${self.defaultDay + 1}`).trigger('click');
              jQuery(`#day${self.defaultDay}`).trigger('click');
            }
          })
          .fail(() => {
            // Hide spinner and show error text above actual content.
            jQuery('.loading-spinner')
              .hide()
              .after(
                `<div class="load-data-failed-text">${__('failed')}</div>`
              );
          });
      });
  }

  isLocalStorageAvailable_() {
    let test = 'test';
    try {
      window['localStorage'].setItem(test, test);
      window['localStorage'].removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  createWorkspace_() {
    this.init_();

    this.loadData_();

    // Collect debug info
    const getBrowser = () => {
      const ua = navigator.userAgent;
      let tem;
      let M =
        ua.match(
          /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i
        ) || [];
      if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return { name: 'IE', version: tem[1] || '' };
      }
      if (M[1] === 'Chrome') {
        tem = ua.match(/\bOPR\/(\d+)/);
        if (tem != null) {
          return { name: 'Opera', version: tem[1] };
        }
      }
      M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
      if ((tem = ua.match(/version\/(\d+)/i)) != null) {
        M.splice(1, 1, tem[1]);
      }
      return {
        name: M[0],
        version: M[1],
      };
    };
    if (this.page.debugMode) {
      jQuery('#fmi-warnings')
        .prepend(
          jQuery(
            '<br><p>Liitä virheraporttiin seuraavat tiedot:</p><ul><li>mistä virheessä on kyse? (tarvittaessa myös kuva)</li><li>miten virhe saadaan toistettua?</li><li>oheisesta painikkeesta tuotettu tieto:<ul><li>uusi välilehti tai ikkuna avautuu ja muutaman sekunnin sisällä siihen ilmestyy tekstiä</li><li>valitse koko teksti (esimerkiksi paina Ctrl-a)</li><li>kopioi valittu teksti (Ctrl-c)</li><li>liitä teksti virheraporttiin (Ctrl-v)</li></ul></ul>'
          )
        )
        .prepend(
          '<input type="button" id="test-raport" value="Liitetieto virheraporttiin" /><br>'
        );
      jQuery('#test-raport').click(() => {
        const w = window.open();
        jQuery(w.document.body).html(
          JSON.stringify({
            navigator,
            browser: getBrowser(),
            currentTime: this.currentTime,
            woml: this.debugInfo.womlData,
            cap: this.debugInfo.capData,
          })
        );
      });
    }
  }

  // Stop automatic refreshing started in the refresh function.
  // Does not remove current content.
  stop() {
    clearInterval(this.intervalId);
    this.intervalId = undefined;
  }

  emptyViews_() {
    if (this.daysView != null) {
      this.daysView.remove();
      this.daysView = undefined;
    }
    if (this.warningsView != null) {
      this.warningsView.remove();
      this.warningsView = undefined;
    }
    if (this.regionsView != null) {
      this.regionsView.remove();
      this.regionsView = undefined;
    }
  }

  emptyCollections_() {
    if (this.warningCollection != null) {
      this.warningCollection.reset();
      this.warningCollection = undefined;
    }
    if (this.regionCollection != null) {
      this.regionCollection.reset();
      this.regionCollection = undefined;
    }
    if (this.dayCollection != null) {
      this.dayCollection.reset();
      this.dayCollection = undefined;
    }
  }

  emptyInternal_() {
    if (this.windowEventsOff != null) {
      this.windowEventsOff();
      this.windowEventsOff = undefined;
    }
    this.unselectAllDataWarnings_();
    this.emptyViews_();
    this.emptyCollections_();
    jQuery('#fmi-warnings').empty();
  }

  // Empty page content.
  // Does not remove wrapping element itself, only its content.
  // Removes page content related event handlers.
  // Stops automatic refresh.
  empty() {
    this.stop();
    this.emptyInternal_();
  }

  // Select specific day.
  selectDay(day) {
    this.selectedDay = day;
    this.dayCollection.setActiveDay(day);
    if (this.daysView != null) {
      this.daysView.renderMapLargeView(day);
    }
    if (this.regionsView != null) {
      this.regionsView.render(day);
    }
  }

  // Set custom data URLs.
  setUrls(customUrls) {
    ['geom', 'woml', 'womlTime', 'cap', 'capTime'].forEach((type) => {
      if (customUrls[type] != null) {
        this.urls[type] = customUrls[type];
      }
    });
  }

  refresh() {
    console.log('REFRESH');
    // Empty all and release event handlers before refreshing new content.
    this.empty();
    // Recreate everything but do not loose user choices, keep the state.
    this.createWorkspace_();
  }
}
export default SmartAlertClient;
