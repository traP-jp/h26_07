<template>
  <div>
    <Header />
    <UMain>
      <RouterView />
    </UMain>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/layouts/Header.vue'
import Footer from '@/components/layouts/Footer.vue'
</script>
