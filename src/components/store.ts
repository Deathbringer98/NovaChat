
import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'

type Message = { id: string; author: string; text: string; ts: number }
type Room = { id: string; name: string; unread?: number }

type State = {
  socket?: Socket
  connected: boolean
  currentRoom: Room
  rooms: Room[]
  messages: Record<string, Message[]>
  username: string
  connect: () => void
  send: (text: string) => void
  switchRoom: (id: string) => void
  setUsername: (name: string) => void
}

// Replace with your backend URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

export const useChatStore = create<State>((set, get) => ({
  connected: false,
  currentRoom: { id: 'general', name: 'General' },
  rooms: [
    { id: 'general', name: 'General' },
    { id: 'lounge', name: 'Lounge' },
    { id: 'dev', name: 'Developers' }
  ],
  messages: { general: [], lounge: [], dev: [] },
  username: 'Guest-' + Math.floor(Math.random()*9999),

  connect: () => {
    if (get().socket) return
    const socket = io(SOCKET_URL, { transports: ['websocket'] })
    set({ socket })
    socket.on('connect', () => set({ connected: true }))
    socket.on('disconnect', () => set({ connected: false }))

    socket.on('message', (msg: Message & { room: string }) => {
      const { room, ...rest } = msg
      const messages = get().messages
      const list = messages[room] || []
      set({ messages: { ...messages, [room]: [...list, rest] } })
    })
  },

  send: (text: string) => {
    const state = get()
    const { currentRoom, username, socket } = state
    const msg = { id: crypto.randomUUID(), author: username, text, ts: Date.now(), room: currentRoom.id }
    // optimistic update
    const list = state.messages[currentRoom.id] || []
    set({ messages: { ...state.messages, [currentRoom.id]: [...list, msg] } })
    socket?.emit('message', msg)
  },

  switchRoom: (id: string) => {
    const room = get().rooms.find(r => r.id === id) || { id, name: id }
    set({ currentRoom: room })
  },

  setUsername: (name: string) => set({ username: name })
}))
