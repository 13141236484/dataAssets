<template>
    <div class="ProductionDetailed">
        <div class="Crumbs">
            <span class="Crumbs-item">生产线</span>
            <i class="el-icon-arrow-right Crumbs-arrowhead"></i>
            <span class="Crumbs-level">生产详单</span>
        </div>
        <div class="Functional">
            <el-input
                    v-model="SearchProductionLine"
                    placeholder="生产线"
                    clearable
                    size="mini">
            </el-input>
            <span class="input-margin"></span>
            <el-input
                    v-model="SearchTechnology"
                    v-show="WholeTechnology.length"
                    placeholder="工艺"
                    clearable
                    size="mini">
            </el-input>
            <span class="input-margin"></span>
            <el-input
                    v-model="Searchprocess"
                    v-show="WholeProcess.length"
                    placeholder="过程"
                    clearable
                    size="mini">
            </el-input>
            <span class="input-margin"></span>
            <el-input
                    v-model="SearchAssets"
                    v-show="WholeAssets.length"
                    placeholder="资产"
                    clearable
                    size="mini">
            </el-input>
        </div>
        <div class="row specifications-context">
            <div class="col-md-3">
                <div class="context-box">
                    <h3 class="title"><i class="el-icon-location "></i>生产线<i v-show="ProductionLineName" class="el-icon-arrow-right Crumbs-arrowhead"></i><span class="title-1">{{ProductionLineName}}</span></h3>
                    <div>
                        <el-scrollbar class="context-box-scroll">
                            <ul>
                                    <li
                                            v-for="(item, index) in items1"
                                            @click="CheckTechnology(item.uuid, item.beltline_name)"
                                            :class=" [(index % 2 == 0 ? 'Zebra-white' : 'Zebra-grey'), (item.uuid ===ProductionLineId ? 'active-Zebra' : '')]">
                                        {{TextSub(item.beltline_name, 0, 10, "...")}}
                                        <div class="checkIcon" @click.stop="ProductionDel(item.uuid)">
                                            <span><i class="el-icon-tickets"></i></span>
                                            <el-popover
                                                    placement="right"
                                                    :title="item.beltline_name"
                                                    width="200"
                                                    transition="fade-in-linear"
                                                    trigger="hover"
                                                    :content="item.beltline_remarks">
                                                <span slot="reference" class="Icon-font">查看</span>
                                            </el-popover>

                                        </div>
                                    </li>
                            </ul>
                        </el-scrollbar>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="context-box">
                    <h3 class="title"><i class="el-icon-location "></i>工艺<i v-show="TechnologyName" class="el-icon-arrow-right Crumbs-arrowhead"></i><span class="title-1">{{TechnologyName}}</span></h3>
                    <div>
                        <el-scrollbar class="context-box-scroll">
                            <ul>
                                <li
                                        v-for="(item, index) in items2"
                                        @click="Checkprocess(item.uuid, item.batch_name)"
                                        :class=" [(index % 2 == 0 ? 'Zebra-white' : 'Zebra-grey'), (item.uuid ===TechnologyId ? 'active-Zebra' : '')]">
                                    {{TextSub(item.batch_name, 0, 10, "...")}}
                                    <div class="checkIcon" @click.stop="TechnologyDel(item.uuid)">
                                        <span><i class="el-icon-tickets"></i></span>
                                        <el-popover
                                                placement="right"
                                                :title="item.batch_name"
                                                width="200"
                                                transition="fade-in-linear"
                                                trigger="hover"
                                                :content="item.batch_remarks">
                                            <span slot="reference" class="Icon-font">查看</span>
                                        </el-popover>
                                    </div>
                                </li>
                            </ul>
                        </el-scrollbar>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="context-box">
                    <h3 class="title"><i class="el-icon-location "></i>过程<i v-show="processName" class="el-icon-arrow-right Crumbs-arrowhead"></i><span class="title-1">{{processName}}</span></h3>
                    <div>
                        <el-scrollbar class="context-box-scroll">
                            <ul>
                                <li
                                        v-for="(item, index) in items3"
                                        @click="CheckAssets(item.uuid, item.process_name)"
                                        :class=" [(index % 2 == 0 ? 'Zebra-white' : 'Zebra-grey'), (item.uuid ===processId ? 'active-Zebra' : '')]">
                                    {{TextSub(item.process_name, 0, 10, "...")}}
                                    <div class="checkIcon" @click.stop="ProcessDel(item.uuid)">
                                        <span><i class="el-icon-tickets"></i></span>
                                        <el-popover
                                                placement="right"
                                                :title="item.process_name"
                                                width="200"
                                                transition="fade-in-linear"
                                                trigger="hover"
                                                :content="item.process_remarks">
                                            <span slot="reference" class="Icon-font">查看</span>
                                        </el-popover>
                                    </div>
                                </li>
                            </ul>
                        </el-scrollbar>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="context-box">
                    <h3 class="title"><i class="el-icon-location "></i>资产<i v-show="AssetsName" class="el-icon-arrow-right Crumbs-arrowhead"></i><span class="title-1">{{AssetsName}}</span></h3>
                    <div>
                        <el-scrollbar class="context-box-scroll">
                            <ul>
                                <li
                                        v-for="(item, index) in items4"
                                        @click="CheckOwn(item.asset_name)"
                                        :class=" [(index % 2 == 0 ? 'Zebra-white' : 'Zebra-grey')]">
                                    {{TextSub(item.asset_name, 0, 10, "...")}}
                                    <div class="relationship">{{item.put_status === 'in' ? '输入' : '输出'}}</div>
                                    <div class="checkIcon" @click.stop="AssetsDel(item.id)">
                                        <span><i class="el-icon-tickets"></i></span>
                                        <el-popover
                                                placement="right"
                                                :title="item.asset_name"
                                                width="200"
                                                transition="fade-in-linear"
                                                trigger="hover"
                                                :content="item.put_status === 'in' ? '输入' : '输出'">
                                            <span slot="reference" class="Icon-font">查看</span>
                                        </el-popover>
                                    </div>
                                </li>
                            </ul>
                        </el-scrollbar>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import API from 'API'

    export default {
      name: 'ProductionDetailedList',
      data () {
        return {
          SearchProductionLine: '',
          SearchTechnology: '',
          Searchprocess: '',
          SearchAssets: '',
          // ４种名字
          ProductionLineName:'',
          TechnologyName: '',
          processName: '',
          AssetsName: '',
          // 4种id
          ProductionLineId: '',
          TechnologyId: '',
          processId: '',
          AssetsId: '',

          checkList: [],
          // 全部生产线
          WholeProduction: [],
          // 工艺列表
          WholeTechnology: [],
          // 过程列表
          WholeProcess: [],
          // 资产列表
          WholeAssets: []
        }
      },
      mounted () {
        this.detaillinelist()
      },
      computed: {
        items1 () {
          var _search = this.SearchProductionLine;
          if (_search) {
            return this.WholeProduction.filter(function(product) {
              return Object.keys(product).some(function(key) {
                return String(product[key]).toLowerCase().indexOf(_search) > -1
              })
            })
          }

          return this.WholeProduction;
        },
        items2 () {
          var _search = this.SearchTechnology;
          if (_search) {
            return this.WholeTechnology.filter(function(product) {
              return Object.keys(product).some(function(key) {
                return String(product[key]).toLowerCase().indexOf(_search) > -1
              })
            })
          }

          return this.WholeTechnology;
        },
        items3 () {
          var _search = this.Searchprocess;
          if (_search) {
            return this.WholeProcess.filter(function(product) {
              return Object.keys(product).some(function(key) {
                return String(product[key]).toLowerCase().indexOf(_search) > -1
              })
            })
          }

          return this.WholeProcess;
        },
        items4 () {
          var _search = this.SearchAssets;
          if (_search) {
            return this.WholeAssets.filter(function(product) {
              return Object.keys(product).some(function(key) {
                return String(product[key]).toLowerCase().indexOf(_search) > -1
              })
            })
          }

          return this.WholeAssets;
        }

      },
      methods: {
        // 生产线列表
        detaillinelist () {
          API.StepBeltlineList({
            beltlineName: ''
          }).then((res) => {
            if (res.code ===1 ) {
              this.WholeProduction = res.msg.beltlineData
            }
            if (res.code === 0 ) {
              this.$message({
                message: res.msg,
                type: 'error',
                duration:1000
              })
              return
            }
          }).catch()
        },
        // 导出
        ExportProduction () {
          console.log(this.checkList)
        },
        // 生产线 => 工艺
        CheckTechnology (uuid, name) {
          console.log('工艺 '+ uuid)
          this.WholeProcess = []
          this.WholeAssets = []
          this.ProductionLineName = name
          this.ProductionLineId = uuid
          API.StepProductionEngineeringList({
            beltlineId: uuid,
            productionEngineeringName: ''
          }).then((res) => {
            if (res.code === 1 ) {
              console.log(res)
              if (res.msg.productionEngineeringData.length === 0 ) {
                this.$message({
                  message: '暂时没有工艺',
                  type: 'warning',
                  duration:1000
                })
                this.WholeTechnology = []
                return
              }
              if (res.msg.productionEngineeringData.length > 0) {
                this.WholeTechnology = res.msg.productionEngineeringData
              }

            }
            if (res.code === 0) {
              this.$message({
                message: res.msg,
                type: 'error',
                duration:1000
              })
              return
            }
          }).catch()

        },
        // 工艺　=> 过程
        Checkprocess (uuid, name) {
          this.WholeAssets = []
          this.TechnologyName = name
          this.TechnologyId = uuid
          API.AssociationProcessList({
            batchId: uuid,
            productionProcessName: ''

          }).then((res) => {
            if (res.code === 0 ) {
              this.$message({
                message: res.msg,
                type: 'error',
                duration:1000
              })
              return
            }
            if (res.code === 1 ) {
              if (res.msg.productionProcessData.length === 0 ) {
                this.$message({
                  message: '暂时没有过程',
                  type: 'warning',
                  duration:1000
                })
                this.WholeProcess = []
                return
              }
              if (res.msg.productionProcessData.length > 0) {
                this.WholeProcess = res.msg.productionProcessData
              }


            }
          }).catch()
        },
        // 过程 => 资产
        CheckAssets (uuid, name) {
          this.processName = name
          this.processId = uuid
          API.AssetSpecificationList({
            processId: uuid

          }).then((res) => {
            if (res.code === 0 ) {
              this.$message({
                message: res.msg,
                type: 'error',
                duration:1000
              })
              return
            }
            if (res.code === 1 ) {
              console.log(res)
              if (res.msg.assetsData.length === 0 ) {
                this.$message({
                  message: '暂时没有关联资产',
                  type: 'warning',
                  duration:1000
                })
                this.WholeAssets = []
                return
              }
              if (res.msg.assetsData.length > 0) {
                this.WholeAssets = res.msg.assetsData
              }


            }
          }).catch()

        },
        // 资产 => 资产
        CheckOwn (name) {
          this.AssetsName = name
          // this.AssetsId = uuid
        },
        // 生产线详情
        ProductionDel (uuid) {
          console.log('弹框 '+ uuid)
        },
        // 工艺详情
        TechnologyDel (uuid) {
          console.log('弹框' + uuid)
        },
        // 过程详情
        ProcessDel (uuid) {
          console.log('弹框' + uuid)
        },
        // 资产详情
        AssetsDel (uuid) {
          console.log('弹框' + uuid)
        },
        TextSub (value, start, length, str='...') {
          if(!value) return ''
          if(length >= value.length){
            return value
          }else{
            return value.substr(start, length)+str
          }

        }
      }
    }
