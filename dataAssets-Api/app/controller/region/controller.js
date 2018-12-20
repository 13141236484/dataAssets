/**
 * Created by gaoyu at 2018/7/25 下午2:53
 *
 * Desc :
 */
import {region} from '../../modles';
import {isEmpty,getSecond} from '../../utils/importUtils';
import {NET,MANAGER_LIMIT} from "../../config/config";
import sequelize from '../../modles/db'
//验证参数
const schema = require('../../modles/schema');
//唯一编码
const uuidv4 = require('uuid/v4');

/**
 * @api {post} /region/regionCreate   添加区域
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName regionCreate
 * @apiGroup region
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/region/regionCreate'
 * @apiParam {String} regionName                   区域名称.
 * @apiParam {Integer} regionStatus                (1 特定区域 2不是特定区域).
 * @apiParam {String} regionRemark                 区域备注.
 *
 * @apiSampleRequest /region/regionCreate
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function regionCreate(ctx) {
    try {
        let uuid = uuidv4();
        // 参数
        let regionName = ctx.request.body.regionName;
        let regionStatus = ctx.request.body.regionStatus;
        let regionRemark = ctx.request.body.regionRemark;
        // 用户信息
        let currentUser = ctx.state.user;
        let options = {
        	uuid: uuid,
	    	regional_name: regionName,
	    	creation_time: getSecond(),
	    	user_id: currentUser.id,
	    	region_remarks: regionRemark,
            region_status: regionStatus
	    };
	    // 验证参数
	    schema.validate(options, schema.regionCreate);
	    // 判断是否有重复区域名称
	    let repeatData = await region.isRepeatRegion(regionName,['regional_name']);
	    if(repeatData){ ctx.body = NET.error("区域名称不可重复!");return; }
        let regional = await region.regionCreate(options);
        if(!regional){
	        ctx.body = NET.error("添加区域失败");return;
	    }
	    ctx.body = NET.success("添加区域成功");
    } catch (e) {
        console.log(e);
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
/**
 * @api {post} /region/regionList   区域列表
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName regionList
 * @apiGroup region
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/region/regionList'
 * @apiParam {String}  regionName            区域名称.
 * @apiParam {Integer} page                  页码.
 *
 * @apiSampleRequest /region/regionList
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function regionList(ctx) {
    try {
    	// 参数
	    let regionName = ctx.request.body.regionName.replace(/(^\s*)|(\s*$)/g,"");
	    let page = ctx.request.body.page ? ctx.request.body.page : 1;
	    let options = {
        	page: page,
	    	regionName: regionName
	    };
        //区域总条数
        const sqlcount= await getRegionSql(options,true);
        const count = await sequelize.query(sqlcount,{
            type: sequelize.QueryTypes.SELECT ,
            replacements:{
                regionName:'%'+regionName+'%'
            }
        });
        //区域数据
        const sql= await getRegionSql(options,false);
        const regionalData = await sequelize.query(sql,{
            type: sequelize.QueryTypes.SELECT,
            replacements:{
                regionName:'%'+regionName+'%'
            }
        });
	    ctx.body = NET.success({regionalData,count},"区域列表");
    } catch (e) {
    	console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
//区域列表 获取where条件
async function getRegionSql(obj,isCount = false){
    let sql = "SELECT";
    //区域总条数
    isCount && (sql += " count(a.id) AS count ");
    //区域数据
    !isCount && (sql +=" a.uuid,a.regional_name,a.creation_time,a.region_remarks,a.region_status,b.username ");
    sql += " FROM k_region AS a, k_admin_users AS b ";
    sql += " WHERE a.user_id=b.id ";
    //区域名称搜索
    sql += obj.regionName ? " AND a.regional_name LIKE :regionName " : "";
    sql += " ORDER BY a.creation_time DESC ";
    const countLimit = MANAGER_LIMIT;
    //偏移量
    const offset = (parseInt(obj.page)-1)*countLimit;
    !isCount && (sql += " LIMIT "+offset+","+countLimit);
    return sql;
}
/**
 * @api {post} /region/regionUpdate   修改区域
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName regionUpdate
 * @apiGroup region
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/region/regionUpdate'
 * @apiParam {String} uuid                   	   唯一编码.
 * @apiParam {String} regionName                   区域名称.
 * @apiParam {Integer} regionStatus                (1 特定区域 2不是特定区域).
 * @apiParam {String} regionRemark                 区域备注.
 *
 * @apiSampleRequest /region/regionUpdate
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function regionUpdate(ctx) {
    try {
        // 参数
        let uuid = ctx.request.body.uuid;
        let regionName = ctx.request.body.regionName;
        let regionStatus = ctx.request.body.regionStatus;
        let regionRemark = ctx.request.body.regionRemark;
        let options = {
        	uuid: uuid,
	    	regional_name: regionName,
	    	creation_time: getSecond(),
            region_status: regionStatus,
	    	region_remarks: regionRemark
	    };
	    // 验证参数
	    schema.validate(options, schema.regionUpdate);
	    // 判断是否有重复区域名称
	    let repeatData = await region.isRepeatUpdateRegion(options,['regional_name']);
	    if(repeatData){ ctx.body = NET.error("区域名称不可重复!");return; }
        let regional = await region.regionUpdate(options);
        if(!regional){
	        ctx.body = NET.error("修改区域失败");return;
	    }
	    ctx.body = NET.success("修改区域成功");
    } catch (e) {
    	console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
/**
 * @api {post} /region/regionDelete   删除区域
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName regionDelete
 * @apiGroup region
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/region/regionDelete'
 * @apiParam {String} uuid                   	   唯一编码.
 *
 * @apiSampleRequest /region/regionDelete
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function regionDelete(ctx) {
    try {
        // 参数
        let uuid = ctx.request.body.uuid;
        let options = {
        	uuid: uuid
	    };
	    // 验证参数
	    schema.validate(options, schema.commonParametersUuid);
        let regional = await region.regionDelete(uuid);
        if(!regional){
	        ctx.body = NET.error("删除区域失败");return;
	    }
	    ctx.body = NET.success("删除区域成功");
    } catch (e) {
    	console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
/**
 * @api {post} /region/regionAllList   (选择)区域数据
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName regionAllList
 * @apiGroup region
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/region/regionAllList'
 *
 * @apiSampleRequest /region/regionAllList
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function regionAllList(ctx) {
    try {
        let regionalData = await region.regionAllData(['uuid','regional_name']);
        ctx.body = NET.success({regionalData},"(选择)区域数据");
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