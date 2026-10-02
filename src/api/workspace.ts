import { request } from '@/utils/request'

export interface BusinessData {
  turnover: number
  validOrderCount: number
  orderCompletionRate: number
  unitPrice: number
  newUsers: number
}

export interface OrderOverview {
  waitingOrders: number
  deliveredOrders: number
  completedOrders: number
  cancelledOrders: number
  allOrders: number
}

export interface DishOverview {
  sold: number
  discontinued: number
}

export interface SetmealOverview {
  sold: number
  discontinued: number
}

export function getBusinessData() {
  return request<BusinessData>({ url: '/workspace/businessData', method: 'get' })
}

export function getOrderOverview() {
  return request<OrderOverview>({ url: '/workspace/overviewOrders', method: 'get' })
}

export function getDishOverview() {
  return request<DishOverview>({ url: '/workspace/overviewDishes', method: 'get' })
}

export function getSetmealOverview() {
  return request<SetmealOverview>({ url: '/workspace/overviewSetmeals', method: 'get' })
}
