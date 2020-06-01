// 用户自定义配置文件
import appConfig from '@/config/app.config.js';
// 使用webpack根据约定的目录结构自动生成菜单的配置信息
const webpackContextmodule = require.context('../pages', true, /.vue/);
const submenus = new Set();
const menus = new Set();
webpackContextmodule.keys().forEach((item) => {
  const filePathArray = item.split('/');
  const moduleName = filePathArray[1];
  const pageName = filePathArray[2].replace('.vue', '');
  if(item.indexOf('index') > -1) {
    submenus.add(moduleName);
  } else {
    menus.add(moduleName+ '/' + pageName);
  } 
})
let menuData = [];
submenus.forEach((submenu) => {
  const sub = {
    name: submenu,
    title: submenu,
    icon: 'md-cube',
    visible: true,
    children: [],
    path: '/' + submenu,
  }
  menus.forEach((menu) => {
    const submenuName = menu.split('/')[0];
    const menuName = menu.split('/')[1];
    if (submenuName === submenu) {
      sub.children.push({
        name: menuName,
        path: '/' + menu.toLocaleLowerCase(),
        title: menuName,
        icon: 'md-help-circle',
        visible: true,        
      })
    }
  })
  menuData.push(sub);
})

// 合并webpack根据目录生成的配置和用户自定义配置 merge config
menuData = menuData.map((submenu) => {
  mergePages(submenu, appConfig.pages);
  submenu.children.map((menu)=> {
    mergePages(menu, appConfig.pages);
    return menu;
  })
  return submenu;
});
// 根据name相同用自定义配置覆盖默认配置 merge config
function mergePages(defaultdata, configdata) {
  configdata.forEach((item) => {
    if (defaultdata.name === item.name) {
      Object.assign(defaultdata, item);
    }
  })
}
// 根据用户自定义配置对菜单进行排序 sort menu
!function sortPages(pageData){
  if (pageData.length > 1) {
    pageData = pageData.sort((a, b) => {
      a.children = a.children.sort((c, d) => {
        return c.sort - d.sort;
      });
      b.children = b.children.sort((c, d) => {
        return c.sort - d.sort;
      });
      return a.sort - b.sort;
    });
  } else {
    pageData = pageData.map((item) => {
      item.children = item.children.sort((c, d) => {
        return c.sort - d.sort;
      });
      return item;
    });
  }
}(menuData)
export default menuData