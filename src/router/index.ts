import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { installGuards } from './guards'

export interface RouteMeta {
  title: string
  icon?: string
  hidden?: boolean
  public?: boolean
  affix?: boolean
}

declare module 'vue-router' {
  interface RouteMeta {
    title: string
    icon?: string
    hidden?: boolean
    public?: boolean
    affix?: boolean
  }
}

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('@/views/login/LoginView.vue'),
    meta: { title: 'Login', public: true, hidden: true },
  },
  {
    path: '/404',
    component: () => import('@/views/not-found/NotFoundView.vue'),
    meta: { title: 'Not Found', public: true, hidden: true },
  },
  {
    path: '/',
    component: () => import('@/layout/AppLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { title: 'Dashboard', icon: 'Odometer', affix: true },
      },
      {
        path: 'order',
        name: 'Order',
        component: () => import('@/views/order/OrderView.vue'),
        meta: { title: 'Orders', icon: 'Tickets' },
      },
      {
        path: 'category',
        name: 'Category',
        component: () => import('@/views/category/CategoryView.vue'),
        meta: { title: 'Categories', icon: 'Menu' },
      },
      {
        path: 'dish',
        name: 'Dish',
        component: () => import('@/views/dish/DishListView.vue'),
        meta: { title: 'Dishes', icon: 'Dish' },
      },
      {
        path: 'dish/add',
        name: 'DishForm',
        component: () => import('@/views/dish/DishFormView.vue'),
        meta: { title: 'Add Dish', hidden: true },
      },
      {
        path: 'setmeal',
        name: 'Setmeal',
        component: () => import('@/views/setmeal/SetmealListView.vue'),
        meta: { title: 'Set Meals', icon: 'Box' },
      },
      {
        path: 'setmeal/add',
        name: 'SetmealForm',
        component: () => import('@/views/setmeal/SetmealFormView.vue'),
        meta: { title: 'Add Set Meal', hidden: true },
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('@/views/statistics/StatisticsView.vue'),
        meta: { title: 'Statistics', icon: 'TrendCharts' },
      },
      {
        path: 'statistics/detailed',
        name: 'DetailedReport',
        component: () => import('@/views/statistics/DetailedReportView.vue'),
        meta: { title: 'Detailed Report', hidden: true },
      },
      {
        path: 'employee',
        name: 'Employee',
        component: () => import('@/views/employee/EmployeeListView.vue'),
        meta: { title: 'Employees', icon: 'UserFilled' },
      },
      {
        path: 'employee/add',
        name: 'EmployeeForm',
        component: () => import('@/views/employee/EmployeeFormView.vue'),
        meta: { title: 'Add Employee', hidden: true },
      },
      {
        path: 'notifications',
        name: 'Notifications',
        component: () => import('@/views/notifications/NotificationsView.vue'),
        meta: { title: 'Notifications', icon: 'Bell' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    meta: { title: 'Not Found', hidden: true },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 }
  },
})

installGuards(router)

export default router
