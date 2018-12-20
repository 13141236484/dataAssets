<template>
    <div class="Context">
        <div class="Crumbs">
            <span class="Crumbs-item">生产线</span>
            <i class="el-icon-arrow-right Crumbs-arrowhead"></i>
            <span class="Crumbs-level">生产线列表</span>
        </div>
        <div class="Functional">
            <el-input v-model="ProductionName" placeholder="生产线名称" size="mini" clearable @clear="clearProduction"></el-input>
            <span class="yellow-button button-20" @click="SearchProduction">搜索</span>
            <!--<span class="white-button button-20">导出</span>-->
            <div class="Functional-right">
                <span class="white-button button-15" @click="AddProduction">添加</span>
                <span class="white-button button-15" @click="DelProduction">删除</span>
            </div>

        </div>
        <div class="row">
            <div class="col-md-12">
                <el-table
                        :data="ProductionLineData"
                        border
                        stripe
                        style="width: 100%"
                        @selection-change="handleSelectionChange">
                    <el-table-column
                            type="selection"
                            width="55">
                    </el-table-column>
                    <el-table-column
                            prop="beltline_name"
                            label="生产线名称">
                    </el-table-column>
                    <el-table-column
                            prop="username"
                            label="创建人">
                    </el-table-column>
                    <el-table-column
                            width="180"
                            label="备注"
                            show-overflow-tooltip>
                        <template slot-scope="scope">
                            {{scope.row.beltline_remarks ? scope.row.beltline_remarks : '暂无备注'}}
                        </template>
                    </el-table-column>
                    <el-table-column
                            label="创建时间">
                        <template slot-scope="scope">
                            {{formatDate(scope.row.creation_time * 1000, 'yyyy-MM-dd hh:mm')}}
                        </template>
                    </el-table-column>
                    <el-table-column
                            width="280"
                            label="操作">
                        <template slot-scope="scope">
                            <router-link :to="{path: '/home/ProductionLineDetails/'+ scope.row.uuid}">
                                <el-button size="mini">查看详情</el-button>
                            </router-link>
                            <el-button size="mini" @click="Import(scope.row.uuid)">导出</el-button>
                            <el-button title="编辑" size="mini" @click="editProduction(scope.row.uuid, scope.row.beltline_name, scope.row.beltline_remarks)">编辑</el-button>
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
        <el-dialog :title="ProductionTitle" :visible.sync="ProductionDialog" width="30%">
            <el-form :model="form">
                <el-form-item label="生产线名称" :label-width="formLabelWidth">
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
                <span class="yellow-button button-right" @click="SureProductionAdd" v-show="proAdd">确定</span>
                <span class="yellow-button button-right" @click="SureProductionEdit" v-show="proedit">确定</span>
                <span class="white-button button-15" @click="ResetProAdd">重填</span>
            </div>
        </el-dialog>
        <!--导出配置文件模态框-->
        <el-dialog
                title="点击下载"
                :visible.sync="ImportDialog"
                width="40%">
            <p style="text-align: center;">
                <a :data-path="v" v-for="v in loadMsg" @click="loadOneConf(v)" style="display: block;cursor: pointer;">{{v}}</a>
            </p>
        </el-dialog>
    </div>
