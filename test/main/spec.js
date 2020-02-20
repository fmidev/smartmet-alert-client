describe('Warnings view', function() {
  beforeAll(function(done) {
    browser.url('https://ilmatieteenlaitos.fi/varoitukset').call(done);
  });

  afterAll(function(done) {
    browser.end(done);
  });

  it('should show the map', function(done) {
    expect(browser.isVisible('.load-data-failed-text')).toBe(false);
    expect(browser.waitForVisible('#day-map-large', 30000)).toBe(true);
  });
});
