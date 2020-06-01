<template>
  <div v-click-outside="onClickOutside" class="select-treetable-box">
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
      <div class="tree-box">
        <Tree
          @on-check-change="onCheckChange"
          show-checkbox
          check-strictly
          check-directly
          v-show="treeData.length"
          :data="treeData"
        ></Tree>
      </div>
      <div class="table-box">
        <Table
          size="small"
          ref="table"
          @on-row-click="tableRowClickHandler"
          border
          :columns="columns"
          :data="tableData"></Table>
      </div>
    </div>
  </div>
</template>

<script>
import { directive as clickOutside } from 'v-click-outside-x';
import ApitreeData from '@/api/getTreeData';
import ApitreeTableData from '@/api/getTreeTableData';
import { transListToTree } from '@/util/tools';

export default {
  name: 'selecttree',
  directives: { clickOutside },
  props: {
    clearTreeChecked: {
      type: Boolean,
      default: false,
    },
    activeRow: {
      type: Object,
      default: () => {},
    },
    checkedId: {
      type: Number,
      default: 0,
    },
    formItem: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      tableData: [],
      treeIsSshow: false,
      treeData: [],
      allNodes: [],
      checkedTitle: '',
    };
  },
  computed: {
    columns() {
      return JSON.parse(this.formItem.props)[1].map((item, index) => {
        item.align = 'center';
        return item;
      });
    },
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
    // 表格是否选中触发
    tableRowClickHandler(row) {
      this.checkedTitle = row[this.columns[1].key];
      const checkedData = { id: row.id, title: this.checkedTitle };
      this.$emit('change', this.formItem, checkedData);
      this.treeIsSshow = false;
    },
    // 树节点是否选中改变时触发
    // 当前使用单选模式
    // 改变后动态获取table的数据
    onCheckChange(selected, current) {
      if (current.checked) {
        this.treeData[0].expand = false;
        this.getTableData(current);
      }
      this.setNodeChecked(this.treeData, current);
    },
    // 格式化数组件需要的数据添加title,expand,checked
    formateTree(data) {
      const props = JSON.parse(this.formItem.props)[0];
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
          // if (current.checked) {
          //   this.checkedTitle = item.title;
          // }
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
      ApitreeData[`api${this.formItem.filedKey}`]().then((res) => {
        if (res.data.success) {
          const data = transListToTree(res.data.data);
          this.treeData = this.formateTree(data.length ? data : res.data.data);
        } else {
          this.treeData = [];
        }
      }).catch(() => {
        this.treeData = [];
      });
    },
    getTableData(treeNode) {
      ApitreeTableData[`api${this.formItem.filedKey}`](treeNode).then((res) => {
        if (res.data.success) {
          this.tableData = res.data.data;
        } else {
          this.tableData = [];
        }
      }).catch(() => {
        this.tableData = [];
      });
    },
    setDefaultChecked() {
      this.checkedTitle = this.activeRow[this.formItem.tableShowFrom] ? this.activeRow[this.formItem.tableShowFrom] : this.checkedTitle;
    },
  },
  mounted() {
    // 分别获取树和表格数据
    this.getTreeData();
    // this.getTableData();
  },
};
</script>

<style lang="stylus" scoped>
.select-treetable-box
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
