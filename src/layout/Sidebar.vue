<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const menuItems = computed(() => {
  const root = router.options.routes.find((r) => r.path === '/')
  return (root?.children ?? []).filter((child) => !child.meta?.hidden)
})

const activePath = computed(() => `/${route.path.split('/')[1]}`)
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': !appStore.sidebarOpened }">
    <div class="sidebar__brand">
      <span class="sidebar__logo">🍜</span>
      <span v-show="appStore.sidebarOpened" class="sidebar__title">edeman</span>
    </div>

    <el-menu
      :default-active="activePath"
      :collapse="!appStore.sidebarOpened"
      :collapse-transition="false"
      class="sidebar__menu"
      router
    >
      <el-menu-item v-for="item in menuItems" :key="item.path" :index="`/${item.path}`">
        <el-icon v-if="item.meta?.icon"><component :is="item.meta.icon" /></el-icon>
        <template #title>{{ item.meta?.title }}</template>
      </el-menu-item>
    </el-menu>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--ed-sidebar-width);
  flex-shrink: 0;
  background: var(--ed-surface);
  border-right: 1px solid var(--ed-border);
  display: flex;
  flex-direction: column;
  transition: width 0.2s ease;
}
.sidebar--collapsed {
  width: var(--ed-sidebar-width-collapsed);
}
.sidebar__brand {
  height: var(--ed-navbar-height);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 18px;
  font-weight: 700;
  color: var(--ed-primary);
  border-bottom: 1px solid var(--ed-border);
  overflow: hidden;
  white-space: nowrap;
}
.sidebar__logo {
  font-size: 22px;
}
.sidebar__title {
  font-size: 18px;
}
.sidebar__menu {
  border-right: none;
  flex: 1;
  overflow-y: auto;
}
.sidebar__menu :deep(.el-menu-item.is-active) {
  background: var(--ed-primary-soft);
  color: var(--ed-primary);
  font-weight: 600;
}
</style>
