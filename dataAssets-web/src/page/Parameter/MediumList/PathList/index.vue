<template>
    <div class="Context">
        <div class="Crumbs">
            <span class="Crumbs-item">参数管理</span>
            <i class="el-icon-arrow-right Crumbs-arrowhead"></i>
            <span class="Crumbs-item Crumbs-item-go" @click="goMedium">介质列表</span>
            <i class="el-icon-arrow-right Crumbs-arrowhead"></i>
            <span class="Crumbs-level">路径列表 - {{PathFatherName}}</span>
        </div>
        <div class="Functional">
            <el-input v-model="PathName" placeholder="路径名称" size="mini" clearable @clear="clearPath"></el-input>
            <span class="yellow-button button-20" @click="SearchPath">搜索</span>
            <div class="Functional-right">
                <span class="white-button button-15" @click="AddPath">添加</span>
                <span class="white-button button-15" @click="DelPath">删除</span>
            </div>

        </div>
        <div class="row">
            <div class="col-md-12">
                <el-table
                        :data="PathData"
                        border
                        stripe
                        style="width: 100%"
                        @selection-change="handleSelectionChange">
                    <el-table-column
                            type="selection"
                            width="55">
                    </el-table-column>
                    <el-table-column
                            prop="detailed_path"
                            label="路径名称"
                            show-overflow-tooltip
                            width="180">
                    </el-table-column>
                    <el-table-column
                            label="备注"
                            show-overflow-tooltip>
                        <template slot-scope="scope">
                            {{scope.row.path_remarks ? scope.row.path_remarks : '暂无备注'}}
                        </template>
                    </el-table-column>
                    <el-table-column
                            prop="username"
                            label="创建人">
                    </el-table-column>
                    <el-table-column
                            label="操作时间">
                        <template slot-scope="scope">
                            {{formatDate(scope.row.creation_time * 1000, 'yyyy-MM-dd hh:mm')}}
                        </template>
                    </el-table-column>
                    <el-table-column
                            label="操作">
                        <template slot-scope="scope">
                            <el-button title="编辑" size="mini" @click="editPath(scope.row.uuid, scope.row.detailed_path, scope.row.path_remarks)">编辑</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="pagination-page">
                    <el-pagination
                            @current-change="CurrentChange"
                            :current-page.sync="CurrentPage"
                            :page-size="15"
                            layout="prev, pager, next, total, jumper, slot"
                            :total="total">
                    </el-pagination>
                </div>
            </div>
        </div>
        <el-dialog :title="PathTitle" :visible.sync="PathDialog" width="30%">
            <el-form :model="form">
                <el-form-item label="路径名称" :label-width="formLabelWidth">
                    <el-input v-model="form.name" auto-complete="off" placeholder="请输入名称" size="mini" clearable></el-input>
                </el-form-item>
                <el-form-item label="备注" :label-width="formLabelWidth">
                    <el-input
                            type="textarea"
                            :rows="2"
                            resize="none"
                            placeholder="请输入内容"
                            v-model="form.textarea">
                    </el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <span class="yellow-button button-right" @click="SurePathadd" v-show="addshow">确定</span>
                <span class="yellow-button button-right" @click="SurePathedit" v-show="editshow">确定</span>
                <span class="white-button button-15" @click="ResetPathAdd">重填</span>
            </div>
        </el-dialog>
    </div>
