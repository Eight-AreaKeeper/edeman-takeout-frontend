<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps<{ title: string }>()
const router = useRouter()
</script>

<template>
  <div class="page-header">
    <div class="page-header__title">
      <el-icon class="page-header__back" :size="18" @click="router.back()"><ArrowLeft /></el-icon>
      <h2>{{ title }}</h2>
    </div>
    <div class="page-header__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.page-header__title {
  display: flex;
  align-items: center;
  gap: 10px;
}
.page-header__title h2 {
  margin: 0;
  font-size: 18px;
}
.page-header__back {
  cursor: pointer;
  color: var(--ed-text-secondary);
}
.page-header__back:hover {
  color: var(--ed-primary);
}
</style>
