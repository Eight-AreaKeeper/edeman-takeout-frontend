<script setup lang="ts">
import { computed } from 'vue'
import type { UserReport } from '@/api/report'
import { parseNumberList, parseStringList } from '@/utils/parseList'

const props = defineProps<{ data?: UserReport }>()

const option = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['Total customers', 'New customers'], top: 0 },
  grid: { left: 40, right: 20, top: 40, bottom: 30 },
  xAxis: { type: 'category', data: parseStringList(props.data?.dateList), boundaryGap: false },
  yAxis: { type: 'value' },
  series: [
    {
      name: 'Total customers',
      type: 'line',
      smooth: true,
      itemStyle: { color: '#5b8def' },
      data: parseNumberList(props.data?.totalUserList),
    },
    {
      name: 'New customers',
      type: 'line',
      smooth: true,
      itemStyle: { color: '#21b573' },
      data: parseNumberList(props.data?.newUserList),
    },
  ],
}))
</script>

<template>
  <div class="ed-card">
    <h3 class="chart-card__title">Customers</h3>
    <VChart :option="option" autoresize class="chart-card__chart" />
  </div>
</template>

