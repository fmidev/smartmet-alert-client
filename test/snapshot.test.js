import fs, { readFileSync, writeFileSync } from 'fs'
import { JSDOM } from 'jsdom'
import path from 'path'
import { expect, it } from 'vitest'
import Vue from 'vue'
import { createRenderer } from 'vue-server-renderer'
import format from 'xml-formatter'
import XMLHttpRequest from 'xmlhttprequest-ssl'

import SmartMetAlertClient from '../dist/SmartMetAlertClient.umd'

global.XMLHttpRequest = XMLHttpRequest

const dateTimes = new Set()

const getAllDateTimes = function (dirPath) {
  const files = fs.readdirSync(dirPath)
  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      getAllDateTimes(dirPath + '/' + file)
    } else {
      const parts = file.split('-')
      if (parts.length > 0 && parts[0].length === 14) {
        dateTimes.add(parts[0])
      }
    }
  })
}

getAllDateTimes(import.meta.env.VITE_DATA_DIRECTORY)

const data = Array.from(dateTimes)
  .sort()
  .map((dateTime) => {
    const basePath =
      import.meta.env.VITE_DATA_DIRECTORY +
      path.sep +
      dateTime.substr(0, 4) +
      path.sep +
      dateTime.substr(4, 2) +
      path.sep +
      dateTime.substr(6, 2) +
      path.sep +
      dateTime +
      '-'

    return {
      dateTime,
      weatherUpdateTime: `${basePath}weather_update_time.json`,
      floodUpdateTime: `${basePath}flood_update_time.json`,
      weatherFinlandActiveAll: `${basePath}weather_finland_active_all.json`,
      floodFinlandActiveAll: `${basePath}flood_finland_active_all.fi.json`,
    }
  })

for (let i = 0; i < data.length; i++) {
  const weatherUpdateTime = JSON.parse(
    readFileSync(data[i].weatherUpdateTime, 'utf8')
  )

  const floodUpdateTime = JSON.parse(
    readFileSync(data[i].floodUpdateTime, 'utf8')
  )

  const weatherFinlandActiveAll = JSON.parse(
    readFileSync(data[i].weatherFinlandActiveAll, 'utf8')
  )

  const floodFinlandActiveAll = JSON.parse(
    readFileSync(data[i].floodFinlandActiveAll, 'utf8')
  )

  const renderer = createRenderer({
    template: (result) => `<!DOCTYPE html>
    <html lang="en">
      <head><link rel="stylesheet" href="./dist/SmartMetAlertClient.css"></head>
      <body>${result}</body>
    </html>
    `,
  })

  it(`renders warning map ${data[i].dateTime}`, async () => {
    const vm = new Vue({
      el: '#app',
      render(h) {
        return h(SmartMetAlertClient, {
          props: {
            language: 'fi',
            currentDate: [
              weatherUpdateTime.features[0].properties.update_time,
              floodUpdateTime.features[0].properties.update_time,
            ]
              .sort()
              .reverse()[0],
            warnings: {
              weather_update_time: weatherUpdateTime,
              weather_finland_active_all: weatherFinlandActiveAll,
              flood_update_time: floodUpdateTime,
              flood_finland_active_all: floodFinlandActiveAll,
            },
          },
        })
      },
    })

    const html = await renderer.renderToString(vm)
    const dom = new JSDOM(html)
    const element = dom.window.document.getElementById('finland-large')
    const svg = format(element.outerHTML)
    writeFileSync(`./test/svg/${data[i].dateTime}.svg`, svg)
    expect(svg).toMatchSnapshot()
  })
}
