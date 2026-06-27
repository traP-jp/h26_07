import type { PickedBall } from '@/api/schema'

export const ballGroupPalettes = [
  { picked: '#2f8fe4', waiting: '#d6eaff', text: '#175286', ring: '#1d74c8' },
  { picked: '#4f7fe8', waiting: '#dfe9ff', text: '#2a5599', ring: '#3f6fd8' },
  { picked: '#9b63e6', waiting: '#eadcff', text: '#5b3a98', ring: '#8153d5' },
  { picked: '#dc5fb8', waiting: '#ffdcef', text: '#8f2f73', ring: '#cf4da7' },
  { picked: '#e76568', waiting: '#ffdede', text: '#943739', ring: '#d65358' },
] as const

export function getBallGroupIndex(ball: PickedBall) {
  return Math.floor((ball - 1) / 15)
}

export function getBallPalette(ball: PickedBall) {
  return ballGroupPalettes[getBallGroupIndex(ball)] ?? ballGroupPalettes[0]
}
