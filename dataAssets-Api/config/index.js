/**
 * Created by gaoyu at 2018/07/26 上午11:59
 *
 * Desc :
 */
const development_env = require('./development');
var test_env = require('./test');
// const production_env = require('./production');
// const test_env = require('./production');

//根据不同的NODE_ENV，输出不同的配置对象，默认输出development的配置对象
// module.exports = {
//     development: development_env,
//     production: production_env,
//     test:test_env
// }[process.env.NODE_ENV || 'development'];
//根据不同的NODE_ENV，输出不同的配置对象，默认输出development的配置对象
module.exports = {
    development: development_env,
    test: test_env
}[process.env.NODE_ENV || 'development']