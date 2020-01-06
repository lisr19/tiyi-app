<template>
  <div>
    <mt-header title="体医结合"></mt-header>
    <hm-scroll>
      <div class="hm-body">
        <router-link tag="div" to="/diet_record" class="hm-record-btn">
          <img src="../../assets/logo/diet.png"/>
          <span>饮食记录</span>
        </router-link>
        <router-link tag="div" to="/motion_record" class="hm-record-btn">
          <img src="../../assets/logo/motion.png"/>
          <span>运动记录</span>
        </router-link>
        <div class="hm-charts">
          <div class="hm-charts-header">
            <div class="hm-select">
              <Select v-model="currentTime" placeholder="时间" @on-change="handlerSearchByDate">
                <Option v-for="(item,index) in timeSelect" :value="item.value" :key="index">{{item.name}}</Option>
              </Select>
            </div>
            <div class="hm-remind">
              <div class="hm-point"></div>
              <span>建议单日摄入量：{{intake}}Kcal</span>
            </div>
          </div>
          <div class="hm-charts-body">
            <div v-if="currentChart">
              <charts-one ref="chartOne" :chartData="chartDataOne"></charts-one>
              <!-- <router-link tag="div" :to="{name:'record_detail',query:{currentTime:currentTime}}" class="hm-charts-data"> -->
              <div class="hm-charts-data" @click="goToDetail">
                <ul>
                  <li><p>摄入：{{calorieIn}}</p></li>
                  <li><p>消耗：{{calorieOut}}</p></li>
                </ul>
                <span>单位：Kcal</span>
              </div>
              <!-- </router-link> -->
            </div>
            <charts-two v-if="!currentChart" ref="chartTwo" :chartData="chartDataTwo" :intake="intake"></charts-two>
            <img src="../../assets/logo/turn.png" class="hm-btn-turn" @click="turnCharts"/>
          </div>
        </div>
      </div>
    </hm-scroll>
    <hm-tabbar :selected="currentSelect"></hm-tabbar>
  </div>
</template>

<script>
  import chartsOne from './charts-one.vue'
  import chartsTwo from './charts-two'
  import hmTabbar from '../../components/hm-tabbar/hm-tabbar'
  import hmScroll from '../../components/hm-scroll/hm-scroll'


  import utils from "../../utils/util";
  import {Toast, MessageBox} from 'mint-ui';

  import {findHistoryByDiet, findHistoryBySport} from "../../api/history";

  export default {
    name: "home",
    components: {
      chartsOne,
      chartsTwo,
      hmTabbar,
      hmScroll
    },
    computed: {
      today() {
        return utils.formatDate(new Date(), 'yyyy-MM-dd')
      },
      userId() {
        return this.$store.state.user.userId
      },
      intake(){
        return this.$store.state.app.intake ? this.$store.state.app.intake: 0;
      },
      groupType(){
        return this.$store.state.user.groupType
      },
      calorieOut() {
        let calorieOut = 0
        if (this.motionData.length > 0) {
          this.motionData.forEach(v => {
            if(v[`stepCalorie`])calorieOut = calorieOut + v.stepCalorie
            if(v[`ropeSkippingCalorie`])calorieOut = calorieOut + v.ropeSkippingCalorie
          })
        }
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
      },
      chartDataOne() {
        let array = [
          {value: this.calorieIn, name: '摄入'}, {value: this.calorieOut, name: '消耗'}
        ]
        return array
      },
      chartDataTwo() {
        let array = [this.calorieIn, this.calorieOut]
        return array
      }
    },
    data() {
      return {
        currentSelect: 'home',
        currentTime: 0,
        currentChart: true,//true为图表一显示，false为图表二显示
        timeSelect: [
          {
            name: '今天',
            value: 0
          },
          {
            name: '近三天',
            value: 3
          },
          {
            name: '近一周',
            value: 7
          },
          {
            name: '近一月',
            value: 30
          },
        ],
        motionData: [],
        dietData: [],
        searchOption: {
          size: 200
        }
      }
    },
    created() {
      this.searchOption.userId = this.userId
    },
    mounted() {
      this.handlerSearchByDate(this.currentTime)
      console.log(this.groupType)
    },
    methods: {

      // 跳转到详情
      goToDetail() {
        if (this.groupType === 1) {
          this.$router.push({
            name: 'record_detail',
            query: {
              currentTime: this.currentTime
            }
          })
        }
      },
      turnCharts() {
        this.currentChart = !this.currentChart
      },
      //查询运动记录
      async findHistoryBySport(params) {
        let res = await findHistoryBySport(params);
        if (res.code === 200) {
          this.motionData = res.data.list.filter(item=>item.sportDate === this.today)
        } else {
          Toast({
            message: res.data,
            position: 'bottom',
            duration: 2000
          });
        }
      },
      //查询饮食记录
      async findHistoryByDiet(params) {
        let res = await findHistoryByDiet(params);
        if (res.code === 200) {
          this.dietData = res.data.list
        } else {
          Toast({
            message: res.data,
            position: 'bottom',
            duration: 2000
          });
        }
      },
      //根据时间查询数据
      handlerSearchByDate(val) {
        let endTime = this.today + ' 23:59:59'
        let startTime = ''
        switch (val) {
          case 0:
            startTime = this.today ;
          break;
          case 3:
            startTime =utils.formatDate(new Date(utils.dayOut(val-1)),'yyyy-MM-dd');
          break;
          case 7:
            startTime = utils.formatDate(new Date(utils.dayOut(val-1)),'yyyy-MM-dd');
          break;
          case 30:
            startTime = utils.formatDate(new Date(utils.dayOut(val-1)),'yyyy-MM-dd');
          break;
        }
        startTime = startTime + ' 00:00:00'
        this.searchOption.startTime = startTime
        this.searchOption.endTime = endTime
        this.findHistoryBySport(this.searchOption)
        this.findHistoryByDiet(this.searchOption)
        if(this.currentChart){
          setTimeout(()=>{
            this.$refs.chartOne.chartShow()
          },300)
        }else{
          setTimeout(()=>{
            this.$refs.chartTwo.chartShow()
          },300)
        }
      }
    }
  }
