/**
 * Created by gaoyu at 2017/7/24 下午5:41
 *
 * Desc :
 */
import * as productionProcess from './controller'

export const baseUrl = '/productionProcess'


export default [
    {
    	// 添加生产过程
        method: 'Post',
        route: '/productionProcessCreate',
        handlers: [productionProcess.productionProcessCreate]
    },{
    	// 生产过程列表
        method: 'Post',
        route: '/productionProcessList',
        handlers: [productionProcess.productionProcessList]
    },{
    	// 删除生产过程
        method: 'Post',
        route: '/productionProcessDelete',
        handlers: [productionProcess.productionProcessDelete]
    },{
    	// 修改生产过程
        method: 'Post',
        route: '/productionProcessUpdate',
        handlers: [productionProcess.productionProcessUpdate]
    },{
        // 关联的生产过程列表
        method: 'Post',
        route: '/associationProcessList',
        handlers: [productionProcess.associationProcessList]
    },{
        // 生产过程关联资产
        method: 'Post',
        route: '/processAssetRelations',
        handlers: [productionProcess.processAssetRelations]
    },{
        // 血缘关系图～
        method: 'Post',
        route: '/bloodMap',
        handlers: [productionProcess.bloodMap]
    },{
        // 依赖->过程数据列表
        method: 'Post',
        route: '/relyOnProcessList',
        handlers: [productionProcess.relyOnProcessList]
    },{
        // 依赖->查看依赖关系表中是否存在
        method: 'Post',
        route: '/dependenceExist',
        handlers: [productionProcess.dependenceExist]
    },{
        // 依赖->依赖关系表入库
        method: 'Post',
        route: '/processDependenceCreate',
        handlers: [productionProcess.processDependenceCreate]
    },{
        // 生产过程/资产 关联表删除
        method: 'Post',
        route: '/processAssetRelationsDelete',
        handlers: [productionProcess.processAssetRelationsDelete]
    },{
        // 依赖->依赖关系表删除
        method: 'Post',
        route: '/processDependenceDelete',
        handlers: [productionProcess.processDependenceDelete]
    },
]