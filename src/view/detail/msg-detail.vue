<template>
  <div>
    <mt-header fixed title="消息详情">
      <div slot="left" @click="back">
        <mt-button icon="back"></mt-button>
      </div>
    </mt-header>
    <hm-scroll>
      <div class="hm-detail">
        <span class="hm-detail-time">时间：{{res.createTime}}</span>
        <div class="hm-detail-content1">
          <p style="text-align: center">系统消息</p>
          <p>{{res.content}}</p>
        </div>
      </div>
    </hm-scroll>
  </div>
</template>

<script>
import hmScroll from '../../components/hm-scroll/hm-scroll'

import utils from '@/utils/util'
export default {
  name: 'msg-detail',
  components: { hmScroll },
  computed: {
    dietType() {}
  },
  data() {
    return {
      res: {},
      searchOption: ''
    }
  },
  created() {
    this.res = JSON.parse(this.$route.query.data)
    this.res.createTime = utils.formatDate(new Date(this.res.createTime), 'yyyy-MM-dd')
  },
  mounted() {},
  methods: {
    back() {
      this.$router.push({
        name: 'msg'
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
}
</style>
