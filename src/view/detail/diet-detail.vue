<template>
  <div>
    <mt-header fixed title="饮食记录详情">
      <div slot="left" @click="back">
        <mt-button icon="back"></mt-button>
      </div>
    </mt-header>
    <hm-scroll>
      <div class="hm-detail">
        <span class="hm-detail-time">时间：{{res.createTime}}</span>
        <span class="hm-detail-title">饮食概况</span>
        <div class="hm-detail-content1">
          <p>摄入时间：{{res.mealTime}}</p>
          <p>饮食类型：{{dietType}}</p>
          <p>摄入食物重量：{{res.weight}} g</p>
          <div v-if="groupType === 1">
            <p style="text-align: center">摄入相关能量与营养</p>
            <p>能量：{{res.calorie}} Kcal</p>
            <p>蛋白质：{{nutriObj.protein.toFixed(2)}}&nbsp;&nbsp;g</p>
            <p>碳水化合物：{{nutriObj.cho.toFixed(2)}}&nbsp;&nbsp;g</p>
            <p>脂肪：{{nutriObj.fat.toFixed(2)}}&nbsp;&nbsp;g</p>
            <p>铁：{{nutriObj.fe.toFixed(2)}}&nbsp;&nbsp;mg</p>
            <p>钙：{{nutriObj.ca.toFixed(2)}}&nbsp;&nbsp;mg</p>
          </div>
        </div>
        <span class="hm-detail-title">具体饮食</span>
        <div class="hm-detail-content2" v-for="item in res.menuList">
          <p>食物名称：{{item.name}}</p>
          <p>食物重量：{{item.weight}}</p>
          <p>摄入量：{{item.percentage}} %</p>
        </div>
        <div class="hm-detail-content2" v-for="item in res.customFoodList">
          <p>食物名称：{{item.name}}</p>
          <p>食物重量：{{item.weight}} g</p>
          <p>摄入量：{{item.percentage}} %</p>
        </div>
      </div>
    </hm-scroll>
  </div>
</template>

<script>
import hmScroll from '../../components/hm-scroll/hm-scroll'

import utils from '@/utils/util'
import { Toast, MessageBox } from 'mint-ui'

import { findStandardMenuComposition, findNutri } from '../../api/menu'

export default {
  name: 'diet-detail',
  components: { hmScroll },
  computed: {
    dietType() {
      let str = ''
      switch (this.res.type) {
        case 0:
          str = '加餐'
          break
        case 1:
          str = '早餐'
          break
        case 2:
          str = '午餐'
          break
        case 3:
          str = '晚餐'
          break
      }
      return str
    },
    groupType(){
      return this.$store.state.user.groupType
    },
  },
  data() {
    return {
      res: {},
      searchOption: '',
      nutriObj: {
        //成分数据对象
        protein: 0, //蛋白质
        energyKcal: 0, //能量
        fat: 0, //脂肪
        fe: 0, //铁
        ca: 0, //钙
        cho: 0 //碳水化合物
      }
    }
  },
  created() {
    this.res = JSON.parse(this.$route.query.data)
    this.res.createTime = utils.formatDate(new Date(this.res.createTime), 'yyyy-MM-dd')
    this.searchOption = this.$route.query.searchOption
  },
  mounted() {
    this.countNutri(this.res.menuList)
  },
  methods: {
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
          res.data.forEach((v) => {
            this.findNutri(v.composition, v.quantity, obj)
          })
        }
      } else {
        Toast({
          message: '网络异常',
          position: 'bottom',
          duration: 2000
        })
      }
    },
    //根据食物成分查询食物营养
    async findNutri(name, quantity, obj) {
      let params = {
        name: name
      }
      let weight = quantity.substring(0, quantity.length - 1) / 100
      let percentage = obj.percentage / 100
      let res = await findNutri(params)
      if (res.code === 200) {
        if (res.data[`energyKcal`]) {
          this.nutriObj.energyKcal = this.nutriObj.energyKcal + res.data.energyKcal * weight * percentage
        }
        if (res.data[`protein`]) {
          this.nutriObj.protein = this.nutriObj.protein + res.data.protein * weight * percentage
        }
        if (res.data[`fat`]) {
          this.nutriObj.fat = this.nutriObj.fat + res.data.fat * weight * percentage
        }
        if (res.data[`fe`]) {
          this.nutriObj.fe = this.nutriObj.fe + res.data.fe * weight * percentage
        }
        if (res.data[`ca`]) {
          this.nutriObj.ca = this.nutriObj.ca + res.data.ca * weight * percentage
        }
        if (res.data[`cho`]) {
          this.nutriObj.cho = this.nutriObj.cho + res.data.cho * weight * percentage
        }
      } else {
        Toast({
          message: '网络异常',
          position: 'bottom',
          duration: 2000
        })
      }
    },
    back() {
      this.$router.push({
        name: 'diet_history',
        query: {
          searchOption: this.searchOption
        }
      }) //返回上一层
    }
  }
}
</script>

<style lang="less" scoped>
@import '../../assets/style/common.less';

.mint-header {
  position: relative;
  z-index: 333;
}

.hm-detail {
  width: 100%;
  padding: 0.2rem 0.2rem 1rem 0.2rem;
  .hm-detail-title {
    font-size: 0.3rem;
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
    > div {
      width: 100%;
      padding: 0.15rem;
      border: 1px solid @black;
      border-radius: 0.08rem;
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
