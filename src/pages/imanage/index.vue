
/*
 * @Author: zhangyang
 * @Date: 2019-07-30 17:46:55
 * @Last Modified by: zhangyang
 * @Last Modified time: 2020-05-28 12:49:24
 */
<template>
<div>
  <div class="gvcc-container">
    <!-- 左侧导航 -->
    <div id="left-nav-container">
      <left-nav></left-nav>
    </div>
    <div id="right-content">
      <!-- 头部 -->
      <div id="header-top-container">
        <header-top></header-top>
      </div>
      <div class="gvcc-views-container">
        <router-view/>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import LeftNav from '@/components/common/LeftNav.vue';
import HeaderTop from '@/components/common/HeaderTop.vue';

export default {
  name: 'Gvcc',
  components: {
    LeftNav, HeaderTop,
  },
};
</script>

<style lang="stylus" scoped>
#left-nav-container
 position fixed
 left 0
 top 0
#right-content
 display inline-block
 padding-left 250px
 width 100%
 height 100vh
 .gvcc-views-container
  height 100%
  padding 10px
</style>
