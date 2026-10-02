<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { editPassword } from '@/api/employee'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { confirmPasswordRule, patternRule, requiredRule, PASSWORD_REGEX } from '@/utils/validators'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const submitting = ref(false)

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const rules = {
  oldPassword: [
    requiredRule('Please enter your current password'),
    patternRule(PASSWORD_REGEX, '6-20 letters or digits'),
  ],
  newPassword: [requiredRule('Please enter a new password'), patternRule(PASSWORD_REGEX, '6-20 letters or digits')],
  confirmPassword: [
    requiredRule('Please confirm your new password'),
    confirmPasswordRule(() => form.newPassword, 'Passwords do not match'),
  ],
}

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      form.oldPassword = ''
      form.newPassword = ''
      form.confirmPassword = ''
      formRef.value?.clearValidate()
    }
  },
)

function close() {
  emit('update:modelValue', false)
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    await editPassword({ oldPassword: form.oldPassword, newPassword: form.newPassword })
    ElMessage.success('Password updated, please sign in again')
    close()
    await userStore.logout()
    router.push('/login')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="Change password"
    width="420px"
    @update:model-value="(v: boolean) => emit('update:modelValue', v)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="Current password" prop="oldPassword">
        <el-input v-model="form.oldPassword" type="password" show-password />
      </el-form-item>
      <el-form-item label="New password" prop="newPassword">
        <el-input v-model="form.newPassword" type="password" show-password />
      </el-form-item>
      <el-form-item label="Confirm new password" prop="confirmPassword">
        <el-input v-model="form.confirmPassword" type="password" show-password />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="close">Cancel</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">Save</el-button>
    </template>
  </el-dialog>
</template>
