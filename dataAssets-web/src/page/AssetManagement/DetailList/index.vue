<template>
    <div class="Context">
        <div class="Crumbs">
            <span class="Crumbs-item">参数管理</span>
            <i class="el-icon-arrow-right Crumbs-arrowhead"></i>
            <span class="Crumbs-level">资产明细列表</span>
        </div>
        <div class="Functional">
            <el-input v-model="Search.AssetsName" placeholder="数据资产名称" size="mini"></el-input>
            <span class="input-margin"></span>
            <el-input v-model="Search.Domain" placeholder="所属域" size="mini"></el-input>
            <span class="yellow-button button-20">搜索</span>
            <div class="Functional-right">
                <span class="white-button">导出</span>
            </div>
        </div>
        <div class="Functional-1">
            <el-date-picker type="date" format="yyyy/MM/dd" value-format="timestamp" placeholder="开始时间" v-model="Search.AssetsDate1" style="width: 160px;" size="mini"></el-date-picker>
            <span class="input-margin">-</span>
            <el-date-picker type="date" format="yyyy/MM/dd" value-format="timestamp" placeholder="结束时间" v-model="Search.AssetsDate2" style="width: 160px;" size="mini"></el-date-picker>
            <span class="input-margin"></span>
            <el-input v-model="Search.StorageMedium" placeholder="存储介质" size="mini"></el-input>
            <span class="input-margin"></span>
            <el-input v-model="Search.OwnedAssets" placeholder="所属资产" size="mini"></el-input>
            <div class="Functional-right">
                <span class="margin-right">上下架状态</span>
                <el-select v-model="value" placeholder="请选择" size="mini">
                    <el-option
                            v-for="item in options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                    </el-option>
                </el-select>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <el-table
                        :data="DetailsAssTable1"
                        border
                        style="width: 100%">
                    <el-table-column
                            prop="id"
                            label="序号"
                            width="120">
                    </el-table-column>
                    <el-table-column
                            prop="Code"
                            label="资产编码"
                            width="120">
                    </el-table-column>
                    <el-table-column
                            prop="name"
                            label="资产名称"
                            show-overflow-tooltip>
                    </el-table-column>
                    <el-table-column
                            prop="Domain"
                            label="所属域"
                            show-overflow-tooltip>
                    </el-table-column>
                    <el-table-column
                            prop="storageMedium"
                            label="存储介质"
                            show-overflow-tooltip>
                    </el-table-column>
                    <el-table-column
                            prop="Route"
                            label="路径"
                            show-overflow-tooltip>
                    </el-table-column>
                    <el-table-column
                            prop="StoredPerson"
                            label="存储人"
                            show-overflow-tooltip>
                    </el-table-column>
                    <el-table-column
                            label="操作"
                            show-overflow-tooltip>
                        <template slot-scope="scope">
                            <router-link :to="{ path: '/home/DetailListDetails/' + 1 }">
                                <el-button size="small">查看详情</el-button>
                            </router-link>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="pagination-page">
                    <el-pagination
                            @current-change="CurrentChange"
                            :current-page.sync="CurrentPage"
                            :page-size="10"
                            layout="prev, pager, next, total, jumper, slot"
                            :total="10">
                    </el-pagination>
                </div>
            </div>
        </div>
        <el-dialog title="添加" :visible.sync="DomainDialog" width="40%" center>
            <el-form :model="form">
                <el-form-item label="资产名称" :label-width="formLabelWidth">
                    <el-input v-model="form.name" auto-complete="off" placeholder="请输入名称" size="mini" clearable></el-input>
                </el-form-item>
                <el-form-item label="所属区域" :label-width="formLabelWidth">
                    <el-radio-group v-model="form.Domainradio">
                        <el-radio :label="1">区域1</el-radio>
                        <el-radio :label="2">区域2</el-radio>
                        <el-radio :label="3">区域3</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="存储介质" :label-width="formLabelWidth">
                    <el-select v-model="value" placeholder="介质" size="mini" clearable>
                        <el-option
                                v-for="item in options"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                        </el-option>
                    </el-select>
                    <el-select v-model="value" placeholder="路径" size="mini" clearable>
                        <el-option
                                v-for="item in options"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="" :label-width="formLabelWidth">
                    <el-radio-group v-model="form.Dateradio">
                        <el-radio :label="5">有</el-radio>
                        <el-radio :label="6">无</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="时间周期" :label-width="formLabelWidth" v-show="form.Dateradio === 5">
                    <el-date-picker type="date" format="yyyy/MM/dd" value-format="timestamp" placeholder="开始时间" v-model="Search.AssetsDate1" style="width: 160px;" size="mini"></el-date-picker>
                    <span>-</span>
                    <el-date-picker type="date" format="yyyy/MM/dd" value-format="timestamp" placeholder="结束时间" v-model="Search.AssetsDate2" style="width: 160px;" size="mini"></el-date-picker>
                </el-form-item>
                <el-form-item label="上传附件" :label-width="formLabelWidth">
                    <el-button @click="AssetsinnerDialog = true">导入</el-button>
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
                    width="30%"
                    center
                    title="数据资产信息导入"
                    :visible.sync="AssetsinnerDialog"
                    append-to-body>
                <el-form>
                    <el-form-item label="资产信息" :label-width="formLabelWidth">
                        <el-button>选择文件</el-button>
                    </el-form-item>
                    <el-form-item label="下载模板" :label-width="formLabelWidth">
                        <el-button>下载</el-button>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <span class="yellow-button button-right">关闭</span>
                    <span class="white-button button-15">导入</span>
                </div>
            </el-dialog>
            <div slot="footer" class="dialog-footer">
                <span class="yellow-button button-right">确定</span>
                <span class="white-button button-15">重填</span>
            </div>
        </el-dialog>
    </div>
