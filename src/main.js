import '@babel/polyfill'
import 'mutationobserver-shim'

import Vue from 'vue'

import App from './App.vue'

new Vue({
  render: (h) => h(App),
}).$mount('#app')
