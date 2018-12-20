<template>
    <div class="BloodRelation">
        <div class="Crumbs">
            <span class="Crumbs-item">生产线</span>
            <i class="el-icon-arrow-right Crumbs-arrowhead"></i>
            <span class="Crumbs-item Crumbs-item-go" @click="goLine">生产线列表</span>
            <i class="el-icon-arrow-right Crumbs-arrowhead"></i>
            <span class="Crumbs-item Crumbs-item-go" @click="goEngineering">工艺列表</span>
            <i class="el-icon-arrow-right Crumbs-arrowhead"></i>
            <span class="Crumbs-level">{{ CrumbsLevelName }}</span>
        </div>
        <div class="row context-box">
            <div class="col-md-12">
                <div id="orgManagement" class="container" ref="orgManagement">
                </div>
            </div>
        </div>
    </div>
</template>
<script>
  import API from 'API'
  import echarts from 'echarts'
  export default {
    name: 'AssociateDataDssets',
    data () {
      return {
        CrumbsLevelName: '血缘关系',
        num: '',
        // 特殊过程数据
        specialProcess: [],
        // 不特殊过程数据
        noSpecialProcess: [],
        // 全部资产数据
        assetData: [],
        // 全部过程和资产的数据
        BloodDataAll: [],
        // 过程与过程的关系
        dependRelationData: [],
        // 过程与资产的关系
        relationData: [],
        // 关系数据
        RelationalAllData: []
      }
    },
    created () {
      this.num = this.$route.params.num

    },
    mounted() {
      this.technologylist()
      this.changEcharts()
    },
    methods: {
      goLine () {
        this.$router.go(-1)
      },
      goEngineering () {
        this.$router.go(-1)
      },
      technologylist () {
        API.BloodMap({
          technologyId: this.num
        }).then((res) => {
          if (res.code ===0 ) {
            this.$message({
              message: res.msg,
              type: 'error',
              duration:1000
            })
            return
          }
          if (res.code ===1 ) {
            console.log(res)

            this.specialProcess = res.msg.specialProcess
            this.noSpecialProcess = res.msg.noSpecialProcess
            this.assetData = res.msg.assetData
            this.dependRelationData = res.msg.dependRelationData
            this.relationData = res.msg.relationData
            console.log(this.assetData.length)
            const assetsNumber = this.assetData.length
            if (assetsNumber > 14) {
              var newNumber =  Math.ceil((assetsNumber - 14) / 3)
              this.$refs.orgManagement.style.height = 600 + newNumber * 165 + 'px'
            }

            console.log(this.dependRelationData)
            console.log(this.relationData)
            // 循环特殊过程数据
            var AllB1 = []
            for (var i = 0; i < this.specialProcess.length; i++) {
              var blood1 = {
                name: this.specialProcess[i].process_name,
                x: 200 + i * 100,
                y: 20,
                symbol: 'rect'
              }

              AllB1.push(blood1)
            }

            // 循环不特殊过程数据
            var AllB2 = []
            for (var a = 0; a < this.noSpecialProcess.length; a++) {
              var blood2 = {
                name: this.noSpecialProcess[a].process_name,
                x: a%2 === 0 ? 140 : 260,
                y: 50 + a * 30,
                symbol: 'rect'
              }

              AllB2.push(blood2)
            }

            // 循环全部资产数据
            var AllB3 = []
            for (var b= 0; b< this.assetData.length;b++) {
              var blood3 = {
                name: this.assetData[b].asset_name,
                x: 800,
                y: 20 + b * 30,
                symbol: 'rect'
              }
              AllB3.push(blood3)
            }
            // 把三个数组拼接到一块
            this.BloodDataAll = AllB1.concat(AllB2).concat(AllB3)
            // 循环过程与过程关系数据
            var AllB4 = []
            for (var c = 0; c<this.dependRelationData.length;c++) {
              var blood4 = {
                source: this.dependRelationData[c].par_process_name,
                target: this.dependRelationData[c].son_process_name
              }
              AllB4.push(blood4)
            }

            // 循环过程与资产关系数据
            var AllB5 = []
            for (var j = 0; j < this.relationData.length; j++) {
              var blood5 = {
                source: this.relationData[j].process_name,
                target: this.relationData[j].asset_name,
                value: this.relationData[j].put_status === 'in' ? '输入': '输出',
                label: {
                  normal: {
                    show: true,
                    position: 'middle',
                    formatter: '{@score}'
                  }
                }
              }
              AllB5.push(blood5)
            }
            this.RelationalAllData = AllB4.concat(AllB5)
            if (this.BloodDataAll.length === 0) {
              this.$message({
                message: '没有过程',
                type: 'warning',
                duration:1000
              })
              return
            }
            if (this.RelationalAllData.length === 0) {
              this.$message({
                message: '没有关联的资产',
                type: 'warning',
                duration:1000
              })

            }
            if (this.BloodDataAll.length > 0 && this.RelationalAllData.length > 0) {
              this.initChart('orgManagement')
            }
          }
        }).catch()
      },
      initChart(id) {
        this.chart = echarts.init(document.getElementById(id))
        this.chart.setOption({
          tooltip: {},
          animationDurationUpdate: 1500,
          animationEasingUpdate: 'quinticInOut',
          series : [
            {
              type: 'graph',
              layout: 'none',
              top:'60',
              symbolSize: [100, 30],
              symbolOffset: ['20px', '-5px'],
              focusNodeAdjacency: true,
              roam: true,
              label: {
                normal: {
                  show: true,
                  fontFamily:'黑体',
                  position: 'insideLeft',
                  distance: 5,
                  formatter: '{b}'
                }
              },
              edgeSymbol: ['circle', 'arrow'],
              edgeSymbolSize: [4, 10],
              edgeLabel: {
                normal: {
                  textStyle: {
                    fontSize: 12
                  }
                }
              },
              data: this.BloodDataAll,
              links: this.RelationalAllData,
              lineStyle: {
                normal: {
                  opacity: 1,
                  width: 2,
                  curveness: 0
                }
              }
            }
          ]
        })
      },
      beforeDestroy() {
        if (!this.chart) {
          return
        }
        this.chart.dispose()
        this.chart = null
      },
      changEcharts () {
        window.addEventListener('resize', ()=> {
          this.chart.resize()
        })
      }
    }
  }
</script>
<style lang="scss" scoped>
    #orgManagement {
        width: 100%;
        height: 800px;
    }
    .Crumbs-item-go {
        cursor: pointer;
    }

</style>