const path = require('path');
const jsonServer = require('json-server');
const { toMatchImageSnapshot } = require('jest-image-snapshot');
const glob = require('glob');

const TIMEOUT = 60000;
const VIEWPORT_WIDTH = 1000;
const VIEWPORT_HEIGHT = 3000;
const MATCH_THRESHOLD = 2;
const FILE_NAMES = glob.sync(path.join(__dirname, '/html/*.html')).sort();
const BROWSERS = ['chromium'];

let serverListener;

expect.extend({ toMatchImageSnapshot });

beforeAll(async (done) => {
  jest.setTimeout(TIMEOUT);
  const server = jsonServer.create();
  const router = jsonServer.router(`${path.join(__dirname, 'db.json')}`);
  const middlewares = jsonServer.defaults();
  server.use(middlewares);
  server.use(router);
  serverListener = server.listen(8088, () => {
    done();
  });
});

afterAll(async (done) => {
  serverListener.close(() => {
    done();
  });
});

for (const browserName of BROWSERS) {
  describe('SmartMet Alert Client', () => {
    beforeAll(async () => {
      await page.setViewport({
        width: VIEWPORT_WIDTH,
        height: VIEWPORT_HEIGHT,
      });
      page.on('error', (err) => {
        console.log('error happen at the page: ', err);
      });
      page.on('pageerror', (pageerr) => {
        console.log('pageerror occurred: ', pageerr);
      });
    });

    for (const fileName of FILE_NAMES) {
      const testCase = `${fileName.split('/').pop().split('.').shift()}`;
      it(`renders ${testCase} correctly in ${browserName}`, async () => {
        await page.goto(`file:${fileName}`);
        await page.waitForSelector('#fmi-warnings-list', {
          visible: true,
        });
        const element = await page.$('#fmi-warnings');
        const image = await element.screenshot();
        expect(image).toMatchImageSnapshot({
          customSnapshotIdentifier: `${browserName}-${testCase}`,
          failureThreshold: MATCH_THRESHOLD,
        });
      });
    }
  });
}
