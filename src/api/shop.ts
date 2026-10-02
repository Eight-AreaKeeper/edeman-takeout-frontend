import { request } from '@/utils/request'

export function getShopStatus() {
  return request<0 | 1>({ url: '/shop/status', method: 'get' })
}

export function setShopStatus(status: 0 | 1) {
  return request<void>({ url: `/shop/${status}`, method: 'put' })
}
