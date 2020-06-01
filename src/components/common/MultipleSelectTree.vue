<template>
  <div class="select-tree-box">
    <Spin size="large" fix v-if="spinShow"></Spin>
    <!-- <Input
      @on-clear="clearChecked"
      @click.native="treeIsSshow = true;"
      v-model.trim="checkedTitle"
      type="text"
      clearable
      readonly
      :placeholder="formItem.filedTitle"/></Input> -->
    <div v-show="treeIsSshow" class="downtree-box">
      <div v-show="!treeData.length" style="text-align:center;">暂无数据</div>
      <Tree
        ref="tree"
        @on-check-change="onCheckChange"
        show-checkbox
        check-directly
        v-show="treeData.length"
        :data="treeData"
        multiple
      ></Tree>
    </div>
  </div>
</template>

<script>
import ApitreeData from '@/api/getTreeData.js';
import { transListToTree } from '@/util/tools';

export default {
  name: 'selecttree',
  props: {
    clearTreeChecked: {
      type: Boolean,
      default: false,
    },
    checkedId: {
      type: Array,
      default: () => [],
    },
    formItem: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      spinShow: true,
      treeIsSshow: true,
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
        this.getTreeData(v);
      }
    },
  },
  methods: {
    // 树节点是否选中改变时触发
    // 当前使用单选模式
    onCheckChange(selected, current) {
      const selectedData = this.$refs.tree.getCheckedNodes();
      this.$emit('change', selectedData);
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
    setNodeChecked(data, checkedId) {
      return this.treeData = data.map((item) => {
        const o = item;
        if (checkedId.indexOf(item.id) > -1) {
          o.checked = true;
        } else {
          o.checked = false;
        }
        if (item.children) {
          o.children = this.setNodeChecked(item.children, checkedId);
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
    getTreeData(checkedId) {
      this.spinShow = true;
      ApitreeData[`api${this.formItem.filedKey}`]().then((res) => {
        this.spinShow = false;
        if (res.data.success) {
          const data = transListToTree(res.data.data);
          this.treeData = this.formateTree(data);
          this.setDefaultChecked(checkedId);
        } else {
          this.treeData = [];
        }
      }).catch((e) => {
        this.spinShow = false;
        this.treeData = [];
      });
    },
    setDefaultChecked(checkedId) {
      this.setNodeChecked(this.treeData, checkedId);
    },
  },
  mounted() {
    // this.getTreeData();
  },
};
</script>

<style lang="stylus">
.select-tree-box
 position relative
 .downtree-box
  border 1px solid #dcdee2
  background-color #ffffff
  height 350px
  overflow auto
  .ivu-tree ul li
   margin 0
   cursor pointer
</style>
