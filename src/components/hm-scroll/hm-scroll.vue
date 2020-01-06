<template>
  <div class="wrapper" ref="wrapper">
    <slot></slot>
  </div>
</template>

<script>
  import BScroll from 'better-scroll';

  export default {
    name: "hm-scroll",
    props: {
      probeType: { // 派发滚动事件方式
        type: Number,
        default: 1
      },
      click: { // 是否支持点击
        type: Boolean,
        default: true
      },
      data: {
//        type: Array,
        default: null
      },
      scrollX: { // 设置滚动方向为x轴
        type: Boolean,
        default: false
      },
      scrollY: { // 设置滚动方向为y轴
        type: Boolean,
        default: true
      },
      listenScroll: { // 监听滚动
        type: Boolean,
        default: false
      },
      pullup: { // 开启上拉加载
        type: Boolean,
        default: false
      },
      pulldown: { // 开启下拉刷新
        type: Boolean,
        default: false
      },
      beforeScroll: { // 滚动开始派发
        type: Boolean,
        default: false
      },
      refreshDelay: { // 控制刷新时间(内部如果包含动画切换，需要增加延时)
        type: Number,
        default: 20
      },
      eventPassthrough: { // 忽略滚动的方向
        type: String,
        default: ''
      }
    },
    mounted() {
      setTimeout(() => {
        this._initScroll();
      }, 20);
    },
    methods: {
      _initScroll() {
        this.$refs.wrapper.style.height = window.screen.height - this.$refs.wrapper.offsetTop + 'px'
        if (!this.$refs.wrapper) {
          return;
        }
        this.scroll = new BScroll(this.$refs.wrapper, {
          probeType: this.probeType,
          click: this.click,
          scrollX: this.scrollX,
          scrollY: this.scrollY,
          mouseWheel: true,
          eventPassthrough: this.eventPassthrough
        });
        if(this.scroll.scrollerHeight <= this.scroll.wrapperHeight){ //若滚动高度小于等于div高度则不会滚动
          this.$refs.wrapper.style.height = window.screen.height - this.$refs.wrapper.offsetTop - 30 + 'px'
        }

        // 是否需要监听滚动事件
        if (this.listenScroll) {
          this.scroll.on('scroll', (pos) => {
            this.$emit('scroll', pos);
          });
        }
        // 如果支持上拉加载
        if (this.pullup) {
          this.scroll.on('scrollEnd', () => {
            if (this.scroll.y <= this.scroll.maxScrollY + 30) { // 快滚动到底部
              this.$emit('scrollToEnd'); // 派发事件说明已经滚动到底部
            }
          });
        }
        if (this.pulldown) {
          this.scroll.on('touchend', (pos) => {
            // 下拉动作
            console.log(pos.y)
            if (pos.y > 10) {
              this.$emit('scrollToTop') // 到达顶部上拉
            }
          })
        }
        // 在触发滚动之前派发事件，这里主要用于用户体验优化
        if (this.beforeScroll) {
          this.scroll.on('beforeScrollStart', () => {
            this.$emit('beforeScroll');
          });
        }
      },
      enable() {
        this.scroll && this.scroll.enable();
      },
      disable() {
        this.scroll && this.scroll.disable();
      },
      refresh() {
        this.scroll && this.scroll.refresh();
      },
      scrollTo() {
        this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments);
      },
      scrollToElement() {
        this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments);
      }

    },
    watch: {
      data() { // 可以手动设置更新延时，视情况而定
        setTimeout(() => { // 重新计算滚动高度
          this.refresh();
        }, this.refreshDelay);
      }
    }
  }
</script>

<style lang="less" scoped>
  .wrapper{
    width: 7.5rem;
  }
</style>
