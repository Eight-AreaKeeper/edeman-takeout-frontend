<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'

defineProps<{
  title: string
  note?: string
}>()
</script>

<template>
  <div class="ed-page">
    <div class="ed-card coming-soon">
      <el-icon :size="40" color="var(--ed-primary)"><Loading /></el-icon>
      <h2>{{ title }}</h2>
      <p>{{ note ?? 'This section is being built in an upcoming phase.' }}</p>
    </div>
  </div>
</template>

<style scoped>
.coming-soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 20px;
  text-align: center;
  color: var(--ed-text-secondary);
}
.coming-soon h2 {
  margin: 0;
  color: var(--ed-text-primary);
}
</style>
