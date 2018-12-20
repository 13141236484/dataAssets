/**
 * Created by gaoyu at 2018/8/15 下午2:53
 *
 * Desc :
 */
const Sequelize = require('sequelize');

import sequelize from './db';
// 过程 依赖关系表
const processDependence = sequelize.define('k_process_dependence', {
	id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
    son_process_id: { type: Sequelize.STRING(60), allowNull: false,defaultValue:"",comment:"依赖者过程ID" },
    par_process_id: { type: Sequelize.STRING(60), allowNull: false,defaultValue:"",comment:"被依赖者过程ID" }
}, {
    charset: 'utf8',
    freezeTableName: true,
    tableName:"k_process_dependence",
    timestamps:false,
    classMethods: {
		// 依赖关系生产过程入库操作
	    processDependenceCreate: async function(options){
	        return await processDependence.bulkCreate(options);
	    }
    },
});

export default processDependence;
