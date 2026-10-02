import { ref } from 'vue'
import type { PageResult } from '@/api/types'

export function usePagination<T, F extends object>(
  fetcher: (params: F & { page: number; pageSize: number }) => Promise<PageResult<T>>,
  getFilters: () => F,
) {
  const page = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  const records = ref<T[]>([])
  const loading = ref(false)
  const hasSearched = ref(false)

  async function load() {
    loading.value = true
    try {
      const result = await fetcher({ ...getFilters(), page: page.value, pageSize: pageSize.value })
      records.value = result.records
      total.value = result.total
      hasSearched.value = true
    } finally {
      loading.value = false
    }
  }

  function search() {
    page.value = 1
    return load()
  }

  function handlePageChange(newPage: number) {
    page.value = newPage
    load()
  }

  function handlePageSizeChange(newSize: number) {
    pageSize.value = newSize
    page.value = 1
    load()
  }

  return { page, pageSize, total, records, loading, hasSearched, load, search, handlePageChange, handlePageSizeChange }
}
