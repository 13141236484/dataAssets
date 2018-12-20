/**
 * Created by gaoyu at 2017/7/24 下午5:41
 *
 * Desc :
 */
import * as medium from './controller'

export const baseUrl = '/medium'


export default [
    {
    	// 添加介质
        method: 'Post',
        route: '/mediumCreate',
        handlers: [medium.mediumCreate]
    },{
    	// 介质列表
        method: 'Post',
        route: '/mediumList',
        handlers: [medium.mediumList]
    },{
    	// 删除介质
        method: 'Post',
        route: '/mediumDelete',
        handlers: [medium.mediumDelete]
    },{
    	// 修改介质
        method: 'Post',
        route: '/mediumUpdate',
        handlers: [medium.mediumUpdate]
    },{
        // 查看单条介质
        method: 'Post',
        route: '/mediumSingle',
        handlers: [medium.mediumSingle]
    },{
        // 查看介质名称数据
        method: 'Post',
        route: '/mediumAllList',
        handlers: [medium.mediumAllList]
    },
]