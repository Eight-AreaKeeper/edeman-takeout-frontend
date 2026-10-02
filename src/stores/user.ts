import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as employeeApi from '@/api/employee'
import { getToken, removeToken, setToken } from '@/utils/cookies'

const USER_INFO_KEY = 'edeman_user_info'

interface StoredUserInfo {
  id: number
  username: string
  name: string
}

function loadStoredUserInfo(): StoredUserInfo | null {
  const raw = localStorage.getItem(USER_INFO_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredUserInfo
  } catch {
    return null
  }
}

export const useUserStore = defineStore('user', () => {
  const token = ref(getToken() ?? '')
  const stored = loadStoredUserInfo()
  const id = ref(stored?.id ?? 0)
  const username = ref(stored?.username ?? '')
  const name = ref(stored?.name ?? '')

  function persist(info: StoredUserInfo) {
    id.value = info.id
    username.value = info.username
    name.value = info.name
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(info))
  }

  async function login(payload: { username: string; password: string }) {
    const result = await employeeApi.login(payload)
    token.value = result.token
    setToken(result.token)
    persist({ id: result.id, username: result.userName, name: result.name })
  }

  async function logout() {
    try {
      await employeeApi.logout()
    } finally {
      resetToken()
    }
  }

  function resetToken() {
    token.value = ''
    id.value = 0
    username.value = ''
    name.value = ''
    removeToken()
    localStorage.removeItem(USER_INFO_KEY)
  }

  return { token, id, username, name, login, logout, resetToken }
})
