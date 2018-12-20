/**
 * Created by gaoyu at 2018/7/25 下午2:53
 *
 * Desc :
 */
const Sequelize = require('sequelize');

import sequelize from './db';

const rolePrivilege = sequelize.define('k_role_privilege', {}, {
    charset: 'utf8',
    freezeTableName: true,
    tableName:"k_role_privilege",
    timestamps:false,
});

export default rolePrivilege;
