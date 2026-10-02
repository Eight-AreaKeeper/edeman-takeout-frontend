<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance } from 'element-plus'
import { addSetmeal, editSetmeal, getSetmealById, type Setmeal, type SetmealDish } from '@/api/setMeal'
import { getCategoryList, type Category } from '@/api/category'
import type { Dish } from '@/api/dish'
import PageHeader from '@/components/PageHeader.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import DishPicker from './components/DishPicker.vue'
import { PRICE_REGEX, patternRule, requiredRule } from '@/utils/validators'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const categories = ref<Category[]>([])
const pickerVisible = ref(false)

const editingId = route.query.id ? Number(route.query.id) : undefined
const isEdit = editingId !== undefined

const form = reactive<Setmeal>({
  name: '',
  categoryId: undefined as unknown as number,
  price: undefined as unknown as number,
  image: '',
  description: '',
  status: 1,
  setmealDishes: [],
})

const rules = {
  name: [requiredRule('Please enter a set meal name')],
  categoryId: [requiredRule('Please select a category')],
  price: [requiredRule('Please enter a price'), patternRule(PRICE_REGEX, 'Enter a valid price (up to 2 decimals)')],
  image: [requiredRule('Please upload a set meal image')],
}

function handleDishesConfirmed(dishes: Pick<Dish, 'id' | 'name' | 'price'>[]) {
  const existing = new Map((form.setmealDishes ?? []).map((d) => [d.dishId, d]))
  form.setmealDishes = dishes.map((dish) => {
    const previous = existing.get(dish.id!)
    return {
      dishId: dish.id!,
      name: previous?.name ?? dish.name,
      price: previous?.price ?? dish.price,
      copies: previous?.copies ?? 1,
    }
  })
}

function removeDish(dishId: number) {
  form.setmealDishes = (form.setmealDishes ?? []).filter((d) => d.dishId !== dishId)
}

function resetForm() {
  form.name = ''
  form.categoryId = undefined as unknown as number
  form.price = undefined as unknown as number
  form.image = ''
  form.description = ''
  form.setmealDishes = []
  formRef.value?.clearValidate()
}

async function handleSubmit(continueAdding = false) {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  if (!form.setmealDishes?.length) {
    ElMessage.error('Please add at least one dish')
    return
  }
  submitting.value = true
  try {
    if (isEdit) {
      await editSetmeal({ ...form, id: editingId })
      ElMessage.success('Set meal updated')
      router.push('/setmeal')
    } else {
      await addSetmeal(form)
      ElMessage.success('Set meal created')
      if (continueAdding) {
        resetForm()
      } else {
        router.push('/setmeal')
      }
    }
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  categories.value = await getCategoryList({ type: 2 })
  if (editingId) {
    const setmeal = await getSetmealById(editingId)
    Object.assign(form, setmeal)
  }
})
</script>

<template>
  <div class="ed-page">
    <PageHeader :title="isEdit ? 'Edit set meal' : 'Add set meal'" />

    <div class="ed-card">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="140px" style="max-width: 640px">
        <el-form-item label="Set meal name" prop="name">
          <el-input v-model="form.name" maxlength="20" placeholder="Set meal name" />
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

        <el-form-item label="Dishes">
          <div class="setmeal-dishes">
            <el-table :data="form.setmealDishes" size="small" empty-text="No dishes added yet">
              <el-table-column prop="name" label="Name" />
              <el-table-column label="Price" width="100">
                <template #default="{ row }">¥{{ row.price?.toFixed(2) }}</template>
              </el-table-column>
              <el-table-column label="Copies" width="130">
                <template #default="{ row }: { row: SetmealDish }">
                  <el-input-number v-model="row.copies" :min="1" :max="99" size="small" />
                </template>
              </el-table-column>
              <el-table-column width="70">
                <template #default="{ row }">
                  <el-icon class="setmeal-dishes__remove" @click="removeDish(row.dishId)"><Delete /></el-icon>
                </template>
              </el-table-column>
            </el-table>
            <el-button style="margin-top: 10px" @click="pickerVisible = true">+ Add dishes</el-button>
          </div>
        </el-form-item>

        <el-form-item label="Image" prop="image">
          <ImageUpload v-model="form.image" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="form.description" type="textarea" :rows="3" maxlength="200" show-word-limit />
        </el-form-item>

        <el-form-item>
          <el-button @click="router.push('/setmeal')">Cancel</el-button>
          <el-button v-if="!isEdit" :loading="submitting" @click="handleSubmit(true)">Save &amp; add another</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit(false)">Save</el-button>
        </el-form-item>
      </el-form>
    </div>

    <DishPicker
      v-model="pickerVisible"
      :existing-dish-ids="(form.setmealDishes ?? []).map((d) => d.dishId)"
      @confirm="handleDishesConfirmed"
    />
  </div>
</template>

<style scoped>
.setmeal-dishes__remove {
  cursor: pointer;
  color: var(--ed-text-secondary);
}
.setmeal-dishes__remove:hover {
  color: var(--ed-danger);
}
</style>
