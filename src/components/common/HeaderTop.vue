<template>
  <div class="header-top-box">
    <div class="breadcrumb-box">
      <Breadcrumb>
          <BreadcrumbItem>
              <Icon type="ios-home-outline"></Icon> {{ appName }}
          </BreadcrumbItem>
          <BreadcrumbItem>
              <Icon type="md-cube"></Icon> {{ moduleAndPage.moduleName }}
          </BreadcrumbItem>
          <BreadcrumbItem>
              <Icon type="ios-pricetags" /> {{ moduleAndPage.pageName }}
          </BreadcrumbItem>
      </Breadcrumb>
    </div>
    <div class="userinfo-box">
    <Dropdown>
        <span href="javascript:void(0)">
          <Icon class="avata" type="md-contact" />
          <span id="hello">您好,</span>
          <span id="username">{{username}}</span>
        </span>
        <DropdownMenu slot="list">
            <DropdownItem><Icon type="md-card" /> 修改密码</DropdownItem>
            <DropdownItem @click.native="logout"><Icon type="md-exit" /> 退出登录</DropdownItem>
        </DropdownMenu>
    </Dropdown>
    </div>
  </div>
</template>

<script>
import { apilogout } from '@/api/login.js';
import appConfig from '@/config/app.config.js';

export default {
  name: 'headertop',
  data() {
    return {
      username: '',
    };
  },
  computed: {
    appName() {
      return appConfig.appName;
    },
    moduleAndPage() {
      return {
        moduleName: this.getTitleByName(this.$route.meta.moduleName),
        pageName: this.getTitleByName(this.$route.name) || this.$route.name,
      };
    },
    isLogin: {
      get() {
        return this.$store.state.isLogin;
      },
      set(val) {
        this.$store.state.isLogin = val;
      },
    },
  },
  methods: {
    getTitleByName(name) {
      let title = '';
      appConfig.pages.forEach((item) => {
        if (item.name === name) {
          title = item.title
        }
      })
      return title;
    },
    logout() {
      apilogout().then((res) => {
        localStorage.clear();
        this.isLogin = false;
      });
    },
  },
  created() {
    this.username = localStorage.getItem('username');
  },
};
</script>

<style lang="stylus" scoped>
.header-top-box
 height 60px
 line-height 60px
 background-color #ffffff
 box-shadow: 0 1px 4px rgba(0,21,41,.08)
 padding-left 20px
 .breadcrumb-box
  display inline-block
  width 400px
 .userinfo-box
  float right
  padding-right 20px
  cursor pointer
  color #515a6e
  .avata
   font-size 32px
  #hello
   padding-left 7px
</style>
