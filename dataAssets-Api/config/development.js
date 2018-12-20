/**
 * Created by gaoyu at 2018/07/26 上午11:59
 *
 * Desc :
 */
module.exports =  {
    port : process.env.PORT || 3003,
    token   : 'assetsdata-token',
    session : 'assetsdata-session',
    mongodb: 'mongodb://localhost:27017/',
    db_type: 'mysql',                   //数据库类型

        // 本机
        dbconfig: {
            host     : '127.0.0.1',     //服务器地址
            port     : 3306,            //数据库端口号
            username : 'root',          //数据库用户名
            password : 'root',          //数据库密码
            database : 'assetsdata',    //数据库名称
        }
        // 服务器
        // dbconfig: {
        //   host     : '192.168.1.34',    //服务器地址
        //   port     : 3306,              //数据库端口号
        //   username : 'cpknowlegecms_f', //数据库用户名
        //   password : 'Ts@2018981',      //数据库密码
        //   database : 'assetsdata',      //数据库名称
        // }
}
