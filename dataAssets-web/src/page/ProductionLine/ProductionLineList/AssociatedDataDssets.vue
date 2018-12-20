<template>
    <div class="Associated-Data-Dssets">
        <div class="Crumbs">
            <span class="Crumbs-item">生产线</span>
            <i class="el-icon-arrow-right Crumbs-arrowhead"></i>
            <span class="Crumbs-item Crumbs-item-go" @click="goLine">生产线列表</span>
            <i class="el-icon-arrow-right Crumbs-arrowhead"></i>
            <span class="Crumbs-item Crumbs-item-go" @click="goEngineering">工艺列表</span>
            <i class="el-icon-arrow-right Crumbs-arrowhead"></i>
            <span class="Crumbs-item Crumbs-item-go" @click="goProcess">过程列表</span>
            <i class="el-icon-arrow-right Crumbs-arrowhead"></i>
            <span class="Crumbs-level">关联资产 - {{processName}}</span>
        </div>
        <div class="Functional">
            <el-select v-model="AssociatedSearch.regional" placeholder="请选择区域" filterable size="mini" clearable @change="assetsregionalChange" @clear="clearAssetsRegional">
                <el-option
                        v-for="item in regionalData"
                        :key="item.uuid"
                        :label="item.regional_name"
                        :value="item.uuid">
                </el-option>
            </el-select>
            <el-select v-model="AssociatedSearch.medium" placeholder="请选择介质" filterable size="mini" clearable @change="assetsmediumChange" @clear="clearAssetsMedium">
                <el-option
                        v-for="item in mediumData"
                        :key="item.uuid"
                        :label="item.medium_name"
                        :value="item.uuid">
                </el-option>
            </el-select>
            <el-select v-model="AssociatedSearch.path" placeholder="请选择路径" size="mini" filterable clearable @change="assetspathChange" @clear="clearAssetsPath">
                <el-option
                        v-for="item in pathData"
                        :key="item.uuid"
                        :label="item.detailed_path"
                        :value="item.uuid">
                </el-option>
            </el-select>
        </div>
        <div class="row context-box">
            <div class="col-md-5">
                <div class="context-box-content context-box-content-1">
                    <el-scrollbar class="context-box-content-scrollbar">
                        <el-checkbox-group v-model="GroupTagsInId" size="small">
                            <el-checkbox
                                    :label="tag.uuid"
                                    border
                                    v-for="tag in GroupTagsInArr"
                                    :key="tag.uuid">
                                {{tag.asset_name}}
                                <i class="el-icon-warning" v-show="tag.put_status === 'special' "></i>
                                <i class="el-icon-tickets" v-show="tag.put_status === 'out' "></i>
                                <el-tooltip placement="right" effect="light">
                                    <el-button size="mini" type="text" slot="content" @click="CheckAssetsDetail(tag.uuid)">查看</el-button>
                                    <i class="el-icon-search"></i>
                                </el-tooltip>
                            </el-checkbox>
                        </el-checkbox-group>
                    </el-scrollbar>
                    <div class="Function-Marking">
                        <span class="Marking-lable">选择标示:</span>
                        <el-radio-group v-model="MarkingRadio">
                            <el-radio label="in">输入</el-radio>
                            <el-radio label="out">输出</el-radio>
                        </el-radio-group>
                        <span class="Marking-Tips">请选择标示!</span>
                    </div>
                    <div class="out-Marking">
                        <span class="Marking-lable">已输出:</span>
                        <i class="el-icon-tickets"></i>
                    </div>
                    <div class="special-Marking">
                        <span class="Marking-lable">特殊:</span>
                        <i class="el-icon-warning"></i>
                    </div>
                </div>
            </div>
            <div class="col-md-2">
                <div class="MoveBar">
                    <div class="MoveBar-left" v-show="MarkingRadio">
                        <el-button icon="el-icon-d-arrow-left" @click="MoveBarRight"></el-button>
                    </div>
                    <div class="MoveBar-right" v-show="MarkingRadio">
                        <el-button icon="el-icon-d-arrow-right" @click="MoveBarLeft"></el-button>
                    </div>


                </div>
            </div>
            <div class="col-md-5">
                <div class="context-box-content context-box-content-2">
                    <el-scrollbar class="context-box-content-scrollbar1">
                        <el-tag
                                v-for="item in inputTagsAllArr"
                                :key="item.uuid"
                                closable
                                :disable-transitions="false"
                                @close="inputTagsClose(item)"
                                type="">
                            {{item.asset_name}}
                        </el-tag>
                    </el-scrollbar>
                    <el-scrollbar class="context-box-content-scrollbar2">
                        <el-tag
                                v-for="item in outputTagsAllArr"
                                :key="item.uuid"
                                closable
                                :disable-transitions="false"
                                @close="outputTagsClose(item)"
                                type="info">
                            {{item.asset_name}}
                        </el-tag>
                    </el-scrollbar>
                    <div class="colour-Marking">
                        <span class="Marking-lable">颜色标示:</span>
                        <el-tag size="mini">输入</el-tag>
                        <el-tag size="mini" type="info">输出</el-tag>
                    </div>

                </div>
            </div>
        </div>
        <div class="Associated-footer">
            <span class="yellow-button margin-right" @click="AssociatedAssets">确定</span>
            <span class="white-button" @click="ResetTags">重填</span>
        </div>
    </div>
