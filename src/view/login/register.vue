<template>
  <div class="hm-register">
    <div class="hm-register-form">
      <hm-img-upload
        ref="imgUpload"
        @imgUpload="getUploadImg"
        @delImg="delUploadImg"
        style="margin: 0.2rem 0;text-align: center"
      ></hm-img-upload>
      <div class="hm-field-box">
        <label class="hm-field-must">手机：</label>
        <input type="text" placeholder="请填写正确手机号码" maxlength="12" v-model="form.phone" />
      </div>
      <!--<div class="hm-field-box">-->
      <!--<label class="hm-field-must">验证码：</label>-->
      <!--<input type="text" placeholder="点击验证码获取" v-model="form.checkCode"/>-->
      <!--<div class="hm-field-btn" ref="code" @click="reGetCheckNum">验证码</div>-->
      <!--</div>-->
      <div class="hm-field-box">
        <label class="hm-field-must">姓名：</label>
        <input type="text" placeholder="请填写姓名" maxlength="10" v-model="form.name" />
      </div>
      <div class="hm-field-box" @click="handleClick(0)">
        <label class="hm-field-must">性别：</label>
        <input
          type="text"
          placeholder="请选择性别"
          disabled="disabled"
          v-model="form.sex"
          style="background: #ffffff"
        />
      </div>
      <div class="hm-field-box" @click="handleClick(1)">
        <label class="hm-field-must">生日：</label>
        <input
          type="text"
          placeholder="请选择出生日期"
          disabled="disabled"
          v-model="form.birthday"
          style="background: #ffffff"
        />
      </div>
      <div class="hm-field-box">
        <label>学号：</label>
        <input type="text" placeholder="请填写学号" maxlength="30" v-model="form.studentNumber" />
      </div>
      <div class="hm-field-box" style="border: none;">
        <label>身份证：</label>
        <input type="text" placeholder="请正确填写身份证号码" maxlength="30" v-model="form.idNumber" />
      </div>
      <div class="hm-field-box" style="margin-top: 0.5rem">
        <label class="hm-field-must">密码：</label>
        <input type="password" placeholder="输入6至20位密码" maxlength="20" v-model="form.password" />
      </div>
      <div class="hm-field-box">
        <label class="hm-field-must">确认密码：</label>
        <input type="password" placeholder="确认密码" maxlength="20" v-model="form.repassword" />
      </div>
    </div>
    <div class="hm-btn1" style=" margin-top: 0.4rem;" v-if="!btnStatus" @click="doRegister">注册</div>

    <mt-popup v-model="isSex" position="bottom" class="hm-select">
      <mt-picker :slots="sexArray" valueKey="name"  @change="handleClickBySex"></mt-picker>
    </mt-popup>

    <mt-datetime-picker
      ref="picker"
      type="date"
      :startDate="startDate"
      :endDate="endDate"
      @confirm="confirmDate"
    ></mt-datetime-picker>
  </div>
</template>

<script>
import hmImgUpload from '../../components/img-upload/img-upload'
import utils from '@/utils/util'
import { Toast } from 'mint-ui'

import { doUserRegister } from '../../api/user'

export default {
  name: 'register',
  components: {
    hmImgUpload
  },
  data() {
    return {
      codeStatus: false,
      isSex: false,
      startDate: new Date('1960-01-01'),
      endDate: new Date(),
      btnStatus:false,//按钮状态
      form: {
        phone: '',
        name: '',
        gender: '',
        birthday: '',
        studentNumber: '',
        idNumber: '',
        password: '',
        repassword: ''
      },
      sexArray: [
        {
          values: [{ id: 0, name: '男' }, { id: 1, name: '女' }]
        }
      ],
      imgArray: []
    }
  },
  methods: {
    async doRegister() {
      this.btnStatus = true
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
            message: '网络错误或账号已存在',
            position: 'bottom',
            duration: 2000
          })
        }
        setTimeout(()=>{
          this.btnStatus = false
        },300)
      }else{
        this.btnStatus = false
      }
    },
    handleClickBySex(picker, values) {
      this.form.sex = picker.getValues()[0].name
      this.form.gender = picker.getValues()[0].id
    },
    handleClick(index) {
      switch (index) {
        case 0:
          this.isSex = true
          break
        case 1:
          this.$refs.picker.open()
          break
      }
    },
    confirmDate(val) {
      this.form.birthday = utils.formatDate(val, 'yyyy-MM-dd')
    },
    //表单验证
    formSubmit(form) {
      let msg = ''
      let status = false
      if (utils.validatePhone(form.phone) !== '') {
        msg = utils.validatePhone(form.phone)
      } else if (utils.validateName(form.name) !== '') {
        msg = utils.validateName(form.name)
      } else if (form.gender === '') {
        msg = '请选择性别'
      } else if (form.birthday === '') {
        msg = '请选择出生日期'
      } else if (utils.validatePassword(form.password) !== '') {
        msg = utils.validatePassword(form.password)
      } else if (form.repassword !== form.password) {
        msg = '两次密码不相同'
      } else if (form.studentNumber !== '' && utils.validateStudentNumber(form.studentNumber) !== '') {
        msg = utils.validateStudentNumber(form.studentNumber)
      } else if (form.idNumber !== '' && !utils.validateIdCard(form.idNumber)) {
        msg = '请填写合法身份证号'
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

    // 获取上传图片url
    getUploadImg(url) {
      this.imgArray.push(url)
    },
    // 删除上传图片url
    delUploadImg(index) {
      this.imgArray.splice(index, 1)
    }
  }
}
</script>

<style lang="less" scoped>
@import '../../assets/style/common.less';

.hm-register {
  width: 100%;
  padding: 1.02rem 0.5rem 1rem 0.5rem;
  .hm-register-form {
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
