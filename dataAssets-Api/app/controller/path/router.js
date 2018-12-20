/**
 * Created by gaoyu at 2017/7/24 下午5:41
 *
 * Desc :
 */
import * as path from './controller'

export const baseUrl = '/path'


export default [
    {
    	// 添加路径
        method: 'Post',
        route: '/pathCreate',
        handlers: [path.pathCreate]
    },{
    	// 路径列表
        method: 'Post',
        route: '/pathList',
        handlers: [path.pathList]
    },{
    	// 删除路径
        method: 'Post',
        route: '/pathDelete',
        handlers: [path.pathDelete]
    },{
    	// 修改路径
        method: 'Post',
        route: '/pathUpdate',
        handlers: [path.pathUpdate]
    },{
        // 查看路径名称数据
        method: 'Post',
        route: '/pathAllList',
        handlers: [path.pathAllList]
    },{
        // 介质下-路径名称数据
        method: 'Post',
        route: '/mediumPathList',
        handlers: [path.mediumPathList]
    },
]