</template>
<script>
    import API from 'API'
    export default {
      name: 'AssociateDataDssets',
      data () {
        return {
          CrumbsLevelName: '关联数据资产',
          processName: '',
          // 区域
          regionalData: [],
          // 介质
          mediumData: [],
          // 路径
          pathData: [],
          // 全部资产
          GroupTagsInArr: [],
          // 已选择
          GroupTagsInId: [],
          // 全部输入
          inputTagsAllArr: [],
          // 全部输出
          outputTagsAllArr: [],
          // 关联所有资产
          AllAssetsArr: [],
          AssociatedSearch: {
            regional: '',
            medium: '',
            path: ''
          },
          // 标示控制
          MarkingRadio: '',
          num:''
        }
      },
      created () {
        this.num = this.$route.params.num
      },
      mounted () {
        this.assetsregionAll()
        this.assetsalllist()
        this.assetInOutlist()
      },
      methods: {
        // 全部资产
        assetsalllist (regional, medium, path) {
          regional = regional ? regional : ''
          medium = medium ? medium : ''
          path = path ? path : ''
          API.AssetsAllList({
            processId: this.num,
            regionId: regional,
            mediumId: medium,
            pathId: path
          }).then((res) => {
            if (res.code ===0 ) {
              this.$message({
                message: res.msg,
                type: 'error',
                duration:1000
              })
              return
            }
            if (res.code === 1 ) {
              this.GroupTagsInArr = res.msg.assetsData
              this.processName = res.msg.productionProcessData.process_name
              console.log(res)
            }
          }).catch()
        },
        // 关联过的输入和输出
        assetInOutlist () {
          API.AssetInOutList({
            processId: this.num
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
              this.inputTagsAllArr = res.msg.assetsInputData
              this.outputTagsAllArr = res.msg.assetsOutputData
              console.log(res)
            }
          }).catch()
        },
        // 搜索 => 区域 区域改变获得介质
        assetsregionalChange () {
          if(!this.AssociatedSearch.regional){
            this.mediumData = []
            this.pathData = []
            return
          }
          API.mediumAllList({
            regionId: this.AssociatedSearch.regional
          }).then((res) => {
            if (res.code ===1 ) {
              console.log(res)
              this.mediumData = res.msg.mediumData
            }
          }).catch()
          this.assetsalllist(this.AssociatedSearch.regional, this.AssociatedSearch.medium, this.AssociatedSearch.path)
        },
        // 搜索 => 介质   介质改变获得路径
        assetsmediumChange () {
          this.clearAssetsMedium()
          if(!this.AssociatedSearch.medium){
            this.pathData = []
            return
          }
          API.mediumPathList({
            mediumId: this.AssociatedSearch.medium
          }).then((res) => {
            if (res.code === 1) {
              this.pathData = res.msg.mediumPathData
              console.log(res)
            }
          }).catch()
          this.assetsalllist(this.AssociatedSearch.regional, this.AssociatedSearch.medium, this.AssociatedSearch.path)
        },
        // 搜索 => 路径
        assetspathChange () {
          this.assetsalllist(this.AssociatedSearch.regional, this.AssociatedSearch.medium, this.AssociatedSearch.path)
        },
        // 全部区域
        assetsregionAll () {
          API.regionAllList({}).then((res) => {
            if (res.code ===1 ) {
              console.log(res)
              this.regionalData = res.msg.regionalData
            }
          }).catch()
        },
        // 删除介质
        clearAssetsMedium () {
          this.AssociatedSearch.path = ''
          this.pathData = []
          this.assetsalllist(this.AssociatedSearch.regional, this.AssociatedSearch.medium, this.AssociatedSearch.path)
        },
        // 删除区域
        clearAssetsRegional () {
          this.AssociatedSearch.regional = ''
          this.AssociatedSearch.medium = ''
          this.mediumData = []
          this.AssociatedSearch.path = ''
          this.pathData = []
          this.assetsalllist(this.AssociatedSearch.regional, this.AssociatedSearch.medium, this.AssociatedSearch.path)
        },
        // 删除路径
        clearAssetsPath () {
          this.assetsalllist(this.AssociatedSearch.regional, this.AssociatedSearch.medium, this.AssociatedSearch.path)
        },
        // 输入后删除
        inputTagsClose (item) {
          console.log(item)
          if (item.newAssets === 1 ) {
            this.inputTagsAllArr.splice(this.inputTagsAllArr.indexOf(item), 1)
          }else {
            API.ProcessAssetRelationsDelete({
              processId: item.process_id,
              assetId: item.uuid,
              putStatus: item.put_status
            }).then((res) => {
              if (res.code === 1 ) {
                this.$message({
                  message: res.msg,
                  type: 'success',
                  duration: 1000
                })
                this.inputTagsAllArr.splice(this.inputTagsAllArr.indexOf(item), 1)
                this.assetInOutlist()
              }
            }).catch()
          }
        },
        // 输出后删除
        outputTagsClose (item) {
          if (item.newAssets === 1 ) {
            this.outputTagsAllArr.splice(this.outputTagsAllArr.indexOf(item), 1)
          }else {
            API.ProcessAssetRelationsDelete({
              processId: item.process_id,
              assetId: item.uuid,
              putStatus: item.put_status
            }).then((res) => {
              if (res.code === 1 ) {
                this.$message({
                  message: res.msg,
                  type: 'success',
                  duration: 1000
                })
                this.assetInOutlist()
                this.outputTagsAllArr.splice(this.outputTagsAllArr.indexOf(item), 1)
              }
            }).catch()
          }
        },
        // 移动到右边
        MoveBarLeft () {
          const _this = this
          // 判断是否选择了资产
          if (_this.GroupTagsInId.length === 0) {
            _this.$message({
              message: '请勾选资产',
              type: 'warning',
              duration: 1000
            })
            return false
          }

          // 判断已选择和输入框是否有冲突
          if (_this.inputTagsAllArr.length > 0) {
            for (var a = 0; a < _this.GroupTagsInId.length; a++) {
              for (var b = 0; b < _this.inputTagsAllArr.length; b++) {
                if (_this.GroupTagsInId[a] === _this.inputTagsAllArr[b].uuid) {
                  _this.$message({
                    message: '数据资产输入有重复',
                    type: 'warning',
                    duration: 1000
                  })
                  return false
                }
              }
            }
          }
          // 判断已选择和输出框是否有冲突
          if (_this.outputTagsAllArr.length > 0) {
            for (var m = 0; m < _this.GroupTagsInId.length; m++) {
              for (var n = 0; n < _this.outputTagsAllArr.length; n++) {
                if (_this.GroupTagsInId[m] === _this.outputTagsAllArr[n].uuid) {
                  _this.$message({
                    message: '数据资产输出有重复',
                    type: 'warning',
                    duration: 1000
                  })
                  return false
                }
              }
            }
          }

          // 将已选择的移动到未选择内
          const tags = _this.GroupTagsInArr
          if (tags.length > 0) {
            if (_this.MarkingRadio === 'in') {
              // 判断是否可以移动到输入区



              for (var i = 0; i < tags.length; i++) {
                for (var j = 0; j < _this.GroupTagsInId.length; j++) {
                  if (tags[i].uuid === _this.GroupTagsInId[j]) {
                    if (tags[i].put_status === 'special' || tags[i].put_status === 'out') {
                      const TagsA = {
                        process_id: _this.num,
                        uuid: tags[i].uuid,
                        put_status: 'in',
                        asset_name: tags[i].asset_name,
                        newAssets: 1
                      }
                      _this.inputTagsAllArr.push(TagsA)
                    }else {
                      _this.$message({
                        message: '只能选择特殊资产或者已经输出的资产',
                        type: 'warning',
                        duration: 1500
                      })
                      return
                    }

                  }

                }
              }
              _this.MarkingRadio = ''
              _this.GroupTagsInId = []
            }
            if (_this.MarkingRadio === 'out') {
              for (var c = 0; c < tags.length; c++) {
                for (var d = 0; d < _this.GroupTagsInId.length; d++) {
                  if (tags[c].uuid === _this.GroupTagsInId[d]) {
                    if (tags[c].put_status === 'no' || tags[c].put_status === 'special') {
                      const TagsA = {
                        process_id: _this.num,
                        uuid: tags[c].uuid,
                        put_status: 'out',
                        asset_name: tags[c].asset_name,
                        newAssets: 1
                      }
                      _this.outputTagsAllArr.push(TagsA)
                    }else {
                      _this.$message({
                        message: '只能选择特殊输出资产或者没有输出的资产',
                        type: 'warning',
                        duration: 1500
                      })
                      return
                    }
                  }

                }
              }
              _this.MarkingRadio = ''
              _this.GroupTagsInId = []
            }
          }else if (tags.length === 0)  {
            _this.$message({
              message: '没有可移动的资产',
              type: 'warning',
              duration: 1000
            })
          }
        },
        // 移动到左边
        MoveBarRight () {
          const _this = this
          if (_this.outputTagsAllArr.length || _this.inputTagsAllArr.length) {
            _this.outputTagsAllArr = []
            _this.inputTagsAllArr = []
          }else {
            _this.$message({
              message: '没有可移动的资产',
              type: 'warning',
              duration: 1000
            })
          }
        },
        // 关联所有资产
        AssociatedAssets () {
          if (!this.inputTagsAllArr.length) {
            this.$message({
              message: '请关联输入资产',
              type: 'warning',
              duration:1000
            })
            return
          }
          if (!this.outputTagsAllArr.length) {
            this.$message({
              message: '请关联输出资产',
              type: 'warning',
              duration:1000
            })
            return
          }
          this.AllAssetsArr = this.inputTagsAllArr.concat(this.outputTagsAllArr)
          if (!this.AllAssetsArr.length) {
            this.$message({
              message: '请关联资产',
              type: 'warning',
              duration:1000
            })
            return
          }
          console.log(this.inputTagsAllArr)
          console.log(this.outputTagsAllArr)
          console.log(this.AllAssetsArr)
          API.ProcessAssetRelations({
            assetRelationData: this.AllAssetsArr
          }).then((res) => {
            if (res.code === 0 ) {
              this.$message({
                message: res.msg,
                type: 'error',
                duration: 1000
              })
            }
            if (res.code === 1 ) {
              this.$message({
                message: res.msg,
                type: 'success',
                duration: 1000
              })
              this.inputTagsAllArr = []
              this.outputTagsAllArr = []
              this.assetsalllist(this.AssociatedSearch.regional, this.AssociatedSearch.medium, this.AssociatedSearch.path)
              this.assetInOutlist()
            }
          }).catch()
        },
        // 重置
        ResetTags () {
          this.inputTagsAllArr = []
          this.outputTagsAllArr = []
        },
        goLine () {
          this.$router.push('/home/ProductionLineList')
        },
        goEngineering () {
          var EngeeringId = localStorage.getItem('EngeeringId')
          this.$router.push('/home/ProductionLineDetails/'+EngeeringId)
        },
        goProcess () {
          var ProcessId = localStorage.getItem('ProcessId')
          this.$router.push('/home/RelationProcess/'+ ProcessId)
        },
        // 详细资产
        CheckAssetsDetail (uuid) {
          this.$router.push('/home/DetailListDetails/'+ uuid)
        }
      }
    }
