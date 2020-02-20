Smart Alert Client is a customizable map visualizer for weather, flood and other alerts.

####Compiling

Configuration files:
`js/config/*/*.toml`

Fully minified production build:
`npm install`
`npm run build-production`

Fully minified testing build:
`npm install`
`npm run build-testing`

Faster development build (with single locale 'fi' only, debug enabled):
`npm install`
`npm run build-development`

Faster local build (with single locale 'fi' only, debug enabled):
`npm install`
`npm run build-local`

Build all:
`npm install`
`npm run build-all`

####Usage

Create a new instance of the English version:

`var smartAlertClient = new fmi.en.SmartAlertClient(options);`

Other compiled language version are `fi` (Finnish) and `sv` (Swedish). 

####Public API methods

`refresh(force=true, day, callbacks={})`
Reload and refresh page content. Also, starts automatic refreshing in configured time interval.

`stop()`
Stop automatic refreshing started in the refresh function. Does not remove current content.

`empty()`
Empty page content. Does not remove wrapping element itself, only its content. Removes page content related event handlers. Stops automatic refresh.

`selectDay(day)`
Select specific day. Current date is 0.

`setUrls(dataURLObject)`
Sets custom data URLs for `geom`, `woml`, `womlTime`, `cap` and `capTime` properties.
