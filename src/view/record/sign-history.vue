<template>
  <div>
    <mt-header title="体征信息">
      <router-link to="/myself" slot="left">
        <mt-button icon="back"></mt-button>
      </router-link>
      <mt-button slot="right">
        <span @click="openFunctionModal">＋</span>
      </mt-button>
    </mt-header>
    <div class="hm-search" @click="handleClick" v-if="timeVisible">
      <input type="text" placeholder="点击选取时间" v-model="addTime" disabled="disabled"/>
    </div>
    <hm-scroll :pullup="true" @scrollToEnd="loadMore">
      <div class="hm-sign">
        <div class="hm-sign-item" v-for="(item,index) in signData">
          <div>
            <span class="hm-sign-title">体征记录</span>
            <span class="hm-sign-time">{{item.createTime}}</span>
          </div>
          <div class="hm-sign-content">
            <span>基础代谢率:{{item.bmr}}%&nbsp;&nbsp;&nbsp; 脂肪率:{{item.fat}}%&nbsp;&nbsp;&nbsp; 肌肉率:{{item.muscle}}%</span>
            <span>身高:{{item.height}}cm&nbsp;&nbsp;&nbsp;体重:{{item.weight}}kg</span>
          </div>
        </div>
      </div>
    </hm-scroll>

    <mt-popup
      v-model="functionVisible"
      position="right"
      popup-transition="popup-fade"
      class="hm-func"
    >
      <img src="../../assets/logo/tip.png"/>
      <div>
        <p class="hm-func-item" @click="openAddModal">添加信息</p>
        <p class="hm-func-item" @click="handleFunctionClick(1)">按时间查询</p>
      </div>
    </mt-popup>

    <mt-datetime-picker
      ref="picker"
      type="date"
      v-model="time"
      :startDate="startDate"
      :endDate="endDate"
      @confirm="handleConfirm"
    >
    </mt-datetime-picker>

    <mt-popup
      v-model="isAdd"
      popup-transition="popup-fade"
      class="hm-modal">
      <div>
        <span>我的体征登记</span>
        <div class="hm-field-box">
          <label>身高：</label>
          <input type="text" style="width: 62%" v-model="form.height" maxlength="6" placeholder=""/>
          <label class="hm-field-unit">cm</label>
        </div>
        <div class="hm-field-box">
          <label>体重：</label>
          <input type="text" style="width: 62%" v-model="form.weight" maxlength="6" placeholder=""/>
          <label class="hm-field-unit">kg</label>
        </div>
        <div class="hm-field-box">
          <label>bmr：</label>
          <input type="text" style="width: 62%" v-model="form.bmr" maxlength="6" placeholder=""/>
          <label class="hm-field-unit" style="width: 13%">Kcal</label>
        </div>
        <div class="hm-field-box">
          <label>脂肪率：</label>
          <input type="text" style="width: 62%" v-model="form.fat" maxlength="6" placeholder=""/>
          <label class="hm-field-unit">%</label>
        </div>
        <div class="hm-field-box">
          <label>肌肉率：</label>
          <input type="text" style="width: 62%" v-model="form.muscle" maxlength="6" placeholder=""/>
          <label class="hm-field-unit">%</label>
        </div>
      </div>
      <div class="hm-btn2" style="margin: 0.5rem auto" v-if="!btnStatus" @click="doAddUserSigns">添加</div>
    </mt-popup>
  </div>
</template>

