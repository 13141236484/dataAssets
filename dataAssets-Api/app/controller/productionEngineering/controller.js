/**
 * Created by gaoyu at 2018/7/25 下午2:53
 *
 * Desc :
 */
import {processBatch,technologyProcessRelation,beltline} from '../../modles';
import {isEmpty,getSecond} from '../../utils/importUtils';
import {NET,MANAGER_LIMIT} from "../../config/config";
import sequelize from '../../modles/db'
//验证参数
const schema = require('../../modles/schema');
//唯一编码
const uuidv4 = require('uuid/v4');

/**
 * @api {post} /productionEngineering/productionEngineeringCreate   添加生产工艺
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName productionEngineeringCreate
 * @apiGroup productionEngineering
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/productionEngineering/productionEngineeringCreate'
 * @apiParam {String} beltlineId                                  生产线ID.
 * @apiParam {String} productionEngineeringName                   生产工艺名称.
 * @apiParam {String} productionEngineeringRemark                 生产工艺备注.
 * @apiSampleRequest /productionEngineering/productionEngineeringCreate
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function productionEngineeringCreate(ctx) {
    try {
        let uuid = uuidv4();
        // 参数
        let beltlineId = ctx.request.body.beltlineId;
        let productionEngineeringName = ctx.request.body.productionEngineeringName;
        let productionEngineeringRemark = ctx.request.body.productionEngineeringRemark;
        // 用户信息
        let currentUser = ctx.state.user;
        let options = {
        	uuid: uuid,
	    	batch_name: productionEngineeringName,
	    	creation_time: getSecond(),
	    	user_id: currentUser.id,
            batch_remarks: productionEngineeringRemark,
            beltline_id: beltlineId
	    };
	    // 验证参数
	    schema.validate(options, schema.productionEngineeringCreate);
	    // 判断是否有重复生产工艺名称
	    let repeatData = await processBatch.isRepeatProductionEngineering(productionEngineeringName,beltlineId,['batch_name']);
	    if(repeatData){ ctx.body = NET.error("生产工艺名称不可重复!");return; }
        let productionEngineeringal = await processBatch.productionEngineeringCreate(options);
        if(!productionEngineeringal){
	        ctx.body = NET.error("添加生产工艺失败");return;
	    }
	    ctx.body = NET.success("添加生产工艺成功");
    } catch (e) {
    	console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
/**
 * @api {post} /productionEngineering/productionEngineeringList   生产工艺列表
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName productionEngineeringList
 * @apiGroup productionEngineering
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/productionEngineering/productionEngineeringList'
 * @apiParam {String} beltlineId                            生产线唯一编码.
 * @apiParam {String}  productionEngineeringName            生产工艺名称.
 * @apiParam {Integer} page                                 页码.
 *
 * @apiSampleRequest /productionEngineering/productionEngineeringList
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function productionEngineeringList(ctx) {
    try {
    	// 参数
        let beltlineId = ctx.request.body.beltlineId;
	    let productionEngineeringName = ctx.request.body.productionEngineeringName.replace(/(^\s*)|(\s*$)/g,"")
	    let page = ctx.request.body.page ? ctx.request.body.page : 1;
        // 验证参数
        schema.validate({uuid: beltlineId}, schema.commonParameters);
        let options = {
            page: page,
	    	productionEngineeringName: productionEngineeringName
	    };
        //生产线总条数
        let sqlcount= await getProductionEngineeringSql(options,true);
        let count = await sequelize.query(sqlcount,{
            type: sequelize.QueryTypes.SELECT ,
            replacements:{
                productionEngineeringName:'%'+productionEngineeringName+'%',
                beltlineId: beltlineId
            }
        });
        //生产线数据
        let sql= await getProductionEngineeringSql(options,false);
        let productionEngineeringData = await sequelize.query(sql,{
            type: sequelize.QueryTypes.SELECT,
            replacements:{
                productionEngineeringName:'%'+productionEngineeringName+'%',
                beltlineId: beltlineId
            }
        });
        // 生产线名称
        let beltlineData= await beltline.findOne({ where:{uuid:beltlineId},attributes:['uuid','beltline_name'],raw:true });
	    ctx.body = NET.success({productionEngineeringData,count,beltlineData},"生产工艺列表");
    } catch (e) {
    	console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
//生产线列表 获取where条件
async function getProductionEngineeringSql(obj,isCount = false){
    let sql = "SELECT";
    //生产线总条数
    isCount && (sql += " count(a.id) AS count ");
    //生产线数据
    !isCount && (sql +=" a.uuid,a.batch_name,a.creation_time,a.batch_remarks,b.username ");
    sql += " FROM k_process_batch AS a, k_admin_users AS b ";
    sql += " WHERE a.user_id=b.id and a.beltline_id=:beltlineId ";
    //生产线名称搜索
    sql += obj.productionEngineeringName ? " AND a.batch_name LIKE :productionEngineeringName " : "";
    sql += " ORDER BY a.creation_time DESC ";
    const countLimit = MANAGER_LIMIT;
    //偏移量
    const offset = (parseInt(obj.page)-1)*countLimit;
    !isCount && (sql += " LIMIT "+offset+","+countLimit);
    return sql;
}
/**
 * @api {post} /productionEngineering/stepProductionEngineeringList   (详单)生产工艺列表
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName stepProductionEngineeringList
 * @apiGroup productionEngineering
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/productionEngineering/stepProductionEngineeringList'
 * @apiParam {String} beltlineId                            生产线唯一编码.
 * @apiParam {String}  productionEngineeringName            生产工艺名称.
 *
 * @apiSampleRequest /productionEngineering/stepProductionEngineeringList
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function stepProductionEngineeringList(ctx) {
    try {
        // 参数
        let beltlineId = ctx.request.body.beltlineId;
        let productionEngineeringName = ctx.request.body.productionEngineeringName.replace(/(^\s*)|(\s*$)/g,"") || '';
        // 验证参数
        schema.validate({uuid: beltlineId}, schema.commonParameters);
        let options = {
            batch_name: productionEngineeringName,
            beltline_id: beltlineId
        };
        // 生产工艺数据
        let productionEngineeringData = await processBatch.productionEngineeringAllData(options,['uuid','batch_name','batch_remarks']);
        ctx.body = NET.success({productionEngineeringData},"(流程)生产工艺列表");
    } catch (e) {
        console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
/**
 * @api {post} /productionEngineering/productionEngineeringUpdate   修改生产工艺
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName productionEngineeringUpdate
 * @apiGroup productionEngineering
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/productionEngineering/productionEngineeringUpdate'
 * @apiParam {String} uuid                   	                  唯一编码.
 * @apiParam {String} productionEngineeringName                   生产工艺名称.
 * @apiParam {String} productionEngineeringRemark                 生产工艺备注.
 * @apiParam {String} beltlineId                                  生产线ID.
 *
 * @apiSampleRequest /productionEngineering/productionEngineeringUpdate
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function productionEngineeringUpdate(ctx) {
    try {
        // 参数
        let uuid = ctx.request.body.uuid;
        let productionEngineeringName = ctx.request.body.productionEngineeringName;
        let productionEngineeringRemark = ctx.request.body.productionEngineeringRemark;
        let beltlineId = ctx.request.body.beltlineId;
        let options = {
        	uuid: uuid,
	    	batch_name: productionEngineeringName,
	    	creation_time: getSecond(),
            batch_remarks: productionEngineeringRemark,
            beltline_id: beltlineId
	    };
        // console.log(options);return;
	    // 验证参数
	    schema.validate(options, schema.productionEngineeringUpdate);
	    // 判断是否有重复生产工艺名称
	    let repeatData = await processBatch.isRepeatSaveProductionEngineering(uuid,productionEngineeringName,beltlineId,['batch_name']);
	    if(repeatData){ ctx.body = NET.error("生产工艺名称不可重复!");return; }
        let productionEngineeringal = await processBatch.productionEngineeringUpdate(options);
        if(!productionEngineeringal){
	        ctx.body = NET.error("修改生产工艺失败");return;
	    }
	    ctx.body = NET.success("修改生产工艺成功");
    } catch (e) {
    	console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
/**
 * @api {post} /productionEngineering/productionEngineeringDelete   删除生产工艺
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName productionEngineeringDelete
 * @apiGroup productionEngineering
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/productionEngineering/productionEngineeringDelete'
 * @apiParam {String} uuid                   	   唯一编码.
 *
 * @apiSampleRequest /productionEngineering/productionEngineeringDelete
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function productionEngineeringDelete(ctx) {
    try {
        // 参数
        let uuid = ctx.request.body.uuid;
        let options = {
        	uuid: uuid
	    };
	    // 验证参数
	    schema.validate(options, schema.commonParametersUuid);
        let productionEngineeringal = await processBatch.productionEngineeringDelete(uuid);
        if(!productionEngineeringal){
	        ctx.body = NET.error("删除生产工艺失败");return;
	    }
	    ctx.body = NET.success("删除生产工艺成功");
    } catch (e) {
    	console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}

/**
 * @api {post} /productionEngineering/technologyProcessRelations   生产工艺关联生产过程
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName technologyProcessRelations
 * @apiGroup productionEngineering
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/productionEngineering/beltlineAssociationProcess'
 * @apiParam {Integer} technologyId                         生产工艺ID.
 * @apiParam {Object} processId                             生产过程ID.
 *
 * @apiSampleRequest /productionEngineering/technologyProcessRelations
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function technologyProcessRelations(ctx) {
    try {
        // 参数
        let technologyId = ctx.request.body.technologyId;
        let processId = ctx.request.body.processId;
        let options = {
            technology_id: technologyId,
            process_id: processId
        };
        // 验证参数
        schema.validate(options, schema.technologyProcessRelation);
        var arr =[];
        //生产工艺关联生产过程需要的字段值
        for(var i = 0; i < processId.length; i++){
            let value = {};
            let beltlineBatchRelationObj = await technologyProcessRelation.findOne({ where:{technology_id:technologyId,process_id:processId[i]},raw:true });
            if(!beltlineBatchRelationObj){
                value.technology_id = technologyId;
                value.process_id = processId[i];
                arr.push(value);
            }
        }
        if(arr.length){
            //生产工艺关联生产过程工艺入库
            let technologyProcessData = await technologyProcessRelation.bulkCreate(arr);
            if (technologyProcessData) {
                ctx.body = NET.success("生产工艺关联生产过程成功！");
            } else {
                ctx.body = NET.error("生产工艺关联生产过程失败!");
            }
        }else{
            ctx.body = NET.success("生产工艺关联生产过程已经存在");
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