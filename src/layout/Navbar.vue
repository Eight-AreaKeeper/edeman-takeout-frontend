<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { getShopStatus, setShopStatus } from '@/api/shop'
import { getUnreadCount } from '@/api/notifications'
import PasswordDialog from './PasswordDialog.vue'
import previewSound from '@/assets/sounds/preview.mp3'
import reminderSound from '@/assets/sounds/reminder.mp3'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

const shopOpen = ref(true)
const shopDialogVisible = ref(false)
const shopDialogValue = ref<0 | 1>(1)
const shopSaving = ref(false)
const passwordDialogVisible = ref(false)

const previewAudio = new Audio(previewSound)
const reminderAudio = new Audio(reminderSound)

let socket: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let closedIntentionally = false

const initials = computed(() => (userStore.name ? userStore.name.slice(0, 1).toUpperCase() : '?'))

async function loadShopStatus() {
  const status = await getShopStatus()
  shopOpen.value = status === 1
}

function openShopDialog() {
  shopDialogValue.value = shopOpen.value ? 1 : 0
  shopDialogVisible.value = true
}

async function saveShopStatus() {
  shopSaving.value = true
  try {
    await setShopStatus(shopDialogValue.value)
    shopOpen.value = shopDialogValue.value === 1
    shopDialogVisible.value = false
    ElMessage.success('Business status updated')
  } finally {
    shopSaving.value = false
  }
}

async function loadUnreadCount() {
  // Note: this backend doesn't currently expose a notification-inbox API
  // (/messages/*) — only the live WebSocket order-alert push below is real.
  // Fail silently so a missing endpoint doesn't spam error toasts.
  try {
    const count = await getUnreadCount()
    appStore.setUnreadCount(count)
  } catch {
    // no-op: notification inbox is not available on this backend
  }
}

async function handleLogout() {
  await userStore.logout()
  router.push('/login')
}

interface SocketMessage {
  type: number
  orderId?: number
  content?: string
}

function connectSocket() {
  const base = import.meta.env.VITE_WS_BASE_URL
  if (!base) return
  const clientId = Math.random().toString(36).slice(2)
  socket = new WebSocket(`${base}${clientId}`)

  socket.onmessage = (event) => {
    let message: SocketMessage
    try {
      message = JSON.parse(event.data)
    } catch {
      return
    }
    const isUrgent = message.type === 2
    const audio = isUrgent ? reminderAudio : previewAudio
    audio.play().catch(() => undefined)
    ElNotification({
      title: isUrgent ? 'Order urged' : 'New order',
      message: message.content ?? 'You have a new order update',
      type: 'warning',
      duration: 8000,
      onClick: () => {
        router.push({ path: '/order', query: { orderId: message.orderId } })
      },
    })
    loadUnreadCount()
  }

  socket.onclose = () => {
    if (closedIntentionally) return
    reconnectTimer = setTimeout(connectSocket, 3000)
  }
}

onMounted(() => {
  loadShopStatus()
  loadUnreadCount()
  connectSocket()
})

onBeforeUnmount(() => {
  closedIntentionally = true
  if (reconnectTimer) clearTimeout(reconnectTimer)
  socket?.close()
})
</script>

<template>
  <header class="navbar">
    <div class="navbar__left">
      <el-icon class="navbar__hamburger" :size="20" @click="appStore.toggleSidebar">
        <Fold v-if="appStore.sidebarOpened" />
        <Expand v-else />
      </el-icon>

      <div class="navbar__shop-status" @click="openShopDialog">
        <span class="navbar__dot" :class="{ 'navbar__dot--closed': !shopOpen }"></span>
        {{ shopOpen ? 'Open for business' : 'Closed' }}
      </div>
    </div>

    <div class="navbar__right">
      <el-badge :value="appStore.unreadCount" :hidden="appStore.unreadCount === 0" :max="99">
        <el-icon class="navbar__icon-btn" :size="20" @click="router.push('/notifications')">
          <Bell />
        </el-icon>
      </el-badge>

      <el-dropdown trigger="click">
        <div class="navbar__user">
          <span class="navbar__avatar">{{ initials }}</span>
          <span class="navbar__name">{{ userStore.name }}</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="passwordDialogVisible = true">Change password</el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">Log out</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <el-dialog v-model="shopDialogVisible" title="Business status" width="380px">
      <el-radio-group v-model="shopDialogValue">
        <el-radio :value="1">Open for business</el-radio>
        <el-radio :value="0">Closed</el-radio>
      </el-radio-group>
      <p class="navbar__shop-hint">
        When closed, customers won't be able to place new orders in the storefront.
      </p>
      <template #footer>
        <el-button @click="shopDialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="shopSaving" @click="saveShopStatus">Save</el-button>
      </template>
    </el-dialog>

    <PasswordDialog v-model="passwordDialogVisible" />
  </header>
</template>

<style scoped>
.navbar {
  height: var(--ed-navbar-height);
  background: var(--ed-surface);
  border-bottom: 1px solid var(--ed-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}
.navbar__left {
  display: flex;
  align-items: center;
  gap: 20px;
}
.navbar__hamburger {
  cursor: pointer;
  color: var(--ed-text-secondary);
}
.navbar__shop-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--ed-text-secondary);
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--ed-bg);
}
.navbar__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ed-success);
}
.navbar__dot--closed {
  background: var(--ed-text-placeholder);
}
.navbar__right {
  display: flex;
  align-items: center;
  gap: 24px;
}
.navbar__icon-btn {
  cursor: pointer;
  color: var(--ed-text-secondary);
}
.navbar__user {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.navbar__avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--ed-primary-soft);
  color: var(--ed-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 13px;
}
.navbar__name {
  font-size: 14px;
  color: var(--ed-text-primary);
}
.navbar__shop-hint {
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--ed-text-secondary);
}
</style>
