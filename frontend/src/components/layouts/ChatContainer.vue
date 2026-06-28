<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import type { Uuid, Message, DateTime } from '@/api/schema'
import { useRoomWebSocketStore } from '@/stores/roomWebSocket'
const room = defineProps<{ roomCode: string; textarea: boolean }>()
const messages = ref<Message[]>([])
const chatContainer = ref<HTMLDivElement | null>(null)

const addUserMessage = async (m: Message) => {
  messages.value.push(m)
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const addSpecialMessage = (id: Uuid, content: string, createdAt: DateTime) => {
  messages.value.push({
    messageId: id,
    content: content,
    author: { userId: '' },
    createdAt: createdAt,
  })
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
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
  <div ref="chatContainer" id="chatContainer">
    <div v-for="message in messages" :key="message.messageId">
      <MessageContainer
        :user-id="message.author.userId"
        :content="message.content"
      ></MessageContainer>
    </div>
  </div>
  <div v-if="room.textarea" style="height: 30px">
    <PostMessage :room-code="room.roomCode"></PostMessage>
  </div>
</template>

<style>
#chatContainer {
  height: calc(100% - 50px);
  overflow-y: scroll;
  scrollbar-width: none;
}
#chatContainer::-webkit-scrollbar {
  display: none;
}
</style>
