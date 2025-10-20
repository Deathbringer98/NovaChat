
import { useEffect, useRef, useState } from 'react'
import { useChat } from './store'

declare global { interface Window { YT:any } }

function parseVideoId(url: string){
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1)
    if (u.searchParams.get('v')) return u.searchParams.get('v')
  } catch {}
  return url // allow raw id
}

export default function YouTubeTogether({ enabled }:{ enabled:boolean }){
  const { socket } = useChat.getState()
  const [url, setUrl] = useState('')
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(()=>{
    const onSync = (e:any)=>{
      const data = e.detail
      if (!playerRef.current) return
      if (data.type === 'play') playerRef.current.playVideo()
      if (data.type === 'pause') playerRef.current.pauseVideo()
      if (data.type === 'seek') playerRef.current.seekTo(data.time, true)
      if (data.type === 'load') playerRef.current.loadVideoById(data.videoId)
    }
    window.addEventListener('yt-sync', onSync as any)
    return ()=> window.removeEventListener('yt-sync', onSync as any)
  },[])

  useEffect(()=>{
    if (!enabled) return
    const tag = document.createElement('script')
    tag.src = "https://www.youtube.com/iframe_api"
    document.body.appendChild(tag)
    // @ts-ignore
    window.onYouTubeIframeAPIReady = () => {
      // @ts-ignore
      playerRef.current = new window.YT.Player(containerRef.current!, {
        height: '300', width: '100%',
        videoId: '',
        events: {
          onStateChange: (event:any)=>{
            if(!socket) return
            if(event.data === 1) socket.emit('yt', { type:'play' })
            if(event.data === 2) socket.emit('yt', { type:'pause' })
          }
        }
      })
    }
  }, [enabled])

  const load = ()=>{
    if (!socket) return
    const id = parseVideoId(url.trim())
    socket.emit('yt', { type:'load', videoId: id })
  }
  const seek = ()=>{
    if (!socket || !playerRef.current) return
    const t = Math.floor(playerRef.current.getCurrentTime())
    socket.emit('yt', { type:'seek', time: t })
  }

  if (!enabled) return null
  return (
    <div className="card p-3">
      <div className="flex gap-2 mb-2">
        <input className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm"
          placeholder="Paste YouTube URL or ID"
          value={url} onChange={e=>setUrl(e.target.value)} />
        <button onClick={load} className="px-3 rounded-xl bg-brand-500">Load</button>
        <button onClick={seek} className="px-3 rounded-xl bg-slate-800">Sync</button>
      </div>
      <div ref={containerRef} />
    </div>
  )
}
