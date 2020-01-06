<template>
  <div ref="chartTwo" style="width: 100%;height: 6rem;">
  </div>
</template>

<script>
  export default {
    name: "charts-two",
    props: ['chartData','intake'],
    data(){
      return{
        intakes:''
      }
    },
    created(){
      this.intakes = this.intake
    },
    mounted() {
      setTimeout(()=>{
        this.chartShow()
      },500)
      this.init()
    },
    methods: {
      chartShow() {
        let myChart = this.$echarts.init(this.$refs.chartTwo)
        // 绘制图表
        myChart.setOption({
          xAxis: [
            {
              type: 'category',
              data:['摄入','消耗'],
              axisLine: {
                show: true,
                lineStyle:{
                  color: '#979797'
                }
              },
              axisLabel: {
                show: true,
                textStyle: {
                  color: '#333333',
                  fontSize: '16'
                },
              },
            }
          ],
          yAxis: [
            {
              name:'能量单位：Kcal',
              type: 'value',
              splitNumber: 6,
              splitLine: {
                show:false,
              },
              axisLine: {
                show: true,
                lineStyle:{
                  color: '#979797'
                }
              },
              axisLabel: {
                show: true,
                textStyle: {
                  color: '#979797',
                  fontSize: '12'
                }
              },
            }
          ],
          grid: {
            left: '5%',
            bottom: '0',
            top: '18%',
            containLabel: true
          },
          series: {
            type: 'bar',
            data: this.chartData,
            barWidth: '20%',
            label:{
              show:true,
              position:'top',
              color: function(params) {
                let colorList = [
                  "#B24138",
                  "#FAE14A"
                ];
                return colorList[params.dataIndex];
              },
            },
            itemStyle: {
              normal: {
                //每根柱子颜色设置
                color: function(params) {
                  let colorList = [
                    "#B24138",
                    "#FAE14A"
                  ];
                  return colorList[params.dataIndex];
                },
                barBorderRadius: [10,10,0,0]
              }
            },
            markLine : {
              symbol: ['none', 'none'],//去掉箭头
              itemStyle: {
                normal: {
                  lineStyle: { color:'#7BD33A'},
                }
              },
              data: [{
                name: '建议摄入',
                yAxis: this.intakes,
                label:{
                  show:true,
                  position:'middle',
                  formatter:'{b}:{c}'
                }
              }]
            }
          }
        })
      },
      //图表自适应
      init() {
        const self = this;//因为箭头函数会改变this指向，指向windows。所以先把this保存
        setTimeout(() => {
          window.onresize = function() {
            self.$echarts.init(self.$refs.chartTwo).resize();
          }
        },100)
      },
    }
  }
</script>

<style scoped>

</style>
