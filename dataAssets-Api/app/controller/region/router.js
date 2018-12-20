/**
 * Created by gaoyu at 2017/7/24 下午5:41
 *
 * Desc :
 */
import * as region from './controller'

export const baseUrl = '/region'


export default [
    {
    	// 添加区域
        method: 'Post',
        route: '/regionCreate',
        handlers: [region.regionCreate]
    },{
    	// 区域列表
        method: 'Post',
        route: '/regionList',
        handlers: [region.regionList]
    },{
    	// 删除区域
        method: 'Post',
        route: '/regionDelete',
        handlers: [region.regionDelete]
    },{
    	// 修改区域
        method: 'Post',
        route: '/regionUpdate',
        handlers: [region.regionUpdate]
    },{
        // (选择)区域数据
        method: 'Post',
        route: '/regionAllList',
        handlers: [region.regionAllList]
    },
]