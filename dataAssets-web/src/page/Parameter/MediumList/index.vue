<template>
    <div class="Context">
        <div class="Crumbs">
            <span class="Crumbs-item">参数管理</span>
            <i class="el-icon-arrow-right Crumbs-arrowhead"></i>
            <span class="Crumbs-level">介质列表</span>
        </div>
        <div class="Functional">
            <el-input v-model="MediumName" placeholder="介质名称" size="mini" clearable @clear="clearMedium"></el-input>
            <span class="yellow-button button-20" @click="SearchMedium">搜索</span>
            <div class="Functional-right">
                <span class="white-button button-15" @click="AddMedium">添加</span>
                <span class="white-button button-15" @click="DelMedium">删除</span>
            </div>

        </div>
        <div class="row">
            <div class="col-md-12">
                <el-table
                        :data="MediumData"
                        border
                        stripe
                        style="width: 100%"
                        @selection-change="handleSelectionChange">
                    <el-table-column
                            type="selection"
                            width="55">
                    </el-table-column>
                    <el-table-column
                            prop="medium_name"
                            label="介质名称"
                            show-overflow-tooltip>
                    </el-table-column>
                    <el-table-column
                            label="介质备注"
                            width="180"
                            show-overflow-tooltip>
                        <template slot-scope="scope">
                            {{scope.row.medium_remarks ? scope.row.medium_remarks : '暂无备注'}}
                        </template>
                    </el-table-column>
                    <el-table-column
                            prop="username"
                            label="创建人">
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
                            <router-link :to="{path: '/home/PathList/'+scope.row.uuid}">
                                <el-button title="查看详情" size="mini">查看详情</el-button>
                            </router-link>
                            <el-button title="编辑" size="mini"
                                       @click="editMedium(scope.row.uuid, scope.row.medium_name, scope.row.region_id, scope.row.medium_remarks, scope.row.medium_type_name, scope.row.medium_example)">
                                编辑
                            </el-button>
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
        <el-dialog :title="MediumTitle" :visible.sync="MediumDialog" width="40%">
            <el-form :model="form">
                <el-form-item label="介质名称" :label-width="formLabelWidth">
                    <el-input v-model="form.name" auto-complete="off" placeholder="请输入名称" size="mini" clearable></el-input>
                </el-form-item>
                <el-form-item label="所属区域" :label-width="formLabelWidth">
                    <el-select v-model="form.regional" placeholder="区域" size="mini" clearable>
                        <el-option
                                v-for="item in regionalData"
                                :key="item.uuid"
                                :label="item.regional_name"
                                :value="item.uuid">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="所属介质" :label-width="formLabelWidth">
                    <el-radio-group v-model="form.Mediumradio">
                        <el-radio label="Hbase">Hbase</el-radio>
                        <el-radio label="Hdfs">Hdfs</el-radio>
                        <el-radio label="Mysql">Mysql</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="URL" :label-width="formLabelWidth" v-show="form.Mediumradio === 'Hbase'">
                    <el-input v-model="form.Hbase.URL" size="mini" clearable></el-input>
                </el-form-item>
                <el-form-item label="zookeeper" :label-width="formLabelWidth" v-show="form.Mediumradio === 'Hbase'">
                    <el-input v-model="form.Hbase.zookeeper" size="mini" clearable></el-input>
                </el-form-item>
                <el-form-item label="clientPort" :label-width="formLabelWidth" v-show="form.Mediumradio === 'Hbase'">
                    <el-input v-model="form.Hbase.clientPort" size="mini" clearable></el-input>
                </el-form-item>
                <el-form-item label="root" :label-width="formLabelWidth" v-show="form.Mediumradio === 'Hdfs'">
                    <el-input v-model="form.Hdfs.root" size="mini" clearable></el-input>
                </el-form-item>
                <el-form-item label="username" :label-width="formLabelWidth" v-show="form.Mediumradio === 'Hdfs'">
                    <el-input v-model="form.Hdfs.username" size="mini" clearable></el-input>
                </el-form-item>
                <el-form-item label="group" :label-width="formLabelWidth" v-show="form.Mediumradio === 'Hdfs'">
                    <el-input v-model="form.Hdfs.group" size="mini" clearable></el-input>
                </el-form-item>
                <el-form-item label="url" :label-width="formLabelWidth" v-show="form.Mediumradio === 'Mysql'">
                    <el-input v-model="form.Mysql.url" size="mini" clearable></el-input>
                </el-form-item>
                <el-form-item label="user" :label-width="formLabelWidth" v-show="form.Mediumradio === 'Mysql'">
                    <el-input v-model="form.Mysql.user" size="mini" clearable></el-input>
                </el-form-item>
                <el-form-item label="passwd" :label-width="formLabelWidth" v-show="form.Mediumradio === 'Mysql'">
                    <el-input v-model="form.Mysql.passwd" size="mini" clearable></el-input>
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
                <span class="yellow-button button-right" @click="SureMediumAdd" v-show="MaddShow">确定</span>
                <span class="yellow-button button-right" @click="SureMediumEdit" v-show="MeditShow">确定</span>
                <span class="white-button button-15" @click="EmptyForm">重填</span>
            </div>
        </el-dialog>
    </div>
