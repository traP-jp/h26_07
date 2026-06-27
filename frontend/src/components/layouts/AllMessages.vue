<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Uuid, Message, DateTime } from '@/api/schema'
import { useRoomWebSocketStore } from '@/stores/roomWebSocket'
const room = defineProps<{ roomId: string; textarea: boolean }>()
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
          `${newValue[0]?.user} と他 ${newValue.length - 1} 人がビンゴしました！`,
          'ima',
        )
      } else {
        addSpecialMessage('newBingos', `${newValue[0]?.user} がビンゴしました！`, 'ima')
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
          `${newValue[0]?.user} と他 ${newValue.length - 1} 人がリーチしました！`,
          'ima',
        )
      } else {
        addSpecialMessage('newReaches', `${newValue[0]?.user} がリーチしました！`, 'ima')
      }
    }
  },
)
defineExpose({ addSpecialMessage })
</script>

<template>
  <div id="chatContainer">
    <div v-for="message in messages" :key="message.messageId">
      <Message :user-id="message.author.userId" :content="message.content"></Message>
    </div>
  </div>
  <div v-if="room.textarea">
    <PostMessage :room-id="room.roomId"></PostMessage>
  </div>
</template>

<style>
#chatContainer {
  min-height: calc(100% - 150px);
  overflow: scroll;
  scrollbar-width: none;
}
#chatContainer::-webkit-scrollbar {
  display: none;
}
</style>
