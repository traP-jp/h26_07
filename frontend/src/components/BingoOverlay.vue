<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, type CSSProperties } from 'vue'

type AnimeTimeline = {
  play?: () => void
  pause?: () => void
  cancel?: () => void
}

type TextSplitter = {
  chars: Element[]
  revert?: () => void
}

type Props = {
  text?: string
  backgroundOpacity?: number
  fadeDuration?: number
  visibleDuration?: number
  startDelay?: number
  charDuration?: number
  charStagger?: number
  textColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  text: 'BINGO!!!',
  backgroundOpacity: 0.72,
  fadeDuration: 450,
  visibleDuration: 2000,
  startDelay: 0,
  charDuration: 500,
  charStagger: 100,
  textColor: '#ffffff',
})
const emit = defineEmits<{
  complete: []
}>()

const root = ref<HTMLElement | null>(null)
let splitter: TextSplitter | undefined
let timeline: AnimeTimeline | undefined
let showTimer: number | undefined
let hideTimer: number | undefined
let completeTimer: number | undefined

const overlayStyle = computed(
  () =>
    ({
      '--overlay-bg': `rgba(0, 0, 0, ${props.backgroundOpacity})`,
      '--fade-duration': `${props.fadeDuration}ms`,
      '--text-color': props.textColor,
    }) as CSSProperties,
)

onMounted(async () => {
  const { createTimeline, splitText, stagger } = await import('animejs')

  await nextTick()

  if (!root.value) return

  splitter = splitText(root.value.querySelector('.bingo-text') as HTMLElement, {
    chars: `<span class="char-3d word-{i}">
      <em class="face face-top">{value}</em>
      <em class="face-front">{value}</em>
      <em class="face face-bottom">{value}</em>
    </span>`,
    accessible: false,
  }) as TextSplitter

  const charsStagger = stagger(props.charStagger, { start: 0 })
  const faceTop = Array.from(root.value.querySelectorAll('.char-3d .face-top'))
  const faceFront = Array.from(root.value.querySelectorAll('.char-3d .face-front'))
  const faceBottom = Array.from(root.value.querySelectorAll('.char-3d .face-bottom'))

  timeline = createTimeline({
    defaults: {
      ease: 'linear',
      loop: true,
      duration: props.charDuration,
    },
    autoplay: false,
  })
    .add(splitter.chars, { rotateX: 90 }, charsStagger)
    .add(faceTop, { opacity: [0.5, 1] }, charsStagger)
    .add(faceFront, { opacity: [1, 0.5] }, charsStagger)
    .add(faceBottom, { opacity: [0.5, 0] }, charsStagger) as AnimeTimeline

  showTimer = window.setTimeout(() => {
    root.value?.classList.add('is-visible')
    timeline?.play?.()

    hideTimer = window.setTimeout(() => {
      root.value?.classList.add('is-fading')
      completeTimer = window.setTimeout(() => {
        timeline?.pause?.()
        emit('complete')
      }, props.fadeDuration)
    }, props.visibleDuration)
  }, props.startDelay)
})

onBeforeUnmount(() => {
  window.clearTimeout(showTimer)
  window.clearTimeout(hideTimer)
  window.clearTimeout(completeTimer)
  timeline?.pause?.()
  timeline?.cancel?.()
  splitter?.revert?.()
})
</script>

<template>
  <section ref="root" class="bingo-overlay" :style="overlayStyle" aria-label="bingo overlay">
    <p class="bingo-text">{{ text }}</p>
  </section>
</template>

<style scoped>
.bingo-overlay {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: var(--overlay-bg);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--fade-duration) ease;
}

.bingo-overlay.is-visible {
  opacity: 1;
}

.bingo-overlay.is-fading {
  opacity: 0;
}

.bingo-text {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  color: var(--text-color);
  font-family:
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: clamp(64px, 16vw, 220px);
  font-weight: 950;
  letter-spacing: 0;
  line-height: 1;
  perspective: 900px;
  white-space: nowrap;
}

:deep(.char-3d) {
  position: relative;
  display: inline-block;
  width: 0.75em;
  height: 1em;
  transform-style: preserve-3d;
  transform-origin: 50% 50% -0.5em;
}

:deep(.face),
:deep(.face-front) {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-style: normal;
  backface-visibility: hidden;
}

:deep(.face-front) {
  transform: translateZ(0.5em);
}

:deep(.face-top) {
  opacity: 0.5;
  transform: rotateX(90deg) translateZ(0.5em);
}

:deep(.face-bottom) {
  opacity: 0.5;
  transform: rotateX(-90deg) translateZ(0.5em);
}
</style>
