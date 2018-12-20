/**
 * Created by gaoyu at 2018/7/25 下午2:53
 *
 * Desc :
 */
const Sequelize = require('sequelize');

import sequelize from './db';
//路径表
const path = sequelize.define('k_path', {
	id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
    uuid: { type: Sequelize.STRING(50), allowNull: false,defaultValue:"",comment:"uuid" },
    detailed_path: { type: Sequelize.STRING(50), allowNull: false,defaultValue:"",comment:"路径名字" },
    creation_time: { type: Sequelize.INTEGER(11), allowNull: false,defaultValue:"",comment:"创建时间" },
    user_id: { type: Sequelize.INTEGER(11), allowNull: false,defaultValue:"",comment:"创建人" },
    path_remarks: { type: Sequelize.STRING(50), allowNull: false,defaultValue:"",comment:"路径备注" },
    medium_id: { type: Sequelize.STRING(50), allowNull: false,defaultValue:"",comment:"介质ID" }
}, {
    charset: 'utf8',
    freezeTableName: true,
    tableName:"k_path",
    timestamps:false,
    classMethods: {
		// 路径入库操作
	    pathCreate: async function(options){
	        return await path.create(options);
	    },
	    // 路径名称是否重复
	    isRepeatPath: async function(pathName,mediumId,arr = ['id']){
	        return await path.findOne({ where:{detailed_path:pathName,medium_id:mediumId},attributes:arr,raw:true });
	    },
	    // 路径(修改)名称是否重复
        isRepeatUpdatePath: async function(uuid,mediumId,pathName,arr = ['id']){
            return await path.findOne({ where:{uuid:{ne:uuid},detailed_path:pathName,medium_id:mediumId},attributes:arr,raw:true });
        },
	    // 路径列表数据
	    pathAllData: async function(arr = ['id']){
	        return await path.findAll({ attributes:arr,order : [['creation_time', 'DESC']],raw:true });
	    },
	    // 介质下-路径名称数据
	    mediumPathData: async function(mediumId,arr = ['id']){
	        return await path.findAll({ where:{medium_id:mediumId},attributes:arr,order : [['creation_time', 'DESC']],raw:true });
	    },
	    // 修改路径
	    pathUpdate: async function(options){
        	return await path.update( options,{where:{uuid:options.uuid}} );
	    },
	    // 删除路径
	    pathDelete: async function(uuid){
        	return await path.destroy({where: {uuid: uuid}});
	    },
    },
});

export default path;
