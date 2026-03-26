'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Trade {
  id: string; date: string; pair: string; direction: string
  entry: number; stop_loss: number; take_profit: number
  lot_size: number; pnl: number; result: string
  strategy: string; mood: number; planned_rr: number
  is_revenge: boolean; notes: string; created_at: string
}

const MOODS = ['🤬','😤','😐','😌','🧠']

function fmt(n: number) {
  const a = Math.abs(n)
  return (n < 0 ? '-' : '+') + (a >= 1000 ? `$${(a/1000).toFixed(1)}K` : `$${a.toFixed(0)}`)
}

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'analytics' | 'trades'>('analytics')
  const [filter, setFilter] = useState('all')
  const router = useRouter()

  useEffect(() => {
    loadTrades()
  }, [])

  async function loadTrades() {
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }
    const { data } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setTrades(data || [])
    setLoading(false)
  }

  const filtered = filter === 'all' ? trades : filter === 'win' ? trades.filter(t => t.result === 'win') : filter === 'loss' ? trades.filter(t => t.result === 'loss') : trades.filter(t => t.is_revenge)

  // Analytics
  const wins = trades.filter(t => t.result === 'win').length
  const losses = trades.filter(t => t.result === 'loss').length
  const totalPnL = trades.reduce((s, t) => s + (t.pnl || 0), 0)
  const winRate = trades.length ? Math.round(wins / trades.length * 100) : 0
  const avgRR = trades.filter(t => t.planned_rr).length ? parseFloat((trades.filter(t => t.planned_rr).reduce((s, t) => s + t.planned_rr, 0) / trades.filter(t => t.planned_rr).length).toFixed(2)) : 0

  // Best pair
  const pairPnL: Record<string, number> = {}
  trades.forEach(t => { if (!pairPnL[t.pair]) pairPnL[t.pair] = 0; pairPnL[t.pair] += t.pnl || 0 })
  const sortedPairs = Object.entries(pairPnL).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const bestPair = sortedPairs[0]?.[0] || '—'
  const maxPairPnL = Math.max(...sortedPairs.map(p => Math.abs(p[1])), 1)

  // Strategy performance
  const stratWins: Record<string, { w: number; t: number }> = {}
  trades.forEach(t => {
    if (!t.strategy) return
    if (!stratWins[t.strategy]) stratWins[t.strategy] = { w: 0, t: 0 }
    stratWins[t.strategy].t++
    if (t.result === 'win') stratWins[t.strategy].w++
  })
  const sortedStrats = Object.entries(stratWins).sort((a, b) => (b[1].w/b[1].t) - (a[1].w/a[1].t)).slice(0, 4)

  // Mood win rate
  const moodStats: Record<number, { w: number; t: number }> = {}
  trades.forEach(t => {
    if (!t.mood) return
    if (!moodStats[t.mood]) moodStats[t.mood] = { w: 0, t: 0 }
    moodStats[t.mood].t++
    if (t.result === 'win') moodStats[t.mood].w++
  })

  // Day of week
  const dowStats: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0 }
  const dowNames: Record<number, string> = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri' }
  trades.filter(t => t.result === 'win').forEach(t => {
    const dow = new Date(t.date).getDay()
    if (dowNames[dow]) dowStats[dowNames[dow]]++
  })
  const maxDow = Math.max(...Object.values(dowStats), 1)

  // PnL curve (cumulative)
  const pnlCurve = [...trades].reverse().reduce((acc: number[], t) => {
    const last = acc.length ? acc[acc.length - 1] : 0
    acc.push(last + (t.pnl || 0))
    return acc
  }, [])
  const maxPnL = Math.max(...pnlCurve, 1)
  const minPnL = Math.min(...pnlCurve, 0)
  const pnlRange = maxPnL - minPnL || 1
  const curvePoints = pnlCurve.map((v, i) => {
    const x = trades.length > 1 ? (i / (trades.length - 1)) * 280 : 140
    const y = 70 - ((v - minPnL) / pnlRange) * 60
    return `${x},${y}`
  }).join(' ')

  const s = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16 }

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'Syne, sans-serif' }}>
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }` }} />

      {/* NAV */}
      <div style={{ background: '#000', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, color: 'rgba(255,255,255,0.4)', padding: '6px 12px', cursor: 'pointer', fontSize: 13, fontFamily: 'Syne' }}>← Dashboard</button>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: 1 }}>Trade History</span>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{trades.length} trades total</div>
      </div>

      <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>

        {/* TABS */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 4, marginBottom: 24, width: 'fit-content' }}>
          {(['analytics', 'trades'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 24px', background: tab === t ? '#fff' : 'none', border: 'none', borderRadius: 8, color: tab === t ? '#000' : 'rgba(255,255,255,0.4)', fontFamily: 'Syne', fontWeight: 700, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize', transition: 'all .2s' }}>{t}</button>
          ))}
        </div>

        {tab === 'analytics' ? (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginBottom: 20 }}>
              {[
                ['TOTAL PNL', fmt(totalPnL), totalPnL >= 0 ? '#00cc77' : '#ef4444'],
                ['WIN RATE', winRate + '%', '#fff'],
                ['TRADES', trades.length, '#fff'],
                ['BEST PAIR', bestPair, '#fff'],
                ['AVG R:R', '1:' + avgRR, '#fff'],
              ].map(([l, v, c]) => (
                <div key={l as string} style={s}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>{l}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: c as string, fontFamily: 'JetBrains Mono' }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Charts row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12, marginBottom: 12 }}>

              {/* PnL Curve */}
              <div style={s}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>PNL CURVE</div>
                {pnlCurve.length > 1 ? (
                  <svg width="100%" height="100" viewBox="0 0 280 80" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00cc77" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#00cc77" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <polyline points={curvePoints} fill="none" stroke="#00cc77" strokeWidth="2"/>
                    <polygon points={`0,70 ${curvePoints} 280,70`} fill="url(#g1)"/>
                  </svg>
                ) : <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No data yet</div>}
              </div>

              {/* Win/Loss */}
              <div style={s}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>WIN / LOSS</div>
                <svg width="90" height="90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(239,68,68,0.3)" strokeWidth="20"/>
                  {wins > 0 && <circle cx="50" cy="50" r="40" fill="none" stroke="#00cc77" strokeWidth="20"
                    strokeDasharray={`${(wins/trades.length)*251} 251`} strokeDashoffset="0" transform="rotate(-90 50 50)"/>}
                  <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="800" fill="#fff" fontFamily="JetBrains Mono">{winRate}%</text>
                </svg>
                <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                  <span style={{ fontSize: 11, color: '#00cc77' }}>● Win {wins}</span>
                  <span style={{ fontSize: 11, color: '#ef4444' }}>● Loss {losses}</span>
                </div>
              </div>

              {/* Best pairs */}
              <div style={s}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>TOP PAIRS</div>
                {sortedPairs.length === 0 ? <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>No data</div> :
                  sortedPairs.map(([pair, pnl]) => (
                    <div key={pair} style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'JetBrains Mono' }}>{pair}</span>
                        <span style={{ color: pnl >= 0 ? '#00cc77' : '#ef4444' }}>{fmt(pnl)}</span>
                      </div>
                      <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                        <div style={{ height: '100%', width: `${(Math.abs(pnl) / maxPairPnL) * 100}%`, background: pnl >= 0 ? '#00cc77' : '#ef4444', borderRadius: 2 }} />
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Charts row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>

              {/* Strategy */}
              <div style={s}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>STRATEGY WIN RATE</div>
                {sortedStrats.length === 0 ? <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>No data</div> :
                  sortedStrats.map(([strat, { w, t }]) => {
                    const wr2 = Math.round(w / t * 100)
                    return (
                      <div key={strat} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <div style={{ flex: 1, fontSize: 11, color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{strat}</div>
                        <div style={{ width: 60, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                          <div style={{ height: '100%', width: `${wr2}%`, background: '#8b5cf6', borderRadius: 2 }} />
                        </div>
                        <div style={{ fontSize: 11, color: '#8b5cf6', fontFamily: 'JetBrains Mono', width: 32, textAlign: 'right' }}>{wr2}%</div>
                      </div>
                    )
                  })
                }
              </div>

              {/* Mood */}
              <div style={s}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>MOOD VS WIN RATE</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
                  {[1,2,3,4,5].map(m => {
                    const ms = moodStats[m]
                    const wr2 = ms ? Math.round(ms.w / ms.t * 100) : 0
                    const h = ms ? Math.max(8, wr2 * 0.7) : 4
                    return (
                      <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        {ms && <div style={{ fontSize: 10, color: '#00cc77' }}>{wr2}%</div>}
                        <div style={{ width: '100%', height: h, background: ms ? '#00cc77' : 'rgba(255,255,255,0.1)', borderRadius: '4px 4px 0 0', opacity: ms ? 0.8 : 0.3 }} />
                        <div style={{ fontSize: 16 }}>{MOODS[m-1]}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Day of week */}
              <div style={s}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>BEST DAY OF WEEK</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
                  {Object.entries(dowStats).map(([day, count]) => {
                    const h = Math.max(4, (count / maxDow) * 64)
                    return (
                      <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: '100%', height: h, background: 'rgba(0,204,119,0.6)', borderRadius: '4px 4px 0 0' }} />
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{day}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Filter */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
              {[['all','All'],['win','Wins'],['loss','Losses'],['revenge','Revenge']].map(([v, l]) => (
                <button key={v} onClick={() => setFilter(v)} style={{ padding: '6px 16px', background: filter === v ? '#fff' : 'rgba(255,255,255,0.05)', border: `1px solid ${filter === v ? '#fff' : 'rgba(255,255,255,0.1)'}`, borderRadius: 20, color: filter === v ? '#000' : 'rgba(255,255,255,0.5)', fontFamily: 'Syne', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{l} {v === 'all' ? trades.length : v === 'win' ? wins : v === 'loss' ? losses : trades.filter(t => t.is_revenge).length}</button>
              ))}
            </div>

            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '110px 60px minmax(0,1fr) 100px 90px 50px 110px', gap: 0, background: 'rgba(255,255,255,0.04)', padding: '10px 16px', borderRadius: '10px 10px 0 0', border: '1px solid rgba(255,255,255,0.07)', borderBottom: 'none' }}>
              {['Pair','Dir','Entry / SL / TP','Lot / R:R','Date','Mood','Result'].map(h => (
                <div key={h} style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>{h}</div>
              ))}
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.07)', borderTop: 'none', borderRadius: '0 0 10px 10px' }}>Loading...</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.07)', borderTop: 'none', borderRadius: '0 0 10px 10px' }}>No trades yet</div>
            ) : (
              <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderTop: 'none', borderRadius: '0 0 10px 10px', overflow: 'hidden' }}>
                {filtered.map((trade, i) => (
                  <div key={trade.id} style={{ display: 'grid', gridTemplateColumns: '110px 60px minmax(0,1fr) 100px 90px 50px 110px', gap: 0, padding: '12px 16px', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems: 'center', background: trade.is_revenge ? 'rgba(245,158,11,0.04)' : 'transparent' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, fontFamily: 'JetBrains Mono', color: '#fff' }}>{trade.pair}</div>
                      {trade.strategy && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trade.strategy}</div>}
                    </div>
                    <div><span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: trade.direction === 'BUY' ? 'rgba(0,204,119,0.12)' : 'rgba(239,68,68,0.12)', color: trade.direction === 'BUY' ? '#00cc77' : '#ef4444', fontWeight: 700 }}>{trade.direction}</span></div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trade.entry?.toFixed(5)||'—'} / {trade.stop_loss?.toFixed(5)||'—'} / {trade.take_profit?.toFixed(5)||'—'}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono' }}>{trade.lot_size||'—'} / {trade.planned_rr ? '1:'+trade.planned_rr : '—'}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{trade.date}</div>
                    <div style={{ fontSize: 20 }}>{trade.mood ? MOODS[trade.mood-1] : '—'}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: (trade.pnl||0) >= 0 ? '#00cc77' : '#ef4444', fontFamily: 'JetBrains Mono' }}>{fmt(trade.pnl||0)}</span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: trade.result === 'win' ? '#00cc77' : '#ef4444', color: '#000', fontWeight: 700 }}>{trade.result?.toUpperCase()}</span>
                        {trade.is_revenge && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(245,158,11,0.2)', color: '#f59e0b', fontWeight: 700 }}>⚠</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
