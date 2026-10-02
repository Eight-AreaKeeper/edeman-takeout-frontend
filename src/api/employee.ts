import { request } from '@/utils/request'
import type { PageParams, PageResult } from './types'

export interface Employee {
  id?: number
  username: string
  name: string
  phone: string
  sex: '0' | '1'
  idNumber: string
  status?: number
  updateTime?: string
}

export interface LoginResult {
  id: number
  userName: string
  name: string
  token: string
}

export function login(data: { username: string; password: string }) {
  return request<LoginResult>({ url: '/employee/login', method: 'post', data })
}

export function logout() {
  return request<void>({ url: '/employee/logout', method: 'post' })
}

export function editPassword(data: { oldPassword: string; newPassword: string }) {
  return request<void>({ url: '/employee/editPassword', method: 'put', data })
}

export function getEmployeePage(params: PageParams & { name?: string }) {
  return request<PageResult<Employee>>({ url: '/employee/page', method: 'get', params })
}

export function getEmployeeById(id: number) {
  return request<Employee>({ url: `/employee/${id}`, method: 'get' })
}

export function addEmployee(data: Employee) {
  return request<void>({ url: '/employee', method: 'post', data })
}

export function editEmployee(data: Employee) {
  return request<void>({ url: '/employee', method: 'put', data })
}

export function setEmployeeStatus(id: number, status: 0 | 1) {
  return request<void>({ url: `/employee/status/${status}`, method: 'post', params: { id } })
}
