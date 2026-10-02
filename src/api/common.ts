import { request } from '@/utils/request'

export function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request<string>({
    url: '/common/upload',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
