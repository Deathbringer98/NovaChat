
import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'
import { get as apiGet } from '../utils/api'
import { supabase } from '../utils/supabase'

type Partner = { id: string, gender?: 'male'|'female'|'any' }
type Message = { id: string, author: 'me'|'them', text: string, ts: number }
type Gift = 'flower' | 'cat' | 'cake' | 'peach' | 'heart'
type User = { id: string; email: string; isPro: boolean } | null

type State = {
  socket?: Socket
  connected: boolean
  inQueue: boolean
  partner?: Partner
  isPro: boolean
  userId: string
  freeGiftAvailable: boolean
  genderPref: 'any'|'male'|'female'
  messages: Message[]
  setPro: (v:boolean)=>void
  setUserId: (id:string)=>void
  setFreeGiftAvailable: (v:boolean)=>void
  setGender: (g: 'any'|'male'|'female')=>void
  connect: ()=>void
  findPartner: ()=>void
  leave: ()=>void
  send: (text:string)=>void
  receiveGift: (gift: Gift, from: string)=>void
  checkFreeGiftStatus: ()=>Promise<void>
}

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4242')

export const useChat = create<State>((set, get)=> ({
  connected: false,
  inQueue: false,
  isPro: false,
  userId: '', // Will be set from authenticated user
  freeGiftAvailable: false,
  genderPref: 'any',
  messages: [],

  setPro: (v)=> set({ isPro: v }),
  setUserId: (id)=> set({ userId: id }),
  setFreeGiftAvailable: (v)=> set({ freeGiftAvailable: v }),
  setGender: (g)=> set({ genderPref: g }),

  checkFreeGiftStatus: async ()=> {
    try {
      const { userId } = get()
      if (!userId) return
      const data = await apiGet(`/user/${userId}/free-gift-status`)
      set({ isPro: data.isPro, freeGiftAvailable: data.freeGiftAvailable })
    } catch (e) {
      console.error('Failed to check free gift status:', e)
    }
  },

  connect: ()=>{
    if (get().socket) return
    const socket = io(SOCKET_URL, { transports: ['websocket'] })
    set({ socket })
    socket.on('connect', ()=> set({ connected: true }))
    socket.on('disconnect', ()=> set({ connected: false, partner: undefined, inQueue:false }))

    socket.on('match_found', (partner: Partner)=> set({ partner, inQueue:false, messages: [] }))
    socket.on('message', (m: { id:string, text: string })=>{
      set({ messages: [...get().messages, { id: m.id, text: m.text, author: 'them', ts: Date.now() }] })
    })
    socket.on('partner_left', ()=> set({ partner: undefined, inQueue:false }))
    socket.on('gift_received', (data: { gift: Gift, from: string })=>{
      set({ messages: [...get().messages, { id: crypto.randomUUID(), text: `🎁 Received ${data.gift} from ${data.from}`, author: 'them', ts: Date.now() }] })
    })
    socket.on('yt', (evt: any)=>{
      const ev = new CustomEvent('yt-sync', { detail: evt })
      window.dispatchEvent(ev)
    })
  },

  findPartner: ()=>{
    const s = get().socket
    if (!s) return
    const { userId } = get()
    set({ inQueue: true, partner: undefined, messages: [] })
    s.emit('find_partner', { gender: get().genderPref, userId })
  },

  leave: ()=>{
    const s = get().socket
    s?.emit('leave')
    set({ partner: undefined, inQueue:false, messages: [] })
  },

  send: (text)=>{
    const s = get().socket
    const id = crypto.randomUUID()
    set({ messages: [...get().messages, { id, text, author: 'me', ts: Date.now() }] })
    s?.emit('message', { id, text })
  },

  receiveGift: (gift, from)=>{
    set({ messages: [...get().messages, { id: crypto.randomUUID(), text: `🎁 Received ${gift} from ${from}`, author: 'them', ts: Date.now() }] })
  }
}))

// Authentication store
export const useAuth = create<{
  user: User
  loading: boolean
  setUser: (u: User) => void
  fetchUser: () => Promise<void>
}>((set) => ({
  user: null,
  loading: true,
  setUser: (u) => set({ user: u }),
  fetchUser: async () => {
    const { data } = await supabase.auth.getUser()
    if (data?.user) {
      set({
        user: {
          id: data.user.id,
          email: data.user.email!,
          isPro: false, // updated later via backend/webhook
        },
      })
    }
    set({ loading: false })
  },
}))

// Listen for auth changes
supabase.auth.onAuthStateChange((_event, session) => {
  const user = session?.user
    ? { id: session.user.id, email: session.user.email!, isPro: false }
    : null
  useAuth.setState({ user, loading: false })
  
  // Sync user ID with chat store
  if (user) {
    useChat.setState({ userId: user.id })
  } else {
    useChat.setState({ userId: '' })
  }
})
