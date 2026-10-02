<script setup lang="ts">
withDefaults(
  defineProps<{
    status: number
    activeText?: string
    inactiveText?: string
  }>(),
  {
    activeText: 'Active',
    inactiveText: 'Disabled',
  },
)
</script>

<template>
  <el-tag :type="status === 1 ? 'success' : 'info'" effect="light" round>
    {{ status === 1 ? activeText : inactiveText }}
  </el-tag>
</template>
