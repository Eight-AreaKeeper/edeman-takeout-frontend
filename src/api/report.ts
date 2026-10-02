import { request } from '@/utils/request'
import type { DateRange } from '@/utils/dateRanges'

export interface TurnoverReport {
  dateList: string
  turnoverList: string
}

export interface UserReport {
  dateList: string
  totalUserList: string
  newUserList: string
}

export interface OrderReport {
  dateList: string
  orderCountList: string
  validOrderCountList: string
  totalOrderCount: number
  validOrderCount: number
  orderCompletionRate: number
}

export interface Top10Report {
  nameList: string
  numberList: string
}

export interface DataOverview {
  turnover: number
  turnoverGrowth: number
  validOrderCount: number
  validOrderCountGrowth: number
  orderCompletionRate: number
  orderCompletionRateGrowth: number
  unitPrice: number
  unitPriceGrowth: number
  newUsers: number
}

export function getTurnoverStatistics(params: DateRange) {
  return request<TurnoverReport>({ url: '/report/turnoverStatistics', method: 'get', params })
}

export function getUserStatistics(params: DateRange) {
  return request<UserReport>({ url: '/report/userStatistics', method: 'get', params })
}

export function getOrderStatistics(params: DateRange) {
  return request<OrderReport>({ url: '/report/ordersStatistics', method: 'get', params })
}

export function getTop10(params: DateRange) {
  return request<Top10Report>({ url: '/report/top10', method: 'get', params })
}

// Not implemented on the backend yet (no /report/dataOverView on ReportController) —
// silent so the missing endpoint doesn't spam an error toast on every Statistics load.
export function getDataOverview(params: DateRange) {
  return request<DataOverview>({ url: '/report/dataOverView', method: 'get', params, silent: true })
}

export function exportReport() {
  return request<Blob>({ url: '/report/export', method: 'get', responseType: 'blob' })
}

// --- Detailed report endpoints (backed by ReportController's amountCollect/hourCollect/
// payTypeCollect/categoryCollect — added alongside this page) ---

export interface AmountCollect {
  amount: number
  waitingAmount: number
  guestCount: number
}

export interface Trend {
  timeList: string
  amountList: string
}

export interface NameNumber {
  nameList: string
  numberList: string
}

/** Received/outstanding revenue + guests served, summed over a date range. */
export function getAmountCollect(params: DateRange) {
  return request<AmountCollect>({ url: '/report/amountCollect', method: 'get', params })
}

/** Hour-of-day sales trend for a single day (pass the same date as begin/end via `date`). */
export function getHourCollect(date: string) {
  return request<Trend>({ url: '/report/hourCollect', method: 'get', params: { date } })
}

/** Payment-method breakdown (by amount) over a date range. */
export function getPayTypeCollect(params: DateRange) {
  return request<NameNumber>({ url: '/report/payTypeCollect', method: 'get', params })
}

/** Category breakdown (by units sold) over a date range. */
export function getCategoryCollect(params: DateRange) {
  return request<NameNumber>({ url: '/report/categoryCollect', method: 'get', params })
}
