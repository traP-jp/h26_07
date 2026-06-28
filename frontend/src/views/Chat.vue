<script setup lang="ts">
import ChatContainer from '@/components/layouts/ChatContainer.vue'
</script>

<template>
  <div id="chat">
    <ChatContainer room-code="123456" textarea></ChatContainer>
  </div>
</template>

<style>
#chat {
  height: 90vh;
}
</style>
