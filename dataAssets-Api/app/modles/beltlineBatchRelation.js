/**
 * Created by gaoyu at 2018/7/25 下午2:53
 *
 * Desc :
 */
const Sequelize = require('sequelize');

import sequelize from './db';
//生产线、生产工艺 关联表
const beltlineBatchRelation = sequelize.define('k_beltline_batch_relation', {
	id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
    beltline_id: { type: Sequelize.INTEGER(11), allowNull: false,defaultValue:"",comment:"生产线ID" },
    batch_id: { type: Sequelize.INTEGER(11), allowNull: false,defaultValue:"",comment:"生产工艺ID" }
}, {
    charset: 'utf8',
    freezeTableName: true,
    tableName:"k_beltline_batch_relation",
    timestamps:false,
});

export default beltlineBatchRelation;
