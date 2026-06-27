import type { CreateRoomRequest } from '@/api/schema'

import { http } from '../../http'
import {
  assertVisible,
  badRequest,
  createMockRoom,
  currentUser,
  getRoom,
  notFound,
  readJson,
  state,
  validateSettingsInput,
} from './core'

export const roomHandlers = [
  http.get('/api/rooms', ({ response }) => {
    return response(200).json([...state.rooms.values()].map((roomState) => roomState.room))
  }),

  http.post('/api/rooms', async ({ request, response }) => {
    const body = await readJson<CreateRoomRequest>(request)
    const user = currentUser(request)

    if (!validateSettingsInput(body?.settings)) {
      return response(400).json(badRequest('settings.name と settings.description が必要です。'))
    }

    const roomState = createMockRoom(body.settings, user)
    if (roomState === undefined) {
      return response(400).json(badRequest('adminUserIds を指定する場合は空にできません。'))
    }

    state.rooms.set(roomState.room.roomId, roomState)
    return response(200).json(roomState.room)
  }),

  http.get('/api/rooms/{roomId}', ({ params, request, response }) => {
    const roomState = getRoom(params.roomId)
    if (roomState === undefined) {
      return response(404).json(notFound())
    }

    const visibilityError = assertVisible(roomState, currentUser(request))
    if (visibilityError !== undefined) {
      return response(403).json(visibilityError)
    }

    return response(200).json(roomState.room)
  }),
]
