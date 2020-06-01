<template>
  <div class="tree-box">
    <div class="modal-box">
        <!-- 模态框 -->
      <Modal
        @on-visible-change="modalVisible"
        v-model="isModelShow"
        title="编辑"
        :mask-closable="false"
        :loading="true">
        <Form ref="editForm" :model="editForm" :rules="rules" :inline="GVCC.gridType === 1 ? false : true" label-position="top" >
            <FormItem :style="{width: GVCC.gridType === 1 ? '100%' : 'calc(50% - 10px)'}" v-for="item in formItems" :label="item.filedTitle" :key="item.filedKey" :prop="item.filedKey">
                <Input v-model.trim="editForm[item.filedKey]" v-if="item.formInputType === 'text'" type="text" :placeholder="item.filedTitle"/></Input>
                <Select v-model="editForm[item.filedKey]" :filterable="true" v-if="item.formInputType === 'select'" :placeholder="item.title">
                  <Option :key="option.value" v-for="option in options[item.filedKey]" :value="option.value">{{ option.label }}</Option>
                </Select>
                <InputNumber v-model="editForm[item.filedKey]" style="width:100%;" v-if="item.formInputType === 'number'"></InputNumber>
                <SelectTree :clearTreeChecked="clearEditTreeChecked" @change="onTreeCheckedChange" :checkedId="editForm[item.filedKey] - 0" :formItem="item" v-if="item.formInputType === 'tree'"></SelectTree>
            </FormItem>
        </Form>
        <div slot="footer">
          <Button size="large" @click="modelCancel">取 消</Button>
          <Button size="large" v-show="actionType === 1" @click="modelConfirm(true)" type="primary">保 存</Button>
          <Button size="large" :loading="loading" @click="modelConfirm(false)" type="primary">确 定</Button>
        </div>
      </Modal>
    </div>
    <div class="actions-box">
      <Button type="primary" icon="md-add" @click="addRow">新增节点</Button>
      <Button type="default" icon="ios-paper-outline" @click="updateRow">修改节点</Button>
      <Button type="default" icon="md-trash" @click="batchDelete">删除节点</Button>
    </div>
    <div class="info-box">
      <Alert type="info" show-icon>已选择节点<a><strong>{{selectedData.length}}</strong></a>项，<a @click.prevent="cancleSelect">取消选择</a></Alert>
    </div>
    <div class="tree-container">
      <Tree
        ref="tree"
        @on-check-change="treeCheckChange"
        @on-toggle-expand="treeExpandChange"
        :data="treeData"
        show-checkbox
        :multiple="true"
        children-key="children"
        check-directly
        check-strictly
        :render="renderContent"></Tree>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import qs from 'querystring';
import SelectTree from '@/components/common/SelectTree.vue';
import ApioptionsData from '@/api/getOptions.js';
import { transListToTree } from '@/util/tools';

