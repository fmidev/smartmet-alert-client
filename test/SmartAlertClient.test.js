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
  serverListener.close(() => {
    done();
  });
});

describe('Smart Alert Client', () => {
  it('Test sets render correctly in Chromium', async () => {
    browser = await playwright.chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.setViewportSize({
      width: 1000,
      height: 3000,
    });
    let element;
    let image;
    /* eslint-disable no-await-in-loop */
    for (let i = 1; i <= 8; i++) {
      await page.goto(`file:${path.join(__dirname, `set-${i}.html`)}`);
      await page.waitForSelector('#fmi-warnings-list');
      element = await page.$('#fmi-warnings');
      image = await element.screenshot();
      expect(image).toMatchImageSnapshot({
        customSnapshotIdentifier: `set-${i}`,
      });
    }
    /* eslint-enable no-await-in-loop */
  });
});
