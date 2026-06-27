import type {
  BingoSummary,
  BingoUpdate,
  Card,
  CardCell,
  CardCellState,
  CardChanges,
  Error as ApiError,
  GameSettings,
  GameSettingsInput,
  Line,
  Message,
  PickedBall,
  ReachUpdate,
  Room,
  RoomId,
  User,
  UserId,
  WebSocketMode,
} from '@/api/schema'

export type MockRoom = {
  room: Room
  messages: Message[]
  pickedBalls: PickedBall[]
  cards: Map<UserId, Card>
  reachedUserIds: Set<UserId>
  bingoRecords: Array<{
    userId: UserId
    lineKey: string
    order: number
  }>
}

export type MockSocketConnection = {
  roomId: RoomId
  mode: WebSocketMode
  userId: UserId
  send(data: string): void
  close(code?: number, reason?: string): void
}

type CardSnapshot = {
  openCellIndices: Set<number>
  reachLineKeys: Set<string>
  bingoLineKeys: Set<string>
}

export type FinishPickResult = {
  pickedBall: PickedBall
  cardChangesByUserId: Map<UserId, CardChanges>
  newBingos: BingoUpdate[]
  newReaches: ReachUpdate[]
  allPicked: boolean
}

type JsonRequest = {
  json(): Promise<unknown>
}

const LINES: Line[] = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
]

const COLUMN_RANGES: Array<[number, number]> = [
  [1, 15],
  [16, 30],
  [31, 45],
  [46, 60],
  [61, 75],
]

export const state = {
  rooms: new Map<RoomId, MockRoom>(),
}

export const socketConnections = new Set<MockSocketConnection>()

let idCounter = 1

function createId(): string {
  const suffix = String(idCounter).padStart(12, '0')
  idCounter += 1
  return `00000000-0000-4000-8000-${suffix}`
}

export function now(): string {
  return new Date().toISOString()
}

export function createUser(userId: UserId): User {
  return {
    userId,
  }
}

export function currentUser(request: Request): User {
  const forwardedUser = request.headers.get('X-Forwarded-User')?.trim()
  return createUser(forwardedUser || 'mumumu')
}

export async function readJson<T>(request: JsonRequest): Promise<T | undefined> {
  try {
    return (await request.json()) as T
  } catch {
    return undefined
  }
}

function apiError(message: string): ApiError {
  return { message }
}

export function badRequest(description: string): ApiError {
  return apiError(description)
}

export function notFound(): ApiError {
  return apiError('指定したルームが存在しません。')
}

export function forbidden(description: string): ApiError {
  return apiError(description)
}

export function conflict(description: string): ApiError {
  return apiError(description)
}

function nextRoomCode(): string {
  return String(100000 + ((idCounter * 137) % 900000)).padStart(6, '0')
}

function uniqueUserIds(userIds: UserId[]): UserId[] {
  return [...new Set(userIds.map((userId) => userId.trim()).filter(Boolean))]
}

export function settingsFromInput(
  input: GameSettingsInput,
  fallbackAdminIds: UserId[],
): GameSettings | undefined {
  if (input.name.trim() === '') {
    return undefined
  }

  const adminIds =
    input.adminUserIds === undefined
      ? uniqueUserIds(fallbackAdminIds)
      : uniqueUserIds(input.adminUserIds)

  if (adminIds.length === 0) {
    return undefined
  }

  return {
    name: input.name,
    description: input.description,
    admins: adminIds.map(createUser),
  }
}

export function isAdmin(room: Room, userId: UserId): boolean {
  return room.settings.admins.some((admin) => admin.userId === userId)
}

export function isParticipant(room: Room, userId: UserId): boolean {
  return room.participants.some((participant) => participant.user.userId === userId)
}

export function addParticipant(roomState: MockRoom, user: User): void {
  if (isParticipant(roomState.room, user.userId)) {
    return
  }

  roomState.room.participants.push({
    user,
    joinedAt: now(),
  })
  touch(roomState.room)
}

export function touch(room: Room): void {
  room.updatedAt = now()
}

export function getRoom(roomId: RoomId): MockRoom | undefined {
  return state.rooms.get(roomId)
}

export function pathParam(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : undefined
  }

  return typeof value === 'string' ? value : undefined
}

function pickedNumberSet(roomState: MockRoom): Set<number> {
  return new Set(roomState.pickedBalls)
}

function openCellIndices(card: Card, pickedNumbers: Set<number>): Set<number> {
  return new Set(
    card.cells
      .filter((cell) => cell.number === null || pickedNumbers.has(cell.number))
      .map((cell) => cell.index),
  )
}

function snapshotCard(card: Card, pickedNumbers: Set<number>): CardSnapshot {
  return {
    openCellIndices: openCellIndices(card, pickedNumbers),
    reachLineKeys: new Set(card.reachLines.map(lineKey)),
    bingoLineKeys: new Set(card.bingoLines.map(lineKey)),
  }
}

