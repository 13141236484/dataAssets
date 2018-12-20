/**
 * Created by gaoyu at 2018/7/30 下午2:53
 *
 * Desc :
 */
import {productionProcess,processAssetsRelation,assets,processDependence,processBatch} from '../../modles';
import {isEmpty,getSecond} from '../../utils/importUtils';
import {NET,MANAGER_LIMIT} from "../../config/config";
import sequelize from '../../modles/db'
//验证参数
const schema = require('../../modles/schema');
//唯一编码
const uuidv4 = require('uuid/v4');

/**
 * @api {post} /productionProcess/productionProcessCreate   添加生产过程
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName productionProcessCreate
 * @apiGroup productionProcess
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/productionProcess/productionProcessCreate'
 * @apiParam {String} batchId                                   生产工艺Id.
 * @apiParam {String} productionProcessName                     生产过程名称.
 * @apiParam {String} productionProcessRemark                   生产过程备注.
 * @apiParam {Integer} startState                               起始状态(1有 2无).
 *
 * @apiSampleRequest /productionProcess/productionProcessCreate
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function productionProcessCreate(ctx) {
    try {
        let uuid = uuidv4();
        // 参数
        let batchId = ctx.request.body.batchId;
        let productionProcessName = ctx.request.body.productionProcessName;
        let productionProcessRemark = ctx.request.body.productionProcessRemark;
        let startState = ctx.request.body.startState;
        // 用户信息
        let currentUser = ctx.state.user;
        let options = {
        	uuid: uuid,
	    	process_name: productionProcessName,
	    	creation_time: getSecond(),
	    	user_id: currentUser.id,
            process_remarks: productionProcessRemark,
            batch_id: batchId,
            start_state: startState
	    };
	    // 验证参数
	    schema.validate(options, schema.productionProcessCreate);
	    // 判断是否有重复生产过程名称
	    let repeatData = await productionProcess.isRepeatProductionProcess(productionProcessName,batchId,['process_name']);
	    if(repeatData){ ctx.body = NET.error("生产过程名称不可重复!");return; }
        // 判断资产名称和过程名称是否重复
        let assetData = await assets.findOne({ where:{asset_name:productionProcessName},attributes:['asset_name'],raw:true });
        if(assetData){ ctx.body = NET.error("过程名称与资产名称不可重复!");return; }
        let productionProcessal = await productionProcess.productionProcessCreate(options);
        if(!productionProcessal){
	        ctx.body = NET.error("添加生产过程失败");return;
	    }
	    ctx.body = NET.success("添加生产过程成功");
    } catch (e) {
    	console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
/**
 * @api {post} /productionProcess/productionProcessList   生产过程列表
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName productionProcessList
 * @apiGroup productionProcess
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/productionProcess/productionProcessList'
 * @apiParam {String} batchId                               生产工艺唯一编码.
 * @apiParam {String}  productionProcessName                生产过程名称.
 * @apiParam {Integer} page                  页码.
 *
 * @apiSampleRequest /productionProcess/productionProcessList
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function productionProcessList(ctx) {
    try {
    	// 参数
        let batchId = ctx.request.body.batchId;
	    let productionProcessName = ctx.request.body.productionProcessName.replace(/(^\s*)|(\s*$)/g,"");
	    let page = ctx.request.body.page ? ctx.request.body.page : 1;
	    // 验证参数
        schema.validate({uuid: batchId}, schema.commonParameters);
        let options = {
        	page: page,
	    	productionProcessName: productionProcessName
	    };
        //生产过程总条数
        let sqlcount= await getProductionProcessSql(options,true);
        let count = await sequelize.query(sqlcount,{
            type: sequelize.QueryTypes.SELECT ,
            replacements:{
                productionProcessName:'%'+productionProcessName+'%',
                batchId: batchId
            }
        });
        //生产过程数据
        let sql= await getProductionProcessSql(options,false);
        let productionProcessData = await sequelize.query(sql,{
            type: sequelize.QueryTypes.SELECT,
            replacements:{
                productionProcessName:'%'+productionProcessName+'%',
                batchId: batchId
            }
        });
        // 工艺名称
        let engineerData= await processBatch.findOne({ where:{uuid:batchId},attributes:['uuid','batch_name'],raw:true });
	    ctx.body = NET.success({productionProcessData,count,engineerData},"生产过程列表");
    } catch (e) {
    	console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
//生产过程列表 获取where条件
async function getProductionProcessSql(obj,isCount = false){
    let sql = "SELECT";
    //生产过程总条数
    isCount && (sql += " count(a.id) AS count ");
    //生产过程数据
    !isCount && (sql +=" a.uuid,a.process_name,a.creation_time,a.process_remarks,a.start_state,b.username ");
    sql += " FROM k_production_process AS a, k_admin_users AS b ";
    sql += " WHERE a.user_id=b.id AND a.batch_id=:batchId ";
    //生产过程名称搜索
    sql += obj.productionProcessName ? " AND a.process_name LIKE :productionProcessName " : "";
    sql += " ORDER BY a.creation_time DESC ";
    const countLimit = MANAGER_LIMIT;
    //偏移量
    const offset = (parseInt(obj.page)-1)*countLimit;
    !isCount && (sql += " LIMIT "+offset+","+countLimit);
    return sql;
}
/**
 * @api {post} /productionProcess/productionProcessUpdate   修改生产过程
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName productionProcessUpdate
 * @apiGroup productionProcess
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/productionProcess/productionProcessUpdate'
 * @apiParam {String} uuid                   	              唯一编码.
 * @apiParam {String} productionProcessName                   生产过程名称.
 * @apiParam {String} productionProcessRemark                 生产过程备注.
 * @apiParam {String} batchId                                 生产工艺Id.
 * @apiParam {Integer} startState                             起始状态(1有 2无).
 *
 * @apiSampleRequest /productionProcess/productionProcessUpdate
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function productionProcessUpdate(ctx) {
    try {
        // 参数
        let uuid = ctx.request.body.uuid;
        let batchId = ctx.request.body.batchId;
        let productionProcessName = ctx.request.body.productionProcessName;
        let productionProcessRemark = ctx.request.body.productionProcessRemark;
        let startState = ctx.request.body.startState;
        let options = {
        	uuid: uuid,
	    	process_name: productionProcessName,
	    	creation_time: getSecond(),
            process_remarks: productionProcessRemark,
            start_state: startState,
            batch_id: batchId
	    };
	    // 验证参数
	    schema.validate(options, schema.productionProcessUpdate);
	    // 判断是否有重复生产过程名称
	    let repeatData = await productionProcess.isRepeatSaveProductionProcess(uuid,productionProcessName,batchId,['process_name']);
	    if(repeatData){ ctx.body = NET.error("生产过程名称不可重复!");return; }
        // 判断资产名称和过程名称是否重复
        let assetData = await assets.findOne({ where:{asset_name:productionProcessName},attributes:['asset_name'],raw:true });
        if(assetData){ ctx.body = NET.error("过程名称与资产名称不可重复!");return; }
        let productionProcessal = await productionProcess.productionProcessUpdate(options);
        if(!productionProcessal){
	        ctx.body = NET.error("修改生产过程失败");return;
	    }
	    ctx.body = NET.success("修改生产过程成功");
    } catch (e) {
    	console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
/**
 * @api {post} /productionProcess/productionProcessDelete   删除生产过程
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName productionProcessDelete
 * @apiGroup productionProcess
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/productionProcess/productionProcessDelete'
 * @apiParam {String} uuid                   	   唯一编码.
 *
 * @apiSampleRequest /productionProcess/productionProcessDelete
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function productionProcessDelete(ctx) {
    try {
        // 参数
        let uuid = ctx.request.body.uuid;
        let options = {
        	uuid: uuid
	    };
	    // 验证参数
	    schema.validate(options, schema.commonParametersUuid);
        let productionProcessal = await productionProcess.productionProcessDelete(uuid);
        if(!productionProcessal){
	        ctx.body = NET.error("删除生产过程失败");return;
	    }
	    ctx.body = NET.success("删除生产过程成功");
    } catch (e) {
    	console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}

/**
 * @api {post} /productionProcess/associationProcessList   (详单)生产过程列表
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName associationProcessList
 * @apiGroup productionProcess
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/productionProcess/associationProcessList'
 * @apiParam {String} batchId                               生产工艺唯一编码.
 * @apiParam {String}  productionProcessName                生产过程名称.
 * @apiParam {Integer} page                  页码.
 *
 * @apiSampleRequest /productionProcess/associationProcessList
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function associationProcessList(ctx) {
    try {
        // 参数
        let productionProcessName = ctx.request.body.productionProcessName;
        let batchId = ctx.request.body.batchId;
        let page = ctx.request.body.page ? ctx.request.body.page : 1;
        // 验证参数
        schema.validate({uuid: batchId}, schema.commonParameters);
        let options = {
            page: page,
            process_name: productionProcessName,
            batch_id: batchId
        };
        // 生产过程数据
        let productionProcessData = await productionProcess.productionProcessAllData(options,['uuid','process_name','process_remarks']);
        ctx.body = NET.success({productionProcessData},"(流程)生产过程列表");
    } catch (e) {
        console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
/**
 * @api {post} /productionProcess/bloodMap   血缘关系图～
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName bloodMap
 * @apiGroup productionProcess
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/productionProcess/bloodMap'
 * @apiParam {String} technologyId                         生产工艺ID.
 *
 * @apiSampleRequest /productionProcess/bloodMap
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function bloodMap(ctx) {
    try {
        // 参数
        let technologyId = ctx.request.body.technologyId;
        let options = {
            uuid: technologyId
        };
        // 验证参数
        schema.validate(options, schema.commonParameters);
        // 生产过程数据
        let processData = await productionProcess.engineerIdProcess(technologyId,['uuid','process_name','start_state']);
        // 特殊过程数组 数据
        var specialProcess = [];
        // 非特殊过程数组 数据
        var noSpecialProcess = [];
        for(let value of Object.values(processData)){
            if(value.start_state==1){
                let specialObj = {};
                specialObj.uuid = value.uuid;
                specialObj.process_name = value.process_name;
                specialProcess.push(specialObj);
            }
            if(value.start_state==2){
                let noSpecialObj = {};
                noSpecialObj.uuid = value.uuid;
                noSpecialObj.process_name = value.process_name;
                noSpecialProcess.push(noSpecialObj);
            }
        }
        // 生产过程ID
        let precessIdArr = processData.map(function(modle){
            return modle.uuid;
        });
        // 依赖过程与被依赖过程 数据
        if(precessIdArr.length){
            // 依赖过程与被依赖过程 数据
            let sql  = " SELECT ";
                sql += " b.process_name as son_process_name, c.process_name as par_process_name ";
                sql += " FROM k_process_dependence as a, k_production_process as b, k_production_process as c where a.son_process_id=b.uuid and a.par_process_id=c.uuid and a.son_process_id in(:precessId) ";
            var dependRelationData = await sequelize.query(sql,{
                type: sequelize.QueryTypes.SELECT,
                replacements:{
                    precessId:precessIdArr
                }
            });
            // 取出关联表资产ID
            let assetIds = await processAssetsRelation.findAll({ where: {process_id: precessIdArr},attributes:['asset_id'],raw:true });
            let assetIdArr = assetIds.map(function(modle){
                return modle.asset_id;
            });
            // 资产数据
            var assetData = await assets.assetIdAsset(assetIdArr,['uuid','asset_name']);
            if(precessIdArr.length){
                // 关联表（过程名称、资产名称、输入输出状态）
                let sql  = " SELECT ";
                    sql += " b.asset_name,a.process_name,c.put_status ";
                    sql += " FROM k_production_process AS a, k_assets AS b, k_process_assets_relation AS c ";
                    sql += " WHERE c.process_id=a.uuid AND c.asset_id=b.uuid AND c.process_id in(:precessId) ";
                var relationData = await sequelize.query(sql,{
                    type: sequelize.QueryTypes.SELECT,
                    replacements:{
                        precessId:precessIdArr
                    }
                });
            }else{
                var relationData = [];
            }
        }else{
            var assetData = [];
            var relationData = [];
            var dependRelationData = [];
        }
        ctx.body = NET.success({specialProcess,noSpecialProcess,dependRelationData,assetData,relationData});
    } catch (e) {
        console.log(e)
        if (e.name === 'ValidationError') {
            return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}

/**
 * @api {post} /productionProcess/processAssetRelations   生产过程关联资产
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName processAssetRelations
 * @apiGroup productionProcess
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/productionProcess/processAssetRelations'
 * @apiParam {Array} assetRelationData                             生产过程关联资产数据(数组).
 *
 * @apiSampleRequest /productionProcess/processAssetRelations
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function processAssetRelations(ctx) {
    try {
        // 参数
        let assetRelationData = ctx.request.body.assetRelationData;
        let options = {
            asset_relation_data: assetRelationData
        };
        // 验证参数
        schema.validate(options, schema.processAssetRelations);
        var arrOn = [];
        var arrAll = [];
        if(assetRelationData.length){
            // 处理数据
            for(let value of Object.values(assetRelationData)){
                if(value.put_status == 'out'){
                    arrOn.push(value.uuid);
                }
                if(value.put_status == 'in'||'out'){
                    let processAssetsOne = await processAssetsRelation.findOne({ where:{process_id:value.process_id, asset_id: value.uuid, put_status: value.put_status},attributes:['id'],raw:true });
                    if(!processAssetsOne){
                        let objInOut = {};
                        objInOut.process_id = value.process_id;
                        objInOut.asset_id = value.uuid;
                        objInOut.put_status = value.put_status;
                        arrAll.push(objInOut);
                    }
                }
            }
        }else{
            return ctx.body = NET.error("参数错误");
        }
        if(arrAll.length){
            // 启用事物
            var dataRes = await sequelize.transaction(async function (t) {
                // 资产修改输出状态
                const assetsRes = await assets.update( {put_status:'out'},{where:{uuid:arrOn}},{transaction: t} );
                // 过程 资产 关联表入库
                const processAssetsData = await processAssetsRelation.bulkCreate(arrAll,{transaction: t});
                return assetsRes,processAssetsData;
            });
        }else{
            var dataRes = 1;
        }
        if(dataRes){
            ctx.body = NET.success("关联成功");
        }else{
            return ctx.body = NET.error("关联失败！");
        }
    } catch (e) {
        console.log(e)
        if (e.name === 'ValidationError') {
            return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
/**
 * @api {post} /productionProcess/processAssetRelationsDelete   生产过程/资产 关联表删除
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName processAssetRelationsDelete
 * @apiGroup productionProcess
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/productionProcess/processAssetRelationsDelete'
 * @apiParam {String} processId                             过程uuid.
 * @apiParam {String} assetId                               资产uuid.
 * @apiParam {String} putStatus                             状态（in/out）.
 *
 * @apiSampleRequest /productionProcess/processAssetRelationsDelete
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function processAssetRelationsDelete(ctx) {
    try {
        // 参数
        let processId = ctx.request.body.processId;
        let assetId = ctx.request.body.assetId;
        let putStatus = ctx.request.body.putStatus;
        let options = {
            process_id: processId,
            asset_id: assetId,
            put_status: putStatus
        };
        // 验证参数
        schema.validate(options, schema.processAssetRelationsDelete);
        let processAssetsRes = await processAssetsRelation.destroy({ where:{process_id:processId, asset_id: assetId, put_status: putStatus} });
        if(processAssetsRes){
            ctx.body = NET.success("删除成功");
        }else{
            return ctx.body = NET.error("删除失败！");
        }
    } catch (e) {
        console.log(e)
        if (e.name === 'ValidationError') {
            return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}

/**
 * @api {post} /productionProcess/relyOnProcessList   依赖->过程数据列表
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName relyOnProcessList
 * @apiGroup productionProcess
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/productionProcess/relyOnProcessList'
 * @apiParam {String} technologyId                            生产工艺唯一编码.
 * @apiParam {String} processId                               生产过程唯一编码.
 *
 * @apiSampleRequest /productionProcess/relyOnProcessList
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function relyOnProcessList(ctx) {
    try {
        // 参数
        let technologyId = ctx.request.body.technologyId;
        let processId = ctx.request.body.processId;
        let options = {
            technology_id: technologyId,
            process_id: processId
        };
        // 验证参数
        schema.validate(options, schema.relyOnProcessList);
        // 生产过程数据
        let processData = await productionProcess.relyOnProcessList(options,['uuid','process_name']);
        // 取出被依赖的过程ID
        let parProcessIdS = await processDependence.findAll({ where:{son_process_id:processId},attributes:['par_process_id'],raw:true });
        let parProcessIdArr = parProcessIdS.map(function(modle){
            return modle.par_process_id;
        });
        // 已经被依赖生产过程数据
        let processDependenceData = await productionProcess.findAll({ where:{uuid:parProcessIdArr},attributes:['uuid','process_name'],raw:true });
        ctx.body = NET.success({processData,processDependenceData},"依赖->过程数据列表");
    } catch (e) {
        console.log(e)
        if (e.name === 'ValidationError') {
            return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
/**
 * @api {post} /productionProcess/dependenceExist   依赖->查看依赖关系表中是否存在
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName dependenceExist
 * @apiGroup productionProcess
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/productionProcess/dependenceExist'
 * @apiParam {String} sonProcessId                              依赖者过程唯一编码.
 * @apiParam {String} parProcessId                              被依赖者过程唯一编码.
 *
 * @apiSampleRequest /productionProcess/dependenceExist
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function dependenceExist(ctx) {
    try {
        // 参数
        let sonProcessId = ctx.request.body.sonProcessId;
        let parProcessId = ctx.request.body.parProcessId;
        let options = {
            son_process_id: sonProcessId,
            par_process_id: parProcessId
        };
        // 验证参数
        schema.validate(options, schema.dependenceExist);
        // 生产过程依赖关系数据
        let processExistData = await processDependence.findOne({ where:{ '$or':[{son_process_id: sonProcessId,par_process_id: parProcessId},{son_process_id: parProcessId,par_process_id: sonProcessId}] },raw:true });
        if(processExistData){
            ctx.body = NET.error("no");
        }else{
            ctx.body = NET.success("ok");
        }
    } catch (e) {
        console.log(e)
        if (e.name === 'ValidationError') {
            return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
/**
 * @api {post} /productionProcess/processDependenceCreate   依赖->依赖关系表入库
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName processDependenceCreate
 * @apiGroup productionProcess
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/productionProcess/processDependenceCreate'
 * @apiParam {String} sonProcessId                              依赖者过程唯一编码.
 * @apiParam {Array} parProcessIdArr                            被依赖者们过程唯一编码.
 *
 * @apiSampleRequest /productionProcess/processDependenceCreate
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function processDependenceCreate(ctx) {
    try {
        // 参数
        let sonProcessId = ctx.request.body.sonProcessId;
        let parProcessIdArr = ctx.request.body.parProcessIdArr;
        // 验证参数
        schema.validate({son_process_id: sonProcessId,par_process_id: parProcessIdArr}, schema.processDependenceCreate);
        if(parProcessIdArr.length){
            var options = [];
            for(var i=0;i<parProcessIdArr.length;i++){
                let processDependenceOne = await processDependence.findOne({ where:{son_process_id:sonProcessId, par_process_id: parProcessIdArr[i]},attributes:['id'],raw:true });
                if(!processDependenceOne){
                    let obj = {};
                    obj.son_process_id = sonProcessId;
                    obj.par_process_id = parProcessIdArr[i];
                    options.push(obj);
                }
            }
            if(options.length){
                // 生产过程依赖关系数据入库
                var processDependenceRes = await processDependence.processDependenceCreate(options);
            }else{
                var processDependenceRes = 1;
            }
            if(processDependenceRes){
                ctx.body = NET.success("过程依赖成功！");
            }else{
                ctx.body = NET.error("过程依赖失败！");
            }
        }else{
            return ctx.body = NET.error("参数错误");
        }
    } catch (e) {
        console.log(e)
        if (e.name === 'ValidationError') {
            return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
/**
 * @api {post} /productionProcess/processDependenceDelete   依赖->依赖关系表删除
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName processDependenceDelete
 * @apiGroup productionProcess
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/productionProcess/processDependenceDelete'
 * @apiParam {String} sonProcessId                              依赖者过程唯一编码.
 * @apiParam {String} parProcessId                              被依赖者过程唯一编码.
 *
 * @apiSampleRequest /productionProcess/processDependenceDelete
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function processDependenceDelete(ctx) {
    try {
        // 参数
        let sonProcessId = ctx.request.body.sonProcessId;
        let parProcessId = ctx.request.body.parProcessId;
        let options = {
            son_process_id: sonProcessId,
            par_process_id: parProcessId
        };
        // 验证参数
        schema.validate(options, schema.dependenceExist);
        // 生产过程依赖关系删除
        let processExistRes = await processDependence.destroy({where: {son_process_id: sonProcessId,par_process_id: parProcessId}});
        if(processExistRes){
            ctx.body = NET.success("删除成功");
        }else{
            return ctx.body = NET.error("删除失败！");
        }
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