</template>
<script>
  import API from 'API'
  export default {
    name: 'DomainList',
    data () {
      return {
        MediumName: '',
        MediumData: [],
        MediumTitle: '添加',
        multipleSelection: [],
        CurrentPage: 1,
        total: 0,
        MediumDialog: false,
        MaddShow: true,
        MeditShow: false,
        form: {
          name: '',
          regional: '',
          Mediumradio: '',
          Hbase: {
            URL: '',
            zookeeper: '',
            clientPort: '',
          },
          Hdfs: {
            root: '',
            username: '',
            group: ''
          },
          Mysql: {
            url: '',
            user: '',
            passwd: ''
          },
          textarea: ''
        },
        regionalData: [],
        formLabelWidth: '80px',
        MediumId: ''
      }
    },
    methods: {
      // 域数据
      regionAll () {
        API.regionAllList({}).then((res) => {
          if (res.code ===1 ) {
            this.regionalData = res.msg.regionalData
          }
        }).catch()
      },
      // 介质列表
      Mediumlist (page) {
        if (page === '' || page === 1 ) {
          page = 1
          this.CurrentPage = 1
        }
        API.MediumList({
          mediumName: this.MediumName,
          page: page
        }).then((res) => {
          if (res.code ===1 ) {
            this.MediumData = res.msg.mediumData
            this.total = parseInt(res.msg.count[0].count)
          }
        }).catch()
      },
      // 搜索
      SearchMedium () {
        this.Mediumlist(1)
      },
      clearMedium () {
        this.Mediumlist()
      },
      // 添加
      AddMedium () {
        this.MediumDialog = true
        this.MediumTitle = '添加'
        this.EmptyForm()
        this.MaddShow = true
        this.MeditShow = false
      },
      // 确定添加
      SureMediumAdd () {
        const _this = this
        if (!_this.form.name) {
          _this.$message({
            message: '名称不能为空',
            type: 'warning',
            duration:1000
          })
          return
        }
        if (!_this.form.regional) {
          _this.$message({
            message: '区域不能为空',
            type: 'warning',
            duration:1000
          })
          return
        }
        if (!_this.form.Mediumradio) {
          _this.$message({
            message: '请选择介质类型',
            type: 'warning',
            duration:1000
          })
          return
        }
        var mediumExample
        if (_this.form.Mediumradio === 'Hbase') {
          if (!_this.form.Hbase.URL || !_this.form.Hbase.zookeeper || !_this.form.Hbase.clientPort) {
            _this.$message({
              message: '内容不能为空',
              type: 'warning',
              duration:1000
            })
            return
          }else {
            mediumExample = _this.form.Hbase
          }

        }
        if (_this.form.Mediumradio === 'Hdfs') {
          if (!_this.form.Hdfs.root || !_this.form.Hdfs.username || !_this.form.Hdfs.group) {
            _this.$message({
              message: '内容不能为空',
              type: 'warning',
              duration:1000
            })
            return
          }else {
            mediumExample = _this.form.Hdfs
          }
        }
        if (_this.form.Mediumradio === 'Mysql') {
          if (!_this.form.Mysql.url || !_this.form.Mysql.user || !_this.form.Mysql.passwd) {
            _this.$message({
              message: '内容不能为空',
              type: 'warning',
              duration:1000
            })
            return
          }else {
            mediumExample = _this.form.Mysql
          }
        }
        API.MediumCreate({
          mediumName: _this.form.name,
          regionId: _this.form.regional,
          mediumTypeName: _this.form.Mediumradio,
          mediumExample: mediumExample,
          mediumRemark: _this.form.textarea
        }).then((res) => {
          if (res.code === 0) {
            _this.$message({
              message: res.msg,
              type: 'warning',
              duration:1000
            })
            return
          }
          if (res.code ===1 ) {
            _this.MediumDialog = false
            _this.EmptyForm()
            _this.$message({
              message: res.msg,
              type: 'success',
              duration:1000
            })
            _this.Mediumlist()
          }
        }).catch()
      },
      // 编辑
      editMedium (uuid, name, region_id, medium_remarks, medium_type_name, medium_example) {
        this.EmptyForm()
        this.MediumTitle = '修改'
        this.MediumDialog = true
        this.MaddShow = false
        this.MeditShow = true
        this.MediumId = uuid
        this.form.name = name
        this.form.regional = region_id
        this.form.textarea = medium_remarks
        this.form.Mediumradio = medium_type_name
        var mediumExample = JSON.parse(medium_example)
        if (this.form.Mediumradio === 'Hbase') {
          this.form.Hbase.URL = mediumExample.URL
          this.form.Hbase.zookeeper = mediumExample.zookeeper
          this.form.Hbase.clientPort = mediumExample.clientPort
        }
        if (this.form.Mediumradio === 'Hdfs') {
          this.form.Hdfs.root = mediumExample.root
          this.form.Hdfs.username = mediumExample.username
          this.form.Hdfs.group = mediumExample.group
        }
        if (this.form.Mediumradio === 'Mysql') {
          this.form.Mysql.url = mediumExample.url
          this.form.Mysql.user = mediumExample.user
          this.form.Mysql.passwd = mediumExample.passwd
        }
      },
      // 确认编辑
      SureMediumEdit () {
        const _this = this
        if (!_this.form.name) {
          _this.$message({
            message: '名称不能为空',
            type: 'warning',
            duration:1000
          })
          return
        }
        if (!_this.form.regional) {
          _this.$message({
            message: '区域不能为空',
            type: 'warning',
            duration:1000
          })
          return
        }
        if (!_this.form.Mediumradio) {
          _this.$message({
            message: '请选择介质类型',
            type: 'warning',
            duration:1000
          })
          return
        }
        var mediumExample
        if (_this.form.Mediumradio === 'Hbase') {
          if (!_this.form.Hbase.URL || !_this.form.Hbase.zookeeper || !_this.form.Hbase.clientPort) {
            _this.$message({
              message: '内容不能为空',
              type: 'warning',
              duration:1000
            })
            return
          }else {
            mediumExample = _this.form.Hbase
          }

        }
        if (_this.form.Mediumradio === 'Hdfs') {
          if (!_this.form.Hdfs.root || !_this.form.Hdfs.username || !_this.form.Hdfs.group) {
            _this.$message({
              message: '内容不能为空',
              type: 'warning',
              duration:1000
            })
            return
          }else {
            mediumExample = _this.form.Hdfs
          }
        }
        if (_this.form.Mediumradio === 'Mysql') {
          if (!_this.form.Mysql.url || !_this.form.Mysql.user || !_this.form.Mysql.passwd) {
            _this.$message({
              message: '内容不能为空',
              type: 'warning',
              duration:1000
            })
            return
          }else {
            mediumExample = _this.form.Mysql
          }
        }
        API.MediumUpdate({
          uuid: _this.MediumId,
          mediumName: _this.form.name,
          regionId: _this.form.regional,
          mediumTypeName: _this.form.Mediumradio,
          mediumExample: mediumExample,
          mediumRemark: _this.form.textarea
        }).then((res) => {
          if (res.code === 0) {
            _this.$message({
              message: res.msg,
              type: 'warning',
              duration:1000
            })
            return
          }
          if (res.code ===1 ) {
            _this.MediumDialog = false
            _this.EmptyForm()
            _this.$message({
              message: res.msg,
              type: 'success',
              duration:1000
            })
            _this.Mediumlist(_this.CurrentPage)
          }
        }).catch()
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      CurrentChange (val) {
        this.CurrentPage = val
        this.Mediumlist(val)
      },
      // 删除介质
      DelMedium () {
        const _this = this
        let ids=[]
        _this.multipleSelection.map((item)=> {
          ids.push(item.uuid)
        })
        if(!ids.length){
          _this.$message({
            message: '请选择需要删除的介质',
            type: 'warning',
            duration:1000
          })
          return
        }
        _this.$confirm('删除此介质, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          showClose: false,
          type: 'warning'
        }).then(() => {
          API.MediumDelete({
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
              _this.Mediumlist(_this.CurrentPage)
            }
          }).catch()


        }).catch(() => {
          _this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
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
      },
      // 清空表单
      EmptyForm () {
        this.form.name =''
        this.form.Mediumradio= ''
        this.form.regional = ''
        this.form.Hbase = {}
        this.form.Hdfs = {}
        this.form.Mysql = {}
        this.form.textarea = ''
      }
    },
    mounted () {
      this.Mediumlist()
      this.regionAll()
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
    .Functional-1 {
        margin-bottom: 20px;
        .margin-right {
            margin-right: 20px;
        }
    }
</style>