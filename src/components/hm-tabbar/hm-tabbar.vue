<template>
  <div>
    <mt-tabbar v-model="currentSelect" fixed>
      <mt-tab-item id="home">
        <img slot="icon" :src="currentSelect === 'home'?imgUrl.src1:imgUrl.src2">
        首页
      </mt-tab-item>
      <mt-tab-item id="msg" style="position:relative;">
        <img slot="icon" :src="currentSelect === 'msg'?imgUrl.src3:imgUrl.src4">
        消息
        <div class="hm-flag"  v-if="$store.state.count > 0">{{$store.state.count}}</div>
      </mt-tab-item>
      <mt-tab-item id="myself">
        <img slot="icon" :src="currentSelect === 'myself'?imgUrl.src5:imgUrl.src6">
        我的
      </mt-tab-item>
    </mt-tabbar>
  </div>
</template>

<script>
  export default {
    name: "hm-tabbar",
    props: {
      selected: {
        type: String,
        default: 'home'
      }
    },
    watch: {
      currentSelect: 'changePage'
    },
    data() {
      return {
        currentSelect: this.selected,
        imgUrl: {
          src1: require('../../assets/logo/home_in.png'),
          src2: require('../../assets/logo/home_out.png'),
          src3: require('../../assets/logo/msg_in.png'),
          src4: require('../../assets/logo/msg_out.png'),
          src5: require('../../assets/logo/myself_in.png'),
          src6: require('../../assets/logo/myself_out.png'),
        }
      }
    },
    methods: {
      changePage(val) {
        this.$router.push({name: val})
      }
    }
  }
</script>

<style lang="less" scoped>
  @import "../../assets/style/common.less";

  a {
    color: @dull_grey
  }
  .hm-flag{
    position: absolute;
    top: 0.08rem;
    right: 0.8rem;
    width: 0.28rem;
    height: 0.28rem;
    background: @red;
    border-radius: 50%;
    font-size:0.22rem;
    font-weight:500;
    color:@white;
    line-height:0.32rem;
    text-align: center;
  }
</style>
