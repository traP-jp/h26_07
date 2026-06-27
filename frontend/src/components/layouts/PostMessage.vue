<script setup lang="ts">
import { ref } from 'vue'
const roomId = defineProps<{ roomId: string }>()
const newMessage = ref('')
type RequestBody = {
  content: string
}
const post = async () => {
  const data: RequestBody = {
    content: newMessage.value,
  }
  try {
    const response = await fetch(`/api/rooms/${roomId}/chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`)
    }
    const result = await response.json()
    console.log('Success', result)
  } catch (error) {
    console.error('Error', error)
  }
}
</script>

<template>
  <div style="display: flex; gap: 6px">
    <div class="newMessage">
      <input id="newMessage" v-model="newMessage" type="text" />
    </div>
    <div class="button" @click="post()">
      <svg height="40" width="40" view-box="0 0 40 40">
        <path d="M0 0v17l40 3-40 3v17l40-20z"></path>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.newMessage {
  height: 20px;
  align-items: center;
}
.button {
  width: 20px;
  height: 20px;
}
path {
  fill: rgb(12, 185, 80);
}
#newMessage {
  height: 20px;
  color: #cfcfcf;
  width: 100%;
  padding: 8px 10px;
  border: none;
  border-radius: 3px;
  background-color: #272727;
  font-size: 1em;
  line-height: 1.5;
}
#newMessage:focus {
  outline: 1px solid rgb(12, 185, 80);
}
</style>
