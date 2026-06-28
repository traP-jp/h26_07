<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { createTimeline } from 'animejs'
import type { Timeline } from 'animejs'

const props = defineProps<{
  playKey: number
}>()

type PanelState = {
  x: number
  y: number
  rotate: number
  opacity: number
}

const upperPanel = ref<HTMLElement | null>(null)
const lowerPanel = ref<HTMLElement | null>(null)
const isActive = ref(false)
let timeline: Timeline | null = null
let hideTimerId: number | null = null

function applyPanelState(panel: HTMLElement | null, state: PanelState) {
  if (!panel) return

  panel.style.opacity = String(state.opacity)
  panel.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) rotate(${state.rotate}deg)`
}

function clearHideTimer() {
  if (hideTimerId == null) return

  window.clearTimeout(hideTimerId)
  hideTimerId = null
}

function stopTimeline() {
  timeline?.revert()
  timeline = null
  clearHideTimer()
}

async function playOverlayAnimation() {
  stopTimeline()
  isActive.value = true
  await nextTick()

  const upperElement = upperPanel.value
  const lowerElement = lowerPanel.value
  if (!upperElement || !lowerElement) return

  const panelRect = upperElement.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const finalX = (viewportWidth - panelRect.width) / 2
  const upperFinalY = viewportHeight / 2 - panelRect.height
  const lowerFinalY = viewportHeight / 2

  const upperState: PanelState = {
    x: viewportWidth + panelRect.width * 0.12,
    y: -panelRect.height * 1.2,
    rotate: -22,
    opacity: 1,
  }
  const lowerState: PanelState = {
    x: -panelRect.width * 1.12,
    y: viewportHeight - panelRect.height * 0.18,
    rotate: 22,
    opacity: 1,
  }

  applyPanelState(upperElement, upperState)
  applyPanelState(lowerElement, lowerState)

  timeline = createTimeline({
    defaults: {
      duration: 760,
      ease: 'outCubic',
    },
    onRender: () => {
      applyPanelState(upperElement, upperState)
      applyPanelState(lowerElement, lowerState)
    },
    onComplete: () => {
      hideTimerId = window.setTimeout(() => {
        isActive.value = false
        hideTimerId = null
      }, 120)
    },
  })

  timeline
    .add(upperState, {
      x: finalX,
      y: upperFinalY,
      rotate: 0,
    })
    .add(
      lowerState,
      {
        x: finalX,
        y: lowerFinalY,
        rotate: 0,
      },
      '<',
    )
    .add(
      [upperState, lowerState],
      {
        opacity: 0,
        duration: 260,
        delay: 320,
        ease: 'outQuad',
      },
      '+=0',
    )
}

watch(
  () => props.playKey,
  (playKey) => {
    if (playKey <= 0) return

    void playOverlayAnimation()
  },
)

onBeforeUnmount(() => {
  stopTimeline()
})
</script>

<template>
  <div
    class="pick-overlay-animation"
    :class="{ 'pick-overlay-animation--active': isActive }"
    aria-hidden="true"
  >
    <div ref="upperPanel" class="pick-overlay-animation__panel" />
    <div ref="lowerPanel" class="pick-overlay-animation__panel" />
  </div>
</template>

<style scoped>
.pick-overlay-animation {
  position: fixed;
  inset: 0;
  z-index: 20;
  overflow: hidden;
  pointer-events: none;
  visibility: hidden;
}

.pick-overlay-animation--active {
  visibility: visible;
}

.pick-overlay-animation__panel {
  position: absolute;
  top: 0;
  left: 0;
  width: min(88vw, 1120px);
  height: clamp(140px, 22vh, 260px);
  background: rgb(255 255 255 / 0.92);
  opacity: 0;
  transform-origin: center;
  will-change: opacity, transform;
}

@media (max-width: 640px) {
  .pick-overlay-animation__panel {
    width: 94vw;
    height: clamp(96px, 20vh, 160px);
  }
}
</style>
