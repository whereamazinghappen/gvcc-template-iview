/* @Description 如下仅为vuex的使用示例，对于无复杂应用状态管理的应用极不推荐使用vuex
 * @Author: zhangyang 
 * @Date: 2020-05-28 10:34:42 
 * @Last Modified by: zhangyang
 * @Last Modified time: 2020-05-28 10:38:12
 */


import Vue from 'vue';
import Vuex from 'vuex';
 // 如下仅为vuex的使用示例，对于无复杂应用状态管理的应用极不推荐使用vuex
Vue.use(Vuex);
export default new Vuex.Store({
  state: {
    isLogin: false,
  },
  getters: {
    isLogin(state) {
      return state.isLogin;
    },
  },
  mutations: {
    setIsLogin(state, isLogin) {
      state.isLogin = isLogin;
    },
  },
});
