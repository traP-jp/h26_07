<script setup lang="ts">
import { computed } from 'vue'
const id = defineProps<{
    userId: string
}>()
const url = computed(() => `https://q.trap.jp/api/v3/public/icon/${id.userId}`)
</script>

<template>
    <div class="icon">
        <img :src="url" class="" />
    </div>
</template>

<style scoped>
.icon {
    width: 100%;
    height: 100%;
    overflow: hidden;
}
</style>
