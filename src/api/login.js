/* @Description 模拟登录登出 
 * @Author: zhangyang 
 * @Date: 2020-05-25 09:44:02 
 * @Last Modified by: zhangyang
 * @Last Modified time: 2020-05-25 10:24:40
 */

export function apilogin(params) {
  return new Promise((resolve, reject) => {
    resolve({ data: {success: true} })
  })
}

export function apilogout() {
  return new Promise((resolve, reject) => {
    resolve({ data: {success: true} });
  });
}
