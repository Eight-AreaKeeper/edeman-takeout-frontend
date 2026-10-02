<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import {
  getAmountCollect,
  getCategoryCollect,
  getHourCollect,
  getPayTypeCollect,
  getTop10,
  getTurnoverStatistics,
} from '@/api/report'
import { parseNumberList, parseStringList } from '@/utils/parseList'
import type { DateRange } from '@/utils/dateRanges'

type Granularity = 'day' | 'week' | 'month'
const granularity = ref<Granularity>('day')
const anchorDate = ref(dayjs())
const loading = ref(false)

const received = ref(0)
const outstanding = ref(0)
const guestCount = ref(0)
const trendLabels = ref<string[]>([])
const trendValues = ref<number[]>([])
const categoryLabels = ref<string[]>([])
const categoryValues = ref<number[]>([])
const payTypeLabels = ref<string[]>([])
const payTypeValues = ref<number[]>([])
const dishRank = ref<{ name: string; number: number }[]>([])

const currentRange = computed<DateRange>(() => {
  const format = (d: dayjs.Dayjs) => d.format('YYYY-MM-DD')
  if (granularity.value === 'day') {
    return { begin: format(anchorDate.value), end: format(anchorDate.value) }
  }
  if (granularity.value === 'week') {
    return { begin: format(anchorDate.value.startOf('week').add(1, 'day')), end: format(anchorDate.value) }
  }
  return { begin: format(anchorDate.value.startOf('month')), end: format(anchorDate.value) }
})

const dateLabel = computed(() => {
  if (granularity.value === 'day') return anchorDate.value.format('YYYY-MM-DD')
  if (granularity.value === 'week') return `${currentRange.value.begin} – ${currentRange.value.end}`
  return anchorDate.value.format('YYYY-MM')
})

function shiftDate(step: number) {
  const unit = granularity.value === 'day' ? 'day' : granularity.value === 'week' ? 'week' : 'month'
  anchorDate.value = anchorDate.value.add(step, unit)
}

async function loadTrend(range: DateRange) {
  if (granularity.value === 'day') {
    const hourly = await getHourCollect(range.begin)
    trendLabels.value = parseStringList(hourly.timeList)
    trendValues.value = parseNumberList(hourly.amountList)
  } else {
    const daily = await getTurnoverStatistics(range)
    trendLabels.value = parseStringList(daily.dateList)
    trendValues.value = parseNumberList(daily.turnoverList)
  }
}

async function load() {
  loading.value = true
  const range = currentRange.value
  try {
    const [amount, , payType, category, top10] = await Promise.all([
      getAmountCollect(range),
      loadTrend(range),
      getPayTypeCollect(range),
      getCategoryCollect(range),
      getTop10(range),
    ])

    received.value = amount.amount
    outstanding.value = amount.waitingAmount
    guestCount.value = amount.guestCount

    categoryLabels.value = parseStringList(category.nameList)
    categoryValues.value = parseNumberList(category.numberList)

    payTypeLabels.value = parseStringList(payType.nameList)
    payTypeValues.value = parseNumberList(payType.numberList)

    const names = parseStringList(top10.nameList)
    const numbers = parseNumberList(top10.numberList)
    dishRank.value = names.map((name, index) => ({ name, number: numbers[index] ?? 0 }))
  } finally {
    loading.value = false
  }
}

const trendOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 20, top: 20, bottom: 30 },
  xAxis: { type: 'category', data: trendLabels.value },
  yAxis: { type: 'value' },
  series: [{ type: 'line', smooth: true, itemStyle: { color: '#ff5a36' }, data: trendValues.value }],
}))

const categoryOption = computed(() => ({
  tooltip: { trigger: 'item' },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      data: categoryLabels.value.map((name, i) => ({ name, value: categoryValues.value[i] ?? 0 })),
    },
  ],
}))

const payTypeOption = computed(() => ({
  tooltip: { trigger: 'item' },
  series: [
    {
      type: 'pie',
      radius: '70%',
      data: payTypeLabels.value.map((name, i) => ({ name, value: payTypeValues.value[i] ?? 0 })),
    },
  ],
}))

watch([granularity, anchorDate], load, { immediate: true })
</script>

<template>
  <div class="ed-page">
    <PageHeader title="Detailed report">
      <template #actions>
        <el-radio-group v-model="granularity" size="small">
          <el-radio-button value="day">Daily</el-radio-button>
          <el-radio-button value="week">Weekly</el-radio-button>
          <el-radio-button value="month">Monthly</el-radio-button>
        </el-radio-group>
      </template>
    </PageHeader>

    <div class="ed-card" v-loading="loading">
      <div class="detailed-report__nav">
        <el-button :icon="ArrowLeft" circle @click="shiftDate(-1)" />
        <span class="detailed-report__date">{{ dateLabel }}</span>
        <el-button :icon="ArrowRight" circle @click="shiftDate(1)" />
      </div>

      <div class="dash-stats">
        <div class="dash-stat">
          <div class="dash-stat__value">¥{{ received.toFixed(2) }}</div>
          <div class="dash-stat__label">Revenue received</div>
        </div>
        <div class="dash-stat">
          <div class="dash-stat__value">¥{{ outstanding.toFixed(2) }}</div>
          <div class="dash-stat__label">Revenue outstanding</div>
        </div>
        <div class="dash-stat">
          <div class="dash-stat__value">{{ guestCount }}</div>
          <div class="dash-stat__label">Customers served</div>
        </div>
      </div>
    </div>

    <div class="ed-card">
      <h3 class="chart-card__title">Sales trend</h3>
      <VChart :option="trendOption" autoresize class="chart-card__chart" />
    </div>

    <div class="stats-grid">
      <div class="ed-card">
        <h3 class="chart-card__title">Sales by category</h3>
        <VChart :option="categoryOption" autoresize class="chart-card__chart" />
      </div>
      <div class="ed-card">
        <h3 class="chart-card__title">Payment method breakdown</h3>
        <VChart :option="payTypeOption" autoresize class="chart-card__chart" />
      </div>
    </div>

    <div class="ed-card">
      <h3 class="chart-card__title">Dish ranking</h3>
      <el-table :data="dishRank" size="small">
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="name" label="Dish" />
        <el-table-column prop="number" label="Units sold" width="140" />
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.detailed-report__nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
}
.detailed-report__date {
  font-weight: 600;
  min-width: 200px;
  text-align: center;
}
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
</style>
