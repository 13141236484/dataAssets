/**
 * Created by gaoyu at 2018/07/26 上午11:59
 *
 * Desc :
 */
module.exports =  {
    port : process.env.PORT || 3001,
    token   : 'secret-token',
    session : 'secret-token',
    mongodb: 'mongodb://localhost:27017/',
    db_type: 'mysql',                   //数据库类型
    dbconfig: {
        host     : '192.168.1.10',    //服务器地址
        port     : 3306,           //数据库端口号
        username : 'root',         //数据库用户名
        password : 'tshh@time_stone#$%',     //数据库密码
        database : 'cpknowlegecms',         //数据库名称
    }
}