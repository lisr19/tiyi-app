<template>
  <div>
    <hm-scroll>
      <div style="padding-bottom: 3rem">
        <div class="hm-myself-header">
          <img :src="'http://'+imgUrl" class="hm-myself-logo" :onerror="defaultAvatar"/>
          <span class="hm-myself-name">{{name}}</span>
          <span>账号：{{phone}}</span>
          <router-link tag="div" to="/myself_info">
            <img src="../../assets/logo/right.png" class="hm-myself-right"/>
          </router-link>
        </div>
        <div style="padding: 0.24rem 0;background: #fff">
          <div class="hm-cell">
            <img src="../../assets/logo/tizheng.png" class="hm-cell-left"/>
            <div class="hm-cell-right">
              <span>体征信息</span>
              <router-link tag="div" to="/sign_history">
                <img src="../../assets/logo/right.png"/>
              </router-link>
            </div>
          </div>
          <div class="hm-cell">
            <img src="../../assets/logo/yinshi.png" class="hm-cell-left"/>
            <div class="hm-cell-right">
              <span>饮食历史</span>
              <router-link tag="div" to="/diet_history">
                <img src="../../assets/logo/right.png"/>
              </router-link>
            </div>
          </div>
          <div class="hm-cell">
            <img src="../../assets/logo/yundong.png" class="hm-cell-left"/>
            <div class="hm-cell-right">
              <span>运动历史</span>
              <router-link tag="div" to="/motion_history">
                <img src="../../assets/logo/right.png"/>
              </router-link>
            </div>
          </div>
          <div class="hm-cell">
            <img src="../../assets/logo/setting.png" class="hm-cell-left"/>
            <div class="hm-cell-right" style="border-bottom: none">
              <span>修改密码</span>
              <router-link tag="div" to="/update_password">
                <img src="../../assets/logo/right.png"/>
              </router-link>
            </div>
          </div>
        </div>

        <div class="hm-cell2" style="margin-top: 1rem" @click="openModal(0)">
          <span>设置摄入量</span>
        </div>
        <div class="hm-cell2" @click="openModal(1)">
          反馈建议
        </div>
        <div class="hm-cell2" style="color:#007AFF" @click="logout">
          退出登录
        </div>
      </div>
    </hm-scroll>
    <Modal v-model="intakeVisible">
      <div style="padding-top: 1rem">
        <div class="hm-field-box">
          <label>单日摄入：</label>
          <input type="number" style="width: 62%" v-model="intake" oninput="if(value.length>10)value=value.slice(0,10)" />
          <label class="hm-field-unit">Kcal</label>
        </div>
        <div class="hm-btn2" style="margin: 0.5rem auto 0.1rem auto" @click="doSetIntake">确定</div>
      </div>
      <div slot="footer">
      </div>
    </Modal>
    <Modal v-model="adviceVisible">
      <div class="hm-card">
        <span>反馈建议：</span>
        <textarea  placeholder="请填写您的建议..." maxlength="200" v-model="feedbackForm.content"></textarea>
        <span class="hm-card-tip">{{feedbackForm.content.length}}/200</span>
        <div class="hm-btn2" style="margin: 0.1rem auto" v-if="!btnStatus" @click="doAddFeedBack">确定</div>
      </div>
      <div slot="footer">
      </div>
    </Modal>
    <hm-tabbar :selected="currentSelect"></hm-tabbar>
  </div>
</template>

