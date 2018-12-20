/**
 * Created by gaoyu at 2018/7/30 下午2:53
 *
 * Desc :
 */
const Sequelize = require('sequelize');

import sequelize from './db';
//资产管理表
const assets = sequelize.define('k_assets', {
	id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
    uuid: { type: Sequelize.STRING(50), allowNull: false,defaultValue:"",comment:"uuid" },
    asset_name: { type: Sequelize.STRING(50), allowNull: false,defaultValue:"",comment:"资产名字" },
    region_id: { type: Sequelize.STRING(50), allowNull: false,defaultValue:"",comment:"区域ID" },
    path_id: { type: Sequelize.STRING(50), allowNull: false,defaultValue:"",comment:"路径ID" },
    medium_id: { type: Sequelize.STRING(50), allowNull: false,defaultValue:"",comment:"介质ID" },
    is_cycle: { type: Sequelize.INTEGER(11), allowNull: false,defaultValue:"",comment:"是否有周期（1有 2没有）" },
    start_cycle_time: { type: Sequelize.INTEGER(11), allowNull: false,defaultValue:"",comment:"开始周期时间" },
    end_cycle_time: { type: Sequelize.INTEGER(11), allowNull: false,defaultValue:"",comment:"结束周期时间" },
    enclosure_path: { type: Sequelize.STRING(50), allowNull: false,defaultValue:"",comment:"附件资产" },
    sheif_status: { type: Sequelize.INTEGER(11), allowNull: true,defaultValue:0,comment:"上架状态（1 上架 2 下架）" },
    put_status: { type: Sequelize.STRING(10), allowNull: false,defaultValue:"",comment:">输入（in）输出（out）特殊(special) 没有（no)" },
    creation_time: { type: Sequelize.INTEGER(11), allowNull: false,defaultValue:"",comment:"创建时间" },
    user_id: { type: Sequelize.INTEGER(11), allowNull: false,defaultValue:"",comment:"创建人" },
    asset_remarks: { type: Sequelize.STRING(50), allowNull: false,defaultValue:"",comment:"资产备注" },
    ifstructure: { type: Sequelize.STRING(10), allowNull: true,defaultValue:"no",comment:"有无结构" },
    structure_type_name: { type: Sequelize.STRING(50), allowNull: false,defaultValue:"",comment:"结构类型名称" }
}, {
    charset: 'utf8',
    freezeTableName: true,
    tableName:"k_assets",
    timestamps:false,
    classMethods: {
		// 资产入库操作
	    assetsCreate: async function(options){
	        return await assets.create(options);
	    },
	    // 资产名称是否重复
	    isRepeatAssets: async function(assetsName,arr = ['id']){
	        return await assets.findOne({ where:{asset_name:assetsName},attributes:arr,raw:true });
	    },
        // 资产(修改)名称是否重复
        isRepeatUpdateAssets: async function(uuid,assetsName,arr = ['id']){
            return assets.findOne({ where:{uuid:{ne:uuid},asset_name:assetsName},attributes:arr,raw:true });
        },
	    // 资产列表数据
	    assetsAllData: async function(options,arr = ['id']){
	        return await assets.findAll({ where:options,attributes:arr,order : [['creation_time', 'DESC']],raw:true });
	    },
	    // 修改资产
	    assetsUpdate: async function(options){
        	return await assets.update( options,{where:{uuid:options.uuid}} );
	    },
	    // 删除资产
	    assetsDelete: async function(uuid){
        	return await assets.destroy({where: {uuid: uuid}});
	    },
        // 上架下架切换
        assetsSheif: async function(options,arr = ['sheif_status']){
            let param = {
                sheif_status: options.status
            };
            let sheifRes = await assets.update( param,{where:{uuid:options.uuid}} );
            if(sheifRes){
                return await assets.findOne({ where:{uuid:options.uuid},attributes:arr,raw:true });
            }else{
                return 0;
            }
        },
        // 资产单条数据
        assetsSingle: async function(uuid,arr = ['id']){
            return await assets.findOne({ where:{uuid:uuid},attributes:arr,raw:true });
        },
        // 资产ID获取资产数据
        assetIdAsset: async function(uuid,arr = ['id']){
            return await assets.findAll({ where: {uuid: uuid},attributes:arr,order : [['creation_time', 'DESC']],raw:true });
        },
    },
});

export default assets;
