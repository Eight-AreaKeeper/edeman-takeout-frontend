<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getDishList, type Dish } from '@/api/dish'
import { getCategoryList, type Category } from '@/api/category'

const props = defineProps<{
  modelValue: boolean
  existingDishIds: number[]
}>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [dishes: Pick<Dish, 'id' | 'name' | 'price'>[]]
}>()

const categories = ref<Category[]>([])
const activeCategoryId = ref<number>()
const keyword = ref('')
const dishesInView = ref<Dish[]>([])
const loading = ref(false)
const checked = ref(new Map<number, Pick<Dish, 'id' | 'name' | 'price'>>())

const isSearching = computed(() => keyword.value.trim().length > 0)
const checkedList = computed(() => Array.from(checked.value.values()))

async function loadCategories() {
  categories.value = await getCategoryList({ type: 1 })
  activeCategoryId.value = categories.value[0]?.id
}

async function loadDishes() {
  loading.value = true
  try {
    if (isSearching.value) {
      dishesInView.value = await getDishList({ name: keyword.value.trim() })
    } else if (activeCategoryId.value) {
      dishesInView.value = await getDishList({ categoryId: activeCategoryId.value })
    } else {
      dishesInView.value = []
    }
  } finally {
    loading.value = false
  }
}

function isChecked(dishId: number) {
  return checked.value.has(dishId)
}

function toggle(dish: Dish) {
  if (checked.value.has(dish.id!)) {
    checked.value.delete(dish.id!)
  } else {
    checked.value.set(dish.id!, { id: dish.id, name: dish.name, price: dish.price })
  }
}

function remove(dishId: number) {
  checked.value.delete(dishId)
}

function handleConfirm() {
  emit('confirm', checkedList.value)
  emit('update:modelValue', false)
}

watch(activeCategoryId, () => {
  if (!isSearching.value) loadDishes()
})
watch(keyword, () => loadDishes())

watch(
  () => props.modelValue,
  async (visible) => {
    if (!visible) return
    checked.value = new Map(props.existingDishIds.map((id) => [id, { id, name: '', price: 0 }]))
    keyword.value = ''
    if (!categories.value.length) await loadCategories()
    await loadDishes()
    // Backfill names/prices for pre-existing selections from whatever we just loaded.
    for (const dish of dishesInView.value) {
      if (checked.value.has(dish.id!)) {
        checked.value.set(dish.id!, { id: dish.id, name: dish.name, price: dish.price })
      }
    }
  },
)
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="Add dishes"
    width="720px"
    @update:model-value="(v: boolean) => emit('update:modelValue', v)"
  >
    <el-input v-model="keyword" placeholder="Search dishes by name" clearable style="margin-bottom: 12px" />

    <div class="dish-picker">
      <div v-if="!isSearching" class="dish-picker__categories">
        <div
          v-for="category in categories"
          :key="category.id"
          class="dish-picker__category"
          :class="{ 'dish-picker__category--active': category.id === activeCategoryId }"
          @click="activeCategoryId = category.id"
        >
          {{ category.name }}
        </div>
      </div>

      <div class="dish-picker__list" v-loading="loading">
        <el-checkbox
          v-for="dish in dishesInView"
          :key="dish.id"
          :model-value="isChecked(dish.id!)"
          @change="toggle(dish)"
        >
          {{ dish.name }} — ¥{{ dish.price.toFixed(2) }}
        </el-checkbox>
        <el-empty v-if="!loading && !dishesInView.length" description="No dishes found" :image-size="80" />
      </div>

      <div class="dish-picker__selected">
        <div class="dish-picker__selected-title">Selected ({{ checkedList.length }})</div>
        <div v-for="dish in checkedList" :key="dish.id" class="dish-picker__selected-row">
          <span>{{ dish.name || `#${dish.id}` }}</span>
          <el-icon class="dish-picker__remove" @click="remove(dish.id!)"><Close /></el-icon>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="emit('update:modelValue', false)">Cancel</el-button>
      <el-button type="primary" @click="handleConfirm">Add ({{ checkedList.length }})</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.dish-picker {
  display: flex;
  gap: 16px;
  height: 360px;
}
.dish-picker__categories {
  width: 120px;
  flex-shrink: 0;
  overflow-y: auto;
  border-right: 1px solid var(--ed-border);
}
.dish-picker__category {
  padding: 8px 10px;
  border-radius: var(--ed-radius-sm);
  cursor: pointer;
  font-size: 14px;
}
.dish-picker__category--active {
  background: var(--ed-primary-soft);
  color: var(--ed-primary);
  font-weight: 600;
}
.dish-picker__list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.dish-picker__selected {
  width: 200px;
  flex-shrink: 0;
  overflow-y: auto;
  border-left: 1px solid var(--ed-border);
  padding-left: 16px;
}
.dish-picker__selected-title {
  font-weight: 600;
  margin-bottom: 8px;
}
.dish-picker__selected-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 13px;
}
.dish-picker__remove {
  cursor: pointer;
  color: var(--ed-text-secondary);
}
.dish-picker__remove:hover {
  color: var(--ed-danger);
}
</style>
