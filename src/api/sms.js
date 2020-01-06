import { fetch, post, patch, del } from '../libs/http'

// 检验短信验证码
export function checkCode(info) {
  return post('SMS/checkCode', info)
}

// 发送验证短信
export function sendCode(info) {
  return post('SMS/sendCode', info)
}
