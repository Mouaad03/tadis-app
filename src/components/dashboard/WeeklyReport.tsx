'use client'
import { useState, useEffect } from 'react'
import { getLang } from '@/lib/i18n'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'

interface Props { userId?: string; profile?: any; demoTrades?: any[] }

export default function WeeklyReport({ userId, profile, demoTrades }: Props) {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly')
  const [report, setReport] = useState('')
  const [stats, setStats] = useState<any>(null)
  const [trades, setTrades] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [savedAt, setSavedAt] = useState('')
  const [history, setHistory] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [lang, setLang] = useState('en')

  useEffect(() => {
    setLang(getLang())
    function onS() { setLang(getLang()) }
    window.addEventListener('storage', onS)
    return () => window.removeEventListener('storage', onS)
  }, [])

  // Auto-load report when period or userId changes
  useEffect(() => {
    setReport(''); setStats(null); setLoaded(false); setSavedAt(''); setTrades([])
    setShowHistory(false)
    if (userId) {
      // Monthly always shows list first
      if (period === 'monthly') return
      // Check session cache first
      const startD = (() => { const s = new Date(); s.setDate(s.getDate()-s.getDay()); return s.toISOString().split('T')[0] })()
      const cacheKey = 'tradis_report_' + userId + '_' + period + '_' + startD
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) {
        try {
          const p = JSON.parse(cached)
          if (p.report && p.report.length > 20 && p.stats?.trades > 0) {
            setReport(p.report); setStats(p.stats); setLoaded(true); setSavedAt(p.savedAt)
            loadPeriodTrades().then(t => setTrades(t))
            return
          }
        } catch(e) {}
      }
      autoLoadReport()
    }
  }, [period, userId])

  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12, padding: 16, marginBottom: 14
  }

  function getStartDate() {
    const now = new Date()
    if (period === 'monthly') {
      return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`
    }
    const sunday = new Date()
    sunday.setDate(sunday.getDate() - sunday.getDay())
    sunday.setHours(0,0,0,0)
    return sunday.toISOString().split('T')[0]
  }

  async function loadPeriodTrades() {
    if (!userId) return []
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const { data } = await supabase.from('trades').select('*')
      .eq('user_id', userId).gte('date', getStartDate())
      .order('date', { ascending: true })
    return data || []
  }

  async function autoLoadReport() {
    if (!userId) return
    // Check DB first
    try {
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      const startD = getStartDate()
      const { data: existing } = await supabase.from('reports')
        .select('*').eq('user_id', userId).eq('period', period)
        .eq('period', period).order('created_at', { ascending: false }).limit(1).maybeSingle()
      if (existing && existing.report && existing.report.length > 20 && existing.stats?.trades > 0) {
        setReport(existing.report); setStats(existing.stats); setLoaded(true); setSavedAt(existing.created_at)
        const t = await loadPeriodTrades(); setTrades(t)
        // Save to session cache
        const ck = 'tradis_report_' + userId + '_' + period + '_' + (period === 'monthly' ? new Date().getFullYear() + '-' + String(new Date().getMonth()+1).padStart(2,'0') : getStartDate())
        sessionStorage.setItem(ck, JSON.stringify({ report: existing.report, stats: existing.stats, savedAt: existing.created_at }))
        return
      }
    } catch(e) { console.error(e) }
    setLoading(true)
    try {
      const currentLang = getLang()
      const url = `/api/weekly-report?userId=${userId}&period=${period}&lang=${currentLang}&forceNew=false`
      const res = await fetch(url)
      const data = await res.json()
      if (data.error) { setLoading(false); return }
      if (data.report && data.stats?.trades > 0) {
        setReport(data.report)
        setStats(data.stats || null)
        setSavedAt(data.savedAt || '')
        setLoaded(true)
        const periodTrades = await loadPeriodTrades()
        setTrades(periodTrades)
        // Save + notify only if new report
        if (!data.fromCache) {
          try {
            const { createClient } = await import('@/lib/supabase')
            const supabase = createClient()
            const now = new Date()
            await supabase.from('reports').insert({
              user_id: userId, period, report: data.report, stats: data.stats,
              period_start: getStartDate(), period_end: now.toISOString().split('T')[0], lang: currentLang
            })
            // Notification
            const { notify } = await import('@/components/ui/NotificationSystem')
            notify({
              type: 'success',
              title: period === 'weekly' ? '📊 Weekly Report Ready!' : '📅 Monthly Report Ready!',
              message: period === 'weekly'
                ? 'Weekly report dyalek dyal had l-isbu3 kayn — check it out!'
                : 'Monthly report dyalek dyal had sh-shhar kayn — check it out!',
              duration: 8000
            })
          } catch(e) { console.error('Save error:', e) }
        }
      }
    } catch(e) { console.error('Auto-load error:', e) }
    setLoading(false)
  }

  async function loadHistory() {
    if (!userId) return
    try {
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      const { data } = await supabase.from('reports')
        .select('*').eq('user_id', userId).eq('period', period)
        .order('created_at', { ascending: false }).limit(10)
      setHistory(data || [])
      setShowHistory(true)
    } catch(e) { console.error(e) }
  }

  // Chart data
  const pnlChartData = trades.map((t, i) => ({
    name: `${t.pair}`,
    pnl: t.pnl || 0,
    cumPnL: trades.slice(0, i+1).reduce((s, x) => s + (x.pnl || 0), 0),
  }))

  const disciplineData = trades.map(t => ({
    name: t.pair,
    score: t.is_revenge ? 40 : t.is_strategy_break ? 60 : 100,
  }))

  const pairData = Object.entries(
    trades.reduce((acc: any, t) => {
      if (!acc[t.pair]) acc[t.pair] = { wins: 0, total: 0 }
      acc[t.pair].total++
      if (t.result === 'win') acc[t.pair].wins++
      return acc
    }, {})
  ).map(([pair, s]: any) => ({ pair, wr: Math.round(s.wins/s.total*100) }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: '#0d0d18', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', fontFamily: 'JetBrains Mono', fontSize: 11 }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>{label}</div>
        {payload.map((p: any, i: number) => (
          <div key={i} style={{ color: p.value >= 0 ? '#00cc77' : '#ff4466', fontWeight: 700 }}>
            {p.name}: {p.value > 0 ? '+' : ''}{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
          </div>
        ))}
      </div>
    )
  }

  const periodLabel = period === 'weekly' ? 'Week' : 'Month'

  return (
    <div style={{ fontFamily: 'Syne, sans-serif' }}>

      {/* Tabs + History */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 4 }}>
          {(['weekly', 'monthly'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ padding: '8px 28px', background: period === p ? '#fff' : 'none', border: 'none', borderRadius: 8, color: period === p ? '#000' : 'rgba(255,255,255,0.4)', fontFamily: 'Syne', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              {p === 'weekly' ? 'Weekly' : 'Monthly'}
            </button>
          ))}
        </div>

      </div>

      {/* History */}
      {showHistory && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2 }}>REPORT HISTORY — {periodLabel.toUpperCase()}</div>
            <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 14 }}>×</button>
          </div>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No saved reports yet</div>
          ) : history.map((r, i) => (
            <div key={i} onClick={async () => {
                setReport(r.report); setStats(r.stats); setLoaded(true); setSavedAt(r.created_at); setShowHistory(false)
                const t = await loadPeriodTrades(); setTrades(t)
              }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, marginBottom: 6, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{r.period_start} → {r.period_end}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>WR: {r.stats?.winRate}% | PnL: ${r.stats?.totalPnL?.toFixed(2)} | {r.lang?.toUpperCase()}</div>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{new Date(r.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono', marginBottom: 12 }}>
            🤖 Generating {period} report in {lang.toUpperCase()}...
          </div>
          <div style={{ height: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 1, overflow: 'hidden', maxWidth: 300, margin: '0 auto' }}>
            <div style={{ height: '100%', background: '#00cc77', animation: 'progress 2s infinite', width: '60%' }} />
          </div>
          <style>{`@keyframes progress { 0%{margin-left:-60%} 100%{margin-left:100%} }`}</style>
        </div>
      )}

      {/* No trades message */}
      {!loading && !loaded && (
        <AutoHistory userId={userId} period={period} onSelect={(r: any) => { setReport(r.report); setStats(r.stats); setLoaded(true); setSavedAt(r.created_at) }} />
      )}

      {/* Stats + Charts + Report */}
      {!loading && loaded && (
        <>
          {/* Stats Cards */}
          {stats && stats.trades > 0 && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 14 }}>
                {[
                  { label: 'Win Rate', val: stats.winRate + '%', color: stats.winRate >= 60 ? '#00cc77' : stats.winRate >= 40 ? '#ffaa00' : '#ff4466' },
                  { label: 'Net P&L', val: (stats.totalPnL >= 0 ? '+' : '') + stats.totalPnL?.toFixed(2) + '$', color: stats.totalPnL >= 0 ? '#00cc77' : '#ff4466' },
                  { label: 'Discipline', val: stats.disciplineScore + '/100', color: stats.disciplineScore > 70 ? '#00cc77' : stats.disciplineScore > 40 ? '#ffaa00' : '#ff4466' },
                  { label: 'Trades', val: stats.trades, color: '#00ccff' },
                ].map(s => (
                  <div key={s.label} style={card}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: 'JetBrains Mono' }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4, letterSpacing: 1 }}>{s.label.toUpperCase()}</div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              {trades.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div style={card}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, marginBottom: 12 }}>📈 CUMULATIVE P&L</div>
                    <ResponsiveContainer width="100%" height={150}>
                      <AreaChart data={pnlChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00cc77" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#00cc77" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="name" tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.2)' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.2)' }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="cumPnL" name="Cum. P&L" stroke="#00cc77" fill="url(#pg)" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={card}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, marginBottom: 12 }}>💹 P&L PER TRADE</div>
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={pnlChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="name" tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.2)' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.2)' }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="pnl" name="P&L" radius={[3,3,0,0]}>
                          {pnlChartData.map((e, i) => <Cell key={i} fill={e.pnl >= 0 ? '#00cc77' : '#ff4466'} fillOpacity={0.8} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={card}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, marginBottom: 12 }}>🧠 DISCIPLINE PER TRADE</div>
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={disciplineData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="name" tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.2)' }} tickLine={false} axisLine={false} />
                        <YAxis domain={[0,100]} tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.2)' }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="score" name="Score" radius={[3,3,0,0]}>
                          {disciplineData.map((e, i) => <Cell key={i} fill={e.score === 100 ? '#00cc77' : e.score === 60 ? '#ffaa00' : '#ff4466'} fillOpacity={0.8} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={card}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, marginBottom: 12 }}>🏆 WIN RATE BY PAIR</div>
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={pairData} layout="vertical" margin={{ top: 4, right: 30, left: 20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis type="number" domain={[0,100]} tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.2)' }} tickLine={false} axisLine={false} />
                        <YAxis type="category" dataKey="pair" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} width={55} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="wr" name="Win Rate %" radius={[0,3,3,0]}>
                          {pairData.map((e, i) => <Cell key={i} fill={e.wr >= 60 ? '#00cc77' : e.wr >= 40 ? '#ffaa00' : '#ff4466'} fillOpacity={0.8} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Behavior */}
              <div style={card}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, marginBottom: 12 }}>⚠️ BEHAVIOR FLAGS</div>
                {[
                  { label: 'Revenge Trades', val: stats.revengeCount, color: '#ffaa00', warn: stats.revengeCount > 0 },
                  { label: 'Strategy Breaks', val: stats.stratBreaks, color: '#cc44ff', warn: stats.stratBreaks > 0 },
                  { label: 'Clean Trades', val: stats.trades - stats.revengeCount - stats.stratBreaks, color: '#00cc77', warn: false },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, marginBottom: 6, border: `1px solid ${item.warn ? item.color + '33' : 'rgba(255,255,255,0.05)'}` }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{item.label}</span>
                    <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'JetBrains Mono', color: item.color }}>{item.val}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* AI Report */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2 }}>🤖 AI {periodLabel.toUpperCase()} COACHING REPORT</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {savedAt && <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'JetBrains Mono' }}>{new Date(savedAt).toLocaleDateString()}</span>}
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'JetBrains Mono' }}>claude sonnet</span>
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{report}</div>
          </div>
        </>
      )}
    </div>
  )
}

function AutoHistory({ userId, period, onSelect }: any) {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    async function load() {
      if (!userId) return
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      const { data } = await supabase.from('reports').select('*').eq('user_id', userId).eq('period', period).order('created_at', { ascending: false }).limit(5)
      setHistory(data || [])
      setLoading(false)
    }
    load()
  }, [userId, period])
  const card: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16, marginBottom: 14 }
  if (loading) return <div style={{ textAlign: 'center', padding: 30, color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>Loading...</div>
  return (
    <div style={card}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, marginBottom: 14 }}>PREVIOUS {period === 'weekly' ? 'WEEK' : 'MONTH'} REPORTS</div>
      {history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 20, color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No previous reports yet</div>
      ) : history.map((r, i) => (
        <div key={i} onClick={() => onSelect(r)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, marginBottom: 8, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')} onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{r.period_start} → {r.period_end}</div>
            <div style={{ display: 'flex', gap: 12, fontSize: 11, fontFamily: 'JetBrains Mono' }}>
              <span style={{ color: r.stats?.winRate >= 60 ? '#00cc77' : '#ffaa00' }}>{r.stats?.winRate}% WR</span>
              <span style={{ color: r.stats?.totalPnL >= 0 ? '#00cc77' : '#ff4466' }}>{r.stats?.totalPnL >= 0 ? '+' : ''}${r.stats?.totalPnL?.toFixed(2)}</span>
              <span style={{ color: '#00ccff' }}>{r.stats?.trades} trades</span>
            </div>
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{new Date(r.created_at).toLocaleDateString()}</div>
        </div>
      ))}
    </div>
  )
}
