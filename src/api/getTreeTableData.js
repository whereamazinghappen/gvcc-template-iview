import axios from 'axios';
import qs from 'querystring';

const ApitreeTableData = {
  apiapprovalUserId(param) {
    // 根据部门获取该部门下的人员
    const url = '/user/queryByField';
    const data = { department: param.id };
    const config = {
      responseType: 'json',
      // headers: {
      //   'Content-Type': 'application/json',
      // },
    };
    return axios.post(url, qs.stringify(data), config);
  },

  apioperatorId(param) {
    // 根据部门获取该部门下的人员
    const url = '/user/queryByField';
    const data = { department: param.id };
    const config = {
      responseType: 'json',
      // headers: {
      //   'Content-Type': 'application/json',
      // },
    };
    return axios.post(url, qs.stringify(data), config);
  },
};

export default ApitreeTableData;
