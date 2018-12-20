<template>
    <div class="AssetsDetails">
        <div class="Crumbs">
            <span class="Crumbs-item">资产管理</span>
            <i class="el-icon-arrow-right Crumbs-arrowhead"></i>
            <span class="Crumbs-item Crumbs-item-go" @click="goAssets">资产列表</span>
            <i class="el-icon-arrow-right Crumbs-arrowhead"></i>
            <span class="Crumbs-level">{{ CrumbsLevelName }}</span>
        </div>
        <div class="row">
            <div class="col-md-12">
                <div class="Tabs-menu">
                    <ul @click="menuhandleClick">
                        <li><span data-arr="数据资产" :class="CrumbsLevelName === '数据资产' ? 'Tabs-menu-active' : '' ">数据资产</span></li>
                        <li><span data-arr="数据介质" :class="CrumbsLevelName === '数据介质' ? 'Tabs-menu-active' : '' ">数据介质</span></li>
                        <li v-show="enclosure_path"><span data-arr="导入信息" :class="CrumbsLevelName === '导入信息' ? 'Tabs-menu-active' : '' ">导入信息</span></li>
                    </ul>
                </div>
                <div v-show=" CrumbsLevelName === '数据资产' " class="Tabs-context">
                    <el-table
                            :data="DetailsAssTable1"
                            border
                            style="width: 100%">
                        <el-table-column
                                prop="asset_name"
                                label="资产名称">
                        </el-table-column>
                        <el-table-column
                                prop="regional_name"
                                label="所属域"
                                show-overflow-tooltip>
                        </el-table-column>
                        <el-table-column
                                prop="medium_name"
                                label="存储介质"
                                show-overflow-tooltip>
                        </el-table-column>
                        <el-table-column
                                width="180"
                                prop="detailed_path"
                                label="路径"
                                show-overflow-tooltip>
                        </el-table-column>
                        <el-table-column
                                prop="username"
                                label="存储人">
                        </el-table-column>
                        <el-table-column
                                label="操作时间">
                            <template slot-scope="scope">
                                {{formatDate(scope.row.creation_time * 1000, 'yyyy-MM-dd hh:mm')}}
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <div v-show=" CrumbsLevelName === '数据介质' " class="Tabs-context">
                    <div class="Medium-content">
                        <!--<div class="Medium-context-header">-->
                            <!--<div class="medium-name">介质名称</div>-->
                            <!--<div class="medium-type">介质类型</div>-->
                            <!--<div class="medium-path">存储路径</div>-->
                        <!--</div>-->
                        <!--<div class="Medium-context-main">-->
                            <!--<div class="medium-name">{{medium_name}}</div>-->
                            <!--<div class="medium-type">{{medium_type_name}}</div>-->
                            <!--<div class="medium-path">-->
                                <!--<div class="medium-path-content">-->
                                    <!--<p>url: ssfsdfsdf</p>-->
                                    <!--<p>usr: sfsfsdfsdf</p>-->
                                    <!--<p>passwd: sdfsdfsdf</p>-->
                                <!--</div>-->
                            <!--</div>-->
                        <!--</div>-->
                        <table class="Medium-table">
                            <tr>
                                <th width="20%">介质名称</th>
                                <th width="20%">介质类型</th>
                                <th width="60%">存储路径</th>
                            </tr>
                            <tr>
                                <td>{{medium_name}}</td>
                                <td>{{medium_type_name}}</td>
                                <td>{{medium_example1}}<br/>{{medium_example2}}<br/>{{medium_example3}}<br/></td>
                            </tr>

                        </table>
                    </div>
                </div>
                <div v-show=" CrumbsLevelName === '导入信息' " class="Tabs-context">
                    <div class="Tabs-context-area">
                        <div class="context-area" v-show="ShowTextarea">
                            <el-input
                                    class="textarea"
                                    type="textarea"
                                    placeholder="请输入内容"
                                    v-model="TextContent">
                            </el-input>
                        </div>
                        <div style="height: 300px;box-shadow: 1px 2px 7px #ccc;overflow: hidden;padding: 10px 0;" v-show="ShowHtmlText">
                            <el-scrollbar style="height: 280px;" >
                                <div class="html-text" v-html="strVlaue(TextContent)"></div>
                            </el-scrollbar>
                        </div>
                    </div>
                    <div class="area-edit">
                        <span class="white-button"
                              v-show="goHtml" @click="ShowHtmlText = true, ShowTextarea = false, goHtml = false, subText = false, textEdit = true ">
                            返回
                        </span>
                        <span class="white-button margin-left" @click="EreaEdit" v-show="subText">确认</span>
                        <span class="white-button"
                              @click="goHtml = true, subText = true, textEdit = false, ShowHtmlText = false, ShowTextarea = true"
                              v-show="textEdit">编辑</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import API from 'API'
    export default {
      name: 'AssetsDetails',
      data () {
        return {
          num: '',
          CrumbsLevelName: '数据资产',
          activeName: 'first',
          DetailsAssTable1: [],
          mediumSingleId: '',
          enclosure_path: '',
          medium_name: '',
          medium_type_name: '',
          medium_example: '',
          medium_example1: '',
          medium_example2: '',
          medium_example3: '',
          TextContent: '',
          ShowTextarea: false,
          ShowHtmlText: true,
          goHtml: false,
          subText: false,
          textEdit: true
        }
      },
      created () {
        this.num = this.$route.params.num
        console.log('created '+ this.$route.params.num)
      },
      mounted () {
        this.assetssingle()
      },
      methods: {
        strVlaue (strValue){
          return strValue.replace(/\r\n/g, '<br/>').replace(/\n/g, '<br/>').replace(/\s/g, '&nbsp;');
        },
        // 单条数据资产信息
        assetssingle () {
          API.AssetsSingle({
            uuid: this.num
          }).then((res) => {
            if (res.code ===1 ) {
              console.log(res)
              this.DetailsAssTable1 = res.msg.assetsSingleData
              this.mediumSingleId = res.msg.assetsSingleData[0].medium_id
              this.enclosure_path = res.msg.assetsSingleData[0].enclosure_path

            }
            if (res.code ===0 ) {
              this.$message({
                message: res.msg,
                type: 'error',
                duration:1000
              })
              return
            }
          }).catch()
        },
        // 单条数据资产介质的信息
        assetsmediumSingle () {
          API.MediumSingle({
            mediumId: this.mediumSingleId
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
              console.log(res)
              this.medium_name = res.msg.mediumSingleData.medium_name
              this.medium_type_name = res.msg.mediumSingleData.medium_type_name
              const medium_example = JSON.parse(res.msg.mediumSingleData.medium_example)
              if (medium_example.URL) {
                console.log('URL')
                this.medium_example1 = 'URL: ' + medium_example.URL
                this.medium_example2 = 'zookeeper: ' + medium_example.zookeeper
                this.medium_example3 = 'clientPort: ' + medium_example.clientPort
              }
              if (medium_example.url) {
                this.medium_example1 = 'url: ' + medium_example.url
                this.medium_example2 = 'user: ' + medium_example.user
                this.medium_example3 = 'passwd: ' + medium_example.passwd
              }
              if (medium_example.root) {
                this.medium_example1 = 'root: ' + medium_example.root
                this.medium_example2 = 'username: ' + medium_example.username
                this.medium_example3 = 'group: ' + medium_example.group
              }
              console.log(JSON.parse(res.msg.mediumSingleData.medium_example))
            }
          }).catch()
        },
        // 单条资产导入的信息
        assetsexportTxtFile () {
          API.FileTxtContent({
            txtPath: this.enclosure_path
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
              console.log(res)
              this.TextContent = res.msg.content
            }
          }).catch()
        },
        goAssets () {
          this.$router.push('/home/AssetsList')
        },
        menuhandleClick(e) {
          const _this = this
          const elem = e.target ? e.target : e.srcElement
          if ($(elem).attr('data-arr') === '数据资产' ) {
            _this.CrumbsLevelName = '数据资产'
            _this.assetssingle()
          }else if ($(elem).attr('data-arr') === '数据介质') {
            _this.CrumbsLevelName = '数据介质'
            _this.assetsmediumSingle()

          }else if ($(elem).attr('data-arr') === '导入信息') {
            _this.CrumbsLevelName = '导入信息'
            _this.assetsexportTxtFile()
          }
        },
        // 编辑
        EreaEdit () {
          if (!this.TextContent) {
            this.$message({
              message: '不能为空',
              type: 'warning',
              duration:1000
            })
            return
          }
          API.WriteFileTxtContent({
            content: this.TextContent,
            txtPath: this.enclosure_path
          }).then((res) => {
            if (res.code === 0) {
              this.$message({
                message: res.msg,
                type: 'error',
                duration:1000
              })
              return
            }
            if (res.code ===1 ) {
              this.assetsexportTxtFile()
              this.goHtml = false
              this.subText = false
              this.textEdit = true
              this.ShowHtmlText = true
              this.ShowTextarea = false
              console.log(res)
            }
          }).catch()
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
    .Crumbs-item-go {
        cursor: pointer;
    }
    .Crumbs-item-go:hover {
        color: #ff6600;
    }
    .Tabs-menu {
        width: 100%;
        text-align: center;
        ul {
            li {
                display: inline-block;
                height: 40px;
                line-height: 40px;
                padding: 0 20px;
                cursor: pointer;
                span {
                    display: inline-block;
                    height: 40px;
                    font-weight: bold;
                }
                .Tabs-menu-active {
                    border-bottom: 2px solid #ff6600;
                    color: #ff6600;
                }
            }
        }

    }
    .Tabs-context {
        width: 100%;
        margin: 20px 0;
        .Medium-content {
            width: 100%;
            border: 1px solid #cccc;
            .Medium-context-header {
                width: 100%;
                div{
                    display: inline-block;
                    height: 40px;
                    line-height: 40px;
                }
                .medium-name {
                    width: 10%;
                }
                .medium-type {
                    width: 10%;
                }
                .medium-path {
                    width: 78%;
                }

            }
            .Medium-context-main {
                width: 100%;
                height: 200px;
                div {
                    display: inline-block;
                }
                .medium-name {
                    width: 10%;
                }
                .medium-type {
                    width: 10%;
                }
                .medium-path {
                    width: 78%;
                    position: relative;
                    .medium-path-content {
                        position: absolute;
                        top:0;
                        left: 0;
                    }
                }
            }
        }
    }
    .Tabs-context-area {
        width: 50%;
        .context-area{
            width: 100%;
            height: 300px;
        }
        .html-text {
            width: 100%;
            height: 280px;
        }
    }
    .area-edit {
        margin: 20px 0;
        .margin-left {
            margin-left: 20px;
        }
    }
    .fade-enter-active,.fade-leave-active{
        transition:opacity .3s ease-out;
    }
    .fade-enter,.fade-leave-active{
        opacity:0;
    }
    .demo-table-expand {
        font-size: 0;
    }
    .demo-table-expand label {
        width: 90px;
        color: #99a9bf;
    }
    .demo-table-expand .el-form-item {
        margin-right: 0;
        margin-bottom: 0;
        width: 50%;
    }
    .Medium-table {
        width: 100%;
        border: 1px solid #ccc;
        border-top:0;
        tr {
            td {
                border-top: 1px solid #ccc;
                border-right: 1px solid #ccc;
                padding: 4px 10px;

            }
            th {
                border-left: 1px solid #ccc;
                padding: 4px 10px;
                background: #2f2e34;
                color: white;
            }
        }
    }

</style>