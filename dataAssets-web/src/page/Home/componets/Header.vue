<template>
    <div class="header">
        <div class="header-logo">
            <div class="logo-img"></div>
        </div>
        <div class="header-main">
            <!--<div class="menu" :class="route === 'ProductionProcess' ? 'menu-active' : '' " @mouseenter="enter(5)" @mouseleave="leave(5)">-->
                <!--生产过程-->
                <!--<transition name="fade" mode="out-in">-->
                <!--<ul class="menu-item" v-show="menuShow5">-->
                    <!--<li class="item-1">生产过程</li>-->
                    <!--<li><router-link to="/home/ProductionProcessList">生产过程列表</router-link></li>-->
                <!--</ul>-->
                <!--</transition>-->
            <!--</div>-->
            <div class="menu" :class="route === 'ProductionLine' ? 'menu-active' : '' " @mouseenter="enter(4)" @mouseleave="leave(4)">
                生产线
                <transition name="fade" mode="out-in">
                <ul class="menu-item" v-show="menuShow4">
                    <li class="item-1">生产线</li>
                    <li><router-link to="/home/ProductionLineList">生产线列表</router-link></li>
                    <li><router-link to="/home/ProductionDetailedList">生产线详单</router-link></li>
                </ul>
                </transition>
            </div>
            <!--<div class="menu" :class="route === 'EngineeringList' ? 'menu-active' : '' " @mouseenter="enter(3)" @mouseleave="leave(3)">-->
                <!--工艺管理-->
                <!--<transition name="fade" mode="out-in">-->
                <!--<ul class="menu-item" v-show="menuShow3">-->
                    <!--<li class="item-1">工艺管理</li>-->
                    <!--<li><router-link to="/home/EngineeringList">生产工艺列表</router-link></li>-->
                <!--</ul>-->
                <!--</transition>-->
            <!--</div>-->
            <div class="menu" :class="route === 'AssetManagement' ? 'menu-active' : '' " @mouseenter="enter(2)" @mouseleave="leave(2)">
                资产管理
                <transition name="fade" mode="out-in">
                <ul class="menu-item" v-show="menuShow2">
                    <li class="item-1">资产管理</li>
                    <li><router-link to="/home/AssetsList">资产列表</router-link></li>
                    <!--<li><router-link to="/home/DetailList">资产明细列表</router-link></li>-->
                </ul>
                </transition>
            </div>
            <div class="menu" :class="route === 'Parameter' ? 'menu-active' : '' " @mouseenter="enter(1)" @mouseleave="leave(1)">
                参数管理
                <transition name="fade" mode="out-in">
                <ul class="menu-item" v-show="menuShow1">
                    <li class="item-1">参数管理</li>
                    <li><router-link to="/home/RegionList">域列表</router-link></li>
                    <li><router-link to="/home/MediumList">介质列表</router-link></li>
                </ul>
                </transition>
            </div>
        </div>
        <div class="header-user">
            <div class="header-user-img"></div>
            <div class="header-user-down" @mouseenter="enter(6)" @mouseleave="leave(6)">
                <span>{{username}}</span>
                <span><i class="el-icon-caret-bottom"></i></span>
                <transition name="fade" mode="out-in">
                <ul class="user-hover" v-show="menuShow6">
                    <li class="item-1"><span class="item-11">{{username}}</span><i class="el-icon-caret-bottom"></i></li>
                    <li><a @click="logOut">退出</a></li>
                </ul>
                </transition>
            </div>
        </div>
    </div>
