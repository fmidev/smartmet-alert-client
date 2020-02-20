var fs = require('fs');
var TIMEOUT_SHORT = 10000;
var TIMEOUT_LONG = 60000;

function loadScript(source, callback) {
  var head = document.getElementsByTagName('head')[0];
  var scripts = head.getElementsByTagName('script');
  var found = false;
  for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].src === source) {
      found = true;
      break;
    }
  }
  if (!found) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    if (script.readyState) {
      //IE
      script.onreadystatechange = function() {
        if (
          script.readyState === 'loaded' ||
          script.readyState === 'complete'
        ) {
          script.onreadystatechange = null;
          callback();
        }
      };
    } else {
      //Others
      script.onload = callback;
    }
    script.src = source;
    head.appendChild(script);
  }
}

function unleashGremlins(ttl, callback) {
  function stop() {
    horde.stop();
    callback();
  }
  var horde = window.gremlins.createHorde();
  horde.seed(1234);
  horde.after(callback);
  window.onbeforeunload = stop;
  setTimeout(stop, ttl);
  horde.unleash();
}

browser.waitForReadyStateEx = function(state, timeout) {
  return browser.waitUntil(function() {
    return (
      state ===
      browser.execute(function() {
        return document.readyState;
      }).value
    );
  }, timeout);
};

describe('When Monkey testing with gremlins', function() {
  it('it should not raise any error', function() {
    browser.url('https://ilmatieteenlaitos.fi/varoitukset');
    browser.waitForReadyStateEx('complete', TIMEOUT_SHORT);
    // Now load your gremlins
    browser.timeouts('script', TIMEOUT_SHORT);
    browser.executeAsync(
      loadScript,
      'https://rawgithub.com/marmelab/gremlins.js/master/gremlins.min.js'
    );
    // Todo: Use locally:
    // browser.executeAsync(loadScript, './node_modules/clickup-gremlins.js/gremlins.min.js');
    browser.logger.info('Gremlins loaded');
    // And unleash them
    browser.timeouts('script', TIMEOUT_LONG);
    browser.executeAsync(unleashGremlins, TIMEOUT_LONG - TIMEOUT_SHORT);
    var browserLog = browser.log('browser');
    console.info(browserLog);
    fs.writeFileSync('./test/monkey/browser.log', JSON.stringify(browserLog));
  });
});
