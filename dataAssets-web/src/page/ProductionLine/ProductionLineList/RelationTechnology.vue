<template>
    <div class="Associated-Data-Dssets">
        <div class="Crumbs">
            <span class="Crumbs-item">生产线</span>
            <i class="el-icon-arrow-right Crumbs-arrowhead"></i>
            <span class="Crumbs-item Crumbs-item-go" @click="goback">生产线列表</span>
            <i class="el-icon-arrow-right Crumbs-arrowhead"></i>
            <span class="Crumbs-level">{{ CrumbsLevelName }}</span>
        </div>
        <div class="row context-box">
            <div class="col-md-5">
                <div class="context-box-content context-box-content-1">
                    <el-scrollbar class="context-box-content-scrollbar">
                        <el-checkbox-group v-model="GroupTagsInId" size="small">
                            <el-checkbox :label="tag.id" border v-for="tag in GroupTagsInArr" :key="tag.id">{{tag.name}}</el-checkbox>
                        </el-checkbox-group>
                    </el-scrollbar>
                </div>
            </div>
            <div class="col-md-2">
                <div class="MoveBar">
                    <div class="MoveBar-left" v-show="GroupTagsInId.length">
                        <el-button icon="el-icon-d-arrow-left" @click="MoveBarRight"></el-button>
                    </div>
                    <div class="MoveBar-right" v-show="GroupTagsInId.length">
                        <el-button icon="el-icon-d-arrow-right" @click="MoveBarLeft"></el-button>
                    </div>


                </div>
            </div>
            <div class="col-md-5">
                <div class="context-box-content context-box-content-2">
                    <el-scrollbar class="context-box-content-scrollbar">
                        <el-tag
                                v-for="item in GroupTagsAllArr"
                                :key="item.id"
                                closable
                                :disable-transitions="false"
                                @close="addTagsClose(item)">
                            {{item.name}}
                        </el-tag>
                    </el-scrollbar>
                </div>
            </div>
        </div>
        <div class="Associated-footer">
            <span class="yellow-button margin-right">确定</span>
            <span class="white-button" @click="ResetTags">重填</span>
        </div>
    </div>
</template>
<script>
  export default {
    name: 'AssociateDataDssets',
    data () {
      return {
        CrumbsLevelName: '关联生产工艺',
        GroupTagsInArr: [
          { name: '工艺一一', id: 1 },
          { name: '工艺二', id: 2},
          { name: '工艺三', id: 3 },
          { name: '工艺四四', id: 4 },
          { name: '工艺吴', id: 5 },
          { name: '工艺六', id: 6 },
          { name: '工艺器器', id: 7 },
          { name: '工艺把', id: 8 },
          { name: '工艺就', id: 9 },
          { name: '工艺是是', id: 10 },
          { name: '工艺一一', id: 11 },
          { name: '工艺二', id: 12},
          { name: '工艺三', id: 13 },
          { name: '工艺四四', id: 14 },
          { name: '工艺吴', id: 15 },
          { name: '工艺六', id: 16 },
          { name: '工艺器器', id: 17 },
          { name: '工艺把', id: 18 },
          { name: '工艺就', id: 19 },
          { name: '工艺是是', id: 20 },
          { name: '工艺一一', id: 21 },
          { name: '工艺二', id: 22},
          { name: '工艺三', id: 23 },
          { name: '工艺四四', id: 24 },
          { name: '工艺吴', id: 25 },
          { name: '工艺六', id: 26 },
          { name: '工艺器器', id: 27 },
          { name: '工艺把', id: 28 },
          { name: '工艺就', id: 29 },
          { name: '工艺是是', id: 30 },
          { name: '工艺一一', id: 31 },
          { name: '工艺二', id: 32},
          { name: '工艺三', id: 33 },
          { name: '工艺四四', id: 34 },
          { name: '工艺吴', id: 35 },
          { name: '工艺六', id: 36 },
          { name: '工艺器器', id: 37 },
          { name: '工艺把', id: 38 },
          { name: '工艺就', id: 39 },
          { name: '工艺是是', id: 40 }
        ],
        GroupTagsInId: [],
        GroupTagsAllArr: []
      }
    },
    methods: {
      goback () {
        this.$router.go(-1)
      },

      // 移动后删除
      addTagsClose (item) {
        this.GroupTagsAllArr.splice(this.GroupTagsAllArr.indexOf(item), 1)
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
        // 判断已选择和未选择是否有冲突
        if (_this.GroupTagsAllArr.length > 0) {
          for (var m = 0; m < _this.GroupTagsInId.length; m++) {
            for (var n = 0; n < _this.GroupTagsAllArr.length; n++) {
              if (_this.GroupTagsInId[m] === _this.GroupTagsAllArr[n].id) {
                _this.$message({
                  message: '数据资产有重复',
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

          for (var i = 0; i < tags.length; i++) {
            for (var j = 0; j < _this.GroupTagsInId.length; j++) {
              if (tags[i].id === _this.GroupTagsInId[j]) {
                const TagsA = {
                  id: tags[i].id,
                  name: tags[i].name
                }
                _this.GroupTagsAllArr.push(TagsA)

              }

            }
          }
          _this.GroupTagsInId = []
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
        if (_this.GroupTagsAllArr.length) {
          _this.GroupTagsAllArr = []
        }else {
          _this.$message({
            message: '没有可移动的资产',
            type: 'warning',
            duration: 1000
          })
        }
      },
      // 重置
      ResetTags () {
        this.GroupTagsAllArr = []
      }
    }
  }
</script>
<style lang="scss" scoped>
    .Associated-Data-Dssets {
        .Crumbs {
            margin-bottom: 20px;
        }
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
</style>