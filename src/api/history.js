import { fetch, post, patch, del} from '../libs/http'

// 用户运动历史
export function findHistoryBySport (params) {
  return fetch('sport-history/page', params)
}

// 用户饮食历史
export function findHistoryByDiet (params) {
  return fetch('diet-history/page', params)
}

//用户体征查询
export function findUserSigns (data) {
  return fetch('user-physical-signs/page', data)
}
//用户体征添加
export function doAddUserSigns (params) {
  return post('user-physical-signs', params)
}
