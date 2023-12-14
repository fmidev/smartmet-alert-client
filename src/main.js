import bootstrapStyle from 'bootstrap/dist/css/bootstrap.min.css?inline'
import {
  createApp,
  defineCustomElement as VueDefineCustomElement,
  getCurrentInstance,
  h,
} from 'vue'
import { createWebComponent } from 'vue-web-component-wrapper'

import app from './App.vue'
import { pluginsWrapper } from './plugins'

createWebComponent({
  rootComponent: app,
  elementName: 'smartmet-alert-client',
  plugins: pluginsWrapper,
  cssFrameworkStyles: [bootstrapStyle],
  VueDefineCustomElement,
  h,
  createApp,
  getCurrentInstance,
})
