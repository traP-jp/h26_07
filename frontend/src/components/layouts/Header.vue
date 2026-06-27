<script setup lang="ts">
import { useCurrentUserStore } from '@/stores/currentUser'
import { computed } from 'vue'

const currentUserStore = useCurrentUserStore()
const userId = computed(() => currentUserStore.userId)
const iconUrl = computed(() => `https://q.trap.jp/api/v3/public/icon/${userId.value}`)
</script>

<template>
  <UHeader title="BINGO ONLINE" :toggle="false">
    <template #right>
      <UButton icon="i-lucide-plus" to="./new" target="_blank">新しいルームを作成</UButton>
      <UAvatar :src="iconUrl" loading="lazy" />
      <div>{{ userId }}</div>
    </template>
  </UHeader>
</template>
