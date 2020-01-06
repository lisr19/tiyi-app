<template>
  <div class="hm-forget">
    <div class="hm-info">
      <div class="hm-info-form">
        <div v-if="!checkStatus">
          <div class="hm-field-box">
            <label class="hm-field-must">手机：</label>
            <input type="text" placeholder="请填写你的手机号码" maxlength="12" v-model="form.phone" />
          </div>
          <div class="hm-field-box">
            <label class="hm-field-must">验证码：</label>
            <input type="text" placeholder="点击验证码获取" v-model="form.checkCode" />
            <div class="hm-field-btn" ref="code" @click="getCode">验证码</div>
          </div>
        </div>
        <div v-if="checkStatus">
          <div class="hm-field-box" style="margin-top: 0.5rem">
            <label class="hm-field-must">密码：</label>
            <input type="password" placeholder="输入6至20位密码" v-model="form.password" />
          </div>
          <div class="hm-field-box">
            <label class="hm-field-must">确认密码：</label>
            <input type="password" placeholder="确认密码" v-model="form.repassword" />
          </div>
        </div>
      </div>
      <div class="hm-btn2" style=" margin: 0.5rem auto;" v-if="checkStatus" @click="doUserEditPassword">修改</div>
    </div>
  </div>
</template>

<script>
import utils from '@/utils/util'
import { Toast } from 'mint-ui'
import { sendCode, checkCode } from '../../api/sms'
import { doUserRegister } from '../../api/user'

export default {
  name: 'forget-password',
  data() {
    return {
      debug: true,
      codeStatus: false,
      checkStatus:false,//校验状态
      form: {
        phone: '',
        checkCode: '',
        password: '',
        repassword: ''
      }
    }
  },
  methods: {
    checkPhone(phone) {
      let msg = ''
      if (this.debug) console.log('checkPhone')
      if (utils.validatePhone(phone) !== '') {
        msg = utils.validatePhone(phone)
        Toast({
          message: msg,
          position: 'bottom',
          duration: 2000
        })
      }
      return msg === ''
    },
    //获取验证码
    async getCode() {
      if (this.checkPhone(this.form.phone)) {
        await sendCode({ phone: this.form.phone })
        if (this.codeStatus) {
          Toast({
            message: '60s内只能获取一次验证码',
            position: 'bottom',
            duration: 2000
          })
          return
        }
        this.reGetCheckNum()
      }
    },
    checkCode() {
      let res = checkCode({ phone: this.form.phone, code: this.form.checkCode })
      if (this.debug) console.log(res)
    },
    async doRegister() {
      if (this.formSubmit(this.form)) {
        //表单校验
        if (this.imgArray.length > 0) {
          this.form.imgUrl = this.imgArray[0]
        }
        this.form.birthday = this.form.birthday + ' 00:00:00'
        let res = await doUserRegister(this.form)
        if (res.code === 200) {
          Toast({
            message: '注册成功',
            position: 'bottom',
            duration: 2000
          })
          this.$router.push({ name: 'login' })
        } else {
          Toast({
            message: '网络错误',
            position: 'bottom',
            duration: 2000
          })
        }
      }
    },

    //验证码60s后重新获取
    reGetCheckNum: function() {
      let self = this
      if (!self.codeStatus) {
        self.codeStatus = true
        let checkNum = self.$refs.code
        let h
        let time = 60
        h = setInterval(function() {
          if (time < 10) {
            time = '0' + time
          }
          checkNum.className = 'hm-field-btn hm-field-btn-active'
          checkNum.innerHTML = time + '秒'

          time--
          if (time < 0) {
            clearInterval(h)
            checkNum.className = 'hm-field-btn'
            checkNum.innerHTML = '验证码'
            self.codeStatus = false
          }
        }, 1000)
      }
    },

    //密码修改
    async doUserEditPassword() {
      if (this.formSubmit(this.form)) {
        let params = {
          userId: this.userId,
          password: this.form.password
        }
        let res = await doUserEditPassword(params)
        if (res.code === 200) {
          Toast({
            message: '修改成功',
            position: 'bottom',
            duration: 2000
          })
          this.form = {}
        } else {
          Toast({
            message: '网络错误',
            position: 'bottom',
            duration: 2000
          })
        }
      }
    },
    //表单验证
    formSubmit(form) {
      let msg = ''
      let status = false
      if (utils.validatePassword(form.password) !== '') {
        msg = utils.validatePassword(form.password)
      } else if (form.repassword !== form.password) {
        msg = '两次密码不相同'
      }
      if (msg !== '') {
        Toast({
          message: msg,
          position: 'bottom',
          duration: 2000
        })
      } else {
        status = true
      }
      return status
    }
  }
}
</script>

<style lang="less" scoped>
@import '../../assets/style/common.less';

.hm-forget {
  width: 100%;
  padding: 2.02rem 0.5rem 1rem 0.5rem;
}

.hm-select {
  width: 100%;
  font-size: 0.28rem;
  font-weight: 400;
  color: @black;
  line-height: 0.4rem;
}
</style>
