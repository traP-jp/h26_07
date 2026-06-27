import type { PickedBall } from '@/api/schema'

export const ballGroupPalettes = [
  { picked: '#56a7ee', waiting: '#eaf5ff', text: '#175286', ring: '#1d74c8' },
  { picked: '#6f95f2', waiting: '#eef4ff', text: '#2a5599', ring: '#3f6fd8' },
  { picked: '#b489f1', waiting: '#f4edff', text: '#5b3a98', ring: '#8153d5' },
  { picked: '#ea86ce', waiting: '#fff0fa', text: '#8f2f73', ring: '#cf4da7' },
  { picked: '#f28b8d', waiting: '#fff0f0', text: '#943739', ring: '#d65358' },
] as const

export function getBallGroupIndex(ball: PickedBall) {
  return Math.floor((ball - 1) / 15)
}

export function getBallPalette(ball: PickedBall) {
  return ballGroupPalettes[getBallGroupIndex(ball)] ?? ballGroupPalettes[0]
}
