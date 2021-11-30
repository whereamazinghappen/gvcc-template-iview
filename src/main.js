import Vue from 'vue';
import iView from 'iview';
import { directive as clickOutside } from 'v-click-outside-x';
import App from './App.vue';
import router from './router';
import store from './store';
import 'iview/dist/styles/iview.css';
//axios配置
import './api/axios.config';
Vue.config.productionTip = false;
Vue.use(iView);
/**
 * 注册指令
 */
Vue.directive('clickOutside', clickOutside);

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
