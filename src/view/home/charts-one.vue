<template>
  <div ref="chartOne" style="width: 100%;height: 6rem;">
  </div>
</template>

<script>
  export default {
    name: "charts-one",
    props:['chartData'],
    data() {
      return {}
    },
    mounted() {
      setTimeout(()=>{
        this.chartShow()
      },500)
      this.init()
    },
    methods:{
      chartShow(){
        let myChart = this.$echarts.init(this.$refs.chartOne)
        // 绘制图表
        myChart.setOption({
          tooltip: {
            trigger: 'item',
            formatter: "{b}: {c} cal ({d}%)"
          },
          color: ['#B24138','#FAE14A'],
          grid: {
            left: '0',
            right: '0',
            bottom: '0',
            containLabel: true
          },
          series: [
            {
              type: 'pie',
              radius: ['65%', '85%'],
              avoidLabelOverlap: false,
              label: {
                normal: {
                  show: false,
                },
                emphasis: {
                  show: false,
                }
              },
              labelLine: {
                normal: {
                  show: false
                }
              },
              data:this.chartData
            },

          ]
        })
      },
      //图表自适应
      init() {
        const self = this;//因为箭头函数会改变this指向，指向windows。所以先把this保存
        setTimeout(() => {
          window.onresize = function() {
            self.$echarts.init(self.$refs.chartOne).resize();
          }
        },100)
      },
    }
  }
</script>

<style lang="less" scoped>

</style>
