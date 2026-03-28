'use client'
import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('tradis_cookie_consent')
    if (!consent) setShow(true)
  }, [])

  function accept() {
    localStorage.setItem('tradis_cookie_consent', 'accepted')
    setShow(false)
  }

  function decline() {
    localStorage.setItem('tradis_cookie_consent', 'declined')
    setShow(false)
  }

  if (!show) return null

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: 20, right: 20, zIndex: 9999,
      background: '#0d0d18', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 14, padding: '16px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      flexWrap: 'wrap', fontFamily: 'Syne, sans-serif'
    }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
          🍪 We use cookies
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
          TRADIS uses cookies for analytics (Google Analytics) and authentication. 
          See our <a href="/privacy" style={{ color: '#00cc77' }}>Privacy Policy</a>.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button onClick={decline} style={{
          padding: '8px 16px', background: 'none',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
          color: 'rgba(255,255,255,0.4)', fontFamily: 'Syne, sans-serif',
          fontSize: 12, cursor: 'pointer', fontWeight: 600
        }}>Decline</button>
        <button onClick={accept} style={{
          padding: '8px 16px',
          background: 'linear-gradient(135deg,#00ff88,#00ccaa)',
          border: 'none', borderRadius: 8,
          color: '#000', fontFamily: 'Syne, sans-serif',
          fontSize: 12, cursor: 'pointer', fontWeight: 800
        }}>Accept</button>
      </div>
    </div>
  )
}
