<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, type UploadRequestOptions } from 'element-plus'
import { uploadFile } from '@/api/common'

const props = withDefaults(
  defineProps<{
    modelValue: string
    maxSizeMb?: number
    accept?: string
  }>(),
  {
    maxSizeMb: 2,
    accept: '.jpg,.jpeg,.png',
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const uploading = ref(false)

function beforeUpload(file: File) {
  const isAllowedType = props.accept.split(',').some((ext) => file.name.toLowerCase().endsWith(ext.trim()))
  if (!isAllowedType) {
    ElMessage.error(`Only ${props.accept} files are allowed`)
    return false
  }
  if (file.size > props.maxSizeMb * 1024 * 1024) {
    ElMessage.error(`Image must be smaller than ${props.maxSizeMb}MB`)
    return false
  }
  return true
}

async function customUpload(options: UploadRequestOptions) {
  uploading.value = true
  try {
    const url = await uploadFile(options.file as File)
    emit('update:modelValue', url)
  } finally {
    uploading.value = false
  }
}

function removeImage() {
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="image-upload">
    <el-upload
      class="image-upload__control"
      :show-file-list="false"
      :accept="accept"
      :before-upload="beforeUpload"
      :http-request="customUpload"
    >
      <div v-if="modelValue" class="image-upload__preview">
        <img :src="modelValue" alt="Uploaded image" />
        <div class="image-upload__overlay" @click.stop="removeImage">
          <el-icon><Delete /></el-icon>
        </div>
      </div>
      <div v-else class="image-upload__placeholder" v-loading="uploading">
        <el-icon :size="24"><Plus /></el-icon>
      </div>
    </el-upload>
    <p class="image-upload__hint">JPG/PNG, up to {{ maxSizeMb }}MB</p>
  </div>
</template>

<style scoped>
.image-upload__control :deep(.el-upload) {
  border: 1px dashed var(--ed-border-strong);
  border-radius: var(--ed-radius-sm);
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s;
}
.image-upload__control :deep(.el-upload:hover) {
  border-color: var(--ed-primary);
}
.image-upload__placeholder {
  color: var(--ed-text-placeholder);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.image-upload__preview {
  position: relative;
  width: 100%;
  height: 100%;
}
.image-upload__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.image-upload__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  opacity: 0;
  transition: opacity 0.15s;
}
.image-upload__preview:hover .image-upload__overlay {
  opacity: 1;
}
.image-upload__hint {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--ed-text-secondary);
}
</style>
