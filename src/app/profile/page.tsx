'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Tab = 'info' | 'security' | 'payment' | 'subscription'

export default function ProfilePage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('info')
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
          <>
            <div style={card}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, marginBottom: 20 }}>PAYMENT METHODS</div>
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(255,255,255,0.2)', fontSize: 13, marginBottom: 16 }}>No payment methods saved yet</div>
              <button onClick={() => setShowAddCard(!showAddCard)} style={{ ...btn, background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                + Add Payment Method
              </button>
              {showAddCard && (
                <div style={{ marginTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, marginBottom: 16 }}>NEW CARD</div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={label}>CARD NUMBER</label>
                    <input style={input} value={cardNumber} onChange={e => setCardNumber(e.target.value.replace(/D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim())} placeholder="1234 5678 9012 3456" maxLength={19} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={label}>EXPIRY DATE</label>
                      <input style={input} value={cardExpiry} onChange={e => setCardExpiry(e.target.value.replace(/D/g,'').slice(0,4).replace(/(.{2})/,'$1/'))} placeholder="MM/YY" maxLength={5} />
                    </div>
                    <div>
                      <label style={label}>CVV</label>
                      <input style={input} value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/D/g,'').slice(0,3))} placeholder="123" maxLength={3} type="password" />
                    </div>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={label}>CARDHOLDER NAME</label>
                    <input style={input} value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Adam Trader" />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => { setShowAddCard(false); setMsg('Payment method saved!'); setTimeout(() => setMsg(''), 3000) }} style={btn}>Save Card</button>
                    <button onClick={() => setShowAddCard(false)} style={{ ...btn, background: 'none', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
            <div style={card}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, marginBottom: 16 }}>PAYMENT HISTORY</div>
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No payment history yet</div>
            </div>
          </>
        )}

        {/* SUBSCRIPTION TAB */}
        {tab === 'subscription' && (
          <div style={card}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, marginBottom: 20 }}>SUBSCRIPTION PLAN</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { name: 'Free', price: '$0/mo', features: ['1 account', 'Basic journal', 'Weekly report'], current: true, color: 'rgba(255,255,255,0.1)' },
                { name: 'Pro', price: '$9/mo', features: ['Unlimited accounts', 'AI coaching', 'Monthly report', 'Priority support'], current: false, color: 'rgba(0,204,119,0.1)' },
              ].map(plan => (
                <div key={plan.name} style={{ padding: 20, background: plan.color, border: `1px solid ${plan.current ? 'rgba(255,255,255,0.1)' : 'rgba(0,204,119,0.3)'}`, borderRadius: 12 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: plan.current ? '#fff' : '#00cc77', marginBottom: 4 }}>{plan.name}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'JetBrains Mono', color: '#fff', marginBottom: 12 }}>{plan.price}</div>
                  {plan.features.map(f => (
                    <div key={f} style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>✓ {f}</div>
                  ))}
                  {plan.current ? (
                    <div style={{ marginTop: 16, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1 }}>CURRENT PLAN</div>
                  ) : (
                    <button style={{ ...btn, marginTop: 16, width: '100%' }}>Upgrade to Pro</button>
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