</template>
<script>
  import API from 'API'
  export default {
    name: 'RegionList',
    data () {
      return {
        PathName: '',
        PathFatherName: '',
        PathData: [],
        multipleSelection: [],
        CurrentPage: 1,
        total: 0,
        PathDialog: false,
        addshow: true,
        editshow: false,
        form: {
          name: '',
          textarea: ''
        },
        PathTitle: '',
        formLabelWidth: '80px',
        num: '',
        pathId: ''
      }
    },
    created () {
      this.num = this.$route.params.num
      console.log(this.num)
    },
    mounted () {
      this.Pathlist(this.num, 1)
    },
    methods: {
      goMedium () {
        this.$router.push('/home/MediumList')
      },
      SearchPath () {
        this.Pathlist(this.num, 1)
      },
      clearPath () {
        this.Pathlist(this.num, 1)
      },
      // 路径列表
      Pathlist (num, page) {
        if (page === '' || page === 1 ) {
          page = 1
          this.CurrentPage = 1
        }
        API.PathList({
          mediumId: num,
          pathName: this.PathName,
          page: page
        }).then((res) => {
          if (res.code === 0) {
            this.$message({
              message: res.msg,
              type: 'error',
              duration:1000
            })
          }
          if (res.code ===1 ) {
            console.log(res)
            this.PathData = res.msg.pathData
            this.PathFatherName = res.msg.mediumName.medium_name
            this.total = parseInt(res.msg.count[0].count)
          }
        }).catch()
      },
      // 添加
      AddPath () {
        this.form = {}
        this.PathTitle = '添加'
        this.addshow = true
        this.editshow = false
        this.PathDialog = true

      },
      // 确认添加
      SurePathadd () {
        const _this = this
        if (!_this.form.name) {
          _this.$message({
            message: '名称不能为空',
            type: 'warning',
            duration:1000
          })
          return
        }
        API.PathCreate({
          mediumId: _this.num,
          pathName: _this.form.name,
          pathRemark: _this.form.textarea
        }).then((res) => {
          if (res.code === 0) {
            _this.$message({
              message: res.msg,
              type: 'error',
              duration:1000
            })
          }
          if (res.code ===1) {
            _this.PathDialog = false
            this.form = {}
            _this.$message({
              message: res.msg,
              type: 'success',
              duration:1000
            })
            _this.Pathlist(this.num, 1)
          }
        }).catch()
      },
      // 编辑
      editPath (uuid, detailed_path, path_remarks) {
        this.form = {}
        this.PathTitle = '修改'
        this.addshow = false
        this.editshow = true
        this.PathDialog = true
        this.pathId = uuid
        this.form.name= detailed_path
        this.form.textarea = path_remarks
      },
      // 确认编辑
      SurePathedit () {
        const _this = this
        if (!_this.form.name) {
          _this.$message({
            message: '名称不能为空',
            type: 'warning',
            duration:1000
          })
          return
        }
        API.PathUpdate({
          uuid: _this.pathId,
          mediumId: _this.num,
          pathName: _this.form.name,
          pathRemark: _this.form.textarea
        }).then((res) => {
          if (res.code === 0) {
            _this.$message({
              message: res.msg,
              type: 'error',
              duration:1000
            })
          }
          if (res.code ===1) {
            _this.PathDialog = false
            this.form = {}
            _this.$message({
              message: res.msg,
              type: 'success',
              duration:1000
            })
            _this.Pathlist(_this.num, _this.CurrentPage)
          }
        }).catch()
      },
      // 删除
      DelPath () {
        const _this = this
        let ids=[]
        _this.multipleSelection.map((item)=> {
          ids.push(item.uuid)
        })
        if(!ids.length){
          _this.$message({
            message: '请选择需要删除的路径',
            type: 'warning',
            duration:1000
          })
          return
        }
        _this.$confirm('删除此路径, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          showClose: false,
          type: 'warning'
        }).then(() => {
          API.PathDelete({
            uuid: ids
          }).then((res) => {
            if (res.code === 0) {
              _this.$message({
                message: res.msg,
                type: 'error',
                duration:1000
              })
              return
            }
            if (res.code ===1 ) {
              _this.$message({
                type: 'success',
                message: res.msg,
                duration:1000
              })
              _this.Pathlist(_this.num, _this.CurrentPage)
            }
          }).catch()


        }).catch(() => {
          _this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      // 重填
      ResetPathAdd () {
        this.form = {}
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      CurrentChange (val) {
        this.CurrentPage = val
        this.Pathlist(this.num, this.CurrentPage)
      },
      formatDate (date, fmt) {
        date = new Date(date)
        if (/(y+)/.test(fmt)) {
          fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
        }
        let o = {
          'M+': date.getMonth() + 1,
          'd+': date.getDate(),
          'h+': date.getHours(),
          'm+': date.getMinutes(),
          's+': date.getSeconds()
        }
        function padLeftZero (str) {
          return ('00' + str).substr(str.length)
        }
        for (let k in o) {
          if (new RegExp(`(${k})`).test(fmt)) {
            let str = o[k] + ''
            fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? str : padLeftZero(str))
          }
        }
        return fmt
      }
    }
  }
</script>
<style lang="scss" scoped>
    .button-20 {
        margin-left: 20px;
    }
    .button-15 {
        margin-right: 15px;
    }
    .button-right {
        margin-right: 20px;
    }
    .Crumbs-item-go {
        cursor: pointer;
    }
</style>