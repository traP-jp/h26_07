import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import type { PickedBall } from '@/api/schema'
import { useSoundEffect } from '@/composables/useSoundEffect'
import { useRoomWebSocketStore } from '@/stores/roomWebSocket'

function createRandomPickedBall() {
  return Math.floor(Math.random() * 75 + 1) as PickedBall
}

export function usePickRollingEffect() {
  const roomWebSocketStore = useRoomWebSocketStore()
  const { latestBall, latestEvent, pickState } = storeToRefs(roomWebSocketStore)
  const rollingPickedBall = ref<PickedBall | null>(null)
  const drumroll = useSoundEffect('drumroll', { loop: true })
  const cymbal = useSoundEffect('cymbal')
  let rollingTimerId: number | null = null

  const displayBall = computed(() => {
    if (pickState.value === 'picking') {
      return rollingPickedBall.value ?? latestBall.value
    }

    return latestBall.value
  })

  function stopRollingBall() {
    if (rollingTimerId == null) return

    window.clearInterval(rollingTimerId)
    rollingTimerId = null
  }

  function startRollingBall() {
    stopRollingBall()

    rollingTimerId = window.setInterval(() => {
      rollingPickedBall.value = createRandomPickedBall()
    }, 60)
  }

  watch(latestEvent, (event) => {
    if (!event) return

    switch (event.type) {
      case 'PickStarted':
        startRollingBall()
        drumroll.play()
        break
      case 'PickFinished':
        stopRollingBall()
        drumroll.stop()
        cymbal.play()
        break
      case 'PickCanceled':
      case 'GameFinished':
      case 'AllPicked':
        stopRollingBall()
        drumroll.stop()
        break
    }
  })

  onBeforeUnmount(() => {
    stopRollingBall()
    drumroll.stop()
  })

  return {
    displayBall,
    latestBall,
    pickState,
  }
}
