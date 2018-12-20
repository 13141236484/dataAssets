/**
 * Created by gaoyu at 2018/7/30 下午2:53
 *
 * Desc :
 */
const Sequelize = require('sequelize');

import sequelize from './db';
// 生产线表
const beltline = sequelize.define('k_beltline', {
	id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
    uuid: { type: Sequelize.STRING(50), allowNull: false,defaultValue:"",comment:"uuid" },
    beltline_name: { type: Sequelize.STRING(50), allowNull: false,defaultValue:"",comment:"生产线名字" },
    creation_time: { type: Sequelize.INTEGER(11), allowNull: false,defaultValue:"",comment:"创建时间" },
    user_id: { type: Sequelize.INTEGER(11), allowNull: false,defaultValue:"",comment:"创建人" },
    beltline_remarks: { type: Sequelize.STRING(50), allowNull: false,defaultValue:"",comment:"生产线备注" }
}, {
    charset: 'utf8',
    freezeTableName: true,
    tableName:"k_beltline",
    timestamps:false,
    classMethods: {
		// 生产线入库操作
	    beltlineCreate: async function(options){
	        return beltline.create(options);
	    },
	    // 生产线名称是否重复
	    isRepeatBeltline: async function(beltlineName,arr = ['id']){
	        return beltline.findOne({ where:{beltline_name:beltlineName},attributes:arr,raw:true });
	    },
	    // 生产线(修改)名称是否重复
        isRepeatUpdateBeltline: async function(uuid,beltlineName,arr = ['id']){
            return beltline.findOne({ where:{uuid:{ne:uuid},beltline_name:beltlineName},attributes:arr,raw:true });
        },
	    // 生产线列表数据
	    beltlineAllData: async function(options,arr = ['id']){
	        return beltline.findAll({ where:{beltline_name:{$like:'%'+options.beltline_name+'%'}},order : [['creation_time', 'DESC']],attributes:arr,raw:true });
	    },
	    // 修改生产线
	    beltlineUpdate: async function(options){
        	return beltline.update( options,{where:{uuid:options.uuid}} );
	    },
	    // 删除生产线
	    beltlineDelete: async function(uuid){
        	return beltline.destroy({where: {uuid: uuid}});
	    },
    },
});

export default beltline;
