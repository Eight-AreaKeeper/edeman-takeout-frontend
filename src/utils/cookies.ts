import Cookies from 'js-cookie'

const TOKEN_KEY = 'edeman_token'
const SIDEBAR_KEY = 'edeman_sidebar'

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY)
}

export function setToken(token: string) {
  Cookies.set(TOKEN_KEY, token)
}

export function removeToken() {
  Cookies.remove(TOKEN_KEY)
}

export function getSidebarOpened(): boolean {
  const value = Cookies.get(SIDEBAR_KEY)
  return value === undefined ? true : value === 'opened'
}

export function setSidebarOpened(opened: boolean) {
  Cookies.set(SIDEBAR_KEY, opened ? 'opened' : 'closed')
}
