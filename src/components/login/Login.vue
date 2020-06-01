<template>
 <div @keypress="keypress" class="login-box">
   <div class="login-logo-box">
     <div class="logo">欢迎登录{{appConfig.appName}}</div>
   </div>
   <div class="loginform-box">
    <Form ref="loginForm" :model="loginForm" :rules="rules" label-position="top">
        <FormItem label="用户名" key="username" prop="account">
            <Input id="username" prefix="ios-contact" v-model.trim="loginForm.account" type="text" placeholder="用户名"/></Input>
        </FormItem>
        <FormItem label="密 码" key="password" prop="password">
            <Input id="password" prefix="ios-card" v-model.trim="loginForm.password" type="password" placeholder="密 码"/></Input>
        </FormItem>
        <div style="text-align:right;"><a>忘记密码?</a></div>
        <FormItem>
            <Button :loading="loading" type="primary" @click="submit" long>登录</Button>
        </FormItem>
    </Form>
    <div><footer-bottom></footer-bottom></div>
   </div>
 </div>
</template>

<script>
import FooterBottom from '@/components/common/FooterBottom.vue';
import { apilogin } from '@/api/login';
import appConfig from '@/config/app.config.js';
export default {
  name: 'login',
  components: { FooterBottom },
  data() {
    return {
      appConfig,
      loading: false,
      loginForm: {
        account: '',
        password: '',
      },
      rules: {
        account: [{ required: true, message: '用户名不能为空', trigger: 'change' }],
        password: [{ required: true, message: '密码不能为空', trigger: 'change' }],
      },
    };
  },
  computed: {
    isLogin: {
      get() {
        return this.$store.state.isLogin;
      },
      set(val) {
        this.$store.state.isLogin = val;
      },
    },
    username: {
      get() {
        return this.$store.state.username;
      },
      set(val) {
        this.$store.state.username = val;
      },
    },
  },
  methods: {
    submit() {
      this.$refs.loginForm.validate().then((valid) => {
        if (valid) {
          this.loading = true;
          apilogin(this.loginForm).then((res) => {
            this.loading = false;
            if (res.data.success) {
              // 登录成功后存储用户信息
              this.$router.go(0);
              this.isLogin = true;
              localStorage.setItem('username', this.loginForm.account);
              this.username = this.loginForm.account;
            } else {
              this.$Message.warning(res.data.msg || '登陆失败');
            }
          }).catch(() => {
            this.loading = false;
            this.$Message.warning('登陆失败');
          });
        }
      });
    },
    keypress(e) {
      if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        this.submit();
      }
    },
  },
  mounted() {
    // 登录前输入框自动获取焦点
    this.$nextTick(() => {
      document.querySelector('#username').querySelector('input').focus();
    });
  },
};
</script>

<style lang="stylus" scoped>
.login-box
 width 500px
 height 350px
 position absolute
 left 50%
 top 50%
 margin-left -250px
 margin-top -150px
 padding 20px 50px 0
 background-size contain
 background-position center
 box-shadow: 0 1px 4px rgba(0,21,41,.08)
 border-radius 10px
 border 1px solid #eeeeee
 background-color white
 .login-logo-box
  display block
  vertical-align top
  width 100%
  text-align center
  font-size 23px
  font-weight bolder
  padding 10px
  color #515a6e
 .loginform-box
  display inline-block
  vertical-align top
  width 100%
</style>
