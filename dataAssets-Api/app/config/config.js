/**
 * Created by gaoyu at 2017/7/24 下午5:41
 *
 * Desc :
 */
const path = require("path");
//数据库重置标签 正式环境一定要设为false
export let DB_RESTART_FLAG = false
//管理后台每页返回数据量
export let MANAGER_LIMIT = 15
//忽略检测用户登录和权限的路由
export let NOCHECKURL = ["/login"]
//yaml文件存放路径
export let YAMLURL = path.resolve(__dirname, '../../yaml') + "/"
//txt存放路劲
export let TXTURl = path.resolve(__dirname, '../../fileTxt') + "/"
//导入文件允许上传的文件类型
export let ALLOWTYPE = ['txt']
/**网络请求code错误码 */
export const NET = {
  // 请求错误
  error: function (msg) {
    return {code: 0, msg: msg}
  },
  // 请求成功
  success: function (data) {
    return {code: 1, msg: data}
  },
  // 没有此用户
  paramUserError (msg) {
    return {code: 4, msg: msg}
  },
  // 密码不正确
  paramPwdError: function (msg) {
    return {code: 5, msg: msg}
  },
  // 网络错误
  networkError: function (msg) {
    return {code: 6, msg: msg}
  },
  ERROR: {
    ERROR_NO_LOGIN: {code: 2, msg: '没有登录'},
    ERROR_NO_PRIVILEGE: {code: 3, msg: '没有权限'},
  }
  
}