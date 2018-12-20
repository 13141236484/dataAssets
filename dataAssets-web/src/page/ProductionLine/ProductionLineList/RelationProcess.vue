<template>
    <div class="Context RelationProcess">
        <div class="Crumbs">
            <span class="Crumbs-item">生产线</span>
            <i class="el-icon-arrow-right Crumbs-arrowhead"></i>
            <span class="Crumbs-item Crumbs-item-go" @click="goLine">生产线列表</span>
            <i class="el-icon-arrow-right Crumbs-arrowhead"></i>
            <span class="Crumbs-item Crumbs-item-go" @click="goEngineering">工艺列表</span>
            <i class="el-icon-arrow-right Crumbs-arrowhead"></i>
            <span class="Crumbs-level">过程列表 - {{ProcessFather}}</span>
        </div>
        <div class="Functional">
            <el-input v-model="ProcessName" placeholder="生产过程名称" size="mini" clearable @clear="clearProcess"></el-input>
            <span class="yellow-button button-20" @click="SearchProcess">搜索</span>
            <div class="Functional-right">
                <span class="white-button button-15" @click="AddProcessList">添加</span>
                <span class="white-button button-15" @click="DelProcess">删除</span>
            </div>

        </div>
        <div class="row">
            <div class="col-md-12">
                <el-table
                        :data="ProcessData"
                        border
                        stripe
                        style="width: 100%"
                        @selection-change="handleSelectionChange">
                    <el-table-column
                            type="selection"
                            width="55">
                    </el-table-column>
                    <el-table-column
                            prop="process_name"
                            label="过程名称"
                            width="120">
                    </el-table-column>
                    <el-table-column
                            label="过程类型"
                            width="120">
                        <template slot-scope="scope">
                            <el-button type="text" size="mini" v-show="scope.row.start_state === 1">起始过程</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column
                            width="180"
                            label="备注"
                            show-overflow-tooltip>
                        <template slot-scope="scope">
                            {{scope.row.process_remarks ? scope.row.process_remarks : '暂无备注'}}
                        </template>
                    </el-table-column>
                    <el-table-column
                            prop="username"
                            label="操作者">
                    </el-table-column>
                    <el-table-column
                            label="操作时间"
                            show-overflow-tooltip>
                        <template slot-scope="scope">
                            {{formatDate(scope.row.creation_time * 1000, 'yyyy-MM-dd hh:mm')}}
                        </template>
                    </el-table-column>
                    <el-table-column
                            width="280"
                            label="操作">
                        <template slot-scope="scope">
                            <el-button
                                    title="编辑"
                                    size="mini"
                                    @click="EditProcess(scope.row.uuid, scope.row.process_name, scope.row.start_state, scope.row.process_remarks)">
                                编辑
                            </el-button>
                            <el-button
                                    v-show="scope.row.start_state != 1"
                                    title="依赖"
                                    size="mini"
                                    @click="EditRelyOn(scope.row.uuid, scope.row.process_name)">
                                依赖
                            </el-button>
                            <router-link :to="{ path: '/home/AssociatedDataDssets/'+ scope.row.uuid}">
                                <el-button title="编辑" size="mini">关联数据资产</el-button>
                            </router-link>
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
        <!--添加或者修改-->
        <el-dialog :title="ProcessTitle" :visible.sync="ProcessDialog" width="30%">
            <el-form :model="form">
                <el-form-item label="生产过程名称" :label-width="formLabelWidth">
                    <el-input v-model="form.name" auto-complete="off" placeholder="请输入名称" size="mini" clearable></el-input>
                </el-form-item>
                <el-form-item label="是否起始过程">
                    <el-switch v-model="form.Start"></el-switch>
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
                <span class="yellow-button button-right" @click="SureProcessAdd" v-show="ProAddShow">确定</span>
                <span class="yellow-button button-right" @click="SureProcessEdit" v-show="ProEditShow">确定</span>
                <span class="white-button button-15" @click="ResetAdd">重填</span>
            </div>
        </el-dialog>
        <!--依赖-->
        <el-dialog :title="'过程依赖'+ ' - ' +RelyprocessName" :visible.sync="RelyOnDialog" width="35%">
            <el-form :model="RelyOnForm">
                <el-form-item label="依赖过程" :label-width="formLabelWidth">
                    <el-select v-model="RelyOnForm.RelyOn" placeholder="请选择" @change="RelyOnhanle" size="mini">
                        <el-option
                                v-for="item in RelyProcessData"
                                :key="item.uuid"
                                :label="item.process_name"
                                :value="item.uuid">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="依赖者:" :label-width="formLabelWidth">
                    <el-tag
                            size="mini"
                            v-for="item in RelyProcessTag"
                            closable
                            @close="RelyProcessTagClose(item)"
                            :key="item.uuid">
                        {{item.process_name}}
                    </el-tag>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <span class="yellow-button button-right" @click="SureProcessRelyOn">确定</span>
                <span class="white-button button-15" @click="ResetAdd">重填</span>
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
        ProcessName: '',
        ProcessFather: '',
        ProcessData: [],
        multipleSelection: [],
        CurrentPage: 1,
        total: 0,
        ProcessDialog: false,
        RelyOnDialog: false,
        ProAddShow: true,
        ProEditShow: false,
        ProcessTitle: '添加',
        form: {
          name: '',
          Start: false,
          textarea: ''
        },
        RelyOnForm: {
          RelyOn: ''
        },
        RelyProcessData: [],
        // 移入依赖者的数组
        RelyProcessTag: [],
        RelyprocessName: '',
        formLabelWidth: '100px',
        num:'',
        ProcessId: ''
      }
    },
    created () {
      this.num = this.$route.params.num
      localStorage.setItem('ProcessId', this.num)
    },
    mounted () {
      this.processlist(this.num, 1)
    },
    methods: {
      // 搜索
      SearchProcess () {
        this.processlist(this.num, 1)
      },
      clearProcess () {
        this.processlist(this.num, 1)
      },
      // 过程列表
      processlist (num, page) {
        if (page === '' || page === 1 ) {
          page = 1
          this.CurrentPage = 1
        }
        API.ProductionProcessList({
          batchId: num,
          productionProcessName: this.ProcessName,
          page: page
        }).then((res) => {
          if (res.code === 1 ) {
            this.ProcessData = res.msg.productionProcessData
            this.total = parseInt(res.msg.count[0].count)
            this.ProcessFather = res.msg.engineerData.batch_name
            console.log(res)
          }
        }).catch()
      },
      // 过程依赖关系列表
      relyOnProcesslist (uuid) {
        API.RelyOnProcessList({
          technologyId: this.num,
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
          if (res.code === 1) {
            this.RelyProcessData = res.msg.processData
            this.RelyProcessTag = res.msg.processDependenceData
            this.RelyOnDialog = true
          }
        }).catch()
      },
      // 添加
      AddProcessList () {
        this.ProcessTitle = '添加'
        this.form.name= ''
        this.form.Start = false
        this.form.textarea = ''
        this.ProAddShow = true
        this.ProEditShow = false
        this.ProcessDialog = true
      },
      // 确认添加
      SureProcessAdd () {
        const _this = this
        if (!_this.form.name) {
          _this.$message({
            message: '名称不能为空',
            type: 'warning',
            duration:1000
          })
          return
        }
        var start
        if (_this.form.Start === true) {
          start = 1
        }
        if (_this.form.Start === false) {
          start = 2
        }
        API.ProductionProcessCreate({
          batchId: _this.num,
          startState: start,
          productionProcessName: _this.form.name,
          productionProcessRemark: _this.form.textarea
        }).then((res) => {
          if (res.code === 0 ) {
            _this.$message({
              message: res.msg,
              type: 'error',
              duration:1000
            })
            return
          }
          if (res.code ===1 ) {
            _this.ProcessDialog = false
            _this.$message({
              message: res.msg,
              type: 'success',
              duration:1000
            })
            _this.processlist(_this.num, 1)
          }
        }).catch()
      },
      // 修改
      EditProcess (uuid, process_name, start_state, process_remarks) {
        this.ProcessTitle = '修改'
        this.ProcessId = uuid
        this.form.name= process_name
        if (start_state === 1 ) {
          this.form.Start = true
        }
        if (start_state === 2) {
          this.form.Start = false
        }
        this.form.textarea = process_remarks
        this.ProAddShow = false
        this.ProEditShow = true
        this.ProcessDialog = true
      },
      // 确认修改
      SureProcessEdit () {
        const _this = this
        if (!_this.form.name) {
          _this.$message({
            message: '名称不能为空',
            type: 'warning',
            duration:1000
          })
          return
        }
        var start
        if (_this.form.Start === true) {
          start = 1
        }
        if (_this.form.Start === false) {
          start = 2
        }
        API.ProductionProcessUpdate({
          uuid: _this.ProcessId,
          batchId: _this.num,
          startState: start,
          productionProcessName: _this.form.name,
          productionProcessRemark: _this.form.textarea
        }).then((res) => {
          if (res.code === 0 ) {
            _this.$message({
              message: res.msg,
              type: 'error',
              duration:1000
            })
            return
          }
          if (res.code ===1 ) {
            _this.ProcessDialog = false
            _this.$message({
              message: res.msg,
              type: 'success',
              duration:1000
            })
            _this.processlist(_this.num, _this.CurrentPage)
          }
        }).catch()
      },
      // 依赖
      EditRelyOn (uuid, process_name) {
        this.RelyOnForm.RelyOn = ''
        this.ProcessId = uuid
        this.RelyprocessName = process_name
        this.relyOnProcesslist(uuid)

      },
      // 删除已经依赖
      RelyProcessTagClose (item) {
        console.log(item)
        if (item.state === 1) {
          this.RelyProcessTag.splice(this.RelyProcessTag.indexOf(item), 1)
        }else {
          API.ProcessDependenceDelete({
            sonProcessId: this.ProcessId,
            parProcessId: item.uuid,
          }).then((res) => {
            if (res.code === 0 ) {
              this.$message({
                message: res.msg,
                type: 'error',
                duration:1000
              })
              return
            }
            if (res.code ===1 ) {
              this.$message({
                message: res.msg,
                type: 'success',
                duration:1000
              })
              this.RelyProcessTag.splice(this.RelyProcessTag.indexOf(item), 1)
            }
          }).catch()
        }
      },
      // 依赖值变化判断
      RelyOnhanle () {
        if (this.RelyProcessTag.length > 0) {
          for (var j = 0;j<this.RelyProcessTag.length;j++) {
            if (this.RelyOnForm.RelyOn === this.RelyProcessTag[j].uuid) {
              this.$message({
                message: '此过程已经被选择',
                type: 'warning',
                duration:1000
              })
              this.RelyOnForm.RelyOn = ''
              return
            }
          }
        }

        API.DependenceExist({
          sonProcessId: this.ProcessId,
          parProcessId: this.RelyOnForm.RelyOn
        }).then((res) => {
          if (res.code === 0 ) {
            this.$message({
              message: '两者不能互相依赖',
              type: 'warning',
              duration:1000
            })
            this.RelyOnForm.RelyOn = ''
            return
          }
          if (res.code ===1 ) {
            for (var i = 0; i< this.RelyProcessData.length;i++) {
              if (this.RelyOnForm.RelyOn === this.RelyProcessData[i].uuid) {
                var relyTag = {
                  uuid: this.RelyProcessData[i].uuid,
                  process_name: this.RelyProcessData[i].process_name,
                  state: 1
                }
                this.RelyProcessTag.push(relyTag)
              }
            }
            this.RelyOnForm.RelyOn = ''
          }
        }).catch()
      },
      // 确定依赖
      SureProcessRelyOn () {
        if (this.RelyProcessTag.length === 0) {
          this.$message({
            message: '请先对当前过程进行依赖',
            type: 'warning',
            duration:1000
          })
          return
        }
        var newTagArr = []
        if (this.RelyProcessTag.length > 0) {
          for (var k = 0; k < this.RelyProcessTag.length;k++) {
            newTagArr.push(this.RelyProcessTag[k].uuid)
          }
          API.ProcessDependenceCreate({
            sonProcessId: this.ProcessId,
            parProcessIdArr: newTagArr
          }).then((res) => {
            console.log(res)
            if (res.code === 0 ) {
              this.$message({
                message: res.msg,
                type: 'error',
                duration:1000
              })
              return
            }
            if (res.code === 1 ) {
              this.RelyOnDialog = false
              this.$message({
                message: res.msg,
                type: 'success',
                duration:1000
              })
            }
          }).catch()
        }
      },
      //重置
      ResetAdd () {
        this.form.name = ''
        this.form.textarea = ''
        this.RelyOnForm.RelyOn = ''
        this.RelyProcessTag = []
      },
      DelProcess () {
        const _this = this
        let ids=[]
        _this.multipleSelection.map((item)=> {
          ids.push(item.uuid)
        })
        if(!ids.length){
          _this.$message({
            message: '请选择需要删除的过程',
            type: 'warning',
            duration:1000
          })
          return
        }
        _this.$confirm('删除此过程, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          showClose: false,
          type: 'warning'
        }).then(() => {
          API.ProductionProcessDelete({
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
              _this.processlist(_this.num, _this.CurrentPage)
            }
          }).catch()

        }).catch(() => {
          _this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      CurrentChange (val) {
        this.CurrentPage = val
        this.processlist(this.num, val)
      },
      goLine () {
        this.$router.push('/home/ProductionLineList')
      },
      goEngineering () {
        var EngeeringId = localStorage.getItem('EngeeringId')
        this.$router.push('/home/ProductionLineDetails/'+EngeeringId)
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