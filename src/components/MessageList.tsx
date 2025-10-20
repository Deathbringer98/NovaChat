
import { useEffect, useRef } from 'react'
import { useChatStore } from './store'
import dayjs from './utils/dayjs'

export function MessageList(){
  const { messages, currentRoom, username } = useChatStore()
  const list = messages[currentRoom.id] || []
  const ref = useRef<HTMLDivElement>(null)

  useEffect(()=>{
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' })
  },[list.length])

  return (
    <div ref={ref} className="h-[60vh] md:h-[70vh] overflow-y-auto p-4 space-y-3 scrollbar-thin">
      {list.length === 0 && (
        <p className="text-sm text-slate-400">No messages yet. Start the conversation!</p>
      )}
      {list.map(m => {
        const mine = m.author === username
        return (
          <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-3 py-2 rounded-2xl border text-sm ${mine ? 'bg-brand-500/20 border-brand-500' : 'bg-slate-900 border-slate-800'}`}>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                <span className={`${mine ? 'text-brand-300' : 'text-slate-400'}`}>{m.author}</span>
                <span>•</span>
                <span>{dayjs(m.ts).format('HH:mm')}</span>
              </div>
              <div className="whitespace-pre-wrap">{m.text}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
