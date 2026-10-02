<script setup lang="ts">
import { computed } from 'vue'
import { CANCEL_REASONS, REJECT_REASONS, type UseOrderActions } from '@/composables/useOrderActions'

const props = defineProps<{ actions: UseOrderActions }>()
const reasons = computed(() => (props.actions.reasonDialogMode.value === 'cancel' ? CANCEL_REASONS : REJECT_REASONS))
</script>

<template>
  <el-dialog
    v-model="actions.reasonDialogVisible.value"
    :title="actions.reasonDialogMode.value === 'cancel' ? 'Cancel order' : 'Reject order'"
    width="420px"
  >
    <el-radio-group v-model="actions.selectedReason.value" class="reason-list">
      <el-radio v-for="reason in reasons" :key="reason" :value="reason" class="reason-list__item">
        {{ reason }}
      </el-radio>
    </el-radio-group>
    <el-input
      v-if="actions.selectedReason.value === 'Other reason'"
      v-model="actions.customReason.value"
      type="textarea"
      :rows="2"
      maxlength="20"
      show-word-limit
      placeholder="Describe the reason"
      style="margin-top: 12px"
    />
    <template #footer>
      <el-button @click="actions.reasonDialogVisible.value = false">Cancel</el-button>
      <el-button type="primary" :loading="actions.reasonSubmitting.value" @click="actions.confirmReason">
        Confirm
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.reason-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
