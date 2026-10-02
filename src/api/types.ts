export interface PageParams {
  page: number
  pageSize: number
}

export interface PageResult<T> {
  records: T[]
  total: number
}