<script>
  import hmScroll from '../../components/hm-scroll/hm-scroll'
  import utils from "../../utils/util";
  import {Toast,MessageBox,Indicator} from 'mint-ui';

  import {findUserSigns,doAddUserSigns} from "../../api/history";

  export default {
    name: "sign-history",
    components: {
      hmScroll
    },
    computed:{
      userId(){
        return this.$store.state.user.userId
      },
    },
    data() {
      return {
        functionVisible: false,
        timeVisible: false,
        isAdd:false,
        loading:false,
        btnStatus:false,//按钮状态
        form:{
          height:'',
          weight:'',
          bmr:'',
          fat:'',
          muscle:''
        },
        startDate: new Date('2019-01-01'),
        endDate: new Date(),
        signData: [],
        time: '',
        addTime: '',
        searchOption:{
          size:10,
          page: 1
        }
      }
    },
    created(){
      this.searchOption.userId = this.userId
      this.findUserSigns(this.searchOption)
    },
    methods: {
      //获取体征记录
      async findUserSigns(params){
        let res = await findUserSigns(params)
        if(res.code === 200){
          this.signData = res.data.list
        }else{
          Toast({
            message:'网络异常',
            position: 'bottom',
            duration: 2000
          });
        }
      },
      async loadMore() {
        if(this.loading) {
          return
        }
        this.loading = true
        Indicator.open('加载中...')
        this.searchOption.page += 1
        setTimeout(async () => {
          let res = await findUserSigns(this.searchOption)
          if(res.code === 200) {
            res.data.list.forEach(element => {
              this.signData.push(element)
            });
            if (res.data.list.length === 0) {
              this.searchOption.page -= 1
              Toast({
                message:'没有更多数据',
                position: 'bottom',
                duration: 2000
              });
            }
          }else{
            Toast({
              message:'网络异常',
              position: 'bottom',
              duration: 2000
            });
          }
          Indicator.close()
          this.loading = false
        }, 500)

      },
      //添加体征
      async doAddUserSigns(){
        this.btnStatus = true
        if(this.formSubmit(this.form)){//校验
          this.form.userId = this.userId
          let res = await doAddUserSigns(this.form)
          if(res.code === 200){
            Toast({
              message:'添加成功',
              position: 'bottom',
              duration: 2000
            });
            this.findUserSigns(this.searchOption)
            this.isAdd = false
          }else{
            Toast({
              message:'添加失败',
              position: 'bottom',
              duration: 2000
            });
          }
          setTimeout(()=>{
            this.btnStatus = false
          },300)
        }else{
          this.btnStatus = false
        }
      },
      //表单验证
      formSubmit(form){
        let msg = ''
        let status =false
        if (form.height === '' || !utils.validateNumber(form.height)) {
          msg = '身高请填写最多三位小数的正数'
        }else if(form.weight === '' || !utils.validateNumber(form.weight)){
          msg = '体重请填写最多三位小数的正数'
        }else if(form.bmr === '' || !utils.validateNumber(form.bmr)){
          msg = 'bmr请填写最多三位小数的正数'
        }else if(form.fat === '' || !utils.validateNumber(form.fat)){
          msg = '脂肪率请填写最多三位小数的正数'
        }else if(form.muscle === '' || !utils.validateNumber(form.muscle)){
          msg = '肌肉率请填写最多三位小数的正数'
        }

        if(msg!==''){
          Toast({
            message:msg,
            position: 'bottom',
            duration: 2000
          });
        }else{
          status = true;
        }
        return status
      },
      openFunctionModal() {
        this.functionVisible = true
      },
      handleFunctionClick(index) {
        switch (index) {
          case 1:
            this.timeVisible = true
            this.functionVisible = false
            break;
        }
      },
      handleClick() {
        this.$refs.picker.open();
      },
      handleConfirm(val) {
        this.addTime = utils.formatDate(val,'yyyy-MM-dd')
        this.searchOption.startTime = this.addTime + ' 00:00:00'
        this.searchOption.endTime = this.addTime + ' 23:59:59'
        this.findUserSigns(this.searchOption)
      },
      openAddModal(){
        this.isAdd = true
      }
    }
  }
</script>
<style lang="less" scoped>
  @import "../../assets/style/common.less";

  .mint-header {
    position: relative;
    z-index: 333;
  }
  .hm-modal {
    width: 6.5rem;
    padding: 0.38rem 0.6rem;
    background: @white;
    border-radius: 0.30rem;
    box-shadow: 0 0.06rem 0.10rem 0 rgba(83, 83, 83, 0.16);
    text-align: center;
    span{
      display: block;
      margin-bottom: 0.3rem;
      font-size: 0.28rem;
      font-weight: 400;
      color: @blue;
      line-height: 0.4rem;
    }
  }
  .hm-field-box {
    border: 0.02rem solid @grey-5;
    border-radius: 0.10rem;
    background: @grey-6;
    height: 0.64rem;
    margin-bottom: 0.25rem;
    label{
      padding-top: 0.1rem
    }
    input{
      height: 0.58rem;
      background: @grey-6;
      padding: 0 0.1rem ;
    }
    .hm-field-slot{
      height: 0.63rem;
      p{
        padding-top: 0.1rem;
        font-size: 0.28rem;
        font-weight: 400;
        color: @black;
        line-height: 0.4rem;
      }
    }
    .hm-field-unit{
      width: 10%;
      text-align: center;
    }
  }
  .hm-sign {
    padding: 0.1rem 0 3rem 0;
    .hm-sign-item {
      width: 100%;
      height: 1.5rem;
      border-bottom: 0.01rem solid #DFDFDF;
      padding: 0.1rem 0.3rem;
      > div {
        display: flex;
        display: -webkit-flex;
        justify-content: space-between;
        -webkit-justify-content: space-between;
        .hm-sign-title {
          font-size: 0.32rem;
          font-weight: 500;
          color: @black;
          line-height: 0.44rem;
        }
        .hm-sign-time {
          font-size: 0.22rem;
          font-weight: 400;
          color: @light_grey;
          line-height: 0.32rem;
        }
      }
      .hm-sign-content {
        font-size: 0.24rem;
        font-weight: 400;
        color: rgba(102, 102, 102, 1);
        line-height: 0.34rem;
        padding-left: 0.1rem;
        margin-top: 0.15rem;
        display: block;
        span{
          width: 100%;
          display: block;
          margin-bottom: 0.05rem;
        }
      }
    }
  }
</style>
