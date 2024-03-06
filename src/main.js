import { createApp } from 'vue'
import App from './App.vue'

class SmartMetAlertClient extends HTMLElement {
  constructor() {
    super()
    const app = createApp(
      App,
      [...this.attributes].reduce((newObject, item) => {
        newObject[item.nodeName] = item.nodeValue
        return newObject
      }, {})
    )
    app.mount(this.attachShadow({ mode: 'open' }))
  }
}

customElements.define('smartmet-alert-client', SmartMetAlertClient)
