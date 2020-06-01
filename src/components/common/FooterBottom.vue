<template>
  <div class="footer-bottom-box">
    <div>copyright ©{{year}} www.znlszd.com</div>
  </div>
</template>

<script>
export default {
  name: 'footerbottom',
  data() {
    return {
      year:  new Date().getFullYear(),
    };
  },
};
</script>

<style lang="stylus" scoped>
.footer-bottom-box
 height 40px
 line-height 40px
 text-align center
</style>
