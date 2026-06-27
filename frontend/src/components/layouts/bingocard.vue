<script setup lang="ts">
import type { Card } from '@/api/schema'
import CardCell from './cardcells.vue'

const props = defineProps<{
  card: Card
  cellSize?: number
}>()

const size = props.cellSize ?? 48
</script>

<template>
  <div
    class="bingo-card"
    :style="{
      gridTemplateColumns: `repeat(5, ${size}px)`,
      gridAutoRows: `${size}px`,
    }"
  >
    <CardCell v-for="cell in props.card.cells" :key="cell.index" :cell="cell" :size="size" />
  </div>
</template>

<style scoped>
.bingo-card {
  display: grid;
  gap: 8px;
}
</style>
