<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Uuid, Message, DateTime } from '@/api/schema'
import { useRoomWebSocketStore } from '@/stores/roomWebSocket'
const room = defineProps<{ roomCode: string; textarea: boolean }>()
const messages = ref<Message[]>([])

const addUserMessage = (m: Message) => {
  messages.value.push(m)
}

const addSpecialMessage = (id: Uuid, content: string, createdAt: DateTime) => {
  messages.value.push({
    messageId: id,
    content: content,
    author: { userId: '' },
    createdAt: createdAt,
  })
}

const store = useRoomWebSocketStore()
store.connect({ roomId: room.roomCode, mode: room.textarea ? 'participant' : 'display' })
watch(
  () => store.latestMessage,
  (newValue) => {
    if (newValue) {
      addUserMessage(newValue)
    }
  },
)
watch(
  () => store.pickState,
  (newValue) => {
    if (newValue == 'exhausted') {
      addSpecialMessage('allPicked', '球が枯渇しました！', 'ima')
    }
  },
)
watch(
  () => store.latestNewBingos,
  (newValue) => {
    if (newValue) {
      if (newValue.length >= 2) {
        addSpecialMessage(
          'newBingos',
          `${newValue[0]?.user.userId} と他 ${newValue.length - 1} 人がビンゴしました！`,
          'ima',
        )
      } else {
        addSpecialMessage('newBingos', `${newValue[0]?.user.userId} がビンゴしました！`, 'ima')
      }
    }
  },
)
watch(
  () => store.latestNewReaches,
  (newValue) => {
    if (newValue) {
      if (newValue.length >= 2) {
        addSpecialMessage(
          'newReaches',
          `${newValue[0]?.user.userId} と他 ${newValue.length - 1} 人がリーチしました！`,
          'ima',
        )
      } else {
        addSpecialMessage('newReaches', `${newValue[0]?.user.userId} がリーチしました！`, 'ima')
      }
    }
  },
)
</script>

<template>
  <div id="chatContainer">
    <div v-for="message in messages" :key="message.messageId">
      <MessageContainer
        :user-id="message.author.userId"
        :content="message.content"
      ></MessageContainer>
    </div>
  </div>
  <div v-if="room.textarea">
    <PostMessage :room-code="room.roomCode"></PostMessage>
  </div>
</template>

<style>
#chatContainer {
  min-height: calc(100% - 50px);
  overflow: scroll;
  scrollbar-width: none;
}
#chatContainer::-webkit-scrollbar {
  display: none;
}
</style>
