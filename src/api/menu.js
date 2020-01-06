import { fetch, post, patch, del} from '../libs/http'

// 菜谱类型
export function findMenuType (params) {
  return fetch('menu-type/list', params)
}

// 获取菜品信息
export function findMenu (params) {
  return fetch('menu/page', params)
}
// 获取菜品标准成分信息
export function findStandardMenuComposition (params) {
  return fetch('menu-standard-composition/list-by-menu-code', params)
}

// 获取自定义食物信息
export function findCustomFood (params) {
  return fetch('custom-food/page', params)
}

// 添加自定义食物信息
export function doAddCustomFood (data) {
  return post('custom-food', data)
}

//食物成分表（一般营养素）
export function findNutri (params) {
  return fetch('nutri/findByName', params)
}

//获取地址列表
export function findAddress (params) {
  return fetch('address/list', params)
}
