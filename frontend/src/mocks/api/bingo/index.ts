import { chatHandlers } from './chats'
import { controlHandlers } from './controls'
import { meHandlers } from './me'
import { participantHandlers } from './participants'
import { roomHandlers } from './rooms'
import { seedRooms } from './seed'
import { settingHandlers } from './settings'
import { roomWebSocketHandler } from './websocket'

seedRooms()

export const bingoHandlers = [
  roomWebSocketHandler,
  ...meHandlers,
  ...roomHandlers,
  ...participantHandlers,
  ...chatHandlers,
  ...controlHandlers,
  ...settingHandlers,
]
