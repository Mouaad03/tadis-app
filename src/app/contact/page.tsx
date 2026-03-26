'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ContactPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const input: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', padding: '12px 14px', fontSize: 14, fontFamily: 'Syne, sans-serif', outline: 'none', boxSizing: 'border-box' }

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#e8e8f0', fontFamily: 'Syne, sans-serif' }}>
      <div style={{ background: '#000', borderBottom: '1px solid #1a1a28', padding: '16px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={() => router.push('/')} style={{ fontSize: 18, fontWeight: 800, letterSpacing: 2, cursor: 'pointer', color: '#fff' }}>TRADIS</div>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.4)', padding: '7px 16px', cursor: 'pointer', fontSize: 13, fontFamily: 'Syne' }}>← Back</button>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'inline-block', background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 20, padding: '4px 14px', fontSize: 11, color: '#00ff88', fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>CONTACT</div>
          <h1 style={{ fontSize: 42, fontWeight: 800, letterSpacing: -1, marginBottom: 12 }}>Get in touch</h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>Have a question or feedback? We'd love to hear from you.</p>
        </div>

        {sent ? (
          <div style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 16, padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#00ff88', marginBottom: 8 }}>Message sent!</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>We'll get back to you within 24 hours.</div>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 32 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 6, letterSpacing: 1 }}>YOUR NAME</div>
              <input style={input} value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 6, letterSpacing: 1 }}>EMAIL</div>
              <input style={input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 6, letterSpacing: 1 }}>MESSAGE</div>
              <textarea style={{ ...input, minHeight: 140, resize: 'vertical' }} value={message} onChange={e => setMessage(e.target.value)} placeholder="Your message..." />
            </div>
            <button onClick={() => { if (name && email && message) setSent(true) }}
              style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#00ff88,#00ccaa)', border: 'none', borderRadius: 10, color: '#000', fontFamily: 'Syne', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
              Send Message
            </button>
            <div style={{ marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
              Or email us directly: <span style={{ color: '#00ff88' }}>support@tradis.app</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
