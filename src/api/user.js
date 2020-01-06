import { fetch, post, patch, del} from '../libs/http'

// 用户登录
export function doLogin (userInfo) {
  return post('user/login', userInfo)
}

// 用户短信登录
export function doSmsLogin (params) {
  return post('user/sms-login', params)
}

// 发送用户短信
export function doSendCode (params) {
  return post('user/send-code', params)
}

//用户信息修改
export function doUserEdit (userInfo) {
  return patch('user', userInfo)
}

//用户密码修改
export function doUserEditPassword (userInfo) {
  return patch('user/update-pwd', userInfo)
}

//用户注册
export function doUserRegister (userInfo) {
  return post('user/register', userInfo)
}
