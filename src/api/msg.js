import { fetch, post, patch, del } from '../libs/http'

// 用户反馈信息添加
export function doAddFeedBack(data) {
  return post('feedback', data)
}

//查询推送消息
export function findPushMessage(params) {
  return fetch('push-message/page', params)
}

//推送消息已读
export function doReadPushMessage(params) {
  return patch('push-message/read', params)
}
