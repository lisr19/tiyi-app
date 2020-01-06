<template>
  <div>
    <mt-header fixed title="今日摄入消耗详情">
      <router-link to="/home" slot="left">
        <mt-button icon="back"></mt-button>
      </router-link>
    </mt-header>
    <hm-scroll>
      <div class="hm-record">
        <div class="hm-record-card" :style="{backgroundImage:'url('+imgUrl.diet+')'}">
          <div class="hm-record-card-title">摄入&nbsp;<span>{{calorieIn}}</span>&nbsp;Kcal</div>
          <div class="hm-record-card-content">
            <span>蛋白质：{{nutriObj.protein.toFixed(2)}}&nbsp;&nbsp;g</span>
            <span>碳水化合物：{{nutriObj.cho.toFixed(2)}}&nbsp;&nbsp;g</span>
            <span>脂肪：{{nutriObj.fat.toFixed(2)}}&nbsp;&nbsp;g</span>
            <span>铁：{{nutriObj.fe.toFixed(2)}}&nbsp;&nbsp;mg</span>
            <span>钙：{{nutriObj.ca.toFixed(2)}}&nbsp;&nbsp;mg</span>
          </div>
        </div>

        <div class="hm-record-card" :style="{backgroundImage:'url('+imgUrl.motion+')'}" style="margin-top: 0.5rem">
          <div class="hm-record-card-title">消耗&nbsp;<span style="color:#F4BF24;">{{calorieOut}}</span>&nbsp;Kcal</div>
          <div class="hm-record-card-content">
            <span>手环消耗记录：{{motionData.stepCalorie}} Kcal</span>
            <span>手环运动步数记录：{{motionData.stepNumber}} 步</span>
            <span>跳绳app记录：{{motionData.ropeSkippingCalorie}} Kcal</span>
            <span>跳绳次数记录：{{motionData.ropeSkippingNumber}} 次</span>
          </div>
        </div>

        <div class="hm-record-line">
          <Timeline>
            <TimelineItem v-for="(item,index) in recordData" :key="index"
                          :color="item.recordType !== 1?'#FAE14A':'#B24138'">
              <div v-if="item.recordType === 2">
                <p style="margin-top: 0">{{item.sportTime}}</p>
                <p>运动：{{item.name}}</p>
                <p>时长：{{item.sportPeriod}} min</p>
              </div>
              <div v-if="item.recordType === 1">
                <p style="margin-top: 0">{{item.mealTime}}</p>
                <p>饮食类型：{{typeOut(item.type)}}</p>
                <p>食物重量：{{item.weight}}&nbsp;&nbsp;g</p>
                <p>摄入卡路里：{{item.calorie}}&nbsp;&nbsp;Kcal</p>
                <p>摄入食物：</p>
                <div class="hm-record-line-card" v-for="item1 in item.customFoodList">
                  <p>食物名称：{{item1.name}}</p>
                  <p>食物重量：{{item1.weight}}&nbsp;&nbsp;g</p>
                  <p>摄入量：{{item1.percentage}}&nbsp;&nbsp;%</p>
                </div>
                <div class="hm-record-line-card" v-for="item1 in item.menuList">
                  <p>食物名称：{{item1.name}}</p>
                  <p>食物重量：{{item1.weight}}&nbsp;&nbsp;</p>
                  <p>摄入量：{{item1.percentage}}&nbsp;&nbsp;%</p>
                </div>
              </div>
            </TimelineItem>
          </Timeline>
        </div>
      </div>
    </hm-scroll>
  </div>
</template>

