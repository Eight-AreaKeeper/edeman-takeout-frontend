<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getEmployeePage, setEmployeeStatus, type Employee } from '@/api/employee'
import { usePagination } from '@/composables/usePagination'
import EmptyState from '@/components/EmptyState.vue'
import StatusTag from '@/components/StatusTag.vue'

const router = useRouter()
const filters = reactive({ name: '' })

const { page, pageSize, total, records, loading, hasSearched, search, handlePageChange, handlePageSizeChange } =
  usePagination(getEmployeePage, () => ({ name: filters.name || undefined }))

function resetFilters() {
  filters.name = ''
  search()
}

function isProtected(row: Employee) {
  return row.username === 'admin'
}

async function handleToggleStatus(row: Employee) {
  const next = row.status === 1 ? 0 : 1
  const action = next === 1 ? 'enable' : 'disable'
  await ElMessageBox.confirm(`Are you sure you want to ${action} "${row.name}"?`, 'Confirm', { type: 'warning' })
  await setEmployeeStatus(row.id!, next)
  ElMessage.success('Status updated')
  search()
}

search()
</script>

<template>
  <div class="ed-page">
    <div class="ed-card">
      <div class="ed-toolbar">
        <el-input v-model="filters.name" placeholder="Employee name" clearable style="width: 220px" @keyup.enter="search" />
        <el-button type="primary" @click="search">Search</el-button>
        <el-button @click="resetFilters">Reset</el-button>
        <div class="ed-toolbar__spacer" />
        <el-button type="primary" @click="router.push('/employee/add')">+ Add employee</el-button>
      </div>

      <el-table v-loading="loading" :data="records" row-key="id">
        <el-table-column prop="name" label="Name" min-width="140" />
        <el-table-column prop="username" label="Username" min-width="140" />
        <el-table-column prop="phone" label="Phone" width="140" />
        <el-table-column label="Status" width="110">
          <template #default="{ row }"><StatusTag :status="row.status" /></template>
        </el-table-column>
        <el-table-column prop="updateTime" label="Last updated" width="180" />
        <el-table-column label="Actions" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :disabled="isProtected(row)" @click="router.push(`/employee/add?id=${row.id}`)">
              Edit
            </el-button>
            <el-button link type="primary" :disabled="isProtected(row)" @click="handleToggleStatus(row)">
              {{ row.status === 1 ? 'Disable' : 'Enable' }}
            </el-button>
          </template>
        </el-table-column>
        <template #empty><EmptyState :searching="hasSearched && !!filters.name" /></template>
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
