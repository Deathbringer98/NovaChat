
import { useEffect, useState } from 'react'

export function ThemeToggle(){
  const [dark, setDark] = useState(true)
  useEffect(()=>{
    document.documentElement.classList.toggle('dark', dark)
  },[dark])
  return (
    <button
      onClick={()=>setDark(d => !d)}
      className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800"
      title="Toggle theme"
    >
      {dark ? 'Dark' : 'Light'}
    </button>
  )
}