<script>

  import hmTabbar from '../../components/hm-tabbar/hm-tabbar'
  import hmScroll from '../../components/hm-scroll/hm-scroll'
  import {MessageBox, Toast} from 'mint-ui';
  import {doAddFeedBack} from "../../api/msg";
  import { mapActions } from 'vuex'

  export default {
    name: "myself",
    components: {
      hmTabbar,
      hmScroll
    },
    computed:{
      name(){
        return this.$store.state.user.name;
      },
      phone(){
        return this.$store.state.user.phone;
      },
      userId(){
        return this.$store.state.user.userId;
      },
      imgUrl(){
        return this.$store.state.user.imgUrl;
      },
      intakes(){
        return this.$store.state.app.intake;
      },
    },
    data() {
      return {
        currentSelect: 'myself',
        adviceVisible: false,
        intakeVisible:false,
        btnStatus:false,//按钮状态
        intake:'',
        defaultAvatar: 'this.src="' + require('../../assets/default/avatar.jpg') + '"',
        feedbackForm:{
          content:''
        }
      }
    },
    created(){
      this.intake = this.intakes
    },
    methods: {
      ...mapActions(['handleLogOut','handleSetIntake']),

      async doAddFeedBack(){
        this.btnStatus = true
        if(this.feedbackForm.content.length>0){
          this.feedbackForm.userId = this.userId
          let res = await doAddFeedBack(this.feedbackForm);
          if(res.code === 200){
            Toast({
              message: '提交成功',
              position: 'bottom',
              duration: 2000
            });
            this.adviceVisible = false
          }else{
            Toast({
              message: '网络错误',
              position: 'bottom',
              duration: 2000
            });
          }
          setTimeout(()=>{
            this.btnStatus = false
          },300)
        }else{
          Toast({
            message: '请填写建议后提交',
            position: 'bottom',
            duration: 2000
          });
          this.btnStatus = false
        }
      },
      logout() {
        let self = this
        MessageBox({
          title: '提示',
          message: '退出登录后，设置摄入量中的值也将清除，请登录后重新填写，确定退出登录?',
          showCancelButton: true
        }).then((active) => {
          if (active !== 'cancel') {
            self.handleLogOut().then(() => {
              Toast({
                message: '注销成功',
                position: 'bottom',
                duration: 2000
              });
              self.$router.push({name: 'login'})
            })
          }
        });
      },
      doSetIntake(){
        localStorage.setItem('hmAppIntake',this.intake)
        this.handleSetIntake().then(()=>{
          Toast({
            message: '设置成功',
            position: 'bottom',
            duration: 2000
          });
          this.intakeVisible = false
        })
      },
      openModal(index) {
        switch (index){
          case 0:
            this.intakeVisible = true;
            break;
          case 1:
            this.adviceVisible = true
            break;
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  @import "../../assets/style/common.less";

  .hm-card {
    width:100%;
    padding: 0.25rem;
    top:50%;
    left: 50%;
    background: @white;
    font-size: 0.28rem;
    font-weight: 500;
    color: @black;
    line-height: 0.4rem;
    .hm-card-tip{
      font-size: 0.22rem;
      font-weight: 500;
      color: @black;
      line-height: 0.4rem;
      margin-bottom: 0.3rem;
      display: block;
      width: 100%;
      text-align: right;
    }
    textarea{
      width: 100%;
      height: 4rem;
      outline: none;
      margin-top: 0.2rem;
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
      width: 20%;
      text-align: center;
    }
  }

  .hm-myself-header {
    background-color: @grey-2;
    background-image: url("../../assets/logo/myself_bg.png");
    background-repeat: no-repeat;
    background-size: 1rem;
    background-position: 83% 65%;
    width: 100%;
    height: 1.66rem;
    position: relative;
    margin-bottom: 0.32rem;
    .hm-myself-logo {
      width: 0.9rem;
      height: 0.9rem;
      border-radius: 0.05rem;
      position: absolute;
      left: 0.5rem;
      bottom: 0.3rem;
    }
    .hm-myself-right {
      width: 0.24rem;
      height: 0.24rem;
      position: absolute;
      right: 0.5rem;
      bottom: 0.58rem;
    }
    .hm-myself-name {
      font-size: 0.28rem;
      font-weight: 500;
      color: @black;
      line-height: 0.4rem;
      position: absolute;
      bottom: 0.78rem;
      left: 1.68rem;
    }
    span {
      font-size: 0.24rem;
      font-weight: 400;
      color: @light_grey;
      line-height: 0.34rem;
      position: absolute;
      bottom: 0.36rem;
      left: 1.68rem;
    }
  }

  .hm-cell {
    width: 100%;
    height: 0.82rem;
    padding: 0.24rem 0 0 0.5rem;
    background: @white;
    display: flex;
    justify-content: space-between;
    .hm-cell-left {
      width: 0.4rem;
      height: 0.4rem;
    }
    .hm-cell-right {
      margin-left: 0.26rem;
      width: 6.4rem;
      height: 100%;
      border-bottom: 1px solid #E9E9E9;
      display: flex;
      justify-content: space-between;
      span {
        display: block;
        font-size: 0.28rem;
        font-weight: 400;
        color: @black;
        line-height: 0.40rem;
      }
      img {
        width: 0.24rem;
        height: 0.24rem;
        margin-right: 0.5rem;
      }
    }
  }

  .hm-cell2 {
    width: 100%;
    height: 0.82rem;
    padding: 0.22rem 0;
    background: @white;
    text-align: center;
    font-size: 0.28rem;
    font-weight: 400;
    color: @light_grey;
    line-height: 0.40rem;
    margin-top: 0.3rem;
    img {
      width: 0.24rem;
      height: 0.24rem;
    }
  }
</style>
