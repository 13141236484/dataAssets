/**
 * Created by gaoyu at 2018/7/30 下午2:53
 *
 * Desc :
 */
import {assets,region,path,medium,productionProcess,processDependence,processAssetsRelation} from '../../modles';
import {isEmpty,getSecond} from '../../utils/importUtils';
import {NET,MANAGER_LIMIT,TXTURl,ALLOWTYPE} from "../../config/config";
import sequelize from '../../modles/db'
const { uploadFiles } = require('../../utils/upload')
//验证参数
const schema = require('../../modles/schema');
//唯一编码
const uuidv4 = require('uuid/v4');
const koaSend = require('koa-send');

const fs = require('fs');
const paths = require('path')

const iconv = require('iconv-lite');
const validator = require('validator');

/**
 * @api {post} /assets/assetsCreate   添加资产
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName assetsCreate
 * @apiGroup assets
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/assets/assetsCreate'
 * @apiParam {String} assetsName                   资产名称.
 * @apiParam {String} regionId                     区域ID.
 * @apiParam {String} pathId                       路径ID.
 * @apiParam {String} mediumId                     介质ID.
 * @apiParam {Integer} isCycle                     是否有周期（1有 2没有）.
 * @apiParam {Integer} start_cycle_time            开始周期时间.
 * @apiParam {Integer} end_cycle_time              结束周期时间.
 * @apiParam {String} enclosurePath                附件路径.
 * @apiParam {String} assetsRemark                 资产备注.
 * @apiParam {String} ifStructure                  有无结构（有 yes, 无 no）.
 * @apiParam {String} structureTypeName            结构类型名称.
 *
 * @apiSampleRequest /assets/assetsCreate
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function assetsCreate(ctx) {
    try {
        let uuid = uuidv4();
        // 参数
        let assetsName = ctx.request.body.assetsName || '';
        let regionId = ctx.request.body.regionId || '';
        let pathId = ctx.request.body.pathId || '';
        let mediumId = ctx.request.body.mediumId || '';
        let isCycle = parseInt(ctx.request.body.isCycle);
        let start_cycle_time = parseInt(ctx.request.body.start_cycle_time) || 0;
        let end_cycle_time = parseInt(ctx.request.body.end_cycle_time) || 0;
        let enclosurePath = ctx.request.body.enclosurePath || '';
        // let sheifStatus = parseInt(ctx.request.body.sheifStatus);
        // let putStatus = ctx.request.body.putStatus;
        let assetsRemark = ctx.request.body.assetsRemark || '';
        let ifStructure = ctx.request.body.ifStructure || '';
        let structureTypeName = ctx.request.body.structureTypeName || '';
        // 用户信息
        let currentUser = ctx.state.user;
        // 验证是否是输出区域
        let regionData = await region.findOne({ where:{uuid:regionId},attributes:['region_status'],raw:true });
        // 所有状态->输入（in）输出（out）特殊(special) 没有（no)
        if(regionData.region_status == 1){
            var putStatus = 'special';
        }else if(regionData.region_status == 2){
            var putStatus = 'no';
        }else{
            var putStatus = '';
        }
        let options = {
        	uuid: uuid,
	    	asset_name: assetsName,
	    	region_id: regionId,
	    	path_id: pathId,
	    	medium_id: mediumId,
	    	is_cycle: isCycle,
	    	start_cycle_time: start_cycle_time,
	    	end_cycle_time: end_cycle_time,
	    	enclosure_path: enclosurePath,
	    	// sheif_status: sheifStatus,
	    	put_status: putStatus,
	    	creation_time: getSecond(),
	    	user_id: currentUser.id,
	    	asset_remarks: assetsRemark,
            ifstructure: ifStructure,
            structure_type_name: structureTypeName
	    };
	    // 验证参数
	    schema.validate(options, schema.assetsCreate);
        // 验证上传的文件格式
        if(enclosurePath){
            var jsonObjString=fs.readFileSync(TXTURl + enclosurePath);
            var str = iconv.decode(jsonObjString, 'gbk');
            if (!validator.isJSON(str)){
                return ctx.body = NET.error("必须是Json格式，外层不能有双引号！");
            } else {
                var  obj3 = JSON.parse(str);
                if(obj3.hasOwnProperty('name') && obj3.hasOwnProperty('type')){
                    console.log(obj3.name)
                }else{
                    return ctx.body = NET.error("JSON格式缺少字段！!");
                }
            }
        }
        // 判断是否有重复资产名称
	    let repeatData = await assets.isRepeatAssets(assetsName,['asset_name']);
	    if(repeatData){ ctx.body = NET.error("资产名称不可重复!");return; }
        // 判断资产名称和过程名称是否重复
        let processData = await productionProcess.findOne({ where:{process_name:assetsName},attributes:['process_name'],raw:true });
        if(processData){ ctx.body = NET.error("资产名称与过程名称不可重复!");return; }
        let assetsal = await assets.assetsCreate(options);
        if(!assetsal){
	        ctx.body = NET.error("添加资产失败");return;
	    }
	    ctx.body = NET.success("添加资产成功");
    } catch (e) {
    	console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
/**
 * @api {post} /assets/assetsList   资产列表
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName assetsList
 * @apiGroup assets
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/assets/assetsList'
 * @apiParam {String}  assetsName            	   资产名称.
 * @apiParam {String} regionId                    区域ID.
 * @apiParam {String} mediumId                    介质ID.
 * @apiParam {Integer} start_cycle_time            开始周期时间.
 * @apiParam {Integer} end_cycle_time              结束周期时间.
 * @apiParam {Integer} sheifStatus                 上架状态（1上架 2下架）.
 * @apiParam {Integer} page                  	   页码.
 *
 * @apiSampleRequest /assets/assetsList
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function assetsList(ctx) {
    try {
    	// 搜索参数
	    let assetsName = ctx.request.body.assetsName.replace(/(^\s*)|(\s*$)/g,"");
	    let regionId = ctx.request.body.regionId || '';
	    let mediumId = ctx.request.body.mediumId || '';
	    let start_cycle_time = parseInt(ctx.request.body.start_cycle_time) || 0;
	    let end_cycle_time = parseInt(ctx.request.body.end_cycle_time) || 0;
	    let sheifStatus = parseInt(ctx.request.body.sheifStatus) || 0;
	    let page = ctx.request.body.page ? ctx.request.body.page : 1;
        let time = new Date().getTime();
        // 查询出所有资产数据
        let assetsIds = await assets.findAll({ where:{end_cycle_time:{lte:time},is_cycle: 1,sheif_status:{ne: 2}},attributes:['uuid'],raw:true });
        // 所有资产ID
        let assetsArr = assetsIds.map(function(modle){
            return modle.uuid;
        });
        if(assetsArr.length){
            await assets.update( {sheif_status: 2},{where:{uuid:assetsArr}} );
        }

        //操作查询列表数据
        let options = {
            assetsName,regionId,mediumId,start_cycle_time,end_cycle_time,sheifStatus,page
        };
        //资产总条数
        let sqlcount= await getAssetsSql(options,true);
        let count = await sequelize.query(sqlcount,{
            type: sequelize.QueryTypes.SELECT ,
            replacements:{
                assetsName:'%'+assetsName+'%',
                regionId: regionId,
                mediumId: mediumId,
                start_cycle_time: start_cycle_time,
                end_cycle_time: end_cycle_time,
                sheifStatus: sheifStatus
            }
        });
        //资产数据
        let sql= await getAssetsSql(options,false);
        let assetsData = await sequelize.query(sql,{
            type: sequelize.QueryTypes.SELECT,
            replacements:{
                assetsName:'%'+assetsName+'%',
                regionId: regionId,
                mediumId: mediumId,
                start_cycle_time: start_cycle_time,
                end_cycle_time: end_cycle_time,
                sheifStatus: sheifStatus
            }
        });
	    ctx.body = NET.success({assetsData,count},"资产列表");
    } catch (e) {
        console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
//资产列表 获取where条件
async function getAssetsSql(obj,isCount = false){
    let sql = "SELECT";
    //资产总条数
    isCount && (sql += " count(a.id) AS count ");
    //资产数据
    !isCount && (sql +=" a.uuid,a.asset_name,a.is_cycle,a.start_cycle_time,a.end_cycle_time,a.sheif_status,a.creation_time,a.asset_remarks,a.path_id,a.medium_id,a.region_id,a.enclosure_path,a.ifstructure,a.structure_type_name,d.username ");
    sql += " FROM k_assets AS a, k_admin_users AS d ";
    sql += " WHERE a.user_id=d.id ";
    //资产名称搜索
    sql += obj.assetsName ? " AND a.asset_name LIKE :assetsName " : "";
    //区域搜索
    sql += obj.regionId ? " AND a.region_id=:regionId " : "";
    //介质搜索
    sql += obj.mediumId ? " AND a.medium_id=:mediumId " : "";
    //上架下架搜索
    sql += obj.sheifStatus ? " AND a.sheif_status=:sheifStatus " : "";
    //时间周期
    if(obj.start_cycle_time && !obj.end_cycle_time){
        sql += " AND start_cycle_time>=:start_cycle_time ";
    }else if(obj.end_cycle_time && !obj.start_cycle_time){
        sql += " AND end_cycle_time<=:end_cycle_time ";
    }else if(obj.start_cycle_time && obj.end_cycle_time){
        sql += " AND start_cycle_time>=:start_cycle_time AND end_cycle_time<=:end_cycle_time ";
    }else{
        sql += '';
    }
    sql += " ORDER BY a.sheif_status ASC, a.creation_time DESC ";
    const countLimit = MANAGER_LIMIT;
    //偏移量
    const offset = (parseInt(obj.page)-1)*countLimit;
    !isCount && (sql += " LIMIT "+offset+","+countLimit);
    return sql;
}
/**
 * @api {post} /assets/assetsUpdate   修改资产
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName assetsUpdate
 * @apiGroup assets
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/assets/assetsUpdate'
 * @apiParam {String} uuid                   	   唯一编码.
 * @apiParam {String} assetsName                   资产名称.
 * @apiParam {String} regionId                     区域ID.
 * @apiParam {String} pathId                       路径ID.
 * @apiParam {String} mediumId                     介质ID.
 * @apiParam {Integer} isCycle                     是否有周期（1有 2没有）.
 * @apiParam {Integer} start_cycle_time            开始周期时间.
 * @apiParam {Integer} end_cycle_time              结束周期时间.
 * @apiParam {String} enclosurePath                附件路径.
 * @apiParam {String} assetsRemark                 资产备注.
 * @apiParam {String} ifStructure                  有无结构（有 yes, 无 no）.
 * @apiParam {String} structureTypeName            结构类型名称.
 *
 *
 * @apiSampleRequest /assets/assetsUpdate
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function assetsUpdate(ctx) {
    try {
        // 唯一编码
        let uuid = ctx.request.body.uuid;
	    // 参数
        let assetsName = ctx.request.body.assetsName || '';
        let regionId = ctx.request.body.regionId || '';
        let pathId = ctx.request.body.pathId || '';
        let mediumId = ctx.request.body.mediumId || '';
        let isCycle = parseInt(ctx.request.body.isCycle);
        let start_cycle_time = parseInt(ctx.request.body.start_cycle_time) || 0;
        let end_cycle_time = parseInt(ctx.request.body.end_cycle_time) || 0;
        let enclosurePath = ctx.request.body.enclosurePath;
        // let sheifStatus = parseInt(ctx.request.body.sheifStatus);
        // let putStatus = ctx.request.body.putStatus;
        let assetsRemark = ctx.request.body.assetsRemark || '';
        let ifStructure = ctx.request.body.ifStructure || '';
        let structureTypeName = ctx.request.body.structureTypeName || '';
        // 验证是否是输出区域
        let regionData = await region.findOne({ where:{uuid:regionId},attributes:['region_status'],raw:true });
        if(regionData.region_status == 1){
            var putStatus = 'special';
        }else if(regionData.region_status == 2){
            var putStatus = 'no';
        }else{
            var putStatus = '';
        }
        let options = {
        	uuid: uuid,
	    	asset_name: assetsName,
	    	region_id: regionId,
	    	path_id: pathId,
	    	medium_id: mediumId,
	    	is_cycle: isCycle,
	    	start_cycle_time: start_cycle_time,
	    	end_cycle_time: end_cycle_time,
	    	enclosure_path: enclosurePath,
	    	// sheif_status: sheifStatus,
	    	put_status: putStatus,
	    	creation_time: getSecond(),
	    	asset_remarks: assetsRemark,
            ifstructure: ifStructure,
            structure_type_name: structureTypeName
	    };
	    // 验证参数
	    schema.validate(options, schema.assetsUpdate);
        // 验证上传的文件格式
        if(enclosurePath){
            var jsonObjString=fs.readFileSync(TXTURl + enclosurePath);
            var str = iconv.decode(jsonObjString, 'gbk');
            if (!validator.isJSON(str)){
                return ctx.body = NET.error("JSON格式异常！请重新编写!");
            } else {
                var  obj3 = JSON.parse(str);
                if(obj3.hasOwnProperty('name') && obj3.hasOwnProperty('type')){
                    console.log(obj3.name)
                }else{
                    return ctx.body = NET.error("JSON格式缺少字段！!");
                }
            }
        }
	    // 判断是否有重复资产名称
	    let repeatData = await assets.isRepeatUpdateAssets(uuid,assetsName,['asset_name']);
	    if(repeatData){ ctx.body = NET.error("资产名称不可重复!");return; }
        // 判断资产名称和过程名称是否重复
        let processData = await productionProcess.findOne({ where:{process_name:assetsName},attributes:['process_name'],raw:true });
        if(processData){ ctx.body = NET.error("资产名称与过程名称不可重复!");return; }
        let assetsal = await assets.assetsUpdate(options);
        if(!assetsal){
	        ctx.body = NET.error("修改资产失败");return;
	    }
	    ctx.body = NET.success("修改资产成功");
    } catch (e) {
    	console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
/**
 * @api {post} /assets/assetsDelete   删除资产
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName assetsDelete
 * @apiGroup assets
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/assets/assetsDelete'
 * @apiParam {String} uuid                   	   唯一编码.
 *
 * @apiSampleRequest /assets/assetsDelete
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function assetsDelete(ctx) {
    try {
        // 参数
        let uuid = ctx.request.body.uuid;
        let options = {
        	uuid: uuid
	    };
	    // 验证参数
	    schema.validate(options, schema.commonParametersUuid);
        let assetsal = await assets.assetsDelete(uuid);
        if(!assetsal){
	        ctx.body = NET.error("删除资产失败");return;
	    }
	    ctx.body = NET.success("删除资产成功");
    } catch (e) {
    	console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}

/**
 * @api {post} /assets/assetsSheif   上架下架切换
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName assetsSheif
 * @apiGroup assets
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/assets/assetsSheif'
 * @apiParam {String} uuid                            唯一编码.
 * @apiParam {Integer} isCycle                        是否有周期（1有 2没有）.
 * @apiParam {Integer} status                         上架状态（1上架 2下架）.
 *
 * @apiSampleRequest /assets/assetsSheif
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function assetsSheif(ctx) {
    try {
        // 参数
        let uuid = ctx.request.body.uuid;
        let isCycle = parseInt(ctx.request.body.isCycle);
        let status = parseInt(ctx.request.body.status);
        let options = {
            uuid: uuid,
            is_cycle: isCycle,
            status: status
        };
        // 验证参数
        schema.validate(options, schema.assetsSheif);
        let time = new Date().getTime();
        if(isCycle == 1){
            let assetsData = await assets.findOne({ where:{end_cycle_time:{lte:time},uuid: uuid},attributes:['sheif_status'],raw:true });
            if(assetsData && status == 1){
                ctx.body = NET.error("周期结束时间已结束，不可上架！");return;
            }
            var assetsSheifStatus = await assets.assetsSheif(options);
        }else if(isCycle == 2){
            var assetsSheifStatus = await assets.assetsSheif(options);
        }else{
            return ctx.body = NET.error("周期参数错误");
        }
        if(!assetsSheifStatus){
            ctx.body = NET.error("切换状态失败");return;
        }
        ctx.body = NET.success("切换状态成功");
    } catch (e) {
        console.log(e)
        if (e.name === 'ValidationError') {
            return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}

/**
 * @api {post} /assets/assetsSingle   资产单条数据
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName assetsSingle
 * @apiGroup assets
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/assets/assetsSingle'
 * @apiParam {String} uuid                            唯一编码.
 *
 * @apiSampleRequest /assets/assetsSingle
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function assetsSingle(ctx) {
    try {
        // 参数
        let uuid = ctx.request.body.uuid;
        let options = {
            uuid: uuid
        };
        // 验证参数
        schema.validate(options, schema.commonParameters);
        // 
        let assetsData = await assets.assetsSingle(uuid,['region_id','medium_id','path_id']);

        // 区域
        let regionData = await region.findOne({ where:{uuid:assetsData.region_id},attributes:['regional_name'],raw:true });
        // 路径
        let pathData = await path.findOne({ where:{uuid:assetsData.path_id},attributes:['detailed_path'],raw:true });
        // 介质
        let mediumData = await medium.findOne({ where:{uuid:assetsData.medium_id},attributes:['medium_name'],raw:true });

        let sql = "SELECT";
        sql += " a.uuid,a.asset_name,a.medium_id,a.creation_time,a.enclosure_path,e.username ";
        if(regionData){
            sql += " ,b.regional_name ";
        }else{
            sql += " ";
        }
        if(pathData){
            sql += " ,c.detailed_path ";
        }else{
            sql += " ";
        }
        if(mediumData){
            sql += " ,d.medium_name ";
        }else{
            sql += " ";
        }
        sql += " FROM k_assets AS a, k_admin_users AS e ";
        if(regionData){
            sql += " , k_region AS b ";
        }else{
            sql += " ";
        }
        if(pathData){
            sql += " , k_path AS c ";
        }else{
            sql += " ";
        }
        if(mediumData){
            sql += " , k_medium AS d ";
        }else{
            sql += " ";
        }
        sql += " WHERE a.user_id=e.id ";
        if(regionData){
            sql += " AND a.region_id=b.uuid ";
        }else{
            sql += " ";
        }
        if(pathData){
            sql += " AND a.path_id=c.uuid ";
        }else{
            sql += " ";
        }
        if(mediumData){
            sql += " AND a.medium_id=d.uuid ";
        }else{
            sql += " ";
        }
        sql += " AND a.uuid=:uuid ";
        let assetsSingleData = await sequelize.query(sql,{
            type: sequelize.QueryTypes.SELECT,
            replacements:{
                uuid:uuid
            }
        });
        if(assetsSingleData.length){
            if(!regionData){
               assetsSingleData[0].regional_name = '';
            }
            if(!pathData){
                assetsSingleData[0].detailed_path = '';
            }
            if(!mediumData){
                assetsSingleData[0].medium_name = '';
            }
        }
        ctx.body = NET.success({assetsSingleData},"资产单条数据");
    } catch (e) {
        console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
/**
 * @api {post} /assets/assetsAllList   (关联页)资产数据列表
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName assetsAllList
 * @apiGroup assets
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/assets/assetsAllList'
 * @apiParam {String} processId                         过程唯一编码.
 * @apiParam {String} regionId                          区域ID.
 * @apiParam {String} pathId                            路径ID.
 * @apiParam {String} mediumId                          介质ID.
 *
 * @apiSampleRequest /assets/assetsAllList
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function assetsAllList(ctx) {
    try {
        // 过程ID参数
        let processId = ctx.request.body.processId;
        // 验证参数
        schema.validate({uuid: processId}, schema.commonParameters);
        // 搜索参数
        let regionId = ctx.request.body.regionId;
        let pathId = ctx.request.body.pathId;
        let mediumId = ctx.request.body.mediumId;
        // 查询过程是否是起始过程
        let productionProcessData = await productionProcess.findOne({ where:{uuid:processId},attributes:['start_state','process_name'],raw:true });
        if(productionProcessData){
            if(productionProcessData.start_state == 1){
                var assetIdArr = [];
                // 资产数据
                var sql= await getAssetsAllSql({regionId: regionId,pathId: pathId,mediumId: mediumId,state: 0});
            }else if(productionProcessData.start_state == 2){
                // 根据过程ID查询出 被依赖的过程ID
                let parProcessIdS = await processDependence.findAll({ where:{son_process_id:processId},attributes:['par_process_id'],raw:true });
                let parProcessIdArr = parProcessIdS.map(function(modle){
                    return modle.par_process_id;
                });
                // 如果有被依赖者的uuid
                if(parProcessIdArr.length){
                    // 查询出被依赖者 输出的资产ID
                    let assetIdS = await processAssetsRelation.findAll({ where:{process_id:parProcessIdArr, put_status:'out'},attributes:['asset_id'],raw:true });
                    var assetIdArr = assetIdS.map(function(modle){
                        return modle.asset_id;
                    });
                    if(assetIdArr.length){
                        // 资产数据
                        var sql= await getAssetsAllSql({regionId: regionId,pathId: pathId,mediumId: mediumId,state: 1});
                    }else{
                        var sql= await getAssetsAllSql({regionId: regionId,pathId: pathId,mediumId: mediumId,state: 2});
                    }
                }else{
                    var assetIdArr = [];
                    // 资产数据
                    var sql= await getAssetsAllSql({regionId: regionId,pathId: pathId,mediumId: mediumId,state: 2});
                }
            }else{
                return ctx.body = NET.error("过程有误！");
            }
            var assetsData = await sequelize.query(sql,{
                type: sequelize.QueryTypes.SELECT,
                replacements:{
                    regionId: regionId,
                    pathId: pathId,
                    mediumId: mediumId,
                    assetId: assetIdArr
                }
            });
            ctx.body = NET.success({assetsData,productionProcessData},"(关联页)资产数据列表");
        }else{
            return ctx.body = NET.error("非法操作！");
        }
    } catch (e) {
        console.log(e)
        if (e.name === 'ValidationError') {
            return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
//(关联页)资产数据列表 获取where条件
async function getAssetsAllSql(obj){
    let sql = "SELECT uuid,asset_name,put_status";
    //资产数据
    sql += " FROM k_assets where sheif_status=1 ";
    //区域搜索
    sql += obj.regionId ? " AND region_id=:regionId " : "";
    //介质搜索
    sql += obj.pathId ? " AND path_id=:pathId " : "";
    //上架下架搜索
    sql += obj.mediumId ? " AND medium_id=:mediumId " : "";
    //是否全部
    if(obj.state==1){
        sql += " AND ((uuid in(:assetId)) OR put_status='special' OR put_status='no') ";
    }
    if(obj.state==2){
        sql += " AND (put_status='special' OR put_status='no') ";
    }
    sql += " ORDER BY creation_time DESC ";
    return sql;
}
/**
 * @api {post} /assets/assetSpecificationList   (详单)资产数据列表
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName assetSpecificationList
 * @apiGroup assets
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/assets/assetSpecificationList'
 * @apiParam {String} processId                    过程uuID.
 *
 * @apiSampleRequest /assets/assetSpecificationList
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function assetSpecificationList(ctx) {
    try {
        // 参数
        let processId = ctx.request.body.processId;
        let options = {
            uuid: processId
        };
        // 验证参数
        schema.validate(options, schema.commonParametersUuid);
        //资产数据
        const sql= await getProcessAssetsSql(options);
        const assetsData = await sequelize.query(sql,{
            type: sequelize.QueryTypes.SELECT,
            replacements:{
                processId: processId
            }
        });
        ctx.body = NET.success({assetsData},"(详单)资产数据列表");
    } catch (e) {
        console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
//(详单)资产数据列表 获取where条件
async function getProcessAssetsSql(obj){
    let sql = "SELECT a.uuid,a.asset_name,b.put_status";
    //资产数据
    sql += " FROM k_assets AS a, k_process_assets_relation AS b where a.uuid=b.asset_id AND b.process_id=:processId ";
    sql += " ORDER BY a.creation_time DESC ";
    return sql;
}
/**
 * @api {post} /assets/assetInOutList   (关联页)输入、输出数据
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName assetInOutList
 * @apiGroup assets
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/assets/assetInOutList'
 * @apiParam {String} processId                    过程uuID.
 *
 * @apiSampleRequest /assets/assetInOutList
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function assetInOutList(ctx) {
    try {
        // 参数
        let processId = ctx.request.body.processId;
        let input  = 'in';
        let output = 'out';
        let options = {
            uuid: processId
        };
        // 验证参数
        schema.validate(options, schema.commonParameters);
        // 取出资产输入->关联表资产ID
        let inputAssetId = await processAssetsRelation.findAll({ where: {process_id: processId,put_status: input},attributes:['asset_id'],raw:true });
        let inputAssetIdArr = inputAssetId.map(function(modle){
            return modle.asset_id;
        });
        // 取出输入 资产数据
        let assetsInputData = await assets.findAll({ where: {uuid: inputAssetIdArr},attributes:['uuid','asset_name'],raw:true });
        for(let value of Object.values(assetsInputData)){
            value.put_status = 'in';
            value.process_id = processId;
        }
        // 取出资产输出->关联表资产ID
        let outputAssetId = await processAssetsRelation.findAll({ where: {process_id: processId,put_status: output},attributes:['asset_id'],raw:true });
        let outputAssetIdArr = outputAssetId.map(function(modle){
            return modle.asset_id;
        });
        // 取出输出 资产数据
        let assetsOutputData = await assets.findAll({ where: {uuid: outputAssetIdArr},attributes:['uuid','asset_name'],raw:true });
        for(let value of Object.values(assetsOutputData)){
            value.put_status = 'out';
            value.process_id = processId;
        }
        ctx.body = NET.success({assetsInputData,assetsOutputData},"(详单)输入、输出数据");
    } catch (e) {
        console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}

/**
 * @api {post} /assets/uploadFile   资产上传 avsc
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName uploadFile
 * @apiGroup assets
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/assets/uploadFile'
 *
 * @apiSampleRequest /assets/uploadFile
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function uploadFile(ctx,next) {
    try {
        if ('POST' != ctx.method) return await next();
        let uuid = uuidv4();
        // 上传单个文件
        let file = ctx.request.files.file;// 获取上传文件
        // 创建可读流
        let reader = fs.createReadStream(file.path);
        // txt 文件所在文件夹全路径
        let yamlPath = TXTURl + uuid + "/";
        // 建立目录
        confirmPath(yamlPath);
        let filePath = yamlPath + `${file.name}`;
        // 创建可写流
        let upStream = fs.createWriteStream(filePath);
        // 可读流通过管道写入可写流
        reader.pipe(upStream);
        // 入库路径
        let assetsFile = uuid + "/" + `${file.name}`;
        console.log(filePath)
        ctx.body = NET.success({assetsFile},"上传成功！");
    } catch (e) {
        console.log(e)
        if (e.name === 'ValidationError') {
            return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
function confirmPath(pathStr) {
    if (fs.existsSync(pathStr)) {
        return true
    } else {
        if (confirmPath(paths.dirname(pathStr))) {
            fs.mkdirSync(pathStr)
            return true
        }
    }
}
/**
 * @api {post} /assets/exportTxtFile 下载模板 
 * @apiPermission 知识体系库
 * @apiVersion 1.0.0
 * @apiName exportTxtFile
 * @apiGroup assets
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{}'
 * 'http://localhost:3000/assets/exportTxtFile'
 * @apiParam {String} txtPath                  txt 文件的路径.
 *
 *
 * @apiSampleRequest /assets/exportTxtFile
 * @apiSuccessExample {json} Response 200 Example
 *     HTTP/1.1 200 OK
 *
 
 *
 * @apiUse ERROR
 */
