<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'
</script>

<template>
  <div class="app-layout">
    <Sidebar />
    <div class="app-layout__main">
      <Navbar />
      <main class="app-layout__content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  height: 100vh;
  display: flex;
  overflow: hidden;
}
.app-layout__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.app-layout__content {
  flex: 1;
  overflow-y: auto;
  background: var(--ed-bg);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
