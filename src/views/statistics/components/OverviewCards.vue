<script setup lang="ts">
import type { DataOverview } from '@/api/report'

defineProps<{ data?: DataOverview }>()

function growthClass(value: number | undefined) {
  if (value === undefined) return ''
  return value >= 0 ? 'overview-card__growth--up' : 'overview-card__growth--down'
}

function formatGrowth(value: number | undefined) {
  if (value === undefined) return ''
  const pct = (value * 100).toFixed(1)
  return `${value >= 0 ? '+' : ''}${pct}%`
}
</script>

<template>
  <div class="overview-cards" v-if="data">
    <div class="overview-card">
      <div class="overview-card__label">Turnover</div>
      <div class="overview-card__value">¥{{ data.turnover.toFixed(2) }}</div>
      <div class="overview-card__growth" :class="growthClass(data.turnoverGrowth)">
        {{ formatGrowth(data.turnoverGrowth) }} vs. previous period
      </div>
    </div>
    <div class="overview-card">
      <div class="overview-card__label">Valid orders</div>
      <div class="overview-card__value">{{ data.validOrderCount }}</div>
      <div class="overview-card__growth" :class="growthClass(data.validOrderCountGrowth)">
        {{ formatGrowth(data.validOrderCountGrowth) }} vs. previous period
      </div>
    </div>
    <div class="overview-card">
      <div class="overview-card__label">Completion rate</div>
      <div class="overview-card__value">{{ (data.orderCompletionRate * 100).toFixed(1) }}%</div>
      <div class="overview-card__growth" :class="growthClass(data.orderCompletionRateGrowth)">
        {{ formatGrowth(data.orderCompletionRateGrowth) }} vs. previous period
      </div>
    </div>
    <div class="overview-card">
      <div class="overview-card__label">Avg. order value</div>
      <div class="overview-card__value">¥{{ data.unitPrice.toFixed(2) }}</div>
      <div class="overview-card__growth" :class="growthClass(data.unitPriceGrowth)">
        {{ formatGrowth(data.unitPriceGrowth) }} vs. previous period
      </div>
    </div>
    <div class="overview-card">
      <div class="overview-card__label">New customers</div>
      <div class="overview-card__value">{{ data.newUsers }}</div>
    </div>
  </div>
</template>

<style scoped>
.overview-cards {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}
.overview-card__label {
  font-size: 13px;
  color: var(--ed-text-secondary);
}
.overview-card__value {
  font-size: 24px;
  font-weight: 700;
  margin: 4px 0;
}
.overview-card__growth {
  font-size: 12px;
  color: var(--ed-text-placeholder);
}
.overview-card__growth--up {
  color: var(--ed-success);
}
.overview-card__growth--down {
  color: var(--ed-danger);
}
</style>
