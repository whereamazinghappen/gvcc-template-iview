<template>
  <div :style="custonmStyle" class="crud-box">
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
                <Input :readonly="item.readonly ? true : false" @on-change="(val)=>inputChange(val, item)" v-model.trim="editForm[item.filedKey]" v-if="item.formInputType === 'text'" type="text" :placeholder="item.filedTitle"/></Input>
                <Select @on-change="(val)=>selectChange(val, item)" :multiple="item.multiple? true : false" clearable v-model="editForm[item.filedKey]" :filterable="true" v-if="item.formInputType === 'select'" :placeholder="item.filedTitle">
                  <Option :key="option.value" v-for="option in options[item.filedKey]" :value="option.value">{{ option.label }}</Option>
                </Select>
                <Input @on-change="(val)=>inputChange(val, item)" v-if="item.formInputType === 'selectText'" v-model.trim="editForm[item.filedKey]">
                  <Select @on-change="(val)=>inputChange(val, item)" v-model.trim="editForm[item.filedKey]" slot="append" style="width: 70px">
                      <Option :key="option.value" v-for="option in options[item.filedKey]" :value="option.value">{{ option.label }}</Option>
                  </Select>
                </Input>
                <DatePicker v-if="item.formInputType === 'date'" v-model="editForm[item.filedKey]" type="date" :placeholder="item.filedTitle"></DatePicker>
                <InputNumber :min="0" :max="1000" v-model.number="editForm[item.filedKey]" style="width:100%;" v-if="item.formInputType === 'number'"></InputNumber>
                <SelectTree :prefix="GVCC.componentName" :clearTreeChecked="clearEditTreeChecked" @change="onTreeCheckedChange" :checkedId="editForm[item.filedKey] - 0" :formItem="item" v-if="item.formInputType === 'tree'"></SelectTree>
                <SelectTreeTable :prefix="GVCC.componentName" :clearTreeChecked="clearEditTreeChecked" @change="onTreeCheckedChange" :activeRow="activeRow" :checkedId="editForm[item.filedKey] - 0" :formItem="item" v-if="item.formInputType === 'treetable'"></SelectTreeTable>
            </FormItem>
        </Form>
        <div slot="footer">
          <Button size="large" @click="modelCancel">取 消</Button>
          <Button size="large" v-show="actionType === 1" @click="modelConfirm(true)" type="primary">保 存</Button>
          <Button size="large" :loading="loading" @click="modelConfirm(false)" type="primary">确 定</Button>
        </div>
      </Modal>
      <!-- 文件上传 -->
      <Modal
        v-model="isUploadShow"
        title="文件上传"
        :mask-closable="false"
        :loading="true">
        <Upload
            multiple
            type="drag"
            ref="uplaod"
            :with-credentials="true"
            :on-success="uploadsuccess"
            :on-error="uplaoderror"
            :action="GVCC.apiConfig.upload.url">
            <div style="padding: 30px 0">
                <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                <p>点击或拖拽文件到此处</p>
            </div>
        </Upload>
        <div slot="footer">
        </div>
      </Modal>
    </div>
    <!-- 表格数据筛选区 -->
    <div v-if="isFilterShow" class="filter-box">
        <Form ref="filterForm" :model="filterForm" inline :label-width="70" label-position="left">
            <FormItem :style="{width: 'calc(25% - 10px)'}" v-for="(item, index) in showFilterItems" :label="item.filedTitle + ':'" :key="item.filedKey" :prop="item.filedKey">
                <Input @on-enter="(val)=>filterInputEnter(val, item)" v-model="filterForm[item.filedKey]" v-if="item.formInputType === 'text'" type="text" :placeholder="item.filedTitle"/></Input>
                <AutoComplete @on-focus="autocompleteFocus" :data="autoCompleteData[item.filedKey]" @keyup.native.enter="(val)=>filterInputEnter(val, item)" @on-select="(val)=>filterInputEnter(val, item)" v-model="filterForm[item.filedKey]" v-if="item.formInputType === 'autocomplete'" :placeholder="item.filedTitle"/></AutoComplete>
                <Select @on-open-change="(val) => selectOpenChange(val, item.filedKey)" v-model="filterForm[item.filedKey]" :filterable="true" v-if="item.formInputType === 'select'" :placeholder="item.title">
                  <Option :key="option.value" v-for="option in options[item.filedKey]" :value="option.value">{{ option.label }}</Option>
                </Select>
                <DatePicker v-if="item.formInputType === 'dateRange'" type="daterange" v-model="filterForm[item.filedKey]" :placeholder="item.filedTitle"></DatePicker>
                <InputNumber :min="1" :max="1000" v-model.number="filterForm[item.filedKey]" style="width:100%;" v-if="item.formInputType === 'number'"></InputNumber>
                <SelectTree :prefix="GVCC.componentName" :actionType="actionType" :clearTreeChecked="clearFilterTreeChecked" @change="onTreeCheckedChange" :editForm="filterForm" :formItem="item" v-if="item.formInputType === 'tree'"></SelectTree>
            </FormItem>
            <!-- 搜索表单每行4个 -->
            <FormItem :style="{width: (filterFormExpand === 1) || (showFilterItems.length % 4 === 0) ? '100%' : 'calc(25% - 10px)', textAlign: 'right'}">
              <Button type="primary" @click="filter">查 询</Button>
              <Button type="default" @click="filterFormReset">重 置</Button>
              <a v-show="filterFormExpand === 0" @click="filterFormExpand = 1">展 开<Icon type="ios-arrow-down" /></a>
              <a v-show="filterFormExpand === 1" @click="filterFormExpand = 0">收 起<Icon type="ios-arrow-up" /></a>
            </FormItem>
        </Form>
    </div>
    <!-- 表格按钮操作区 -->
    <div class="actions-box">
      <div v-if="isTableActionShow">
        <Button :disabled="disabled" type="primary" icon="md-add" @click="addRow">增加数据</Button>
        <Button :disabled="disabled" type="default" icon="md-trash" @click="batchDelete">批量删除</Button>
        <Dropdown :disabled="disabled" v-if="isMoreOperateShow">
            <Button type="default">
                更多操作
                <Icon type="ios-arrow-down"></Icon>
            </Button>
            <DropdownMenu slot="list">
                <DropdownItem @click.native="reFresh"><Icon type="md-refresh"/> 刷新</DropdownItem>
                <DropdownItem @click.native="uploadData"><Icon type="md-cloud-upload"/> 导入数据</DropdownItem>
                <DropdownItem @click.native="downloadData"><Icon type="md-cloud-download"/> 下载模板</DropdownItem>
            </DropdownMenu>
        </Dropdown>
        </div>
        <div>
          <Button :key="item.name" :disabled="item.disabled" :type="item.type" :icon="item.icon" @click="customClick(item.name);" v-for="item in customButtons">{{item.label}}</Button>
        </div>
    </div>
    <div class="info-box">
      <Alert type="info" show-icon>已选择<a><strong>{{selectedData.length}}</strong></a>项，<a @click.prevent="$refs.table.selectAll(false);">清空</a></Alert>
    </div>
    <!-- 表格 -->
    <div class="table-box">
      <Table
        :disabled-hover="false"
        :highlight-row="highlightRow"
        ref="table"
        @on-selection-change="selectedChange"
        @on-row-dblclick="rowDblClick"
        @on-current-change="currentRowChange"
        border
        :columns="selectionColumn.concat(columns).concat(actionColumns)"
        :data="customTableData ? customTableData : tableData"></Table>
    </div>
    <div class="page-box">
      <Page
        :total="page.total || (customTableData ? customTableData.length : 0)"
        :current="page.current"
        :page-size="page.pageSize"
        size="small"
        show-total
        show-elevator
        @on-change="pageChange"/>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import qs from 'querystring';
