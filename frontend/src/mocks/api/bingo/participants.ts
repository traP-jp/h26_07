import { http } from '../../http'
import { addParticipant, conflict, currentUser, getRoom, notFound } from './core'

export const participantHandlers = [
  http.post('/api/rooms/{roomId}/participants', ({ params, request, response }) => {
    const roomState = getRoom(params.roomId)
    if (roomState === undefined) {
      return response(404).json(notFound())
    }
    if (roomState.room.state !== 'waiting') {
      return response(409).json(conflict('ルームが waiting ではないため参加できません。'))
    }

    addParticipant(roomState, currentUser(request))
    return response(204).empty()
  }),
]
