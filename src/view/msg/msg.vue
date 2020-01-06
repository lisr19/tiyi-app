<template>
  <div>
    <mt-header title="消息" style="z-index: 333;position: relative"></mt-header>
    <hm-scroll>
      <div class="hm-msg">
        <div class="hm-msg-item" v-for="(item,index) in msgData" @click="goDetailPage(item)">
          <div>
            <span class="hm-msg-title">
              系统消息
            </span>
            <span class="hm-msg-time">{{item.createTime}}</span>
          </div>
          <div class="hm-msg-content">
            <span>
              {{item.content}}
            </span>
          </div>
          <div v-if="!item.isRead" class="hm-msg-read"></div>
        </div>
      </div>
    </hm-scroll>
    <hm-tabbar :selected="currentSelect"></hm-tabbar>
  </div>
</template>

<script>
  import hmTabbar from '../../components/hm-tabbar/hm-tabbar'
  import hmScroll from '../../components/hm-scroll/hm-scroll'
  import {Toast, MessageBox} from 'mint-ui'

  import {findPushMessage, doReadPushMessage} from '../../api/msg'

  export default {
    name: 'msg',
    components: {
      hmTabbar,
      hmScroll
    },
    computed: {
      userId() {
        return this.$store.state.user.userId
      }
    },
    data() {
      return {
        debug: false,
        currentSelect: 'msg',
        msgData: [
          // {
          //   senderName: '系统消息',
          //   addTime: '2019-07-31 17:10:10',
          //   content: '今天记得记录饮食与运动信息哟！'
          // }
        ],
        searchOption: {
          size: 30
        }
      }
    },
    created() {
      this.searchOption.userId = this.userId
      this.findPushMessage(this.searchOption)
    },
    methods: {
      goDetailPage(data) {
        doReadPushMessage({id: data.id})
        this.$router.push({
          name: 'msg_detail',
          query: {
            data: JSON.stringify(data)
          }
        })
      },
      async findPushMessage(params) {
        let res = await findPushMessage(params)
        if (this.debug) {
          console.log('查询消息', res)
        }
        if (res.code === 200) {
          this.msgData = res.data.list
        } else {
          Toast({
            message: '网络异常',
            position: 'bottom',
            duration: 2000
          })
        }
      },
      // getShowContent(data) {
      //   for (let i = 0; i < data.length; i++) {
      //     let c = data[i].content
      //     if (c.length < 10) {
      //       data[i].contentShow = c
      //     } else {
      //       data[i].contentShow = c.substring(0, 10) + '...'
      //     }
      //   }
      //   return data
      // }
    }
  }
</script>
<style>
</style>
<style lang="less" scoped>
  @import '../../assets/style/common.less';

  .hm-msg {
    padding: 0.1rem 0 3rem 0;
    .hm-msg-item {
      width: 100%;
      height: 1.3rem;
      border-bottom: 0.01rem solid #dfdfdf;
      padding: 0.1rem 0.3rem;
      position: relative;
      > div {
        display: flex;
        display: -webkit-flex;
        justify-content: space-between;
        -webkit-justify-content: space-between;
        .hm-msg-title {
          font-size: 0.32rem;
          font-weight: 500;
          color: @black;
          line-height: 0.44rem;
        }
        .hm-msg-time {
          font-size: 0.22rem;
          font-weight: 400;
          color: @light_grey;
          line-height: 0.32rem;
        }
      }
      .hm-msg-read {
        position: absolute;
        right: 0.3rem;
        bottom: 0.35rem;
        border-radius: 50%;
        width: 0.2rem;
        height: 0.2rem;
        background-color: @red;
      }
      .hm-msg-content {
        padding-left: 0.1rem;
        margin-top: 0.15rem;
        span {
          font-size: 0.24rem;
          font-weight: 400;
          color: rgba(102, 102, 102, 1);
          line-height: 0.34rem;
          width: 95%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
</style>
