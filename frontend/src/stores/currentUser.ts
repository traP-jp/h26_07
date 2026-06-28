import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import type { User, UserId } from '@/api/schema'

export const useCurrentUserStore = defineStore('currentUser', () => {
  const currentUserId = ref<UserId | null>(null)

  async function init() {
    if (currentUserId.value !== null) {
      return
    }

    const response = await fetch('/api/me', {
      headers: {
        Accept: 'application/json',
      },
      redirect: 'manual',
    })

    if (response.type === 'opaqueredirect' || response.status === 0) {
      window.location.assign(window.location.href)
      await new Promise<never>(() => {})
    }

    if (!response.ok) {
      throw new Error('Failed to fetch current user')
    }

    const data = (await response.json()) as User
    currentUserId.value = data.userId
  }

  return {
    userId: computed(() => {
      if (currentUserId.value === null) {
        throw new Error('ユーザー情報が初期化されていません')
      }

      return currentUserId.value
    }),
    init,
  }
})
