<template>
    <div class="Context">
        <div class="Crumbs">
            <span class="Crumbs-item">资产管理</span>
            <i class="el-icon-arrow-right Crumbs-arrowhead"></i>
            <span class="Crumbs-level">资产列表</span>
        </div>
        <div class="Functional">
            <el-select v-model="Search.regional" placeholder="所属域" size="mini" clearable @clear="clearAssRegional">
                <el-option
                        v-for="item in regionalData"
                        :key="item.uuid"
                        :label="item.regional_name"
                        :value="item.uuid">
                </el-option>
            </el-select>
            <span class="input-margin"></span>
            <el-select v-model="Search.medium" placeholder="存储介质" size="mini" clearable @clear="clearAssMedium">
                <el-option
                        v-for="item in mediumData"
                        :key="item.uuid"
                        :label="item.medium_name"
                        :value="item.uuid">
                </el-option>
            </el-select>
            <span class="yellow-button button-20" @click="SearchAssets">搜索</span>
            <div class="Functional-right">
                <span class="white-button button-15" @click="AddAssets">添加</span>
                <span class="white-button button-15" @click="DelAssets">删除</span>
            </div>

        </div>
        <div class="Functional-1">
            <el-date-picker
                    type="date"
                    format="yyyy/MM/dd"
                    value-format="timestamp"
                    placeholder="开始时间"
                    v-model="Search.AssetsDate1"
                    style="width: 160px;"
                    @clear="clearAssdate1"
                    size="mini">
            </el-date-picker>
            <span class="input-margin">-</span>
            <el-date-picker
                    type="date"
                    format="yyyy/MM/dd"
                    value-format="timestamp"
                    placeholder="结束时间"
                    v-model="Search.AssetsDate2"
                    style="width: 160px;"
                    @clear="clearAssdate2"
                    size="mini">
            </el-date-picker>
            <span class="input-margin"></span>
            <el-input v-model="Search.AssetsName" placeholder="数据资产名称" size="mini" clearable @clear="clearAssetsname"></el-input>
            <div class="Functional-right">
                <span class="margin-right">上下架状态</span>
                <el-select v-model="Search.State" placeholder="请选择" size="mini" clearable @clear="clearAssshelf">
                    <el-option
                            v-for="item in ShelfState"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id">
                    </el-option>
                </el-select>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <el-table
                        :data="AssetsData"
                        border
                        stripe
                        style="width: 100%"
                        @selection-change="handleSelectionChange">
                    <el-table-column
                            type="selection"
                            width="55">
                    </el-table-column>
                    <el-table-column
                            label="数据资产名称">
                        <template slot-scope="scope">
                            {{scope.row.asset_name}}
                            <i class="pin" style="" title="有附件" v-show="scope.row.enclosure_path"></i>
                            <i class="" style="width:15px;height:15px;display: inline-block;" v-show="!scope.row.enclosure_path"></i>
                        </template>
                    </el-table-column>
                    <el-table-column
                            width="140"
                            show-overflow-tooltip
                            label="备注">
                        <template slot-scope="scope">
                            {{scope.row.asset_remarks ? scope.row.asset_remarks : '暂无备注'}}
                        </template>
                    </el-table-column>
                    <el-table-column
                            prop="username"
                            label="存储人"
                            show-overflow-tooltip>
                    </el-table-column>
                    <el-table-column
                            label="周期开始时间">
                        <template slot-scope="scope">
                            {{ scope.row.is_cycle ===1 ? formatDate(Number(scope.row.start_cycle_time), 'yyyy/MM/dd hh:mm')  : '无'}}
                        </template>
                    </el-table-column>
                    <el-table-column
                            label="周期结束时间">
                        <template slot-scope="scope">
                            {{ scope.row.is_cycle ===1 ?  formatDate(Number(scope.row.end_cycle_time), 'yyyy/MM/dd hh:mm') : '无'}}
                        </template>
                    </el-table-column>
                    <el-table-column
                            label="有无结构">
                        <template slot-scope="scope">
                            {{ scope.row.ifstructure ==='yes' ? '有' : '无'}}
                        </template>
                    </el-table-column>
                    <el-table-column
                            width="160"
                            label="上下架管理">
                        <template slot-scope="scope">
                            <el-button title="上架" size="mini" @click="OnShelf(1, scope.row.uuid, scope.row.is_cycle)" v-show="scope.row.sheif_status === 0 || scope.row.sheif_status === 2">上架</el-button>
                            <el-button type="text" size="mini" v-show="scope.row.sheif_status === 1">已上架</el-button>
                            <el-button title="下架" size="mini" @click="InShelf(2, scope.row.uuid, scope.row.is_cycle)" v-show="scope.row.sheif_status === 0 || scope.row.sheif_status === 1">下架</el-button>
                            <el-button type="text" size="mini" v-show="scope.row.sheif_status === 2">已下架</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column
                            width="180"
                            label="操作">
                        <template slot-scope="scope">
                            <el-button
                                    title="编辑"
                                    size="mini"
                                    @click="EditAssets(scope.row.uuid, scope.row.asset_name, scope.row.region_id, scope.row.medium_id, scope.row.path_id, scope.row.is_cycle, scope.row.start_cycle_time, scope.row.end_cycle_time, scope.row.ifstructure, scope.row.structure_type_name,scope.row.asset_remarks, scope.row.enclosure_path)">
                                编辑
                            </el-button>
                            <router-link :to="{ path: '/home/DetailListDetails/' + scope.row.uuid }">
                                <el-button size="mini">查看详情</el-button>
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
        <el-dialog :title="AssetsTitle" :visible.sync="AssetsDialog" width="42%">
            <el-form :model="form">
                <el-form-item label="资产名称" :label-width="formLabelWidth">
                    <el-input v-model="form.name" auto-complete="off" placeholder="请输入名称" size="mini" clearable></el-input>
                </el-form-item>
                <el-form-item label="所属区域" :label-width="formLabelWidth">
                    <el-select v-model="form.regional" placeholder="区域" size="mini" filterable clearable @change="regionalChange" @clear="clearFromregional">
                        <el-option
                                v-for="item in regionalData"
                                :key="item.uuid"
                                :label="item.regional_name"
                                :value="item.uuid">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="存储路径" :label-width="formLabelWidth">
                    <el-select v-model="form.medium" placeholder="介质" size="mini" filterable clearable @change="mediumChange" @clear="clearFromMedium">
                        <el-option
                                v-for="item in mediumData"
                                :key="item.uuid"
                                :label="item.medium_name"
                                :value="item.uuid">
                        </el-option>
                    </el-select>
                    <el-select v-model="form.path" placeholder="路径" size="mini" clearable filterable>
                        <el-option
                                v-for="item in PathData"
                                :key="item.uuid"
                                :label="item.detailed_path"
                                :value="item.uuid">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="时间周期" :label-width="formLabelWidth">
                    <el-radio-group v-model="form.Dateradio">
                        <el-radio :label="1">有</el-radio>
                        <el-radio :label="2">无</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="" :label-width="formLabelWidth" v-show="form.Dateradio === 1">
                    <el-date-picker type="datetime" format="yyyy/MM/dd HH:mm:ss" value-format="timestamp" placeholder="开始时间" v-model="form.AssetsDate1" style="width: 160px;" size="mini"></el-date-picker>
                    <span>-</span>
                    <el-date-picker type="datetime" format="yyyy/MM/dd HH:mm:ss" value-format="timestamp" placeholder="结束时间" v-model="form.AssetsDate2" style="width: 160px;" size="mini"></el-date-picker>
                </el-form-item>
                <el-form-item label="是否有结构" :label-width="formLabelWidth">
                    <el-radio-group v-model="form.structure">
                        <el-radio label="yes">有</el-radio>
                        <el-radio label="no">无</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="结构分类名称" :label-width="formLabelWidth" v-show="form.structure === 'yes'">
                    <el-select v-model="form.structureName" placeholder="结构分类名称" size="mini" clearable>
                        <el-option
                                v-for="item in structureData"
                                :key="item.id"
                                :label="item.value"
                                :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="上传TxT文本" :label-width="formLabelWidth" v-show="form.structureName === 'avro-javabean'">
                    <el-button @click="AssetsinnerDialog = true" size="mini">导入</el-button>
                    <span class="el-form-tip">
                        {{form.ImportState}}
                    </span>
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
            <el-dialog
                    width="32%"
                    title="数据资产信息导入"
                    :visible.sync="AssetsinnerDialog"
                    append-to-body>
                <el-form>
                    <el-form-item label="资产信息" :label-width="formLabelWidth">
                        <el-upload
                                class="upload-demo"
                                :action="UploadFile"
                                ref="upload"
                                :on-preview="handlePreview"
                                :on-remove="handleRemove"
                                :before-remove="beforeRemove"
                                :before-upload="beforeAvatarUpload"
                                :onError="uploadError"
                                :onSuccess="uploadSuccess"
                                multiple
                                :limit="1"
                                :headers="headers"
                                :on-exceed="handleExceed"
                                :file-list="fileList">
                            <el-button size="mini">导入文件</el-button>
                            <div slot="tip" class="el-upload__tip">只能上传.avsc文件</div>
                        </el-upload>
                    </el-form-item>
                    <el-form-item label="下载模板" :label-width="formLabelWidth">
                        <el-button size="mini" @click="DownloadText">下载</el-button>
                        <div class="el-form-tip">
                            <p>提示:</p>
                            <p>1、为方便批量导入，请先下载导入模版文件；</p>
                            <p>2、导入文件中某行不能为空；</p>
                            <p>3、若某行未填写，则视为从改行起后面的行不执行导入；</p>
                            <p>4、请根据示意顺序进行文件填写并导入。</p>
                        </div>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <div slot="footer" class="dialog-footer">
                <span class="yellow-button button-right" @click="SureAssetsAdd" v-show="Addshow">确定</span>
                <span class="yellow-button button-right" @click="SureAssetsEdit" v-show="Editshow">确定</span>
                <span class="white-button button-15" @click="EmptyForm">重填</span>
            </div>
        </el-dialog>
    </div>
