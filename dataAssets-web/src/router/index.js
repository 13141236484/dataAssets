import Vue from 'vue'
import Router from 'vue-router'
import store from '../store/index'

/** 登录 */
import Login from '@/page/Login/index'

/** 公共主体 */
import Home from '@/page/Home/index'

/** 参数管理 */

// 域列表
import RegionList from '@/page/Parameter/RegionList/index'
// 介质列表
import MediumList from '@/page/Parameter/MediumList/index'
// 介质 => 路径列表
import PathList from '@/page/Parameter/MediumList/PathList/index'

/** 资产管理 */

// 资产列表
import AssetsList from '@/page/AssetManagement/AssetsList/index'
// 资产明细列表详细
import DetailListDetails from '@/page/AssetManagement/AssetsList/DetailListDetails'
// 资产明细列表
import DetailList from '@/page/AssetManagement/DetailList/index'




/** 生产线 */

// 生产线列表
import ProductionLineList from '@/page/ProductionLine/ProductionLineList/index'
// 查看血缘关系
import BloodRelationship from '@/page/ProductionLine/ProductionLineList/BloodRelationship'
// 生产线详单
import ProductionDetailedList from '@/page/ProductionLine/ProductionLineList/ProductionDetailedList'
// 生产线 => 工艺
import ProductionLineDetails from '@/page/ProductionLine/ProductionLineList/ProductionLineDetails'
// 工艺 => 血缘关系
import TechnologyContact from '@/page/ProductionLine/ProductionLineList/componets/TechnologyContact'
// 工艺　=> 过程
import RelationProcess from '@/page/ProductionLine/ProductionLineList/RelationProcess'
// 过程 => 数据资产
import AssociatedDataDssets from '@/page/ProductionLine/ProductionLineList/AssociatedDataDssets'
/** 生产过程 */



import D3 from '@/page/common/d3/index'

Vue.use(Router)

 const router = new Router({
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login,
    },
    {
      path: '/',
      redirect: '/home/AssetsList'
    },
    {
      path: '/home',
      name: 'Home',
      component: Home,
      meta: {
        requireAuth: true
      },
      children: [
        // 域列表
        {
          path: 'RegionList',
          name: 'RegionList',
          component: RegionList,
          meta: {
            requireAuth: true,
            route: 'Parameter'
          }
        },
        // 路径列表
        {
          path: 'MediumList',
          name: 'MediumList',
          component: MediumList,
          meta: {
            requireAuth: true,
            route: 'Parameter'
          }
        },
        // 介质 => 路径
        {
          path: 'PathList/:num',
          name: 'PathList',
          component: PathList,
          meta: {
            requireAuth: true,
            route: 'Parameter'
          }
        },
        // 资产列表
        {
          path: 'AssetsList',
          name: 'AssetsList',
          component: AssetsList,
          meta: {
            requireAuth: true,
            route: 'AssetManagement'
          }
        },
        // 资产列表详细
        {
          path: 'DetailListDetails/:num',
          name: 'DetailListDetails',
          component: DetailListDetails,
          meta: {
            requireAuth: true,
            route: 'AssetManagement'
          }
        },
        // 资产明细列表
        {
          path: 'DetailList',
          name: 'DetailList',
          component: DetailList,
          meta: {
            requireAuth: true,
            route: 'AssetManagement'
          }
        },
        // 生产线列表
        {
          path: 'ProductionLineList',
          name: 'ProductionLineList',
          component: ProductionLineList,
          meta: {
            requireAuth: true,
            route: 'ProductionLine'
          }
        },
        // 查看血缘关系
        {
          path: 'BloodRelationship/:num',
          name: 'BloodRelationship',
          component: BloodRelationship,
          meta: {
            requireAuth: true,
            route: 'ProductionLine'
          }
        },
        // 生产线详单
        {
          path: 'ProductionDetailedList',
          name: 'ProductionDetailedList',
          component: ProductionDetailedList,
          meta: {
            requireAuth: true,
            route: 'ProductionLine'
          }
        },
        // 生产线 => 工艺
        {
          path: 'ProductionLineDetails/:num',
          name: 'ProductionLineDetails',
          component: ProductionLineDetails,
          meta: {
            requireAuth: true,
            route: 'ProductionLine'
          }
        },
        // 工艺 => 血缘关系
        {
          path: 'TechnologyContact/:num',
          name: 'TechnologyContact',
          component: TechnologyContact,
          meta: {
            requireAuth: true,
            route: 'ProductionLine'
          }
        },
        // 工艺 => 过程
        {
          path: 'RelationProcess/:num',
          name: 'RelationProcess',
          component: RelationProcess,
          meta: {
            requireAuth: true,
            route: 'ProductionLine'
          }
        },
        // 生产过程 => 关联数据资产
        {
          path: 'AssociatedDataDssets/:num',
          name: 'AssociatedDataDssets',
          component: AssociatedDataDssets,
          meta: {
            requireAuth: true,
            route: 'ProductionLine'
          }
        },
        {
          path: 'd3',
          name: 'd3',
          component: D3,
          meta: {
            requireAuth: true
          }
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  let username = window.localStorage.getItem('username')
  //获取store里面的token
  let token = window.localStorage.getItem('token')
  // 验证是否需要登陆
  if (to.meta.requireAuth) {
    // 查询本地存储信息是否已经登陆
    if (username && token) {
        next();
    } else {
      next({
        // 未登录则跳转至login页面
        path: '/login',
        // 登陆成功后回到当前页面，这里传值给login页面，to.fullPath为当前点击的页面
        query: {redirect: to.fullPath}
      });
    }
  } else {
    next();
  }
});

export default router