</script>
<style lang="scss" scoped>
    .Associated-Data-Dssets {
        .Crumbs-item-go{
            cursor: pointer;
        }
        .Associated-footer {
            margin-top: 20px;
            text-align: center;
            position: relative;
            .margin-right {
                margin-right: 20px;
            }
        }
        .button-20 {
            margin-left: 20px;
        }
        .context-box {
            .context-box-content {
                width:100%;
                height:500px;
                box-shadow: 1px 2px 7px #ccc;
                padding: 10px 0 10px 10px;
                overflow: hidden;
                position: relative;
                .context-box-content-scrollbar {
                    height: 440px;
                }
            }
            .context-box-content-1 {
                .Function-Marking {
                    position: absolute;
                    bottom:10px;
                    left: 20px;
                    .Marking-lable {

                    }
                    .Marking-Tips {
                        font-size: 12px;
                        margin-left: 20px;
                        color: #ff6600;
                    }
                }
                @media screen and (max-width: 1365px) {
                    .Function-Marking {
                        position: absolute;
                        bottom:22px !important;
                        left: 20px !important;
                    }
                    .special-Marking {
                        position: absolute;
                        bottom: 6px !important;
                        left: 120px !important;
                    }
                    .out-Marking {
                        position: absolute;
                        bottom: 6px !important;
                        left: 20px !important;
                    }
                }
                .special-Marking {
                    position: absolute;
                    bottom: 14px;
                    right: 20px;
                }
                .out-Marking {
                    position: absolute;
                    bottom: 14px;
                    right: 105px;
                }
            }
            .context-box-content-2 {
                .context-box-content-scrollbar1 {
                    height: 220px;
                }
                .context-box-content-scrollbar2 {
                     height: 220px;
                }
                .colour-Marking {
                    position: absolute;
                    bottom: 0;
                    left: 20px;
                }
            }
            .MoveBar {
                width:100%;
                height:500px;
                padding: 10px 0 10px 10px;
                overflow: hidden;
                text-align: center;
                position: relative;
                .MoveBar-left {
                    width: 100%;
                    position: absolute;
                    top:200px;
                    left:0;
                }
                .MoveBar-right {
                    width: 100%;
                    position: absolute;
                    top:250px;
                    left:0;
                }
            }
        }
    }
    .el-icon-warning, .el-icon-tickets{
        padding-left: 8px;
    }
</style>