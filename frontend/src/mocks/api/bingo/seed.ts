import { addParticipant, createMessage, createMockRoom, createUser, state } from './core'

export function seedRooms(): void {
  const admin = createUser('mumumu')
  const roomState = createMockRoom(
    {
      name: 'デモビンゴ',
      description: 'モック API で動かす待機中のビンゴルームです。',
      adminUserIds: ['mumumu'],
    },
    admin,
  )

  if (roomState === undefined) {
    return
  }

  addParticipant(roomState, admin)
  addParticipant(roomState, createUser('saba'))
  roomState.messages.push(createMessage(admin, 'モックルームへようこそ'))
  state.rooms.set(roomState.room.roomId, roomState)
}
