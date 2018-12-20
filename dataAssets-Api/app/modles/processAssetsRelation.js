/**
 * Created by gaoyu at 2018/7/25 下午2:53
 *
 * Desc :
 */
const Sequelize = require('sequelize');

import sequelize from './db';
//生产过程、数据资产 关联表
const processAssetsRelation = sequelize.define('k_process_assets_relation', {
	id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
    process_id: { type: Sequelize.STRING(60), allowNull: false,defaultValue:"",comment:"生产过程ID" },
    asset_id: { type: Sequelize.STRING(60), allowNull: false,defaultValue:"",comment:"资产ID" },
    put_status: { type: Sequelize.STRING(10), allowNull: false,defaultValue:"",comment:"状态" }
}, {
    charset: 'utf8',
    freezeTableName: true,
    tableName:"k_process_assets_relation",
    timestamps:false,
});

export default processAssetsRelation;
