import '@babel/polyfill'
import 'mutationobserver-shim'

import Vue from 'vue'

import App from './App.vue'
import i18n from './i18n'
import store from './store'

new Vue({
  store,
  i18n,
  render: (h) => h(App),
}).$mount('#app')
