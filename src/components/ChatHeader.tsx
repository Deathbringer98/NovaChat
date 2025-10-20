
import { useChatStore } from './store'

export function ChatHeader(){
  const { currentRoom } = useChatStore()
  return (
    <header className="px-4 py-3 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold">{currentRoom.name}</h2>
        <p className="text-xs text-slate-400">Be kind. No spam.</p>
      </div>
      <div className="text-xs text-slate-400">/ {currentRoom.id}</div>
    </header>
  )
}
