import { Browser, BrowserContext, chromium, Page } from 'playwright';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { setTimeout } from 'timers/promises';
import fs from 'fs'

const dataBaseUrl = process.env.VITE_TEST_DATA_DIRECTORY;
const htmlDir = '/html/';
const htmlExt = '-page.html'
const svgDir = '/svg/';
const svgExt = '-map.svg'
const libraryFile = 'index.js';

let years = process.env.VITE_TEST_YEARS.split(',');
let months = process.env.VITE_TEST_MONTHS.split(',').map((month) => month.padStart(2, '0'));
let days = process.env.VITE_TEST_DAYS.split(',').map((day) => day.padStart(2, '0'));

if (years.length === 0) {
	years = Array.from({length: new Date().getFullYear() - 2020}, (_, i) => i + 2021);	
}
if (months.length === 0) {
	months = Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0'));
}
if (days.length === 0) {
	days = Array.from({length: 31}, (_, i) => (i + 1).toString().padStart(2, '0'));
}

let dataTimes = [];

const htmlTemplate = `<!doctype html>
<html lang="fi">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
    <title>SmartMet Alert Client</title>
    <script type="module" crossorigin src="./index.js"></script>
  </head>

  <body>
    <smartmet-alert-client language="fi" current-date="CURRENT_DATE" warnings='{"weather_update_time":WEATHER_UPDATE_TIME,"flood_update_time":FLOOD_UPDATE_TIME,"weather_finland_active_all":WEATHER_DATA,"flood_finland_active_all":FLOOD_DATA}'></smartmet-alert-client>  
  </body>
</html>`;

describe("The warnings map", () => {
  let page: Page;
  let browser: Browser;
  let context: BrowserContext;

  fs.mkdirSync(`${__dirname}${svgDir}`, { recursive: true });
  const htmlPath = `${__dirname}${htmlDir}`;
  fs.mkdirSync(htmlPath, { recursive: true });
  fs.copyFileSync(`${__dirname}/../dist/${libraryFile}`, `${htmlPath}${libraryFile}`);

  console.log(`Preparing data for regression tests, please wait.`);
  for (const year of years) {
    for (const month of months) {
      for (const day of days) {
        const subDirs = year + '/' + month + '/' + day + '/';
        
        const dataPath = dataBaseUrl + subDirs;
        try {
          const dataFiles = fs.readdirSync(dataPath);
          const uniqDataTimes = new Set()
          for (const dataFile of dataFiles) {
            const uniqDataTime = dataFile.slice(0, 14);
            uniqDataTimes.add(uniqDataTime);
          }
          const newDataTimes = Array.from(uniqDataTimes);
          newDataTimes.sort();
          for (const dataTime of newDataTimes) {           
            const dateInput = dataTime.slice(0,4) + '-' + dataTime.slice(4,6) + '-' + dataTime.slice(6,8) + 'T'
              + dataTime.slice(8,10) + ':' + dataTime.slice(10,12) + ':' + dataTime.slice(12,14) + 'Z';
            const date = new Date(dateInput)
            const dateOutput = date.toISOString()

            let html = String(htmlTemplate);
            html = html.replace('CURRENT_DATE', dateOutput);

            const weatherUpdateTimeFile = dataPath + dataTime + '-weather_update_time.json';
            const floodUpdateTimeFile = dataPath + dataTime + '-flood_update_time.json';
            const weatherDataFile = dataPath + dataTime + '-weather_finland_active_all.json';
            const floodDataFile = dataPath + dataTime + '-flood_finland_active_all.fi.json';

            const weatherUpdateTime = fs.readFileSync(weatherUpdateTimeFile, "utf8");
            const floodUpdateTime = fs.readFileSync(floodUpdateTimeFile, "utf8");
            const weatherData = fs.readFileSync(weatherDataFile, "utf8");
            const floodData = fs.readFileSync(floodDataFile, "utf8");

            html = html.replace('WEATHER_UPDATE_TIME', weatherUpdateTime);
            html = html.replace('FLOOD_UPDATE_TIME', floodUpdateTime);
            html = html.replace('WEATHER_DATA', weatherData);
            html = html.replace('FLOOD_DATA', floodData);

            fs.writeFileSync(`${htmlPath}${dataTime}${htmlExt}` , html);             
          }
          dataTimes = dataTimes.concat(newDataTimes)
        } catch (error) {
          console.log(error);
          continue;
        }
      }
    }
  }

  beforeEach(async () => {
    browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
    let browserContext = await browser.newContext();
    page = await browserContext.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });
 
  for (const dataTime of dataTimes) {
    it(`is changeless at ${dataTime}`, async () => {
      await page.goto(`file:${__dirname}${htmlDir}${dataTime}${htmlExt}`);
      const html = await page.content()
      const result = await page.locator("svg#finland-large");
      const svg = await result.evaluate((el) => el.outerHTML);
      expect(svg).toMatchFileSnapshot(`${__dirname}${svgDir}${dataTime}${svgExt}`);
    });
  }

});