</template>
<script>
    import API from 'API'
    import store from '../../../store/index'
    export default {
      name: 'HomeHeader',
      data () {
        return {
          menuShow1: false,
          menuShow2: false,
          menuShow3: false,
          menuShow4: false,
          menuShow5: false,
          menuShow6: false,
          route: '',
          username: 'admin'
        }
      },
      created () {
        this.RoutingDetection()
        this.username = window.localStorage.getItem('username')
      },
      methods: {
        RoutingDetection () {
          this.route = this.$router.history.current.meta.route
        },
        enter (index) {
          switch (index){
            case 1:
              this.menuShow1 = true
              break
            case 2:
              this.menuShow2 = true
              break
            case 3:
              this.menuShow3 = true
              break
            case 4:
              this.menuShow4 = true
              break
            case 5:
              this.menuShow5 = true
              break
            case 6:
              this.menuShow6 = true
              break
            default:
              return
          }
        },
        leave (index) {
          switch (index){
            case 1:
              this.menuShow1 = false
              break
            case 2:
              this.menuShow2 = false
              break
            case 3:
              this.menuShow3 = false
              break
            case 4:
              this.menuShow4 = false
              break
            case 5:
              this.menuShow5 = false
              break
            case 6:
              this.menuShow6 = false
              break
            default:
              return
          }
        },
        logOut () {
          API.LoginOut({}).then((res) => {
            this.$store.dispatch('UserLogout', '')

            if (res.code === 1 || res.code === 2) {
              this.$router.push('/login')
            }
          }).catch()
        }
      },
      watch: {
        // 如果路由有变化，会再次执行该方法
        '$route': 'RoutingDetection'
      }
    }
</script>
<style lang="scss" scoped>
    $header-height: 75px;
    .header {
        width: 100%;
        height: $header-height;
        background: #2f2e34;
        .header-logo {
            width: 20%;
            height: $header-height;
            float: left;
            position:relative;
            .logo-img {
                width: 178px;
                height: 40px;
                position: absolute;
                top:20px;
                left:70px;
                background: url("../../../../src/assets/images/home/logo.png") no-repeat;
                background-size: 90%;
            }
        }
        .header-main {
            width: 60%;
            height: $header-height;
            line-height: $header-height;
            float: left;
            background: #2f2e34;
            .menu {
                float: right;
                margin-right: 10px;
                padding: 0 22px;
                border-top: 2px solid transparent;
                color: #fff;
                font-size: 16px;
                font-weight: bold;
                position: relative;
                cursor: pointer;
                .menu-item {
                    width: 100%;
                    position: absolute;
                    top: -3px;
                    left:0;
                    z-index: 2;
                    background: #2e2e34;
                    text-align: center;
                    box-shadow: 1px 2px 7px rgba(0, 0, 0, 0.7);
                    border-top: 2px solid #ff6600;

                    li {
                        line-height: 34px;
                        color: white;
                        font-size: 16px;
                        a{
                            color: #6d6c72;
                            padding: 8px 0;
                            border-top: 1px solid #ff9900;
                            font-size: 14px;
                        }
                        a:hover{
                            color: #fff;
                        }
                    }
                    .item-1 {
                        margin-top: 21px;
                    }
                }
            }
            .menu-active {
                border-top: 2px solid #ff6600;
            }
        }
        .header-user {
            width: 20%;
            height: $header-height;
            text-align: right;
            float: left;
            padding-right: 70px;
            position: relative;
            .header-user-img {
                width:30px;
                height:30px;
                border-radius: 50%;
                background: #ff6600;
                display: inline-block;
                position: absolute;
                top:26px;
                right:152px;
            }
            .header-user-down {
                display: inline-block;
                cursor: pointer;
                position: absolute;
                top:30px;
                right:70px;
                padding: 0 10px;
                span {
                    color:#fff;
                }
                .user-hover {
                    position: absolute;
                    top:-30px;
                    left:0;
                    width: 100%;
                    background: #2e2e34;
                    border-top: 2px solid #ff6600;
                    box-shadow: 1px 2px 7px rgba(0, 0, 0, 0.7);
                    text-align: center;
                    /*display: none;*/
                    li {
                        color: white;
                        margin-bottom: 10px;
                        .item-11 {
                            margin: 0 4px 0 -1px;
                        }
                        a{
                            color: #6d6c72;
                            border-top: 1px solid #ff9900;
                            font-size: 14px;
                            padding: 6px 0;
                            margin-bottom:10px;
                        }
                        a:hover{
                            color: #fff;
                        }
                    }
                    .item-1 {
                        margin-top:28px;
                    }
                }


            }
        }
    }
    .fade-enter-active,.fade-leave-active{
        transition:opacity .3s ease-out;
    }
    .fade-enter,.fade-leave-active{
        opacity:0;
    }
</style>