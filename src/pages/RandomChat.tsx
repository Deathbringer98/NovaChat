
import { useEffect, useState } from 'react'
import { useChat, useAuth } from '../components/store'
import { Navigate } from 'react-router-dom'
import Ads from '../components/Ads'
import GiftModal from '../components/GiftModal'
import YouTubeTogether from '../components/YouTubeTogether'
import { post } from '../utils/api'
import { supabase } from '../utils/supabase'

export default function RandomChat(){
  const { connect, findPartner, leave, send, messages, partner, inQueue, isPro, genderPref, setGender, setPro } = useChat()
  const { user, loading } = useAuth()
  const [giftOpen, setGiftOpen] = useState(false)
  const [text, setText] = useState('')

  useEffect(()=>{ connect() }, [connect])

  // Authentication check
  if (loading) return <div className="p-6 text-center">Loading...</div>
  if (!user) return <Navigate to="/login" replace />

  const upgrade = async ()=>{
    const { url } = await post('/create-checkout-session', { userId: user.id })
    window.location.href = url
  }

  const logout = async ()=>{
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-12 gap-4">
        <aside className="col-span-12 md:col-span-4">
          <div className="card p-4 sticky top-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-xl"><span className="gradient-text">Nova</span>Chat</h2>
              <button 
                onClick={logout}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded"
                title="Logout"
              >
                👋
              </button>
            </div>
            <div className="text-xs text-slate-500 mb-3">
              {user.email}
            </div>
            <div className="mb-3">
              <label className="text-xs text-slate-400">Gender Preference</label>
              <select className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-sm"
                value={genderPref} onChange={(e)=>setGender(e.target.value as any)} disabled={!isPro} 
                title="Gender Preference">
                <option value="any">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {!isPro && <p className="text-[11px] text-slate-500 mt-1">Unlock gender filter with Pro.</p>}
            </div>

            {!isPro && <>
              <button onClick={upgrade} className="w-full mb-3 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 font-semibold">
                Upgrade to Pro – $3.99/month
              </button>
              <Ads />
            </>}

            {partner ? (
              <button onClick={leave} className="w-full px-4 py-2 rounded-xl bg-slate-800">Leave Chat</button>
            ) : (
              <button onClick={findPartner} className="w-full px-4 py-2 rounded-xl bg-slate-800">{inQueue ? 'Finding partner…' : 'Start Random Chat'}</button>
            )}
          </div>
        </aside>

        <main className="col-span-12 md:col-span-8">
          <div className="card p-0 overflow-hidden">
            <header className="px-4 py-3 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{partner ? 'Connected' : (inQueue ? 'Matching…' : 'Not connected')}</h3>
                <p className="text-xs text-slate-400">{partner ? `Partner ID: ${partner.id}` : 'Click Start to find someone.'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={()=>setGiftOpen(true)} className="px-3 py-1 rounded-xl bg-slate-800">🎁 Gift</button>
                <button 
                  onClick={()=>setPro(!isPro)} 
                  className={`px-3 py-1 rounded-xl text-xs ${isPro ? 'bg-green-800 text-green-200' : 'bg-slate-800'}`}
                  title="Toggle Pro Status (for testing)"
                >
                  {isPro ? 'Pro' : 'Free'}
                </button>
              </div>
            </header>

            <div className="p-4 h-[60vh] overflow-y-auto space-y-2">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.author === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl border text-sm ${m.author === 'me' ? 'bg-brand-500/20 border-brand-500' : 'bg-slate-900 border-slate-800'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {!messages.length && <p className="text-slate-500 text-sm">No messages yet.</p>}
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-900/50 flex gap-2">
              <input className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm"
                value={text} onChange={e=>setText(e.target.value)} placeholder="Type a message…" />
              <button onClick={()=>{ if(text.trim()){ send(text.trim()); setText('') } }} className="px-4 rounded-xl bg-brand-500">Send</button>
            </div>
          </div>

          <div className="mt-4">
            <YouTubeTogether enabled={isPro && !!partner} />
          </div>
        </main>
      </div>
      <GiftModal open={giftOpen} onClose={()=>setGiftOpen(false)} />
    </div>
  )
}