</script>
<style lang="scss" scoped>
    .ProductionDetailed {
        .specifications-context {
            .context-box {
                width:100%;
                height:510px;
                border: 1px solid #dcdfe6;
                padding: 0 0 10px 0;
                overflow: hidden;
                .title {
                    width: 100%;
                    height: 40px;
                    line-height: 40px;
                    text-align: left;
                    color: white;
                    background: #2f2e34;
                    font-weight: bold;
                    .el-icon-location {
                        margin: 0 10px 0 10px;
                    }
                    .title-1 {
                        font-size: 12px;
                    }
                }
                .context-box-scroll {
                    height: 470px;
                    li {

                        width: 100%;
                        height: 40px;
                        line-height: 40px;
                        position: relative;
                        padding: 0 15px;
                        cursor: pointer;
                        .checkIcon {
                            display: inline-block;
                            position: absolute;
                            top:0;
                            right: 20px;
                            .Icon-font {
                                font-size: 12px;
                                color: #6d6c72;
                            }
                        }
                        .relationship {
                            display: inline-block;
                            font-size: 12px;
                            margin-left: 10px;
                            color: #6d6c72;
                        }
                    }
                    li.active-Zebra{
                        background: grey;
                        color: white;
                        .Icon-font {
                            color: white;
                        }
                    }
                    .Zebra-white {
                        background: white;
                    }
                    .Zebra-grey {
                        background: #dddc;
                    }
                }

            }
        }
    }
</style>