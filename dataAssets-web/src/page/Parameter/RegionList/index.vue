<template>
    <div class="Context">
        <div class="Crumbs">
            <span class="Crumbs-item">参数管理</span>
            <i class="el-icon-arrow-right Crumbs-arrowhead"></i>
            <span class="Crumbs-level">域列表</span>
        </div>
        <div class="Functional">
            <el-input v-model="RegionName" placeholder="域名称" size="mini" clearable @clear="clearRegion"></el-input>
            <span class="yellow-button button-20" @click="SearchRegion">搜索</span>
            <div class="Functional-right">
                <span class="white-button button-15" @click="AddRegion">添加</span>
                <span class="white-button button-15" @click="DelRegion">删除</span>
            </div>

        </div>
        <div class="row">
            <div class="col-md-12">
                <el-table
                        :data="RegionData"
                        border
                        stripe
                        style="width: 100%"
                        @selection-change="handleSelectionChange">
                    <el-table-column
                            type="selection"
                            width="55">
                    </el-table-column>
                    <el-table-column
                            prop="regional_name"
                            label="域名称">
                    </el-table-column>
                    <el-table-column
                            label="特殊域">
                        <template slot-scope="scope">
                            {{ scope.row.region_status === 1 ? '是' : '否' }}
                        </template>
                    </el-table-column>
                    <el-table-column
                            label="备注"
                            width="180"
                            show-overflow-tooltip>
                        <template slot-scope="scope">
                            {{scope.row.region_remarks ? scope.row.region_remarks : '暂无备注'}}
                        </template>
                    </el-table-column>
                    <el-table-column
                            prop="username"
                            label="创建人"
                            show-overflow-tooltip>
                    </el-table-column>
                    <el-table-column
                            label="创建时间">
                        <template slot-scope="scope">
                            {{formatDate(scope.row.creation_time * 1000, 'yyyy-MM-dd hh:mm')}}
                        </template>
                    </el-table-column>
                    <el-table-column
                            label="操作">
                        <template slot-scope="scope">
                            <el-button title="编辑" size="mini" @click="RegionEdit(scope.row.uuid, scope.row.regional_name, scope.row.region_status, scope.row.region_remarks)">编辑</el-button>
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
        <el-dialog :title="DialogTitle" :visible.sync="RegionDialog" width="30%">
            <el-form :model="form">
                <el-form-item label="域名称" :label-width="formLabelWidth">
                    <el-input v-model="form.name" auto-complete="off" placeholder="请输入名称" size="mini" clearable></el-input>
                </el-form-item>
                <el-form-item label="是否特殊" :label-width="formLabelWidth">
                    <el-radio-group v-model="form.Regionradio">
                        <el-radio :label="1">是</el-radio>
                        <el-radio :label="2">否</el-radio>
                    </el-radio-group>
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
                <span class="yellow-button button-right" @click="SureRegionAdd" v-show="addShow">确定</span>
                <span class="yellow-button button-right" @click="SureRegionEdit" v-show="editShow">确定</span>
                <span class="white-button button-15" @click="ResetRegionAdd">重填</span>
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
          RegionName: '',
          RegionData: [],
          multipleSelection: [],
          CurrentPage: 1,
          total: 0,
          RegionDialog: false,
          addShow: true,
          editShow: false,
          DialogTitle: '添加',
          form: {
            name: '',
            Regionradio: '',
            textarea: ''
          },
          RegionId: '',
          formLabelWidth: '80px'
        }
      },
      methods: {
        // 区域列表
        CreateRegionList (page) {
          if (page === '' || page === 1 ) {
            page = 1
            this.CurrentPage = 1
          }
          API.RegionList({
            regionName: this.RegionName,
            page: page
          }).then((res) => {
            if (res.code ===1) {
              this.RegionData = res.msg.regionalData
              this.total = parseInt(res.msg.count[0].count)
            }
          }).catch()
        },
        // 搜索
        SearchRegion () {
          this.CreateRegionList(1)
        },
        clearRegion () {
          this.CreateRegionList(1)
        },
        // 添加
        AddRegion () {
          this.DialogTitle = '添加'
          this.RegionDialog = true
          this.addShow = true
          this.editShow = false
        },
        // 确定添加
        SureRegionAdd () {
          const _this = this
          if (!_this.form.name) {
            _this.$message({
              message: '名称不能为空',
              type: 'warning',
              duration:1000
            })
            return
          }
          if (!_this.form.Regionradio) {
            _this.$message({
              message: '选择区域类型',
              type: 'warning',
              duration:1000
            })
            return
          }
          API.RegionCreate({
            regionName: _this.form.name,
            regionStatus: _this.form.Regionradio,
            regionRemark: _this.form.textarea
          }).then((res) => {
            if (res.code ===1 ) {
              _this.RegionDialog = false
              _this.form = {}
              _this.$message({
                message: res.msg,
                type: 'success',
                duration:1000
              })
              _this.CreateRegionList()
            }
            if (res.code === 0 ) {
              _this.$message({
                message: res.msg,
                type: 'error',
                duration:1000
              })
              return
            }
          }).catch((res) => {
            _this.$message({
              message: '网络失败',
              type: 'error',
              duration:1000
            })
          })
        },
        // 重置添加
        ResetRegionAdd () {
            this.form = {}
        },
        //　编辑
        RegionEdit (uuid, name, region_status, remark) {
          this.DialogTitle = '修改'
          this.RegionDialog = true
          this.RegionId = uuid
          this.form.name = name
          this.form.Regionradio = region_status
          this.form.textarea = remark
          this.addShow = false
          this.editShow = true

        },
        // 确认编辑
        SureRegionEdit () {
          const _this = this
          if (!_this.form.name) {
            _this.$message({
              message: '名称不能为空',
              type: 'warning',
              duration:1000
            })
            return
          }
          API.RegionUpdate({
            uuid: _this.RegionId,
            regionName: _this.form.name,
            regionStatus: _this.form.Regionradio,
            regionRemark: _this.form.textarea
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
              _this.RegionDialog = false
              _this.form = {}
              _this.$message({
                message: res.msg,
                type: 'success',
                duration:1000
              })
              _this.CreateRegionList(_this.CurrentPage)
            }
          }).catch()
        },
        handleSelectionChange(val) {
          this.multipleSelection = val;
        },
        // 删除区域
        DelRegion () {
          const _this = this
          let ids=[]
          _this.multipleSelection.map((item)=> {
            ids.push(item.uuid)
          })
          if(!ids.length){
            _this.$message({
              message: '请选择需要删除的区域',
              type: 'warning',
              duration:1000
            })
            return
          }
          _this.$confirm('删除此区域, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            showClose: false,
            type: 'warning'
          }).then(() => {
            API.RegionDelete({
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
                _this.CreateRegionList(_this.CurrentPage)
              }
            }).catch()


          }).catch(() => {
            _this.$message({
              type: 'info',
              message: '已取消删除'
            })
          })
        },
        // 分页
        CurrentChange (val) {
          this.CurrentPage = val
          this.CreateRegionList(val)
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
      },
      mounted () {
        this.CreateRegionList()
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
</style>