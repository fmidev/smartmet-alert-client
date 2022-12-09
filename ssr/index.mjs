import fs from 'fs'
import Vue from 'vue'
import { createRenderer } from 'vue-server-renderer'
import XMLHttpRequest from 'xmlhttprequest-ssl'

import SmartMetAlertClient from '../dist/SmartMetAlertClient.umd'

global.XMLHttpRequest = XMLHttpRequest

const renderer = createRenderer({
  template: (result) => `<!DOCTYPE html>
    <html lang="en">
      <head><link rel="stylesheet" href="./dist/SmartMetAlertClient.css"></head>
      <body>${result}</body>
    </html>
    `,
})
const vm = new Vue({
  el: '#app',
  render(h) {
    return h(SmartMetAlertClient, {
      props: {
        language: 'fi',
      },
    })
  },
})

renderer
  .renderToString(vm)
  .then((html) => {
    fs.writeFile('out.html', html, (err) => {
      if (err) {
        return console.error(err)
      }
    })
  })
  .catch((err) => {
    console.error(err)
  })
