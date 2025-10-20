
import { useState } from 'react'
import { useChatStore } from './store'

export function MessageInput(){
  const { send } = useChatStore()
  const [text, setText] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const t = text.trim()
    if(!t) return
    send(t)
    setText('')
  }

  return (
    <form onSubmit={submit} className="p-3 border-t border-slate-800 bg-slate-900/50 flex items-center gap-2">
      <input
        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        placeholder="Type a message…"
        value={text}
        onChange={(e)=>setText(e.target.value)}
      />
      <button
        type="submit"
        className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-sm font-semibold"
      >
        Send
      </button>
    </form>
  )
}
