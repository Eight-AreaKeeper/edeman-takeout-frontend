<script setup lang="ts">
import { computed } from 'vue'
import type { TurnoverReport } from '@/api/report'
import { parseNumberList, parseStringList } from '@/utils/parseList'

const props = defineProps<{ data?: TurnoverReport }>()

const option = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 20, top: 30, bottom: 30 },
  xAxis: { type: 'category', data: parseStringList(props.data?.dateList), boundaryGap: false },
  yAxis: { type: 'value' },
  series: [
    {
      name: 'Turnover (¥)',
      type: 'line',
      smooth: true,
      areaStyle: { color: 'rgba(255, 90, 54, 0.1)' },
      itemStyle: { color: '#ff5a36' },
      data: parseNumberList(props.data?.turnoverList),
    },
  ],
}))
</script>

<template>
  <div class="ed-card">
    <h3 class="chart-card__title">Turnover</h3>
    <VChart :option="option" autoresize class="chart-card__chart" />
  </div>
</template>