</template>
<script>
  import API from 'API'
  import axios from 'axios'
  import store from '../../../store/index'
  import download from 'downloadjs'
  export default {
    name: 'RegionList',
    data () {
      return {
        UploadFile: axios.defaults.baseURL+'/assets/uploadFile',
        fileList: [],
        Search: {
          // 资产名称
          AssetsName: '',
          // 域
          regional: '',
          // 介质
          medium: '',
          // 开始时间
          AssetsDate1: '',
          // 结束时间
          AssetsDate2: '',
          // 上下架状态
          State: ''
        },
        // 域数据
        regionalData: [],
        // 介质数据
        mediumData: [],
        // 路径数据
        PathData: [],
        // 上架,下架状态
        ShelfState: [
          {
            id: 1,
            name: '上架'
          },
          {
            id: 2,
            name: '下架'
          }
        ],
        AssetsData: [],
        multipleSelection: [],
        CurrentPage: 1,
        total: 0,
        AssetsDialog: false,
        AssetsinnerDialog: false,
        Addshow: true,
        Editshow: false,
        AssetsTitle: '添加',
        form: {
          // 名称
          name: '',
          // 域id
          regional: '',
          // 介质id
          medium: '',
          // 路径id
          path: '',
          // 结构名称
          structureName: '',
          // 结构状态
          structure: '',
          // 周期状态
          Dateradio: '',
          // 开始时间
          AssetsDate1: '',
          // 结束时间
          AssetsDate2: '',
          // 备注
          textarea: '',
          // 路径
          enclosurePath: '',
          // 导入状态
          ImportState: ''
        },
        structureData: [
          {
            id: 1,
            value: 'txt'
          },
          {
            id: 2,
            value: 'csv'
          },
          {
            id: 3,
            value: 'parquet'
          },
          {
            id: 4,
            value: ' avro-default'
          },
          {
            id: 5,
            value: 'avro-javabean'
          },
          {
            id: 6,
            value: 'seq'
          },
          {
            id: 7,
            value: 'mysql-table'
          },
          {
            id: 8,
            value: 'hbase-default'
          },
          {
            id: 9,
            value: 'hbase-avro'
          },
        ],
        formLabelWidth: '120px',
        AssetsId: ''
      }
    },
    mounted () {
      this.regionAll()
      this.Assetslist(1)
    },
    computed:{
      headers () {
        return {
          'Authorization': 'Bearer ' + store.state.token
        }
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
      // 域发生改变时触发
      regionalChange () {
        this.clearFromregional()
        if (!this.form.regional) {
          this.mediumData = []
          this.PathData = []
          return
        }
        API.mediumAllList({
          regionId: this.form.regional
        }).then((res) => {
          if (res.code ===1 ) {
            this.mediumData = res.msg.mediumData
          }
        }).catch()
      },
      // 介质发生改变时触发
      mediumChange () {
        this.clearFromMedium()
        if(!this.form.medium){
          this.PathData = []
          return
        }
        API.mediumPathList({
          mediumId: this.form.medium
        }).then((res) => {
          if (res.code === 1) {
            this.PathData = res.msg.mediumPathData
            console.log(res)
          }
        }).catch()
      },
      // 清空介质多选框时
      clearFromMedium () {
        this.form.path = ''
        this.PathData = []
      },
      clearFromregional () {
        this.form.medium = ''
        this.mediumData = []
        this.clearFromMedium()
      },
      // 搜索
      SearchAssets () {
        this.Assetslist(1)
      },
      clearAssRegional () {
        this.Assetslist(1)
      },
      clearAssMedium () {
        this.Assetslist(1)
      },
      clearAssdate1 () {
        this.Assetslist(1)
      },
      clearAssdate2 () {
        this.Assetslist(1)
      },
      clearAssetsname () {
        this.Assetslist(1)
      },
      clearAssshelf () {
        this.Assetslist(1)
      },
      // 资产列表数据
      Assetslist (page) {
        if (page === '' || page === 1 ) {
          page = 1
          this.CurrentPage = 1
        }

        API.AssetsList({
          assetsName: this.Search.AssetsName,
          regionId: this.Search.regional,
          mediumId: this.Search.medium,
          start_cycle_time: this.Search.AssetsDate1,
          end_cycle_time: this.Search.AssetsDate2,
          sheifStatus: this.Search.State,
          page: page
        }).then((res) => {
          if (res.code === 1) {
            this.AssetsData = res.msg.assetsData
            this.total = parseInt(res.msg.count[0].count)
          }
        }).catch()
      },
      // 添加
      AddAssets () {
        this.EmptyForm()
        this.AssetsTitle = '添加'
        this.Addshow = true
        this.Editshow = false
        this.AssetsDialog = true

      },
      // 确认添加
      SureAssetsAdd () {
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
            message: '请选择区域',
            type: 'warning',
            duration:1000
          })
          return
        }
        if (!_this.form.medium) {
          _this.$message({
            message: '请选择介质',
            type: 'warning',
            duration:1000
          })
          return
        }
        if (!_this.form.path) {
          _this.$message({
            message: '请选择路径',
            type: 'warning',
            duration:1000
          })
          return
        }
        if (!_this.form.Dateradio) {
          _this.$message({
            message: '请选择时间周期',
            type: 'warning',
            duration:1000
          })
          return
        }
        var startDate, endDate
        if (_this.form.Dateradio === 1) {
          if (!_this.form.AssetsDate1 || !_this.form.AssetsDate2) {
            _this.$message({
              message: '时间周期不能为空',
              type: 'warning',
              duration:1000
            })
            return
          }else {
            startDate = _this.form.AssetsDate1
            endDate = _this.form.AssetsDate2
          }
        }
        if (startDate > endDate) {
          _this.$message({
            message: '结束时间不能低于开始时间',
            type: 'warning',
            duration:1000
          })
          return
        }
        if (_this.form.Dateradio === 2) {
          startDate = ''
          endDate = ''
        }
        if (!_this.form.structure) {
          _this.$message({
            message: '请选择是否有结构分类名称',
            type: 'warning',
            duration:1000
          })
          return
        }
        if (_this.form.structure === 'yes') {
          if (!_this.form.structureName) {
            _this.$message({
              message: '结构分类名称不能为空',
              type: 'warning',
              duration:1000
            })
            return
          }
          if (_this.form.structureName === 'avro-javabean') {
            if (!_this.form.enclosurePath) {
              _this.$message({
                message: '请上传avsc文本',
                type: 'warning',
                duration:1000
              })
              return
            }
          }else {
            _this.form.enclosurePath = ''
          }
        }

        if (_this.form.structure === 'no') {
          _this.form.structureName = ''
          _this.form.enclosurePath = ''
        }
        API.AssetsCreate({
          assetsName: _this.form.name,
          regionId: _this.form.regional,
          pathId: _this.form.path,
          mediumId: _this.form.medium,
          isCycle: _this.form.Dateradio,
          ifStructure: _this.form.structure,
          structureTypeName: _this.form.structureName,
          start_cycle_time: startDate,
          end_cycle_time: endDate,
          enclosurePath: _this.form.enclosurePath,
          assetsRemark: _this.form.textarea
        }).then((res) => {
          if (res.code === 0) {
            _this.$message({
              message: res.msg,
              type: 'error',
              duration:1000
            })
            _this.form.ImportState = res.msg
            _this.fileList = []
            return
          }
          if (res.code === 1 ) {
            _this.AssetsDialog = false
            _this.fileList = []
            _this.$message({
              message: res.msg,
              type: 'success',
              duration:1000
            })
            _this.Assetslist(1)
            console.log(res)
          }
        }).catch()

      },
      // 上架
      OnShelf (state, uuid, isCycle) {
        API.AssetsSheif({
          uuid: uuid,
          isCycle: isCycle,
          status: state
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
            this.Assetslist(this.CurrentPage)
          }
        }).catch()
      },
      // 下架
      InShelf (state, uuid, isCycle) {
        API.AssetsSheif({
          uuid: uuid,
          isCycle: isCycle,
          status: state
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
            this.Assetslist(this.CurrentPage)
          }
        }).catch()
      },
      // 修改
      EditAssets (uuid, asset_name, region_id, medium_id, path_id, is_cycle, start_cycle_time, end_cycle_time, ifstructure, structure_type_name, asset_remarks, enclosure_path) {
        this.EmptyForm()
        this.AssetsTitle = '修改'
        this.Addshow = false
        this.Editshow = true
        this.AssetsId = uuid
        this.form.name = asset_name

        // 判断区域id是否存在
        for (var i =0 ;i <this.regionalData.length; i++) {
          if (this.regionalData[i].uuid === region_id ) {
            this.form.regional = region_id
            API.mediumAllList({
              regionId: this.form.regional
            }).then((res) => {
              if (res.code ===1 ) {
                this.mediumData = res.msg.mediumData
                // 判断介质id是否存在
                for (var j = 0; j < this.mediumData.length; j++) {
                  if (this.mediumData[j].uuid === medium_id ) {
                    this.form.medium = medium_id
                    API.mediumPathList({
                      mediumId: this.form.medium
                    }).then((res) => {
                      if (res.code === 1) {
                        this.PathData = res.msg.mediumPathData
                      }
                    }).catch()
                    this.form.path = path_id
                  }
                }
              }
            }).catch()
          }
        }


        this.form.Dateradio = is_cycle
        if (this.form.Dateradio ===1 ) {
          this.form.AssetsDate1 = start_cycle_time
          this.form.AssetsDate2 = end_cycle_time
        }
        if (this.form.Dateradio ===2) {
          this.form.AssetsDate1 = ''
          this.form.AssetsDate2 = ''
        }

        this.form.structure = ifstructure
        if (this.form.structure === 'yes') {
          this.form.structureName = structure_type_name


        }
        if (this.form.structureName === 'avro-javabean') {
          this.form.enclosurePath = enclosure_path
          this.form.ImportState = '上传成功'
        }
        if (this.form.structure === 'no') {
          this.form.structureName = ''
          this.form.enclosurePath = ''
        }
        this.form.textarea = asset_remarks

        this.AssetsDialog = true
      },
      // 确认修改
      SureAssetsEdit () {
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
            message: '请选择区域',
            type: 'warning',
            duration:1000
          })
          return
        }
        if (!_this.form.medium) {
          _this.$message({
            message: '请选择介质',
            type: 'warning',
            duration:1000
          })
          return
        }
        if (!_this.form.path) {
          _this.$message({
            message: '请选择路径',
            type: 'warning',
            duration:1000
          })
          return
        }
        if (!_this.form.Dateradio) {
          _this.$message({
            message: '请选择时间周期',
            type: 'warning',
            duration:1000
          })
          return
        }
        var startDate, endDate
        if (_this.form.Dateradio === 1) {
          if (!_this.form.AssetsDate1 || !_this.form.AssetsDate2) {
            _this.$message({
              message: '时间周期不能为空',
              type: 'warning',
              duration:1000
            })
            return
          }else {
            startDate = _this.form.AssetsDate1
            endDate = _this.form.AssetsDate2
          }
        }
        if (startDate > endDate) {
          _this.$message({
            message: '结束时间不能低于开始时间',
            type: 'warning',
            duration:1000
          })
          return
        }
        if (_this.form.Dateradio === 2) {
          startDate = ''
          endDate = ''
        }
        if (!_this.form.structure) {
          _this.$message({
            message: '请选择是否有结构分类名称',
            type: 'warning',
            duration:1000
          })
          return
        }
        if (_this.form.structure === 'yes') {
          if (!_this.form.structureName) {
            _this.$message({
              message: '结构分类名称不能为空',
              type: 'warning',
              duration:1000
            })
            return
          }
          if (_this.form.structureName === 'avro-javabean') {
            if (!_this.form.enclosurePath) {
              _this.$message({
                message: '请上传avsc文本',
                type: 'warning',
                duration:1000
              })
              return
            }
          }else {
            _this.form.enclosurePath = ''
          }
        }

        if (_this.form.structure === 'no') {
          _this.form.structureName = ''
          _this.form.enclosurePath = ''
        }

        API.AssetsUpdate({
          uuid: _this.AssetsId,
          assetsName: _this.form.name,
          regionId: _this.form.regional,
          pathId: _this.form.path,
          mediumId: _this.form.medium,
          isCycle: _this.form.Dateradio,
          ifStructure: _this.form.structure,
          structureTypeName: _this.form.structureName,
          start_cycle_time: startDate,
          end_cycle_time: endDate,
          enclosurePath: _this.form.enclosurePath,
          assetsRemark: _this.form.textarea
        }).then((res) => {
          if (res.code === 0 ) {
            _this.$message({
              message: res.msg,
              type: 'error',
              duration:1000
            })
            _this.form.ImportState = res.msg
            _this.fileList = []
            return
          }
          if (res.code ===1 ) {
            _this.AssetsDialog = false
            _this.fileList = []
            _this.$message({
              message: res.msg,
              type: 'success',
              duration:1000
            })
            _this.Assetslist(_this.CurrentPage)
          }
        }).catch()
      },
      // 删除资产
      DelAssets () {
        const _this = this
        let ids=[]
        _this.multipleSelection.map((item)=> {
          ids.push(item.uuid)
        })
        if(!ids.length){
          _this.$message({
            message: '请选择需要删除的资产',
            type: 'warning',
            duration:1000
          })
          return
        }
        _this.$confirm('删除此资产, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          showClose: false,
          type: 'warning'
        }).then(() => {
          API.AssetsDelete({
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
              _this.Assetslist(_this.CurrentPage)
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
        this.Assetslist(val)
      },
      // 下载txte文本
      DownloadText () {
        API.exportTxtFile({
          txtPath: '/fileTxt/moban.avsc'
        }).then((res) => {
          console.log(res)
          download(res, "Template.avsc", "text/plain")
        }).catch()
      },
      // 上传成功后的回调
      uploadSuccess (response, file, fileList) {
        console.log(response)
        if (response.code ===1 ) {
          this.$message({
            message: '上传成功',
            type: 'success',
            duration:1000
          })
          this.form.ImportState = '上传成功'
          this.form.enclosurePath = response.msg.assetsFile
        }
        if (response.code === 6) {
          this.$message({
            message: '网络错误',
            type: 'error',
            duration:1000
          })
          this.fileList = []
          return
        }

      },
      // 上传错误
      uploadError (response, file, fileList) {
        this.$message({
          message: '上传错误',
          type: 'error',
          duration:1000
        })
        return
      },
      // 上传text文件的所有方法
      handleRemove(file, fileList) {
        console.log(file, fileList);
      },
      handlePreview(file) {
        console.log(file);
      },
      handleExceed(files, fileList) {
        this.$message.warning(`只能上传一个.avac文件`);
      },
      beforeRemove(file, fileList) {
        return this.$confirm(`确定移除 ${ file.name }？`);
      },
      beforeAvatarUpload(file) {
        var isAvsc=file.name.substring(file.name.lastIndexOf('.')+1)
        console.log(isAvsc)
        const isText = isAvsc === 'avsc';
        if (!isText) {
          this.$message.error('上传类型只能是 .avsc 格式!');
        }

        return isText
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
      EmptyForm () {
        this.form.name = ''
        this.form.regional = ''
        this.form.medium = ''
        this.form.ImportState = ''
        this.form.path = ''
        this.mediumData = []
        this.PathData = []
        this.form.Dateradio = ''
        this.form.structure = ''
        this.form.structureName = ''
        this.form.AssetsDate1 = ''
        this.form.AssetsDate2 = ''
        this.form.textarea = ''
        this.form.enclosurePath = ''
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
    .Functional-1 {
        margin-bottom: 20px;
        .margin-right {
            margin-right: 20px;
        }
    }
    .pin {
        width:15px;
        height:15px;
        display: inline-block;
        background: url("../../../assets/images/home/pin.png") no-repeat;
        background-size: cover;
    }
</style>