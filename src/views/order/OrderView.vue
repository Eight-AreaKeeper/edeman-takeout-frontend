<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getOrderPage,
  getOrderStatusCounts,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_COMPLETED,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_DELIVERY_IN_PROGRESS,
  ORDER_STATUS_TO_BE_CONFIRMED,
  type Order,
} from '@/api/order'
import { usePagination } from '@/composables/usePagination'
import { useOrderActions } from '@/composables/useOrderActions'
import EmptyState from '@/components/EmptyState.vue'
import OrderDetailDialog from '@/components/OrderDetailDialog.vue'
import CancelReasonDialog from '@/components/CancelReasonDialog.vue'

const route = useRoute()
const router = useRouter()

const TABS = [
  { label: 'All orders', value: 0 },
  { label: 'To be confirmed', value: ORDER_STATUS_TO_BE_CONFIRMED },
  { label: 'To be delivered', value: ORDER_STATUS_CONFIRMED },
  { label: 'Delivering', value: ORDER_STATUS_DELIVERY_IN_PROGRESS },
  { label: 'Completed', value: ORDER_STATUS_COMPLETED },
  { label: 'Cancelled', value: ORDER_STATUS_CANCELLED },
]

const activeTab = ref(Number(route.query.status ?? 0))
const filters = reactive({ number: '', phone: '', dateRange: [] as string[] })
const counts = reactive({ toBeConfirmed: 0, confirmed: 0, deliveryInProgress: 0 })

const { page, pageSize, total, records, loading, hasSearched, search, handlePageChange, handlePageSizeChange } =
  usePagination(getOrderPage, () => ({
    number: filters.number || undefined,
    phone: filters.phone || undefined,
    status: activeTab.value || undefined,
    beginTime: filters.dateRange[0],
    endTime: filters.dateRange[1],
  }))

async function refreshCounts() {
  const result = await getOrderStatusCounts()
  Object.assign(counts, result)
}

function refreshAll() {
  search()
  refreshCounts()
}

const orderActions = useOrderActions(refreshAll)

function tabBadge(value: number) {
  if (value === ORDER_STATUS_TO_BE_CONFIRMED) return counts.toBeConfirmed
  if (value === ORDER_STATUS_CONFIRMED) return counts.confirmed
  if (value === ORDER_STATUS_DELIVERY_IN_PROGRESS) return counts.deliveryInProgress
  return 0
}

function resetFilters() {
  filters.number = ''
  filters.phone = ''
  filters.dateRange = []
  search()
}

const STATUS_LABELS: Record<number, string> = {
  1: 'Pending payment',
  2: 'To be confirmed',
  3: 'Confirmed',
  4: 'Out for delivery',
  5: 'Completed',
  6: 'Cancelled',
}

function primaryAction(row: Order) {
  if (row.status === ORDER_STATUS_TO_BE_CONFIRMED) return { label: 'Accept', handler: () => orderActions.accept(row.id) }
  if (row.status === ORDER_STATUS_CONFIRMED) return { label: 'Deliver', handler: () => orderActions.deliver(row.id) }
  if (row.status === ORDER_STATUS_DELIVERY_IN_PROGRESS)
    return { label: 'Complete', handler: () => orderActions.complete(row.id) }
  return null
}

watch(activeTab, () => search())

onMounted(async () => {
  await refreshAll()
  if (route.query.orderId) {
    orderActions.viewDetail(Number(route.query.orderId))
    router.replace({ path: route.path })
  }
})
</script>

<template>
  <div class="ed-page">
    <div class="ed-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane v-for="tab in TABS" :key="tab.value" :name="tab.value">
          <template #label>
            <el-badge :value="tabBadge(tab.value)" :hidden="tabBadge(tab.value) === 0">{{ tab.label }}</el-badge>
          </template>
        </el-tab-pane>
      </el-tabs>

      <div class="ed-toolbar">
        <el-input v-model="filters.number" placeholder="Order number" clearable style="width: 180px" @keyup.enter="search" />
        <el-input v-model="filters.phone" placeholder="Phone number" clearable style="width: 180px" @keyup.enter="search" />
        <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          value-format="YYYY-MM-DD HH:mm:ss"
          start-placeholder="Start date"
          end-placeholder="End date"
        />
        <el-button type="primary" @click="search">Search</el-button>
        <el-button @click="resetFilters">Reset</el-button>
      </div>

      <el-table v-loading="loading" :data="records" row-key="id">
        <el-table-column prop="number" label="Order #" width="180" />
        <el-table-column label="Status" width="130">
          <template #default="{ row }">{{ STATUS_LABELS[row.status] }}</template>
        </el-table-column>
        <el-table-column label="Customer" width="180">
          <template #default="{ row }">{{ row.consignee }} · {{ row.phone }}</template>
        </el-table-column>
        <el-table-column prop="address" label="Address" min-width="200" show-overflow-tooltip />
        <el-table-column prop="orderTime" label="Order time" width="170" />
        <el-table-column label="Amount" width="100">
          <template #default="{ row }">¥{{ row.amount?.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="Actions" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="orderActions.viewDetail(row.id)">View</el-button>
            <el-button
              v-if="primaryAction(row)"
              link
              type="primary"
              @click="primaryAction(row)!.handler()"
            >
              {{ primaryAction(row)!.label }}
            </el-button>
            <el-button
              v-if="row.status === 2"
              link
              type="danger"
              @click="orderActions.openReasonDialog(row.id, 'reject')"
            >
              Reject
            </el-button>
          </template>
        </el-table-column>
        <template #empty><EmptyState :searching="hasSearched && !!(filters.number || filters.phone)" /></template>
      </el-table>

      <div class="ed-pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 30, 40]"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handlePageSizeChange"
        />
      </div>
    </div>

    <OrderDetailDialog :actions="orderActions" />
    <CancelReasonDialog :actions="orderActions" />
  </div>
</template>
