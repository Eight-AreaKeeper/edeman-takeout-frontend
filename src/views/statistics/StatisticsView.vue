<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  exportReport,
  getDataOverview,
  getOrderStatistics,
  getTop10,
  getTurnoverStatistics,
  getUserStatistics,
  type DataOverview,
  type OrderReport,
  type Top10Report,
  type TurnoverReport,
  type UserReport,
} from '@/api/report'
import type { DateRange } from '@/utils/dateRanges'
import DateRangeTabs from './components/DateRangeTabs.vue'
import OverviewCards from './components/OverviewCards.vue'
import TurnoverChart from './components/TurnoverChart.vue'
import UserChart from './components/UserChart.vue'
import OrderChart from './components/OrderChart.vue'
import Top10Chart from './components/Top10Chart.vue'

const router = useRouter()
const loading = ref(false)
const exporting = ref(false)

const overview = ref<DataOverview>()
const turnover = ref<TurnoverReport>()
const users = ref<UserReport>()
const orders = ref<OrderReport>()
const top10 = ref<Top10Report>()

async function loadAll(range: DateRange) {
  loading.value = true
  try {
    // Note: /report/dataOverView is not implemented on this backend (no growth
    // comparison endpoint exists yet), so it's loaded separately and allowed
    // to fail silently rather than blocking the rest of the page.
    getDataOverview(range)
      .then((result) => (overview.value = result))
      .catch(() => undefined)
    ;[turnover.value, users.value, orders.value, top10.value] = await Promise.all([
      getTurnoverStatistics(range),
      getUserStatistics(range),
      getOrderStatistics(range),
      getTop10(range),
    ])
  } finally {
    loading.value = false
  }
}

async function handleExport() {
  exporting.value = true
  try {
    const blob = await exportReport()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'operating-report.xlsx'
    link.click()
    URL.revokeObjectURL(url)
  } catch {
    ElMessage.error('Failed to export report')
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <div class="ed-page">
    <div class="ed-card">
      <DateRangeTabs @change="loadAll">
        <template #actions>
          <el-button link type="primary" @click="router.push('/statistics/detailed')">Detailed report →</el-button>
          <el-button type="primary" :loading="exporting" @click="handleExport">Export</el-button>
        </template>
      </DateRangeTabs>
    </div>

    <div class="ed-card" v-loading="loading">
      <OverviewCards :data="overview" />
    </div>

    <div class="stats-grid">
      <TurnoverChart :data="turnover" />
      <UserChart :data="users" />
    </div>
    <div class="stats-grid">
      <OrderChart :data="orders" />
      <Top10Chart :data="top10" />
    </div>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
</style>
