import axios, { type AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { getToken, removeToken } from '@/utils/cookies'

export interface ApiResult<T = unknown> {
  code: number
  msg?: string
  desc?: string
  data: T
}

export interface RequestConfig extends AxiosRequestConfig {
  /** Skip the global error toast — for calls to endpoints known not to exist on the backend yet. */
  silent?: boolean
}

const instance = axios.create({
  baseURL: '/api',
  timeout: 600000,
})

instance.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.set('token', token)
  }
  return config
})

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    if (status === 401) {
      removeToken()
      router.push('/login')
    } else if (!(error.config as RequestConfig | undefined)?.silent) {
      ElMessage.error(status ? `Request failed (${status})` : 'Network error, please try again')
    }
    return Promise.reject(error)
  },
)

/**
 * Unwraps the backend's {code, msg|desc, data} envelope.
 * code === 1 is success; anything else rejects with the server-provided message.
 *
 * Requests with a non-JSON responseType (e.g. `blob` for file downloads) don't use
 * this envelope at all — the response body IS the payload — so those bypass the
 * unwrapping and are returned as-is.
 */
export async function request<T = unknown>(config: RequestConfig): Promise<T> {
  const response = await instance.request<ApiResult<T>>(config)
  if (config.responseType && config.responseType !== 'json') {
    return response.data as unknown as T
  }
  const body = response.data
  if (body.code === 1) {
    return body.data
  }
  const message = body.msg || body.desc || 'Request failed'
  if (!config.silent) {
    ElMessage.error(message)
  }
  return Promise.reject(new Error(message))
}

export default instance
