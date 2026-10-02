<script setup lang="ts">
import { computed } from 'vue'
import type { OrderReport } from '@/api/report'
import { parseNumberList, parseStringList } from '@/utils/parseList'

const props = defineProps<{ data?: OrderReport }>()

const option = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['Total orders', 'Valid orders'], top: 0 },
  grid: { left: 40, right: 20, top: 40, bottom: 30 },
  xAxis: { type: 'category', data: parseStringList(props.data?.dateList), boundaryGap: false },
  yAxis: { type: 'value' },
  series: [
    {
      name: 'Total orders',
      type: 'line',
      smooth: true,
      itemStyle: { color: '#ff9f1c' },
      data: parseNumberList(props.data?.orderCountList),
    },
    {
      name: 'Valid orders',
      type: 'line',
      smooth: true,
      itemStyle: { color: '#21b573' },
      data: parseNumberList(props.data?.validOrderCountList),
    },
  ],
}))
</script>

<template>
  <div class="ed-card">
    <div class="chart-card__header">
      <h3 class="chart-card__title">Orders</h3>
      <div v-if="data" class="chart-card__summary">
        {{ data.validOrderCount }} / {{ data.totalOrderCount }} valid ·
        {{ (data.orderCompletionRate * 100).toFixed(1) }}% completion rate
      </div>
    </div>
    <VChart :option="option" autoresize class="chart-card__chart" />
  </div>
</template>

<style scoped>
.chart-card__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}
.chart-card__title {
  margin: 0;
  font-size: 15px;
}
.chart-card__summary {
  font-size: 13px;
  color: var(--ed-text-secondary);
}
</style>