export default {
  name: 'crud',
  components: { SelectTree },
  props: {
    GVCC: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      // 树节点后的操作按钮
      buttonProps: {
        type: 'default',
        size: 'small',
      },
      // 树形结构数据
      treeData: [],
      // 默认展开的树节点
      expandData: [],
      // 清空下拉树节点的选择(表单区域)
      clearEditTreeChecked: false,
      // 清空下拉树节点的选择(筛选区域)
      clearFilterTreeChecked: false,
      // 筛选表单是否展开
      filterFormExpand: 0,
      // 增加和修改共用模态框,用于区分1:增，2: 改。
      actionType: 0,
      loading: false,
      editForm: {},
      filterForm: {},
      // 表格操作列
      selectionColumn: [{ type: 'selection', width: 60, align: 'center' }],
      actionColumns: [],
      tableData: [],
      selectedData: [],
      isModelShow: false,
      badgeStatus: {
        badge1: 'success',
        badge0: 'error',
      },
      activeRow: {},
      page: {
        total: 0,
        current: 1,
        pageSize: 10,
      },
      options: {
      },
    };
  },
  computed: {
    // 需要动态获取的下来选项
    remoteOptonsItem() {
      return this.GVCC.componentData.filter(item => item.formInputType === 'select');
    },
    // 筛选只在表单项中显示的数据项
    formItems() {
      return this.GVCC.componentData.filter((item => item.isShowInForm));
    },
    filterItems() {
      return this.GVCC.componentData.filter(item => item.searchable);
    },
    showFilterItems() {
      // 如果搜索表收起时，只显示3个搜索项
      if (this.filterFormExpand) {
        return this.filterItems;
      }
      return this.filterItems.filter((item, index) => index < 3);
    },
    // 根据isRequired增加非空的验证规则
    rules() {
      const o = {};
      this.GVCC.componentData.forEach((item) => {
        if (item.isRequired && (item.formInputType === 'text' || item.searchInputType === 'text')) {
          o[item.filedKey] = [{ required: true, message: '该项不能为空', trigger: 'blur' }];
        } else if (item.isRequired && (item.formInputType === 'select' || item.searchInputType === 'select')) {
          o[item.filedKey] = [{ validator: this.validateSingleSelect, trigger: 'change' }];
        } else if (item.isRequired && (item.formInputType === 'tree' || item.searchInputType === 'tree')) {
          o[item.filedKey] = [{
            type: 'number', required: true, message: '该项不能为空', trigger: 'change',
          }];
        }
      });
      return o;
    },
    // 根据isShowInTable筛选在表格中显示的列
    columns() {
      const a = [];
      this.GVCC.componentData.forEach((item) => {
        if (item.isShowInTable) {
          const o = {};
          o.title = item.filedTitle;
          o.key = item.filedKey;
          o.align = 'center';
          if (item.tableShowType === 'badge') {
            o.render = (h, params) => h('Badge', {
              props: {
                status: this.badgeStatus[`badge${params.row[item.filedKey]}`],
                text: this.getText(params, item),
              },
            });
          } else {
            o.render = (h, params) => h('span', item.tableShowFrom ? this.getVlueByPath(params.row, item.tableShowFrom.split('.')) : params.row[item.filedKey]);
          }
          a.push(o);
        }
      });
      return a;
    },
  },
  methods: {
    // 获取当前所有展开的节点
    treeExpandChange(data) {
      if (data.expand) {
        const hasExit = this.expandData.filter(item => item === data.id);
        if (!hasExit.length) {
          this.expandData.push(data.id);
        }
      } else {
        this.expandData = this.expandData.filter(item => item !== data.id);
      }
    },
    treeCheckChange(checkedData) {
      this.selectedData = checkedData;
    },
    cancleSelect() {
      this.selectedData = [];
      let selectNodes = this.$refs.tree.getCheckedNodes();
      selectNodes = selectNodes.map((item) => {
        item.checked = false;
        return item;
      });
    },
    renderContent(h, { root, node, data }) {
      return h('span', {
        style: {
          display: 'inline-block',
          width: '100%',
        },
        on: {
          click: () => {
            this.$set(data, 'checked', !data.checked);
            this.selectedData = this.$refs.tree.getCheckedNodes();
          },
        },
      }, [
        h('span', [
          h('Icon', {
            props: {
              type: !data.pId ? 'ios-navigate' : 'ios-paper-outline',
              size: '15',
            },
            style: {
              marginRight: '6px',
            },
          }),
          h('span', this.columns[0] ? data[this.columns[0].key] : ''),
        ]),
        h('span', {
          style: {
            display: 'inline-block',
            float: 'right',
            marginRight: '32px',
          },
        }, [
          // h('Button', {
          //   props: Object.assign({}, this.buttonProps, {
          //     icon: 'ios-add',
          //   }),
          //   style: {
          //     marginRight: '8px',
          //   },
          //   on: {
          //     click: () => { this.appendNode(data); },
          //   },
          // }),
          // h('Button', {
          //   props: Object.assign({}, this.buttonProps, {
          //     icon: 'ios-build-outline',
          //   }),
          //   style: {
          //     marginRight: '8px',
          //   },
          //   on: {
          //     click: () => { this.updateNode(data); },
          //   },
          // }),
          // h('Button', {
          //   props: Object.assign({}, this.buttonProps, {
          //     icon: 'ios-remove',
          //   }),
          //   on: {
          //     click: () => { this.removeNode(root, node, data); },
          //   },
          // }),
        ]),
      ]);
    },
    appendNode(nodeData) {
      this.activeNode = nodeData;
      this.addRow();
    },
    updateNode(data) {
    },
    removeNode(root, node, data) {
      const parentKey = root.find(el => el === node).parent;
      const parent = root.find(el => el.nodeKey === parentKey).node;
      const index = parent.children.indexOf(data);
      parent.children.splice(index, 1);
    },
    selectOpenChange(isOpen) {
      isOpen && this.getOptions();
    },
    getOptions() {
      this.remoteOptonsItem.forEach((item) => {
        if (this.options[item.filedKey]) return false;
        if (item.downOptions.indexOf(0) === -1) {
          const myoptions = item.options.filter(opitem => item.downOptions.indexOf(opitem.id) > -1);
          this.$set(this.options, item.filedKey, myoptions);
        } else {
          ApioptionsData[`api${item.filedKey}`](this.selectedData[0]).then((res) => {
            if (item.props) {
              console.log(item.props);
              const props = JSON.parse(item.props);
              if (res.data.success) {
                const myoptions = res.data.data.map((opitem) => {
                  const o = {
                    label: opitem[props.label],
                    value: opitem[props.value],
                  };
                  return o;
                });
                this.$set(this.options, item.filedKey, myoptions);
              }
            }
          });
        }
      });
    },
    getVlueByPath(row, path) {
      let res = row;
      path.forEach((item) => {
        res = res[item];
      });
      return res;
    },
    filterFormReset() {
      this.$refs.filterForm.resetFields();
      this.clearFilterTreeChecked = !this.clearFilterTreeChecked;
      this.retrieve();
    },
    // 树组件节点选择事件处理
    onTreeCheckedChange(formItem, checkedData) {
      if (this.actionType) {
        this.editForm[formItem.filedKey] = checkedData.id ? checkedData.id : '';
      } else {
        this.filterForm[formItem.filedKey] = checkedData.id ? checkedData.id : '';
      }
    },
    // 分页组件切换页码时触发
    pageChange(current) {
      this.page.current = current;
      this.retrieve();
    },
    getText(params, item) {
      let text = '';
      const value = params.row[item.filedKey];
      const option = item.options.filter(item => (`${item.value}`) === (`${value}`));
      if (option.length) {
        text = option[0].label;
      }
      return text;
    },
    validateSingleSelect(rule, value, callback) {
      if ((`${value}`).length === 0) {
        callback(new Error('该项不能为空'));
      } else {
        callback();
      }
    },
    // 表格选中事件处理
    selectedChange(selection) {
      this.selectedData = selection;
    },
    // 模态框关闭时，重置表单项
    // 重置确认按钮的loading状态
    modalVisible(visible) {
      if (!visible) {
        this.$refs.editForm.resetFields();
        this.clearEditTreeChecked = !this.clearEditTreeChecked;
        this.loading = false;
        this.actionType = 0;
      } else {
        this.getOptions();
      }
    },
    addRow() {
      this.actionType = 1;
      this.isModelShow = true;
    },
    // 修改数据时将当前行的数据填充到表单内
    updateRow(tablerow) {
      if (this.selectedData.length !== 1) {
        this.$Message.warning('请选择一条要修改的数据项！');
      } else {
        for (const key in this.editForm) {
          if (typeof this.editForm[key] === 'number' || typeof this.editForm[key] === 'undefined') {
            this.editForm[key] = this.selectedData[0][key] - 0;
          } else {
            this.editForm[key] = this.selectedData[0][key];
          }
        }
        this.isModelShow = true;
        this.actionType = 2;
      }
    },
    // 批量删除数据按钮触发
    batchDelete() {
      if (this.selectedData.length === 0) {
        this.$Message.warning('至少选择一条数据删除！');
      } else {
        const ids = [];
        this.selectedData.forEach((item) => {
          ids.push(item.id);
        });
        const key = `${this.GVCC.componentName.toLowerCase()}Ids`;
        const param = {};
        param[key] = ids;
        this.deleteRows(param);
      }
    },
    deleteRows(row) {
      this.$Modal.confirm({
        title: '确认',
        content: '<p>确定要删除该条记录吗？</p>',
        loading: true,
        onOk: () => {
          this.delete(row);
        },
        onCancel: () => {
          this.$Message.info('操作已取消');
        },
      });
    },
    /**
     * Boolean modalVisible 是否关闭模态框
     */
    modelConfirm(modalVisible) {
      // 表单验证
      this.$refs.editForm.validate().then((valid) => {
        if (valid) {
          this.loading = true;
          if (this.actionType === 1) {
            this.create(modalVisible);
          } else if (this.actionType === 2) {
            this.update();
          }
        } else {
          this.$Message.warning('表单数据有误！');
        }
      });
    },
    modelCancel() {
      this.isModelShow = false;
    },
    // 增
    create(modalVisible) {
      const data = Object.assign({}, this.editForm);
      const apiconfig = this.GVCC.apiConfig.create;
      axios.post(apiconfig.url, data, apiconfig.config).then((res) => {
        if (res.data.success) {
          // 新增数据成功后是否将模态框关闭
          this.isModelShow = modalVisible;
          this.$Message.success('新增数据成功！');
          this.retrieve();
        } else {
          this.$Message.error(res.data.msg || '新增数据失败！');
        }
      }).catch((e) => {
        this.$Message.error('新增数据失败！');
      }).finally(() => {
        this.loading = false;
      });
    },
    // 删
    delete(row) {
      let data = row;
      const apiconfig = this.GVCC.apiConfig.delete;
      if (apiconfig.config.headers['Content-Type'] === 'application/x-www-form-urlencoded') data = qs.stringify(data);
      axios.post(apiconfig.url, data, apiconfig.config).then((res) => {
        if (res.data.success) {
          this.$Message.success('删除数据成功！');
          this.retrieve();
        } else {
          this.$Message.error(res.data.msg || '删除数据失败！');
        }
      }).catch(() => {
        this.$Message.error('删除数据失败！');
      }).finally(() => {
        this.$Modal.remove();
      });
    },
    // 改
    update() {
      const data = Object.assign({}, this.editForm);
      // 修改数据时需要当前记录的id
      data.id = this.selectedData[0].id;
      const apiconfig = this.GVCC.apiConfig.update;
      axios.post(apiconfig.url, data, apiconfig.config).then((res) => {
        if (res.data.success) {
          this.isModelShow = false;
          this.$Message.success('修改数据成功！');
          this.retrieve();
        } else {
          this.$Message.error(res.data.msg || '修改数据失败！');
        }
      }).catch((e) => {
        this.$Message.error('修改数据失败！');
      }).finally(() => {
        this.loading = false;
      });
    },
    // 查
    retrieve() {
      let data = { currentPage: this.page.current };
      const apiconfig = this.GVCC.apiConfig.retrieve;
      if (apiconfig.config.headers['Content-Type'] === 'application/x-www-form-urlencoded') data = qs.stringify(data);
      axios.post(apiconfig.url, data, apiconfig.config).then((res) => {
        if (res.data.success) {
          const resdata = res.data.data;
          const setExpanddata = resdata.map((item) => {
            if (this.expandData.indexOf(item.id) > -1) {
              item.expand = true;
            }
            return item;
          });
          this.treeData = transListToTree(setExpanddata);
          this.page = {
            total: res.data.data.total,
            current: res.data.data.pageNum,
            pageSize: res.data.data.pageSize,
          };
        } else {
          this.treeData = [];
          this.$Message.error('查询数据失败！');
        }
      }).catch(() => {
        this.$Message.error('查询数据失败！');
      });
    },
    filter() {
      let data = {};
      // 搜索时只传参已经填写的项
      for (const key in this.filterForm) {
        if (typeof this.filterForm[key] !== 'undefined' && (`${this.filterForm[key]}`).length > 0) {
          data[key] = this.filterForm[key];
        }
      }
      const apiconfig = this.GVCC.apiConfig.filter;
      if (apiconfig.config.headers['Content-Type'] === 'application/x-www-form-urlencoded') data = qs.stringify(data);
      axios.post(apiconfig.url, data, apiconfig.config).then((res) => {
        if (res.data.success) {
          this.tableData = res.data.data;
          this.page = {
            total: res.data.data.total,
            current: res.data.data.pageNum,
            pageSize: res.data.data.pageSize,
          };
        } else {
          this.tableData = [];
          this.$Message.error('查询数据失败！');
        }
      }).catch(() => {
        this.tableData = [];
        this.$Message.error('查询数据失败！');
      });
    },
    // 初始化表单的model, text类型默认职位空字符串，下拉选类型默认为选项的第一个值
    _getEditForm() {
      const o = {};
      this.GVCC.componentData.forEach((item) => {
        if (item.isShowInForm) {
          switch (item.formInputType) {
            case 'text':
              o[item.filedKey] = '';
              break;
            case 'select':
              o[item.filedKey] = item.options[1].value;
              break;
            default:
              o[item.filedKey] = '';
              break;
          }
        }
      });
      return o;
    },
    // 初始化表单的model, text类型默认职位空字符串，下拉选类型默认为选项的第一个值
    _getFilterForm() {
      const o = {};
      this.GVCC.componentData.forEach((item) => {
        if (item.searchable) {
          switch (item.searchInputType) {
            case 'text':
              o[item.filedKey] = '';
              break;
            case 'select':
              o[item.filedKey] = '';
              break;
            default:
              o[item.filedKey] = '';
              break;
          }
        }
      });
      return o;
    },
  },
  created() {
    this.actionColumns = [
      {
        title: '操作',
        key: 'action',
        align: 'center',
        isShowInForm: 'false',
        width: 130,
        fixed: 'right',
        render: (h, params) => h('div', [
          h('Button', {
            props: {
              type: 'primary',
              size: 'small',
            },
            style: {
              marginRight: '5px',
            },
            on: {
              click: () => {
                this.updateRow(params);
              },
            },
          }, '编辑'),
          h('Button', {
            props: {
              type: 'error',
              size: 'small',
            },
            on: {
              click: () => {
                const ids = [params.row.id];
                this.deleteRows({ ids });
              },
            },
          }, '删除'),
        ]),
      },
    ];
    this.editForm = this._getEditForm();
    this.filterForm = this._getFilterForm();
    this.retrieve();
  },
};
</script>

<style lang="stylus" scoped>
.tree-box
 background-color #ffffff
 height calc(100vh - 70px)
 overflow-y auto
 overflow-x hidden
 padding 0 10px
 .filter-box
  padding-top 25px
  button
   margin-right 7px
 .actions-box
  padding 15px 0 15px
  button
   margin-right 7px
 .tree-container
  padding 0 15px 0 0;
 .page-box
  margin-top 15px
  text-align right
</style>
