<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance } from 'element-plus'
import { addEmployee, editEmployee, getEmployeeById, type Employee } from '@/api/employee'
import PageHeader from '@/components/PageHeader.vue'
import { ID_NUMBER_REGEX, PHONE_REGEX, USERNAME_REGEX, patternRule, requiredRule } from '@/utils/validators'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)

const editingId = route.query.id ? Number(route.query.id) : undefined
const isEdit = editingId !== undefined

const form = reactive<Employee>({
  username: '',
  name: '',
  phone: '',
  sex: '1',
  idNumber: '',
})

const rules = {
  username: [requiredRule('Please enter a username'), patternRule(USERNAME_REGEX, '3-20 letters or digits')],
  name: [requiredRule('Please enter a name')],
  phone: [requiredRule('Please enter a phone number'), patternRule(PHONE_REGEX, 'Enter a valid mobile number')],
  idNumber: [requiredRule('Please enter an ID number'), patternRule(ID_NUMBER_REGEX, 'Enter a valid ID number')],
}

onMounted(async () => {
  if (!editingId) return
  const employee = await getEmployeeById(editingId)
  Object.assign(form, employee)
})

function resetForm() {
  form.username = ''
  form.name = ''
  form.phone = ''
  form.sex = '1'
  form.idNumber = ''
  formRef.value?.clearValidate()
}

async function handleSubmit(continueAdding = false) {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    if (isEdit) {
      await editEmployee({ ...form, id: editingId })
      ElMessage.success('Employee updated')
      router.push('/employee')
    } else {
      await addEmployee(form)
      ElMessage.success('Employee created')
      if (continueAdding) {
        resetForm()
      } else {
        router.push('/employee')
      }
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="ed-page">
    <PageHeader :title="isEdit ? 'Edit employee' : 'Add employee'" />

    <div class="ed-card">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="140px" style="max-width: 520px">
        <el-form-item label="Username" prop="username">
          <el-input v-model="form.username" :disabled="isEdit" maxlength="20" placeholder="e.g. jsmith" />
        </el-form-item>
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name" maxlength="20" placeholder="Employee name" />
        </el-form-item>
        <el-form-item label="Phone" prop="phone">
          <el-input v-model="form.phone" maxlength="11" placeholder="Mobile phone number" />
        </el-form-item>
        <el-form-item label="Gender">
          <el-radio-group v-model="form.sex">
            <el-radio value="1">Male</el-radio>
            <el-radio value="0">Female</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="ID number" prop="idNumber">
          <el-input v-model="form.idNumber" maxlength="18" placeholder="National ID number" />
        </el-form-item>

        <el-form-item>
          <el-button @click="router.push('/employee')">Cancel</el-button>
          <el-button v-if="!isEdit" :loading="submitting" @click="handleSubmit(true)">Save &amp; add another</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit(false)">Save</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
