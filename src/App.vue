<template>
  <div id="app">
    <div v-show="!isLogin" id="mask">
      <div class="login-container">
        <login></login>
      </div>
    </div>
    <div class="view-container" :class="{filter: !isLogin}">
      <router-view/>
    </div>
  </div>
</template>

<script>
import Login from '@/components/login/Login.vue';

export default {
  name: 'app',
  components: { Login },
  computed: {
    isLogin: {
      get() {
        return this.$store.state.isLogin;
      },
      set(val) {
        this.$store.commit('setIsLogin', val);
      },
    },
  },
  created() {
    if (localStorage.getItem('username')) {
      this.isLogin = true;
    } else {
      this.isLogin = false;
    }
  },
};
</script>

<style lang="stylus">
#mask
 position fixed
 left 0
 top 0
 right 0
 bottom 0
 background-color rgba(0, 0, 0, .6)
 z-index 9
.view-container.filter
 filter blur(5px)
html,body
 padding 0
 margin 0
 background-color #eef1f6 !important
 min-width 1024px
 overflow-y hidden
#app
  font-family 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  color #2c3e50
#nav
  padding 30px
  a
    font-weight bold
    color #2c3e50
    &.router-link-exact-active
     color #42b983
</style>
