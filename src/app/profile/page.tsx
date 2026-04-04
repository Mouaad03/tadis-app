'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Tab = 'info' | 'security' | 'payment' | 'subscription' | 'support'

export default function ProfilePage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('info')

  const handlePaddlePortal = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    try {
      const res = await fetch('/api/paddle/portal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.id }) })
      const data = await res.json()
      if (data.url) {
        window.open(data.url, '_blank')
      } else {
        alert('Could not open billing portal. Please contact support.')
      }
    } catch {
      alert('Something went wrong. Please try again.')
    }
  }
  const [profile, setProfile] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [msg, setMsg] = useState('')

  // Form fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState('')
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showAddCard, setShowAddCard] = useState(false)
  const [supportSubject, setSupportSubject] = useState('')
  const [supportMessage, setSupportMessage] = useState('')
  const [supportSent, setSupportSent] = useState(false)
  const [supportLoading, setSupportLoading] = useState(false)
  const [supportScreenshot, setSupportScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardName, setCardName] = useState('')

  useEffect(() => {
    async function load() {
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (p) {
        setProfile(p)
        setFirstName(p.first_name || '')
        setLastName(p.last_name || '')
        setPhone(p.phone || '')
        setAddress(p.address || '')
        setEmail(user.email || '')
      }
    }
    load()
  }, [])

  async function saveInfo() {
    setSaving(true)
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ first_name: firstName, last_name: lastName, phone, address, full_name: `${firstName} ${lastName}`.trim() }).eq('id', user.id)
    setSaving(false); setSaved(true); setMsg('Information saved!')
    setTimeout(() => setSaved(false), 3000)
  }

  async function savePassword() {
    if (newPwd !== confirmPwd) { setMsg('Passwords do not match!'); return }
    if (newPwd.length < 6) { setMsg('Password must be at least 6 characters!'); return }
    setSaving(true)
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPwd })
    setSaving(false)
    if (error) { setMsg('Error: ' + error.message) }
    else { setMsg('Password updated successfully!'); setCurrentPwd(''); setNewPwd(''); setConfirmPwd('') }
    setTimeout(() => setMsg(''), 4000)
  }

  async function saveEmail() {
    setSaving(true)
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ email })
    setSaving(false)
    if (error) { setMsg('Error: ' + error.message) }
    else { setMsg('Confirmation email sent — check your inbox!') }
    setTimeout(() => setMsg(''), 4000)
  }

  const card: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20, marginBottom: 14 }
  const input: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', padding: '10px 14px', fontSize: 13, fontFamily: 'Syne', outline: 'none', boxSizing: 'border-box' }
  const label: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, marginBottom: 6, display: 'block' }
  const btn: React.CSSProperties = { padding: '10px 24px', background: 'linear-gradient(135deg,#00cc77,#00aa66)', border: 'none', borderRadius: 8, color: '#000', fontFamily: 'Syne', fontWeight: 800, fontSize: 13, cursor: 'pointer' }

  const TABS = [
    { id: 'info', label: '👤 Information' },
    { id: 'security', label: '🔐 Email & Password' },
    { id: 'payment', label: '💳 Payment' },
    { id: 'subscription', label: '⭐ Subscription' },
    { id: 'support', label: '🎧 Support' },
  ]

  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'TR'

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e8e8f0', fontFamily: 'Syne, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#000', borderBottom: '1px solid #1a1a1a', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.4)', padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontFamily: 'Syne' }}>← Back</button>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Profile</div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>

        {/* Avatar + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#00cc77,#00aa66)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#000' }}>{initials}</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{firstName || lastName ? `${firstName} ${lastName}` : 'Trader'}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{email}</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4, marginBottom: 24, flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id as Tab); setMsg('') }}
              style={{ flex: 1, padding: '8px 12px', background: tab === t.id ? '#fff' : 'none', border: 'none', borderRadius: 8, color: tab === t.id ? '#000' : 'rgba(255,255,255,0.4)', fontFamily: 'Syne', fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Message */}
        {msg && <div style={{ padding: '10px 14px', background: msg.includes('Error') ? 'rgba(255,68,102,0.1)' : 'rgba(0,204,119,0.1)', border: `1px solid ${msg.includes('Error') ? 'rgba(255,68,102,0.3)' : 'rgba(0,204,119,0.3)'}`, borderRadius: 8, fontSize: 13, color: msg.includes('Error') ? '#ff4466' : '#00cc77', marginBottom: 16 }}>{msg}</div>}

        {/* INFO TAB */}
        {tab === 'info' && (
          <div style={card}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, marginBottom: 20 }}>PERSONAL INFORMATION</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={label}>FIRST NAME</label>
                <input style={input} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Adam" />
              </div>
              <div>
                <label style={label}>LAST NAME</label>
                <input style={input} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Trader" />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={label}>PHONE NUMBER</label>
              <input style={input} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+212 6XX XXX XXX" />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={label}>ADDRESS</label>
              <input style={input} value={address} onChange={e => setAddress(e.target.value)} placeholder="Casablanca, Morocco" />
            </div>
            <button onClick={saveInfo} disabled={saving} style={btn}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        )}

        {/* SECURITY TAB */}
        {tab === 'security' && (
          <>
            <div style={card}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, marginBottom: 20 }}>EMAIL ADDRESS</div>
              <div style={{ marginBottom: 16 }}>
                <label style={label}>EMAIL</label>
                <input style={input} value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
              </div>
              <button onClick={saveEmail} disabled={saving} style={btn}>{saving ? 'Saving...' : 'Update Email'}</button>
            </div>
            <div style={card}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, marginBottom: 20 }}>CHANGE PASSWORD</div>
              <div style={{ marginBottom: 14 }}>
                <label style={label}>NEW PASSWORD</label>
                <input style={input} type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="••••••••" />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={label}>CONFIRM PASSWORD</label>
                <input style={input} type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="••••••••" />
              </div>
              <button onClick={savePassword} disabled={saving} style={btn}>{saving ? 'Saving...' : 'Update Password'}</button>
            </div>
          </>
        )}

        {/* PAYMENT TAB */}
                {tab === 'payment' && (
          <div>
            <div style={card}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, marginBottom: 16 }}>BILLING & SUBSCRIPTION</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(0,204,119,0.06)', border: '1px solid rgba(0,204,119,0.15)', borderRadius: 10, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#00cc77' }}>{profile?.is_pro ? 'Pro Plan — $9/month' : 'Free Trial'}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{profile?.is_pro ? 'Active subscription' : 'Trial period'}</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: profile?.is_pro ? '#00cc77' : '#ffaa00', padding: '4px 10px', background: profile?.is_pro ? 'rgba(0,204,119,0.1)' : 'rgba(255,170,0,0.1)', borderRadius: 20, border: profile?.is_pro ? '1px solid rgba(0,204,119,0.2)' : '1px solid rgba(255,170,0,0.2)' }}>
                  {profile?.is_pro ? 'ACTIVE' : 'TRIAL'}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={handlePaddlePortal}
                  style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer', textAlign: 'left' }}>
                  📋 View Payment History & Invoices
                </button>
                <button
                  onClick={handlePaddlePortal}
                  style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer', textAlign: 'left' }}>
                  💳 Manage Payment Method
                </button>
                {profile?.is_pro && (
                  <button
                    onClick={handlePaddlePortal}
                    style={{ padding: '12px 20px', background: 'rgba(255,68,102,0.06)', border: '1px solid rgba(255,68,102,0.2)', borderRadius: 10, color: '#ff4466', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer', textAlign: 'left' }}>
                    ❌ Cancel Subscription
                  </button>
                )}
                {!profile?.is_pro && (
                  <button
                    onClick={() => window.location.href = '/upgrade'}
                    style={{ padding: '12px 20px', background: 'linear-gradient(135deg,#00ff88,#00ccaa)', border: 'none', borderRadius: 10, color: '#000', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
                    🚀 Upgrade to Pro — $9/month
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        {tab === 'support' && (
          <div style={{ padding: '24px' }}>
            {supportSent ? (
              <div style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 12, padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#00ff88', marginBottom: 6 }}>Ticket submitted!</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>We'll get back to you within 24 hours.</div>
                <div style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Your ID: <span style={{ color: '#00ff88', fontWeight: 700 }}>{profile?.customer_id}</span></div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4, letterSpacing: 1 }}>YOUR CUSTOMER ID</div>
                  <div style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 14, fontWeight: 700, color: '#00ff88', letterSpacing: 2 }}>{profile?.customer_id || 'Loading...'}</div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4, letterSpacing: 1 }}>SUBJECT</div>
                  <input value={supportSubject} onChange={e => setSupportSubject(e.target.value)}
                    placeholder="Ex: Payment issue, Bug report..."
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', padding: '10px 14px', fontSize: 14, fontFamily: 'Syne', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4, letterSpacing: 1 }}>MESSAGE</div>
                  <textarea value={supportMessage} onChange={e => setSupportMessage(e.target.value)}
                    placeholder="Describe your issue in detail..."
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', padding: '10px 14px', fontSize: 14, fontFamily: 'Syne', outline: 'none', boxSizing: 'border-box', minHeight: 120, resize: 'vertical' }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4, letterSpacing: 1 }}>SCREENSHOT (OPTIONAL)</div>
                  <label style={{ display: 'block', cursor: 'pointer' }}>
                    <div style={{ border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 8, padding: '16px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                      {screenshotPreview ? (
                        <img src={screenshotPreview} style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 6 }} />
                      ) : '+ Add screenshot'}
                    </div>
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setSupportScreenshot(file)
                          setScreenshotPreview(URL.createObjectURL(file))
                        }
                      }} />
                  </label>
                </div>
                <button
                  onClick={async () => {
                    if (!supportSubject || !supportMessage) return
                    setSupportLoading(true)
                    try {
                      let screenshotUrl = ''
                      if (supportScreenshot) {
                        const { createClient } = await import('@/lib/supabase')
                        const supabase = createClient()
                        const fileName = `support/${profile?.customer_id}_${Date.now()}.${supportScreenshot.name.split('.').pop()}`
                        const { data } = await supabase.storage.from('screenshots').upload(fileName, supportScreenshot)
                        if (data) {
                          const { data: urlData } = supabase.storage.from('screenshots').getPublicUrl(fileName)
                          screenshotUrl = urlData.publicUrl
                        }
                      }
                      await fetch('/api/support', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          customer_id: profile?.customer_id,
                          user_id: profile?.id,
                          full_name: profile?.full_name || firstName + ' ' + lastName,
                          email: email,
                          subject: supportSubject,
                          message: supportMessage,
                          screenshot_url: screenshotUrl,
                        })
                      })
                      setSupportSent(true)
                    } catch(e) {}
                    setSupportLoading(false)
                  }}
                  style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg,#00ff88,#00ccaa)', border: 'none', borderRadius: 10, color: '#000', fontFamily: 'Syne', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
                  {supportLoading ? 'Sending...' : 'Submit Ticket'}
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'subscription' && (
          <div style={card}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, marginBottom: 20 }}>SUBSCRIPTION PLAN</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { name: 'Free Trial', price: '$0/mo', features: ['15-day trial', 'Pre-Trade Gate', 'Trade Journal', 'Weekly AI Report', 'Live Prices'], current: !profile?.is_pro, color: 'rgba(255,255,255,0.04)' },
                { name: 'Pro', price: '$9/mo', features: ['Everything in Trial', 'Unlimited trades', 'Monthly AI Report', 'Priority support', 'CSV Export'], current: profile?.is_pro, color: 'rgba(0,204,119,0.06)' },
              ].map(plan => (
                <div key={plan.name} style={{ padding: 20, background: plan.color, border: plan.current ? '1px solid rgba(0,204,119,0.3)' : '1px solid rgba(255,255,255,0.07)', borderRadius: 12, position: 'relative' }}>
                  {plan.current && <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 9, fontWeight: 700, color: '#000', background: '#00cc77', padding: '2px 8px', borderRadius: 10 }}>CURRENT</div>}
                  <div style={{ fontSize: 16, fontWeight: 800, color: plan.current ? '#00cc77' : '#fff', marginBottom: 4 }}>{plan.name}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'JetBrains Mono', color: '#fff', marginBottom: 12 }}>{plan.price}</div>
                  {plan.features.map(f => (
                    <div key={f} style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>✓ {f}</div>
                  ))}
                  {!profile?.is_pro && plan.name === 'Pro' && (
                    <button onClick={() => window.location.href = '/upgrade'} style={{ marginTop: 16, width: '100%', padding: '10px', background: 'linear-gradient(135deg,#00ff88,#00ccaa)', border: 'none', borderRadius: 8, color: '#000', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>Upgrade Now</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}