/**
 * Created by gaoyu at 2017/7/24 下午5:41
 *
 * Desc :
 */
import * as adminUser from './controller'

export const baseUrl = '/adminUser'


export default [
    {
        method: 'Post',
        route: '/login',
        handlers: [adminUser.userLogin]
    },
    {
        method: 'Post',
        route: '/createUser',
        handlers: [adminUser.createUser]
    },
    {
        method: 'Post',
        route: '/loginOut',
        handlers: [adminUser.loginOut]
    },
]