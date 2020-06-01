import axios from 'axios';

const ApioptionsData = {
  apidepartmentUser(row) {
    // 获取部门下的人员
    const param = { department: row.id };
    const url = '/user/queryByField';
    const config = {
      responseType: 'json',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    return axios.post(url, param, config);
  },
  apiRoleGetlist() {
    const param = {};
    const url = '/role/getList';
    const config = {
      responseType: 'json',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    return axios.post(url, param, config);
  },
  apitoolTypeId() {
    const param = {};
    const url = '/LsToolType/getAll';
    const config = {
      responseType: 'json',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    return axios.post(url, param, config);
  },
};

export default ApioptionsData;
