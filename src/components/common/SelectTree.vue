<template>
  <div v-click-outside="onClickOutside" class="select-tree-box">
    <Input
      @on-clear="clearChecked"
      @click.native="treeIsSshow = true;"
      v-model.trim="checkedTitle"
      type="text"
      clearable
      readonly
      :placeholder="formItem.filedTitle"/></Input>
    <div v-show="treeIsSshow" class="downtree-box">
      <div v-show="!treeData.length" style="text-align:center;">暂无数据</div>
      <Tree
        @on-check-change="onCheckChange"
        show-checkbox
        check-strictly
        check-directly
        v-show="treeData.length"
        :data="treeData"
      ></Tree>
    </div>
  </div>
</template>

<script>
import { directive as clickOutside } from 'v-click-outside-x';
import ApitreeData from '@/api/getTreeData';
import { transListToTree } from '@/util/tools';

export default {
  name: 'selecttree',
  directives: { clickOutside },
  props: {
    clearTreeChecked: {
      type: Boolean,
      default: false,
    },
    checkedId: {
      type: Number,
      default: 0,
    },
    formItem: {
      type: Object,
      default: () => {},
    },
    prefix: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      treeIsSshow: false,
      treeData: [],
      allNodes: [],
      checkedTitle: '',
    };
  },
  watch: {
    clearTreeChecked(v) {
      this.clearChecked();
    },
    checkedId(v) {
      if (v) {
        this.setDefaultChecked(v);
      }
    },
  },
  methods: {
    // 树节点是否选中改变时触发
    // 当前使用单选模式
    onCheckChange(selected, current) {
      let checkedData = { id: 0, title: '' };
      if (current.checked) {
        checkedData = { id: current.id, title: current.title };
        this.checkedTitle = current.title;
      } else {
        this.checkedTitle = '';
      }
      this.$emit('change', this.formItem, checkedData);
      this.setNodeChecked(this.treeData, current);
    },
    // 格式化数组件需要的数据添加title,expand,checked
    formateTree(data) {
      const props = JSON.parse(this.formItem.props);
      return data.map((item) => {
        const o = item;
        // 树节点的显示字段设置
        o.title = item[`${props.label}`];
        o.expand = false;
        o.checked = false;
        if (item[props.children].length) {
          o.children = this.formateTree(item[props.children]);
        }
        this.allNodes.push(o);
        return o;
      });
    },
    // 选中或取消选中树节点
    setNodeChecked(data, current) {
      return this.treeData = data.map((item) => {
        const o = item;
        // 将tree组件设置为但选项
        if (o.id !== current.id) {
          o.checked = false;
        } else {
          o.checked = current.checked;
          if (current.checked) {
            this.checkedTitle = item.title;
          }
        }
        if (item.children) {
          o.children = this.setNodeChecked(item.children, current);
        }
        return o;
      });
    },
    // 清除树节点选择
    clearChecked() {
      this.allNodes.map((item) => {
        item.checked = false;
      });
      const checkedData = { id: 0 };
      this.checkedTitle = '';
      this.$emit('change', this.formItem, checkedData);
    },
    onClickOutside() {
      this.treeIsSshow = false;
    },
    treeNodeRender(h, { root, node, data }) {
      return h('span', {
        style: {
          display: 'inline-block',
          width: '100%',
        },
      }, [
        h('span', {
          style: {
            color: '#2c3e50',
          },
        }, [
          h('Icon', {
            props: {
              type: 'ios-folder',
            },
            style: {
              marginRight: '8px',
              color: '#f2df7d',
            },
          }),
          h('span', data.title),
        ]),
      ]);
    },
    getTreeData() {
      if (!ApitreeData[`api${this.prefix}${this.formItem.filedKey}`]) return false;
      ApitreeData[`api${this.prefix}${this.formItem.filedKey}`]().then((res) => {
        if (res.data.success) {
          const data = transListToTree(res.data.data);
          this.treeData = this.formateTree(data.length ? data : res.data.data);
        } else {
          this.treeData = [];
        }
      }).catch(() => {
        this.treeData = [];
      });
      return false;
    },
    setDefaultChecked(checkedId) {
      const current = { id: checkedId, checked: true };
      this.setNodeChecked(this.treeData, current);
    },
  },
  mounted() {
    this.getTreeData();
  },
};
</script>

<style lang="stylus" scoped>
.select-tree-box
 position relative
 .downtree-box
  position absolute
  left 0
  top 35px
  width 100%
  z-index 9
  border 1px solid #dcdee2
  background-color #ffffff
  height auto
  max-height 300px
  overflow auto
  .ivu-tree ul li
   margin 0
   cursor pointer
</style>
