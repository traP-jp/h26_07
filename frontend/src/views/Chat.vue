<script setup lang="ts">
import AllMessages from '@/components/layouts/AllMessages.vue'
</script>

<template>
  <div id="chat">
    <AllMessages room-id="Hello" textarea></AllMessages>
  </div>
</template>

<style>
#chat {
  height: 100vh;
}
</style>
