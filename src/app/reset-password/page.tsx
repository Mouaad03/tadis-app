'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const inputStyle: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', padding: '12px 14px', fontSize: 14, fontFamily: 'Syne, sans-serif', outline: 'none', boxSizing: 'border-box' }

  async function handleReset() {
    if (!password || password.length < 6) { setMsg('Password must be at least 6 characters'); return }
    if (password !== confirm) { setMsg('Passwords do not match'); return }
    setLoading(true)
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setMsg('Error: ' + error.message)
    else { setDone(true); setTimeout(() => router.push('/dashboard'), 2000) }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#e8e8f0', fontFamily: 'Syne, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/logo-nav.jpg" alt="TRADIS" style={{ height: 48, width: 'auto', marginBottom: 24 }} />
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Reset Password</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Enter your new password below</p>
        </div>

        {done ? (
          <div style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 16, padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#00ff88', marginBottom: 8 }}>Password updated!</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Redirecting to dashboard...</div>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 28 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 6, letterSpacing: 1 }}>NEW PASSWORD</div>
              <input type="password" style={inputStyle} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 6, letterSpacing: 1 }}>CONFIRM PASSWORD</div>
              <input type="password" style={inputStyle} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" />
            </div>
            {msg && <div style={{ fontSize: 13, color: msg.includes('Error') ? '#ff4466' : '#00ff88', padding: '8px 12px', background: msg.includes('Error') ? 'rgba(255,68,102,0.08)' : 'rgba(0,255,136,0.08)', borderRadius: 8, marginBottom: 16 }}>{msg}</div>}
            <button onClick={handleReset} disabled={loading} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#00ff88,#00ccaa)', border: 'none', borderRadius: 10, color: '#000', fontFamily: 'Syne', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
              {loading ? '...' : 'Update Password'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
