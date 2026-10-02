import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  ORDER_STATUS_TO_BE_CONFIRMED,
  acceptOrder,
  cancelOrder,
  completeOrder,
  deliverOrder,
  getOrderById,
  rejectOrder,
  type Order,
} from '@/api/order'

export const CANCEL_REASONS = [
  'Customer requested cancellation',
  'Out of stock',
  'Kitchen is too busy',
  'Store is closing soon',
  'Delivery address is unreachable',
  'Other reason',
]

export const REJECT_REASONS = [
  'Out of stock',
  'Kitchen is too busy',
  'Store is closing',
  'Other reason',
]

export function useOrderActions(onChanged: () => void) {
  const detailVisible = ref(false)
  const detailLoading = ref(false)
  const currentOrder = ref<Order | null>(null)

  const reasonDialogVisible = ref(false)
  const reasonDialogMode = ref<'cancel' | 'reject'>('cancel')
  const reasonDialogOrderId = ref<number | null>(null)
  const selectedReason = ref('')
  const customReason = ref('')
  const reasonSubmitting = ref(false)

  async function viewDetail(id: number) {
    detailLoading.value = true
    detailVisible.value = true
    try {
      currentOrder.value = await getOrderById(id)
    } finally {
      detailLoading.value = false
    }
  }

  async function accept(id: number) {
    await acceptOrder(id)
    ElMessage.success('Order accepted')
    onChanged()
    if (detailVisible.value) detailVisible.value = false
  }

  async function deliver(id: number) {
    await deliverOrder(id)
    ElMessage.success('Order marked as out for delivery')
    onChanged()
    if (detailVisible.value) detailVisible.value = false
  }

  async function complete(id: number) {
    await completeOrder(id)
    ElMessage.success('Order completed')
    onChanged()
    if (detailVisible.value) detailVisible.value = false
  }

  function openReasonDialog(id: number, mode: 'cancel' | 'reject') {
    reasonDialogOrderId.value = id
    reasonDialogMode.value = mode
    selectedReason.value = ''
    customReason.value = ''
    reasonDialogVisible.value = true
  }

  async function confirmReason() {
    if (reasonDialogOrderId.value === null) return
    const reason = selectedReason.value === 'Other reason' ? customReason.value.trim() : selectedReason.value
    if (!reason) {
      ElMessage.error('Please choose or enter a reason')
      return
    }
    reasonSubmitting.value = true
    try {
      if (reasonDialogMode.value === 'cancel') {
        await cancelOrder(reasonDialogOrderId.value, reason)
        ElMessage.success('Order cancelled')
      } else {
        await rejectOrder(reasonDialogOrderId.value, reason)
        ElMessage.success('Order rejected')
      }
      reasonDialogVisible.value = false
      if (detailVisible.value) detailVisible.value = false
      onChanged()
    } finally {
      reasonSubmitting.value = false
    }
  }

  return {
    detailVisible,
    detailLoading,
    currentOrder,
    viewDetail,
    accept,
    deliver,
    complete,
    reasonDialogVisible,
    reasonDialogMode,
    selectedReason,
    customReason,
    reasonSubmitting,
    openReasonDialog,
    confirmReason,
    ORDER_STATUS_TO_BE_CONFIRMED,
  }
}

export type UseOrderActions = ReturnType<typeof useOrderActions>
