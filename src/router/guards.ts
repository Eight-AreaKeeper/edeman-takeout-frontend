import type { Router } from 'vue-router'
import { getToken } from '@/utils/cookies'

export function installGuards(router: Router) {
  router.beforeEach((to) => {
    const hasToken = Boolean(getToken())
    if (hasToken || to.meta.public) {
      return true
    }
    return { path: '/login', query: { redirect: to.fullPath } }
  })

  router.afterEach((to) => {
    document.title = to.meta.title ? `${to.meta.title} · edeman` : 'edeman'
  })
}
