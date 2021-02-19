const { readFileSync } = require('fs');
const { toMatchImageSnapshot } = require('jest-image-snapshot');
const replaceAll = require('string.prototype.replaceall');
const svg64 = require('svg64');
const data = require('./data/db.json');

const TEST_DATES = [
  '2020-05-27T13:18:42Z',
  '2020-09-04T08:35:43Z',
  '2020-09-03T12:26:11Z',
  '2020-09-04T14:35:44Z',
  '2020-09-12T05:28:21Z',
  '2020-09-14T09:24:42Z',
  '2020-09-16T08:04:36Z',
  '2020-09-22T07:36:42Z',
  '2020-05-27T13:18:42Z',
  '2020-10-28T06:30:04Z',
  '2020-10-26T06:28:42.734Z',
  '2020-11-19T06:42:22.857Z',
  '2020-11-19T07:18:01.236Z',
  '2020-09-04T08:35:43.746Z',
  '2020-11-19T15:34:43.726Z',
  '2021-01-11T20:31:59.375Z',
];
const TIMEOUT = 60000;
const VIEWPORT_WIDTH = 1000;
const VIEWPORT_HEIGHT = 3000;
const MATCH_THRESHOLD = 2;
const BROWSERS = ['chromium'];
const LANGUAGE = 'fi';

let css = readFileSync('./dist/SmartMetAlertClient.css', 'utf8');
const matches = css.matchAll(/background-image:url\(img\/(.*?).svg\)/g);
const svgImages = Array.from(matches, (x) => `img/${x[1]}.svg`);
svgImages.forEach((svgImage) => {
  const svg = readFileSync(`./dist/${svgImage}`, 'utf-8');
  const dataUrl = svg64(svg);
  css = replaceAll(css, svgImage, `'${dataUrl}'`);
});

const vue = readFileSync('./test/lib/vue.js', 'utf8');
const smartMetAlertClient = readFileSync('./dist/SmartMetAlertClient.umd.js', 'utf8');

jest.setTimeout(TIMEOUT);

expect.extend({ toMatchImageSnapshot });

const getHtml = (index, language, date) => `<!DOCTYPE html>
<html lang="${language}">
  <head>
    <meta charset="utf-8">
    <title>SmartMet Alert Client Test ${index}</title>
    <script>${vue}</script>
    <script>${smartMetAlertClient}</script>
    <style>${css}</style>
  </head>
  <body>
    <div id="test"></div>
    <script>
      new Vue({
        el: '#test',
        render: function(h) {
          return h(SmartMetAlertClient, {
            props: {
              currentDate: '${date}',
              warnings: {
                weather_update_time: ${JSON.stringify(data[`womlTime-${index}.json`])},
                weather_finland_active_all: ${JSON.stringify(data[`woml-${index}.json`])},
                flood_update_time: ${JSON.stringify(data[`capTime-${index}.json`])},
                flood_finland_active_all: ${JSON.stringify(data[`cap-${index}.json`])}
              },
              language: '${language}'
            }
          });
        }
      });
    </script>
  </body>
</html>`;

const renderHtml = async (html) => {
  page.setContent(html);
  await page.waitForSelector('#fmi-warnings-list', {
    visible: true,
  });
  const element = await page.$('#fmi-warnings');
  return element.screenshot();
};

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

    for (let i = 1; i <= TEST_DATES.length; i++) {
      const testCase = `set-${(`00000${i}`).substr(-5)}`;
      const html = getHtml(i, LANGUAGE, TEST_DATES[i - 1]);
      it(`renders ${testCase} correctly in ${browserName}`, async () => {
        const image = await renderHtml(html);
        expect(image).toMatchImageSnapshot({
          customSnapshotIdentifier: `${browserName}-${testCase}`,
          failureThreshold: MATCH_THRESHOLD,
        });
      });
    }
  });
}
