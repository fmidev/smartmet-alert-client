import base64 from 'js-base64';
import MapView from 'views/MapView';

const MapLargeView = MapView.extend({
  initialize(options = {}) {
    const self = this;
    const mapDefaults = require(`toml!../config/${CONFIG_PATH}/map.toml`);
    const timeDefaults = require(`toml!../config/${CONFIG_PATH}/time.toml`);
    this.options = options;
    this.projection = mapDefaults.projection;
    this.iconSize = mapDefaults.iconSize;
    this.timeZone = timeDefaults.timeZone;
    const regionFeatures = [];
    if (jQuery('#day-map-large').length > 0) {
      return;
    }
    jQuery(`.day-map-large-${this.model.get('index')} .day-map-large`).attr(
      'id',
      'day-map-large'
    );
    this.model.collection.regions.forEach((regionModel) => {
      const regionType = regionModel.get('regionType');
      const color = self.colors[regionType];
      const feature = regionModel.get('feature');
      // _.isNil(feature)
      if (typeof feature === 'undefined' || feature === null) {
        return;
      }
      if (feature.geometry === null) {
        return;
      }
      const geometry = regionModel.get('virtual')
        ? []
        : feature.geometry.geometries.reduce(
            (newArray, { coordinates, type }) => {
              if (typeof coordinates !== 'undefined') {
                switch (type) {
                  case 'Polygon':
                    newArray.push(coordinates);
                    break;
                  case 'MultiPolygon':
                    coordinates.forEach((coordinates) => {
                      newArray.push(coordinates);
                    });
                    break;
                }
              }
              return newArray;
            },
            []
          );
      regionFeatures.push({
        type: 'MultiPolygon',
        geometry,
        style: [
          {
            fill: {
              color,
            },
            stroke: {
              color: 'rgba(0, 0, 0, 0)',
            },
          },
          {
            stroke: {
              color: 'rgba(0, 0, 0, 0)',
              width: 1.5,
            },
          },
        ],
        regionType,
        name: regionModel.get('name'),
        region: regionModel.get('region'),
        regionParent: regionModel.get('parent'),
        regionChildren: regionModel.get('children'),
        priority: regionModel.get('priority'),
        lift: regionModel.get('lift'),
        defaultOpacity: regionModel.get('defaultOpacity'),
        weight: regionModel.get('weight'),
        infoAvailable: regionModel.get('infoAvailable'),
        reference: feature.properties.reference,
        representativeX: feature.properties.representative_x,
        representativeY: feature.properties.representative_y,
      });
    });
    // Optimize symbol locations
    const dynamicFeatures = regionFeatures.filter((regionFeature) => {
      return (
        regionFeature.reference == null &&
        regionFeature.representativeX != null &&
        regionFeature.representativeY != null
      );
    });
    regionFeatures.forEach((regionFeature) => {
      if (
        regionFeature.regionType !== 'land' ||
        regionFeature.reference == null ||
        regionFeature.representativeX == null ||
        regionFeature.representativeY == null
      ) {
        return;
      }
      dynamicFeatures.forEach((dynamicFeature) => {
        const distance = Math.sqrt(
          Math.pow(
            regionFeature.representativeX - dynamicFeature.representativeX,
            2
          ) +
            Math.pow(
              regionFeature.representativeY - dynamicFeature.representativeY,
              2
            )
        );
        if (distance < mapDefaults.minSymbolDistance) {
          regionFeature.representativeX =
            regionFeature.representativeX +
            (mapDefaults.minSymbolDistance *
              (regionFeature.representativeX -
                dynamicFeature.representativeX)) /
              distance;
          regionFeature.representativeY =
            regionFeature.representativeY +
            (mapDefaults.minSymbolDistance *
              (regionFeature.representativeY -
                dynamicFeature.representativeY)) /
              distance;
        }
      });
    });
    this.config = {
      project: 'fmiwarnings',
      map: {
        model: {
          layers: [
            {
              className: 'Vector',
              title: 'Regions',
              id: 'Regions',
              type: 'features',
              visible: true,
              source: {
                projection: self.projection,
                features: regionFeatures,
                useSpatialIndex: false,
              },
            },
            {
              className: 'Vector',
              title: 'WeatherSymbols',
              id: 'WeatherSymbols',
              type: 'features',
              visible: true,
              source: {
                projection: self.projection,
                features: [],
                useSpatialIndex: false,
              },
            },
          ],
        },
        view: {
          container: 'day-map-large',
          mapContainer: 'day-map-large-base',
          projection: this.projection,
          extent: mapDefaults.extent,
          extentByZoomLevel: mapDefaults.extentByZoomLevel,
          resolutions: mapDefaults.resolutions,
          defaultCenterLocation: mapDefaults.center,
          defaultCenterProjection: self.projection,
          defaultZoomLevel: mapDefaults.zoom,
          showLegend: false,
          showLayerSwitcher: false,
          maxAsyncLoadCount: 5,
          staticControls: false,
          interactions: {
            doubleClickZoom: false,
            dragPan: false,
            dragRotate: false,
            dragRotateAndZoom: false,
            dragZoom: false,
            keyboardPan: false,
            keyboardZoom: false,
            mouseWheelZoom: false,
            pinchRotate: false,
            pinchZoom: false,
          },
        },
      },
      time: {
        view: {
          showTimeSlider: false,
        },
      },
      localization: {
        locale: __('metoclientLanguage'),
      },
    };
    this.config.localization[__('metoclientLanguage')] = {
      // Add Metoclient 3 custom localizations here
    };
    MapView.prototype.visualizer = new fi.fmi.metoclient.ui.animator.MapLibrary(
      this.config
    );
    MapView.prototype.visualizer.createAnimation({
      zoom(level) {
        if (level !== MapView.prototype.zoomLevel) {
          MapView.prototype.zoomLevel = level;
          self.options.parentDayView.dayLargeViews[
            self.model.collection.getActiveIndex()
          ].mapView.render();
        }
        const largeMapViewport = jQuery(
          '#fmi-warnings #day-map-large-base > .ol-viewport'
        );
        const dragContainer = jQuery('#fmi-warnings .drag-container');
        if (level === 0) {
          MapView.prototype.visualizer.setCenter(
            mapDefaults.center[0],
            mapDefaults.center[1]
          );
          largeMapViewport.css('touch-action', 'manipulation');
          dragContainer.addClass('zoom-zero');
        } else {
          largeMapViewport.css('touch-action', 'none');
          dragContainer.removeClass('zoom-zero');
        }
      },
      popupClosed() {
        const desktopView = MapView.prototype.isDesktop();
        if (!desktopView || MapView.prototype.zoomLevel === 0) {
          MapView.prototype.visualizer.setCenter(
            mapDefaults.center[0],
            mapDefaults.center[1]
          );
        }
      },
    });
    const map = MapView.prototype.visualizer.getMap();
    if (map == null) {
      return;
    }
    MapView.prototype.zoomLevel = map.getView().getZoom();

    let showMapPopup = function(coordinate) {
      if (
        jQuery('#fmi-warnings #day-map-large').width() <
        mapDefaults.minMapWidthForPopup
      ) {
        return;
      }
      const clickedFeatures = MapView.prototype.visualizer.getFeaturesAt(
        'Regions',
        coordinate[0],
        coordinate[1],
        30
      );
      const numClickedFeatures = clickedFeatures.length;
      if (numClickedFeatures > 0) {
        const regionWarnings = self.model.get('regionWarnings');
        const index = self.model.collection.getActiveDay();
        let popupTableBody = '<div class="popup-table-body">' + '</div>';
        let maxSeverity = 1;
        if (typeof regionWarnings[index] !== 'undefined') {
          let maxZIndex = Number.NEGATIVE_INFINITY;
          var feature = null;
          clickedFeatures.forEach((clickedFeature) => {
            clickedFeature.getStyle().forEach((style) => {
              const zIndex = style.getZIndex();
              if (clickedFeature.get('infoAvailable') && zIndex > maxZIndex) {
                feature = clickedFeature;
                maxZIndex = zIndex;
              }
            });
          });
          if (feature === null) {
            return;
          }
          const warnings = regionWarnings[index][feature.get('region')];
          if (typeof warnings !== 'undefined') {
            const dateFormat = 'DD.MM.';
            const timeFormat = 'HH:mm';
            const addedRows = [];
            const copyWarning = (warning) => ({
              context: warning.get('context'),
              effectiveFrom: warning.get('effectiveFrom'),
              effectiveUntil: warning.get('effectiveUntil'),
              active: warning.get('active'),
              severity: warning.get('severity'),
              direction: warning.getDirection(),
              text: warning.getText(),
              get: function(property) {
                return this[property];
              },
            });
            let popupWarnings =
              warnings['full'] == null
                ? []
                : warnings['full'].map((warning) => copyWarning(warning));
            if (warnings['part'] != null) {
              warnings['part'].forEach((coverage) => {
                const numPopupWarnings = popupWarnings.length;
                let i = 0;
                while (i < numPopupWarnings) {
                  if (
                    self.model.collection.warnings.comparator(
                      coverage,
                      popupWarnings[i]
                    ) < 0
                  ) {
                    break;
                  }
                  i++;
                }
                popupWarnings.splice(i, 0, copyWarning(coverage));
              });
            }
            const maxJ = popupWarnings.length - 1;
            let minJ = 0;
            let j = minJ;
            while (j < maxJ) {
              let next = j + 1;
              if (popupWarnings[j].context !== popupWarnings[next].context) {
                minJ = next;
              } else if (
                popupWarnings[j].effectiveUntil.isAfter(
                  popupWarnings[next].effectiveUntil
                )
              ) {
                let temp = popupWarnings[next];
                popupWarnings[next] = popupWarnings[j];
                popupWarnings[j] = temp;
                j = minJ;
                continue;
              }
              j++;
            }
            popupWarnings.forEach((warning) => {
              if (!warning.active) {
                return;
              }
              const severity = warning.severity;
              if (severity > maxSeverity) {
                maxSeverity = severity;
              }
              const effectiveFrom = warning.effectiveFrom;
              const effectiveUntil = warning.effectiveUntil;
              const direction = warning.direction;
              const popUpTableRow = `<div class="popup-table-row"><div class="popup-table-cell popup-table-symbol-cell symbol-image symbol-image-rotate-${direction} level-${severity} ${
                warning.context
              } warning-image"><span class="symbol-text symbol-text-rotate-${direction} warning-symbol-text">${
                warning.text
              }</span></div><div class="popup-table-cell popup-table-text-cell"><strong>${effectiveFrom
                .tz(self.timeZone)
                .format(dateFormat)}</strong> ${__(
                'atTime'
              )} ${effectiveFrom
                .tz(self.timeZone)
                .format(timeFormat)} – <strong>${effectiveUntil
                .tz(self.timeZone)
                .format(dateFormat)}</strong> ${__(
                'atTime'
              )} ${effectiveUntil
                .tz(self.timeZone)
                .format(timeFormat)}</div></div>`;
              if (_.includes(addedRows, popUpTableRow)) {
                return;
              } else {
                addedRows.push(popUpTableRow);
              }
              popupTableBody = jQuery(popupTableBody)
                .append(popUpTableRow)
                .prop('outerHTML');
            });
          }
        }
        const warningTable = jQuery(popupTableBody);
        if (warningTable.is(':empty')) {
          popupTableBody = warningTable
            .append(
              '<div class="popup-table-row"><div class="popup-table-cell popup-table-text-cell">' +
                __('popupNoWarnings') +
                '</div></div>'
            )
            .prop('outerHTML');
        }
        const content = `<div class="region-popup"><div align="left" class="region-popup-header bold-text level-${maxSeverity}">${feature.get(
          'name'
        )}</div><div class="region-popup-wrapper"><div class="region-popup-body"><div class="popup-table">${popupTableBody}</div></div></div></div>`;
        MapView.prototype.visualizer.showPopup(
          content,
          coordinate[0],
          coordinate[1]
        );
        jQuery('#day-map-large-base-popup-closer')
          .removeClass(
            [1, 2, 3, 4].reduce(
              (previous, level) => `${previous}, shadow-level-${level} `,
              ''
            )
          )
          .addClass(`shadow-level-${maxSeverity}`);
      }
    };

    // Add a click handler to the map to render the popup.
    map.on('singleclick', function(event) {
      showMapPopup(event.coordinate);
    });
    // Update mouse cursor
    map.on('pointermove', ({ coordinate }) => {
      const features = MapView.prototype.visualizer.getFeaturesAt(
        'Regions',
        coordinate[0],
        coordinate[1],
        30
      );
      if (features.length > 0) {
        jQuery(map.getTarget()).css('cursor', 'pointer');
      } else {
        jQuery(map.getTarget()).css('cursor', '');
      }
    });
    const dragContainer = jQuery('#fmi-warnings').find(
      '.drag-container.zoom-zero'
    );
    dragContainer.on('click', function(event) {
      const offset = dragContainer.offset();
      const coordinate = map.getCoordinateFromPixel([
        event.pageX - offset.left,
        event.pageY - offset.top,
      ]);
      if (coordinate != null) {
        showMapPopup(coordinate);
      }
    });
    dragContainer.on('mousemove', function(event) {
      const offset = dragContainer.offset();
      const coordinate = map.getCoordinateFromPixel([
        event.pageX - offset.left,
        event.pageY - offset.top,
      ]);
      if (coordinate == null) {
        return;
      }
      const features = MapView.prototype.visualizer.getFeaturesAt(
        'Regions',
        coordinate[0],
        coordinate[1],
        30
      );
      if (features.length > 0) {
        dragContainer.css('cursor', 'pointer');
      } else {
        dragContainer.css('cursor', '');
      }
    });
    MapView.prototype.visualizer.desktopView = false;
    const checkForResize = ({ prototype }) => {
      const desktopView = prototype.isDesktop();
      if (desktopView !== prototype.visualizer.desktopView) {
        prototype.visualizer.desktopView = desktopView;
        prototype.visualizer.setInteractions({
          DoubleClickZoom: false,
          DragPan: desktopView,
          DragRotate: false,
          DragRotateAndZoom: false,
          DragZoom: false,
          KeyboardPan: false,
          KeyboardZoom: false,
          MouseWheelZoom: false,
          PinchRotate: false,
          PinchZoom: false,
        });
        const zoomButtons = jQuery('div#fmi-warnings .ol-zoom');
        if (!desktopView) {
          prototype.visualizer.setCenter(
            mapDefaults.center[0],
            mapDefaults.center[1]
          );
          prototype.visualizer.setZoom(mapDefaults.zoom);
          zoomButtons.hide();
        } else {
          zoomButtons.show();
        }
      }
    };
    jQuery(window).on('resize', () => {
      checkForResize(MapView);
    });
    const zoomButtons = jQuery('div#fmi-warnings .ol-zoom');
    if (MapView.prototype.isDesktop()) {
      zoomButtons.show();
    } else {
      zoomButtons.hide();
    }
    checkForResize(MapView);
    jQuery('#day-map-large-base .ol-viewport').css(
      'touch-action',
      'manipulation'
    );
  },

  render() {
    const self = this;
    const identicalParent = {};
    if (!this.model.get('active')) {
      return this;
    }
    const index = this.model.collection.getActiveDay();
    jQuery('#day-map-large').removeAttr('id');
    jQuery(`.day-map-large-${this.model.get('index')} .day-map-large`)
      .attr('id', 'day-map-large')
      .append(jQuery('#day-map-large-base'));
    const zoomControl = jQuery('div#fmi-day-large-view>div.tab-pane>div.map-container div.ol-zoom');
    if (zoomControl.length > 0) {
      zoomControl.detach().appendTo('div#fmi-day-large-view>div.tab-pane.active>div.map-container');
    }
    MapView.prototype.visualizer.hidePopup();
    MapView.prototype.visualizer.clearFeatures('WeatherSymbols');
    MapView.prototype.render.call(this);
    let weatherSymbols = [];
    let checkConnection = function(region, styles, symbol) {
      const regionModel = self.model.collection.regions.findWhere({
        region,
      });
      if (regionModel.get('visited')) {
        return false;
      }
      regionModel.set('visited', true);
      let warnings = self.model.get('regionWarnings')[self.model.get('index')][
        region
      ];
      if (typeof warnings === 'undefined' || _.isEmpty(warnings['full'])) {
        return false;
      }
      warnings = warnings['full'].filter((warning) => warning.get('active'));
      if (
        !self.equalSymbol(
          `level-${warnings.reduce(
            (maxSeverity, warning) =>
              Math.max(warning.get('severity'), maxSeverity),
            1
          )}`,
          styles,
          symbol
        )
      ) {
        return false;
      }
      if (symbol.regions.includes(region)) {
        return true;
      }
      const neighbours = regionModel.get('neighbours');
      const numNeighbours = neighbours.length;
      for (let i = 0; i < numNeighbours; i++) {
        let neighbourStyles = [];
        let numWeatherSymbols = weatherSymbols.length;
        for (let j = 0; j < numWeatherSymbols; j++) {
          if (
            Array.isArray(weatherSymbols[j].regions) &&
            weatherSymbols[j].regions.includes(neighbours[i])
          ) {
            neighbourStyles = weatherSymbols[j].style;
            break;
          }
        }
        if (checkConnection(neighbours[i], neighbourStyles, symbol)) {
          return true;
        }
      }
      return false;
    };

    const regions = MapView.prototype.visualizer.getFeatures('Regions');
    regions.forEach((regionFeature) => {
      const region = regionFeature.get('region');
      const regionWarnings = self.model.get('regionWarnings')[index][region];
      if (typeof regionWarnings === 'undefined') {
        return;
      }
      let regionParent = regionFeature.get('regionParent');
      let isLeaf = true;
      if (
        _.isEmpty(regionParent) &&
        regionFeature.get('regionChildren').length > 0
      ) {
        regionParent = region;
        isLeaf = false;
      }
      let regionParentWarnings = [];
      if (typeof identicalParent[regionParent] === 'undefined') {
        if (
          typeof self.model.get('regionWarnings')[index][regionParent] !==
          'undefined'
        ) {
          regionParentWarnings = self.model
            .get('regionWarnings')
            [index][regionParent]['full'].filter((warning) =>
              warning.get('active')
            );
        }
        const numRegionParentWarnings = _.isArray(regionParentWarnings)
          ? regionParentWarnings.length
          : 0;
        if (numRegionParentWarnings > 0) {
          const regionParentChildren = self.model.collection.regions.where({
            parent: regionParent,
          });
          const numRegionParentChildren = regionParentChildren.length;
          let identical = true;
          for (let k = 0; k < numRegionParentChildren; k++) {
            const regionParentChild = regionParentChildren[k];
            const regionParentChildRegion = regionParentChild.get('region');
            if (
              _.isEmpty(regionParentChildRegion) ||
              typeof self.model.get('regionWarnings')[index][
                regionParentChildRegion
              ] === 'undefined'
            ) {
              identical = false;
              break;
            }
            const regionParentChildWarnings = self.model
              .get('regionWarnings')
              [index][regionParentChildRegion]['full'].filter((warning) =>
                warning.get('active')
              );
            const numRegionParentChildWarnings =
              regionParentChildWarnings.length;
            if (numRegionParentChildWarnings !== numRegionParentWarnings) {
              identical = false;
              break;
            }
            loopRegionParentChildWarnings: for (
              let l = 0;
              l < numRegionParentChildWarnings;
              l++
            ) {
              for (let m = 0; m < numRegionParentWarnings; m++) {
                if (
                  self.model.collection.warnings.isIdentical(
                    regionParentChildWarnings[l],
                    regionParentWarnings[m]
                  )
                ) {
                  continue loopRegionParentChildWarnings;
                }
              }
              identical = false;
              break;
            }
          }
          identicalParent[regionParent] = identical;
        } else {
          identicalParent[regionParent] = false;
        }
      }
      if (!xor(identicalParent[regionParent], isLeaf)) {
        return;
      }
      const filteredWarnings = self.model.collection.warnings.getFiltered(
        regionWarnings['full'].filter((warning) => warning.get('active'))
      );
      const styles = [];
      const baseScale = (3.0 * (MapView.prototype.zoomLevel - 1.0)) / 10.0;
      const numFilteredWarnings = filteredWarnings.length;
      const maxNumSymbols = MapView.prototype.zoomLevel + 2;
      const severalWarnings = filteredWarnings.length > maxNumSymbols;
      const numSymbols = severalWarnings
        ? maxNumSymbols - 1
        : numFilteredWarnings;
      const halfImageWidth = 12;
      const anchorOffset =
        halfImageWidth +
        (numSymbols - 1 + (severalWarnings ? 1 : 0)) * halfImageWidth;
      const zIndex = 1000 + regionFeature.get('priority');
      const zoomedIconSize = this.iconSize + 2 * MapView.prototype.zoomLevel;
      for (let i = 0; i < numSymbols; i++) {
        const scaledIconSize = zoomedIconSize + filteredWarnings[i].getScale() * (MapView.prototype.zoomLevel + 1);
        styles.push({
          image: {
            type: 'icon',
            anchor: [anchorOffset - i * 2 * halfImageWidth, 0.5],
            anchorXUnits: 'pixels',
            anchorYUnits: 'fraction',
            opacity: 1.0,
            rotation: 0,
            size: [scaledIconSize, scaledIconSize],
            imgSize: [scaledIconSize, scaledIconSize],
            src: `data:image/svg+xml;base64,${base64.Base64.encode(
              filteredWarnings[i].getSymbol(scaledIconSize)
            )}`,
          },
          zIndex,
        });
      }
      if (severalWarnings) {
        let sevIconSize = this.iconSize - 4 + 2 * MapView.prototype.zoomLevel;
        styles.push({
          image: {
            type: 'icon',
            anchor: [anchorOffset - numSymbols * 2 * halfImageWidth, 0.5],
            anchorXUnits: 'pixels',
            anchorYUnits: 'fraction',
            opacity: 1.0,
            rotation: 0,
            scale: baseScale + self.iconSize,
            size: [sevIconSize, sevIconSize],
            imgSize: [sevIconSize, sevIconSize],
            src: `data:image/svg+xml;base64,${base64.Base64.encode(
              '<svg width="' + sevIconSize + 'px" height="' + sevIconSize + 'px" viewBox="0 0 13 13" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <title>multiple-symbol</title> <desc></desc> <defs></defs> <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Symbols" transform="translate(-13.0, -13.0)"> <rect id="icon-bg" fill-opacity="0" fill="#E8E8E8" x="0" y="0" width="38" height="38" rx="100"></rect> <polygon id="fill-1" fill="#221F20" points="13.5111111 20.3336533 25.2895289 20.3336533 25.2895289 18.4669867 13.5111111 18.4669867"></polygon> <polygon id="fill-1" fill="#221F20" points="18.4669867 25.2895289 20.3336533 25.2895289 20.3336533 13.5111111 18.4669867 13.5111111"></polygon> </g> </g> </svg>'
            )}`,
          },
          zIndex,
        });
      }

      // Merge neighbour regions
      let neighbourDuplicate = false;
      const numWeatherSymbols = weatherSymbols.length;
      for (let j = 0; j < numWeatherSymbols; j++) {
        if (
          !self.equalSymbol(
            regionFeature.get('severity'),
            styles,
            weatherSymbols[j]
          )
        ) {
          continue;
        }
        self.model.collection.regions.forEach((region) => {
          region.set('visited', false);
        });
        if (checkConnection(region, styles, weatherSymbols[j])) {
          neighbourDuplicate = true;
          let weight = regionFeature.get('weight');
          if (weight == null || weight <= 0) {
            weight = 1;
          }
          let representative = [];
          let totalWeightOld = weatherSymbols[j].totalWeight;
          weatherSymbols[j].totalWeight = totalWeightOld + weight;
          [
            [0, 'X'],
            [1, 'Y'],
          ].forEach((coordItem) => {
            representative[coordItem[0]] = regionFeature.get(
              'representative' + coordItem[1]
            );
            weatherSymbols[j].center[coordItem[0]] =
              (weatherSymbols[j].center[coordItem[0]] * totalWeightOld +
                representative[coordItem[0]] * weight) /
              weatherSymbols[j].totalWeight;
          });
          weatherSymbols[j].representatives.push(representative);
          weatherSymbols[j].weights.push(weight);
          weatherSymbols[j].regions.push(region);
          let minIndex = self.getWeatherSymbolMinIndex(weatherSymbols[j]);
          if (minIndex >= 0) {
            weatherSymbols[j].geometry =
              weatherSymbols[j].representatives[minIndex];
          }
          neighbourDuplicate = true;
          break;
        }
      }
      if (!neighbourDuplicate) {
        let geometry = [
          regionFeature.get('representativeX'),
          regionFeature.get('representativeY'),
        ];
        let weight = regionFeature.get('weight');
        if (weight == null || weight <= 0) {
          weight = 1;
        }
        weatherSymbols.push({
          type: 'Point',
          geometry: geometry,
          center: geometry.slice(0),
          style: styles,
          severity: regionFeature.get('severity'),
          regions: [region],
          representatives: [geometry.slice(0)],
          weights: [weight],
          totalWeight: weight,
        });
      }
    });
    self.removeDuplicateSymbols(weatherSymbols);
    MapView.prototype.visualizer.addFeatures(
      'WeatherSymbols',
      self.projection,
      weatherSymbols
    );
    return this;
  },

  equalSymbol(severity, styles, symbol) {
    if (severity !== symbol.severity) {
      return false;
    }
    const numStyles = styles.length;
    if (
      typeof symbol.style === 'undefined' ||
      numStyles !== symbol.style.length
    ) {
      return false;
    }
    for (let i = 0; i < numStyles; i++) {
      if (styles[i].image.src !== symbol.style[i].image.src) {
        return false;
      }
    }
    return true;
  },

  getWeatherSymbolMinIndex(weatherSymbol) {
    let minDistance = Number.POSITIVE_INFINITY;
    let minIndex = -1;
    weatherSymbol.representatives.forEach((representative, index) => {
      let distance =
        Math.sqrt(
          Math.pow(weatherSymbol.center[0] - representative[0], 2) +
            Math.pow(weatherSymbol.center[1] - representative[1], 2)
        ) / weatherSymbol.weights[index];
      if (distance < minDistance) {
        minDistance = distance;
        minIndex = index;
      }
    });
    return minIndex;
  },

  removeDuplicateSymbols(weatherSymbols) {
    // Check final region duplicates
    let i = 0;
    loopWeatherSymbols: while (i < weatherSymbols.length) {
      let numRegions = weatherSymbols[i].regions.length;
      for (let j = i + 1; j < weatherSymbols.length; j++) {
        if (
          !this.equalSymbol(
            weatherSymbols[j].severity,
            weatherSymbols[j].style,
            weatherSymbols[i]
          )
        ) {
          continue;
        }
        for (let k = 0; k < numRegions; k++) {
          const regionModel = this.model.collection.regions.findWhere({
            region: weatherSymbols[i].regions[k],
          });
          let neighbours = regionModel.get('neighbours');
          let numNeighbours = neighbours.length;
          for (let l = 0; l < numNeighbours; l++) {
            let numJRegions = weatherSymbols[j].regions.length;
            for (let m = 0; m < numJRegions; m++) {
              if (neighbours[l] === weatherSymbols[j].regions[m]) {
                weatherSymbols[i].regions = weatherSymbols[i].regions.concat(
                  weatherSymbols[j].regions
                );
                weatherSymbols[i].representatives = weatherSymbols[
                  i
                ].representatives.concat(weatherSymbols[j].representatives);
                weatherSymbols[i].weights = weatherSymbols[i].weights.concat(
                  weatherSymbols[j].weights
                );
                let oldTotalWeight = weatherSymbols[i].totalWeight;
                weatherSymbols[i].totalWeight = weatherSymbols[
                  i
                ].weights.reduce((sum, item) => sum + item, 0);
                let minIndex = this.getWeatherSymbolMinIndex(weatherSymbols[i]);
                [0, 1].forEach((coordInd) => {
                  weatherSymbols[i].center[coordInd] =
                    (oldTotalWeight * weatherSymbols[i].center[coordInd] +
                      weatherSymbols[j].totalWeight *
                        weatherSymbols[j].center[coordInd]) /
                    weatherSymbols[i].totalWeight;
                });
                if (minIndex >= 0) {
                  weatherSymbols[j].geometry =
                    weatherSymbols[j].representatives[minIndex];
                }
                weatherSymbols.splice(j, 1);
                i = 0;
                continue loopWeatherSymbols;
              }
            }
          }
        }
      }
      i++;
    }
  },
});

export default MapLargeView;
