<template>
    <div class="login">
        <div class="form-login">
            <h3 class="form-login-heading">密码登录</h3>
            <div class="login-wrap">
                <input type="text" v-model="userName" class="form-control tip-name" placeholder="请输入用户名" @blur="focusState = false" v-focus="focusState">
                <!--<el-input-->
                        <!--class="form-control tip-name"-->
                        <!--v-model="userName"-->
                        <!--:autofocus="true"-->
                        <!--suffix-icon="el-icon-date"-->
                        <!--type="text"-->
                        <!--placeholder="请输入用户名"-->
                        <!--clearable>-->
                <!--</el-input>-->

                <div class="tips" v-if="Name" ><p>请填写帐号</p></div>
                <input type="password" v-model="pwd" class="form-control tip-pwd" placeholder="请输入密码" v-on:keyup="show($event)">
                <div class="tips"  v-if="pwds" > <p>请填写密码</p></div>
                <div class="checkbox"></div>
                <button class="btn btn-theme btn-block" @click="login"  type="submit"><b>登录</b></button>
                <!--<div class="forget-password"><i></i><p><b>忘记密码</b></p><i></i></div>-->
            </div>
        </div>
    </div>
</template>
<script>
  import API from 'API'
  import register from './componets/register'
  export default {
    components: {
      register
    },
    data() {
      return {
        userName: '',
        Name:false,
        pwds:false,
        userNameTips: '',
        pwd: '',
        pwdTips: '',
        focusState: false

      };
    },
    mounted () {
      this.focusState = true
    },
    directives: {
      focus: {
        update: function (el, {value}) {
          if (value) {
            el.focus()
          }
        }
      }
    },
    methods: {
      //提交表单
      login() {
          if (this.CheckLogin()) {
            API.Login({
              username: this.userName,
              password: this.pwd
            }).then((res)=>{
              if (res.code === 0) {
                this.$message({
                  showClose: true,
                  message: res.msg,
                  type: 'error',
                  duration: 1000
                })
                return false
              }
              if (res.code === 1) {
                let token = res.msg.token
                let username = res.msg.username
                this.$store.dispatch('UserLogin', token)
                this.$store.dispatch('UserName', username)
                let redirect = decodeURIComponent(this.$route.query.redirect || '/')
                this.$router.push({
                  path: redirect
                })
              }
              if (res.code === 4) {
                this.$message({
                  showClose: true,
                  message: res.msg,
                  type: 'error',
                  duration: 1000
                })
                return false
              }
              if (res.code === 5) {
                this.$message({
                  showClose: true,
                  message: res.msg,
                  type: 'error',
                  duration: 1000
                })
                return false
              }
            })

          } else {
            console.log('error submit!!');
            return false;
          }
      },
      CheckLogin () {
        console.log(0)
        const _this = this
        if (!_this.userName){
          _this.Name= true
        }else {
          _this.Name= false
        }
        if (!_this.pwd){
          _this.pwds= true
        }else{
          _this.pwds= false
        }
        if(_this.userName && _this.pwd){
          return true
        }
      },
      show (ev) {
        if (ev.keyCode === 13) {
          this.login()
        }
      }
    }
  }

</script>
<style lang="scss" scoped>
    .login {
        min-width: 1136px;
        position: fixed;
        left: 0;
        top: 0;
        right: 0;
        bottom:0;
        height:100%;
        width: 100%;
        background-image: url('../../../src/assets/images/login/login_bg.jpg');
        background-repeat: no-repeat;
        background-size: cover;
        .form-login {
            width: 450px;
            height:454px;
            position:absolute;
            top:20%;
            right:8%;
            background: #fff;
            border-radius: 5px;
            -webkit-border-radius: 5px;
            .form-login-heading {
                margin: 0;
                padding: 35px 20px;
                text-align: left;
                border-radius: 5px 5px 0 0;
                -webkit-border-radius: 5px 5px 0 0;
                color: #555;
                font-size: 20px;
                text-transform: uppercase;
                font-weight: 300;
            }
            .login-wrap {
                padding: 20px;
                p {
                    position: relative;
                    top: -17px;
                    color: red;
                    font-size: 12px;
                }
                .tips {
                    position: absolute;
                    font-size: 18px;
                    p {
                        position: relative;
                        top: -17px;
                        color: red;
                        font-size: 12px;
                    }
                }
                .form-control {
                    height:50px;
                    padding: 0px 12px 0px 12px;
                    font-size: 18px;
                    -webkit-border-radius: 0em;
                    -moz-border-radius: 0em;
                    border-radius: 0em;
                    color:#555;
                }
                .tip-name {
                    background: url("../../../src/assets/images/login/head.png")no-repeat left;
                    background-position: 95% 50%;
                }
                .tip-pwd {
                    background: url("../../../src/assets/images/login/password.png")no-repeat left;
                    background-position: 95% 50%;
                }
                input {
                    margin-bottom: 24px;
                }
                .btn-theme {
                    color: #fff;
                    background-color: #ff6600;
                    padding: 10px 12px;
                    font-size: 18px;
                    -webkit-border-radius: 0em;
                    -moz-border-radius: 0em;
                    border-radius: 0em;
                }
            }
        }
        @media (max-width: 1366px) {
            .form-login {
                width: 380px;
                height:380px;
                position:absolute;
                top:20%;
                right:8%;
                background: #fff;
                border-radius: 5px;
                -webkit-border-radius: 5px;
            }
        }

    }



</style>