</template>
<script>
  export default {
    name: 'RegionList',
    data () {
      return {
        Search: {
          AssetsName: '',
          Domain: '',
          AssetsDate1: '',
          AssetsDate2: '',
          StorageMedium: '',
          OwnedAssets: ''
        },

        options: [{
          value: '选项1',
          label: '全部'
        }, {
          value: '选项2',
          label: '上架'
        }, {
          value: '选项3',
          label: '下架'
        }],
        value: '',
        DetailsAssTable1: [
          {
            id: 1,
            Code: 'cheyunjinfu-007',
            name: '数据资产1',
            Domain: '区域1',
            storageMedium: '介质1',
            Route: '路径1',
            StoredPerson: '小猪佩琪'
          },
          {
            id: 2,
            Code: 'cheyunjinfu-007',
            name: '数据资产1',
            Domain: '区域1',
            storageMedium: '介质1',
            Route: '路径1',
            StoredPerson: '小猪佩琪'
          },
          {
            id: 3,
            Code: 'cheyunjinfu-007',
            name: '数据资产1',
            Domain: '区域1',
            storageMedium: '介质1',
            Route: '路径1',
            StoredPerson: '小猪佩琪'
          },
          {
            id: 4,
            Code: 'cheyunjinfu-007',
            name: '数据资产1',
            Domain: '区域1',
            storageMedium: '介质1',
            Route: '路径1',
            StoredPerson: '小猪佩琪'
          },
          {
            id: 5,
            Code: 'cheyunjinfu-007',
            name: '数据资产1',
            Domain: '区域1',
            storageMedium: '介质1',
            Route: '路径1',
            StoredPerson: '小猪佩琪'
          },
          {
            id: 6,
            Code: 'cheyunjinfu-007',
            name: '数据资产1',
            Domain: '区域1',
            storageMedium: '介质1',
            Route: '路径1',
            StoredPerson: '小猪佩琪'
          },
          {
            id: 7,
            Code: 'cheyunjinfu-007',
            name: '数据资产1',
            Domain: '区域1',
            storageMedium: '介质1',
            Route: '路径1',
            StoredPerson: '小猪佩琪'
          },
          {
            id: 8,
            Code: 'cheyunjinfu-007',
            name: '数据资产1',
            Domain: '区域1',
            storageMedium: '介质1',
            Route: '路径1',
            StoredPerson: '小猪佩琪'
          },
          {
            id: 9,
            Code: 'cheyunjinfu-007',
            name: '数据资产1',
            Domain: '区域1',
            storageMedium: '介质1',
            Route: '路径1',
            StoredPerson: '小猪佩琪'
          },
          {
            id: 10,
            Code: 'cheyunjinfu-007',
            name: '数据资产1',
            Domain: '区域1',
            storageMedium: '介质1',
            Route: '路径1',
            StoredPerson: '小猪佩琪'
          }
        ],
        multipleSelection: [],
        CurrentPage: 1,
        DomainDialog: false,
        AssetsinnerDialog: false,
        form: {
          name: '',
          Domainradio: '',
          Dateradio: '',
          textarea: ''
        },
        formLabelWidth: '80px'
      }
    },
    methods: {
      // 添加
      AddDomainList () {
        this.DomainDialog = true
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      CurrentChange (val) {
        this.CurrentPage = val
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
</style>