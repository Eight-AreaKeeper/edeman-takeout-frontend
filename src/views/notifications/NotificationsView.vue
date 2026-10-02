<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getNotificationPage, markAllRead, markRead, type Notification } from '@/api/notifications'
import { useAppStore } from '@/stores/app'
import { usePagination } from '@/composables/usePagination'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const appStore = useAppStore()
const activeTab = ref<1 | 2>(1)

const { page, total, records, loading, search, handlePageChange } = usePagination(getNotificationPage, () => ({
  status: activeTab.value,
}))

// Matches the edeman-backend's actual notification types (see
// OrderServiceImpl.paySuccess / OrderServiceImpl.reminder): 1 = a new order
// was just paid for, 2 = a customer is urging (nudging) an existing order.
const TYPE_META: Record<number, { label: string; tone: 'warning' | 'info' | 'danger' }> = {
  1: { label: 'New order', tone: 'warning' },
  2: { label: 'Customer is urging their order', tone: 'danger' },
}

function typeMeta(type: number) {
  return TYPE_META[type] ?? { label: 'Notification', tone: 'info' as const }
}

function parseDetails(details?: string): Record<string, unknown> | null {
  if (!details) return null
  try {
    const parsed = JSON.parse(details)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

function hasDetails(notification: Notification) {
  return !!parseDetails(notification.details)
}

async function openOrder(notification: Notification) {
  if (notification.status === 1) {
    await markRead(notification.id).catch(() => undefined)
  }
  if (notification.orderId) {
    router.push({ path: '/order', query: { orderId: notification.orderId } })
  }
}

async function handleMarkAllRead() {
  const unreadIds = records.value.filter((n) => n.status === 1).map((n) => n.id)
  if (!unreadIds.length) return
  await markAllRead(unreadIds)
  appStore.setUnreadCount(Math.max(0, appStore.unreadCount - unreadIds.length))
  ElMessage.success('All marked as read')
  search()
}

function switchTab(tab: 1 | 2) {
  activeTab.value = tab
  search()
}

const canMarkAllRead = computed(() => activeTab.value === 1 && records.value.some((n) => n.status === 1))

search()
</script>

<template>
  <div class="ed-page">
    <div class="ed-card">
      <div class="notifications__header">
        <el-tabs :model-value="activeTab" @tab-change="(name: number) => switchTab(name as 1 | 2)">
          <el-tab-pane name="1">
            <template #label>
              <el-badge :value="appStore.unreadCount" :hidden="appStore.unreadCount === 0">Unread</el-badge>
            </template>
          </el-tab-pane>
          <el-tab-pane label="Read" name="2" />
        </el-tabs>
        <el-button :disabled="!canMarkAllRead" @click="handleMarkAllRead">Mark all as read</el-button>
      </div>

      <div v-loading="loading" class="notifications__list">
        <div v-for="notification in records" :key="notification.id" class="notification-item" @click="openOrder(notification)">
          <el-tag :type="typeMeta(notification.type).tone" size="small" round>
            {{ typeMeta(notification.type).label }}
          </el-tag>
          <el-popover v-if="hasDetails(notification)" trigger="hover" width="260">
            <template #reference>
              <span class="notification-item__content">{{ notification.content }}</span>
            </template>
            <div class="notification-item__details">
              <div v-for="(value, key) in parseDetails(notification.details)" :key="key">
                <strong>{{ key }}:</strong> {{ value }}
              </div>
            </div>
          </el-popover>
          <span v-else class="notification-item__content">{{ notification.content }}</span>
          <span class="notification-item__time">{{ notification.createTime }}</span>
        </div>
        <EmptyState v-if="!loading && !records.length" />
      </div>

      <div class="ed-pagination">
        <el-pagination
          v-model:current-page="page"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.notifications__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.notifications__list {
  min-height: 200px;
  display: flex;
  flex-direction: column;
}
.notification-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 4px;
  border-bottom: 1px solid var(--ed-border);
  cursor: pointer;
}
.notification-item:hover {
  background: var(--ed-bg);
}
.notification-item__content {
  flex: 1;
  font-size: 14px;
}
.notification-item__time {
  font-size: 12px;
  color: var(--ed-text-secondary);
}
.notification-item__details {
  font-size: 13px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
