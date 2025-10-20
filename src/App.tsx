
import { useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { ChatHeader } from './components/ChatHeader'
import { MessageList } from './components/MessageList'
import { MessageInput } from './components/MessageInput'
import { useChatStore } from './components/store'

export default function App() {
  const { connect } = useChatStore()

  useEffect(() => {
    // auto-connect to default room
    connect()
  }, [connect])

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-3 lg:col-span-3">
          <Sidebar />
        </div>
        <div className="col-span-12 md:col-span-9 lg:col-span-9 card p-0 overflow-hidden">
          <ChatHeader />
          <MessageList />
          <MessageInput />
        </div>
      </div>
    </div>
  )
}