export async function exportTxtFile(ctx) {
    try {
        let txtPath = ctx.request.body.txtPath;
        let options = {
                uuid: txtPath
            };
        // 验证参数
        schema.validate(options, schema.commonParameters);
        ctx.attachment(txtPath);
        await koaSend(ctx, txtPath);
    } catch (e) {
        console.log(e)
        if (e.name === 'ValidationError') {
            return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
/**
 * @api {post} /assets/fileTxtContent 资产（读取avsc）
 * @apiPermission 知识体系库
 * @apiVersion 1.0.0
 * @apiName fileTxtContent
 * @apiGroup assets
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{}'
 * 'http://localhost:3000/assets/fileTxtContent'
 * @apiParam {String} txtPath                  txt 文件的路径.
 *
 *
 * @apiSampleRequest /assets/fileTxtContent
 * @apiSuccessExample {json} Response 200 Example
 *     HTTP/1.1 200 OK
 *
 
 *
 * @apiUse ERROR
 */
export async function fileTxtContent(ctx) {
    try {
        let txtPath = ctx.request.body.txtPath;
        let options = {
                uuid: txtPath
            };
        // 验证参数
        schema.validate(options, schema.commonParameters);
        let content = fs.readFileSync(TXTURl + txtPath, 'utf8');
        ctx.body = NET.success({content},"内容");
    } catch (e) {
        console.log(e)
        if (e.name === 'ValidationError') {
            return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
/**
 * @api {post} /assets/writeFileTxtContent 资产（写入内容avsc）
 * @apiPermission 知识体系库
 * @apiVersion 1.0.0
 * @apiName writeFileTxtContent
 * @apiGroup assets
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{}'
 * 'http://localhost:3000/assets/writeFileTxtContent'
 * @apiParam {String} content                  content.
 * @apiParam {String} txtPath                  txt 文件的路径.
 *
 *
 * @apiSampleRequest /assets/writeFileTxtContent
 * @apiSuccessExample {json} Response 200 Example
 *     HTTP/1.1 200 OK
 *
 
 *
 * @apiUse ERROR
 */
export async function writeFileTxtContent(ctx) {
    try {
        let content = ctx.request.body.content;
        let txtPath = ctx.request.body.txtPath;
        let options = {
                content: content,
                txt_path: txtPath
            };
        // 验证参数
        schema.validate(options, schema.writeFileTxtContent);
        await fs.writeFile(TXTURl + txtPath,content,{flag:'w',encoding:'utf-8',mode:'0666'});
        ctx.body = NET.success("写入成功！");
    } catch (e) {
        console.log(e)
        if (e.name === 'ValidationError') {
            return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}



/**
 * @apiDefine ERROR
 * @apiErrorExample {json} 错误返回:
 *     {
 *       "code": 0,
 *       "msg":"错误信息"
 *     }
 */

/**
 * @apiDefine SUCCESS
 * @apiSuccessExample {json} 成功返回:
 *     {
 *       "code": 1,
 *       "msg":"成功信息"
 *     }
 */