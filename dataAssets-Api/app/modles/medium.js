/**
 * Created by gaoyu at 2018/7/25 下午2:53
 *
 * Desc :
 */
const Sequelize = require('sequelize');

import sequelize from './db';
// 介质表
const medium = sequelize.define('k_medium', {
	id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
    uuid: { type: Sequelize.STRING(50), allowNull: false,defaultValue:"",comment:"uuid" },
    medium_name: { type: Sequelize.STRING(50), allowNull: false,defaultValue:"",comment:"介质名字" },
    medium_type_name: { type: Sequelize.STRING(50), allowNull: false,defaultValue:"",comment:"介质分类名称" },
    medium_example: { type: Sequelize.TEXT(0), allowNull: false,defaultValue:"",comment:"介质实例" },
    creation_time: { type: Sequelize.INTEGER(11), allowNull: false,defaultValue:"",comment:"创建时间" },
    user_id: { type: Sequelize.INTEGER(11), allowNull: false,defaultValue:"",comment:"创建人" },
    medium_remarks: { type: Sequelize.STRING(100), allowNull: false,defaultValue:"",comment:"介质备注" },
    region_id: { type: Sequelize.STRING(50), allowNull: false,defaultValue:"",comment:"区域ID" }
}, {
    charset: 'utf8',
    freezeTableName: true,
    tableName:"k_medium",
    timestamps:false,
    classMethods: {
		// 介质入库操作
	    mediumCreate: async function(options){
	        return await medium.create(options);
	    },
	    // 介质名称是否重复
	    isRepeatMedium: async function(mediumName,arr = ['id']){
	        return await medium.findOne({ where:{medium_name:mediumName},attributes:arr,raw:true });
	    },
	    // 介质(修改)名称是否重复
        isRepeatUpdateMedium: async function(uuid,mediumName,arr = ['id']){
            return await medium.findOne({ where:{uuid:{ne:uuid},medium_name:mediumName},attributes:arr,raw:true });
        },
	    // 介质列表数据
	    mediumAllData: async function(regionId,arr = ['id']){
	        return await medium.findAll({ where:{region_id:regionId},attributes:arr,order : [['creation_time', 'DESC']],raw:true });
	    },
	    // 修改介质
	    mediumUpdate: async function(options){
        	return await medium.update( options,{where:{uuid:options.uuid}} );
	    },
	    // 删除介质
	    mediumDelete: async function(uuid){
        	return await medium.destroy({where: {uuid: uuid}});
	    },
	    // 查看单条介质
	    mediumSingle: async function(mediumId,arr = ['id']){
	        return await medium.findOne({ where:{uuid:mediumId},attributes:arr,raw:true });
	    },
    },
});

export default medium;
