import { request } from '@/utils/request'
import type { PageResult } from './types'

export interface Notification {
  id: number
  type: number
  content: string
  orderId?: number
  status: 1 | 2
  createTime: string
  /** JSON-encoded extra details for hover popovers (urging / daily-summary notifications) */
  details?: string
}

export function getNotificationPage(params: { page: number; pageSize: number; status: 1 | 2 }) {
  return request<PageResult<Notification>>({
    url: '/messages/page',
    method: 'get',
    params: { pageNum: params.page, pageSize: params.pageSize, status: params.status },
  })
}

export function getUnreadCount() {
  return request<number>({ url: '/messages/countUnread', method: 'get' })
}

export function markAllRead(ids: number[]) {
  return request<void>({ url: '/messages/batch', method: 'put', data: ids })
}

export function markRead(id: number) {
  return request<void>({ url: `/messages/${id}`, method: 'put' })
}
