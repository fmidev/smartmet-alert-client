import {
  createApp,
  defineCustomElement as VueDefineCustomElement,
  getCurrentInstance,
  h,
} from 'vue'
import { createWebComponent } from 'vue-web-component-wrapper'
import app from './App.vue'

createWebComponent({
  rootComponent: app,
  elementName: 'smartmet-alert-client',
  VueDefineCustomElement,
  h,
  createApp,
  getCurrentInstance,
})
