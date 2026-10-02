<script setup lang="ts">
import { computed } from 'vue'
import type { Top10Report } from '@/api/report'
import { parseNumberList, parseStringList } from '@/utils/parseList'

const props = defineProps<{ data?: Top10Report }>()

const option = computed(() => {
  const names = parseStringList(props.data?.nameList).reverse()
  const numbers = parseNumberList(props.data?.numberList).reverse()
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 100, right: 30, top: 10, bottom: 20 },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: names },
    series: [
      {
        type: 'bar',
        data: numbers,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#ffb37a' },
              { offset: 1, color: '#ff5a36' },
            ],
          },
          borderRadius: [0, 6, 6, 0],
        },
        label: { show: true, position: 'right' },
      },
    ],
  }
})
</script>

<template>
  <div class="ed-card">
    <h3 class="chart-card__title">Top 10 best sellers</h3>
    <VChart :option="option" autoresize class="chart-card__chart" />
  </div>
</template>

