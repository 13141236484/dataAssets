/**
 * Created by gaoyu at 2018/7/30 下午2:53
 *
 * Desc :
 */
const Sequelize = require('sequelize');

import sequelize from './db';
// 生产过程表
const productionProcess = sequelize.define('k_production_process', {
	id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
    uuid: { type: Sequelize.STRING(50), allowNull: false,defaultValue:"",comment:"uuid" },
    process_name: { type: Sequelize.STRING(50), allowNull: false,defaultValue:"",comment:"生产过程名字" },
    creation_time: { type: Sequelize.INTEGER(11), allowNull: false,defaultValue:"",comment:"创建时间" },
    user_id: { type: Sequelize.INTEGER(11), allowNull: false,defaultValue:"",comment:"创建人" },
    process_remarks: { type: Sequelize.STRING(50), allowNull: false,defaultValue:"",comment:"生产过程备注" },
    use_status: { type: Sequelize.STRING(3), allowNull: false,defaultValue:"",comment:"使用状态" },
    batch_id: { type: Sequelize.STRING(50), allowNull: false,defaultValue:"",comment:"生产过程ID" },
    start_state: { type: Sequelize.INTEGER(1), allowNull: true,defaultValue:2,comment:"起始状态" },
}, {
    charset: 'utf8',
    freezeTableName: true,
    tableName:"k_production_process",
    timestamps:false,
    classMethods: {
		// 生产过程入库操作
	    productionProcessCreate: async function(options){
	        return await productionProcess.create(options);
	    },
	    // 生产过程名称是否重复
	    isRepeatProductionProcess: async function(productionProcessName,batchId,arr = ['id']){
	        return await productionProcess.findOne({ where:{process_name:productionProcessName,batch_id:batchId},attributes:arr,raw:true });
	    },
	    // 生产过程(修改)名称是否重复
        isRepeatSaveProductionProcess: async function(uuid,productionProcessName,batchId,arr = ['id']){
            return await productionProcess.findOne({ where:{uuid:{ne:uuid},process_name:productionProcessName,batch_id:batchId},attributes:arr,raw:true });
        },
	    // 生产过程列表数据
	    productionProcessAllData: async function(options,arr = ['id']){
	        return await productionProcess.findAll({ where:{batch_id:options.batch_id},attributes:arr,order : [['creation_time', 'DESC']],raw:true });
	    },
	    // 修改生产过程
	    productionProcessUpdate: async function(options){
        	return await productionProcess.update( options,{where:{uuid:options.uuid}} );
	    },
	    // 删除生产过程
	    productionProcessDelete: async function(uuid){
        	return await productionProcess.destroy({where: {uuid: uuid}});
	    },
	    // 生产工艺ID获取生产过程数据
	    engineerIdProcess: async function(uuid,arr = ['id']){
        	return await productionProcess.findAll({ where: {batch_id: uuid},attributes:arr,order : [['creation_time', 'DESC']],raw:true });
	    },
	    // 依赖->过程数据列表
	    relyOnProcessList: async function(options,arr = ['id']){
        	return await productionProcess.findAll({ where: {batch_id: options.technology_id,uuid: {$ne: options.process_id}},attributes:arr,order : [['creation_time', 'DESC']],raw:true });
	    },
    },
});

export default productionProcess;
