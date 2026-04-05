'use client'
import { useState, useEffect } from 'react'
import { getLang, Lang } from '@/lib/i18n'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface Trade {
  id: string; date: string; pair: string; direction: string
  entry: number; stop_loss: number; take_profit: number
  lot_size: number; pnl: number; result: string
  strategy: string; mood: number; planned_rr: number
  is_revenge: boolean; notes: string; created_at: string
  // New fields
  entry_time?: string; exit_time?: string; exit_price?: number
  exit_type?: 'tp' | 'sl' | 'market'; entry_pips?: number
  exit_pips?: number; gains_percent?: number
  duration_minutes?: number; screenshots?: string[]
}
interface DayInfo { pnl: number; trades: number }

const MOODS = ['🤬','😤','😐','😌','🧠']
const DAYS_H = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function fmtP(n: number) {
  const a = Math.abs(n)
  return (n < 0 ? '-' : '') + (a >= 1000 ? `$${(a/1000).toFixed(1)}K` : `$${a.toFixed(0)}`)
}

function fmtDuration(mins?: number) {
  if (!mins) return '—'
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins/60)}h ${mins%60}m`
}

function fmtTime(t?: string) {
  if (!t) return '—'
  return t.slice(0, 5)
}

function exitTypeColor(t?: string) {
  if (t === 'tp') return { bg: 'rgba(0,204,119,0.15)', color: '#00cc77' }
  if (t === 'sl') return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' }
  return { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
}

interface Props { userId?: string; profile?: any; lang?: string; demoTrades?: any[] }

export default function TradeJournal({ userId, profile, demoTrades }: Props) {
  const [lang, setLang] = useState<Lang>('en')
  const [tab, setTab] = useState<'calendar'|'history'|'performance'>('calendar')
  const [date, setDate] = useState(new Date())
  const [map, setMap] = useState<Record<string, DayInfo>>({})
  const [sel, setSel] = useState<string|null>(null)
  const [dayTrades, setDayTrades] = useState<Trade[]>([])
  const [allTrades, setAllTrades] = useState<Trade[]>([])
  const [filter, setFilter] = useState('all')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [uploadingFor, setUploadingFor] = useState<string | null>(null)

  const yr = date.getFullYear()
  const mo = date.getMonth()
  const mName = date.toLocaleString('en', { month: 'long' })
  const first = new Date(yr, mo, 1).getDay()
  const days = new Date(yr, mo + 1, 0).getDate()
  const weeks = Math.ceil((first + days) / 7)
  const allD = Object.values(map)
  const totPnL = allD.reduce((s, d) => s + d.pnl, 0)
  const totDays = allD.length
  const totTrades = allD.reduce((s, d) => s + d.trades, 0)

  useEffect(() => {
    setLang(getLang())
    function onS() { setLang(getLang()) }
    window.addEventListener('storage', onS)
    return () => window.removeEventListener('storage', onS)
  }, [])

  useEffect(() => {
    if (demoTrades) {
      setAllTrades(demoTrades)
      const m2: Record<string, DayInfo> = {}
      demoTrades.forEach((t: any) => {
        if (!m2[t.date]) m2[t.date] = { pnl: 0, trades: 0 }
        m2[t.date].pnl += t.pnl || 0
        m2[t.date].trades++
      })
      setMap(m2)
      return
    }
    if (userId) { loadMonth(); loadAll() }
  }, [userId, demoTrades])

  useEffect(() => {
    if (userId) loadMonth()
  }, [date, userId])

  useEffect(() => {
    if (sel) loadDay(sel)
    else setDayTrades([])
  }, [sel])

  async function loadMonth() {
    if (!userId) return
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const curYr = date.getFullYear()
    const curM = String(date.getMonth() + 1).padStart(2, '0')
    const { data: ts } = await supabase.from('trades').select('date,pnl,result').eq('user_id', userId).gte('date', `${curYr}-${curM}-01`).lte('date', `${curYr}-${curM}-31`)
    console.log('loadMonth query:', `${curYr}-${curM}-01`, 'to', `${curYr}-${curM}-31`)
    console.log('loadMonth results:', ts)
    const m2: Record<string, DayInfo> = {}
    ;(ts || []).forEach((t: any) => {
      if (!m2[t.date]) m2[t.date] = { pnl: 0, trades: 0 }
      m2[t.date].pnl += t.pnl || 0
      m2[t.date].trades++
    })
    setMap(m2)
  }

  async function loadDay(d: string) {
    if (!userId) return
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const { data: ts } = await supabase.from('trades').select('*').eq('user_id', userId).eq('date', d).order('created_at', { ascending: true })
    setDayTrades(ts || [])
  }

  async function loadAll() {
    if (!userId) return
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const { data: ts } = await supabase.from('trades').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    setAllTrades(ts || [])
  }

  function ds(d: number) { return `${yr}-${String(mo + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` }

  function weekPnL(w: number) {
    let p = 0, d2 = 0
    for (let d = 0; d < 7; d++) {
      const n = w * 7 + d - first + 1
      if (n >= 1 && n <= days && map[ds(n)]) { p += map[ds(n)].pnl; d2++ }
    }
    return { p, d: d2 }
  }

  // Day stats
  const dayPnL = dayTrades.reduce((s, t) => s + (t.pnl || 0), 0)
  const dWins = dayTrades.filter(t => t.result === 'win').length
  const dLosses = dayTrades.filter(t => t.result === 'loss').length
  const dRev = dayTrades.filter(t => t.is_revenge).length
  const dWR = dayTrades.length ? Math.round(dWins / dayTrades.length * 100) : 0
  const dDisc = Math.max(0, 100 - dRev * 20)

  // History stats
  function exportCSV() {
    const headers = ['Open Date','Close Date','Symbol','Action','Lots','Open Price','Close Price','SL','TP','Pips','Net Profit','Duration','Gain%','Strategy','Result','Revenge']
    const rows = allTrades.map(t => [
      t.date||'', t.date||'', t.pair||'', t.direction||'', t.lot_size||'',
      t.entry||'', t.exit_price||'', t.stop_loss||'', t.take_profit||'',
      t.exit_pips||'', t.pnl||'0', t.duration_minutes ? t.duration_minutes+'min' : '',
      t.gains_percent||'', t.strategy||'', t.result||'', t.is_revenge ? 'Yes' : 'No'
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'tradis_journal_' + new Date().toISOString().split('T')[0] + '.csv'
    a.click(); URL.revokeObjectURL(url)
  }

  const hWins = allTrades.filter(t => t.result === 'win').length
  const hLosses = allTrades.filter(t => t.result === 'loss').length
  const hPnL = allTrades.reduce((s, t) => s + (t.pnl || 0), 0)
  const hWR = allTrades.length ? Math.round(hWins / allTrades.length * 100) : 0
  const filtered = filter === 'all' ? allTrades : filter === 'win' ? allTrades.filter(t => t.result === 'win') : filter === 'loss' ? allTrades.filter(t => t.result === 'loss') : allTrades.filter(t => t.is_revenge)

  const card = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 14 }

  return (
    <div style={{ fontFamily: 'Syne, sans-serif' }}>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 4, marginBottom: 20, width: 'fit-content' }}>
        <button onClick={() => setTab('calendar')} style={{ padding: '8px 24px', background: tab === 'calendar' ? '#fff' : 'none', border: 'none', borderRadius: 8, color: tab === 'calendar' ? '#000' : 'rgba(255,255,255,0.4)', fontFamily: 'Syne', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Trade Calendar</button>
        <button onClick={() => setTab('history')} style={{ padding: '8px 24px', background: tab === 'history' ? '#fff' : 'none', border: 'none', borderRadius: 8, color: tab === 'history' ? '#000' : 'rgba(255,255,255,0.4)', fontFamily: 'Syne', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Trade History</button>
        <button onClick={() => setTab('performance')} style={{ padding: '8px 24px', background: tab === 'performance' ? '#fff' : 'none', border: 'none', borderRadius: 8, color: tab === 'performance' ? '#000' : 'rgba(255,255,255,0.4)', fontFamily: 'Syne', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Performance</button>
      </div>

      {tab === 'history' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <button onClick={exportCSV} style={{ padding: '7px 16px', background: 'rgba(0,204,119,0.1)', border: '1px solid rgba(0,204,119,0.3)', borderRadius: 8, color: '#00cc77', fontFamily: 'Syne', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>⬇ Export CSV</button>
        </div>
      )}
      {tab === 'performance' && <PerformanceTab trades={allTrades} profile={profile} />}
      {tab !== 'performance' && (tab === 'calendar' ? (
        <div>
          {/* CALENDAR CARD */}
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', marginBottom: 20, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f0f0f5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setDate(new Date(yr, mo - 1, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#888', padding: '4px 8px' }}>◄</button>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', minWidth: 140, textAlign: 'center' }}>{mName} {yr}</span>
                <button onClick={() => setDate(new Date(yr, mo + 1, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#888', padding: '4px 8px' }}>►</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
                <span style={{ fontWeight: 700, color: totPnL >= 0 ? '#22c55e' : '#ef4444' }}>{totPnL >= 0 ? '+' : ''}{fmtP(totPnL)}</span>
                <span style={{ color: '#ccc' }}>|</span>
                <span style={{ color: '#888' }}>{totDays} days | {totTrades} trades</span>
              </div>
              <div style={{ width: 60 }} />
            </div>
            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr) 130px', padding: '0 20px' }}>
              {DAYS_H.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#bbb', padding: '10px 0 6px' }}>{d}</div>)}
              <div />
            </div>
            {/* Rows */}
            <div style={{ padding: '0 20px 20px' }}>
              {Array.from({ length: weeks }).map((_, wi) => (
                <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr) 130px', gap: 4, marginBottom: 4 }}>
                  {Array.from({ length: 7 }).map((_, di) => {
                    const n = wi * 7 + di - first + 1
                    if (n < 1 || n > days) return <div key={di} style={{ minHeight: 80 }} />
                    const d2 = ds(n)
                    const info = map[d2]
                    const isSel = sel === d2
                    const isW = info && info.pnl >= 0
                    return (
                      <div key={di} onClick={() => info && setSel(isSel ? null : d2)}
                        style={{ minHeight: 80, borderRadius: 10, border: `1.5px solid ${isSel ? (isW ? '#22c55e' : '#ef4444') : info ? (isW ? '#bbf7d0' : '#fecaca') : '#e8e8f0'}`, background: info ? (isW ? '#f0fdf4' : '#fef2f2') : '#f8f8fc', cursor: info ? 'pointer' : 'default', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#999' }}>{String(n).padStart(2, '0')}</span>
                          {info && <span style={{ fontSize: 13 }}>📅</span>}
                        </div>
                        {info && <>
                          <div style={{ fontSize: 14, fontWeight: 800, color: isW ? '#22c55e' : '#ef4444', fontFamily: 'JetBrains Mono' }}>{fmtP(info.pnl)}</div>
                          <div style={{ fontSize: 11, color: '#aaa' }}>{info.trades} trade{info.trades > 1 ? 's' : ''}</div>
                        </>}
                      </div>
                    )
                  })}
                  {(() => { const { p, d: d2 } = weekPnL(wi); return (
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '8px 14px', background: '#f8f8fc', borderRadius: 10, border: '1px solid #e8e8f0' }}>
                      <div style={{ fontSize: 11, color: '#aaa', fontWeight: 600, marginBottom: 6 }}>Week {wi + 1}</div>
                      {d2 > 0 ? <>
                        <div style={{ fontSize: 16, fontWeight: 800, color: p >= 0 ? '#22c55e' : '#ef4444', fontFamily: 'JetBrains Mono' }}>{fmtP(p)}</div>
                        <div style={{ marginTop: 6 }}><span style={{ fontSize: 11, color: '#fff', background: '#a78bfa', borderRadius: 20, padding: '2px 10px', fontWeight: 600 }}>{d2} day{d2 > 1 ? 's' : ''}</span></div>
                      </> : <div style={{ fontSize: 12, color: '#ddd' }}>—</div>}
                    </div>
                  )})()}
                </div>
              ))}
            </div>
          </div>

          {/* DAY DETAIL */}
          {sel && (
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f0f0f5' }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#1a1a2e' }}>{sel}</div>
                  <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{dayTrades.length} trades</div>
                </div>
                <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
                  {[{ label: 'Total PnL', val: (dayPnL >= 0 ? '+' : '') + fmtP(dayPnL), color: dayPnL >= 0 ? '#22c55e' : '#ef4444' }, { label: 'Win Rate', val: dWR + '%', color: '#1a1a2e' }, { label: 'Discipline', val: dDisc + '', color: dDisc > 70 ? '#22c55e' : dDisc > 40 ? '#f59e0b' : '#ef4444' }].map(s => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: 'JetBrains Mono' }}>{s.val}</div>
                      <div style={{ fontSize: 11, color: '#aaa' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setSel(null)} style={{ background: 'none', border: '1px solid #e8e8f0', borderRadius: 8, color: '#aaa', padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}>✕</button>
              </div>
              {/* Stats bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: '#f0f0f5' }}>
                {[['Wins', dWins, '#22c55e'], ['Losses', dLosses, '#ef4444'], ['Revenge', dRev, '#f59e0b'], ['Trades', dayTrades.length, '#8b5cf6']].map(([l, v, c]) => (
                  <div key={l as string} style={{ background: '#fff', padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: c as string }}>{v as number}</div>
                    <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{l as string}</div>
                  </div>
                ))}
              </div>
              {/* PnL bars */}
              {dayTrades.length > 0 && (
                <div style={{ padding: '20px 20px 0' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#bbb', letterSpacing: 1, marginBottom: 12 }}>PnL PER TRADE</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80, marginBottom: 20 }}>
                    {dayTrades.map((tr, i) => {
                      const mx = Math.max(...dayTrades.map(t => Math.abs(t.pnl || 0)), 1)
                      const h = Math.max(8, Math.round((Math.abs(tr.pnl || 0) / mx) * 70))
                      return (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <div style={{ fontSize: 10, color: (tr.pnl || 0) >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700, fontFamily: 'JetBrains Mono' }}>{(tr.pnl || 0) >= 0 ? '+' : ''}{(tr.pnl || 0).toFixed(0)}</div>
                          <div style={{ width: '100%', height: h, background: (tr.pnl || 0) >= 0 ? '#22c55e' : '#ef4444', borderRadius: '4px 4px 0 0', opacity: 0.8 }} />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              {/* Trades list */}
              <div style={{ padding: '0 20px 20px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#bbb', letterSpacing: 1, marginBottom: 12 }}>TRADES</div>
                {dayTrades.length === 0 && <div style={{ textAlign: 'center', padding: 24, color: '#bbb', fontSize: 14 }}>No trades this day</div>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {dayTrades.map((tr, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 100px 80px 80px 100px', gap: 12, alignItems: 'center', padding: '12px 16px', background: '#f8f8fc', borderRadius: 12, border: `1px solid ${tr.result === 'win' ? '#bbf7d0' : tr.is_revenge ? '#fde68a' : '#fecaca'}` }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: '#1a1a2e', fontFamily: 'JetBrains Mono' }}>{tr.pair}</span>
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: tr.direction === 'BUY' ? '#dcfce7' : '#fee2e2', color: tr.direction === 'BUY' ? '#16a34a' : '#dc2626', fontWeight: 700 }}>{tr.direction}</span>
                        </div>
                        {tr.strategy && <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{tr.strategy}</div>}
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#bbb', marginBottom: 2 }}>Entry / SL / TP</div>
                        <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: '#666' }}>{tr.entry?.toFixed(5) || '—'} / {tr.stop_loss?.toFixed(5) || '—'} / {tr.take_profit?.toFixed(5) || '—'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#bbb', marginBottom: 2 }}>Lot / R:R</div>
                        <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: '#666' }}>{tr.lot_size || '—'} / {tr.planned_rr ? `1:${tr.planned_rr}` : '—'}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: '#bbb', marginBottom: 2 }}>Mood</div>
                        <div style={{ fontSize: 20 }}>{tr.mood ? MOODS[tr.mood - 1] : '—'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: (tr.pnl || 0) >= 0 ? '#22c55e' : '#ef4444', fontFamily: 'JetBrains Mono' }}>{(tr.pnl || 0) >= 0 ? '+' : ''}{(tr.pnl || 0).toFixed(0)}$</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: tr.result === 'win' ? '#22c55e' : '#ef4444', color: '#fff', fontWeight: 700 }}>{tr.result?.toUpperCase()}</span>
                        {tr.is_revenge && <div style={{ marginTop: 4 }}><span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: '#fef3c7', color: '#d97706', fontWeight: 700 }}>⚠ REVENGE</span></div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* History stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 16 }}>
            {[
              ['TOTAL PNL', (hPnL >= 0 ? '+' : '') + fmtP(hPnL), hPnL >= 0 ? '#00cc77' : '#ef4444'],
              ['WIN RATE', hWR + '%', '#fff'],
              ['TOTAL TRADES', allTrades.length + '', '#fff'],
              ['REVENGE', allTrades.filter(t => t.is_revenge).length + '', '#f59e0b'],
            ].map(([l, v, c]) => (
              <div key={l} style={card}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>{l}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: c, fontFamily: 'JetBrains Mono' }}>{v}</div>
              </div>
            ))}
          </div>
          {/* Filter */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {[['all', 'All'], ['win', 'Win'], ['loss', 'Loss'], ['revenge', 'Revenge']].map(([v, l]) => (
              <button key={v} onClick={() => setFilter(v)} style={{ padding: '5px 14px', background: filter === v ? '#fff' : 'rgba(255,255,255,0.05)', border: `1px solid ${filter === v ? '#fff' : 'rgba(255,255,255,0.1)'}`, borderRadius: 20, color: filter === v ? '#000' : 'rgba(255,255,255,0.5)', fontFamily: 'Syne', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{l}</button>
            ))}
          </div>

          {/* MT4/MT5 Table */}
          <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, width: '100%', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.1fr 0.9fr 0.4fr 0.35fr 0.8fr 0.8fr 0.8fr 0.8fr 0.4fr 0.7fr 0.5fr 0.5fr 0.2fr', padding: '10px 14px', gap: 6, background: 'rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {['Open Date','Close Date','Symbol','Action','Lots','SL Price','TP Price','Open Price','Close Price','Pips','Net Profit','Duration','Gain','📸'].map(h => (
                <div key={h} style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: ['Pips','Net Profit','Gain'].includes(h) ? 'right' : 'left' }}>{h}</div>
              ))}
            </div>
            {filtered.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No trades yet</div>
            ) : filtered.map((tr) => {
              const pnlPos = (tr.pnl || 0) >= 0
              const pipVal = tr.exit_price && tr.entry ? Math.round(Math.abs(tr.exit_price - tr.entry) * (tr.pair?.includes('JPY') ? 100 : ['XAUUSD','XAGUSD'].includes(tr.pair) ? 1 : 10000)) : null
              const slHit = tr.exit_type === 'sl'
              const tpHit = tr.exit_type === 'tp'
              const isExpanded = expandedRow === tr.id
              const col = pnlPos ? '#00cc77' : '#ef4444'
              const COLS = '1.1fr 1.1fr 0.9fr 0.4fr 0.35fr 0.8fr 0.8fr 0.8fr 0.8fr 0.4fr 0.7fr 0.5fr 0.5fr 0.2fr'
              return (
                <div key={tr.id}>
                  <div style={{ display: 'grid', gridTemplateColumns: COLS, padding: '11px 14px', borderTop: '1px solid rgba(255,255,255,0.04)', alignItems: 'center', gap: 6, background: tr.is_revenge ? 'rgba(245,158,11,0.03)' : 'transparent' }}>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontFamily: 'JetBrains Mono', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tr.date}{tr.entry_time ? ' ' + fmtTime(tr.entry_time) : ''}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontFamily: 'JetBrains Mono', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tr.exit_time ? `${tr.date} ${fmtTime(tr.exit_time)}` : '—'}</div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: 12, fontWeight: 800, fontFamily: 'JetBrains Mono', color: '#fff', whiteSpace: 'nowrap' }}>{tr.pair}</div>
                      {tr.strategy && <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tr.strategy}</div>}
                    </div>
                    <div><span style={{ fontSize: 12, fontWeight: 700, color: tr.direction === 'BUY' ? '#00cc77' : '#ef4444' }}>{tr.direction === 'BUY' ? 'Buy' : 'Sell'}</span></div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: 'JetBrains Mono' }}>{tr.lot_size || '—'}</div>
                    <div style={{ padding: '2px 5px', borderRadius: 4, background: slHit ? 'rgba(239,68,68,0.12)' : 'transparent' }}>
                      <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: slHit ? '#ef4444' : 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tr.stop_loss?.toFixed(5) || '—'}</div>
                    </div>
                    <div style={{ padding: '2px 5px', borderRadius: 4, background: tpHit ? 'rgba(0,204,119,0.12)' : 'transparent' }}>
                      <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: tpHit ? '#00cc77' : 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tr.take_profit?.toFixed(5) || '—'}</div>
                    </div>
                    <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'rgba(255,255,255,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tr.entry?.toFixed(5) || '—'}</div>
                    <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'rgba(255,255,255,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tr.exit_price?.toFixed(5) || '—'}</div>
                    <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, color: col, fontFamily: 'JetBrains Mono' }}>{pipVal != null ? (pnlPos ? '+' : '-') + pipVal : '—'}</div>
                    <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 800, color: col, fontFamily: 'JetBrains Mono' }}>{pnlPos ? '+' : ''}{(tr.pnl || 0).toFixed(2)}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontFamily: 'JetBrains Mono', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fmtDuration(tr.duration_minutes)}</div>
                    <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, color: col, fontFamily: 'JetBrains Mono' }}>{tr.gains_percent != null ? `${tr.gains_percent >= 0 ? '+' : ''}${tr.gains_percent.toFixed(2)}%` : '—'}</div>
                    <div style={{ textAlign: 'center' }}>
                      <button onClick={() => setExpandedRow(isExpanded ? null : tr.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: tr.screenshots?.length ? '#00cc77' : 'rgba(255,255,255,0.2)', padding: 0 }}>
                        {isExpanded ? '▲' : '📷'}
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.02)', padding: '14px 16px', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      {tr.notes && (
                        <div style={{ flex: 1, minWidth: 180 }}>
                          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 700, marginBottom: 5, letterSpacing: 0.8 }}>NOTES</div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{tr.notes}</div>
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 700, marginBottom: 7, letterSpacing: 0.8 }}>SCREENSHOTS</div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          {(tr.screenshots || []).map((url, si) => (
                            <a key={si} href={url} target="_blank" rel="noreferrer">
                              <img src={url} alt={`sc${si+1}`} style={{ width: 180, height: 110, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }} />
                            </a>
                          ))}
                          {(tr.screenshots || []).length < 3 && (
                            <label style={{ width: 180, height: 110, borderRadius: 8, border: '1px dashed rgba(255,255,255,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: uploadingFor === tr.id ? 'wait' : 'pointer', color: 'rgba(255,255,255,0.3)' }}>
                              <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploadingFor === tr.id}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0]
                                  if (!file || !userId) return
                                  setUploadingFor(tr.id)
                                  try {
                                    const { createClient } = await import('@/lib/supabase')
                                    const supabase = createClient()
                                    const ext = file.name.split('.').pop()
                                    const path = `${userId}/${tr.id}/${Date.now()}.${ext}`
                                    const { error: upErr } = await supabase.storage.from('trade-screenshots').upload(path, file)
                                    if (upErr) throw upErr
                                    const { data: { publicUrl } } = supabase.storage.from('trade-screenshots').getPublicUrl(path)
                                    const newScreenshots = [...(tr.screenshots || []), publicUrl]
                                    await supabase.from('trades').update({ screenshots: newScreenshots }).eq('id', tr.id)
                                    loadAll()
                                  } catch(err) { console.error(err) }
                                  finally { setUploadingFor(null) }
                                }}
                              />
                              {uploadingFor === tr.id ? <span style={{ fontSize: 20 }}>⏳</span> : <span style={{ fontSize: 24 }}>+</span>}
                              <span style={{ fontSize: 10 }}>{uploadingFor === tr.id ? 'Uploading...' : 'Add screenshot'}</span>
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
      </div>
  )
}

// ─── PERFORMANCE TAB ─────────────────────────────────────────────
function PerformanceTab({ trades, profile }: { trades: any[], profile: any }) {
  const [chartTab, setChartTab] = useState<'growth'|'profit'|'drawdown'>('growth')

  const wins = trades.filter(t => t.result === 'win')
  const losses = trades.filter(t => t.result === 'loss')
  const longs = trades.filter(t => t.direction === 'BUY')
  const shorts = trades.filter(t => t.direction === 'SELL')
  const longsWon = longs.filter(t => t.result === 'win')
  const shortsWon = shorts.filter(t => t.result === 'win')

  const totalPnL = trades.reduce((s, t) => s + (t.pnl || 0), 0)
  const totalWinPnL = wins.reduce((s, t) => s + (t.pnl || 0), 0)
  const totalLossPnL = losses.reduce((s, t) => s + Math.abs(t.pnl || 0), 0)
  const winRate = trades.length ? Math.round(wins.length / trades.length * 100) : 0
  const avgWin = wins.length ? totalWinPnL / wins.length : 0
  const avgLoss = losses.length ? totalLossPnL / losses.length : 0
  const profitFactor = totalLossPnL > 0 ? parseFloat((totalWinPnL / totalLossPnL).toFixed(2)) : totalWinPnL > 0 ? 999 : 0
  const bestTrade = trades.reduce((b, t) => (t.pnl || 0) > (b?.pnl || -Infinity) ? t : b, trades[0])
  const worstTrade = trades.reduce((b, t) => (t.pnl || 0) < (b?.pnl || Infinity) ? t : b, trades[0])
  const totalLots = trades.reduce((s, t) => s + (t.lot_size || 0), 0)
  const avgDuration = trades.filter(t => t.duration_minutes).length
    ? trades.filter(t => t.duration_minutes).reduce((s, t) => s + t.duration_minutes, 0) / trades.filter(t => t.duration_minutes).length : 0
  const revengeCount = trades.filter(t => t.is_revenge).length
  const expectancy = ((winRate / 100) * avgWin) - ((1 - winRate / 100) * avgLoss)
  const initialBalance = profile?.account_balance || 10000
  const gain = initialBalance > 0 ? (totalPnL / initialBalance) * 100 : 0

  let peak = initialBalance, maxDD = 0, runningBal = initialBalance
  const balanceData: any[] = []
  trades.forEach(t => {
    runningBal += (t.pnl || 0)
    if (runningBal > peak) peak = runningBal
    const dd = peak > 0 ? ((peak - runningBal) / peak) * 100 : 0
    if (dd > maxDD) maxDD = dd
    balanceData.push({
      date: t.date,
      balance: parseFloat(runningBal.toFixed(2)),
      growth: parseFloat(((runningBal - initialBalance) / initialBalance * 100).toFixed(2)),
      drawdown: parseFloat((-dd).toFixed(2)),
    })
  })

  function fmtD(mins: number) {
    if (!mins) return '—'
    if (mins < 60) return `${Math.round(mins)}m`
    return `${Math.floor(mins/60)}h ${Math.round(mins%60)}m`
  }

  const now = new Date()
  const monthTrades = trades.filter(t => t.date?.startsWith(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`))
  const monthlyGain = monthTrades.reduce((s, t) => s + (t.gains_percent || 0), 0)
  const chartData = balanceData.length > 0 ? balanceData : [{ date: '—', balance: initialBalance, growth: 0, drawdown: 0 }]
  const c2 = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16 }

  const CustomTooltip = ({ active, payload, label: lbl }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0]
    return (
      <div style={{ background: '#0d0d18', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', fontFamily: 'JetBrains Mono', fontSize: 11 }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>{lbl}</div>
        <div style={{ color: d.value >= 0 ? '#00cc77' : '#ef4444', fontWeight: 700 }}>{d.value > 0 ? '+' : ''}{d.value}{chartTab !== 'profit' ? '%' : '$'}</div>
      </div>
    )
  }

  if (trades.length === 0) return (
    <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>No trades yet — zid trades lwel!</div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* TOP — Info + Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 12 }}>
        {/* Info */}
        <div style={{ ...c2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: 1.2, marginBottom: 8 }}>ACCOUNT</div>
          {[
            ['Gain', `${gain >= 0 ? '+' : ''}${gain.toFixed(2)}%`, gain >= 0 ? '#00cc77' : '#ef4444'],
            ['Monthly', `${monthlyGain.toFixed(2)}%`, monthlyGain >= 0 ? '#00cc77' : '#ef4444'],
            ['Drawdown', `${maxDD.toFixed(2)}%`, maxDD > 10 ? '#ef4444' : '#00cc77'],
            ['Balance', `$${(initialBalance + totalPnL).toFixed(2)}`, 'rgba(255,255,255,0.8)'],
            ['Profit', `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`, totalPnL >= 0 ? '#00cc77' : '#ef4444'],
            ['Deposits', `$${initialBalance.toFixed(2)}`, 'rgba(255,255,255,0.4)'],
          ].map(([k, v, c]) => (
            <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{k as string}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: c as string, fontFamily: 'JetBrains Mono' }}>{v as string}</span>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={c2}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {(['growth','profit','drawdown'] as const).map(tb => (
              <button key={tb} onClick={() => setChartTab(tb)} style={{ padding: '4px 12px', background: chartTab === tb ? 'rgba(0,204,119,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${chartTab === tb ? 'rgba(0,204,119,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 20, color: chartTab === tb ? '#00cc77' : 'rgba(255,255,255,0.35)', fontFamily: 'Syne', fontSize: 11, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize' }}>{tb}</button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartTab === 'drawdown' ? '#ef4444' : '#00cc77'} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={chartTab === 'drawdown' ? '#ef4444' : '#00cc77'} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.2)', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.2)', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey={chartTab === 'growth' ? 'growth' : chartTab === 'profit' ? 'balance' : 'drawdown'}
                stroke={chartTab === 'drawdown' ? '#ef4444' : '#00cc77'} fill="url(#perfGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* STATS TABLE */}
      <div style={c2}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: 1.2, marginBottom: 12 }}>TRADING STATISTICS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0 }}>
          <div style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}>
            {[
              ['Trades', trades.length],
              ['Profitability', null],
              ['Avg Win $', `+$${avgWin.toFixed(2)}`],
              ['Avg Loss $', `-$${avgLoss.toFixed(2)}`],
              ['Total Lots', totalLots.toFixed(2)],
              ['Revenge', revengeCount],
            ].map(([k, v]) => (
              <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{k as string}</span>
                {k === 'Profitability' ? (
                  <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <div style={{ width: Math.max(4, winRate * 0.5), height: 10, background: '#00cc77', borderRadius: '3px 0 0 3px' }} />
                    <div style={{ width: Math.max(4, (100-winRate)*0.5), height: 10, background: '#ef4444', borderRadius: '0 3px 3px 0' }} />
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginLeft: 5, fontFamily: 'JetBrains Mono' }}>{winRate}%</span>
                  </div>
                ) : <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontFamily: 'JetBrains Mono' }}>{v as string}</span>}
              </div>
            ))}
          </div>
          <div style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}>
            {[
              ['Longs Won', `(${longsWon.length}/${longs.length}) ${longs.length ? Math.round(longsWon.length/longs.length*100) : 0}%`],
              ['Shorts Won', `(${shortsWon.length}/${shorts.length}) ${shorts.length ? Math.round(shortsWon.length/shorts.length*100) : 0}%`],
              ['Best Trade', bestTrade ? `+$${(bestTrade.pnl||0).toFixed(2)}` : '—'],
              ['Worst Trade', worstTrade ? `-$${Math.abs(worstTrade.pnl||0).toFixed(2)}` : '—'],
              ['Avg Duration', fmtD(avgDuration)],
              ['Win Rate', `${winRate}%`],
            ].map(([k, v]) => (
              <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>{k as string}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: (k as string).includes('Best') ? '#00cc77' : (k as string).includes('Worst') ? '#ef4444' : 'rgba(255,255,255,0.7)', fontFamily: 'JetBrains Mono', textAlign: 'right' }}>{v as string}</span>
              </div>
            ))}
          </div>
          <div>
            {[
              ['Profit Factor', profitFactor >= 999 ? '∞' : profitFactor.toFixed(2), profitFactor >= 1.5 ? '#00cc77' : profitFactor >= 1 ? '#ffaa00' : '#ef4444'],
              ['Expectancy', `$${expectancy.toFixed(2)}`, expectancy >= 0 ? '#00cc77' : '#ef4444'],
              ['Max Drawdown', `${maxDD.toFixed(2)}%`, maxDD > 15 ? '#ef4444' : maxDD > 8 ? '#ffaa00' : '#00cc77'],
              ['Total PnL', `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`, totalPnL >= 0 ? '#00cc77' : '#ef4444'],
              ['Avg R:R', trades.filter(t=>t.planned_rr).length ? '1:' + (trades.filter(t=>t.planned_rr).reduce((s,t)=>s+(t.planned_rr||0),0)/trades.filter(t=>t.planned_rr).length).toFixed(1) : '—', '#00ccff'],
              ['Gain %', `${gain >= 0 ? '+' : ''}${gain.toFixed(2)}%`, gain >= 0 ? '#00cc77' : '#ef4444'],
            ].map(([k, v, c]) => (
              <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{k as string}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: (c as string), fontFamily: 'JetBrains Mono' }}>{v as string}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PAIR BREAKDOWN */}
      <div style={c2}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: 1.2, marginBottom: 12 }}>PERFORMANCE BY PAIR</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {Object.entries(
            trades.reduce((acc: Record<string, {wins:number,total:number,pnl:number}>, t) => {
              if (!acc[t.pair]) acc[t.pair] = { wins: 0, total: 0, pnl: 0 }
              acc[t.pair].total++
              if (t.result === 'win') acc[t.pair].wins++
              acc[t.pair].pnl += (t.pnl || 0)
              return acc
            }, {})
          ).sort((a, b) => b[1].pnl - a[1].pnl).map(([pair, s]) => {
            const wr = Math.round(s.wins / s.total * 100)
            const pos = s.pnl >= 0
            return (
              <div key={pair} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 70px 70px 80px', alignItems: 'center', gap: 12, padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 800, fontFamily: 'JetBrains Mono', color: '#fff' }}>{pair}</div>
                <div style={{ position: 'relative', height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${wr}%`, background: pos ? '#00cc77' : '#ef4444', borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'center', fontFamily: 'JetBrains Mono' }}>{s.total} trades</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontFamily: 'JetBrains Mono' }}>{wr}% WR</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: pos ? '#00cc77' : '#ef4444', textAlign: 'right', fontFamily: 'JetBrains Mono' }}>{pos ? '+' : ''}{s.pnl.toFixed(2)}$</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* STREAKS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: 1.2, marginBottom: 12 }}>🔥 CONSECUTIVE STREAKS</div>
          {(() => {
            let maxWin = 0, maxLoss = 0, curW = 0, curL = 0
            trades.forEach(t => {
              if (t.result === 'win') { curW++; curL = 0; if (curW > maxWin) maxWin = curW }
              else { curL++; curW = 0; if (curL > maxLoss) maxLoss = curL }
            })
            const curStreak = trades.length > 0 ? (trades[trades.length-1].result === 'win' ? curW : -curL) : 0
            return [
              ['Max Win Streak', maxWin + ' trades', '#00cc77'],
              ['Max Loss Streak', maxLoss + ' trades', '#ef4444'],
              ['Current Streak', curStreak >= 0 ? '+' + curStreak + ' wins' : Math.abs(curStreak) + ' losses', curStreak >= 0 ? '#00cc77' : '#ef4444'],
              ['Avg Win Duration', (() => { const wt = trades.filter(t => t.result === 'win' && t.duration_minutes); return wt.length ? Math.round(wt.reduce((s,t) => s+t.duration_minutes,0)/wt.length) + 'm' : '—' })(), '#00cc77'],
              ['Avg Loss Duration', (() => { const lt = trades.filter(t => t.result === 'loss' && t.duration_minutes); return lt.length ? Math.round(lt.reduce((s,t) => s+t.duration_minutes,0)/lt.length) + 'm' : '—' })(), '#ef4444'],
            ].map(([k,v,c]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{k}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: c, fontFamily: 'JetBrains Mono' }}>{v}</span>
              </div>
            ))
          })()}
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: 1.2, marginBottom: 12 }}>📐 R:R ACTUAL VS PLANNED</div>
          {(() => {
            const withRR = trades.filter(t => t.planned_rr && t.entry && t.stop_loss && t.exit_price)
            const actualRRs = withRR.map(t => {
              const risk = Math.abs(t.entry - t.stop_loss)
              const reward = Math.abs(t.exit_price - t.entry)
              return risk > 0 ? reward / risk : 0
            })
            const avgPlanned = withRR.length ? withRR.reduce((s,t) => s+(t.planned_rr||0),0)/withRR.length : 0
            const avgActual = actualRRs.length ? actualRRs.reduce((s,r) => s+r,0)/actualRRs.length : 0
            const rrWins = withRR.filter((t,i) => actualRRs[i] >= (t.planned_rr||0))
            return [
              ['Avg Planned R:R', avgPlanned > 0 ? '1:' + avgPlanned.toFixed(2) : '—', '#fff'],
              ['Avg Actual R:R', avgActual > 0 ? '1:' + avgActual.toFixed(2) : '—', avgActual >= avgPlanned ? '#00cc77' : '#ef4444'],
              ['Trades w/ R:R data', withRR.length + '', '#00ccff'],
              ['Met R:R target', rrWins.length + '/' + withRR.length, rrWins.length >= withRR.length/2 ? '#00cc77' : '#ef4444'],
              ['R:R efficiency', withRR.length ? Math.round(rrWins.length/withRR.length*100) + '%' : '—', '#ffaa00'],
            ].map(([k,v,c]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{k}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: c, fontFamily: 'JetBrains Mono' }}>{v}</span>
              </div>
            ))
          })()}
        </div>
      </div>

      {/* BEST/WORST DAY OF WEEK */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: 1.2, marginBottom: 12 }}>📅 PERFORMANCE BY DAY OF WEEK</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day, i) => {
            const dt = trades.filter(t => t.date && new Date(t.date).getDay() === i)
            if (dt.length === 0) return (
              <div key={day} style={{ padding: '10px 8px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.2)' }}>{day}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.1)', marginTop: 4 }}>—</div>
              </div>
            )
            const wr = Math.round(dt.filter(t => t.result === 'win').length / dt.length * 100)
            const pnl = dt.reduce((s,t) => s+(t.pnl||0), 0)
            return (
              <div key={day} style={{ padding: '10px 8px', background: wr >= 60 ? 'rgba(0,204,119,0.06)' : wr >= 40 ? 'rgba(255,170,0,0.06)' : 'rgba(239,68,68,0.06)', borderRadius: 8, textAlign: 'center', border: '1px solid ' + (wr >= 60 ? 'rgba(0,204,119,0.2)' : wr >= 40 ? 'rgba(255,170,0,0.2)' : 'rgba(239,68,68,0.2)') }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{day}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: wr >= 60 ? '#00cc77' : wr >= 40 ? '#ffaa00' : '#ef4444', fontFamily: 'JetBrains Mono', marginTop: 4 }}>{wr}%</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{dt.length} trades</div>
                <div style={{ fontSize: 10, color: pnl >= 0 ? '#00cc77' : '#ef4444', fontFamily: 'JetBrains Mono', marginTop: 2 }}>{pnl >= 0 ? '+' : ''}${pnl.toFixed(0)}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* MONTHLY BREAKDOWN */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: 1.2, marginBottom: 12 }}>📆 MONTHLY BREAKDOWN</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'JetBrains Mono' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Month','Trades','Win Rate','Net PnL','Avg PnL','Best','Worst'].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: 1 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(trades.reduce((acc: any, t) => {
              const m = t.date?.slice(0,7) || 'Unknown'
              if (!acc[m]) acc[m] = { wins: 0, total: 0, pnl: 0, best: -Infinity, worst: Infinity }
              acc[m].total++
              if (t.result === 'win') acc[m].wins++
              acc[m].pnl += (t.pnl||0)
              if ((t.pnl||0) > acc[m].best) acc[m].best = t.pnl||0
              if ((t.pnl||0) < acc[m].worst) acc[m].worst = t.pnl||0
              return acc
            }, {})).sort((a,b) => b[0].localeCompare(a[0])).map(([month, s]: any) => {
              const wr = Math.round(s.wins/s.total*100)
              return (
                <tr key={month} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '8px 12px', color: '#fff', fontWeight: 700 }}>{month}</td>
                  <td style={{ padding: '8px 12px', color: 'rgba(255,255,255,0.5)' }}>{s.total}</td>
                  <td style={{ padding: '8px 12px', color: wr >= 60 ? '#00cc77' : wr >= 40 ? '#ffaa00' : '#ef4444' }}>{wr}%</td>
                  <td style={{ padding: '8px 12px', color: s.pnl >= 0 ? '#00cc77' : '#ef4444' }}>{s.pnl >= 0 ? '+' : ''}${s.pnl.toFixed(2)}</td>
                  <td style={{ padding: '8px 12px', color: (s.pnl/s.total) >= 0 ? '#00cc77' : '#ef4444' }}>{(s.pnl/s.total) >= 0 ? '+' : ''}${(s.pnl/s.total).toFixed(2)}</td>
                  <td style={{ padding: '8px 12px', color: '#00cc77' }}>+${s.best.toFixed(2)}</td>
                  <td style={{ padding: '8px 12px', color: '#ef4444' }}>${s.worst.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>



      {/* DISCIPLINE ANALYSIS */}
      <div style={c2}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: 1.2, marginBottom: 16 }}>🧠 DISCIPLINE ANALYSIS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>

          {/* REVENGE DNA */}
          <div style={{ background: 'rgba(255,68,102,0.05)', border: '1px solid rgba(255,68,102,0.15)', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#ff4466', marginBottom: 12, letterSpacing: 0.8 }}>🔴 REVENGE TRADE DNA</div>
            {(() => {
              const revTrades = trades.filter(t => t.is_revenge)
              const revCost = revTrades.reduce((s, t) => s + (t.pnl || 0), 0)
              const revWR = revTrades.length ? Math.round(revTrades.filter(t => t.result === 'win').length / revTrades.length * 100) : 0
              const pairRevenge = revTrades.reduce((acc: Record<string, number>, t) => { acc[t.pair] = (acc[t.pair] || 0) + 1; return acc }, {})
              const topRevPairs = Object.entries(pairRevenge).sort((a, b) => b[1] - a[1]).slice(0, 3)
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Total Revenge</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: revTrades.length > 0 ? '#ff4466' : '#00cc77', fontFamily: 'JetBrains Mono' }}>{revTrades.length} trades</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Cost $</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: revCost >= 0 ? '#00cc77' : '#ff4466', fontFamily: 'JetBrains Mono' }}>{revCost >= 0 ? '+' : ''}{revCost.toFixed(2)}$</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Win Rate</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: revWR >= 50 ? '#00cc77' : '#ff4466', fontFamily: 'JetBrains Mono' }}>{revWR}%</span>
                  </div>
                  {topRevPairs.length > 0 && (
                    <div style={{ marginTop: 4, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginBottom: 5 }}>TOP PAIRS</div>
                      {topRevPairs.map(([pair, count]) => (
                        <div key={pair} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                          <span style={{ fontSize: 11, color: '#ff4466', fontFamily: 'JetBrains Mono' }}>{pair}</span>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono' }}>{count}x</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {revTrades.length === 0 && <div style={{ fontSize: 11, color: '#00cc77', textAlign: 'center', marginTop: 4 }}>✓ No revenge trades!</div>}
                </div>
              )
            })()}
          </div>

          {/* OVERTRADING */}
          <div style={{ background: 'rgba(255,170,0,0.05)', border: '1px solid rgba(255,170,0,0.15)', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#ffaa00', marginBottom: 12, letterSpacing: 0.8 }}>📈 OVERTRADING</div>
            {(() => {
              const byDay = trades.reduce((acc: Record<string, any[]>, t) => { if (!acc[t.date]) acc[t.date] = []; acc[t.date].push(t); return acc }, {})
              const days = Object.entries(byDay)
              const optimalDay = days.filter(([, ts]) => ts.length <= 2)
              const overtradeDays = days.filter(([, ts]) => ts.length >= 4)
              const optWR = optimalDay.length ? Math.round(optimalDay.flatMap(([, ts]) => ts).filter(t => t.result === 'win').length / optimalDay.flatMap(([, ts]) => ts).length * 100) : 0
              const overWR = overtradeDays.length ? Math.round(overtradeDays.flatMap(([, ts]) => ts).filter(t => t.result === 'win').length / Math.max(1, overtradeDays.flatMap(([, ts]) => ts).length) * 100) : 0
              const avgPerDay = days.length ? (trades.length / days.length).toFixed(1) : '—'
              const maxDay = days.reduce((b, [d, ts]) => ts.length > b.count ? { date: d, count: ts.length } : b, { date: '—', count: 0 })
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Avg trades/day</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', fontFamily: 'JetBrains Mono' }}>{avgPerDay}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>1-2 trades WR</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#00cc77', fontFamily: 'JetBrains Mono' }}>{optWR}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>4+ trades WR</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: overWR < optWR ? '#ff4466' : '#00cc77', fontFamily: 'JetBrains Mono' }}>{overWR}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Max in 1 day</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: maxDay.count >= 5 ? '#ff4466' : '#ffaa00', fontFamily: 'JetBrains Mono' }}>{maxDay.count} trades</span>
                  </div>
                  {overtradeDays.length > 0 && overWR < optWR && (
                    <div style={{ marginTop: 4, padding: '6px 10px', background: 'rgba(255,68,102,0.08)', borderRadius: 6, fontSize: 10, color: '#ff4466', lineHeight: 1.5 }}>
                      ⚠ Overtrading kaykhfed win rate dyalek {optWR - overWR}%
                    </div>
                  )}
                  {overtradeDays.length === 0 && <div style={{ fontSize: 11, color: '#00cc77', textAlign: 'center', marginTop: 4 }}>✓ No overtrading!</div>}
                </div>
              )
            })()}
          </div>

          {/* LOT SIZE RISK */}
          <div style={{ background: 'rgba(0,204,255,0.05)', border: '1px solid rgba(0,204,255,0.15)', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#00ccff', marginBottom: 12, letterSpacing: 0.8 }}>🎰 LOT SIZE RISK</div>
            {(() => {
              const balance = profile?.account_balance || 10000
              const riskPct = profile?.risk_percent || 1
              const maxSafeLot = parseFloat(((balance * (riskPct / 100)) / 100).toFixed(2))
              const bigLots = trades.filter(t => (t.lot_size || 0) > maxSafeLot * 2)
              const bigLotCost = bigLots.reduce((s, t) => s + (t.pnl || 0), 0)
              const avgLot = trades.length ? totalLots / trades.length : 0
              const lotVariance = trades.length > 1 ? Math.sqrt(trades.reduce((s, t) => s + Math.pow((t.lot_size || 0) - avgLot, 2), 0) / trades.length) : 0
              const consistency = lotVariance < 0.05 ? 'Excellent' : lotVariance < 0.1 ? 'Good' : lotVariance < 0.2 ? 'Variable' : 'Inconsistent'
              const consistencyColor = lotVariance < 0.05 ? '#00cc77' : lotVariance < 0.1 ? '#00cc77' : lotVariance < 0.2 ? '#ffaa00' : '#ff4466'
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Avg lot size</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', fontFamily: 'JetBrains Mono' }}>{avgLot.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Max safe lot</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#00ccff', fontFamily: 'JetBrains Mono' }}>{maxSafeLot}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Oversized trades</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: bigLots.length > 0 ? '#ff4466' : '#00cc77', fontFamily: 'JetBrains Mono' }}>{bigLots.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Consistency</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: consistencyColor, fontFamily: 'JetBrains Mono' }}>{consistency}</span>
                  </div>
                  {bigLots.length > 0 && (
                    <div style={{ marginTop: 4, padding: '6px 10px', background: 'rgba(255,68,102,0.08)', borderRadius: 6, fontSize: 10, color: '#ff4466', lineHeight: 1.5 }}>
                      ⚠ {bigLots.length} trades b lot kbar — impact: {bigLotCost >= 0 ? '+' : ''}{bigLotCost.toFixed(2)}$
                    </div>
                  )}
                  {bigLots.length === 0 && <div style={{ fontSize: 11, color: '#00cc77', textAlign: 'center', marginTop: 4 }}>✓ Lot size consistent!</div>}
                </div>
              )
            })()}
          </div>

        </div>
      </div>
    </div>
  )
}
