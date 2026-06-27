<script setup lang="ts">
import BallIcon from './components/layouts/number_balls.vue'
</script>
<template>
  <BallIcon ball-color="red" text-color="black" text="33" size="48px"> </BallIcon>
  <UApp>
    <RouterView />
  </UApp>
</template>
