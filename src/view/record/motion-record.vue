<template>
  <div>
    <mt-header fixed title="运动记录">
      <router-link to="/home" slot="left">
        <mt-button icon="back"></mt-button>
      </router-link>
      <mt-button slot="right" style="color: #007AFF" v-if="!btnStatus" @click="doDataSubmit">保存</mt-button>
    </mt-header>

    <hm-scroll>
      <div class="hm-motion">
	      <router-link to="/record_bulv">
		      <div class="hm-btn3" style="display: inline-block;position: absolute;
					top: 10px;right: 5px;border: solid #ccc 1px;background: #fff;color: #666666">补录</div>
	      </router-link>
        <div class="hm-field-box" style="margin-top: 20px">
          <label>运动手环：</label>
          <input
            type="text"
            style="width: 62%"
            placeholder="数字"
            maxlength="10"
            v-model="form.stepCalorie"
          />
          <label class="hm-field-unit">Kcal</label>
        </div>
        <div class="hm-field-box">
          <label>运动步数：</label>
          <input
            type="text"
            style="width: 62%"
            placeholder="数字"
            maxlength="6"
            v-model="form.stepNumber"
          />
          <label class="hm-field-unit">步</label>
        </div>
        <div
          style="color: red;font-size: 0.24rem;margin: -0.1rem 0 0.1rem 0;padding-left: 0.1rem"
        >实际步数 = 运动步数 {{form.stepNumber}} - 跳绳次数{{form.ropeSkippingNumber}} = {{stepSum}}步
        </div>
        <div class="hm-field-box">
          <label>跳绳app：</label>
          <input
            type="text"
            style="width: 62%"
            placeholder="数字"
            maxlength="10"
            v-model="form.ropeSkippingCalorie"
            @blur="scrollRefresh"
          />
          <label class="hm-field-unit">Kcal</label>
        </div>
        <div class="hm-field-box" style="margin-bottom:0.48rem">
          <label>跳绳次数：</label>
          <input
            type="text"
            style="width: 62%"
            placeholder="数字"
            maxlength="6"
            v-model="form.ropeSkippingNumber"
            @blur="scrollRefresh"
          />
          <label class="hm-field-unit">次</label>
        </div>

        <div class="hm-motion-body">
          <div class="hm-motion-title">
            <span style="display: inline-block;margin-right: 0.3rem">特殊运动:</span>
            <div class="hm-btn3" style="display: inline-block" @click="doAddArrayData">添加</div>
          </div>
          <div class="hm-motion-card" v-for="(item,index) in otherArray">
            <div class="hm-motion-card-header">
              <span>运动{{index+1}}:</span>
              <span style="color: #333" @click="handleClose(index,item.id)">×</span>
            </div>
            <div class="hm-field-box">
              <label>运动名称：</label>
              <input type="text" v-model="item.name" maxlength="10" placeholder="游泳" @blur="scrollRefresh"
              />
            </div>
            <div class="hm-field-box">
              <label>运动时间：</label>
              <div class="hm-field-slot" @click="handleClick(index)">
                <p>{{item.sportTime}}</p>
              </div>
            </div>
            <div class="hm-field-box">
              <label>运动时长：</label>
              <input
                type="text"
                style="width: 62%"
                v-model="item.sportPeriod"
                maxlength="5"
                placeholder="分钟"
                @blur="scrollRefresh"
              />
              <label class="hm-field-unit">min</label>
            </div>
          </div>
        </div>
      </div>
    </hm-scroll>
    <mt-datetime-picker ref="picker" type="time" @confirm="handleConfirm"></mt-datetime-picker>
  </div>
</template>

