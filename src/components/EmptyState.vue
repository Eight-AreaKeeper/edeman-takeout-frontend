<script setup lang="ts">
withDefaults(defineProps<{ searching?: boolean }>(), { searching: false })
</script>

<template>
  <el-empty
    :description="searching ? 'No results match your search' : 'No data yet'"
    :image-size="120"
  />
</template>
