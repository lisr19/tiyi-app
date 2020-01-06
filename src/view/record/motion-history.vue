<template>
  <div>
    <mt-header title="运动历史">
      <router-link to="/myself" slot="left">
        <mt-button icon="back"></mt-button>
      </router-link>
      <mt-button slot="right">
        <span @click="openFunctionModal">＋</span>
      </mt-button>
    </mt-header>
    <div class="hm-search" @click="handleClick" v-if="timeVisible">
        <input type="text" placeholder="点击选取时间"  v-model="addTime" disabled="disabled" />
    </div>
    <hm-scroll :pullup="true" @scrollToEnd="loadMore">
      <div class="hm-motion">
        <div class="hm-motion-item" v-for="(item,index) in motionData" @click="goPath(item)">
          <div>
            <span class="hm-motion-title">运动记录</span>
            <span class="hm-motion-time">{{item.sportDate}}</span>
          </div>
          <div class="hm-motion-content">
            <span>步数消耗:{{item.stepCalorie}}Kcal&nbsp;&nbsp;&nbsp; 运动步数:{{item.stepNumber}}步&nbsp;&nbsp;&nbsp;</span>
            <span>跳绳消耗:{{item.ropeSkippingCalorie}}Kcal&nbsp;&nbsp;&nbsp;跳绳次数:{{item.ropeSkippingNumber}}次</span>
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

  </div>
</template>

<script>
  import hmScroll from '../../components/hm-scroll/hm-scroll'
  import utils from '@/utils/util';
  import {Toast,MessageBox, Indicator} from 'mint-ui';

  import {findHistoryBySport} from "../../api/history";


  export default {
    name: "motion-history",
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
        timeVisible:false,
        loading:false,
        startDate: new Date('2019-01-01'),
        endDate: new Date(),
        motionData: [],
        time:'',
        addTime:'',
        searchOption:{
          size: 10,
          page: 1
        }
      }
    },
    created(){
      if(this.$route.query.searchOption){
        this.searchOption = this.$route.query.searchOption
      }else{
        this.searchOption.userId = this.userId
      }
      // 查询页数重置为1
      this.searchOption.page = 1
      this.findHistoryBySport(this.searchOption)
    },
    methods: {
      //获取运动记录
      async findHistoryBySport(params){
        let res = await findHistoryBySport(params)
        if(res.code === 200){
          this.motionData = res.data.list
        }else{
          Toast({
            message:'网络异常',
            position: 'bottom',
            duration: 2000
          });
        }
      },
      async loadMore() {
        if (this.loading) {
          return
        }
        this.loading = true
        this.searchOption.page += 1
        Indicator.open('加载中...')
        setTimeout(async () => {
          let res = await findHistoryBySport(this.searchOption)
          if(res.code === 200){
            res.data.list.forEach(element => {
              this.motionData.push(element)
            });
            // 没有更多数据
            if(res.data.list.length === 0) {
              this.searchOption.page -= 1
              Toast({
                message:'没有更多数据',
                position: 'bottom',
                duration: 2000
              });
            }
            // this.params.page = res.data.pageNum
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
      handleClick(){
        this.$refs.picker.open();
      },
      handleConfirm(val){
        this.addTime = utils.formatDate(val,'yyyy-MM-dd')
        this.searchOption.startTime = this.addTime + ' 00:00:00'
        this.searchOption.endTime = this.addTime + ' 23:59:59'
        this.findHistoryBySport(this.searchOption)
      },
      goPath(data){
        this.$router.push({
          name:'motion_detail',
          query: {
            data: JSON.stringify(data),
            searchOption:this.searchOption
          }
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  @import "../../assets/style/common.less";
  .mint-header{
    position: relative;
    z-index: 333;
  }
  .hm-motion{
    padding: 0.1rem 0 3rem 0;
    .hm-motion-item{
      width: 100%;
      height: 1.5rem;
      border-bottom: 0.01rem solid #DFDFDF;
      padding: 0.1rem 0.3rem;
      >div{
        display: flex;
        display: -webkit-flex;
        justify-content: space-between;
        -webkit-justify-content: space-between;
        .hm-motion-title{
          font-size:0.32rem;
          font-weight:500;
          color:@black;
          line-height:0.44rem;
        }
        .hm-motion-time{
          font-size:0.22rem;
          font-weight:400;
          color:@light_grey;
          line-height:0.32rem;
        }
      }
      .hm-motion-content{
        font-size:0.24rem;
        font-weight:400;
        color:rgba(102,102,102,1);
        line-height:0.34rem;
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
