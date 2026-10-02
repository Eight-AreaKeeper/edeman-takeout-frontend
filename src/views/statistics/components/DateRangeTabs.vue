<script setup lang="ts">
import { ref } from 'vue'
import {
  last30DaysRange,
  last7DaysRange,
  thisMonthRange,
  thisWeekRange,
  yesterdayRange,
  type DateRange,
} from '@/utils/dateRanges'

const emit = defineEmits<{ change: [range: DateRange] }>()

const OPTIONS: { label: string; getRange: () => DateRange }[] = [
  { label: 'Yesterday', getRange: yesterdayRange },
  { label: 'Last 7 days', getRange: last7DaysRange },
  { label: 'Last 30 days', getRange: last30DaysRange },
  { label: 'This week', getRange: thisWeekRange },
  { label: 'This month', getRange: thisMonthRange },
]

const activeIndex = ref(0)
const currentRange = ref<DateRange>(OPTIONS[0].getRange())

function select(index: number) {
  activeIndex.value = index
  currentRange.value = OPTIONS[index].getRange()
  emit('change', currentRange.value)
}

select(0)

defineExpose({ currentRange })
</script>

<template>
  <div class="date-range-tabs">
    <div class="date-range-tabs__options">
      <div
        v-for="(option, index) in OPTIONS"
        :key="option.label"
        class="date-range-tabs__option"
        :class="{ 'date-range-tabs__option--active': index === activeIndex }"
        @click="select(index)"
      >
        {{ option.label }}
      </div>
    </div>
    <div class="date-range-tabs__range">{{ currentRange.begin }} – {{ currentRange.end }}</div>
    <div class="ed-toolbar__spacer" />
    <slot name="actions" />
  </div>
</template>

<style scoped>
.date-range-tabs {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.date-range-tabs__options {
  display: flex;
  gap: 4px;
  background: var(--ed-bg);
  border-radius: 999px;
  padding: 4px;
}
.date-range-tabs__option {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  cursor: pointer;
  color: var(--ed-text-secondary);
}
.date-range-tabs__option--active {
  background: var(--ed-surface);
  color: var(--ed-primary);
  font-weight: 600;
  box-shadow: var(--ed-shadow);
}
.date-range-tabs__range {
  font-size: 13px;
  color: var(--ed-text-secondary);
}
</style>