<script>
  import hmScroll from '../../components/hm-scroll/hm-scroll'
  import utils from '@/utils/util'
  import {Toast, MessageBox} from 'mint-ui'

  import {findHistoryBySport} from '../../api/history'
  import {doAddSport, doEditSport, doDelOtherSport} from '../../api/record'

  export default {
    name: 'motion-record',
    components: {
      hmScroll
    },
    computed: {
      today() {
        return utils.formatDate(new Date(), 'yyyy-MM-dd')
      },
      userId() {
        return this.$store.state.user.userId
      },
      stepSum() {
        let stepSum = 0
        stepSum = Number(this.form.stepNumber) - Number(this.form.ropeSkippingNumber)
        return stepSum
      }
    },
    data() {
      return {
        currentIndex: 0, //当前特殊记录位置
        form: {
          ropeSkippingCalorie: '', //跳绳卡路里
          ropeSkippingNumber: '', //跳绳次数
          stepCalorie: '', //步数卡路里
          stepNumber: '', //步数
          otherSportHistoryList: []
        },
        btnStatus: false, //按钮状态
        otherArray: [],
        formCopy: {}, //原始数据
        status: false //判断是否为今天第一次记录行为，若是则为true，反则false
      }
    },
    created() {
      this.findHistoryBySport()
    },
    methods: {
      //刷新滑动
      scrollRefresh(){
        window.scroll(0,0);
      },
      //查询今天是否已经进行运动记录
      async findHistoryBySport() {
        let params = {
          startTime: this.today + ' 00:00:00',
          endTime: this.today + ' 23:59:59',
          userId: this.userId
        }
        let res = await findHistoryBySport(params)
        if (res.code === 200) {
          let list = res.data.list.filter(item=>item.sportDate === this.today)
          if (list.length !== 0) {//判断今天是否已经记录
            this.formCopy = JSON.parse(JSON.stringify(list[0]))
            this.status = false
            this.form = list[0]
            this.otherArray = this.form.otherSportHistoryList
          } else {
            this.status = true
            Toast({
              message: '今天尚未进行运动记录',
              position: 'bottom',
              duration: 2000
            })
          }
        } else {
          Toast({
            message: res.data,
            position: 'bottom',
            duration: 2000
          })
        }
      },
      //运动记录添加/修改
      doDataSubmit() {
        this.btnStatus = true
        if (this.formSubmit(this.form, this.otherArray)) {
          //校验成功
          this.status ? this.doAddSport() : this.doEditSport()
        } else {
          this.btnStatus = false
        }
      },
      //运动记录添加
      async doAddSport() {
        if (this.otherArray.length > 0) {
          this.form.otherSportHistoryList = this.otherArray
        }
        this.form.sportDate = this.today
        this.form.userId = this.userId
        let params = {
          addData: JSON.stringify(this.form)
        }
        let res = await doAddSport(params)
        if (res.code === 200) {
          Toast({
            message: '保存成功',
            position: 'bottom',
            duration: 2000
          })
          this.$router.push({
            name: 'home'
          })
          // this.findHistoryBySport()
        } else {
          Toast({
            message: '保存失败',
            position: 'bottom',
            duration: 2000
          })
        }
        this.btnStatus = false
      },
      //运动记录编辑
      async doEditSport() {
        let data = {}
        let array = []
        let otherArray = []
        array = utils.ObjectContrast(this.form, this.formCopy)
        if (array.length > 0) {
          data.id = this.form.id
          data.ropeSkippingCalorie = this.form.ropeSkippingCalorie
          data.ropeSkippingNumber = this.form.ropeSkippingNumber
          data.stepCalorie = this.form.stepCalorie
          data.stepNumber = this.form.stepNumber
        }
        const copyList = this.formCopy.otherSportHistoryList
        const list = this.form.otherSportHistoryList
        if (copyList.length === 0 && list.length > 0) {
          //原来没有运动
          otherArray = list
        } else if (copyList.length <= list.length) {
          //修改或者增加运动
          for (let i = 0; i < copyList.length; i++) {
            if (utils.ObjectContrast(list[i], copyList[i]).length > 0) {
              otherArray.push(list[i])
            }
          }
          for (let j = copyList.length; j < list.length; j++) {
            otherArray.push(list[j])
          }
        }
        otherArray.forEach((v) => {
          v.sportHistoryId = this.form.id
        })
        data.otherSportHistoryList = otherArray
        console.log(data)

        let res = await doEditSport(data)
        if (res.code === 200) {
          Toast({
            message: '保存成功',
            position: 'bottom',
            duration: 2000
          })
          this.$router.push({
            name: 'home'
          })
          // this.findHistoryBySport()
        } else {
          Toast({
            message: '保存失败',
            position: 'bottom',
            duration: 2000
          })
        }
        this.btnStatus = false
      },

      //运动特殊记录删除
      async doDelOtherSport(id) {
        let params = {
          id: id
        }
        let res = await doDelOtherSport(params)
        if (res.code === 200) {
          Toast({
            message: '删除成功',
            position: 'bottom',
            duration: 2000
          })
          this.findHistoryBySport()
        } else {
          Toast({
            message: '删除失败',
            position: 'bottom',
            duration: 2000
          })
        }
      },

      //表单验证
      formSubmit(form, array) {
        let msg = ''
        let status = false
        if (form.stepCalorie === '' || !utils.validateNumber2(form.stepCalorie)) {
          msg = '运动手环请填写正整数'
        } else if (form.stepNumber === '' || !utils.validateNumber2(form.stepNumber)) {
          msg = '运动步数请填写正整数'
        } else if (form.ropeSkippingCalorie !== undefined && form.ropeSkippingCalorie !== '' && !utils.validateNumber2(form.ropeSkippingCalorie)) {
          msg = '跳绳app请填写正整数'
        } else if(!utils.validateNumber2(form.ropeSkippingNumber) ){
            msg = '跳绳次数请填写正整数'
          }
        if (msg === '' && array.length > 0) {
          for (let i = 0; i < array.length; i++) {
            if (array[i].name === '') {
              msg = '运动名称不能为空'
              break
            } else if (array[i].sportTime === '') {
              msg = '运动时间不能为空'
              break
            } else if (!utils.validateNumber2(array[i].sportPeriod)) {
              msg = '运动时长请填写正整数'
              break
            }
          }
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
      handleConfirm(val) {
        this.otherArray[this.currentIndex].sportTime = val + ':00'
      },
      handleClick(index) {
        this.currentIndex = index
        this.$refs.picker.open()
      },
      handleClose(index, id) {
        if (id) {
          MessageBox({
            title: '提示',
            message: '确定确认删除该条特殊运动?',
            showCancelButton: true
          }).then((active) => {
            if (active !== 'cancel') {
              this.doDelOtherSport(id)
            }
          })
        } else {
          this.otherArray.splice(index, 1)
        }
      },
      doAddArrayData() {
        this.otherArray.push({
          name: '',
          sportTime: '',
          sportPeriod: ''
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  @import '../../assets/style/common.less';

  .hm-field-box {
    border: 0.02rem solid @grey-5;
    border-radius: 0.1rem;
    background: @grey-6;
    height: 0.64rem;
    margin-bottom: 0.25rem;
    label {
      padding-top: 0.1rem;
    }
    input {
      height: 0.58rem;
      background: @grey-6;
      padding: 0 0.1rem;
    }
    .hm-field-slot {
      height: 0.63rem;
      p {
        padding-top: 0.1rem;
        font-size: 0.28rem;
        font-weight: 400;
        color: @black;
        line-height: 0.4rem;
      }
    }
    .hm-field-unit {
      width: 10%;
      text-align: center;
    }
  }

  .hm-motion {
    margin-top: 1rem;
    padding: 0.78rem 0.5rem;
    .hm-motion-body {
      .hm-motion-title {
        font-size: 0.3rem;
        font-weight: 500;
        color: @black;
        line-height: 0.4rem;
        padding-left: 0.1rem;
      }
      .hm-motion-card {
        width: 96%;
        margin: 0.2rem auto;
        padding: 0.2rem;
        border-radius: 0.1rem;
        box-shadow: 0 0.06rem 0.1rem 0 rgba(83, 83, 83, 0.16);
        span {
          font-size: 0.28rem;
          font-weight: 400;
          color: @light_grey;
          line-height: 0.4rem;
          margin-bottom: 0.2rem;
          display: block;
        }
        .hm-motion-card-header {
          display: flex;
          display: -webkit-flex;
          justify-content: space-between;
          -webkit-justify-content: space-between;
        }
      }
    }
  }
</style>
