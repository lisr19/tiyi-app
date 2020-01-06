import Cookies from 'js-cookie'
// cookie保存的天数
import config from '../Config'

export const TOKEN_KEY = 'hmAppToken'

export const setToken = (token) => {
  Cookies.set(TOKEN_KEY, token, { expires: config.cookieExpires || 1 })
}

export const getToken = () => {
  const token = Cookies.get(TOKEN_KEY)
  if (token) return token
  else return false
}


//手机号码校验
function validatePhone(phone) {
  var msg = '';
  const regex = /^0?(1[3456789][0-9])[0-9]{8}$/;
  if(phone === '' || phone === null){
    msg = '手机号码不能为空'
  }else if(!regex.test(phone)){
    msg = '请填写合法手机号码'
  }
  return msg
}

//密码校验
function validatePassword(password) {
  var msg = '';
  const regex = /^[^~# $……^。，；：“”‘’{}()[`%*&|+<>/,.;:'"=\]\\]{6,20}$/;
  if(password === '' || password === null){
    msg = '密码不能为空'
  }else if(!regex.test(password)){
    msg = '请填写合法密码'
  }
  return msg;
}

//姓名校验
function validateName(name){
  var msg = '';
  const regex = /^[\u4E00-\u9FA5A-Za-z\s]+(·[\u4E00-\u9FA5A-Za-z]+)*$/;
  if(name === '' || name === null){
    msg = '姓名不能为空'
  }else if(!regex.test(name)){
    msg = '请填写合法姓名'
  }
  return msg;
}

//学号校验
function validateStudentNumber(studentId){
  var msg = '';
  const regex = /^[0-9a-zA-Z]+$/;
  if(!regex.test(studentId)){
    msg = '请填写合法学号'
  }
  return msg;
}

/**
 * 身份证合法性检查
 * @param {string} code - 身份证号码
 * @returns {Boolean} 合法返回true，非法返回false
 */
function validateIdCard (code) {
  var city = {
    11: '北京',
    12: '天津',
    13: '河北',
    14: '山西',
    15: '内蒙古',
    21: '辽宁',
    22: '吉林',
    23: '黑龙江 ',
    31: '上海',
    32: '江苏',
    33: '浙江',
    34: '安徽',
    35: '福建',
    36: '江西',
    37: '山东',
    41: '河南',
    42: '湖北 ',
    43: '湖南',
    44: '广东',
    45: '广西',
    46: '海南',
    50: '重庆',
    51: '四川',
    52: '贵州',
    53: '云南',
    54: '西藏 ',
    61: '陕西',
    62: '甘肃',
    63: '青海',
    64: '宁夏',
    65: '新疆',
    71: '台湾',
    81: '香港',
    82: '澳门',
    91: '国外 '
  };
  // if (code === undefined || code.length === 0) {
  //   return false;
  // }
  if (code.length !== 15 && code.length !== 18) {
    return false;
  }
  if (!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)) {
    return false;
  } else if (!city[code.substr(0, 2)]) {
    return false;
  } else {
    // 18位身份证需要验证最后一位校验位
    if (code.length === 18) {
      code = code.split('');
      // ∑(ai×Wi)(mod 11)
      // 加权因子
      const factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
      // 校验位
      const parity = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
      var sum = 0;
      var ai = 0;
      var wi = 0;
      for (var i = 0; i < 17; i++) {
        ai = parseInt(code[i]);
        wi = factor[i];
        sum += ai * wi;
      }
      if (parity[sum % 11] !== code[17].toUpperCase()) {
        return false;
      }
    }
  }
  return true;
}

//日期格式formatDate(new Date(), "yyyy-MM-dd hh:mm:ss.S")
function formatDate (date, fmt) {
  var o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    'S': date.getMilliseconds()
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
    }
  }
  return fmt;
}


//校验数字  非零开头的最多带三位小数的数字
function validateNumber(num){
  const regex = /^([1-9][0-9]*)+(.[0-9]{1,3})?$/;
  return regex.test(num);
}

//校验数字  非零开头的正整数
function validateNumber2(num){
  const regex = /^([1-9][0-9]*)$/;
  return regex.test(num);
}

//对象内容对比
function ObjectContrast(objA,objB){
  let array = []
  for(let i in objA){
    if(Date.prototype.isPrototypeOf(objA[i]) || Date.prototype.isPrototypeOf(objB[i])){
      objA[i] = new Date(objA[i]).Format("yyyy-MM-dd");
      objB[i] = new Date(objB[i]).Format("yyyy-MM-dd");
    }
    if(Array.prototype.isPrototypeOf(objA[i]) || Array.prototype.isPrototypeOf(objB[i])){
      continue;
    }
    if(objA[i] != objB[i]){
      array.push(i)
    }
  }
  return array
}

/**
 * @array转树(array中必须含有id（自身标记string/int），pid（父亲标记string/int）)
 * @params change(自定义function，参数为循环元素),array(源数组)
 **/
function array2tree(array, pid = '0') {
  let tree = []
  array.forEach(v => {
    v.id = v.id.toString();
    v.pid = v.pid.toString()
    if (v.pid === pid) {
      let children = array2tree(array, v.id)
      // if (children.length > 0) {
        v.children = children
        v.expanded = false
      // }
      tree.push(v)
    }
  })
  return tree
}

/**
 * 获取结束时间
 * @params num(天数)
 **/
function dayOut(num){
  let day = new Date().getTime();
  let ms = 86400000;
  let endMs = num*ms;
  let endDay = new Date((day-endMs)*1).toLocaleDateString();;
  return endDay
}


function typeOut(type){
  let rtn = ''
  switch (type){
    case 0:
      rtn = '加餐';
    break;
    case 1:
      rtn = '早餐';
    break;
    case 2:
      rtn = '午餐';
    break;
    case 3:
      rtn = '晚餐';
    break;
  }
  return rtn
}

// 判断用户是否正处于干预期
// 对用户所有所在的组别进行判断
// 若当前时间处理级别的startTime和endTime
// 且组别的类型为干预组
// 则用户处于干预组
function getGroupType(info) {
  //console.log(info)
  // 默认为对照组
  // let groupType = 0
  let groupType = 1
  if(info===null||info===undefined){
    return groupType
  }
  let t = info.some(item => {
    let startTime = new Date(item.startTime)
    let endTime = new Date(item.endTime)
    let nowTime = new Date()
    if(startTime <= nowTime && nowTime <= endTime && item.type === 1) {
      return true
    }
    return false
  })
  if (t) {
    groupType = 1
  }
  return groupType
}

export default {
  validatePhone: validatePhone,
  validatePassword: validatePassword,
  validateName:validateName,
  validateStudentNumber:validateStudentNumber,
  validateIdCard:validateIdCard,
  validateNumber:validateNumber,
  validateNumber2:validateNumber2,
  ObjectContrast:ObjectContrast,
  array2tree:array2tree,
  typeOut:typeOut,
  dayOut:dayOut,
  formatDate:formatDate,
  getGroupType: getGroupType,
  setToken:setToken,
  getToken:getToken
}
