'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { getLang, t, setLang, Lang } from '@/lib/i18n'

export default function SettingsPage() {
  const [lang, setLangState] = useState<Lang>('en')
  const [balance, setBalance] = useState('')
  const [riskPercent, setRiskPercent] = useState('1')
  const [maxTrades, setMaxTrades] = useState('5')
  const [username, setUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    setLangState(getLang())
    loadProfile()
  }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (profile) {
      setBalance(profile.account_balance?.toString() || '')
      setRiskPercent(profile.risk_percent?.toString() || '1')
      setMaxTrades(profile.max_daily_trades?.toString() || '5')
      setUsername(profile.username || '')
    }
    setLoading(false)
  }

  async function saveSettings() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({
      account_balance: parseFloat(balance) || 0,
      risk_percent: parseFloat(riskPercent) || 1,
      max_daily_trades: parseInt(maxTrades) || 5,
      username: username || null,
    }).eq('id', user.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function changeLang(l: Lang) {
    setLang(l)
  }

  const isRTL = false

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#00ff88', fontFamily: 'JetBrains Mono' }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e8e8f0', fontFamily: 'Syne, sans-serif', direction: isRTL ? 'rtl' : 'ltr' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Syne:wght@400;600;700&display=swap')`}</style>

      {/* Header */}
      <div style={{ background: '#0d0d18', borderBottom: '1px solid #1e1e30', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: '1px solid #1e1e30', borderRadius: '6px', color: '#555570', padding: '6px 10px', cursor: 'pointer', fontSize: '13px', fontFamily: 'Syne' }}>← Back</button>
          <div style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '2px' }}>TRADIS</div>
        </div>
        <div style={{ fontSize: '13px', color: '#555570' }}>Settings</div>
      </div>

      <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>

        {/* Trading Account */}
        <div style={sectionStyle}>
          <div style={titleStyle}>Trading Account</div>

          <div style={fieldStyle}>
            <div style={labelStyle}>Account Balance (USD)</div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#555570', fontFamily: 'JetBrains Mono', fontSize: '14px' }}>$</span>
              <input value={balance} onChange={e => setBalance(e.target.value)} type="number" placeholder="10000" style={{ ...inputStyle, paddingLeft: '28px' }} />
            </div>
            <div style={hintStyle}>Lot size calculator uses this value</div>
          </div>

          <div style={fieldStyle}>
            <div style={labelStyle}>Risk per Trade (%)</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['0.5', '1', '2', '3'].map(val => (
                <button key={val} onClick={() => setRiskPercent(val)} style={{ flex: 1, padding: '10px', background: riskPercent === val ? '#00ff8811' : '#0a0a0f', border: `1px solid ${riskPercent === val ? '#00ff88' : '#1e1e30'}`, borderRadius: '8px', color: riskPercent === val ? '#00ff88' : '#888890', fontFamily: 'JetBrains Mono', fontSize: '13px', cursor: 'pointer' }}>{val}%</button>
              ))}
            </div>
            <input value={riskPercent} onChange={e => setRiskPercent(e.target.value)} type="number" step="0.1" placeholder="1" style={{ ...inputStyle, marginTop: '8px' }} />
            {balance && riskPercent && (
              <div style={{ marginTop: '8px', background: '#00ff8811', border: '1px solid #00ff8833', borderRadius: '8px', padding: '10px', fontSize: '13px', color: '#00ff88', fontFamily: 'JetBrains Mono' }}>
                Risk per trade: ${(parseFloat(balance) * parseFloat(riskPercent) / 100).toFixed(2)}
              </div>
            )}
          </div>

          <div style={fieldStyle}>
            <div style={labelStyle}>Max Trades per Day</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
              {['1','2','3','4','5','6','7','8','9','10'].map(val => (
                <button key={val} onClick={() => setMaxTrades(val)} style={{ padding: '10px', background: maxTrades === val ? '#00ccff11' : '#0a0a0f', border: `1px solid ${maxTrades === val ? '#00ccff' : '#1e1e30'}`, borderRadius: '8px', color: maxTrades === val ? '#00ccff' : '#888890', fontFamily: 'JetBrains Mono', fontSize: '13px', cursor: 'pointer' }}>{val}</button>
              ))}
            </div>
            </div>
          </div>
        </div>
        {/* Language */}
        <div style={sectionStyle}>
          <div style={titleStyle}>Language / Langue / اللغة / Idioma</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {([['en', '🇬🇧', 'English'], ['fr', '🇫🇷', 'Français'], ['es', '🇪🇸', 'Español']] as [Lang, string, string][]).map(([l, flag, name]) => (
              <button key={l} onClick={() => changeLang(l)} style={{ padding: '12px', background: lang === l ? '#00ff8811' : '#0a0a0f', border: `1px solid ${lang === l ? '#00ff88' : '#1e1e30'}`, borderRadius: '10px', color: lang === l ? '#00ff88' : '#888890', fontFamily: 'Syne', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>{flag}</span>
                <span>{name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Save */}
        <button onClick={saveSettings} disabled={saving} style={{ width: '100%', padding: '14px', background: saved ? '#00ff8844' : '#00ff88', border: 'none', borderRadius: '10px', color: '#0a0a0f', fontFamily: 'Syne', fontSize: '15px', fontWeight: 700, cursor: 'pointer', transition: 'all .2s' }}>
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Settings'}
        </button>

        <button onClick={() => router.push('/dashboard')} style={{ width: '100%', padding: '12px', marginTop: '8px', background: 'none', border: '1px solid #1e1e30', borderRadius: '10px', color: '#555570', fontFamily: 'Syne', fontSize: '13px', cursor: 'pointer' }}>
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}

const sectionStyle: React.CSSProperties = { background: '#13131f', border: '1px solid #1e1e30', borderRadius: '12px', padding: '16px', marginBottom: '16px' }
const titleStyle: React.CSSProperties = { fontSize: '11px', fontWeight: 700, color: '#555570', letterSpacing: '1px', textTransform: 'uppercase' as const, marginBottom: '16px' }
const fieldStyle: React.CSSProperties = { marginBottom: '16px' }
const labelStyle: React.CSSProperties = { fontSize: '12px', color: '#888890', marginBottom: '8px', fontWeight: 600 }
const hintStyle: React.CSSProperties = { fontSize: '11px', color: '#444460', marginTop: '4px' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', background: '#0a0a0f', border: '1px solid #1e1e30', borderRadius: '8px', color: '#e8e8f0', fontFamily: 'JetBrains Mono', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }
