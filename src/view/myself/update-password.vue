<template>
  <div>
    <mt-header title="修改信息">
      <router-link to="/myself" slot="left">
        <mt-button icon="back"></mt-button>
      </router-link>
    </mt-header>
    <div class="hm-info">
      <div class="hm-info-form">
        <div class="hm-field-box" style="margin-top: 0.5rem">
          <label class="hm-field-must">密码：</label>
          <input type="password" placeholder="输入6至20位密码" v-model="form.password" />
        </div>
        <div class="hm-field-box">
          <label class="hm-field-must">确认密码：</label>
          <input type="password" placeholder="确认密码" v-model="form.repassword" />
        </div>
      </div>
      <div class="hm-btn2" style=" margin: 0.5rem auto;" @click="doUserEditPassword">修改</div>
    </div>
  </div>
</template>

<script>
import { doUserEditPassword } from '../../api/user'

import utils from '@/utils/util'
import { Toast } from 'mint-ui'
export default {
  name: 'updatePassword',
  computed: {
    userId() {
      return this.$store.state.user.userId
    }
  },
  data() {
    return {
      form: {}
    }
  },
  methods: {
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

.hm-info {
  width: 100%;
  padding: 1.02rem 0.5rem 1rem 0.5rem;
  .hm-info-form {
  }
}

.hm-select {
  width: 100%;
  font-size: 0.28rem;
  font-weight: 400;
  color: @black;
  line-height: 0.4rem;
}
</style>
