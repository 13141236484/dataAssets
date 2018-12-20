/**
 * Created by gaoyu at 2018/7/30 下午2:53
 *
 * Desc :
 */
import {beltline,beltlineBatchRelation,
    // 工艺表
    processBatch,
    // 过程表
    productionProcess,
    // 依赖关系表
    processDependence,
    // 过程资产关联表
    processAssetsRelation,
    // 资产表
    assets,
    // 介质表
    medium,
    // 路径表
    path
} from '../../modles';
import {isEmpty,getSecond} from '../../utils/importUtils';
import {NET,MANAGER_LIMIT,YAMLURL,TXTURl} from "../../config/config";
import sequelize from '../../modles/db'
//验证参数
const schema = require('../../modles/schema');
//唯一编码
const uuidv4 = require('uuid/v4');
// 导出文件
const fs = require('fs');
const paths = require('path')
const moment = require('moment');
// 压缩包使用
const send = require('koa-send');
const archiver = require('archiver');
// 验证文件内容
const validator = require('validator');
const iconv = require('iconv-lite');

/**
 * @api {post} /beltline/beltlineCreate   添加生产线
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName beltlineCreate
 * @apiGroup beltline
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/beltline/beltlineCreate'
 * @apiParam {String} beltlineName                     生产线名称.
 * @apiParam {String} beltlineRemark                   生产线备注.
 *
 * @apiSampleRequest /beltline/beltlineCreate
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function beltlineCreate(ctx) {
    try {
        let uuid = uuidv4();
        // 参数
        let beltlineName = ctx.request.body.beltlineName;
        let beltlineRemark = ctx.request.body.beltlineRemark;
        // 用户信息
        let currentUser = ctx.state.user;
        let options = {
        	uuid: uuid,
	    	beltline_name: beltlineName,
	    	creation_time: getSecond(),
	    	user_id: currentUser.id,
            beltline_remarks: beltlineRemark
	    };
	    // 验证参数
	    schema.validate(options, schema.beltlineCreate);
	    // 判断是否有重复生产线名称
	    let repeatData = await beltline.isRepeatBeltline(beltlineName,['beltline_name']);
	    if(repeatData){ ctx.body = NET.error("生产线名称不可重复!");return; }
        let beltlineal = await beltline.beltlineCreate(options);
        if(!beltlineal){
	        ctx.body = NET.error("添加生产线失败");return;
	    }
	    ctx.body = NET.success("添加生产线成功");
    } catch (e) {
    	console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
/**
 * @api {post} /beltline/beltlineList   生产线列表
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName beltlineList
 * @apiGroup beltline
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/beltline/beltlineList'
 * @apiParam {String}  beltlineName            生产线名称.
 * @apiParam {Integer} page                  页码.
 *
 * @apiSampleRequest /beltline/beltlineList
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function beltlineList(ctx) {
    try {
    	// 参数
	    let beltlineName = ctx.request.body.beltlineName.replace(/(^\s*)|(\s*$)/g,"");
	    let page = ctx.request.body.page ? ctx.request.body.page : 1;
	    let options = {
        	page: page,
	    	beltlineName: beltlineName
	    };
        //生产线总条数
        let sqlcount= await getBeltlineSql(options,true);
        let count = await sequelize.query(sqlcount,{
            type: sequelize.QueryTypes.SELECT ,
            replacements:{
                beltlineName:'%'+beltlineName+'%'
            }
        });
        //生产线数据
        let sql= await getBeltlineSql(options,false);
        let beltlineData = await sequelize.query(sql,{
            type: sequelize.QueryTypes.SELECT,
            replacements:{
                beltlineName:'%'+beltlineName+'%'
            }
        });
	    ctx.body = NET.success({beltlineData,count},"生产线列表");
    } catch (e) {
    	console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
//生产线列表 获取where条件
async function getBeltlineSql(obj,isCount = false){
    let sql = "SELECT";
    //生产线总条数
    isCount && (sql += " count(a.id) AS count ");
    //生产线数据
    !isCount && (sql +=" a.uuid,a.beltline_name,a.creation_time,a.beltline_remarks,b.username ");
    sql += " FROM k_beltline AS a, k_admin_users AS b ";
    sql += " WHERE a.user_id=b.id ";
    //生产线名称搜索
    sql += obj.beltlineName ? " AND a.beltline_name LIKE :beltlineName " : "";
    sql += " ORDER BY a.creation_time DESC ";
    const countLimit = MANAGER_LIMIT;
    //偏移量
    const offset = (parseInt(obj.page)-1)*countLimit;
    !isCount && (sql += " LIMIT "+offset+","+countLimit);
    return sql;
}
/**
 * @api {post} /beltline/stepBeltlineList   (详单)生产线列表
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName stepBeltlineList
 * @apiGroup beltline
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/beltline/stepBeltlineList'
 * @apiParam {String}  beltlineName            生产线名称.
 *
 * @apiSampleRequest /beltline/stepBeltlineList
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function stepBeltlineList(ctx) {
    try {
        // 参数
        let beltlineName = ctx.request.body.beltlineName;
        let options = {
            beltline_name: beltlineName
        };
        // 生产线数据
        let beltlineData = await beltline.beltlineAllData(options,['uuid','beltline_name','beltline_remarks']);
        ctx.body = NET.success({beltlineData},"生产线列表");
    } catch (e) {
        console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
/**
 * @api {post} /beltline/beltlineUpdate   修改生产线
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName beltlineUpdate
 * @apiGroup beltline
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/beltline/beltlineUpdate'
 * @apiParam {String} uuid                   	     唯一编码.
 * @apiParam {String} beltlineName                   生产线名称.
 * @apiParam {String} beltlineRemark                 生产线备注.
 *
 * @apiSampleRequest /beltline/beltlineUpdate
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function beltlineUpdate(ctx) {
    try {
        // 参数
        let uuid = ctx.request.body.uuid;
        let beltlineName = ctx.request.body.beltlineName;
        let beltlineRemark = ctx.request.body.beltlineRemark;
        let options = {
        	uuid: uuid,
	    	beltline_name: beltlineName,
	    	creation_time: getSecond(),
            beltline_remarks: beltlineRemark
	    };
	    // 验证参数
	    schema.validate(options, schema.beltlineUpdate);
	    // 判断是否有重复生产线名称
	    let repeatData = await beltline.isRepeatUpdateBeltline(uuid,beltlineName,['beltline_name']);
	    if(repeatData){ ctx.body = NET.error("生产线名称不可重复!");return; }
        let beltlineal = await beltline.beltlineUpdate(options);
        if(!beltlineal){
	        ctx.body = NET.error("修改生产线失败");return;
	    }
	    ctx.body = NET.success("修改生产线成功");
    } catch (e) {
    	console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
/**
 * @api {post} /beltline/beltlineDelete   删除生产线
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName beltlineDelete
 * @apiGroup beltline
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/beltline/beltlineDelete'
 * @apiParam {String} uuid                   	   唯一编码.
 *
 * @apiSampleRequest /beltline/beltlineDelete
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function beltlineDelete(ctx) {
    try {
        // 参数
        let uuid = ctx.request.body.uuid;
        let options = {
        	uuid: uuid
	    };
	    // 验证参数
	    schema.validate(options, schema.commonParametersUuid);
        let beltlineal = await beltline.beltlineDelete(uuid);
        if(!beltlineal){
	        ctx.body = NET.error("删除生产线失败");return;
	    }
	    ctx.body = NET.success("删除生产线成功");
    } catch (e) {
    	console.log(e)
        if (e.name === 'ValidationError') {
          return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
/**
 * @api {post} /beltline/makeConfigurationFile   生成配置文件
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName makeConfigurationFile
 * @apiGroup beltline
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/beltline/makeConfigurationFile'
 * @apiParam {String} beltlineId                             生产线唯一编码.
 *
 * @apiSampleRequest /beltline/makeConfigurationFile
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function makeConfigurationFile(ctx) {
    try {
        // 参数
        let beltlineId = ctx.request.body.beltlineId;
        let options = {
            uuid: beltlineId
        };
        // 验证参数
        schema.validate(options, schema.commonParameters);
        // 取出所有工艺ID
        let technologyIdS = await processBatch.findAll({ where:{beltline_id:beltlineId},attributes:['uuid'],raw:true });
        // 所有工艺ID
        let technologyIdArr = technologyIdS.map(function(modle){
            return modle.uuid;
        });
        // 查看是否有生产工艺
        if(technologyIdArr.length){
            // 根据所有工艺ID 取出每个工艺对应的所有过程ID
            let processIdS = await productionProcess.findAll({ where:{batch_id:technologyIdArr},attributes:['uuid'],raw:true });
            // 所有过程ID
            let processIdArr = processIdS.map(function(modle){
                return modle.uuid;
            });
            // 查看是否有生产过程
            if(processIdArr.length){
                // 定义三个配置文件
                let yamlPathInfo = {
                    assets: createYamlPathDemo({beltline_id: beltlineId}, {key: "assets"}),
                    process: createYamlPathDemo({beltline_id: beltlineId}, {key: "process"}),
                    medium: createYamlPathDemo({beltline_id: beltlineId}, {key: "medium"}),
                };

                /**
                 * 介质配置文件
                 */
                // 根据所有工艺下所有过程ID 取出所有资产ID
                let allAssetIdS = await processAssetsRelation.findAll({ where:{process_id:processIdArr},attributes:['asset_id'],raw:true });
                // 所有资产ID
                let allRepeatAssetIdArr = allAssetIdS.map(function(modle){
                    return modle.asset_id;
                });
                // 资产ID去重
                let set = new Set(allRepeatAssetIdArr);
                let allAssetIdArr = Array.from(set);
                // 根据所有资产ID 取出所有介质ID
                let allMediumIdS = await assets.findAll({ where:{uuid:allAssetIdArr},attributes:['medium_id'],raw:true });
                // 所有介质ID
                let allRepeatMediumIdArr = allMediumIdS.map(function(modle){
                    return modle.medium_id;
                });
                // 介质ID去重
                let sets = new Set(allRepeatMediumIdArr);
                let allMediumIdArr = Array.from(sets);
                // 查询出所有介质数据
                let mediumData = await medium.findAll({ where:{uuid:allMediumIdArr},attributes:['uuid','medium_type_name','medium_example'],raw:true });
                for(let mediumVal of Object.values(mediumData)){
                    yamlPathInfo.medium.writeStream.write('"'+mediumVal.uuid+'":' +"\n");
                    let mediumExample = JSON.parse(mediumVal.medium_example);
                    if(mediumVal.medium_type_name == 'Hbase'){
                        yamlPathInfo.medium.writeStream.write('       "'+mediumVal.medium_type_name+'":' +"\n");
                        yamlPathInfo.medium.writeStream.write('       '+'url: '+'"'+mediumExample.URL+'"'+"\n");
                        yamlPathInfo.medium.writeStream.write('       '+'zookeeper: '+'"'+mediumExample.zookeeper+'"'+"\n");
                        yamlPathInfo.medium.writeStream.write('       '+'clientPort: '+'"'+mediumExample.clientPort+'"'+"\n");
                    }
                    if(mediumVal.medium_type_name == 'Hdfs'){
                        yamlPathInfo.medium.writeStream.write('       "'+mediumVal.medium_type_name+'":' +"\n");
                        yamlPathInfo.medium.writeStream.write('       '+'root: '+'"'+mediumExample.root+'"'+"\n");
                        yamlPathInfo.medium.writeStream.write('       '+'username: '+'"'+mediumExample.username+'"'+"\n");
                        yamlPathInfo.medium.writeStream.write('       '+'group: '+'"'+mediumExample.group+'"'+"\n");
                    }
                    if(mediumVal.medium_type_name == 'Mysql'){
                        yamlPathInfo.medium.writeStream.write('       "'+mediumVal.medium_type_name+'":' +"\n");
                        yamlPathInfo.medium.writeStream.write('       '+'url: '+'"'+mediumExample.url+'"'+"\n");
                        yamlPathInfo.medium.writeStream.write('       '+'user: '+'"'+mediumExample.user+'"'+"\n");
                        yamlPathInfo.medium.writeStream.write('       '+'passwd: '+'"'+mediumExample.passwd+'"'+"\n");
                    }
                }

                /**
                 * 资产配置文件
                 */
                // 根据所有资产ID 查询出需要的资产数据
                let allAssetsData = await assets.findAll({ where:{uuid:allAssetIdArr},attributes:['uuid','asset_name','ifstructure','structure_type_name','medium_id','path_id','ifstructure','enclosure_path'],raw:true });
                for(let assetVal of Object.values(allAssetsData)){
                    // 查询出路径名称
                    let pathName = await path.findOne({ where:{uuid:assetVal.path_id},attributes:['detailed_path'],raw:true });
                    assetVal.path_name = pathName.detailed_path;
                }
                // 写入配置文件
                for(let assetsVal of Object.values(allAssetsData)){
                    yamlPathInfo.assets.writeStream.write('"'+assetsVal.uuid+'":' +"\n");
                    yamlPathInfo.assets.writeStream.write('       '+'name: '+'"'+assetsVal.asset_name+'"'+"\n");
                    yamlPathInfo.assets.writeStream.write('       '+'ifstructure: '+'"'+assetsVal.ifstructure+'"'+"\n");
                    yamlPathInfo.assets.writeStream.write('       '+'structure_type_name: '+'"'+assetsVal.structure_type_name+'"'+"\n");
                    yamlPathInfo.assets.writeStream.write('       '+'storage: '+'"'+assetsVal.medium_id+'"'+"\n");
                    yamlPathInfo.assets.writeStream.write('       '+'location: '+'"'+assetsVal.path_name+'"'+"\n");
                    if(assetsVal.structure_type_name == 'avro-javabean' && assetsVal.enclosure_path){
                        let jsonObjString = fs.readFileSync(TXTURl + assetsVal.enclosure_path);
                        let str = iconv.decode(jsonObjString, 'gbk');
                        let obj = JSON.parse(str);
                        yamlPathInfo.assets.writeStream.write('       '+'structure: '+obj.namespace+'.'+obj.name+'.avsc'+"\n");
                    }else{
                        yamlPathInfo.assets.writeStream.write('       '+'structure: '+'""'+"\n");
                    }
                }

                /**
                 * 过程配置文件
                 */
                // 遍历每一个过程 查询出每个过程被依赖的过程ID
                for(var i = 0; i < processIdArr.length; i++){
                    // 根据每个过程ID 取出每个过程被依赖的×过程ID
                    let dependProcessIdS = await processDependence.findAll({ where:{son_process_id:processIdArr[i]},attributes:['par_process_id'],raw:true });
                    // 所有被依赖过程ID
                    let dependProcessIdArr = dependProcessIdS.map(function(modle){
                        return modle.par_process_id;
                    });
                    // 取出 当前过程对应的所有资产ID和状态
                    let assetIdStateData = await processAssetsRelation.findAll({ where:{process_id:processIdArr[i]},attributes:['asset_id','put_status'],raw:true });
                    // 遍历出 输入、输出 的资产ID
                    var inputIdArr = [];
                    var outputIdArr = [];
                    for(let value of Object.values(assetIdStateData)){
                        // 输入的资产ID
                        if(value.put_status == 'in'){
                            inputIdArr.push(value.asset_id);
                        }
                        // 输出的资产ID
                        if(value.put_status == 'out'){
                            outputIdArr.push(value.asset_id);
                        }
                    }
                    // 查询 输入的资产数据
                    if(inputIdArr.length){
                        var inputAssetData = await assets.findAll({ where:{uuid:inputIdArr},attributes:['uuid','asset_name'],raw:true });
                    }else{
                        var inputAssetData = [];
                    }
                    // 查询 输出的资产数据
                    if(outputIdArr.length){
                        var outputAssetData = await assets.findAll({ where:{uuid:outputIdArr},attributes:['uuid','asset_name'],raw:true });
                    }else{
                        var outputAssetData = [];
                    }
                    // 当前过程ID
                    yamlPathInfo.process.writeStream.write('"'+processIdArr[i]+'":' +"\n");
                    yamlPathInfo.process.writeStream.write('   "dependence'+'": ' +"\n");
                    yamlPathInfo.process.writeStream.write('        '+'"-": '+'"0"'+"\n");
                    // 当前过程被依赖的过程ID
                    if(dependProcessIdS.length){
                        for(let yilai of Object.values(dependProcessIdS)){
                            yamlPathInfo.process.writeStream.write('       '+'"-": '+'"'+yilai.par_process_id+'"'+"\n");
                        }
                    }
                    // 当前过程输入的资产
                    yamlPathInfo.process.writeStream.write('   "input'+'":' +"\n");
                    if(inputAssetData.length){
                        for(let inputVal of Object.values(inputAssetData)){
                            yamlPathInfo.process.writeStream.write('       '+' '+inputVal.uuid+': "'+inputVal.asset_name+'"'+"\n");
                        }
                    }
                    // 当前过程输出的资产
                    yamlPathInfo.process.writeStream.write('   "output'+'":' +"\n");
                    if(outputAssetData.length){
                        for(let outputVal of Object.values(outputAssetData)){
                            yamlPathInfo.process.writeStream.write('       '+' '+outputVal.uuid+': "'+outputVal.asset_name+'"'+"\n");
                        }
                    }
                }
                // 关闭可写数据句柄
                for (let value of Object.values(yamlPathInfo)) {
                    value.writeStream.end();
                }
                // 输出所有文件路径
                var resArr = [];
                for (let path of Object.values(yamlPathInfo)) {
                    let jsonObjString = fs.readFileSync(paths.resolve(__dirname, '../../../') + path.rootPath);
                    let str = iconv.decode(jsonObjString, 'gbk');
                    if(str.length != 0){
                        resArr.push(path.rootPath);
                    }
                }
                ctx.body = NET.success(resArr);
            }else{
                return ctx.body = NET.error("该生产线未发现生产过程！");
            }
        }else{
            return ctx.body = NET.error("该生产线未发现生产工艺！");
        }
    } catch (e) {
        console.log(e)
        if (e.name === 'ValidationError') {
            return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
function createYamlPathDemo(objPro, obj = {key: "key", alias: "key"}) {
    // yaml 文件所在文件夹全路径
    const yamlPath = YAMLURL + objPro.beltline_id + "/";
    // 建立目录
    confirmPath(yamlPath);
    var time = moment().format("YYYY-MM-DD");
    // 文件名字
    const fileName = obj.key + "_" + time + ".yaml";
    // 相对于根目录的路径
    const rootPath = "/yaml/" + objPro.beltline_id + "/" + fileName;
    const proPath = "/yaml/" + objPro.beltline_id + "/";
    // 全路径
    const yamlFilePath = yamlPath + fileName;
    // 创建可写文件句柄
    const writeStream = fs.createWriteStream(yamlFilePath);
    switch (true) {
        case obj.key == "assets":
            // writeStream.write(obj.alias + ":\n");
            break;
        case obj.key == "process":
            // writeStream.write(obj.alias + ":\n");
            break;
        case obj.key == "medium":
            // writeStream.write(obj.alias + ":\n");
            break;
        default :
            break;
    }
    return {fileName, rootPath, yamlFilePath, proPath, writeStream, yamlPath};
}
// 创建目录
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
 * @api {post} /beltline/exportYamlFile         导出配置文件
 * @apiPermission 知识体系库
 * @apiVersion 1.0.0
 * @apiName exportYamlFile
 * @apiGroup beltline
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{ }'
 * 'http://localhost:3000/beltline/exportYamlFile'
 * @apiParam {String} yamlPath                  yaml 文件的路径.
 *
 *
 * @apiSampleRequest /beltline/exportYamlFile
 * @apiSuccessExample {json} Response 200 Example
 *     HTTP/1.1 200 OK
 *
 
 *
 * @apiUse ERROR
 */
export async function exportYamlFile(ctx) {
    try {
        let yamlPath = ctx.request.body.yamlPath;
        let options = {
            uuid: yamlPath
        };
        // 验证参数
        schema.validate(options, schema.commonParameters);
        ctx.attachment(yamlPath);
        await send(ctx, yamlPath);
    } catch (e) {
        console.log(e)
        if (e.name === 'ValidationError') {
            return ctx.body = NET.error("参数错误");
        }
        return ctx.body = NET.networkError("网络请求错误，请重试!");
    }
}
/**
 * @api {post} /beltline/beltlineAssociationProcess   生产线关联生产工艺(未使用)
 * @apiPermission 用户
 * @apiVersion 1.0.0
 * @apiName beltlineAssociationProcess
 * @apiGroup beltline
 * @apiExample 请求示例:
 * curl -H "Content-Type: application/json" -X POST -d '{  }' 'http://localhost:3003/beltline/beltlineAssociationProcess'
 * @apiParam {String} beltlineId                         生产线ID.
 * @apiParam {Object} processId                           生产工艺ID.
 *
 * @apiSampleRequest /beltline/beltlineAssociationProcess
 *
 * @apiUse SUCCESS
 *
 * @apiUse ERROR
 */
export async function beltlineAssociationProcess(ctx) {
    try {
        // 参数
        let beltlineId = ctx.request.body.beltlineId;
        let processId = ctx.request.body.processId;
        let options = {
            beltline_id: beltlineId,
            batch_id: processId
        };
        // 验证参数
        schema.validate(options, schema.beltlineAssociationProcess);
        var arr =[];
        //生产线关联生产工艺需要的字段值
        for(var i = 0; i < processId.length; i++){
            let value = {};
            let beltlineBatchRelationObj = await beltlineBatchRelation.findOne({ where:{beltline_id:beltlineId,batch_id:processId[i]},raw:true });
            if(!beltlineBatchRelationObj){
                value.beltline_id = beltlineId;
                value.batch_id = processId[i];
                arr.push(value);
            }
        }
        if(arr.length){
            //生产线关联生产工艺入库
            let beltlineBatchRelationData = await beltlineBatchRelation.bulkCreate(arr);
            if (beltlineBatchRelationData) {
                ctx.body = NET.success("生产线关联生产工艺成功！");
            } else {
                ctx.body = NET.error("生产线关联生产工艺失败!");
            }
        }else{
            ctx.body = NET.success("生产线关联生产工艺已经存在");
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