</template>
<script>
  import API from 'API'
  import download from 'downloadjs'
  import axios from 'axios'
  import store from '../../../store/index'
  export default {
    name: 'RegionList',
    data () {
      return {
        ProductionName: '',
        ProductionTitle: '添加',
        ProductionLineData: [],
        multipleSelection: [],
        loadMsg: [],
        CurrentPage: 1,
        total: 0,
        ProductionDialog: false,
        ImportDialog: false,
        proAdd: true,
        proedit: false,
        ProductionId: '',
        form: {
          name: '',
          textarea: ''
        },
        formLabelWidth: '100px'
      }
    },
    mounted () {
      this.productionlist()
    },
    methods: {
      SearchProduction () {
        this.productionlist()
      },
      clearProduction () {
        this.productionlist()
      },
      // 生产线列表
      productionlist (page) {
        if (page === '' || page === 1 ) {
          page = 1
          this.CurrentPage = 1
        }
        API.BeltlineList({
          beltlineName: this.ProductionName,
          page: page
        }).then((res) => {
          if (res.code ===1) {
            this.ProductionLineData = res.msg.beltlineData
            this.total = parseInt(res.msg.count[0].count)
          }
        }).catch()
      },
      // 重置表单
      ResetProAdd () {
        this.form.name = ''
        this.form.textarea = ''
      },
      // 添加生产线
      AddProduction () {
        this.form.name = ''
        this.form.textarea = ''
        this.ProductionTitle = '添加'
        this.proAdd = true
        this.proedit = false
        this.ProductionDialog = true
      },
      // 确认添加
      SureProductionAdd () {
        const _this = this
        if (!_this.form.name) {
          _this.$message({
            message: '名称不能为空',
            type: 'warning',
            duration:1000
          })
          return
        }
        API.BeltlineCreate({
          beltlineName: _this.form.name,
          beltlineRemark: _this.form.textarea
        }).then((res) => {
          if (res.code ===1) {
            _this.ProductionDialog = false
            _this.$message({
              message: res.msg,
              type: 'success',
              duration:1000
            })

            _this.productionlist(1)
          }
          if (res.code === 0) {
            _this.$message({
              message: res.msg,
              type: 'error',
              duration:1000
            })
          }
        }).catch()
      },
      // 修改
      editProduction (uuid, beltline_name, beltline_remarks) {
        this.form.name = ''
        this.form.textarea = ''
        this.ProductionTitle = '修改'
        this.proAdd = false
        this.proedit = true
        this.ProductionDialog = true
        this.ProductionId = uuid
        this.form.name = beltline_name
        this.form.textarea = beltline_remarks

      },
      // 确认修改
      SureProductionEdit () {
        const _this = this
        if (!_this.form.name) {
          _this.$message({
            message: '名称不能为空',
            type: 'warning',
            duration:1000
          })
          return
        }
        API.BeltlineUpdate({
          uuid: _this.ProductionId,
          beltlineName: _this.form.name,
          beltlineRemark: _this.form.textarea
        }).then((res) => {
          if (res.code === 0 ) {
            _this.$message({
              message: res.msg,
              type: 'error',
              duration:1000
            })
          }
          if (res.code ===1) {
            _this.ProductionDialog = false
            _this.$message({
              message: res.msg,
              type: 'success',
              duration:1000
            })

            _this.productionlist(_this.CurrentPage)
          }

        }).catch()
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      // 删除生产线
      DelProduction () {
        const _this = this
        let ids=[]
        _this.multipleSelection.map((item)=> {
          ids.push(item.uuid)
        })
        if(!ids.length){
          _this.$message({
            message: '请选择需要删除的生产线',
            type: 'warning',
            duration:1000
          })
          return
        }
        _this.$confirm('删除此生产线, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          showClose: false,
          type: 'warning'
        }).then(() => {
          API.BeltlineDelete({
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
              _this.productionlist(_this.CurrentPage)
            }
          }).catch()

        }).catch(() => {
          _this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      // 导出配置文件
      Import (uuid) {
        const _this = this
        API.MakeConfigurationFile({
          beltlineId: uuid
        }).then((res) => {
          if (res.code === 0 ) {
            _this.$message({
              type: 'warning',
              message: res.msg,
              duration:1000
            })
          }
          if (res.code === 1 ) {
            console.log(res)
            _this.loadMsg = res.msg
            _this.ImportDialog = true


          }
        }).catch()
      },
      // 点击下载
      loadOneConf (v) {
        API.ExportYamlFile({
          yamlPath: v
        }).then((res) => {
          var fileName ='test'
          const arrFileName = v.match( /\/yaml\/.+\/(.+?\.yaml)/ )
          if(arrFileName.length === 2){
            fileName = arrFileName[1]
          }
          console.log(fileName)
          download(res, fileName, "application/x-yaml")
        }).catch()


//        const elem = e.target ? e.target : e.srcElement
//        const data = {yamlPath: $(elem).attr('data-path')}
//        const arrFileName = $(elem).attr('data-path').match( /\/yaml\/.+\/(.+?\.yaml)/ )
//        var fileName = 'test'
//        if(arrFileName.length === 2){
//          fileName = arrFileName[1]
//        }
//        var url = axios.defaults.baseURL+'/beltline/exportYamlFile'
//
//        var xhr = new XMLHttpRequest()
//
//        // 也可以使用POST方式，根据接口
//        xhr.open('POST', url, true)
//        xhr.setRequestHeader('Authorization', 'Bearer ' + store.state.token )
//        // 返回类型blob
//        xhr.responseType = 'blob'
//        // 定义请求完成的处理函数，请求前也可以增加加载框/禁用下载按钮逻辑
//        xhr.onload = function () {
//          // 请求完成
//          if (this.status === 200) {
//            // 返回200
//            var blob = this.response
//            var reader = new FileReader()
//            // 转换为base64，可以直接放入a表情href
//            reader.readAsDataURL(blob)
//            reader.onload = function (e) {
//              console.log(e)
//              // 转换完成，创建一个a标签用于下载
//              var a = document.createElement('a')
//              a.download = fileName + '.yaml'
//              a.href = e.target.result
//              // 修复firefox中无法触发click
//              $('body').append(a)
//              a.click()
//              $(a).remove()
//            }
//          }
//        }
//        // 发送ajax请求
//        xhr.setRequestHeader('Content-Type', 'application/json')
//        xhr.send(JSON.stringify( data ))

      },
      CurrentChange (val) {
        this.CurrentPage = val
        this.productionlist(val)
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
</style>