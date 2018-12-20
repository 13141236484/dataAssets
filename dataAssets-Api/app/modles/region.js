/**
 * Created by gaoyu at 2018/7/25 下午2:53
 *
 * Desc :
 */
const Sequelize = require('sequelize');

import sequelize from './db';
// 区域表
const region = sequelize.define('k_region', {
	id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
    uuid: { type: Sequelize.STRING(50), allowNull: false,defaultValue:"",comment:"uuid" },
    regional_name: { type: Sequelize.STRING(50), allowNull: false,defaultValue:"",comment:"区域名字" },
    creation_time: { type: Sequelize.INTEGER(11), allowNull: false,defaultValue:"",comment:"创建时间" },
    user_id: { type: Sequelize.INTEGER(11), allowNull: false,defaultValue:"",comment:"创建人" },
    region_remarks: { type: Sequelize.STRING(50), allowNull: false,defaultValue:"",comment:"区域备注" },
    region_status: { type: Sequelize.STRING(50), allowNull: true,defaultValue:1,comment:"(1 特定区域 2不是特定区域)" },
}, {
    charset: 'utf8',
    freezeTableName: true,
    tableName:"k_region",
    timestamps:false,
    classMethods: {
		// 区域入库操作
	    regionCreate: async function(options){
	        return region.create(options);
	    },
	    // 区域名称是否重复
	    isRepeatRegion: async function(regionName,arr = ['id']){
	        return region.findOne({ where:{regional_name:regionName},attributes:arr,raw:true });
	    },
	    // 区域(修改)名称是否重复
	    isRepeatUpdateRegion: async function(options,arr = ['id']){
	        return region.findOne({ where:{uuid:{ne:options.uuid},regional_name:options.regional_name},attributes:arr,raw:true });
	    },
	    // 区域列表数据
	    regionAllData: async function(arr = ['id']){
	        return region.findAll({ attributes:arr,order : [['creation_time', 'DESC']],raw:true });
	    },
	    // 修改区域
	    regionUpdate: async function(options){
        	return region.update( options,{where:{uuid:options.uuid}} );
	    },
	    // 删除区域
	    regionDelete: async function(uuid){
        	return region.destroy({where: {uuid: uuid}});
	    },
    },
});

export default region;
