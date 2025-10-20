
import { useEffect } from 'react'

export default function Ads(){
  useEffect(()=>{
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  },[])
  return (
    <ins className="adsbygoogle block my-3"
      style={{ display: 'block' }}
      data-ad-client={import.meta.env.VITE_ADSENSE_CLIENT || 'ca-pub-xxxx'}
      data-ad-slot={import.meta.env.VITE_ADSENSE_SLOT || '1234567890'}
      data-ad-format="auto"
      data-full-width-responsive="true"></ins>
  )
}
