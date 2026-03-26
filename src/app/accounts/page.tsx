'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AccountsPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [broker, setBroker] = useState('')
  const [balance, setBalance] = useState('')
  const [accountType, setAccountType] = useState('personal')
  const [msg, setMsg] = useState('')

  useEffect(() => { loadAccounts() }, [])

  async function loadAccounts() {
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }
    const { data } = await supabase.from('trading_accounts').select('*').eq('user_id', user.id).order('created_at', { ascending: true })
    setAccounts(data || [])
    setLoading(false)
  }

  async function addAccount() {
    if (!name || !balance) { setMsg('Name o balance required!'); return }
    setSaving(true)
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('trading_accounts').insert({
      user_id: user.id, name, broker, balance: parseFloat(balance), initial_balance: parseFloat(balance), account_type: accountType
    })
    if (error) { setMsg('Error: ' + error.message) }
    else { setMsg('Account added!'); setName(''); setBroker(''); setBalance(''); setShowAdd(false); loadAccounts() }
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  async function deleteAccount(id: string) {
    if (!confirm('Delete this account?')) return
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    await supabase.from('trading_accounts').update({ is_active: false }).eq('id', id)
    loadAccounts()
  }

  const card: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16, marginBottom: 12 }
  const input: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', padding: '10px 14px', fontSize: 13, fontFamily: 'Syne', outline: 'none', boxSizing: 'border-box' }

  const TYPE_COLORS: any = { personal: '#00ccff', prop_firm: '#cc44ff', broker: '#ffaa00' }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e8e8f0', fontFamily: 'Syne, sans-serif' }}>
      <div style={{ background: '#000', borderBottom: '1px solid #1a1a1a', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.4)', padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontFamily: 'Syne' }}>← Back</button>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Trading Accounts</div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>

        {msg && <div style={{ padding: '10px 14px', background: msg.includes('Error') ? 'rgba(255,68,102,0.1)' : 'rgba(0,204,119,0.1)', border: `1px solid ${msg.includes('Error') ? 'rgba(255,68,102,0.3)' : 'rgba(0,204,119,0.3)'}`, borderRadius: 8, fontSize: 13, color: msg.includes('Error') ? '#ff4466' : '#00cc77', marginBottom: 16 }}>{msg}</div>}

        {/* Accounts List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>Loading...</div>
        ) : accounts.map(acc => (
          <div key={acc.id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: TYPE_COLORS[acc.account_type] + '22', border: `1px solid ${TYPE_COLORS[acc.account_type]}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                {acc.account_type === 'prop_firm' ? '🏢' : acc.account_type === 'broker' ? '📈' : '💼'}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{acc.name}</div>
                <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                  <span>{acc.broker || 'No broker'}</span>
                  <span style={{ color: TYPE_COLORS[acc.account_type] }}>{acc.account_type.replace('_', ' ').toUpperCase()}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#00cc77', fontFamily: 'JetBrains Mono' }}>${(acc.balance || 0).toLocaleString()}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>Initial: ${(acc.initial_balance || 0).toLocaleString()}</div>
              </div>
              <button onClick={() => deleteAccount(acc.id)} style={{ background: 'none', border: '1px solid rgba(255,68,102,0.2)', borderRadius: 8, color: '#ff4466', padding: '6px 10px', cursor: 'pointer', fontSize: 12 }}>✕</button>
            </div>
          </div>
        ))}

        {/* Add Account */}
        {!showAdd ? (
          <button onClick={() => setShowAdd(true)} style={{ width: '100%', padding: '14px', background: 'none', border: '1px dashed rgba(0,204,119,0.3)', borderRadius: 12, color: '#00cc77', fontFamily: 'Syne', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginTop: 8 }}>
            + Add Trading Account
          </button>
        ) : (
          <div style={card}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, marginBottom: 16 }}>NEW ACCOUNT</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 5 }}>ACCOUNT NAME *</div>
                <input style={input} value={name} onChange={e => setName(e.target.value)} placeholder="FTMO $100k" />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 5 }}>BROKER</div>
                <input style={input} value={broker} onChange={e => setBroker(e.target.value)} placeholder="FTMO, IC Markets..." />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 5 }}>INITIAL BALANCE *</div>
                <input style={input} type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="10000" />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 5 }}>TYPE</div>
                <select style={input} value={accountType} onChange={e => setAccountType(e.target.value)}>
                  <option value="personal">Personal</option>
                  <option value="prop_firm">Prop Firm</option>
                  <option value="broker">Broker</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={addAccount} disabled={saving} style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#00cc77,#00aa66)', border: 'none', borderRadius: 8, color: '#000', fontFamily: 'Syne', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>{saving ? 'Saving...' : 'Add Account'}</button>
              <button onClick={() => setShowAdd(false)} style={{ padding: '10px 24px', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.4)', fontFamily: 'Syne', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
