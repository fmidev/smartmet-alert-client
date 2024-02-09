var fs = require('fs-extra');
const { chromium } = require("playwright");
const timers = require("node:timers/promises");

let browser = null;
const url = "";

(async () => {
  browser = await chromium.launch();
  let page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto(url);

  await timers.setTimeout(5000);
  await page.screenshot({ path: `./pic-${(new Date()).toISOString()}.png` });

  const html = await page.content()
  const result = await page.locator("svg#finland-large");
  const text = await result.evaluate((el) => el.outerHTML);

  await result.screenshot({ path: `./map-${(new Date()).toISOString()}.png` });
  
  console.log(text);

  await browser.close();
})();
