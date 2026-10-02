<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteSetmeals, getSetmealPage, setSetmealStatus, type Setmeal } from '@/api/setMeal'
import { getCategoryList, type Category } from '@/api/category'
import { usePagination } from '@/composables/usePagination'
import EmptyState from '@/components/EmptyState.vue'
import StatusTag from '@/components/StatusTag.vue'

const router = useRouter()
const categories = ref<Category[]>([])
const filters = reactive({ name: '', categoryId: undefined as number | undefined, status: undefined as number | undefined })
const selectedIds = ref<number[]>([])

const { page, pageSize, total, records, loading, hasSearched, search, handlePageChange, handlePageSizeChange } =
  usePagination(getSetmealPage, () => ({
    name: filters.name || undefined,
    categoryId: filters.categoryId,
    status: filters.status,
  }))

function resetFilters() {
  filters.name = ''
  filters.categoryId = undefined
  filters.status = undefined
  search()
}

function handleSelectionChange(rows: Setmeal[]) {
  selectedIds.value = rows.map((row) => row.id!).filter(Boolean)
}

async function handleDelete(ids: number[]) {
  await ElMessageBox.confirm(
    ids.length > 1 ? `Delete ${ids.length} set meals?` : 'Delete this set meal?',
    'Confirm delete',
    { type: 'warning' },
  )
  await deleteSetmeals(ids)
  ElMessage.success('Set meal deleted')
  search()
}

async function handleToggleStatus(row: Setmeal) {
  const next = row.status === 1 ? 0 : 1
  const action = next === 1 ? 'put on sale' : 'take off sale'
  await ElMessageBox.confirm(`Are you sure you want to ${action} "${row.name}"?`, 'Confirm', { type: 'warning' })
  await setSetmealStatus([row.id!], next)
  ElMessage.success('Status updated')
  search()
}

onMounted(async () => {
  categories.value = await getCategoryList({ type: 2 })
  search()
})
</script>

<template>
  <div class="ed-page">
    <div class="ed-card">
      <div class="ed-toolbar">
        <el-input v-model="filters.name" placeholder="Set meal name" clearable style="width: 200px" @keyup.enter="search" />
        <el-select v-model="filters.categoryId" placeholder="All categories" clearable style="width: 180px">
          <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id!" />
        </el-select>
        <el-select v-model="filters.status" placeholder="All statuses" clearable style="width: 160px">
          <el-option label="On sale" :value="1" />
          <el-option label="Discontinued" :value="0" />
        </el-select>
        <el-button type="primary" @click="search">Search</el-button>
        <el-button @click="resetFilters">Reset</el-button>
        <div class="ed-toolbar__spacer" />
        <el-button v-if="selectedIds.length" type="danger" link @click="handleDelete(selectedIds)">
          Delete selected ({{ selectedIds.length }})
        </el-button>
        <el-button type="primary" @click="router.push('/setmeal/add')">+ New set meal</el-button>
      </div>

      <el-table v-loading="loading" :data="records" row-key="id" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="46" />
        <el-table-column label="Image" width="90">
          <template #default="{ row }">
            <el-image v-if="row.image" :src="row.image" fit="cover" class="setmeal-thumb" />
            <div v-else class="setmeal-thumb setmeal-thumb--empty" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="Name" min-width="160" />
        <el-table-column prop="categoryName" label="Category" width="150" />
        <el-table-column label="Price" width="110">
          <template #default="{ row }">¥{{ row.price?.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="Status" width="120">
          <template #default="{ row }"><StatusTag :status="row.status" active-text="On sale" inactive-text="Discontinued" /></template>
        </el-table-column>
        <el-table-column prop="updateTime" label="Last updated" width="180" />
        <el-table-column label="Actions" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="router.push(`/setmeal/add?id=${row.id}`)">Edit</el-button>
            <el-button link type="primary" @click="handleToggleStatus(row)">
              {{ row.status === 1 ? 'Take off sale' : 'Put on sale' }}
            </el-button>
            <el-button link type="danger" @click="handleDelete([row.id!])">Delete</el-button>
          </template>
        </el-table-column>
        <template #empty><EmptyState :searching="hasSearched && !!(filters.name || filters.categoryId || filters.status)" /></template>
      </el-table>

      <div class="ed-pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 30, 40]"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handlePageSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.setmeal-thumb {
  width: 48px;
  height: 48px;
  border-radius: var(--ed-radius-sm);
  display: block;
}
.setmeal-thumb--empty {
  background: var(--ed-bg);
  border: 1px dashed var(--ed-border-strong);
}
</style>
