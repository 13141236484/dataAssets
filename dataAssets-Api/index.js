/**
 * Created by zhaojinsheng at 2017/12/1 上午11:25
 *
 * Desc : 项目入口文件
 */
import Koa from 'koa';
import logger from 'koa-logger';
import convert from 'koa-convert';
import passport from 'koa-passport';
import bodyParser from 'koa-bodyparser';
import session from 'koa-session2';
// const session = require('koa-generic-session');
const koaBody = require('koa-body');

const app = new Koa();
//不同环境导入不同配置
import config from './config';
//log工具
const logUtil = require('./app/utils/log_util');
// logger
app.use(koaBody({
    multipart: true,
    formidable: {
        maxFileSize: 200*1024*1024    // 设置上传文件大小最大限制，默认2M
    }
}));

app.use(async (ctx, next) => {
    //响应开始时间
    const start = new Date();
    //响应间隔时间
    var ms;
    try {
        //开始进入到下一个中间件
        await next();

        ms = new Date() - start;
        //记录响应日志
        logUtil.logResponse(ctx, ms);

    } catch (error) {

        ms = new Date() - start;
        //记录异常日志
        console.log(error);
        logUtil.logError(ctx, error, ms);
    }

});
//本地访问跨域
var cors = require('koa2-cors');
//设置cookie 的键
app.keys = [config.session];
//加载中间件
app.use(convert(logger()));
app.use(convert(bodyParser({
  enableTypes:['json', 'form', 'text'],
  formLimit:"3mb",
  queryString:{
    parameterLimit:1000000000
  }
})));
app.use(convert(session({
    key: "SESSIONID",

})));

app.use(convert(cors()));
//加载passport
// require('./app/auth/auth');
app.use(passport.initialize());
app.use(passport.session());
//加载路由
require('./app/controller')(app);


module.exports = app;