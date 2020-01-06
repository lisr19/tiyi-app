<template>
  <div>
    <mt-header title="饮食历史">
      <router-link to="/myself" slot="left">
        <mt-button icon="back"></mt-button>
      </router-link>
      <mt-button slot="right">
        <span @click="openFunctionModal">＋</span>
      </mt-button>
    </mt-header>
    <div class="hm-search" @click="handleClick(0)" v-if="typeVisible">
      <input type="text" placeholder="点击选取用餐类型" v-model="dietType" disabled="disabled"/>
    </div>
    <div class="hm-search" @click="handleClick(1)" v-if="timeVisible">
      <input type="text" placeholder="点击选取时间" v-model="addTime" disabled="disabled"/>
    </div>
    <hm-scroll :pullup="true" @scrollToEnd="loadMore">
      <div class="hm-diet">
        <div class="hm-diet-item" v-for="(item,index) in dietData"  @click="goPath(item)">
          <div>
            <span class="hm-diet-title">饮食记录</span>
            <span class="hm-diet-time">{{item.createTime}}</span>
          </div>
          <div class="hm-diet-content">
            <span>输入卡路里:{{item.calorie}}Kcal</span>
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
        <p class="hm-func-item" @click="handleFunctionClick(0)">按用餐类型查询</p>
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
      v-model="dietTypeVisible"
      position="bottom" class="hm-select">
      <mt-picker :slots="dietTypeArray" valueKey="name" @change="onTypeChange"></mt-picker>
    </mt-popup>
  </div>
</template>

<script>
  import hmScroll from '../../components/hm-scroll/hm-scroll'
  import utils from "../../utils/util";
  import {Toast,MessageBox, Indicator} from 'mint-ui';

  import {findHistoryByDiet} from "../../api/history";

  export default {
    name: "diet-history",
    components: {
      hmScroll
    },
    watch:{
      type:'handlerSearchByType'
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
        typeVisible:false,
        dietTypeVisible:false,
        loading:false,
        startDate: new Date('2019-01-01'),
        endDate: new Date(),
        dietData: [],
        dietTypeArray: [
          {
            values: [
              {id: -1, name: ' '},
              {id: 0, name: '加餐'},
              {id: 1, name: '早餐'},
              {id: 2, name: '午餐'},
              {id: 3, name: '晚餐'}
            ]
          }
        ],
        time:'',
        addTime:'',
        dietType:'',
        type: 0,//用餐类型id
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
      // 将页数重置为1
      this.searchOption.page = 1
      this.findHistoryByDiet(this.searchOption)
    },
    methods: {
      //获取饮食记录
      async findHistoryByDiet(params){
        let res = await findHistoryByDiet(params)
        if(res.code === 200){
          this.dietData = res.data.list
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
        Indicator.open('加载中...')
        this.searchOption.page += 1   
        setTimeout(async () => {
          let res = await findHistoryByDiet(this.searchOption)
          if(res.code === 200){
            res.data.list.forEach(element => {
              this.dietData.push(element)
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
          this.loading = false
          Indicator.close()
        }, 500)
      
      },
      openFunctionModal() {
        this.functionVisible = true
      },
      handleFunctionClick(index) {
        switch (index) {
          case 0:
            this.typeVisible = true
            this.functionVisible = false
            break;
          case 1:
            this.timeVisible = true
            this.functionVisible = false
            break;
        }
      },
      onTypeChange(picker, values) {
        this.dietType = picker.getValues()[0].name
        this.type = picker.getValues()[0].id
      },
      handlerSearchByType(){
        let id = this.type
        if(id !== -1){
          this.searchOption.type = id
        }else{
          this.searchOption.type = ''
        }
        this.findHistoryByDiet(this.searchOption)
      },
      handleClick(index){
        switch (index){
          case 0:
            this.dietTypeVisible = true;
            break;
          case 1:
            this.$refs.picker.open();
            break;
        }
      },
      handleConfirm(val){
        this.addTime = utils.formatDate(val,'yyyy-MM-dd')
        this.searchOption.startTime = this.addTime + ' 00:00:00'
        this.searchOption.endTime = this.addTime + ' 23:59:59'
        this.findHistoryByDiet(this.searchOption)
      },
      goPath(data){
        this.$router.push({
          name:'diet_detail',
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
  .hm-select{
    width: 100%;
    font-size: 0.28rem;
    font-weight: 400;
    color: @black;
    line-height: 0.4rem;
  }
  .hm-diet{
    padding: 0.1rem 0 3rem 0;
    .hm-diet-item{
      width: 100%;
      height: 1.3rem;
      border-bottom: 0.01rem solid #DFDFDF;
      padding: 0.1rem 0.3rem;
      >div{
        display: flex;
        display: -webkit-flex;
        justify-content: space-between;
        -webkit-justify-content: space-between;
        .hm-diet-title{
          font-size:0.32rem;
          font-weight:500;
          color:@black;
          line-height:0.44rem;
        }
        .hm-diet-time{
          font-size:0.22rem;
          font-weight:400;
          color:@light_grey;
          line-height:0.32rem;
        }
      }
      .hm-diet-content{
        font-size:0.24rem;
        font-weight:400;
        color:rgba(102,102,102,1);
        line-height:0.34rem;
        padding-left: 0.1rem;
        margin-top: 0.15rem;
      }
    }
  }

</style>
