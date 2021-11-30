/*
 * @Author: zhangyang
 * @Date: 2019-08-09 09:07:56
 * @Last Modified by: zhangyang
 * @Last Modified time: 2020-08-11 17:19:06
 */
import axios from 'axios';
import store from '../store';
import bus from '../util/bus'

axios.defaults.withCredentials = true;
export const URLCONFIG = {
  baseUrl: '/',
};
axios.interceptors.request.use(
  (config) => {
    const newconfig = config;
    // config.headers.Authorization = `Bearer ${localStorage.getItem('token')}` || '';
    if (config.url.indexOf('http://') > -1) {
      newconfig.url = config.url;
    } else {
      newconfig.url = URLCONFIG.baseUrl + config.url;
    }
    return newconfig;
  },
  err => Promise.reject(err),
);

axios.interceptors.response.use(
  (response) => {
    if (response.data && response.data.code === '702') {
      store.commit('setIsLogin', false);
    } else {
      return response;
    }
  },
  (error) => {
    bus.$emit('axiosError', error);
  }
);
