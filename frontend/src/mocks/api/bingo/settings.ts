import type { UpdateGameSettingsRequest } from '@/api/schema'

import { http } from '../../http'
import {
  assertAdmin,
  badRequest,
  conflict,
  currentUser,
  getRoom,
  notFound,
  readJson,
  settingsFromInput,
  touch,
  validateSettingsInput,
} from './core'
import { broadcastGameSettingsUpdated } from './websocket'

export const settingHandlers = [
  http.put('/api/rooms/{roomId}/settings', async ({ params, request, response }) => {
    const roomState = getRoom(params.roomId)
    if (roomState === undefined) {
      return response(404).json(notFound())
    }

    const user = currentUser(request)
    const adminError = assertAdmin(roomState, user)
    if (adminError !== undefined) {
      return response(403).json(adminError)
    }
    if (roomState.room.state === 'finished') {
      return response(409).json(conflict('finished のルームは設定変更できません。'))
    }

    const body = await readJson<UpdateGameSettingsRequest>(request)
    if (!validateSettingsInput(body?.settings)) {
      return response(400).json(badRequest('settings.name と settings.description が必要です。'))
    }

    const fallbackAdminIds = roomState.room.settings.admins.map((admin) => admin.userId)
    const settings = settingsFromInput(body.settings, fallbackAdminIds)
    if (settings === undefined) {
      return response(400).json(badRequest('adminUserIds を指定する場合は空にできません。'))
    }

    roomState.room.settings = settings
    touch(roomState.room)
    broadcastGameSettingsUpdated(roomState)

    return response(200).json(settings)
  }),
]
