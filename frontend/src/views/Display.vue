<template>
  <div class="display-page">
    <div class="display-page__latest-ball" aria-label="直近の抽選番号">
      <NumberBall
        class="display-page__latest-number"
        :ball-color="latestPickedBallColor"
        :text-color="latestPickedBallTextColor"
        :text="latestPickedBall == null ? '-' : String(latestPickedBall)"
        :size="260"
      />
    </div>
    <BallStateGrid :picked-balls="pickedBalls" :latest-picked-ball="latestPickedBall" />
    <RoomStatsBar />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'

import type { RoomCode, RoomId } from '@/api/schema'
import NumberBall from '@/components/layouts/NumberBall.vue'
import BallStateGrid from '@/components/rooms/BallStateGrid.vue'
import { getBallPalette } from '@/components/rooms/ballPalette'
import RoomStatsBar from '@/components/rooms/RoomStatsBar.vue'
import { useRoomsStore } from '@/stores/rooms'
import { useRoomWebSocketStore } from '@/stores/roomWebSocket'

const route = useRoute()
const roomsStore = useRoomsStore()
const roomWebSocketStore = useRoomWebSocketStore()
const {
  latestPickedBall,
  mode,
  pickedBalls,
  roomId: connectedRoomId,
} = storeToRefs(roomWebSocketStore)
const { roomsByCode } = storeToRefs(roomsStore)

const roomCode = route.params.roomCode as RoomCode | undefined
const roomId = ref<RoomId | null>(null)

const latestPickedBallColor = computed(() => {
  if (latestPickedBall.value == null) {
    return '#f1f6fb'
  }

  return getBallPalette(latestPickedBall.value).picked
})

const latestPickedBallTextColor = computed(() => {
  if (latestPickedBall.value == null) {
    return '#9aa8b7'
  }

  return '#ffffff'
})

onMounted(async () => {
  if (!roomCode) return

  await roomsStore.init()
  roomId.value = roomsByCode.value.get(roomCode)?.roomId ?? null

  if (!roomId.value) return

  if (connectedRoomId.value === roomId.value && mode.value === 'display') {
    return
  }

  roomWebSocketStore.connect({ roomId: roomId.value, mode: 'display' })
})

onBeforeUnmount(() => {
  if (roomId.value && connectedRoomId.value === roomId.value) {
    roomWebSocketStore.disconnect()
  }
})
</script>

<style scoped>
.display-page {
  display: flex;
  height: 100vh;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
  padding: 3% 3% 2%;
  gap: 6%;
}

.display-page__latest-ball {
  width: 100%;
  height: 34%;
  display: grid;
  place-items: center;
}

.display-page__latest-number {
  width: auto !important;
  height: 90% !important;
  aspect-ratio: 1 / 1;
  font-size: 12dvh !important;
  box-shadow:
    0 10px 15px -3px rgb(0 0 0 / 0.1),
    0 4px 6px -4px rgb(0 0 0 / 0.1);
}
</style>