<script>
  import hmScroll from '../../components/hm-scroll/hm-scroll'
  import utils from "../../utils/util";
  import {Toast, MessageBox} from 'mint-ui';

  import {findStandardMenuComposition, findNutri} from "../../api/menu"
  import {findHistoryByDiet, findHistoryBySport} from "../../api/history";

  export default {
    name: "record-detail",
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
      calorieOut() {
        let calorieOut = 0
        if(this.motionData[`stepCalorie`])calorieOut = calorieOut + this.motionData.stepCalorie
        if(this.motionData[`ropeSkippingCalorie`])calorieOut = calorieOut + this.motionData.ropeSkippingCalorie
        return calorieOut
      },
      calorieIn() {
        let calorieIn = 0
        if (this.dietData.length > 0) {
          this.dietData.forEach(v => {
            calorieIn = calorieIn + v.calorie
          })
        }
        return calorieIn
      }
    },
    data() {
      return {
        imgUrl: {
          diet: require('../../assets/logo/yinshi2.png'),
          motion: require('../../assets/logo/yundong2.png')
        },
        motionData: { //运动记录
          stepCalorie: 0,
          stepNumber: 0,
          ropeSkippingCalorie: 0,
          ropeSkippingNumber: 0
        },
        dietData: [],
        recordData: [],
        nutriObj: {//成分数据对象
          protein: 0,//蛋白质
          fat: 0,//脂肪
          fe: 0,//铁
          ca: 0,//钙
          cho: 0,//碳水化合物
        },
      }
    },
    created() {
      this.findHistoryBySport()
      this.findHistoryByDiet()
    },
    mounted() {
      setTimeout(() => {
        this.recordData = this.sortRecord()
      }, 500)
      // console.log(this.$route.query.currentTime)
    },
    methods: {
      //查询运动记录
      async findHistoryBySport() {
        let params = {
          startTime: this.today + ' 00:00:00',
          endTime: this.today + ' 23:59:59',
          userId: this.userId
        }
        let res = await findHistoryBySport(params);
        if (res.code === 200) {
          // 如果不为空
          if(res.data.list && res.data.list.length) {
            this.motionData = res.data.list[0]
          }

        } else {
          Toast({
            message: res.data,
            position: 'bottom',
            duration: 2000
          });
        }
      },
      //查询饮食记录
      async findHistoryByDiet() {
        let params = {
          startTime: this.today + ' 00:00:00',
          endTime: this.today + ' 23:59:59',
          userId: this.userId
        }
        let res = await findHistoryByDiet(params);
        if (res.code === 200) {
          this.dietData = res.data.list
          this.dietData.forEach(v=>{
            this.countNutri(v.menuList)
          })
        } else {
          Toast({
            message: res.data,
            position: 'bottom',
            duration: 2000
          });
        }
      },
      //计算用餐摄入的能量和营养素
      countNutri(form) {
        if (form.length > 0) {
          form.forEach((v, index) => {
            this.findStandardMenuComposition(v.code, v)
          })
        }
      },
      //获取食物标准成分
      async findStandardMenuComposition(menuCode, obj) {
        let params = {
          menuCode: menuCode
        }
        let res = await findStandardMenuComposition(params)
        if (res.code === 200) {
          if (res.data.length > 0) {
            res.data.forEach(v => {
              this.findNutri(v.composition, v.quantity, obj)
            })
          }
        } else {
          Toast({
            message: '网络异常',
            position: 'bottom',
            duration: 2000
          });
        }
      },
      //根据食物成分查询食物营养
      async findNutri(name, quantity, obj) {
        let params = {
          name: name
        }
        let weight = quantity.substring(0, quantity.length - 1)/100
        let percentage = obj.percentage / 100
        let res = await findNutri(params)
        if (res.code === 200) {
          // if (res.data[`energyKcal`]) {
          //   this.nutriObj.energyKcal = this.nutriObj.energyKcal + (res.data.energyKcal * weight * percentage)
          // }
          if (res.data[`protein`]) {
            this.nutriObj.protein = this.nutriObj.protein + (res.data.protein * weight * percentage)
          }
          if (res.data[`fat`]) {
            this.nutriObj.fat = this.nutriObj.fat + (res.data.fat * weight * percentage)
          }
          if (res.data[`fe`]) {
            this.nutriObj.fe = this.nutriObj.fe + (res.data.fe * weight * percentage)
          }
          if (res.data[`ca`]) {
            this.nutriObj.ca = this.nutriObj.ca + (res.data.ca * weight * percentage)
          }
          if (res.data[`cho`]) {
            this.nutriObj.cho = this.nutriObj.cho + (res.data.cho * weight * percentage)
          }
        } else {
          Toast({
            message: '网络异常',
            position: 'bottom',
            duration: 2000
          });
        }
      },
      //根据时间排列记录
      sortRecord() {
        let array = []
        const sportList = this.motionData.otherSportHistoryList
        const dietList = this.dietData

        if (sportList && sportList.length > 0) {
          sportList.forEach(v => {
            v.sortCode = v.sportTime.replace(':', '')
            v.sortCode = v.sortCode.replace(':', '')
            v.recordType = 2
            array.push(v)
          })
        }
        if (dietList && dietList.length > 0) {
          dietList.forEach(v => {
            v.sortCode = v.mealTime.replace(':', '')
            v.sortCode = v.sortCode.replace(':', '')
            v.recordType = 1
            array.push(v)
          })
        }
        const len = array.length
        for (let i = 0; i < len - 1; i++) {
          for (let j = 0; j < len - 1 - i; j++) {
            if (parseInt(array[j].sortCode) > parseInt(array[j + 1].sortCode)) {
              let temp = array[j];
              array[j] = array[j + 1];
              array[j + 1] = temp
            }
          }
        }
        return array
      },
      //饮食类型
      typeOut(id) {
        return utils.typeOut(id)
      }
    }
  }
</script>
<style>
  .ivu-timeline-item-head {
    width: 0.18rem;
    height: 0.18rem;
  }

  .ivu-timeline-item-tail {
    left: 0.08rem;
    border-left: 0.02rem solid #C5C5C5;
  }
</style>
<style lang="less" scoped>
  @import "../../assets/style/common.less";

  .hm-record {
    width: 100%;
    padding: 0.25rem 0.25rem 3rem 0.25rem;
    margin-top: 1rem;
    .hm-record-card {
      width: 7rem;
      min-height: 2.54rem;
      box-shadow: 0 0.06rem 0.1rem 0 rgba(83, 83, 83, 0.16);
      border-radius: 0.10rem;
      padding: 0.2rem 0.18rem;
      background-size: 1.32rem;
      background-repeat: no-repeat;
      background-position: 98% 90%;
      background-color: @white;
      font-size: 0.24rem;
      font-weight: 400;
      color: @black;
      line-height: 0.34rem;
      .hm-record-card-title {
        font-size: 0.28rem;
        font-weight: 500;
        color: @black;
        line-height: 0.4rem;
        span {
          font-size: 0.44rem;
          color: @light_red;
        }
      }
      .hm-record-card-content {
        span {
          display: inline-block;
          margin-right: 0.4rem;
          margin-top: 0.24rem;
        }
      }
    }
    .hm-record-line {
      width: 100%;
      margin-top: 0.5rem;
      padding: 0 0.15rem;
      p {
        font-size: 0.24rem;
        font-weight: 400;
        color: @black;
        line-height: 0.34rem;
        margin-top: 0.15rem;
      }
      .hm-record-line-card {
        width: 80%;
        padding: 0.08rem 0.1rem;
        border-radius: 0.05rem;
        border: 0.01rem solid rgba(0, 0, 0, 0.3);
        margin: 0.1rem 0.3rem;
      }
    }
  }
</style>
