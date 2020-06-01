import Vue from 'vue';
import Router from 'vue-router';
import menuData from './util/createMenu.js';

Vue.use(Router);

let routes = [];

// 动态生成路由配置
// TODO ------------------- 重定向到404，403，405等页面
routes = menuData.map((submenu) => {
  submenu.component = submenu.visible ? () => import('./pages/' + submenu.name + '/index.vue') : null;
  submenu.meta = { moduleName: submenu.name };
  submenu.redirect = submenu.children.length ? submenu.children[0].path : '';
  submenu.children = submenu.children.map((menu) => {
    menu.component = () => import('./pages/' + submenu.name + '/' + menu.name + '.vue');
    menu.meta = { moduleName: submenu.name };
    return menu;
  });
  return submenu;
})

// 默认加载的路由页面为第一个 default page is first page
const defaultRouter = new Object({
  path: '/',
  redirect: routes[0].path,
});

routes.unshift(defaultRouter);
export default new Router({
  mode: 'history',
  routes,
});