export function emptyCardChanges(): CardChanges {
  return {
    openedCellIndices: [],
    newReachLines: [],
    newBingoLines: [],
  }
}

function hashUserId(userId: UserId): number {
  return [...userId].reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

function createCard(ownerUserId: UserId): Card {
  const offset = hashUserId(ownerUserId) % 15
  const cells: CardCell[] = []

  for (let index = 0; index < 25; index += 1) {
    const row = Math.floor(index / 5)
    const column = index % 5

    if (index === 12) {
      cells.push({
        index,
        number: null,
        displayText: 'FREE',
        cellState: 'open',
      })
      continue
    }

    const [start, end] = COLUMN_RANGES[column] ?? [1, 15]
    const rangeSize = end - start + 1
    const number = start + ((offset + column * 5 + row * 3) % rangeSize)

    cells.push({
      index,
      number,
      displayText: String(number),
      cellState: 'closed',
    })
  }

  return {
    cardId: createId(),
    ownerUserId,
    cells,
    bingoLines: [],
    reachLines: [],
  }
}

function lineCells(card: Card, line: Line): CardCell[] {
  const cellsByIndex = new Map(card.cells.map((cell) => [cell.index, cell]))
  return line
    .map((index) => cellsByIndex.get(index))
    .filter((cell): cell is CardCell => cell !== undefined)
}

function lineKey(line: Line): string {
  return line.join(',')
}

function updateBingoSummaries(roomState: MockRoom): void {
  const summariesByUserId = new Map<UserId, BingoSummary>()

  for (const record of roomState.bingoRecords) {
    const participant = roomState.room.participants.find(
      (entry) => entry.user.userId === record.userId,
    )
    if (participant === undefined) {
      continue
    }

    const summary =
      summariesByUserId.get(record.userId) ??
      ({
        user: participant.user,
        bingoOrders: [],
      } satisfies BingoSummary)

    summary.bingoOrders.push(record.order)
    summariesByUserId.set(record.userId, summary)
  }

  roomState.room.bingoSummaries = [...summariesByUserId.values()]
}

function recomputeCards(roomState: MockRoom): void {
  const pickedNumbers = new Set(roomState.pickedBalls)
  const knownBingoKeys = new Set(
    roomState.bingoRecords.map((record) => `${record.userId}:${record.lineKey}`),
  )

  for (const [userId, card] of roomState.cards) {
    const bingoLines: Line[] = []
    const reachLines: Line[] = []

    for (const line of LINES) {
      const cells = lineCells(card, line)
      if (cells.length !== 5) {
        continue
      }

      const openCount = cells.filter(
        (cell) => cell.number === null || pickedNumbers.has(cell.number),
      ).length
      if (openCount === 5) {
        bingoLines.push([...line])

        const key = `${userId}:${lineKey(line)}`
        if (!knownBingoKeys.has(key)) {
          knownBingoKeys.add(key)
          roomState.bingoRecords.push({
            userId,
            lineKey: lineKey(line),
            order: roomState.bingoRecords.length + 1,
          })
        }
      } else if (openCount === 4) {
        reachLines.push([...line])
      }
    }

    const bingoCellIndices = new Set(bingoLines.flat())
    const reachCellIndices = new Set(reachLines.flat())

    card.cells = card.cells.map((cell) => {
      const opened = cell.number === null || pickedNumbers.has(cell.number)
      let cellState: CardCellState = opened ? 'open' : 'closed'

      if (bingoCellIndices.has(cell.index)) {
        cellState = 'bingo'
      } else if (reachCellIndices.has(cell.index)) {
        cellState = 'reach'
      }

      return {
        ...cell,
        cellState,
      }
    })
    card.bingoLines = bingoLines
    card.reachLines = reachLines
  }

  updateBingoSummaries(roomState)
}

export function createMockRoom(
  settingsInput: GameSettingsInput,
  creator: User,
): MockRoom | undefined {
  const settings = settingsFromInput(
    settingsInput,
    uniqueUserIds([creator.userId, ...(settingsInput.adminUserIds ?? [])]),
  )
  if (settings === undefined) {
    return undefined
  }

  const createdAt = now()
  const room: Room = {
    roomId: createId(),
    roomCode: nextRoomCode(),
    state: 'waiting',
    pickState: 'idle',
    qrCodeVisible: true,
    participants: [],
    bingoSummaries: [],
    settings,
    createdAt,
    updatedAt: createdAt,
  }

  return {
    room,
    messages: [],
    pickedBalls: [],
    cards: new Map(),
    reachedUserIds: new Set(),
    bingoRecords: [],
  }
}

export function createMessage(author: User, content: string): Message {
  return {
    messageId: createId(),
    content,
    author,
    createdAt: now(),
  }
}

export function validateSettingsInput(
  input: GameSettingsInput | undefined,
): input is GameSettingsInput {
  if (
    input === undefined ||
    typeof input.name !== 'string' ||
    input.name.trim() === '' ||
    typeof input.description !== 'string' ||
    input.description.trim() === ''
  ) {
    return false
  }

  if (input.adminUserIds === undefined) {
    return true
  }

  return Array.isArray(input.adminUserIds) && uniqueUserIds(input.adminUserIds).length > 0
}

export function startRoom(roomState: MockRoom): ApiError | undefined {
  if (roomState.room.state !== 'waiting') {
    return conflict('ルームが waiting ではありません。')
  }
  if (roomState.room.participants.length === 0) {
    return conflict('参加者がいないため開始できません。')
  }

  roomState.cards.clear()
  roomState.bingoRecords = []
  roomState.pickedBalls = []
  roomState.reachedUserIds.clear()

  for (const participant of roomState.room.participants) {
    roomState.cards.set(participant.user.userId, createCard(participant.user.userId))
  }

  roomState.room.state = 'playing'
  roomState.room.pickState = 'idle'
  roomState.room.bingoSummaries = []
  touch(roomState.room)

  return undefined
}

export function finishPick(roomState: MockRoom): ApiError | FinishPickResult {
  if (roomState.room.state !== 'playing' || roomState.room.pickState !== 'picking') {
    return conflict('現在抽選中ではない、またはゲーム状態が不正です。')
  }

  const previousPickedNumbers = pickedNumberSet(roomState)
  const beforeSnapshots = new Map<UserId, CardSnapshot>()
  for (const [userId, card] of roomState.cards) {
    beforeSnapshots.set(userId, snapshotCard(card, previousPickedNumbers))
  }

  const previousBingoRecordCount = roomState.bingoRecords.length
  const nextNumber = Array.from({ length: 75 }, (_, index) => index + 1).find(
    (number) => !previousPickedNumbers.has(number),
  )

  if (nextNumber === undefined) {
    roomState.room.pickState = 'exhausted'
    touch(roomState.room)
    return conflict('抽選可能な球がありません。')
  }

  const pickedBall: PickedBall = nextNumber

  roomState.pickedBalls.push(pickedBall)
  recomputeCards(roomState)

  roomState.room.pickState = roomState.pickedBalls.length >= 75 ? 'exhausted' : 'idle'
  touch(roomState.room)

  const nextPickedNumbers = pickedNumberSet(roomState)
  const cardChangesByUserId = new Map<UserId, CardChanges>()
  const newReaches: ReachUpdate[] = []

  for (const [userId, card] of roomState.cards) {
    const before = beforeSnapshots.get(userId)
    const afterOpenCellIndices = openCellIndices(card, nextPickedNumbers)
    const openedCellIndices = [...afterOpenCellIndices].filter(
      (index) => !before?.openCellIndices.has(index),
    )
    const newReachLines = card.reachLines.filter(
      (line) => !before?.reachLineKeys.has(lineKey(line)),
    )
    const newBingoLines = card.bingoLines.filter(
      (line) => !before?.bingoLineKeys.has(lineKey(line)),
    )

    cardChangesByUserId.set(userId, {
      openedCellIndices,
      newReachLines,
      newBingoLines,
    })

    if (card.reachLines.length > 0 && !roomState.reachedUserIds.has(userId)) {
      roomState.reachedUserIds.add(userId)
      const participant = roomState.room.participants.find((entry) => entry.user.userId === userId)
      if (participant !== undefined) {
        newReaches.push({ user: participant.user })
      }
    }
  }

  const newRecords = roomState.bingoRecords.slice(previousBingoRecordCount)
  const newBingosByUserId = new Map<UserId, number[]>()
  for (const record of newRecords) {
    const orders = newBingosByUserId.get(record.userId) ?? []
    orders.push(record.order)
    newBingosByUserId.set(record.userId, orders)
  }

  const newBingos: BingoUpdate[] = [...newBingosByUserId.entries()].flatMap(
    ([userId, newBingoOrders]) => {
      const summary = roomState.room.bingoSummaries.find((entry) => entry.user.userId === userId)
      if (summary === undefined) {
        return []
      }

      return [
        {
          user: summary.user,
          newBingoOrders,
          bingoOrders: summary.bingoOrders,
        },
      ]
    },
  )

  return {
    pickedBall,
    cardChangesByUserId,
    newBingos,
    newReaches,
    allPicked: roomState.room.pickState === 'exhausted',
  }
}

export function assertVisible(roomState: MockRoom, user: User): ApiError | undefined {
  if (isParticipant(roomState.room, user.userId) || isAdmin(roomState.room, user.userId)) {
    return undefined
  }

  return forbidden('このルームを閲覧する権限がありません。')
}

export function assertAdmin(roomState: MockRoom, user: User): ApiError | undefined {
  if (isAdmin(roomState.room, user.userId)) {
    return undefined
  }

  return forbidden('admin ではありません。')
}

export function isApiError(value: ApiError | FinishPickResult): value is ApiError {
  return 'message' in value
}
