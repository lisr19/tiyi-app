<template>
  <div>
    <mt-header fixed title="运动记录详情">
      <div slot="left" @click="back">
        <mt-button icon="back"></mt-button>
      </div>
    </mt-header>
    <hm-scroll>
      <div class="hm-detail">
        <span class="hm-detail-time">时间：{{res.sportDate}}</span>
        <span class="hm-detail-title">基础运动</span>
        <div class="hm-detail-content1">
          <p>运动手环记录消耗：{{res.stepCalorie}} Kcal</p>
          <p>运动步数：{{res.stepNumber}} 步</p>
          <p>跳绳app记录消耗：{{res.ropeSkippingCalorie}} kcal</p>
          <p>跳绳次数：{{res.ropeSkippingNumber}} 次</p>
        </div>
        <span class="hm-detail-title" v-if="res.otherSportHistoryList.length>0">特殊运动</span>
        <div class="hm-detail-content2" v-for="item in res.otherSportHistoryList">
          <p>运动时间：{{item.sportTime}}</p>
          <p>运动名称：{{item.name}} </p>
          <p>运动时长：{{item.sportPeriod}}min</p>
        </div>
      </div>
    </hm-scroll>
  </div>
</template>

<script>
  import hmScroll from '../../components/hm-scroll/hm-scroll'

  import utils from '@/utils/util';

  export default {
    name: "motion-detail",
    components: {hmScroll},
    data() {
      return {
        res: {},
        searchOption:''
      }
    },
    created() {
      this.res = JSON.parse(this.$route.query.data)
      this.res.createTime = utils.formatDate(new Date(this.res.createTime),'yyyy-MM-dd')
      this.searchOption = this.$route.query.searchOption
    },
    methods:{
      back(){
        this.$router.push({
          name:'motion_history',
          query:{
            searchOption:this.searchOption
          }
        });//返回上一层
      },
    }
  }
</script>

<style lang="less" scoped>
  @import "../../assets/style/common.less";

  .mint-header {
    position: relative;
    z-index: 333;
  }

  .hm-detail {
    width: 100%;
    padding: 0.2rem 0.2rem 1rem 0.2rem;
    .hm-detail-title{
      font-size: 0.30rem;
      font-weight: 500;
      color: @blue;
      line-height: 0.44rem;
      text-align: center;
      display: block;
      margin: 0.2rem auto 0 auto;
    }
    .hm-detail-time {
      font-size: 0.24rem;
      font-weight: 500;
      color: @light_grey;
      line-height: 0.44rem;
      margin: 0 auto;
      text-align: center;
      display: block;
    }
    .hm-detail-content1 {
      width: inherit;
      padding: 0.1rem 0;
      p {
        padding: 0.1rem;
        font-size: 0.28rem;
        font-weight: 500;
        color: @black;
        line-height: 0.44rem;
      }
    }
    .hm-detail-content2 {
      width: 90%;
      margin: 0.1rem auto;
      padding: 0.1rem;
      p {
        padding: 0.05rem;
        font-size: 0.28rem;
        font-weight: 500;
        color: @black;
        line-height: 0.44rem;
      }
      border: 1px solid @black;
      border-radius: 0.05rem;
    }
  }
</style>
