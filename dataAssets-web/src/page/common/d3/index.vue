<template>
  <div>
      <svg height="1000" width="800" >
          <g id="myLine" style="transform: translate(30px, 10px)"></g>
          <g id="axisY" style="transform: translate(30px, 10px)"> </g>
          <g id="axisX" style="transform: translate(30px, 372px)"></g>
      </svg>
  </div>
</template>

<script>
  import * as d3 from 'd3';
//  import dagreD3 from 'dagre-d3';
export default {
  data () {
    return {
      data: d3.range(0,30).map(() => d3.randomBates(10)()*1000 )
    };
  },
  methods: {
    //画轴(x,y)
    getScales(data) {
      //声明轴类型 (scaleTime/scaleLinear)
      // 轴显示范围(全部数据在某范围内显示):  range
      const x = d3.scaleLinear().range([0,data.length*20]);
      //轴数据域范围:  domain (显示多少个数)
      // x.domain(d3.extent(this.data, (d, i) => i));
      // 把轴画上
      // d3.select("#axisX").call(d3.axisBottom(x))
      //                const text = d3.text("测试")
      //                        .attr("x",-10).attr("y",-20)
      //                d3.select("#axisX").call(text())
      const max_y = parseInt(d3.max(data,(d) => d ))/2
      const y = d3.scaleLinear().range([max_y,0]);
      y.domain([0,d3.max(this.data, d => d) ]);
      d3.select("#axisY").call(d3.axisLeft(y))
      return { x, y };
      },
    //画线
    calculatePath(){
      const scale = this.getScales(this.data);
      //声明线
      const path = d3.line()
          .x((d, i) => scale.x(i))
          .y(d => scale.y(d))
      // 使用画布华上线
      d3.select("#myLine").append('path')
          .attr('d', path(this.data))
    }
  },
  mounted() {
    this.calculatePath();
  }
}
</script>

<style lang='scss' scoped>
    .chart rect {
        fill: steelblue;
    }

    .chart text {
        fill: white;
        font: 10px sans-serif;
        text-anchor: middle;
    }
</style>