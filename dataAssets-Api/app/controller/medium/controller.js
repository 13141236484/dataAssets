/**
 * Created by gaoyu at 2018/7/25 下午2:53
 *
 * Desc :
 */
import {medium} from '../../modles';
import {isEmpty,getSecond} from '../../utils/importUtils';
import {NET,MANAGER_LIMIT} from "../../config/config";
import sequelize from '../../modles/db'
//验证参数
const schema = require('../../modles/schema');
//唯一编码
const uuidv4 = require('uuid/v4');

/**
 * @api {post} /medium/mediumCreate   添加介质
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName mediumCreate
 * @apiGroup medium
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/medium/mediumCreate'
 * @apiParam {String} mediumName                   		介质名称.
 * @apiParam {String} regionId                          区域uuid.
 * @apiParam {String} mediumTypeName                    介质分类名称.
 * @apiParam {Object} mediumExample                   	介质实例.
 * @apiParam {String} mediumRemark                 		介质备注.
 *
 * @apiSampleRequest /medium/mediumCreate
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function mediumCreate(ctx) {
    try {
        let uuid = uuidv4();
        // 参数
        let mediumName = ctx.request.body.mediumName;
        let regionId = ctx.request.body.regionId;
        let mediumTypeName = ctx.request.body.mediumTypeName;
        let mediumExample = ctx.request.body.mediumExample;
        let mediumRemark = ctx.request.body.mediumRemark;
        // 用户信息
        let currentUser = ctx.state.user;
        let options = {
        	uuid: uuid,
	    	medium_name: mediumName,
            region_id: regionId,
	    	medium_type_name: mediumTypeName,
	    	medium_example: JSON.stringify(mediumExample),
	    	creation_time: getSecond(),
	    	user_id: currentUser.id,
	    	medium_remarks: mediumRemark
	    };
	    // 验证参数
	    schema.validate(options, schema.mediumCreate);
	    // 判断是否有重复介质名称
	    let repeatData = await medium.isRepeatMedium(mediumName,['medium_name']);
	    if(repeatData){ ctx.body = NET.error("介质名称不可重复!");return; }
        let mediumal = await medium.mediumCreate(options);
        if(!mediumal){
	        ctx.body = NET.error("添加介质失败");return;
	    }
	    ctx.body = NET.success("添加介质成功");
    } catch (e) {
    	console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
/**
 * @api {post} /medium/mediumList   介质列表
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName mediumList
 * @apiGroup medium
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/medium/mediumList'
 * @apiParam {String}  mediumName            介质名称.
 * @apiParam {Integer} page                  页码.
 *
 * @apiSampleRequest /medium/mediumList
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function mediumList(ctx) {
    try {
    	// 参数
	    let mediumName = ctx.request.body.mediumName.replace(/(^\s*)|(\s*$)/g,"");
	    let page = ctx.request.body.page ? ctx.request.body.page : 1;
	    let options = {
        	page: page,
	    	mediumName: mediumName
	    };
        //介质总条数
        const sqlcount= await getMediumSql(options,true);
        const count = await sequelize.query(sqlcount,{
            type: sequelize.QueryTypes.SELECT ,
            replacements:{
                mediumName:'%'+mediumName+'%'
            }
        });
        //介质数据
        const sql= await getMediumSql(options,false);
        const mediumData = await sequelize.query(sql,{
            type: sequelize.QueryTypes.SELECT,
            replacements:{
                mediumName:'%'+mediumName+'%'
            }
        });
	    ctx.body = NET.success({mediumData,count},"介质列表");
    } catch (e) {
    	console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
//介质列表 获取where条件
async function getMediumSql(obj,isCount = false){
    let sql = "SELECT";
    //介质总条数
    isCount && (sql += " count(a.id) AS count ");
    //介质数据
    !isCount && (sql +=" a.uuid,a.medium_name,a.creation_time,a.medium_remarks,a.region_id,a.medium_example,a.medium_type_name,b.username ");
    sql += " FROM k_medium AS a, k_admin_users AS b ";
    sql += " WHERE a.user_id=b.id ";
    //介质名称搜索
    sql += obj.mediumName ? " AND a.medium_name LIKE :mediumName " : "";
    sql += " ORDER BY a.creation_time DESC ";
    const countLimit = MANAGER_LIMIT;
    //偏移量
    const offset = (parseInt(obj.page)-1)*countLimit;
    !isCount && (sql += " LIMIT "+offset+","+countLimit);
    return sql;
}
/**
 * @api {post} /medium/mediumUpdate   修改介质
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName mediumUpdate
 * @apiGroup medium
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/medium/mediumUpdate'
 * @apiParam {String} uuid                   	   		唯一编码.
 * @apiParam {String} mediumName                   		介质名称.
 * @apiParam {String} regionId                          区域uuid.
 * @apiParam {String} mediumTypeName                    介质分类名称.
 * @apiParam {Object} mediumExample                     介质实例.
 * @apiParam {String} mediumRemark                 		介质备注.
 *
 * @apiSampleRequest /medium/mediumUpdate
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function mediumUpdate(ctx) {
    try {
        // 参数
        let uuid = ctx.request.body.uuid;
        let mediumName = ctx.request.body.mediumName;
        let regionId = ctx.request.body.regionId;
        let mediumTypeName = ctx.request.body.mediumTypeName;
        let mediumExample = ctx.request.body.mediumExample;
        let mediumRemark = ctx.request.body.mediumRemark;
        // 用户信息
        let currentUser = ctx.state.user;
        let options = {
        	uuid: uuid,
	    	medium_name: mediumName,
            region_id: regionId,
	    	medium_type_name: mediumTypeName,
	    	medium_example: JSON.stringify(mediumExample),
	    	creation_time: getSecond(),
	    	medium_remarks: mediumRemark
	    };
	    // 验证参数
	    schema.validate(options, schema.mediumUpdate);
	    // 判断是否有重复介质名称
	    let repeatData = await medium.isRepeatUpdateMedium(uuid,mediumName,['medium_name']);
	    if(repeatData){ ctx.body = NET.error("介质名称不可重复!");return; }
        let mediumal = await medium.mediumUpdate(options);
        if(!mediumal){
	        ctx.body = NET.error("修改介质失败");return;
	    }
	    ctx.body = NET.success("修改介质成功");
    } catch (e) {
    	console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
/**
 * @api {post} /medium/mediumDelete   删除介质
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName mediumDelete
 * @apiGroup medium
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/medium/mediumDelete'
 * @apiParam {String} uuid                   	   唯一编码.
 *
 * @apiSampleRequest /medium/mediumDelete
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function mediumDelete(ctx) {
    try {
        // 参数
        let uuid = ctx.request.body.uuid;
        let options = {
        	uuid: uuid
	    };
        // 验证参数
        schema.validate(options, schema.commonParametersUuid);
        let mediumal = await medium.mediumDelete(uuid);
        if(!mediumal){
	        ctx.body = NET.error("删除介质失败");return;
	    }
	    ctx.body = NET.success("删除介质成功");
    } catch (e) {
    	console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}

/**
 * @api {post} /medium/mediumSingle   查看单条介质
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName mediumSingle
 * @apiGroup medium
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/medium/mediumSingle'
 * @apiParam {String} mediumId                         介质uuid.
 *
 * @apiSampleRequest /medium/mediumSingle
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function mediumSingle(ctx) {
    try {
        // 参数
        let mediumId = ctx.request.body.mediumId;
        let options = {
            uuid: mediumId
        };
        // 验证参数
        schema.validate(options, schema.commonParameters);
        let mediumSingleData = await medium.mediumSingle(mediumId,['medium_name','medium_type_name','medium_example','creation_time']);
        ctx.body = NET.success({mediumSingleData},"介质单条数据");
    } catch (e) {
        console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
/**
 * @api {post} /medium/mediumAllList   查看介质名称数据
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName mediumAllList
 * @apiGroup medium
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/medium/mediumAllList'
 * @apiParam {String} regionId                          区域uuid.
 *
 * @apiSampleRequest /medium/mediumAllList
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function mediumAllList(ctx) {
    try {
        // 参数
        let regionId = ctx.request.body.regionId;
        let options = {
            uuid: regionId
        };
        // 验证参数
        schema.validate(options, schema.commonParameters);
        let mediumData = await medium.mediumAllData(regionId,['uuid','medium_name']);
        ctx.body = NET.success({mediumData},"介质名称数据");
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