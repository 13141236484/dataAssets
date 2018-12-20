/**
 * Created by gaoyu at 2017/7/24 下午5:41
 *
 * Desc :
 */
import * as assets from './controller'

export const baseUrl = '/assets'


export default [
    {
    	// 添加资产
        method: 'Post',
        route: '/assetsCreate',
        handlers: [assets.assetsCreate]
    },{
    	// 资产列表
        method: 'Post',
        route: '/assetsList',
        handlers: [assets.assetsList]
    },{
    	// 删除资产
        method: 'Post',
        route: '/assetsDelete',
        handlers: [assets.assetsDelete]
    },{
    	// 修改资产
        method: 'Post',
        route: '/assetsUpdate',
        handlers: [assets.assetsUpdate]
    },{
        // 上架下架切换
        method: 'Post',
        route: '/assetsSheif',
        handlers: [assets.assetsSheif]
    },{
        // 资产单条数据
        method: 'Post',
        route: '/assetsSingle',
        handlers: [assets.assetsSingle]
    },{
        // (流程)资产数据列表
        method: 'Post',
        route: '/assetsAllList',
        handlers: [assets.assetsAllList]
    },{
        // 上传txt
        method: 'Post',
        route: '/uploadFile',
        handlers: [assets.uploadFile]
    },{
        // 下载txt
        method: 'Post',
        route: '/exportTxtFile',
        handlers: [assets.exportTxtFile]
    },{
        // (详单)资产数据列表
        method: 'Post',
        route: '/assetSpecificationList',
        handlers: [assets.assetSpecificationList]
    },{
        // 读取txt
        method: 'Post',
        route: '/fileTxtContent',
        handlers: [assets.fileTxtContent]
    },{
        // 写入txt
        method: 'Post',
        route: '/writeFileTxtContent',
        handlers: [assets.writeFileTxtContent]
    },{
        // (详单)输入、输出数据
        method: 'Post',
        route: '/assetInOutList',
        handlers: [assets.assetInOutList]
    },
]