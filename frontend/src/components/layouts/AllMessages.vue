<script setup lang="ts">
import { ref } from 'vue'
//import { Message } from '@/api/schema'
const messages = ref<Message[]>([])

const ws = new WebSocket('ws://localhost:8080/ws')

type UUID = string
type DateTime = string
type UserId = string
type User = {
    userId: UserId
    name: string
}
type Message = {
    messageId: UUID
    content: string
    author: User | null
    createdAt: DateTime
}
type MessageCreatedBody = {
    message: Message
}
type BingoUpdate = {
    messageId: UUID
    user: User
    newBingoOrders: number[]
    bingoOrders: number[]
}
type ReachUpdate = {
    messageId: UUID
    user: User
}
type AllPickedBody = {
    messageId: UUID
    pickedBalls: PickedBall[]
}
type PickedBall = {
    pickedAt: DateTime
}
const addUserMessage = (message: Message) => {
    messages.value.push(message)
}
const addSpecialMessage = (messageId: UUID, content: string) => {
    messages.value.push({ messageId: messageId, content: content, author: null,  })
}

ws.addEventListener('message', (event: MessageEvent) => {
    const data = JSON.parse(event.data)
    if (data.type == 'MessageCreated') {
        const message = data as MessageCreatedEvent
        addUserMessage(message.messageId, message.userId, message.content)
    }
})

const addSpecialMessage = (messageId: string, content: string) => {
    messages.value.push({ messageId: messageId, userId: '', content: content })
}
</script>

<template>
    <div>
        <div v-for="message in messages" :key="message.messageId">
            <Message :user-id="message.userId" :content="message.content"></Message>
        </div>
    </div>
</template>
