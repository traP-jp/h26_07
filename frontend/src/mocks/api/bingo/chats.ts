import type { CreateMessageRequest } from '@/api/schema'

import { http } from '../../http'
import {
  assertVisible,
  badRequest,
  conflict,
  createMessage,
  currentUser,
  forbidden,
  getRoom,
  isAdmin,
  isParticipant,
  notFound,
  readJson,
  touch,
} from './core'
import { broadcastMessageCreated } from './websocket'

export const chatHandlers = [
  http.get('/api/rooms/{roomId}/chats', ({ params, request, response }) => {
    const roomState = getRoom(params.roomId)
    if (roomState === undefined) {
      return response(404).json(notFound())
    }

    const visibilityError = assertVisible(roomState, currentUser(request))
    if (visibilityError !== undefined) {
      return response(403).json(visibilityError)
    }

    return response(200).json(roomState.messages)
  }),

  http.post('/api/rooms/{roomId}/chats', async ({ params, request, response }) => {
    const roomState = getRoom(params.roomId)
    if (roomState === undefined) {
      return response(404).json(notFound())
    }

    const user = currentUser(request)
    if (!isParticipant(roomState.room, user.userId) && !isAdmin(roomState.room, user.userId)) {
      return response(403).json(forbidden('このルームにチャット投稿する権限がありません。'))
    }
    if (roomState.room.state === 'finished') {
      return response(409).json(conflict('finished のルームには投稿できません。'))
    }

    const body = await readJson<CreateMessageRequest>(request)
    const content = body?.content.trim()
    if (content === undefined || content.length === 0 || content.length > 500) {
      return response(400).json(
        badRequest('content は 1 文字以上 500 文字以下で指定してください。'),
      )
    }

    const message = createMessage(user, content)
    roomState.messages.push(message)
    touch(roomState.room)
    broadcastMessageCreated(roomState, message)

    return response(200).json(message)
  }),
]