</script>
<style>
  .ivu-select-dropdown {
    background-color: #F2F2F2;
    left: 0.5rem !important;
    max-height: 3rem;
  }

  .ivu-select-single .ivu-select-selection {
    height: 0.56rem;
  }
  .ivu-select-single .ivu-select-selection .ivu-select-selected-value {
    height: 0.56rem;
    padding: 0.05rem 0.16rem;
    font-size: 0.28rem;
    font-weight: 500;
    color: rgba(51, 51, 51, 1);
    line-height: 0.4rem;
  }

  .ivu-select-arrow {
    right: 0.1rem;
  }

  .ivu-select-item {
    text-align: center;
    padding: 0.12rem 0;
    font-size: 0.24rem !important;
    font-weight: 500;
    color: rgba(153, 153, 153, 1);
    line-height: 0.34rem;
  }
</style>
<style lang="less" scoped>
  @import "../../assets/style/common.less";

  .mint-header {
    background-color: @blue;
    height: 1rem;
    font-size: 0.32rem;
    font-weight: 500;
    color: @white;
    line-height: 0.44rem;
    z-index: 33;
  }

  .hm-body {
    padding: 0.62rem 0.5rem 3rem 0.5rem;
    .hm-record-btn {
      width: 6.5rem;
      height: 1.18rem;
      box-shadow: 0 0.04rem 0.08rem 0 rgba(49, 80, 127, 0.12);
      border-radius: 0.1rem;
      margin-bottom: 0.44rem;
      position: relative;
      background-image: url("../../assets/logo/record.png");
      background-repeat: no-repeat;
      background-position: right;
      background-color: @white;
      background-size: 1.6rem;
      img {
        position: absolute;
        width: 0.5rem;
        height: 0.5rem;
        top: 0.36rem;
        left: 0.82rem;
      }
      span {
        position: absolute;
        top: 0.38rem;
        left: 1.62rem;
        color: @black;
        font-size: 0.32rem;
        font-weight: 500;
        line-height: 0.44rem;
      }
    }
    .hm-charts {
      padding-top: 0.28rem;
      .hm-charts-header {
        width: 100%;
        display: flex;
        justify-content: space-between;
        .hm-select {
          width: 1.38rem;
          height: 0.56rem;
        }
        .hm-remind {
          padding-top: 0.14rem;
          .hm-point {
            width: 0.16rem;
            height: 0.16rem;
            background: @green;
            border-radius: 50%;
            display: inline-block;
          }
          span {
            display: inline-block;
            margin-left: 0.2rem;
            font-size: 0.24rem;
            font-weight: 500;
            color: rgba(51, 51, 51, 1);
            line-height: 0.34rem;
          }
        }
      }
      .hm-charts-body {
        width: 100%;
        height: 6rem;
        padding-top: 0.36rem;
        position: relative;
        .hm-charts-data {
          position: absolute;
          top: 50%;
          left: 50%;
          margin-top: -1.05rem;
          margin-left: -1.43rem;
          width: 2.86rem;
          height: 2.86rem;
          background: @white;
          box-shadow: 0 0.04rem 0.08rem 0 rgba(40, 60, 90, 0.16);
          border-radius: 50%;
          padding: 0.82rem 0;
          text-align: center;
          ul li {
            width: 1.8rem;
            margin: 0 auto;
            padding: 0.02rem 0;
            font-size: 0.36rem;
            list-style-type: disc;
            p {
              font-size: 0.28rem;
              font-weight: 400;
              color: rgba(51, 51, 51, 1);
              line-height: 0.4rem;
            }
          }
          li:nth-child(1) {
            color: @light_red;
          }
          li:nth-child(2) {
            color: @light_yellow;
          }
          span {
            font-size: 0.24rem;
            font-weight: 400;
            color: @light_grey;
            line-height: 0.34rem;
          }
        }
      }
      .hm-btn-turn {
        width: 0.44rem;
        height: 0.34rem;
        position: absolute;
        right: 0;
        top: 0.34rem;
      }
    }
  }
</style>
