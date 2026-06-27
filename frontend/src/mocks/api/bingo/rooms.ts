import type { CreateRoomRequest, GameSettings, Room } from '@/api/schema'

import { http } from '../../http'
import { readJson } from './core'

export const mockRooms: Room[] = [
  {
    roomId: '00000000-0000-4000-8000-000000000001',
    roomCode: '123456',
    state: 'waiting',
    pickState: 'idle',
    qrCodeVisible: true,
    participants: [
      {
        user: { userId: 'mumumu' },
        joinedAt: '2026-06-27T10:00:00.000Z',
      },
      {
        user: { userId: 'saba' },
        joinedAt: '2026-06-27T10:01:00.000Z',
      },
      {
        user: { userId: 'rurun' },
        joinedAt: '2026-06-27T10:02:00.000Z',
      },
      {
        user: { userId: 'howard127' },
        joinedAt: '2026-06-27T10:03:00.000Z',
      },
      {
        user: { userId: 'kurao' },
        joinedAt: '2026-06-27T10:04:00.000Z',
      },
      {
        user: { userId: 'minami' },
        joinedAt: '2026-06-27T10:05:00.000Z',
      },
      {
        user: { userId: 'yamada' },
        joinedAt: '2026-06-27T10:06:00.000Z',
      },
    ],
    bingoSummaries: [],
    reachSummaries: [],
    settings: {
      name: 'デモビンゴ',
      description: 'モック API で動かす待機中のビンゴルームです。',
      admins: [{ userId: 'mumumu' }],
    },
    createdAt: '2026-06-27T10:00:00.000Z',
    updatedAt: '2026-06-27T10:00:00.000Z',
  },
  {
    roomId: '00000000-0000-4000-8000-000000000002',
    roomCode: '234567',
    state: 'playing',
    pickState: 'idle',
    qrCodeVisible: false,
    participants: [
      {
        user: { userId: 'mumumu' },
        joinedAt: '2026-06-27T11:00:00.000Z',
      },
      {
        user: { userId: 'rurun' },
        joinedAt: '2026-06-27T11:01:00.000Z',
      },
      {
        user: { userId: 'howard127' },
        joinedAt: '2026-06-27T11:02:00.000Z',
      },
    ],
    bingoSummaries: [
      {
        user: { userId: 'rurun' },
        bingoOrders: [1],
      },
    ],
    reachSummaries: [
      {
        user: { userId: 'howard127' },
      },
    ],
    settings: {
      name: '進行中ビンゴ',
      description: 'playing 状態の表示確認用モックルームです。',
      admins: [{ userId: 'mumumu' }],
    },
    createdAt: '2026-06-27T11:00:00.000Z',
    updatedAt: '2026-06-27T11:10:00.000Z',
  },
  {
    roomId: '00000000-0000-4000-8000-000000000003',
    roomCode: '345678',
    state: 'finished',
    pickState: 'idle',
    qrCodeVisible: false,
    participants: [
      {
        user: { userId: 'mumumu' },
        joinedAt: '2026-06-27T12:00:00.000Z',
      },
      {
        user: { userId: 'kurao' },
        joinedAt: '2026-06-27T12:01:00.000Z',
      },
    ],
    bingoSummaries: [
      {
        user: { userId: 'kurao' },
        bingoOrders: [1, 2],
      },
    ],
    reachSummaries: [],
    settings: {
      name: '終了済みビンゴ',
      description: 'finished 状態の表示確認用モックルームです。',
      admins: [{ userId: 'mumumu' }],
    },
    createdAt: '2026-06-27T12:00:00.000Z',
    updatedAt: '2026-06-27T12:30:00.000Z',
  },
]
export const fallbackRoom = mockRooms[0] as Room

function roomFromSettings(settings: GameSettings): Room {
  const createdAt = new Date().toISOString()
  return {
    ...fallbackRoom,
    roomId: crypto.randomUUID(),
    settings,
    participants: [],
    bingoSummaries: [],
    reachSummaries: [],
    createdAt,
    updatedAt: createdAt,
  }
}

export const roomHandlers = [
  http.get('/api/rooms', ({ response }) => {
    return response(200).json(mockRooms)
  }),

  http.post('/api/rooms', async ({ request, response }) => {
    const body = await readJson<CreateRoomRequest>(request)
    const settings: GameSettings = {
      name: body?.settings.name ?? 'デモビンゴ',
      description: body?.settings.description ?? 'モック API で作成したビンゴルームです。',
      admins: (body?.settings.adminUserIds ?? ['mumumu']).map((userId) => ({ userId })),
    }

    return response(200).json(roomFromSettings(settings))
  }),

  http.get('/api/rooms/{roomId}', ({ params, response }) => {
    return response(200).json(
      mockRooms.find((room) => room.roomId === params.roomId) ?? fallbackRoom,
    )
  }),
]
