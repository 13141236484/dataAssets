/**
 * Created by gaoyu at 2017/7/24 下午5:41
 *
 * Desc :
 */
import * as beltline from './controller'

export const baseUrl = '/beltline'


export default [
    {
    	// 添加生产线
        method: 'Post',
        route: '/beltlineCreate',
        handlers: [beltline.beltlineCreate]
    },{
    	// 生产线列表
        method: 'Post',
        route: '/beltlineList',
        handlers: [beltline.beltlineList]
    },{
    	// 删除生产线
        method: 'Post',
        route: '/beltlineDelete',
        handlers: [beltline.beltlineDelete]
    },{
    	// 修改生产线
        method: 'Post',
        route: '/beltlineUpdate',
        handlers: [beltline.beltlineUpdate]
    },{
        // 生产线关联生产工艺
        method: 'Post',
        route: '/beltlineAssociationProcess',
        handlers: [beltline.beltlineAssociationProcess]
    },{
        // 生产线关联生产工艺
        method: 'Post',
        route: '/stepBeltlineList',
        handlers: [beltline.stepBeltlineList]
    },{
        // 生成配置文件
        method: 'Post',
        route: '/makeConfigurationFile',
        handlers: [beltline.makeConfigurationFile]
    },{
        // 导出配置文件
        method: 'Post',
        route: '/exportYamlFile',
        handlers: [beltline.exportYamlFile]
    },
]