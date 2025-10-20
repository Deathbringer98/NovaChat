
import { useChatStore } from './store'
import { ThemeToggle } from './ThemeToggle'

export function Sidebar() {
  const { rooms, currentRoom, switchRoom, username, setUsername, connected } = useChatStore()
  return (
    <aside className="card p-4 sticky top-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-extrabold leading-tight">
            <span className="gradient-text">Nova</span>Chat
          </h1>
          <p className="text-xs text-slate-400">Modern real-time chat</p>
        </div>
        <ThemeToggle />
      </div>

      <div className="mb-4">
        <label className="text-xs text-slate-400">Display name</label>
        <input
          className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your name"
        />
        <p className="mt-1 text-[11px] text-slate-500">{connected ? 'Connected' : 'Disconnected'}</p>
      </div>

      <div>
        <p className="text-xs text-slate-400 mb-2">Rooms</p>
        <ul className="space-y-1">
          {rooms.map(r => (
            <li key={r.id}>
              <button
                onClick={() => switchRoom(r.id)}
                className={`w-full text-left px-3 py-2 rounded-xl border ${r.id===currentRoom.id ? 'bg-brand-500/10 border-brand-500 text-slate-100' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'}`}
              >
                {r.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
