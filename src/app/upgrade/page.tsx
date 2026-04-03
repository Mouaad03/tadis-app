'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function UpgradePage() {
  const router = useRouter()
  const [hover, setHover] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js'
    script.async = true
    script.onload = () => {
      ;(window as any).Paddle.Initialize({ 
        token: 'live_6c9e5c86ef98abe08ecd832ab2e'
      })
    }
    document.head.appendChild(script)
  }, [])

  async function handleUpgrade() {
    setLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      ;(window as any).Paddle.Checkout.open({
        items: [{ priceId: 'pri_01kna272vbdqzg61hrsz4amr4r', quantity: 1 }],
        customer: { email: user?.email },
        customData: { user_id: user?.id },
        settings: {
          successUrl: 'https://tradis.live/dashboard?upgraded=true',
        }
      })
    } catch(e: any) {
      alert('Error: ' + e.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: 'Syne, sans-serif' }}>
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');` }} />
      <div style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
        <div style={{ cursor: 'pointer', marginBottom: 40 }} onClick={() => router.push('/')}>
          <img src="/logo-nav.jpg" alt="TRADIS" style={{ height: 56, width: 'auto' }} />
        </div>
        <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(255,68,102,0.1)', border: '1px solid rgba(255,68,102,0.25)', borderRadius: 20, fontSize: 12, fontWeight: 700, color: '#ff4466', letterSpacing: 1, marginBottom: 24 }}>🔒 TRIAL EXPIRED</div>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: '#ffffff', letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 16 }}>Keep your<br /><span style={{ color: '#00ff88' }}>discipline alive.</span></h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, margin: '0 auto 40px', maxWidth: 360 }}>Your 15-day free trial has ended. Upgrade to Pro and keep enforcing your trading discipline every day.</p>
        <div style={{ background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 20, padding: '32px', marginBottom: 24, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 16, right: 16, background: 'linear-gradient(135deg,#00ff88,#00ccaa)', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 800, color: '#000' }}>MOST POPULAR</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginBottom: 8 }}>PRO PLAN</div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginBottom: 24 }}>
            <span style={{ fontSize: 56, fontWeight: 800, color: '#ffffff', fontFamily: 'JetBrains Mono', letterSpacing: '-3px' }}>$9</span>
            <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)' }}>/month</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28, textAlign: 'left' }}>
            {['Pre-Trade Gate — block emotional entries','Revenge Cooldown Timer','Weekly AI Coaching Reports','Full Trade Journal + Analytics','Real-time Discipline Score','Live prices — 50+ instruments','Multi-language (EN/FR/ES/AR)','CSV Export MT4/MT5'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                <span style={{ color: '#00ff88' }}>✓</span><span>{f}</span>
              </div>
            ))}
          </div>
          <button
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={handleUpgrade}
            disabled={loading}
            style={{ width: '100%', padding: '16px', background: loading ? 'rgba(0,255,136,0.4)' : hover ? 'linear-gradient(135deg,#00ffaa,#00ddbb)' : 'linear-gradient(135deg,#00ff88,#00ccaa)', border: 'none', borderRadius: 12, color: '#000', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 16, cursor: loading ? 'wait' : 'pointer', transition: 'all .2s' }}>
            {loading ? 'Loading...' : 'Upgrade to Pro — $9/month'}
          </button>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 12 }}>Cancel anytime · No hidden fees</div>
        </div>
        <button onClick={() => router.push('/auth')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: 12, cursor: 'pointer', fontFamily: 'Syne,sans-serif' }}>← Back to login</button>
      </div>
    </div>
  )
}
