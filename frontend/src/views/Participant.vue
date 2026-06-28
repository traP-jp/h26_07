<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import BingoCardPaper from '@/components/layouts/BingoCardPaper.vue'
import { useRoomWebSocketStore } from '@/stores/roomWebSocket'
import { useRoute } from 'vue-router'
import type { RoomCode, Card, RoomId } from '@/api/schema'
import { useRoomsStore } from '@/stores/rooms'
import { storeToRefs } from 'pinia'

const route = useRoute()
const roomCode = route.params.roomCode as RoomCode | undefined
const roomId = ref<RoomId | null>(null)
const roomWebSocketStore = useRoomWebSocketStore()
const roomsStore = useRoomsStore()
const { roomsByCode } = storeToRefs(roomsStore)
const { mode, roomId: connectedRoomId } = storeToRefs(roomWebSocketStore)

const { card, latestEvent } = storeToRefs(roomWebSocketStore)

const displayCard = ref<Card | null>(null)

onMounted(async () => {
  if (!roomCode) return

  await roomsStore.init()
  roomId.value = roomsByCode.value.get(roomCode)?.roomId ?? null

  if (!roomId.value) return

  if (connectedRoomId.value === roomId.value && mode.value === 'participant') {
    return
  }

  await roomsStore.joinRoom(roomId.value)
  roomWebSocketStore.connect({ roomId: roomId.value, mode: 'participant' })
})
onBeforeUnmount(() => {
  if (roomId.value && connectedRoomId.value === roomId.value) {
    roomWebSocketStore.disconnect()
  }
})

watch(latestEvent, async (event) => {
  if (!event) return

  switch (event.type) {
    case 'Initialized':
    case 'GameStarted':
    case 'PickFinished':
    case 'GameFinished':
      displayCard.value = card.value
      break

    default:
      break
  }
})
</script>

<template>
  <div class="participant-room">
    <BingoCardPaper v-if="displayCard" :card="displayCard" :size="90" />
  </div>
</template>

<style scoped>
.participant-room {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
