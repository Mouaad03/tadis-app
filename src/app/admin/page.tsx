'use client'
import { useState, useEffect } from 'react'

const ADMIN_PASSWORD = 'Tr@d1s#Admin$2026!'

export default function AdminPanel() {
  const [authed, setAuthed] = useState(false)
  const [pwd, setPwd] = useState('')
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [customer, setCustomer] = useState<any>(null)
  const [trades, setTrades] = useState<any[]>([])
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [actionMsg, setActionMsg] = useState('')
  const [allCustomers, setAllCustomers] = useState<any[]>([])
  const [view, setView] = useState<'customers' | 'inbox'>('customers')
  const [messages, setMessages] = useState<any[]>([])
  const [selectedMsg, setSelectedMsg] = useState<any>(null)
  const [replyText, setReplyText] = useState('')
  const [replying, setReplying] = useState(false)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (authed) {
      loadAllCustomers()
      loadMessages()
    }
  }, [authed])

  async function loadAllCustomers() {
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (data) setAllCustomers(data)
  }

  async function loadMessages() {
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const { data: tickets } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false })
    const { data: contacts } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
    const all = [
      ...(tickets || []).map((t: any) => ({ ...t, type: 'support' })),
      ...(contacts || []).map((c: any) => ({ ...c, type: 'contact' }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    setMessages(all)
    setUnread(all.filter((m: any) => !m.read_at).length)
  }

  async function markRead(msg: any) {
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const table = msg.type === 'support' ? 'support_tickets' : 'contact_messages'
    if (!msg.read_at) {
      await supabase.from(table).update({ read_at: new Date().toISOString() }).eq('id', msg.id)
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read_at: new Date().toISOString() } : m))
      setUnread(prev => Math.max(0, prev - 1))
    }
    setSelectedMsg({ ...msg, read_at: msg.read_at || new Date().toISOString() })
    setReplyText('')
  }

  async function sendReply() {
    if (!replyText || !selectedMsg) return
    setReplying(true)
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const table = selectedMsg.type === 'support' ? 'support_tickets' : 'contact_messages'
    await supabase.from(table).update({
      reply: replyText,
      status: 'replied',
      replied_at: new Date().toISOString()
    }).eq('id', selectedMsg.id)

    // Send email reply
    await fetch('/api/admin-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: selectedMsg.email,
        name: selectedMsg.name || selectedMsg.full_name,
        subject: selectedMsg.subject || 'Re: Your message to TRADIS',
        reply: replyText,
        customer_id: selectedMsg.customer_id || '',
      })
    })

    setMessages(prev => prev.map(m => m.id === selectedMsg.id ? { ...m, status: 'replied', reply: replyText } : m))
    setSelectedMsg((prev: any) => ({ ...prev, status: 'replied', reply: replyText }))
    setReplyText('')
    setReplying(false)
  }

  async function searchCustomer() {
    if (!search) return
    setLoading(true)
    setCustomer(null)
    setTrades([])
    setTickets([])
    setActionMsg('')
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const { data: p } = await supabase.from('profiles').select('*')
      .or(`customer_id.eq.${search},email.eq.${search}`)
      .single()
    if (p) {
      setCustomer(p)
      const { data: t } = await supabase.from('trades').select('*').eq('user_id', p.id).order('created_at', { ascending: false }).limit(20)
      const { data: tk } = await supabase.from('support_tickets').select('*').eq('user_id', p.id).order('created_at', { ascending: false })
      setTrades(t || [])
      setTickets(tk || [])
    } else {
      setError('Customer not found')
      setTimeout(() => setError(''), 3000)
    }
    setLoading(false)
  }

  async function togglePro() {
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    await supabase.from('profiles').update({ is_pro: !customer.is_pro }).eq('id', customer.id)
    setCustomer({ ...customer, is_pro: !customer.is_pro })
    setActionMsg(customer.is_pro ? 'User downgraded to free' : 'User upgraded to Pro ✓')
  }

  async function resetPassword() {
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(customer.email, { redirectTo: 'https://tradis.live/reset-password' })
    setActionMsg('Password reset email sent ✓')
  }

  const inp: any = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff', padding: '10px 14px', fontSize: 14, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }
  const card: any = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16, marginBottom: 12 }
  const label: any = { fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 1, marginBottom: 4 }
  const val: any = { fontSize: 14, color: '#fff', fontWeight: 600 }
  const btn: any = { padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, fontSize: 12 }

  if (!authed) return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 40, width: 340 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#00ff88', fontFamily: 'monospace', letterSpacing: 2, marginBottom: 8 }}>TRADIS ADMIN</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 24 }}>Restricted access</div>
        <input type="password" value={pwd} onChange={e => setPwd(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { if (pwd === ADMIN_PASSWORD) setAuthed(true); else setError('Wrong password') }}}
          placeholder="Admin password" style={{ ...inp, marginBottom: 12 }} />
        {error && <div style={{ color: '#ff4466', fontSize: 12, marginBottom: 8 }}>{error}</div>}
        <button onClick={() => { if (pwd === ADMIN_PASSWORD) { setAuthed(true); setError('') } else setError('Wrong password') }}
          style={{ ...btn, background: '#00ff88', color: '#000', width: '100%', padding: 12 }}>
          Enter
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: '#e8e8f0', fontFamily: 'monospace' }}>
      {/* Header */}
      <div style={{ background: '#000', borderBottom: '1px solid rgba(0,255,136,0.2)', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#00ff88', letterSpacing: 3 }}>TRADIS ADMIN</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={() => setView('customers')} style={{ background: view === 'customers' ? 'rgba(0,255,136,0.15)' : 'none', border: '1px solid rgba(0,255,136,0.3)', borderRadius: 8, color: '#00ff88', padding: '6px 16px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 12 }}>
            Users ({allCustomers.length})
          </button>
          <button onClick={() => { setView('inbox'); setSelectedMsg(null) }} style={{ background: view === 'inbox' ? 'rgba(0,255,136,0.15)' : 'none', border: '1px solid rgba(0,255,136,0.3)', borderRadius: 8, color: '#00ff88', padding: '6px 16px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 12, position: 'relative' }}>
            Inbox ({messages.length})
            {unread > 0 && <span style={{ position: 'absolute', top: -6, right: -6, background: '#ff4466', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{unread}</span>}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

        {/* Search */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchCustomer()}
            placeholder="Search by Customer ID (TRD-XXXXX) or email..."
            style={{ ...inp, flex: 1 }} />
          <button onClick={searchCustomer} style={{ ...btn, background: '#00ff88', color: '#000', padding: '10px 24px' }}>
            {loading ? '...' : 'Search'}
          </button>
        </div>

        {/* Customer Details */}
        {customer && (
          <div>
            {/* Profile Card */}
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#00ff88' }}>{customer.customer_id}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ background: customer.is_pro ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.08)', color: customer.is_pro ? '#00ff88' : '#888', padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
                    {customer.is_pro ? 'PRO' : 'FREE'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div><div style={label}>FULL NAME</div><div style={val}>{customer.full_name || '—'}</div></div>
                <div><div style={label}>EMAIL</div><div style={{ ...val, fontSize: 12 }}>{customer.email}</div></div>
                <div><div style={label}>BALANCE</div><div style={{ ...val, color: '#00ff88' }}>${customer.account_balance || 0}</div></div>
                <div><div style={label}>RISK %</div><div style={val}>{customer.risk_percent || 1}%</div></div>
                <div><div style={label}>COUNTRY</div><div style={val}>{customer.country || '—'}</div></div>
                <div><div style={label}>TRIAL START</div><div style={{ ...val, fontSize: 12 }}>{customer.trial_start_date ? new Date(customer.trial_start_date).toLocaleDateString() : '—'}</div></div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ ...card, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginRight: 8 }}>ACTIONS:</div>
              <button onClick={togglePro} style={{ ...btn, background: customer.is_pro ? 'rgba(255,68,102,0.2)' : 'rgba(0,255,136,0.15)', color: customer.is_pro ? '#ff4466' : '#00ff88', border: `1px solid ${customer.is_pro ? '#ff4466' : '#00ff88'}` }}>
                {customer.is_pro ? 'Downgrade to Free' : 'Upgrade to Pro'}
              </button>
              <button onClick={resetPassword} style={{ ...btn, background: 'rgba(255,170,0,0.15)', color: '#ffaa00', border: '1px solid #ffaa00' }}>
                Send Password Reset
              </button>
              {actionMsg && <div style={{ fontSize: 12, color: '#00ff88', marginLeft: 8 }}>{actionMsg}</div>}
            </div>

            {/* Trades */}
            <div style={card}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
                TRADES ({trades.length}) — Avg Score: {trades.length ? Math.round(trades.reduce((a,t) => a + (t.discipline_score||0), 0) / trades.length) : 0}/100
              </div>
              {trades.length === 0 ? <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>No trades yet</div> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        {['Date','Pair','Dir','Result','PnL','Score','Revenge'].map(h => (
                          <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {trades.map(t => (
                        <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '6px 8px', color: 'rgba(255,255,255,0.5)' }}>{new Date(t.date).toLocaleDateString()}</td>
                          <td style={{ padding: '6px 8px', fontWeight: 700 }}>{t.pair}</td>
                          <td style={{ padding: '6px 8px', color: t.direction === 'BUY' ? '#00ff88' : '#ff4466' }}>{t.direction}</td>
                          <td style={{ padding: '6px 8px', color: t.result === 'win' ? '#00ff88' : t.result === 'loss' ? '#ff4466' : '#ffaa00' }}>{t.result}</td>
                          <td style={{ padding: '6px 8px', color: t.pnl >= 0 ? '#00ff88' : '#ff4466' }}>{t.pnl >= 0 ? '+' : ''}${t.pnl}</td>
                          <td style={{ padding: '6px 8px' }}>{t.discipline_score}/100</td>
                          <td style={{ padding: '6px 8px', color: t.is_revenge ? '#ff4466' : 'rgba(255,255,255,0.3)' }}>{t.is_revenge ? 'YES' : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Support Tickets */}
            <div style={card}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 12 }}>SUPPORT TICKETS ({tickets.length})</div>
              {tickets.length === 0 ? <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>No tickets</div> : (
                tickets.map(tk => (
                  <div key={tk.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '10px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{tk.subject}</div>
                      <div style={{ fontSize: 11, color: tk.status === 'open' ? '#ffaa00' : '#00ff88' }}>{tk.status?.toUpperCase()}</div>
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{tk.message}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>{new Date(tk.created_at).toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Inbox view */}
        {view === 'inbox' && (
          <div style={{ display: 'grid', gridTemplateColumns: selectedMsg ? '1fr 1.4fr' : '1fr', gap: 16 }}>
            {/* Messages list */}
            <div style={card}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 12 }}>ALL MESSAGES ({messages.length})</div>
              {messages.length === 0 ? <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>No messages yet</div> : (
                messages.map((msg: any) => (
                  <div key={msg.id} onClick={() => markRead(msg)}
                    style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', opacity: selectedMsg?.id === msg.id ? 1 : 0.85 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: msg.read_at ? '#fff' : '#00ff88' }}>
                        {!msg.read_at && '● '}{msg.name || msg.full_name || 'Unknown'}
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 99, background: msg.type === 'support' ? 'rgba(0,204,255,0.15)' : 'rgba(255,170,0,0.15)', color: msg.type === 'support' ? '#00ccff' : '#ffaa00' }}>
                          {msg.type === 'support' ? 'SUPPORT' : 'CONTACT'}
                        </span>
                        <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 99, background: msg.status === 'replied' ? 'rgba(0,255,136,0.15)' : 'rgba(255,170,0,0.15)', color: msg.status === 'replied' ? '#00ff88' : '#ffaa00' }}>
                          {msg.status?.toUpperCase() || 'OPEN'}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>{msg.subject || '(no subject)'}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{new Date(msg.created_at).toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>

            {/* Message detail + reply */}
            {selectedMsg && (
              <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#00ff88' }}>{selectedMsg.customer_id || 'Contact'}</div>
                  <button onClick={() => setSelectedMsg(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 16 }}>✕</button>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>FROM: </span>
                  <span style={{ fontSize: 12, color: '#fff' }}>{selectedMsg.name || selectedMsg.full_name} — {selectedMsg.email}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{selectedMsg.subject || '(no subject)'}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                  {selectedMsg.message}
                </div>
                {selectedMsg.screenshot_url && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>SCREENSHOT:</div>
                    <a href={selectedMsg.screenshot_url} target="_blank" rel="noreferrer">
                      <img src={selectedMsg.screenshot_url} style={{ maxWidth: '100%', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }} />
                    </a>
                  </div>
                )}
                {selectedMsg.reply && (
                  <div style={{ background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                    <div style={{ fontSize: 10, color: '#00ff88', marginBottom: 4 }}>YOUR REPLY:</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{selectedMsg.reply}</div>
                  </div>
                )}
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>REPLY:</div>
                <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', padding: '10px 12px', fontSize: 12, fontFamily: 'monospace', outline: 'none', minHeight: 80, resize: 'vertical', boxSizing: 'border-box', marginBottom: 8 }} />
                <button onClick={sendReply} disabled={replying || !replyText}
                  style={{ width: '100%', padding: 10, background: replyText ? '#00ff88' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, color: replyText ? '#000' : '#555', fontFamily: 'monospace', fontWeight: 700, fontSize: 13, cursor: replyText ? 'pointer' : 'not-allowed' }}>
                  {replying ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* All customers list */}
        {view === 'customers' && !customer && (
          <div style={card}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 12 }}>ALL USERS ({allCustomers.length})</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {['Customer ID','Name','Email','Plan','Balance'].map(h => (
                      <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allCustomers.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
                      onClick={() => { setSearch(u.customer_id); setCustomer(u) }}>
                      <td style={{ padding: '6px 8px', color: '#00ff88', fontWeight: 700 }}>{u.customer_id}</td>
                      <td style={{ padding: '6px 8px' }}>{u.full_name || '—'}</td>
                      <td style={{ padding: '6px 8px', color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{u.email}</td>
                      <td style={{ padding: '6px 8px' }}>
                        <span style={{ background: u.is_pro ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.05)', color: u.is_pro ? '#00ff88' : '#888', padding: '2px 8px', borderRadius: 99, fontSize: 10 }}>
                          {u.is_pro ? 'PRO' : 'FREE'}
                        </span>
                      </td>
                      <td style={{ padding: '6px 8px', color: '#00ff88' }}>${u.account_balance || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
