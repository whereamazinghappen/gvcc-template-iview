<template>
    <div class="home-left-nav-box">
      <!-- left-nav start -->
      <div :style="{'backgroundColor': appConfig.leftnavBgcolor}" id="left-nav">
        <div id="nav-header">
          <img :src="appConfig.logoImage" id="logo-img"></img>
          <span id="logo-title">{{appConfig.appName}}</span>
        </div>
        <div id="nav-content">
          <Menu ref="menu" width="auto" theme="dark" :open-names="[$route.meta.moduleName]" :active-name="$route.name" :accordion="true">
          <Submenu 
            :key="index" 
            :name="submenu.name"
            v-for="(submenu, index) in menuData.filter((item) => item.visible)" >
            <template slot="title">
                <Icon :type="submenu.icon" />
                {{ submenu.title }}
            </template>
            <MenuItem
              :key="index"
              v-for="(menu, index) in submenu.children.filter((item) => item.visible)"
              :to="menu.path"
              :data-id="menu.meta"
              :name="menu.name">
              <Icon :type="menu.icon" />{{ menu.title }}
            </MenuItem>
          </Submenu>
          </Menu>
        </div>
        <div id="nav-footer"></div>
      </div>
      <!-- left-nav end -->
    </div>
</template>

<script>
import appConfig from '@/config/app.config.js';
import menuData from '../../util/createMenu.js';
export default {
  name: 'leftnav',
  data() {
    return {
      appConfig,
      menuData
    };
  },
  methods: {
    // 默认跳转到排序后的当前模块的第一个页面 redirectToFirstPage
    // redirectToFirstPage() {
    //   const pageData = this.menuData;
    //   const modalName = this.$route.meta.modalName;
    //   const firstPage = pageData.filter((item) => {
    //     return item.name === modalName
    //   })
    //   if (firstPage.length && firstPage[0].children.length) {
    //     let path = firstPage[0].children[0].path;
    //     if (path !== this.$route.path) {
    //       this.$router.push(path);
    //     }
    //   }      
    // },

  },
  created() {
  },
  mounted() {
    // this.redirectToFirstPage();
  },
};
</script>

<style lang="stylus">
#left-nav
 position relative
 width 250px
 height 100vh
 box-sizing border-box
 border-right: 1px solid #dcdee2
 #nav-header
  display flex
  align-items center
  padding 5px 20px
 #logo-img
  display inline-block
  width 50px
  height 50px
  vertical-align middle
 #logo-title
  color rgba(255, 255, 255, 0.8)
  display inline-block
  font-size 22px
  font-weight bolder
  &.lightbg
   color #1890ff
 #nav-content
  color rgba(255, 255, 255, 0.7)
  .ivu-menu-nobg, .ivu-menu-dark
   background-color transparent
   color rgba(255, 255, 255, 0.7)
   .ivu-menu-item, .ivu-menu-submenu-title
    color rgba(255, 255, 255, 0.7)
    background-color transparent
   .ivu-menu-opened
    background-color transparent
    color #ffffff
   .ivu-menu-item:hover,.ivu-menu-item-active,.ivu-menu-submenu-title:hover
    background-color transparent
    color #ffffff
    &::after
     content none
  .menu-icon-image
   width 12px
   height 12px
   &::after
    content none
  #nav-items
   width 100px
   margin 60px auto 0
   .nav-item
    cursor pointer
    height 60px
    line-height 60px
    text-align left
    font-size 18px
    &.active,&:hover
     color #ffffff
    .nav-name
     padding-left 5px
</style>
