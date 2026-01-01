import type { RouteRecordRaw } from 'vue-router'

/**
 * 基础路由
 * @type { RouteRecordRaw[] }
 */

const constantRouterMap: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    redirect: { name: 'HomeIndex' },
    children: [
      {
        path: '/',
        name: 'HomeIndex',
        component: () => import('@/views/home/Index.vue')
      },
      {
        path: '/example',
        name: 'ExampleHelloIndex',
        component: () => import('@/views/example/hello/Index.vue')
      }
    ]
  }
]

export default constantRouterMap
