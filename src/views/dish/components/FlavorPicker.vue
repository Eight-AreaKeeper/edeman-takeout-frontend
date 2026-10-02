<script setup lang="ts">
import { computed } from 'vue'
import type { DishFlavor } from '@/api/dish'

const FLAVOR_GROUPS: Record<string, string[]> = {
  Sweetness: ['Full sugar', '70% sugar', '50% sugar', '30% sugar', 'No sugar'],
  Temperature: ['Hot', 'Warm', 'Room temperature', 'Iced'],
  'Dietary restrictions': ['No cilantro', 'No onion', 'No garlic', 'No peanuts'],
  'Spice level': ['Not spicy', 'Mild', 'Medium', 'Hot', 'Extra hot'],
}

const props = defineProps<{ modelValue: DishFlavor[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: DishFlavor[]] }>()

interface Row {
  name: string
  options: string[]
}

const rows = computed<Row[]>(() =>
  props.modelValue.map((flavor) => ({
    name: flavor.name,
    options: safeParse(flavor.value),
  })),
)

function safeParse(value: string): string[] {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const usedGroupNames = computed(() => new Set(rows.value.map((row) => row.name)))
const availableGroupNames = computed(() => Object.keys(FLAVOR_GROUPS).filter((name) => !usedGroupNames.value.has(name)))

function emitRows(nextRows: Row[]) {
  emit(
    'update:modelValue',
    nextRows.map((row) => ({ name: row.name, value: JSON.stringify(row.options) })),
  )
}

function addRow(groupName: string) {
  emitRows([...rows.value, { name: groupName, options: [] }])
}

function removeRow(index: number) {
  const next = [...rows.value]
  next.splice(index, 1)
  emitRows(next)
}

function addOption(rowIndex: number, option: string) {
  const next = rows.value.map((row, i) => (i === rowIndex ? { ...row, options: [...row.options, option] } : row))
  emitRows(next)
}

function removeOption(rowIndex: number, option: string) {
  const next = rows.value.map((row, i) =>
    i === rowIndex ? { ...row, options: row.options.filter((o) => o !== option) } : row,
  )
  emitRows(next)
}

function remainingOptions(row: Row) {
  return (FLAVOR_GROUPS[row.name] ?? []).filter((option) => !row.options.includes(option))
}
</script>

<template>
  <div class="flavor-picker">
    <div v-for="(row, index) in rows" :key="row.name" class="flavor-picker__row">
      <div class="flavor-picker__label">{{ row.name }}</div>
      <div class="flavor-picker__tags">
        <el-tag v-for="option in row.options" :key="option" closable @close="removeOption(index, option)">
          {{ option }}
        </el-tag>
        <el-dropdown v-if="remainingOptions(row).length" trigger="click" @command="(cmd: string) => addOption(index, cmd)">
          <el-button size="small">+ Add option</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="option in remainingOptions(row)" :key="option" :command="option">
                {{ option }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <el-button link type="danger" @click="removeRow(index)">Remove</el-button>
    </div>

    <el-dropdown v-if="availableGroupNames.length" trigger="click" @command="addRow">
      <el-button>+ Add flavor</el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="name in availableGroupNames" :key="name" :command="name">{{ name }}</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<style scoped>
.flavor-picker {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
}
.flavor-picker__row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}
.flavor-picker__label {
  width: 140px;
  flex-shrink: 0;
  font-weight: 500;
}
.flavor-picker__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}
</style>
