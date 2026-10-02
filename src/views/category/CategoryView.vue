<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import {
  addCategory,
  CATEGORY_TYPE_DISH,
  deleteCategory,
  editCategory,
  getCategoryPage,
  setCategoryStatus,
  type Category,
} from '@/api/category'
import { usePagination } from '@/composables/usePagination'
import EmptyState from '@/components/EmptyState.vue'
import StatusTag from '@/components/StatusTag.vue'
import { requiredRule } from '@/utils/validators'

const filters = reactive({ name: '', type: undefined as number | undefined })

const { page, pageSize, total, records, loading, hasSearched, search, handlePageChange, handlePageSizeChange } =
  usePagination(getCategoryPage, () => ({
    name: filters.name || undefined,
    type: filters.type,
  }))

function typeLabel(type: number) {
  return type === CATEGORY_TYPE_DISH ? 'Dish category' : 'Set meal category'
}

function resetFilters() {
  filters.name = ''
  filters.type = undefined
  search()
}

// --- Add / edit dialog ---
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const submitting = ref(false)
const form = reactive<Category>({ id: undefined, name: '', type: 1, sort: 0 })

const rules = {
  name: [requiredRule('Please enter a category name')],
  sort: [requiredRule('Please enter a sort order')],
}

function openAddDialog(type: 1 | 2) {
  dialogMode.value = 'add'
  form.id = undefined
  form.name = ''
  form.type = type
  form.sort = 0
  dialogVisible.value = true
}

function openEditDialog(row: Category) {
  dialogMode.value = 'edit'
  form.id = row.id
  form.name = row.name
  form.type = row.type
  form.sort = row.sort
  dialogVisible.value = true
}

async function handleSubmit(continueAdding = false) {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    if (dialogMode.value === 'add') {
      await addCategory(form)
      ElMessage.success('Category created')
    } else {
      await editCategory(form)
      ElMessage.success('Category updated')
    }
    if (continueAdding) {
      form.name = ''
      form.sort = 0
      formRef.value?.clearValidate()
    } else {
      dialogVisible.value = false
    }
    search()
  } finally {
    submitting.value = false
  }
}

async function handleDelete(row: Category) {
  await ElMessageBox.confirm(`Delete category "${row.name}"?`, 'Confirm delete', { type: 'warning' })
  await deleteCategory(row.id!)
  ElMessage.success('Category deleted')
  search()
}

async function handleToggleStatus(row: Category) {
  const next = row.status === 1 ? 0 : 1
  const action = next === 1 ? 'enable' : 'disable'
  await ElMessageBox.confirm(`Are you sure you want to ${action} "${row.name}"?`, 'Confirm', { type: 'warning' })
  await setCategoryStatus(row.id!, next)
  ElMessage.success('Status updated')
  search()
}

search()
</script>

<template>
  <div class="ed-page">
    <div class="ed-card">
      <div class="ed-toolbar">
        <el-input v-model="filters.name" placeholder="Category name" clearable style="width: 220px" @keyup.enter="search" />
        <el-select v-model="filters.type" placeholder="All types" clearable style="width: 180px">
          <el-option label="Dish category" :value="1" />
          <el-option label="Set meal category" :value="2" />
        </el-select>
        <el-button type="primary" @click="search">Search</el-button>
        <el-button @click="resetFilters">Reset</el-button>
        <div class="ed-toolbar__spacer" />
        <el-button type="primary" plain @click="openAddDialog(1)">+ New dish category</el-button>
        <el-button type="primary" plain @click="openAddDialog(2)">+ New set meal category</el-button>
      </div>

      <el-table v-loading="loading" :data="records" row-key="id">
        <el-table-column prop="name" label="Name" min-width="160" />
        <el-table-column label="Type" width="160">
          <template #default="{ row }">{{ typeLabel(row.type) }}</template>
        </el-table-column>
        <el-table-column prop="sort" label="Sort" width="90" />
        <el-table-column label="Status" width="110">
          <template #default="{ row }"><StatusTag :status="row.status" /></template>
        </el-table-column>
        <el-table-column prop="updateTime" label="Last updated" width="180" />
        <el-table-column label="Actions" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEditDialog(row)">Edit</el-button>
            <el-button link type="primary" @click="handleToggleStatus(row)">
              {{ row.status === 1 ? 'Disable' : 'Enable' }}
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">Delete</el-button>
          </template>
        </el-table-column>
        <template #empty><EmptyState :searching="hasSearched && !!(filters.name || filters.type)" /></template>
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

    <el-dialog v-model="dialogVisible" :title="dialogMode === 'add' ? 'New category' : 'Edit category'" width="480px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="Type">
          <span>{{ typeLabel(form.type) }}</span>
        </el-form-item>
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name" maxlength="20" show-word-limit placeholder="Category name" />
        </el-form-item>
        <el-form-item label="Sort" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="99" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button v-if="dialogMode === 'add'" :loading="submitting" @click="handleSubmit(true)">
          Save &amp; add another
        </el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit(false)">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>