import SelectTree from '@/components/common/SelectTree.vue';
import SelectTreeTable from '@/components/common/SelectTreeTable.vue';
import ApioptionsData from '@/api/getOptions';

export default {
  name: 'crud',
  components: { SelectTree, SelectTreeTable },
  props: {
    setHighlight: {
      type: Function,
      default: null,
    },
    // 表格高亮当前行
    highlightRow: {
      type: Boolean,
      default: false,
    },
    // 只读状态，只能r，不能cud
    disabled: {
      type: Boolean,
      default: false,
    },
    // 处理特殊组件，如：传参前需要对参数进行
    customBeforeSend: {
      type: Function,
      default: null,
    },
    // 查询时对日期参数进行格式化处理
    customBeforeFilter: {
      type: Function,
      default: null,
    },
    // 请求额外自定义参数
    customPostData: {
      type: Object,
      default: () => {},
    },
    // 表格默认数据
    customTableData: {
      type: Array,
      default: null,
    },
    // 组件基本配置
    GVCC: {
      type: Object,
      default: () => {},
    },
    // 自定义按钮
    customButtons: {
      type: Array,
      default: () => [],
    },
    // 自定义样式
    custonmStyle: {
      type: Object,
      default: () => {},
    },
    // 是否显示筛选区域
    isFilterShow: {
      type: Boolean,
      default: true,
    },
    // 是否显示表格顶部的操作按钮
    isTableActionShow: {
      type: Boolean,
      default: true,
    },
    // 自定义表格行的操作按钮
    isRowActionShow: {
      type: Boolean,
      default: true,
    },
    // 是否显示更多操作
    isMoreOperateShow: {
      type: Boolean,
      default: true,
    },
    // 表格行操作列自定义渲染
    rowActionRender: {
      type: Function,
      default() {
        const mythis = this;
        return function (h, params) {
          return h('div', [
            h('Button', {
              props: {
                type: 'primary',
                size: 'small',
                disabled: mythis.disabled,
              },
              style: {
                marginRight: '5px',
              },
              on: {
                click: () => {
                  mythis.updateRow(params);
                },
              },
            }, '编辑'),
            h('Button', {
              props: {
                type: 'error',
                size: 'small',
                disabled: mythis.disabled,
              },
              on: {
                click: () => {
                  const ids = [params.row.id];
                  let key = `ids`;
                  // 如果是ls开头则参数有区别
                  // 为后台传参兼容做的判断，无逻辑意义判断，不通用
                  if (mythis.GVCC.componentName.indexOf('ls') === 0) {
                    key = `${mythis.GVCC.componentName}Ids`;
                  }
                  const param = {};
                  param[key] = ids;
                  mythis.deleteRows(param);
                },
              },
            }, '删除'),
          ]);
        };
      },
    },
  },
  data() {
    return {
      // 自动补全的下拉数据放在localStorage中
      autoCompleteData: {},
      // 14种形位公差
      xingwei: ['直线度', '平面度', '圆度', '圆柱度', '线轮廓度', '面轮廓度', '平行度', '垂直度', '倾斜度', '同轴度', '对称度', '位置度', '圆跳动', '全跳动'],
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
      formItems: [],
      filterForm: {},
      // 表格操作列
      selectionColumn: [{ type: 'selection', width: 60, align: 'center' }],
      actionColumns: [],
      tableData: [],
      selectedData: [],
      isModelShow: false,
      isUploadShow: false,
      badgeStatus: {
        badge1: 'success',
        badge0: 'error',
        badge合格: 'success',
        badge超差: 'error',
      },
      tagStatus: {
        tag2: 'success',
        tag1: 'primary',
        tag0: 'error',
        tag5: 'primary',
        tag6: 'success',
        tag7: 'success',
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
  watch: {
    isRowActionShow(v, ov) {
      this.actionColumns = v ? [
        {
          title: '操作',
          key: 'action',
          align: 'center',
          isShowInForm: 'false',
          width: (typeof this.rowActionRender('nums') === 'number') ? this.rowActionRender('nums') * 80 : 130,
          fixed: 'right',
          render: this.rowActionRender(),
        },
      ] : [];
    },
  },
  computed: {
    // 需要动态获取的下来选项
    remoteOptonsItem() {
      return this.GVCC.componentData.filter(item => (item.formInputType === 'select' || item.formInputType === 'selectText'));
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
          o[item.filedKey] = [{ required: true, validator: this.validateSingleSelect, trigger: 'change' }];
        } else if (item.isRequired && (item.formInputType === 'tree' || item.formInputType === 'treetable' || item.formInputType === 'number')) {
          if (item.treeTabelType === 'string') {
            o[item.filedKey] = [{
              type: 'string', required: true, message: '该项不能为空', trigger: 'change',
            }];
          } else {
            o[item.filedKey] = [{
              type: 'number', required: true, message: '该项不能为空', trigger: 'change',
            }];
          }
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
          o.width = item.tableColumnWidth;
          if (item.tableShowType === 'badge') {
            o.render = (h, params) => h('Badge', {
              style: {
                display: params.row[item.filedKey] !== null ? 'inline-block' : 'none',
              },
              props: {
                status: this.badgeStatus[`badge${params.row[item.filedKey]}`],
                text: this.getText(params, item),
              },
            });
          } else if (item.tableShowType === 'tag') {
            o.render = (h, params) => h('Tag', {
              props: {
                color: this.tagStatus[`tag${params.row[item.filedKey]}`],
              },
            }, this.getText(params, item));
          } else if (item.filedKey === 'checkdata') {
            o.render = (h, params) => h('Badge', {
              props: {
                style: {
                  color : params.row.customstatus ? 'red' : 'green',
                },
                text: params.row[item.filedKey],
              },
            });            
          } else {
            // 暂时使用约定的硬编码
            if (item.tableShowFrom === 'options') {
              o.render = (h, params) => h('span',  this.getLableByValue(item.options, item.downOptions, params.row[item.filedKey]));
            } else {
              if (item.tableShowFormatter) {
                if (item.render) {
                  o.render = (h, params) => {
                    const item = params.row;
                    if (item.elementName === 'Line') {
                      return h('div', { style: { display: 'flex', 'align-items': 'center', 'justify-content': 'center' } }, [
                        h('span', {}, item.profix),
                        h('span', {}, item.theoryValue),
                        h('span', [h('div', { style: { height: '15px', transform: 'scale(0.8)' } }, item.theoryUp), h('div', { style: { height: '15px', transform: 'scale(0.8)' } }, item.theoryLow)]),
                        h('span', {}, item.position),
                        h('span', {}, item.suffix),
                      ]);
                    }
                    if (item.elementName === 'Rough') {
                      return h('div', { style: { display: 'flex', 'align-items': 'center', 'justify-content': 'center' } }, [
                        h('span', {}, item.roughnessProfix),
                        h('span', {}, item.theoryValue),
                      ]);
                    }
                    if (item.elementName === 'Angle') {
                      return h('div', { style: { display: 'flex', 'align-items': 'center', 'justify-content': 'center' } }, [
                        h('span', {}, `${item.degree || 0}°`),
                        h('span', {}, `${item.minutes || 0}′`),
                        h('span', {}, `${item.seconds || 0}″`),
                        h('span', [h('div', { style: { height: '15px', transform: 'scale(0.8)' } }, item.theoryUp), h('div', { style: { height: '15px', transform: 'scale(0.8)' } }, item.theoryLow)]),
                      ]);
                    }
                    if (item.elementName.indexOf('/') > -1) {
                      const buttons = item.elementName.split('/').map((ele) => {
                        if (ele) {
                          return h('Button', {}, ele);
                        }
                      });
                      return h('ButtonGroup', {}, [
                        h('Button', [h('img', {
                          attrs: {
                            src: require(`../../assets/images/${item.checkProperty}.png`),
                            width: '14px',
                          },
                          style: {
                            'vertical-align': 'middle',
                            transform: 'scale(1.5)',
                          },
                        })]),
                        ...buttons,
                      ]);
                    }
                    return item.elementName;
                  };
                } else {
                  var formatterFun = new Function('text', 'row', item.tableShowFormatter);
                  o.render = (h, params) => h('span', {
                    style: {
                      cursor: 'pointer',
                    },
                    on: {
                      click: () => {
                        this.$emit('tableCellClick', params.row);
                      },
                    },
                  }, formatterFun(params.row[item.filedKey], params.row));
                }
              } else {
                o.render = (h, params) => h('span', item.tableShowFrom ? this.getVlueByPath(params.row, item.tableShowFrom.split('.')) : params.row[item.filedKey]);
              }
            }
          }
          a.push(o);
        }
      });
      return a;
    },
  },
  methods: {
    // 选中当前行发生变化
    currentRowChange(currentRow) {
      this.$emit('currentRowChange', currentRow);
    },
    // 自动补全输入框获得焦点时从localStorge中获取待选择的数据
    autocompleteFocus() {
      this.autoCompleteData = localStorage.getItem('autoCompleteData') ? JSON.parse(localStorage.getItem('autoCompleteData')) : {};
    },
    // TODO待通用化处理-搜索区域input输入改变触发
    filterInputEnter(e, item) {
      if (item.filterInputEnter) {
        const key = item.filedKey;
        const o = {};
        o[key] = e.target ? e.target.value : e;
        this.$emit('filterInputEnter', o);
      }
    },
    // TODO待通用化处理-表单区域input输入改变触发
    inputChange(val, item) {
      if (item.inputChange) {
        this.$emit('inputChange', this.editForm, item);
      }
    },
    // TODO待通用化处理-表单区域select输入改变触发
    selectChange(val, item) {
      if (item.selectChange) {
        const key = item.filedKey;
        const o = {};
        o[key] = val;
        this.formItems = this.getFormItems(this._getEditForm(o));
        this.editForm = this._getEditForm(o);
      }
    },
    uploadsuccess(res) {
      if (res || (res.data && res.data.success)) {
        this.$Message.success('上传文件成功');
        this.isUploadShow = false;
      } else {
        this.$refs.uplaod.clearFiles();
        this.$Message.warning('上传文件失败！');
      }
    },
    uplaoderror() {
      this.$refs.uplaod.clearFiles();
      this.$Message.error('上传文件失败！');
    },
    reFresh() {
      this.retrieve();
    },
    uploadData() {
      this.isUploadShow = true;
      this.$refs.uplaod.clearFiles();
    },
    downloadData() {
      const apiconfig = this.GVCC.apiConfig.download;
      axios.get(apiconfig.url, apiconfig.config).then((res) => {
        if (res.data.type === 'application/json') {
          this.$Message.warning('下载文件失败！');
          return false;
        }
        // 根据content-disposition获取文件名称
        let filename = res.headers['content-disposition'].split(';')
        filename = filename.filter((item)=> {
          return item.indexOf('filename') > -1;
        });
        filename = filename.length ? filename[0].split('=')[1] : '下载文件'
        let ext = res.headers['content-type']
        // 根据content-type获取文件类型
        if (ext.indexOf('excel')) {
          ext = '.xlsx';
        } else if (ext.indexOf('word')) {
          ext = '.docx';
        }
        filename = filename.indexOf('.') > -1 ? filename : filename + ext;
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.setAttribute('download', decodeURI(filename));
        document.body.appendChild(link);
        link.click();
        link.remove();
      }).catch((e) => {
        this.$Message.error('下载文件失败！');
      });
    },
    // 自定义表格行内的触发事件
    emitCustomAction(actionname, params) {
      this.$emit('customAction', actionname, params);
    },
    // 自定义表格顶部按钮触发事件
    customClick(name) {
      this.$emit(name, this.selectedData, this.tableData);
    },
    selectOpenChange(isOpen, filedKey) {
      isOpen && this.getOptions(filedKey);
    },
    getOptions(filedKey) {
      this.remoteOptonsItem.forEach((item) => {
        if (this.options[item.filedKey]) return false;
        if (item.filedKey !== filedKey) return false;
        if (item.downOptions.indexOf(0) === -1) {
          const myoptions = item.options.filter(opitem => item.downOptions.indexOf(opitem.id) > -1);
          this.$set(this.options, item.filedKey, myoptions);
        } else {
          ApioptionsData[`api${this.GVCC.componentName}${item.filedKey}`](this.activeRow).then((res) => {
            if (item.props) {
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
    getLableByValue(options, downOptions, value) {
      let text = value;
      for(let i = 0; i < options.length; i++) {
        // options的value和参数value相同并且options的id必须在下下拉选项中
        if (options[i].value + '' === value && (downOptions.indexOf(options[i].id) > -1)) {
          text = options[i].label
          break
        }
      };
      return text;
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
    onTreeCheckedChange(formItem, checkedDate) {
      if (this.actionType) {
        if (formItem.treeTabelType === 'string') {
          this.editForm[formItem.filedKey] = checkedDate.id ? checkedDate.id + '' : '';
        } else {
          this.editForm[formItem.filedKey] = checkedDate.id ? checkedDate.id : '';
        }        
        this.editForm[formItem.tableShowFrom] = checkedDate.title || '';
      } else {
        this.filterForm[formItem.filedKey] = checkedDate.id ? checkedDate.id : '';
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
      const option = item.options.filter(opitem => (`${opitem.value}`) === (`${value}`) && (item.downOptions.indexOf(opitem.id) > -1));
      if (option.length) {
        text = option[0].label;
      }
      return text || value;
    },
    validateSingleSelect(rule, value, callback) {
      if (value === null || value === undefined || (`${value}`).length === 0) {
        callback(new Error('该项不能为空'));
      } else {
        callback();
      }
    },
    // 表格选中事件处理
    selectedChange(selection) {
      this.selectedData = selection;
    },
    rowDblClick(row, index) {
      this.$emit('rowDblClick', row, index);
    },
    // 模态框关闭时，重置表单项
    // 重置确认按钮的loading状态
    modalVisible(visible) {
      if (!visible) {
        this.clearEditTreeChecked = !this.clearEditTreeChecked;
        this.$refs.editForm.resetFields();
        this.loading = false;
        this.actionType = 0;
      } else {
        if (this.actionType === 1) {
          this.formItems = this.getFormItems(this._getEditForm());
          this.editForm = this._getEditForm();
        }
        this.getOptions();
      }
    },
    addRow() {
      this.actionType = 1;
      this.isModelShow = true;
    },
    // 修改数据时将当前行的数据填充到表单内
    updateRow(tablerow) {
      this.isModelShow = true;
      this.actionType = 2;
      this.activeRow = tablerow.row;
      this.formItems = this.getFormItems(this._getEditForm(this.activeRow));
      this.editForm = this._getEditForm(this.activeRow);
      // this.$nextTick(()=>{
      //   for (const key in this.editForm) {
      //     if (typeof this.editForm[key] === 'number' || typeof this.editForm[key] === 'undefined') {
      //       this.editForm[key] = tablerow.row[key] - 0;
      //     } else {
      //       this.editForm[key] = tablerow.row[key];
      //     }
      //   }
      // });
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
        let key = 'ids';
        // 如果是ls开头则参数有区别
        // 为后台传参兼容做的判断，无逻辑意义判断，不通用
        if (this.GVCC.componentName.indexOf('ls') === 0) {
          key = `${this.GVCC.componentName}Ids`;
        }
        const param = {};
        param[key] = ids;
        this.deleteRows(param);
      }
    },
    deleteRows(row) {
      this.$Modal.confirm({
        title: '确认',
        content: '<p>确定要删除所选记录吗？</p>',
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
      const data = Object.assign({}, this.editForm, this.customPostData);
      const apiconfig = this.GVCC.apiConfig.create;
      const param = this.customBeforeSend && this.customBeforeSend(data, this.options);
      axios.post(apiconfig.url, param || data, apiconfig.config).then((res) => {
        if (res.data.success) {
          // 新增数据成功后是否将模态框关闭
          this.isModelShow = modalVisible;
          this.$Message.success('新增数据成功！');
          this.retrieve();
        } else {
          this.$Message.warning(res.data.msg || '新增数据失败！');
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
      axios.post(`${apiconfig.url}`, data, apiconfig.config).then((res) => {
        if (res.data.success) {
          this.$Message.success('删除数据成功！');
          this.retrieve();
        } else {
          this.$Message.warning(res.data.msg || '删除数据失败！');
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
      data.id = this.activeRow.id;
      const apiconfig = this.GVCC.apiConfig.update;
      const param = this.customBeforeSend && this.customBeforeSend(data, this.options);
      axios.post(apiconfig.url, param || data, apiconfig.config).then((res) => {
        if (res.data.success) {
          this.isModelShow = false;
          this.$Message.success('修改数据成功！');
          this.retrieve();
        } else {
          this.$Message.warning(res.data.msg || '修改数据失败！');
        }
      }).catch((e) => {
        this.$Message.error('修改数据失败！');
      }).finally(() => {
        this.loading = false;
      });
    },
    // 查
    retrieve() {
      // 如果自定义了表格数据则不再调用查询方法
      if (this.customTableData) {
        this.$emit('getcustomTableData');
        return;
      }
      const query = { currentPage: this.page.current, pageSize: this.page.pageSize };
      let data = {};
      // 搜索时只传参已经填写的项
      Object.keys(this.filterForm).forEach((item) => {
        if (typeof this.filterForm[item] !== 'undefined' && (`${this.filterForm[item]}`).length > 0 && (!Array.isArray(this.filterForm[item]))) {
          data[item] = this.filterForm[item];
        }
      });
      const apiconfig = this.GVCC.apiConfig.retrieve;
      if (apiconfig.config.headers['Content-Type'] === 'application/x-www-form-urlencoded') data = qs.stringify(data);
      axios.post(`${apiconfig.url}?${qs.stringify(query)}`, data, apiconfig.config).then((res) => {
        if (res.data.success) {
          this.$emit('retrieveFinish', res.data.data.list);
          this.tableData = res.data.data.list;
          this.page = {
            total: res.data.data.total,
            current: res.data.data.pageNum ? res.data.data.pageNum : 1,
            pageSize: res.data.data.pageSize,
          };
        } else {
          this.tableData = [];
          this.$Message.warning(res.data.msg || '查询数据失败！');
        }
      }).catch(() => {
        this.$Message.error('查询数据失败！');
      });
    },
    filter(clearData = {}) {
      let query = { currentPage: this.page.current, pageSize: this.page.pageSize };
      let data = {};
      // 搜索时只传参已经填写的项
      for (const key in this.filterForm) {
        if (typeof this.filterForm[key] !== 'undefined' && (`${this.filterForm[key]}`).length > 0) {
          data[key] = this.filterForm[key];
        }
      }
      if (this.customBeforeFilter) {
       ({ data, query } = this.customBeforeFilter(data, query));
      }
      const apiconfig = this.GVCC.apiConfig.filter;
      if (apiconfig.config.headers['Content-Type'] === 'application/x-www-form-urlencoded') data = qs.stringify(data);
      axios.post(`${apiconfig.url}?${qs.stringify(query)}`, data, apiconfig.config).then((res) => {
        if (res.data.success) {
          if (this.setHighlight) {
            this.tableData = this.setHighlight(clearData, res.data.data.list);
          } else {
            this.tableData = res.data.data.list;
          }
          this.page = {
            total: res.data.data.total,
            current: res.data.data.pageNum ? res.data.data.pageNum : 1,
            pageSize: res.data.data.pageSize,
          };
        } else {
          this.tableData = [];
          this.$Message.warning('查询数据失败！');
        }
      }).catch(() => {
        this.tableData = [];
        this.$Message.error('查询数据失败！');
      });
    },
    // 筛选只在表单项中显示的数据项
    getFormItems(editForm) {
      return this.GVCC.componentData.filter((item => (item.isShowInForm && Object.keys(editForm).indexOf(item.filedKey) > -1)));
    },
    // 初始化表单的model, text类型默认职位空字符串，下拉选类型默认为选项的第一个值
    // eslint-disable-next-line no-underscore-dangle
    _getEditForm(defaultData = {}) {
      const o = {};
      this.GVCC.componentData.forEach((item) => {
        if (item.isShowInForm) {
          switch (item.formInputType) {
            case 'text':
              o[item.filedKey] = (defaultData[item.filedKey] === undefined) ? '' : defaultData[item.filedKey];
              break;
            case 'select':
              // eslint-disable-next-line no-case-declarations
              const options = item.options.filter((opitem) => {
                return opitem.id === item.downOptions[0];
              });
              // 如果下拉选择为动态获取的数据则从options中获取
              let value = null;
              if (options[0].value === -1) {
                // 判断动态options是否已经获取完成
                if (this.options[item.filedKey]) {
                  if (this.options[item.filedKey][0]) {
                    value = this.options[item.filedKey][0].value;
                  }
                }                            
              } else {
                value = options[0].value;
              }
              o[item.filedKey] = (defaultData[item.filedKey] === undefined) ? value : defaultData[item.filedKey];
              break;
            case 'number':
              o[item.filedKey] = (defaultData[item.filedKey] === undefined) ? 0 : defaultData[item.filedKey];
              break;
            default:
              o[item.filedKey] = (defaultData[item.filedKey] === undefined) ? '' : defaultData[item.filedKey];
              break;
          }
        }
        // 通过自定义的格式化函数再次筛选
        if (item.formShowFormatter) {
          var formatterFun = new Function('item', 'o', item.formShowFormatter);
          if (!formatterFun.call(this, item, o)) {
            delete o[item.filedKey];
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
    if (this.isRowActionShow) {
      this.actionColumns = [
        {
          title: '操作',
          key: 'action',
          align: 'center',
          isShowInForm: 'false',
          width: (typeof this.rowActionRender('nums') === 'number') ? this.rowActionRender('nums') * 80 : 130,
          fixed: 'right',
          render: this.rowActionRender(),
        },
      ];
    } else {
      this.actionColumns = [];
    }
    this.formItems = this.getFormItems(this._getEditForm());
    this.editForm = this._getEditForm();
    this.filterForm = this._getFilterForm();
    this.retrieve();
  },
};
</script>

<style lang="stylus" scoped>
.crud-box
 background-color #ffffff
 height calc(100vh - 70px)
 overflow auto
 padding 0 10px
 .filter-box
  padding-top 25px
  button
   margin-right 7px
 .actions-box
  padding 0 0 15px
  &>div
   display inline-block
   vertical-align middle
  button
   margin-right 7px
 .page-box
  margin-top 15px
  text-align right
</style>
