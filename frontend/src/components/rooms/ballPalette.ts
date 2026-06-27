import type { PickedBall } from '@/api/schema'

export const ballGroupPalettes = [
  { picked: '#56a7ee', waiting: '#eaf5ff', text: '#175286' },
  { picked: '#8e82f4', waiting: '#f0eeff', text: '#443b9a' },
  { picked: '#b489f1', waiting: '#f4edff', text: '#5b3a98' },
  { picked: '#ea86ce', waiting: '#fff0fa', text: '#8f2f73' },
  { picked: '#f28b8d', waiting: '#fff0f0', text: '#943739' },
] as const

export function getBallGroupIndex(ball: PickedBall) {
  return Math.floor((ball - 1) / 15)
}

export function getBallPalette(ball: PickedBall) {
  return ballGroupPalettes[getBallGroupIndex(ball)] ?? ballGroupPalettes[0]
}
