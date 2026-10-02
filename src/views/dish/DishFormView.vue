<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance } from 'element-plus'
import { addDish, editDish, getDishById, type Dish } from '@/api/dish'
import { getCategoryList, type Category } from '@/api/category'
import PageHeader from '@/components/PageHeader.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import FlavorPicker from './components/FlavorPicker.vue'
import { PRICE_REGEX, patternRule, requiredRule } from '@/utils/validators'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const categories = ref<Category[]>([])

const editingId = route.query.id ? Number(route.query.id) : undefined
const isEdit = editingId !== undefined

const form = reactive<Dish>({
  name: '',
  categoryId: undefined as unknown as number,
  price: undefined as unknown as number,
  image: '',
  description: '',
  status: 1,
  flavors: [],
})

const rules = {
  name: [requiredRule('Please enter a dish name')],
  categoryId: [requiredRule('Please select a category')],
  price: [requiredRule('Please enter a price'), patternRule(PRICE_REGEX, 'Enter a valid price (up to 2 decimals)')],
  image: [requiredRule('Please upload a dish image')],
}

function resetForm() {
  form.name = ''
  form.categoryId = undefined as unknown as number
  form.price = undefined as unknown as number
  form.image = ''
  form.description = ''
  form.flavors = []
  formRef.value?.clearValidate()
}

async function handleSubmit(continueAdding = false) {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    if (isEdit) {
      await editDish({ ...form, id: editingId })
      ElMessage.success('Dish updated')
      router.push('/dish')
    } else {
      await addDish(form)
      ElMessage.success('Dish created')
      if (continueAdding) {
        resetForm()
      } else {
        router.push('/dish')
      }
    }
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  categories.value = await getCategoryList({ type: 1 })
  if (editingId) {
    const dish = await getDishById(editingId)
    Object.assign(form, dish)
  }
})
</script>

<template>
  <div class="ed-page">
    <PageHeader :title="isEdit ? 'Edit dish' : 'Add dish'" />

    <div class="ed-card">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="140px" style="max-width: 640px">
        <el-form-item label="Dish name" prop="name">
          <el-input v-model="form.name" maxlength="20" placeholder="Dish name" />
        </el-form-item>
        <el-form-item label="Category" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="Select a category" style="width: 100%">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id!" />
          </el-select>
        </el-form-item>
        <el-form-item label="Price" prop="price">
          <el-input v-model.number="form.price" placeholder="0.00">
            <template #prefix>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="Flavors">
          <FlavorPicker v-model="form.flavors!" />
        </el-form-item>
        <el-form-item label="Image" prop="image">
          <ImageUpload v-model="form.image" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="form.description" type="textarea" :rows="3" maxlength="200" show-word-limit />
        </el-form-item>

        <el-form-item>
          <el-button @click="router.push('/dish')">Cancel</el-button>
          <el-button v-if="!isEdit" :loading="submitting" @click="handleSubmit(true)">Save &amp; add another</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit(false)">Save</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
