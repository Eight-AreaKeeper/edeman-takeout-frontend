import { request } from '@/utils/request'
import type { PageParams, PageResult } from './types'

export const CATEGORY_TYPE_DISH = 1
export const CATEGORY_TYPE_SETMEAL = 2

export interface Category {
  id?: number
  name: string
  type: 1 | 2
  sort: number
  status?: number
  updateTime?: string
}

export function getCategoryPage(params: PageParams & { name?: string; type?: number }) {
  return request<PageResult<Category>>({ url: '/category/page', method: 'get', params })
}

export function getCategoryList(params: { type: number }) {
  return request<Category[]>({ url: '/category/list', method: 'get', params })
}

export function addCategory(data: Category) {
  return request<void>({ url: '/category', method: 'post', data })
}

export function editCategory(data: Category) {
  return request<void>({ url: '/category', method: 'put', data })
}

export function deleteCategory(id: number) {
  return request<void>({ url: '/category', method: 'delete', params: { id } })
}

export function setCategoryStatus(id: number, status: 0 | 1) {
  return request<void>({ url: `/category/status/${status}`, method: 'post', params: { id } })
}
