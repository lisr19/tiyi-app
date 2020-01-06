<template>
  <div>
    <div class="hm-login">
      <img src="../../assets/logo/logo.png" class="hm-login-logo"/>
      <div class="hm-login-form">
        <div class="hm-login-box" style="border-bottom: 0.02rem solid #E8E8E8">
          <input
            type="text"
            placeholder="手机号/账号"
            v-model="loginForm.phone"
            :style="{backgroundImage:'url('+imgUrl.username+')'}"
            maxlength="15"
            @blur="scrollRefresh"
          />
        </div>
        <div class="hm-login-box" v-show="!loginStatus">
          <input
            :type="passwordStatus?'password':'text'"
            placeholder="密码"
            :style="{backgroundImage:'url('+imgUrl.password+')'}"
            v-model="loginForm.password"
            maxlength="20"
            @blur="scrollRefresh"
          />
          <div class="hm-login-box-switch">
            <input id="switch" type="checkbox" class="switch" v-model="passwordStatus"/>
          </div>
        </div>
        <div class="hm-login-box" v-show="loginStatus">
          <input
            type="number"
            placeholder="输入6位验证码"
            v-model="loginForm.code"
            :style="{backgroundImage:'url('+imgUrl.password+')'}"
            oninput="if(value.length>6)value=value.slice(0,6)"
            @blur="scrollRefresh"
          />
          <div class="hm-field-btn" ref="code" @click="getCode">{{codeContent}}</div>
        </div>
      </div>
      <div class="hm-login-tip" @click="changeLoginStatus">{{loginStatus?'密码登录':'验证码登录'}}</div>
      <div class="hm-btn1" style=" margin-top: 0.4rem;" @click="handleSubmit">登录</div>
      <!--<router-link tag="div" to="/forget_password" class="hm-login-tip">忘记密码？</router-link>-->
      <router-link tag="div" to="/register" class="hm-btn2" style="margin: 3.26rem auto 0 auto;">注册</router-link>
    </div>
  </div>
</template>

<script>
  import utils from '@/utils/util'
  import {Toast} from 'mint-ui'

  import {doSendCode} from '../../api/user'

  import {mapActions} from 'vuex'

  export default {
    name: 'login',
    data() {
      return {
        loginStatus:false,//登录状态false为密码登录，true为验证码登录
        debug: true,
        codeStatus: false,
        codeContent:'验证码',
        imgUrl: {
          username: require('../../assets/logo/username.png'),
          password: require('../../assets/logo/password.png')
        },
        passwordStatus: true,
        loginForm: {
          phone: '',
          password: '',
          code:''
        }
      }
    },
    methods: {
      ...mapActions(['handleLogin']),
      handleSubmit() {
        if (this.formSubmit(this.loginForm)) {
          let form = this.loginForm
          form.loginStatus = this.loginStatus
            this.handleLogin(this.loginForm).then((res) => {
              if (res.code === 200) {
                Toast({
                  message: '登录成功',
                  position: 'bottom',
                  duration: 2000
                })
                this.$router.push({name: 'home'})
              } else {
                Toast({
                  message: res.data,
                  position: 'bottom',
                  duration: 2000
                })
              }
            })
        }
      },
      changeLoginStatus(){
        this.loginStatus = !this.loginStatus
      },
      //刷新滑动
      scrollRefresh(){
        window.scroll(0,0);
      },
      //表单验证
      formSubmit(form) {
        let msg = ''
        let status = false
        if (utils.validatePhone(form.phone) !== '') {
          msg = utils.validatePhone(form.phone)
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
      },
      //获取验证码
      async getCode() {
        if (this.formSubmit(this.loginForm)) {
          if(!this.codeStatus){
            let res = await doSendCode({ phone: this.loginForm.phone })
            if(res.code === 200){
              Toast({
                message: '发送成功',
                position: 'bottom',
                duration: 2000
              })
              this.reGetCheckNum()
            }else{
              Toast({
                message: '发送失败',
                position: 'bottom',
                duration: 2000
              })
            }
          }else{
            Toast({
              message: '60s内只能获取一次验证码',
              position: 'bottom',
              duration: 2000
            })
            return
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
            // checkNum.innerHTML = time + '秒'
            self.codeContent = time + '秒'
            time--
            if (time < 0) {
              clearInterval(h)
              checkNum.className = 'hm-field-btn'
              // checkNum.innerHTML = '验证码'
              self.codeContent = '验证码'
              self.codeStatus = false
            }
          }, 500)
        }
      },
    }
  }
</script>

<style lang="less" scoped>
  @import '../../assets/style/common.less';

  .hm-login {
    width: 100%;
    padding: 0.56rem 0.5rem 1rem 0.5rem;
    text-align: center;
    .hm-login-logo {
      width: 2.46rem;
      height: 2.46rem;
    }
    .hm-login-form {
      width: 6.5rem;
      background: @white;
      margin-top: 0.72rem;
      border-radius: 0.1rem;
      border: 0.02rem solid rgba(235, 235, 235, 1);
      .hm-login-box {
        width: 100%;
        height: 1.06rem;
        position: relative;
        .hm-field-btn{
          position: absolute;
          right: 0.2rem;
          top:0.2rem;
          width: 0.94rem;
          height: 0.6rem;
          border: 0.02rem solid @blue;
          padding-top: 0.14rem;
          font-size: 0.20rem;
          font-weight: 400;
          color: @blue;
          line-height: 0.30rem;
          border-radius: 0.1rem;
          text-align: center;
        }
        input {
          outline: none;
          font-size: 0.28rem;
          font-weight: 400;
          color: @black;
          line-height: 0.4rem;
          width: 100%;
          height: 100%;
          background-repeat: no-repeat;
          background-size: 0.38rem;
          background-position: 0.4rem;
          padding: 0 1.54rem 0 1.02rem;
        }
        input::-webkit-input-placeholder {
          font-size: 0.28rem;
          font-weight: 400;
          color: rgba(205, 205, 205, 1);
          line-height: 0.4rem;
        }
        .hm-login-box-switch {
          position: absolute;
          right: 0.3rem;
          top: 0.32rem;
          input {
            width: 0.94rem;
            height: 0.46rem;
            position: relative;
            background: @grey-3;
            border-radius: 0.24rem;
            border: none;
            outline: none;
            -webkit-appearance: none;
            transition: all 0.2s ease;
            padding: 0;
          }
          input::after {
            content: '';
            position: absolute;
            top: 0.04rem;
            left: 0.04rem;
            width: 0.38rem;
            height: 0.38rem;
            background-color: #fff;
            border-radius: 50%;
            transition: all 0.2s ease;
          }
          input:checked {
            background-color: @blue;
          }
          input:checked::after {
            left: 55%;
          }
        }
      }
    }
    .hm-login-tip {
      width: 100%;
      text-align: right;
      font-size: 0.28rem;
      font-weight: 400;
      color: @grey-4;
      line-height: 0.4rem;
      margin-top: 0.34rem;
    }
  }
</style>
