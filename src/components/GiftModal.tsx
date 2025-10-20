
import { useState, useEffect } from 'react'
import { post } from '../utils/api'
import { useChat } from './store'

type Gift = 'flower'|'cat'|'cake'|'peach'|'heart'

const catalog: { key: Gift, label: string, price: number, emoji: string }[] = [
  { key: 'flower', label: 'Flower', price: 0.50, emoji: '🌸' },
  { key: 'cat', label: 'Cat', price: 1.00, emoji: '🐱' },
  { key: 'cake', label: 'Cake', price: 2.00, emoji: '🎂' },
  { key: 'peach', label: 'Peach', price: 3.00, emoji: '🍑' },
  { key: 'heart', label: 'Heart', price: 5.00, emoji: '💖' },
]

export default function GiftModal({ open, onClose }:{ open:boolean, onClose:()=>void }){
  const [loading, setLoading] = useState<string>('')
  const { isPro, freeGiftAvailable, userId, checkFreeGiftStatus, setFreeGiftAvailable } = useChat()
  
  useEffect(() => {
    if (open) {
      checkFreeGiftStatus()
    }
  }, [open])
  
  if(!open) return null
  
  const buy = async (gift: Gift)=>{
    try{
      setLoading(gift)
      const data = await post('/gift/buy', { giftType: gift, userId })
      
      if (data.isFreeGift) {
        // Free gift was sent
        setFreeGiftAvailable(false)
        onClose()
        alert('Free gift sent! 🎁')
      } else {
        // Redirect to Stripe checkout
        window.location.href = data.url
      }
    }catch(e:any){
      alert(e.message || 'Failed to start checkout')
    }finally{
      setLoading('')
    }
  }
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="card w-full max-w-md p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Send a Gift</h3>
          <button className="text-slate-400 hover:text-slate-200" onClick={onClose}>✕</button>
        </div>
        
        {isPro && freeGiftAvailable && (
          <div className="mt-3 p-3 bg-green-900/30 border border-green-700 rounded-lg">
            <p className="text-green-400 text-sm flex items-center gap-2">
              🎉 You have 1 free gift available this week!
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-2 mt-4">
          {catalog.map(g=>(
            <button key={g.key}
              onClick={()=>buy(g.key)}
              disabled={loading === g.key}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{g.emoji}</span>
                <span className="font-medium">{g.label}</span>
              </div>
              <div className="text-right">
                {isPro && freeGiftAvailable ? (
                  <div className="flex flex-col">
                    <span className="text-green-400 text-sm">FREE</span>
                    <span className="text-slate-500 text-xs line-through">${g.price.toFixed(2)}</span>
                  </div>
                ) : (
                  <span className="text-slate-300">${g.price.toFixed(2)}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
