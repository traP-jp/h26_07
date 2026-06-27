import { http } from '../../http'
import {
  assertAdmin,
  conflict,
  currentUser,
  finishPick,
  getRoom,
  isApiError,
  notFound,
  startRoom,
  touch,
} from './core'
import {
  broadcastAllPicked,
  broadcastGameFinished,
  broadcastGameStarted,
  broadcastHideQRCode,
  broadcastPickCanceled,
  broadcastPickFinished,
  broadcastPickStarted,
  broadcastShowQRCode,
} from './websocket'

export const controlHandlers = [
  http.post('/api/rooms/{roomId}/control/start', ({ params, request, response }) => {
    const roomState = getRoom(params.roomId)
    if (roomState === undefined) {
      return response(404).json(notFound())
    }

    const adminError = assertAdmin(roomState, currentUser(request))
    if (adminError !== undefined) {
      return response(403).json(adminError)
    }

    const startError = startRoom(roomState)
    if (startError !== undefined) {
      return response(409).json(startError)
    }

    broadcastGameStarted(roomState)

    return response(204).empty()
  }),

  http.post('/api/rooms/{roomId}/control/finish', ({ params, request, response }) => {
    const roomState = getRoom(params.roomId)
    if (roomState === undefined) {
      return response(404).json(notFound())
    }

    const adminError = assertAdmin(roomState, currentUser(request))
    if (adminError !== undefined) {
      return response(403).json(adminError)
    }
    if (roomState.room.state !== 'playing') {
      return response(409).json(conflict('ルームが playing ではない、または既に finished です。'))
    }

    const wasPicking = roomState.room.pickState === 'picking'
    roomState.room.state = 'finished'
    roomState.room.pickState = 'idle'
    touch(roomState.room)

    if (wasPicking) {
      broadcastPickCanceled(roomState)
    }
    broadcastGameFinished(roomState)

    return response(204).empty()
  }),

  http.post('/api/rooms/{roomId}/control/pick/start', ({ params, request, response }) => {
    const roomState = getRoom(params.roomId)
    if (roomState === undefined) {
      return response(404).json(notFound())
    }

    const adminError = assertAdmin(roomState, currentUser(request))
    if (adminError !== undefined) {
      return response(403).json(adminError)
    }
    if (roomState.room.state !== 'playing' || roomState.room.pickState !== 'idle') {
      return response(409).json(conflict('playing + idle ではありません。'))
    }
    if (roomState.pickedBalls.length >= 75) {
      roomState.room.pickState = 'exhausted'
      touch(roomState.room)
      return response(409).json(conflict('抽選可能な球がありません。'))
    }

    roomState.room.pickState = 'picking'
    touch(roomState.room)
    broadcastPickStarted(roomState)

    return response(204).empty()
  }),

  http.post('/api/rooms/{roomId}/control/pick/cancel', ({ params, request, response }) => {
    const roomState = getRoom(params.roomId)
    if (roomState === undefined) {
      return response(404).json(notFound())
    }

    const adminError = assertAdmin(roomState, currentUser(request))
    if (adminError !== undefined) {
      return response(403).json(adminError)
    }
    if (roomState.room.state !== 'playing' || roomState.room.pickState !== 'picking') {
      return response(409).json(conflict('現在抽選中ではない、またはゲーム状態が不正です。'))
    }

    roomState.room.pickState = 'idle'
    touch(roomState.room)
    broadcastPickCanceled(roomState)

    return response(204).empty()
  }),

  http.post('/api/rooms/{roomId}/control/pick/finish', ({ params, request, response }) => {
    const roomState = getRoom(params.roomId)
    if (roomState === undefined) {
      return response(404).json(notFound())
    }

    const adminError = assertAdmin(roomState, currentUser(request))
    if (adminError !== undefined) {
      return response(403).json(adminError)
    }

    const result = finishPick(roomState)
    if (isApiError(result)) {
      return response(409).json(result)
    }

    broadcastPickFinished(roomState, result)
    if (result.allPicked) {
      broadcastAllPicked(roomState)
    }

    return response(204).empty()
  }),

  http.post('/api/rooms/{roomId}/control/qrcode/show', ({ params, request, response }) => {
    const roomState = getRoom(params.roomId)
    if (roomState === undefined) {
      return response(404).json(notFound())
    }

    const adminError = assertAdmin(roomState, currentUser(request))
    if (adminError !== undefined) {
      return response(403).json(adminError)
    }

    roomState.room.qrCodeVisible = true
    touch(roomState.room)
    broadcastShowQRCode(roomState)

    return response(204).empty()
  }),

  http.post('/api/rooms/{roomId}/control/qrcode/hide', ({ params, request, response }) => {
    const roomState = getRoom(params.roomId)
    if (roomState === undefined) {
      return response(404).json(notFound())
    }

    const adminError = assertAdmin(roomState, currentUser(request))
    if (adminError !== undefined) {
      return response(403).json(adminError)
    }

    roomState.room.qrCodeVisible = false
    touch(roomState.room)
    broadcastHideQRCode(roomState)

    return response(204).empty()
  }),
]
