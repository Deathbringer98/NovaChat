
import { Link } from 'react-router-dom'

export default function Landing(){
  return (
    <div className="min-h-screen flex items-center justify-center hero-grid">
      <div className="max-w-xl mx-auto text-center p-6">
        <h1 className="text-5xl font-black mb-3"><span className="gradient-text">Nova</span>Chat</h1>
        <p className="text-slate-300 mb-6">Random chat. Pro unlocks gender filter, Watch YouTube together, gifts, and removes ads.</p>
        <div className="flex flex-col items-center justify-center gap-3">
          <Link to="/chat" className="px-5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 font-semibold">Start Random Chat</Link>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/login" className="text-slate-400 hover:text-white">Login</Link>
            <span className="text-slate-600">|</span>
            <Link to="/signup" className="text-slate-400 hover:text-white">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
