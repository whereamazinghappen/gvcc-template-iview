// 根据上下级关联的key值将list转化为tree结构
export function transListToTree(list, key) {
  const res = list.filter((parent) => {
    const branch = list.filter(child => parent.id === child[key || 'pId']);
    parent.children = branch;
    return parent[key || 'pId'] === 0;
  });
  return res;
}

export function formatterDate(timestap, spliter = '-') {
  if (timestap) {
    const date = new Date(timestap);
    const year = date.getFullYear();
    const month = date.getMonth() + 1 > 9 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1);
    const day = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
    return [year, month, day].join(spliter);
  }
  return '';
}
