<template>
  <div>
    <mt-header title="修改信息">
      <router-link to="/myself" slot="left">
        <mt-button icon="back"></mt-button>
      </router-link>
    </mt-header>
    <div class="hm-info">
      <div class="hm-info-form">
        <hm-img-upload ref="imgUpload" @imgUpload="getUploadImg" @delImg="delUploadImg" style="margin: 0.2rem 0;text-align: center"></hm-img-upload>
        <div class="hm-field-box">
          <label class="hm-field-must">手机：</label>
          <input type="text" placeholder="请填写正确手机号码" style="background: #ffffff" disabled="disabled" v-model="form.phone"/>
        </div>
        <div class="hm-field-box">
          <label class="hm-field-must">姓名：</label>
          <input type="text" placeholder="请填写姓名" maxlength="10" v-model="form.name"/>
        </div>
        <div class="hm-field-box" @click="handleClick(0)">
          <label class="hm-field-must">性别：</label>
          <input type="text" disabled="disabled" style="background: #fff" placeholder="请选择性别" v-model="form.sex"/>
        </div>
        <div class="hm-field-box" @click="handleClick(1)">
          <label class="hm-field-must">生日：</label>
          <input type="text" disabled="disabled" style="background: #fff" placeholder="请选择出生日期" v-model="form.birthday"/>
        </div>
        <div class="hm-field-box">
          <label >学号：</label>
          <input type="text" placeholder="请填写学号" maxlength="30" v-model="form.studentNumber"/>
        </div>
        <div class="hm-field-box" style="border: none;">
          <label>身份证：</label>
          <input type="text" placeholder="请正确填写身份证号码" maxlength="30"  v-model="form.idNumber"/>
        </div>
      </div>
      <div class="hm-btn2" style=" margin: 0.5rem auto;" @click="doUserEdit">修改</div>
    </div>

    <mt-popup
      v-model="isSex"
      position="bottom" class="hm-select">
      <mt-picker :slots="sexArray" valueKey="name" @change="handleClickBySex">

      </mt-picker>
    </mt-popup>

    <mt-datetime-picker
      ref="picker"
      type="date"
      :startDate="startDate"
      :endDate="endDate"
      @confirm=confirmDate>
    </mt-datetime-picker>
  </div>
</template>

<script>
  import hmImgUpload from '../../components/img-upload/img-upload'

  import utils from '@/utils/util';
  import {doUserEdit} from "../../api/user";
  import {Toast} from 'mint-ui';
  import { mapActions } from 'vuex'
  export default {
    name: "myself-info",
    components:{
      hmImgUpload
    },
    computed:{
      userInfo(){
        return this.$store.state.user.hmAppInfo
      }
    },
    data() {
      return {
        isSex: false,
        startDate: new Date('1960-01-01'),
        endDate: new Date(),
        sexArray: [
          {
            values: [
              {id: 0, name: '男'},
              {id: 1, name: '女'},
            ]
          }
        ],
        imgArray:[],
        form:{}
      }
    },
    created(){

    },
    mounted(){
      this.form = Object.assign({}, JSON.parse(JSON.stringify(this.userInfo)))
      console.log(this.form)
      //this.form = JSON.parse(JSON.stringify(this.userInfo))
      if (this.form.birthday) {
        this.form.birthday = utils.formatDate(new Date(this.form.birthday),'yyyy-MM-dd')
      }
      switch (this.form.gender){
        case 0:
          this.form.sex = '男';
          break;
        case 1:
          this.form.sex = '女';
          break;
      }
      if (this.form[`imgUrl`] && this.form.imgUrl !== 'undefined') {
        let list = []
        list.push({
          url: this.form.imgUrl,
          name: '头像',
          status: 'finished'
        })
        this.imgArray.push(this.form.imgUrl)
        this.$refs.imgUpload.updateImgUrl(list)
      }
    },
    methods:{
      ...mapActions([
        'getUserInfo'
      ]),
      //用户信息编辑
      async doUserEdit(){
        if(this.formSubmit(this.form)){
          switch (this.form.sex){
            case '男':
              this.form.gender = 0;
              break;
            case '女':
              this.form.gender = 1;
              break;
          }
          let form = {
            gender:this.form.gender,
            id:this.form.id,
            idNumber:this.form.idNumber,
            imgUrl:this.form.imgUrl ? this.form.imgUrl : '',
            studentNumber:this.form.studentNumber,
            name:this.form.name,
            birthday:this.form.birthday + ' 00:00:00',
          }
          let res = await doUserEdit(form)
          if(res.code === 200){
            Toast({
              message: '修改成功',
              position: 'bottom',
              duration: 2000
            });
            form.phone = this.form.phone
            localStorage.setItem('hmAppInfo', JSON.stringify(form))
            this.getUserInfo()
          }else{
            Toast({
              message: '网络错误',
              position: 'bottom',
              duration: 2000
            });
          }
        }
      },
      //表单验证
      formSubmit(form) {
        let msg = ''
        let status = false
        this.form.imgUrl = this.imgArray[0]
        let array = utils.ObjectContrast(this.form, this.userInfo)
        if(array.length === 0){
          msg = '没有改动'
        } else if (utils.validateName(form.name) !== '') {
          msg = utils.validateName(form.name)
        } else if(form.birthday === ''){
          msg = '请选择出生日期'
        } else if(form.studentNumber !== '' && utils.validateStudentNumber(form.studentNumber) !== ''){
          msg = utils.validateStudentNumber(form.studentNumber)
        } else if(form.idNumber !== '' && !utils.validateIdCard(form.idNumber)){
          msg = '请填写合法身份证号'
        }

        if(msg !== ''){
          Toast({
            message: msg,
            position: 'bottom',
            duration: 2000
          });
        }else{
          status = true
        }
        return status
      },
      // 获取上传图片url
      getUploadImg(url) {
        this.imgArray.push(url)
      },
      // 删除上传图片url
      delUploadImg(index) {
        this.imgArray.splice(index, 1)
      },
      handleClickBySex(picker, values) {
        this.form.sex = picker.getValues()[0].name
      },
      handleClick(index) {
        switch (index) {
          case 0:
            this.isSex = true;
            break;
          case 1:
            this.$refs.picker.open();
            break;
        }
      },
      confirmDate(val) {
        this.$set(this.form, 'birthday', utils.formatDate(val, 'yyyy-MM-dd'))
        //this.form.birthday = utils.formatDate(val, 'yyyy-MM-dd')
      },
    }
  }
</script>

<style lang="less" scoped>
  @import "../../assets/style/common.less";

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
