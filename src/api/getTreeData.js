import axios from 'axios';

const ApitreeData = {
  apioperatorId() {
    // 获取部门树
    const url = '/department/queryTree';
    const data = {};
    const config = {
      responseType: 'json',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    return axios.post(url, data, config);
  },
  apiapprovalUserId() {
    // 获取部门树
    const url = '/department/queryTree';
    const data = {};
    const config = {
      responseType: 'json',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    return axios.post(url, data, config);
  },
  apiuseDeptId() {
    // 获取部门树
    const url = '/department/queryTree';
    const data = {};
    const config = {
      responseType: 'json',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    return axios.post(url, data, config);
  },
  apidepartment() {
    // 获取部门树
    const url = '/dept/getList';
    const data = {};
    const config = {
      responseType: 'json',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    return axios.post(url, data, config);
  },
  apiUserdeptId() {
    // 获取部门树
    const url = '/dept/getList';
    const data = {};
    const config = {
      responseType: 'json',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    return axios.post(url, data, config);   
  },
  apiDeptpId() {
    // 获取部门树
    const url = '/dept/getList';
    const data = {};
    const config = {
      responseType: 'json',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    return axios.post(url, data, config);
  },
  apipId() {
    // 获取菜单列表
    const url = '/menu/getList';
    const data = {};
    const config = {
      responseType: 'json',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    return axios.post(url, data, config);
  },
  apimenu() {
    // 获取菜单列表
    const url = '/menu/getList';
    const data = {};
    const config = {
      responseType: 'json',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    return axios.post(url, data, config);
  },
};

export default ApitreeData;
