/**
 * Created by gaoyu at 2017/7/24 下午5:41
 *
 * Desc :
 */
import * as productionEngineering from './controller'

export const baseUrl = '/productionEngineering'


export default [
    {
    	// 添加生产工艺
        method: 'Post',
        route: '/productionEngineeringCreate',
        handlers: [productionEngineering.productionEngineeringCreate]
    },{
    	// 生产工艺列表
        method: 'Post',
        route: '/productionEngineeringList',
        handlers: [productionEngineering.productionEngineeringList]
    },{
    	// 删除生产工艺
        method: 'Post',
        route: '/productionEngineeringDelete',
        handlers: [productionEngineering.productionEngineeringDelete]
    },{
    	// 修改生产工艺
        method: 'Post',
        route: '/productionEngineeringUpdate',
        handlers: [productionEngineering.productionEngineeringUpdate]
    },{
        // 生产工艺关联生产过程
        method: 'Post',
        route: '/technologyProcessRelations',
        handlers: [productionEngineering.technologyProcessRelations]
    },{
        // (流程)生产工艺列表
        method: 'Post',
        route: '/stepProductionEngineeringList',
        handlers: [productionEngineering.stepProductionEngineeringList]
    },
]