'use strict';

var fi = fi || {};
fi.fmi = fi.fmi || {};
fi.fmi.metoclient = fi.fmi.metoclient || {};
fi.fmi.metoclient.ui = fi.fmi.metoclient.ui || {};
fi.fmi.metoclient.ui.animator = fi.fmi.metoclient.ui.animator || {};
fi.fmi.metoclient.ui.animator.fmiwarnings = fi.fmi.metoclient.ui.animator.fmiwarnings || {};

fi.fmi.metoclient.ui.animator.fmiwarnings.Config = {
    map: {
        model: {
            layers: []
        },
        view: {
            container: 'fmi-animator',
            projection: 'EPSG:3067',
            defaultMinZoom: 0,
            defaultMaxZoom: 15,
            defaultCenterLocation: [
                389042,
                6673664
            ],
            defaultCenterProjection: 'EPSG:3067',
            defaultZoomLevel: 5,
            extent: [
                50199.4814,
                6582464.0358,
                761274.6247,
                7799839.8902
            ],
            maxAsyncLoadCount: 5,
            asyncLoadDelay: 10,
            staticControls: false,
            showLayerSwitcher: true,
            showLegend: true,
            mapContainer: 'fmi-animator-map',
            legendContainer: 'fmi-animator-legend',
            spinnerContainer: 'fmi-animator-spinner',
            showLoadProgress: false,
            showMarker: false,
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
                altShiftDragRotate: false
            }
        }
    },
    time: {
        model: {
            autoStart: false,
            autoReplay: true,
            refreshInterval: 600000,
            frameRate: 500,
            resolutionTime: 3600000
        },
        view: {
            timeSliderContainer: 'fmi-animator-timeslider',
            timeZoneLabel: '',
            playImagePath: '../img/play.png',
            pauseImagePath: '../img/pause.png',
            imageWidth: 55,
            imageHeight: 55,
            imageBackgroundColor: '#585858',
            imageHoverColor: '#686868',
            sliderOffset: 55,
            sliderHeight: 55,
            statusHeight: 12,
            tickTextColor: '#000000',
            pastColor: '#B2D8EA',
            futureColor: '#D7B13E',
            tickColor: '#FFFFFF',
            notLoadedColor: '#585858',
            loadingColor: '#94BFBF',
            loadedColor: '#94BF77',
            loadingErrorColor: '#9A2500',
            tickHeight: 24,
            tickTextYOffset: 18,
            tickTextSize: 12,
            pointerHeight: 30,
            pointerTextOffset: 15,
            pointerColor: '#585858',
            pointerStrokeColor: '#FFFFFF',
            pointerTextColor: '#D7B13E',
            pointerTextSize: 12
        }
    }
};