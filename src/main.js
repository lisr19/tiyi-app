// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Mint from 'mint-ui';
import store from './store'
import {Select,Option,Timeline,TimelineItem,Icon,Modal,Upload,RadioGroup,Radio} from 'iview'
import ECharts from 'echarts'
import 'iview/dist/styles/iview.css'
import * as socketApi from './libs/socket'

Vue.use(Mint);
Vue.use(ECharts);
Vue.prototype.$echarts = ECharts
Vue.prototype.socketApi = socketApi
Vue.config.productionTip = false

Vue.component('Select',Select)
Vue.component('Option',Option)
Vue.component('Timeline',Timeline)
Vue.component('TimelineItem',TimelineItem)
Vue.component('Icon',Icon)
Vue.component('Modal',Modal)
Vue.component('Upload',Upload)
Vue.component('RadioGroup',RadioGroup)
Vue.component('Radio',Radio)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
