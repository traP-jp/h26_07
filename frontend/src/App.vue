<script setup lang="ts">
import BingoCardPaper from '@/components/layouts/BingoCardPaper.vue'
import type { Card } from '@/api/schema'

const card: Card = {
  cardId: 'abc',
  ownerUserId: 'aosushi828',
  cells: [
    { index: 0, number: 4, displayText: '04', cellState: 'open' },
    { index: 1, number: 25, displayText: '25', cellState: 'open' },
    { index: 2, number: 45, displayText: '45', cellState: 'open' },
    { index: 3, number: 52, displayText: '52', cellState: 'open' },
    { index: 4, number: 72, displayText: '72', cellState: 'open' },

    { index: 5, number: 11, displayText: '11', cellState: 'open' },
    { index: 6, number: 18, displayText: '18', cellState: 'open' },
    { index: 7, number: 31, displayText: '31', cellState: 'reach' },
    { index: 8, number: 60, displayText: '60', cellState: 'open' },
    { index: 9, number: 62, displayText: '62', cellState: 'open' },

    { index: 10, number: 9, displayText: '09', cellState: 'open' },
    { index: 11, number: 16, displayText: '16', cellState: 'open' },
    { index: 12, number: null, displayText: '★', cellState: 'bingo' },
    { index: 13, number: 59, displayText: '59', cellState: 'open' },
    { index: 14, number: 68, displayText: '68', cellState: 'open' },

    { index: 15, number: 14, displayText: '14', cellState: 'open' },
    { index: 16, number: 29, displayText: '29', cellState: 'open' },
    { index: 17, number: 43, displayText: '43', cellState: 'open' },
    { index: 18, number: 48, displayText: '48', cellState: 'closed' },
    { index: 19, number: 73, displayText: '73', cellState: 'open' },

    { index: 20, number: 7, displayText: '07', cellState: 'open' },
    { index: 21, number: 19, displayText: '19', cellState: 'open' },
    { index: 22, number: 34, displayText: '34', cellState: 'open' },
    { index: 23, number: 50, displayText: '50', cellState: 'open' },
    { index: 24, number: 71, displayText: '71', cellState: 'open' },
  ],
  bingoLines: [],
  reachLines: [],
}
</script>
<template>
  <BingoCardPaper :card="card" card-no="99999999999999999999999" :cell-size="92" />
  <UApp>
    <RouterView />
  </UApp>
</template>
