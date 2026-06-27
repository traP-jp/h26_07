<template>
  <div class="room-stats-bar" aria-label="ルーム状況">
    <span v-for="stat in stats" :key="stat.label" class="room-stats-bar__item">
      <span class="room-stats-bar__text">{{ stat.label }}：</span>
      <span class="room-stats-bar__text">{{ stat.value }}人</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useRoomWebSocketStore } from '@/stores/roomWebSocket'

const roomWebSocketStore = useRoomWebSocketStore()
const { bingoSummaries, participantCount, reachSummaries } = storeToRefs(roomWebSocketStore)

const stats = computed(() => [
  {
    label: '参加者',
    value: participantCount.value ?? 0,
  },
  {
    label: 'ビンゴ',
    value: bingoSummaries.value.length,
  },
  {
    label: 'リーチ',
    value: reachSummaries.value.length,
  },
])
</script>

<style scoped>
.room-stats-bar {
  display: flex;
  box-sizing: border-box;
  min-height: 52px;
  width: 100%;
  max-width: 742px;
  align-items: center;
  justify-content: center;
  gap: 32px;
  border-radius: 14px;

  background: rgb(255 255 255 / 0.82);
  border: 1px solid rgb(255 255 255 / 0.9);
  box-shadow:
    0 8px 24px rgb(31 74 130 / 0.12),
    0 1px 2px rgb(31 74 130 / 0.08);

  padding: 8px 28px;
}

.room-stats-bar__item {
  color: #1f4f8f;
  font-weight: 700;
  font-size: 22px;
  letter-spacing: 0.03em;
  line-height: 1;
}

.room-stats-bar__text {
  white-space: nowrap;
}

@media (max-width: 520px) {
  .room-stats-bar__item {
    min-width: 0;
    font-size: 16px;
  }
}
</style>
