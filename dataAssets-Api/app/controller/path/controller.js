/**
 * Created by gaoyu at 2018/7/25 下午2:53
 *
 * Desc :
 */
import {path,medium} from '../../modles';
import {isEmpty,getSecond} from '../../utils/importUtils';
import {NET,MANAGER_LIMIT} from "../../config/config";
import sequelize from '../../modles/db'
//验证参数
const schema = require('../../modles/schema');
//唯一编码
const uuidv4 = require('uuid/v4');

/**
 * @api {post} /path/pathCreate   添加路径
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName pathCreate
 * @apiGroup path
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/path/pathCreate'
 * @apiParam {String} mediumId                   介质唯一编码.
 * @apiParam {String} pathName                   路径名称.
 * @apiParam {String} pathRemark                 路径备注.
 *
 * @apiSampleRequest /path/pathCreate
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function pathCreate(ctx) {
    try {
        let uuid = uuidv4();
        // 参数
        let mediumId = ctx.request.body.mediumId;
        let pathName = ctx.request.body.pathName;
        let pathRemark = ctx.request.body.pathRemark;
        // 用户信息
        let currentUser = ctx.state.user;
        let options = {
        	uuid: uuid,
	    	detailed_path: pathName,
	    	creation_time: getSecond(),
	    	user_id: currentUser.id,
	    	path_remarks: pathRemark,
            medium_id: mediumId
	    };
	    // 验证参数
	    schema.validate(options, schema.pathCreate);
	    // 判断是否有重复路径名称
	    let repeatData = await path.isRepeatPath(pathName,mediumId,['detailed_path']);
	    if(repeatData){ ctx.body = NET.error("路径名称不可重复!");return; }
        let pathal = await path.pathCreate(options);
        if(!pathal){
	        ctx.body = NET.error("添加路径失败");return;
	    }
	    ctx.body = NET.success("添加路径成功");
    } catch (e) {
    	console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
/**
 * @api {post} /path/pathList   路径列表
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName pathList
 * @apiGroup path
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/path/pathList'
 * @apiParam {String} mediumId                   介质唯一编码.
 * @apiParam {String}  pathName                  路径名称.
 * @apiParam {Integer} page                      页码.
 *
 * @apiSampleRequest /path/pathList
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function pathList(ctx) {
    try {
    	// 参数
	    let pathName = ctx.request.body.pathName.replace(/(^\s*)|(\s*$)/g,"");
        let mediumId = ctx.request.body.mediumId;
	    let page = ctx.request.body.page ? ctx.request.body.page : 1;
        // 验证参数
        schema.validate({uuid:mediumId}, schema.commonParameters);
	    let options = {
        	page: page,
	    	pathName: pathName
	    };
        // 路径总条数
        let sqlcount= await getPathSql(options,true);
        let count = await sequelize.query(sqlcount,{
            type: sequelize.QueryTypes.SELECT ,
            replacements:{
                pathName:'%'+pathName+'%',
                mediumId: mediumId
            }
        });
        // 路径数据
        let sql= await getPathSql(options,false);
        let pathData = await sequelize.query(sql,{
            type: sequelize.QueryTypes.SELECT,
            replacements:{
                pathName:'%'+pathName+'%',
                mediumId: mediumId
            }
        });
        // 介质名称
        let mediumName = await medium.findOne({ where:{uuid:mediumId},attributes:['uuid','medium_name'],raw:true });
	    ctx.body = NET.success({pathData,count,mediumName},"路径列表");
    } catch (e) {
    	console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
//路径列表 获取where条件
async function getPathSql(obj,isCount = false){
    let sql = "SELECT";
    //路径总条数
    isCount && (sql += " count(a.id) AS count ");
    //路径数据
    !isCount && (sql +=" a.uuid,a.detailed_path,a.creation_time,a.path_remarks,b.username ");
    sql += " FROM k_path AS a, k_admin_users AS b ";
    sql += " WHERE a.user_id=b.id AND a.medium_id=:mediumId ";
    //路径名称搜索
    sql += obj.pathName ? " AND a.detailed_path LIKE :pathName " : "";
    sql += " ORDER BY a.creation_time DESC ";
    const countLimit = MANAGER_LIMIT;
    //偏移量
    const offset = (parseInt(obj.page)-1)*countLimit;
    !isCount && (sql += " LIMIT "+offset+","+countLimit);
    return sql;
}
/**
 * @api {post} /path/pathUpdate   修改路径
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName pathUpdate
 * @apiGroup path
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/path/pathUpdate'
 * @apiParam {String} uuid                   	    唯一编码.
 * @apiParam {String} pathName                      路径名称.
 * @apiParam {String} pathRemark                    路径备注.
 * @apiParam {String} mediumId                      介质唯一编码.
 *
 * @apiSampleRequest /path/pathUpdate
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function pathUpdate(ctx) {
    try {
        // 参数
        let uuid = ctx.request.body.uuid;
        let mediumId = ctx.request.body.mediumId;
        let pathName = ctx.request.body.pathName;
        let pathRemark = ctx.request.body.pathRemark;
        let options = {
        	uuid: uuid,
	    	detailed_path: pathName,
	    	creation_time: getSecond(),
	    	path_remarks: pathRemark,
            medium_id: mediumId
	    };
	    // 验证参数
	    schema.validate(options, schema.pathUpdate);
	    // 判断是否有重复路径名称
	    let repeatData = await path.isRepeatUpdatePath(uuid,pathName,mediumId,['detailed_path']);
	    if(repeatData){ ctx.body = NET.error("路径名称不可重复!");return; }
        let pathal = await path.pathUpdate(options);
        if(!pathal){
	        ctx.body = NET.error("修改路径失败");return;
	    }
	    ctx.body = NET.success("修改路径成功");
    } catch (e) {
    	console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
/**
 * @api {post} /path/pathDelete   删除路径
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName pathDelete
 * @apiGroup path
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/path/pathDelete'
 * @apiParam {String} uuid                   	   唯一编码.
 *
 * @apiSampleRequest /path/pathDelete
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function pathDelete(ctx) {
    try {
        // 参数
        let uuid = ctx.request.body.uuid;
        let options = {
        	uuid: uuid
	    };
	    // 验证参数
	    schema.validate(options, schema.commonParametersUuid);
        let pathal = await path.pathDelete(uuid);
        if(!pathal){
	        ctx.body = NET.error("删除路径失败");return;
	    }
	    ctx.body = NET.success("删除路径成功");
    } catch (e) {
    	console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
/**
 * @api {post} /path/pathAllList   查看路径名称数据
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName pathAllList
 * @apiGroup path
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/path/pathAllList'
 *
 * @apiSampleRequest /path/pathAllList
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function pathAllList(ctx) {
    try {
        let pathData = await path.pathAllData(['uuid','detailed_path']);
        ctx.body = NET.success({pathData},"路径名称数据");
    } catch (e) {
        console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
/**
 * @api {post} /path/mediumPathList   介质下-路径名称数据
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName mediumPathList
 * @apiGroup path
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/path/mediumPathList'
 * @apiParam {String} mediumId                         介质唯一编码.
 *
 * @apiSampleRequest /path/mediumPathList
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function mediumPathList(ctx) {
    try {
        // 参数
        let mediumId = ctx.request.body.mediumId;
        let options = {
            uuid: mediumId
        };
        // 验证参数
        schema.validate(options, schema.commonParameters);
        let mediumPathData = await path.mediumPathData(mediumId,['uuid','detailed_path']);
        ctx.body = NET.success({mediumPathData},"介质下-路径名称数据");
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