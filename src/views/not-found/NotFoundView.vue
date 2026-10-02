<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="not-found">
    <div class="not-found__code">404</div>
    <h1>Page not found</h1>
    <p>The page you're looking for doesn't exist or has been moved.</p>
    <el-button type="primary" @click="router.push('/')">Back to home</el-button>
  </div>
</template>

<style scoped>
.not-found {
  height: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: var(--ed-bg);
  text-align: center;
}
.not-found__code {
  font-size: 96px;
  font-weight: 700;
  color: var(--ed-primary);
  line-height: 1;
}
.not-found h1 {
  margin: 0;
  color: var(--ed-text-primary);
}
.not-found p {
  margin: 0 0 12px;
  color: var(--ed-text-secondary);
}
</style>
