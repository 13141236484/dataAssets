/**
 * Created by gaoyu at 2018/7/25 下午2:53
 *
 * Desc :
 */
const Sequelize = require('sequelize');

import sequelize from './db';
// 生产工艺批次
const processBatch = sequelize.define('k_process_batch', {
	id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
    uuid: { type: Sequelize.STRING(50), allowNull: false,defaultValue:"",comment:"uuid" },
    batch_name: { type: Sequelize.STRING(50), allowNull: false,defaultValue:"",comment:"工艺名字" },
    creation_time: { type: Sequelize.INTEGER(11), allowNull: false,defaultValue:"",comment:"创建时间" },
    user_id: { type: Sequelize.INTEGER(11), allowNull: false,defaultValue:"",comment:"创建人" },
    batch_remarks: { type: Sequelize.STRING(50), allowNull: false,defaultValue:"",comment:"工艺备注" },
    use_status: { type: Sequelize.STRING(3), allowNull: false,defaultValue:"",comment:"使用状态" },
    beltline_id: { type: Sequelize.STRING(50), allowNull: false,defaultValue:"",comment:"生产线ID" }
}, {
    charset: 'utf8',
    freezeTableName: true,
    tableName:"k_process_batch",
    timestamps:false,
    classMethods: {
		// 生产工艺入库操作
	    productionEngineeringCreate: async function(options){
	        return await processBatch.create(options);
	    },
	    // 生产工艺名称是否重复
	    isRepeatProductionEngineering: async function(productionEngineeringName,beltlineId,arr = ['id']){
	        return await processBatch.findOne({ where:{batch_name:productionEngineeringName,beltline_id:beltlineId},attributes:arr,raw:true });
	    },
	    // 生产工艺(修改)名称是否重复
        isRepeatSaveProductionEngineering: async function(uuid,productionEngineeringName,beltlineId,arr = ['id']){
            return await processBatch.findOne({ where:{uuid:{ne:uuid},batch_name:productionEngineeringName,beltline_id:beltlineId},attributes:arr,raw:true });
        },
	    // 生产工艺列表数据
	    productionEngineeringAllData: async function(options,arr = ['id']){
	        return await processBatch.findAll({ where:{beltline_id:options.beltline_id,batch_name:{$like:'%'+options.batch_name+'%'}},order : [['creation_time', 'DESC']],attributes:arr,raw:true });
	    },
	    // 修改生产工艺
	    productionEngineeringUpdate: async function(options){
        	return await processBatch.update( options,{where:{uuid:options.uuid}} );
	    },
	    // 删除生产工艺
	    productionEngineeringDelete: async function(uuid){
        	return await processBatch.destroy({where: {uuid: uuid}});
	    },
	}
});

export default processBatch;
