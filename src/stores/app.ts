import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSidebarOpened, setSidebarOpened } from '@/utils/cookies'

export const useAppStore = defineStore('app', () => {
  // Fix: the original project computed a cookie key for this but never read it
  // back on load, so the collapsed/expanded state never actually survived a
  // refresh. Here we restore it from the cookie on store init.
  const sidebarOpened = ref(getSidebarOpened())
  const unreadCount = ref(0)

  function toggleSidebar() {
    sidebarOpened.value = !sidebarOpened.value
    setSidebarOpened(sidebarOpened.value)
  }

  function setUnreadCount(count: number) {
    unreadCount.value = count
  }

  return { sidebarOpened, unreadCount, toggleSidebar, setUnreadCount }
})
