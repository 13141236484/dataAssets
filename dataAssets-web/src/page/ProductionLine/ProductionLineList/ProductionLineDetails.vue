<template>
    <div class="AssetsDetails">
        <div class="Crumbs">
            <span class="Crumbs-item">生产线</span>
            <i class="el-icon-arrow-right Crumbs-arrowhead"></i>
            <span class="Crumbs-item Crumbs-item-go" @click="goline">生产线列表</span>
            <i class="el-icon-arrow-right Crumbs-arrowhead"></i>
            <span class="Crumbs-level">{{ CrumbsLevelName }} - {{EngingeerFather}}</span>
        </div>
        <div class="Functional">
            <el-input v-model="EngineeringName" placeholder="生产线名称" size="mini" clearable @clear="clearEngeering"></el-input>
            <span class="yellow-button button-20" @click="SearchEngeering">搜索</span>
            <div class="Functional-right">
                <span class="white-button button-15" @click="AddEngineer">添加</span>
                <span class="white-button button-15" @click="DelEngineer">删除</span>
            </div>

        </div>
        <div class="row">
            <div class="col-md-12">
                <el-table
                        :data="EngineeringData"
                        border
                        stripe
                        style="width: 100%"
                        @selection-change="handleSelectionChange">
                    <el-table-column
                            type="selection"
                            width="55">
                    </el-table-column>
                    <el-table-column
                            prop="batch_name"
                            label="工艺名称"
                            width="120">
                    </el-table-column>
                    <el-table-column
                            width="180"
                            label="备注"
                            show-overflow-tooltip>
                        <template slot-scope="scope">
                            {{scope.row.batch_remarks ? scope.row.batch_remarks : '暂无备注'}}
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
                            width="280"
                            label="操作">
                        <template slot-scope="scope">
                            <router-link :to="{path: '/home/RelationProcess/'+scope.row.uuid }">
                                <el-button title="编辑" size="small">查看详情</el-button>
                            </router-link>
                            <router-link :to="{path: '/home/TechnologyContact/' +scope.row.uuid}">
                                <el-button size="mini">查看血缘关系</el-button>
                            </router-link>
                            <el-button title="编辑" size="small" @click="EditEngeering(scope.row.uuid, scope.row.batch_name, scope.row.batch_remarks)">编辑</el-button>
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
        <el-dialog :title="EngingeerTitle" :visible.sync="EngeeringDialog" width="30%">
            <el-form :model="form">
                <el-form-item label="工艺名称" :label-width="formLabelWidth">
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
                <span class="yellow-button button-right" @click="SureEngeeringAdd" v-show="Engaddshow">确定</span>
                <span class="yellow-button button-right" @click="SureEngeeringEdit" v-show="Engeditshow">确定</span>
                <span class="white-button button-15" @click="ResetEngAdd">重填</span>
            </div>
        </el-dialog>
    </div>
</template>
<script>
  import API from 'API'
  export default {
    name: 'Engineering',
    data () {
      return {
        CrumbsLevelName: '工艺列表',
        EngingeerTitle: '添加',
        EngingeerFather: '',
        EngineeringName: '',
        EngineeringData: [],
        multipleSelection: [],
        CurrentPage: 1,
        total: 0,
        Engaddshow: true,
        Engeditshow: false,
        EngeeringDialog: false,
        form: {
          name: '',
          textarea: ''
        },
        formLabelWidth: '80px',
        num: '',
        EngeeringId: ''
      }
    },
    created () {
      this.num = this.$route.params.num
      localStorage.setItem('EngeeringId', this.num)
    },
    mounted () {
      this.engineerlist(this.num, 1)
    },
    methods: {
      // 搜索
      SearchEngeering () {
        this.engineerlist(this.num, 1)
      },
      clearEngeering () {
        this.engineerlist(this.num, 1)
      },
      // 工艺列表
      engineerlist (num, page) {
        if (page === '' || page === 1 ) {
          page = 1
          this.CurrentPage = 1
        }
        API.ProductionEngineeringList({
          beltlineId: num,
          productionEngineeringName: this.EngineeringName,
          page: page
        }).then((res) => {
          if (res.code ===1) {
            this.EngineeringData = res.msg.productionEngineeringData
            this.total = parseInt(res.msg.count[0].count)
            this.EngingeerFather = res.msg.beltlineData.beltline_name
            console.log(res)
          }
        }).catch()
      },
      // 重置
      ResetEngAdd () {
        this.form.name = ''
        this.form.textarea = ''
      },
      // 添加
      AddEngineer () {
        this.form.name = ''
        this.form.textarea = ''
        this.EngingeerTitle = '添加'
        this.Engaddshow = true
        this.Engeditshow = false
        this.EngeeringDialog = true
      },
      // 确定添加
      SureEngeeringAdd () {
        const _this = this
        if (!_this.form.name) {
          _this.$message({
            message: '名称不能为空',
            type: 'warning',
            duration:1000
          })
          return
        }
        API.ProductionEngineeringCreate({
          beltlineId: _this.num,
          productionEngineeringName: _this.form.name,
          productionEngineeringRemark: _this.form.textarea
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
            _this.EngeeringDialog = false
            _this.$message({
              message: res.msg,
              type: 'success',
              duration:1000
            })

            _this.engineerlist(_this.num, 1)
          }
        }).catch()
      },
      // 修改
      EditEngeering (uuid, name, remarks) {
        this.EngeeringId = uuid
        this.form.name = name
        this.form.textarea = remarks
        this.EngingeerTitle = '修改'
        this.Engaddshow = false
        this.Engeditshow = true
        this.EngeeringDialog = true
      },
      // 确定修改
      SureEngeeringEdit () {
        const _this = this
        if (!_this.form.name) {
          _this.$message({
            message: '名称不能为空',
            type: 'warning',
            duration:1000
          })
          return
        }
        API.ProductionEngineeringUpdate({
          uuid: _this.EngeeringId,
          beltlineId: _this.num,
          productionEngineeringName: _this.form.name,
          productionEngineeringRemark: _this.form.textarea
        }).then((res) => {
          if (res.code === 0) {
            _this.$message({
              message: res.msg,
              type: 'error',
              duration:1000
            })
          }
          if (res.code ===1 ) {
            _this.EngeeringDialog = false
            _this.$message({
              message: res.msg,
              type: 'success',
              duration:1000
            })
            _this.engineerlist(_this.num, _this.CurrentPage)
          }
        }).catch()
      },
      DelEngineer () {
        const _this = this
        let ids=[]
        _this.multipleSelection.map((item)=> {
          ids.push(item.uuid)
        })
        if(!ids.length){
          _this.$message({
            message: '请选择需要删除的工艺',
            type: 'warning',
            duration:1000
          })
          return
        }
        _this.$confirm('删除此工艺, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          showClose: false,
          type: 'warning'
        }).then(() => {
          API.ProductionEngineeringDelete({
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
              _this.engineerlist(_this.num, _this.CurrentPage)
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
        this.multipleSelection = val

      },
      CurrentChange (val) {
        this.CurrentPage = val
        this.engineerlist(this.num, val)
      },
      goline () {
        this.$router.push('/home/ProductionLineList')
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