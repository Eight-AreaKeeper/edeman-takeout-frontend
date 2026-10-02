<script setup lang="ts">
import { computed } from 'vue'
import type { UseOrderActions } from '@/composables/useOrderActions'

const props = defineProps<{ actions: UseOrderActions }>()

const STATUS_LABELS: Record<number, string> = {
  1: 'Pending payment',
  2: 'To be confirmed',
  3: 'Confirmed',
  4: 'Out for delivery',
  5: 'Completed',
  6: 'Cancelled',
}

const order = computed(() => props.actions.currentOrder.value)

const subtotal = computed(() => (order.value?.orderDetailList ?? []).reduce((sum, item) => sum + item.amount, 0))
const deliveryFee = 6

function statusLabel(status: number) {
  return STATUS_LABELS[status] ?? 'Unknown'
}

function openReject() {
  if (order.value) props.actions.openReasonDialog(order.value.id, 'reject')
}
function openCancel() {
  if (order.value) props.actions.openReasonDialog(order.value.id, 'cancel')
}
</script>

<template>
  <el-dialog v-model="actions.detailVisible.value" title="Order details" width="620px">
    <div v-loading="actions.detailLoading.value" class="order-detail">
      <template v-if="order">
        <div class="order-detail__header">
          <div class="order-detail__number">Order #{{ order.number }}</div>
          <el-tag>{{ statusLabel(order.status) }}</el-tag>
        </div>

        <div class="order-detail__grid">
          <div><span class="order-detail__label">Order time</span>{{ order.orderTime }}</div>
          <div><span class="order-detail__label">Customer</span>{{ order.consignee }} · {{ order.phone }}</div>
          <div v-if="order.deliveryTime">
            <span class="order-detail__label">Delivered at</span>{{ order.deliveryTime }}
          </div>
          <div v-else-if="order.estimatedDeliveryTime">
            <span class="order-detail__label">Estimated delivery</span>{{ order.estimatedDeliveryTime }}
          </div>
          <div class="order-detail__span2"><span class="order-detail__label">Address</span>{{ order.address }}</div>
          <div v-if="order.status === 6" class="order-detail__span2">
            <span class="order-detail__label">Cancel reason</span>{{ order.cancelReason || order.rejectionReason }}
          </div>
          <div v-else-if="order.remark" class="order-detail__span2">
            <span class="order-detail__label">Remark</span>{{ order.remark }}
          </div>
        </div>

        <el-table :data="order.orderDetailList" size="small" class="order-detail__items">
          <el-table-column prop="name" label="Dish" />
          <el-table-column prop="number" label="Qty" width="70" />
          <el-table-column label="Amount" width="100">
            <template #default="{ row }">¥{{ row.amount.toFixed(2) }}</template>
          </el-table-column>
        </el-table>

        <div class="order-detail__totals">
          <div><span>Subtotal</span><span>¥{{ subtotal.toFixed(2) }}</span></div>
          <div><span>Delivery fee</span><span>¥{{ deliveryFee.toFixed(2) }}</span></div>
          <div><span>Packaging fee</span><span>¥{{ (order.packAmount ?? 0).toFixed(2) }}</span></div>
          <div class="order-detail__totals-final"><span>Total</span><span>¥{{ order.amount.toFixed(2) }}</span></div>
        </div>

        <div class="order-detail__payment">
          {{ order.payMethod === 1 ? 'Paid via WeChat Pay' : 'Paid via Alipay' }}
          <span v-if="order.checkoutTime"> · {{ order.checkoutTime }}</span>
        </div>
      </template>
    </div>

    <template #footer>
      <template v-if="order?.status === 2">
        <el-button type="danger" plain @click="openReject">Reject</el-button>
        <el-button type="primary" @click="actions.accept(order.id)">Accept</el-button>
      </template>
      <template v-else-if="order?.status === 1">
        <el-button type="danger" plain @click="openCancel">Cancel order</el-button>
      </template>
      <template v-else-if="order?.status === 3">
        <el-button type="primary" @click="actions.deliver(order.id)">Mark as delivering</el-button>
      </template>
      <template v-else-if="order?.status === 4">
        <el-button type="primary" @click="actions.complete(order.id)">Mark as completed</el-button>
      </template>
      <el-button @click="actions.detailVisible.value = false">Close</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.order-detail {
  min-height: 120px;
}
.order-detail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.order-detail__number {
  font-weight: 600;
  font-size: 16px;
}
.order-detail__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 20px;
  font-size: 14px;
  margin-bottom: 16px;
}
.order-detail__span2 {
  grid-column: span 2;
}
.order-detail__label {
  display: block;
  color: var(--ed-text-secondary);
  font-size: 12px;
  margin-bottom: 2px;
}
.order-detail__items {
  margin-bottom: 12px;
}
.order-detail__totals {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  align-items: flex-end;
}
.order-detail__totals > div {
  display: flex;
  justify-content: space-between;
  width: 220px;
}
.order-detail__totals-final {
  font-weight: 700;
  border-top: 1px solid var(--ed-border);
  padding-top: 6px;
}
.order-detail__payment {
  margin-top: 12px;
  text-align: right;
  color: var(--ed-text-secondary);
  font-size: 13px;
}
</style>
