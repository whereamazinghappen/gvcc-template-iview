<template>
  <div class="hello-world-container">
    <div class="logo-coontainer">
      <img class="logo-image" :src="require('@/assets/images/logo.jpg')" alt="">
    </div>
    <div class="logo-title">
      <h1>Gvcc-cli</h1>
    </div>
    <div class="slogan">
      <h2>基于vue-cli的更快速的中后台项目开发工具</h2>
    </div>
    <div class="feature">
      <div class="feature-item">
        <div class="item-title">快速开发</div>
        <div class="item-content">
          使用gvcc init app-name命令, 一键生成项目模板，项目模板中基于vue-cli生成的更丰富的目录结构，自动引入vuex和vue-router的使用。
        </div>
      </div>
      <div class="feature-item">
        <div class="item-title">代码生成</div>
        <div class="item-content">
          在生成的模板基础上，使用gvcc add moduleName pageName 命令自动生成crud页面代码，也可使用ui界面工具自动生成代码,自动挂载路由，导航自动生成等。
        </div>
      </div>
      <div class="feature-item">
        <div class="item-title">基础业务组件</div>
        <div class="item-content">模板内默认引入ui组件库(iview或elemente可选),并且包含login,crud,curd-tree,selectTree等基础业务逻辑组件。</div>
      </div>
    </div>
    <div class="get-start">
      <pre><var>安装：</var>
<code>npm i -g gvcc-cli</code>
      </pre>
      <pre><var>初始化：</var>
<code>gvcc init app-name</code>
      </pre>
      <pre><var>更多&帮助：</var>
<code>gvcc --help</code></pre>
        
      
    </div>
  </div>
</template>

<script>
export default {
  name: 'Hello'
}
</script>

<style lang="stylus" scoped>
.hello-world-container
 height 100%
 background-color #ffffff
 display flex
 flex-direction column
 align-items center
 .logo-coontainer
  margin-top 20px
  display flex
  justify-content center
  .logo-image
   width 180px
   height 200px
 .logo-title
  display flex
  justify-content center
  font-size 25px
  font-weight bold
  padding 20px
  h1
   border-top 1px solid #eeeeee
   border-bottom 1px solid #eeeeee
 .slogan 
  display flex
  justify-content center
  font-size 18px
  color #2d8cf0
 .feature
  margin-top 50px
  display flex
  max-width 1280px
  .feature-item
   flex 1
   padding 20px
   .item-title
    font-size 18px
    font-weight bold
    padding 10px 0
   .item-content
    font-size 16px
    line-height 30px
 .get-start
  width 100%
  display flex
  margin-top 10px
  padding 20px
  font-size 18px
  justify-content center
  line-height 30px
  pre
   padding 20px
</style>