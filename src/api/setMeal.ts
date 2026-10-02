import { request } from '@/utils/request'
import type { PageParams, PageResult } from './types'

export interface SetmealDish {
  dishId: number
  name: string
  price: number
  copies: number
}

export interface Setmeal {
  id?: number
  name: string
  categoryId: number
  categoryName?: string
  price: number
  image: string
  description?: string
  status?: 0 | 1
  updateTime?: string
  setmealDishes?: SetmealDish[]
}

export function getSetmealPage(params: PageParams & { name?: string; categoryId?: number; status?: number }) {
  return request<PageResult<Setmeal>>({ url: '/setmeal/page', method: 'get', params })
}

export function getSetmealById(id: number) {
  return request<Setmeal>({ url: `/setmeal/${id}`, method: 'get' })
}

export function addSetmeal(data: Setmeal) {
  return request<void>({ url: '/setmeal', method: 'post', data })
}

export function editSetmeal(data: Setmeal) {
  return request<void>({ url: '/setmeal', method: 'put', data })
}

export function deleteSetmeals(ids: number[]) {
  return request<void>({ url: '/setmeal', method: 'delete', params: { ids: ids.join(',') } })
}

export function setSetmealStatus(ids: number[], status: 0 | 1) {
  return request<void>({ url: `/setmeal/status/${status}`, method: 'post', params: { id: ids.join(',') } })
}
