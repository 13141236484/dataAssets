/**
 * Created by gaoyu at 2018/7/25 下午2:53
 *
 * Desc :
 */
const Sequelize = require('sequelize');

import sequelize from './db';
//生产工艺、生产过程 关联表
const technologyProcessRelation = sequelize.define('k_technology_process_relation', {
	id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
    technology_id: { type: Sequelize.INTEGER(11), allowNull: false,defaultValue:"",comment:"生产工艺ID" },
    process_id: { type: Sequelize.INTEGER(11), allowNull: false,defaultValue:"",comment:"生产过程ID" }
}, {
    charset: 'utf8',
    freezeTableName: true,
    tableName:"k_technology_process_relation",
    timestamps:false,
});

export default technologyProcessRelation;
