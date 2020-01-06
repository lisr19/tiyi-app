import { fetch, post, patch, del,post4JSON,patch4JSON} from '../libs/http'

// 用户饮食记录
export function doAddDiet (data) {
  return post4JSON('diet-history', data)
}

// 用户运动记录添加
export function doAddSport (data) {
  return post('sport-history', data)
}
// 用户运动记录修改
export function doEditSport (data) {
  return patch4JSON('sport-history', data)
}
// 用户运动记录特殊运动删除
export function doDelOtherSport (params) {
  return del('sport-history/deleteOtherSportHistory', params)
}
