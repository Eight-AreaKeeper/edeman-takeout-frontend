import { request } from '@/utils/request'
import type { PageParams, PageResult } from './types'

// Order status codes, matching the sky-take-out backend's Orders entity.
export const ORDER_STATUS_PENDING_PAYMENT = 1
export const ORDER_STATUS_TO_BE_CONFIRMED = 2
export const ORDER_STATUS_CONFIRMED = 3
export const ORDER_STATUS_DELIVERY_IN_PROGRESS = 4
export const ORDER_STATUS_COMPLETED = 5
export const ORDER_STATUS_CANCELLED = 6

export interface OrderDetail {
  id: number
  name: string
  number: number
  amount: number
}

export interface Order {
  id: number
  number: string
  status: number
  userId: number
  orderTime: string
  checkoutTime?: string
  payMethod: number
  amount: number
  remark?: string
  phone: string
  address: string
  consignee: string
  estimatedDeliveryTime?: string
  deliveryStatus?: number
  deliveryTime?: string
  packAmount?: number
  tablewareNumber?: number
  cancelReason?: string
  rejectionReason?: string
  cancelTime?: string
  orderDetailList?: OrderDetail[]
}

export function getOrderPage(
  params: PageParams & { number?: string; phone?: string; status?: number; beginTime?: string; endTime?: string },
) {
  return request<PageResult<Order>>({ url: '/order/conditionSearch', method: 'get', params })
}

export function getOrderById(id: number) {
  return request<Order>({ url: `/order/details/${id}`, method: 'get' })
}

export function getOrderStatusCounts() {
  return request<{ toBeConfirmed: number; confirmed: number; deliveryInProgress: number }>({
    url: '/order/statistics',
    method: 'get',
  })
}

export function acceptOrder(id: number) {
  return request<void>({ url: '/order/confirm', method: 'put', data: { id } })
}

export function rejectOrder(id: number, rejectionReason: string) {
  return request<void>({ url: '/order/rejection', method: 'put', data: { id, rejectionReason } })
}

export function cancelOrder(id: number, cancelReason: string) {
  return request<void>({ url: '/order/cancel', method: 'put', data: { id, cancelReason } })
}

export function deliverOrder(id: number) {
  return request<void>({ url: `/order/delivery/${id}`, method: 'put' })
}

export function completeOrder(id: number) {
  return request<void>({ url: `/order/complete/${id}`, method: 'put' })
}
