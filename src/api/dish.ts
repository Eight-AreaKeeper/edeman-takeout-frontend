import { request } from '@/utils/request'
import type { PageParams, PageResult } from './types'

export interface DishFlavor {
  name: string
  value: string
}

export interface Dish {
  id?: number
  name: string
  categoryId: number
  categoryName?: string
  price: number
  image: string
  description?: string
  status?: 0 | 1
  updateTime?: string
  flavors?: DishFlavor[]
}

export function getDishPage(params: PageParams & { name?: string; categoryId?: number; status?: number }) {
  return request<PageResult<Dish>>({ url: '/dish/page', method: 'get', params })
}

export function getDishById(id: number) {
  return request<Dish>({ url: `/dish/${id}`, method: 'get' })
}

export function getDishList(params: { categoryId?: number; name?: string }) {
  return request<Dish[]>({ url: '/dish/list', method: 'get', params })
}

export function addDish(data: Dish) {
  return request<void>({ url: '/dish', method: 'post', data })
}

export function editDish(data: Dish) {
  return request<void>({ url: '/dish', method: 'put', data })
}

export function deleteDishes(ids: number[]) {
  return request<void>({ url: '/dish', method: 'delete', params: { ids: ids.join(',') } })
}

export function setDishStatus(ids: number[], status: 0 | 1) {
  return request<void>({ url: `/dish/status/${status}`, method: 'post', params: { id: ids.join(',') } })
}
