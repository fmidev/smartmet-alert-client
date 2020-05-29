const path = require('path');
const jsonServer = require('json-server');
const { toMatchImageSnapshot } = require('jest-image-snapshot');
const playwright = require('playwright');

expect.extend({ toMatchImageSnapshot });

jest.setTimeout(60000);
const server = jsonServer.create();
const router = jsonServer.router(`${path.join(__dirname, 'db.json')}`);
const middlewares = jsonServer.defaults();
server.use(middlewares);
server.use(router);
const serverListener = server.listen(8088, () => {
  console.log('JSON Server is running');
});

let browser;
afterAll(async (done) => {
  await browser.close();
  serverListener.close(function() {
    done();
  });
});

describe('Smart Alert Client', () => {
  it('renders correctly in Chromium', async () => {
    browser = await playwright['chromium'].launch()
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.setViewportSize({
      width: 1000,
      height: 3000,
    });
    await page.goto(`file:${path.join(__dirname, 'index.html')}`);
    await page.waitForSelector('#day-map-large .ol-viewport');
    const element = await page.$('#fmi-warnings');
    const image = await element.screenshot();
    expect(image).toMatchImageSnapshot();
  });
});
