import {doLogin, doSmsLogin} from "../../api/user";
import utils from '@/utils/util'
export default {
  state: {
    userId: '',
    imgUrl: '',
    // hmAppToken: localStorage.getItem('hmAppToken'),
    hmAppInfo: null,
    phone: '',
    name: '',
    gender: '',
    birthday: '',
    idNumber: '',
    studentNumber: '',
    hmAppGroupInfo:null,
    groupType: 0,
    hasGetInfo: false,
    token:utils.getToken()
  },
  mutations: {
    setToken (state, token) {
      state.token = token
      utils.setToken(token)
    },
    setAvatar(state, imgUrl) {
      state.imgUrl = imgUrl
    },
    setUserId(state, id) {
      state.userId = id
    },
    setName(state, name) {
      state.name = name
    },
    setUserPhone(state, phone) {
      state.phone = phone
    },
    setUserGender(state, gender) {
      state.gender = gender
    },
    setUserBirthday(state, birthday) {
      state.birthday = birthday
    },
    setUserIdNumber(state, idNumber) {
      state.idNumber = idNumber
    },
    setUserStudentNumber(state, studentNumber) {
      state.studentNumber = studentNumber
    },
    // setHmAppToken(state, hmAppToken) {
    //   state.hmAppToken = hmAppToken
    //   localStorage.setItem('hmAppToken', hmAppToken)
    // },
    setHmAppInfo(state, hmAppInfo) {
      state.hmAppInfo = hmAppInfo
      localStorage.setItem('hmAppInfo', JSON.stringify(hmAppInfo))
    },
    setHmAppGroupInfo(state, hmAppGroupInfo) {
      state.hmAppGroupInfo = hmAppGroupInfo
      localStorage.setItem('hmAppGroupInfo', JSON.stringify(hmAppGroupInfo))
    },
    setHasGetInfo(state, status) {
      state.hasGetInfo = status
    },
    setGroupType(state, groupType) {
      state.groupType = groupType
    }
  },
  getters: {},
  actions: {
    // 登录
    handleLogin({commit}, params) {
      return new Promise((resolve, reject) => {
        if (!params.loginStatus) {
          let info = {
            phone:params.phone,
            password:params.password
          }
          doLogin(info).then((res) => {
              if (res.code === 200) {
                // 登录成功s
                const data = res.data
                const info = data.userInfo
                const groupInfo = data.userGroupInfo
                // console.log(data)
                const groupType = utils.getGroupType(data.userGroupInfo)
                commit('setAvatar', info.imgUrl)
                commit('setUserId', info.id)
                commit('setName', info.name)
                commit('setUserPhone', info.phone)
                // commit('setHmAppToken', data.token)
                commit('setToken', data.token)
                commit('setHmAppInfo', info)
                commit('setHmAppGroupInfo', groupInfo)
                commit('setGroupType', groupType)
                commit('setHasGetInfo', true)
              }
              resolve(res)
            })
            .catch((err) => {
              reject(err)
            })

        } else {
          let info = {
            phone:params.phone,
            code:params.code
          }
          doSmsLogin(info).then((res) => {
            if (res.code === 200) {
              // 登录成功s
              const data = res.data
              const info = data.userInfo
              const groupInfo = data.userGroupInfo
              // console.log(data)
              const groupType = utils.getGroupType(data.userGroupInfo)
              commit('setAvatar', info.imgUrl)
              commit('setUserId', info.id)
              commit('setName', info.name)
              commit('setUserPhone', info.phone)
              // commit('setHmAppToken', data.token)
              commit('setToken', data.token)
              commit('setHmAppInfo', info)
              commit('setHmAppGroupInfo', groupInfo)
              commit('setGroupType', groupType)
              commit('setHasGetInfo', true)
            }
            resolve(res)
          })
            .catch((err) => {
              reject(err)
            })
        }
      })
    },

    // 退出登录
    handleLogOut({state, commit}) {
      // commit('setHmAppToken', '')
      commit('setToken', '')
      commit('setHmAppInfo', null)
      commit('setHmAppGroupInfo', null)
      localStorage.setItem('hmAppIntake', 0)
    },
    // 获取用户相关信息
    getUserInfo({state, commit}) {
      const obj = JSON.parse(localStorage.getItem('hmAppInfo'))
      const obj2 = JSON.parse(localStorage.getItem('hmAppGroupInfo'))
      const groupType = utils.getGroupType(obj2)
      commit('setAvatar', obj.imgUrl)
      commit('setUserId', obj.id)
      commit('setName', obj.name)
      commit('setUserPhone', obj.phone)
      commit('setHmAppGroupInfo', obj2)
      commit('setHmAppInfo', obj)
      commit('setGroupType', groupType)
      commit('setHasGetInfo', true)
    }
  }
}
