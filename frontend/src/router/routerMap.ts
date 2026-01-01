import type { RouteRecordRaw } from 'vue-router'

/**
 * 基础路由
 * @type { RouteRecordRaw[] }
 */

const constantRouterMap: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Example',
    redirect: { name: 'ExampleHelloIndex' },
    children: [
      {
        path: '/example',
        name: 'ExampleHelloIndex',
        component: () => import('@/views/example/hello/Index.vue')
      }
    ]
  }
]

export default constantRouterMap