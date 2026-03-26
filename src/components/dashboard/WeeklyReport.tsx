'use client'
import { useState, useEffect } from 'react'
import { getLang } from '@/lib/i18n'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'

interface Props { userId?: string; profile?: any; demoTrades?: any[] }

const LABELS: Record<string, any> = {
  en: { weekly: 'Weekly', monthly: 'Monthly', history: 'Report History', noReportsWeekly: 'No reports yet — weekly reports are generated every Sunday automatically.', noReportsMonthly: 'No reports yet — monthly reports are generated at the end of each month automatically.', back: '← Back to list', generating: 'Generating report...', winRate: 'Win Rate', netPnL: 'Net P&L', discipline: 'Discipline', trades: 'Trades', strengths: 'STRENGTHS', weaknesses: 'AREAS FOR IMPROVEMENT', action: 'ACTION PLAN', coachReport: 'AI COACHING REPORT', behaviorFlags: 'BEHAVIOR FLAGS', revenge: 'Revenge Trades', stratBreaks: 'Strategy Breaks', clean: 'Clean Trades', generate: 'Generate Report', cumPnL: 'CUMULATIVE P&L', pnlTrade: 'P&L PER TRADE', discTrade: 'DISCIPLINE PER TRADE', winPair: 'WIN RATE BY PAIR' },
  fr: { weekly: 'Hebdo', monthly: 'Mensuel', history: 'Historique des rapports', noReportsWeekly: 'Aucun rapport — les rapports hebdomadaires sont générés chaque dimanche.', noReportsMonthly: 'Aucun rapport — les rapports mensuels sont générés en fin de mois.', back: '← Retour', generating: 'Génération en cours...', winRate: 'Win Rate', netPnL: 'PnL Net', discipline: 'Discipline', trades: 'Trades', generate: 'Générer le rapport', cumPnL: 'P&L CUMULATIF', pnlTrade: 'P&L PAR TRADE', discTrade: 'DISCIPLINE PAR TRADE', winPair: 'WIN RATE PAR PAIRE', behaviorFlags: 'COMPORTEMENT', revenge: 'Revenge Trades', stratBreaks: 'Ruptures stratégie', clean: 'Trades propres', coachReport: 'RAPPORT IA' },
  ar: { weekly: 'أسبوعي', monthly: 'شهري', history: 'سجل التقارير', noReportsWeekly: 'لا توجد تقارير — يتم إنشاء التقارير الأسبوعية كل أحد تلقائياً.', noReportsMonthly: 'لا توجد تقارير — يتم إنشاء التقارير الشهرية في نهاية كل شهر.', back: '→ رجوع', generating: 'جارٍ الإنشاء...', winRate: 'نسبة الربح', netPnL: 'الربح الصافي', discipline: 'الانضباط', trades: 'الصفقات', generate: 'إنشاء تقرير', cumPnL: 'الربح التراكمي', pnlTrade: 'الربح لكل صفقة', discTrade: 'الانضباط لكل صفقة', winPair: 'نسبة الربح للزوج', behaviorFlags: 'السلوك', revenge: 'صفقات الانتقام', stratBreaks: 'كسر الاستراتيجية', clean: 'صفقات نظيفة', coachReport: 'تقرير الذكاء الاصطناعي' },
  es: { weekly: 'Semanal', monthly: 'Mensual', history: 'Historial de informes', noReportsWeekly: 'Sin informes — los informes semanales se generan cada domingo.', noReportsMonthly: 'Sin informes — los informes mensuales se generan a fin de mes.', back: '← Volver', generating: 'Generando...', winRate: 'Tasa de éxito', netPnL: 'PnL Neto', discipline: 'Disciplina', trades: 'Operaciones', generate: 'Generar informe', cumPnL: 'P&L ACUMULADO', pnlTrade: 'P&L POR OPERACIÓN', discTrade: 'DISCIPLINA POR OPERACIÓN', winPair: 'WIN RATE POR PAR', behaviorFlags: 'COMPORTAMIENTO', revenge: 'Operaciones vengativas', stratBreaks: 'Rupturas estrategia', clean: 'Operaciones limpias', coachReport: 'INFORME IA' },
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0d0d18', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px' }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: p.value >= 0 ? '#00cc77' : '#ff4466' }}>
          {p.name}: {typeof p.value === 'number' ? (p.value >= 0 ? '+' : '') + p.value.toFixed(2) : p.value}
        </div>
      ))}
    </div>
  )
}

export default function WeeklyReport({ userId, profile, demoTrades }: Props) {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly')
  const [reports, setReports] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [trades, setTrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
    const [lang, setLang] = useState('en')

  const l = LABELS[lang] || LABELS.en
  const isRTL = lang === 'ar'

  useEffect(() => {
    setLang(getLang())
    function onS() { setLang(getLang()) }
    window.addEventListener('storage', onS)
    return () => window.removeEventListener('storage', onS)
  }, [])

  useEffect(() => {
    setSelected(null)
    setReports([])
    loadReports()
  }, [period, userId])

  async function loadReports() {
    setLoading(true)
    if (demoTrades) {
      // Demo mode — fake reports
      setReports([
        { id: '1', period_start: '2026-03-16', period_end: '2026-03-22', stats: { winRate: 72, totalPnL: 1850, trades: 11, disciplineScore: 85, revengeCount: 1, stratBreaks: 0 }, report: '## ✅ PERFORMANCE SUMMARY\n\nExcellent week with 72% win rate and $1,850 profit. Strong discipline maintained throughout most sessions.\n\n## ⚠️ AREAS FOR IMPROVEMENT\n\n**Revenge Trading:** 1 revenge trade detected on Wednesday — cost you $95.\n**Session Management:** Avoid trading during low-volatility London open.\n\n## 🎯 ACTION PLAN\n\n1. Apply 30-min cooldown after every loss — no exceptions.\n2. Focus on NY session entries only for EURUSD.\n3. Review XAUUSD setups — your best performing pair this week.', created_at: new Date().toISOString(), lang: 'en' },
        { id: '2', period_start: '2026-03-09', period_end: '2026-03-15', stats: { winRate: 58, totalPnL: 620, trades: 8, disciplineScore: 70, revengeCount: 2, stratBreaks: 1 }, report: '## ✅ PERFORMANCE SUMMARY\n\nDecent week but room for improvement. 58% win rate with $620 profit.\n\n## ⚠️ AREAS FOR IMPROVEMENT\n\n**Emotional Control:** 2 revenge trades cost you $190.\n**Strategy Discipline:** 1 strategy break on Friday.\n\n## 🎯 ACTION PLAN\n\n1. No trading after 2 consecutive losses.\n2. Review your entry criteria before each trade.\n3. Journal every trade with screenshots.', created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), lang: 'en' },
      ])
      setLoading(false)
      return
    }
    if (!userId) { setLoading(false); return }
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const { data } = await supabase
      .from('weekly_reports')
      .select('*')
      .eq('user_id', userId)
      .eq('period_type', period)
      .order('created_at', { ascending: false })
      .limit(20)
    setReports(data || [])
    setLoading(false)
  }

  async function loadTrades(periodStart: string, periodEnd: string) {
    if (!userId) return
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const { data } = await supabase.from('trades').select('*')
      .eq('user_id', userId).gte('date', periodStart).lte('date', periodEnd)
      .order('date', { ascending: true })
    setTrades(data || [])
  }

  async function handleSelect(r: any) {
    setSelected(r)
    if (!demoTrades) await loadTrades(r.period_start, r.period_end)
    else setTrades(demoTrades)
  }

  

  const card: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16, marginBottom: 14 }

  // Charts data
  const tradesForChart = demoTrades || trades
  let cum = 0
  const pnlChartData = tradesForChart.map((t, i) => {
    cum += t.pnl || 0
    return { name: t.pair || `T${i+1}`, pnl: t.pnl || 0, cumPnL: parseFloat(cum.toFixed(2)) }
  })
  const disciplineData = tradesForChart.map((t, i) => ({ name: t.pair || `T${i+1}`, score: t.discipline_score || (t.is_revenge ? 60 : 100) }))
  const pairMap: Record<string, { wins: number; total: number }> = {}
  tradesForChart.forEach(t => {
    if (!pairMap[t.pair]) pairMap[t.pair] = { wins: 0, total: 0 }
    pairMap[t.pair].total++
    if (t.result === 'win') pairMap[t.pair].wins++
  })
  const pairData = Object.entries(pairMap).map(([pair, d]) => ({ pair, wr: Math.round((d.wins / d.total) * 100) }))

  // Format report text with markdown-like styling
  function formatReport(text: string) {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <div key={i} style={{ fontSize: 13, fontWeight: 800, color: '#00cc77', marginTop: 16, marginBottom: 8, letterSpacing: 0.5 }}>{line.replace('## ', '')}</div>
      if (line.startsWith('**') && line.endsWith('**')) return <div key={i} style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{line.replace(/\*\*/g, '')}</div>
      if (line.match(/^\d+\./)) return <div key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 6, paddingLeft: 8 }}>{line}</div>
      if (line.startsWith('**')) {
        const parts = line.split('**')
        return <div key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 6, lineHeight: 1.7 }}>
          {parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: '#fff' }}>{p}</strong> : p)}
        </div>
      }
      return line ? <div key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 6, lineHeight: 1.7 }}>{line}</div> : <div key={i} style={{ height: 4 }} />
    })
  }

  return (
    <div style={{ direction: isRTL ? 'rtl' : 'ltr', fontFamily: 'Syne, sans-serif' }}>
      {/* Period toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['weekly', 'monthly'] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={{ padding: '8px 20px', background: period === p ? '#fff' : 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, color: period === p ? '#000' : 'rgba(255,255,255,0.5)', fontFamily: 'Syne', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            {p === 'weekly' ? l.weekly : l.monthly}
          </button>
        ))}
      </div>

      {/* DETAIL VIEW */}
      {selected ? (
        <div>
          {/* Back button */}
          <button onClick={() => { setSelected(null); setTrades([]) }} style={{ background: 'none', border: 'none', color: '#00cc77', fontFamily: 'Syne', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 16, padding: 0 }}>
            {l.back}
          </button>

          {/* Period header */}
          <div style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{period === 'weekly' ? l.weekly : l.monthly} Report</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4, fontFamily: 'JetBrains Mono' }}>{selected.period_start} → {selected.period_end}</div>
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'JetBrains Mono' }}>{new Date(selected.created_at).toLocaleDateString()}</div>
          </div>

          {/* Stats */}
          {selected.stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 14 }}>
              {[
                { label: l.winRate, val: selected.stats.winRate + '%', color: selected.stats.winRate >= 60 ? '#00cc77' : selected.stats.winRate >= 40 ? '#ffaa00' : '#ff4466' },
                { label: l.netPnL, val: (selected.stats.totalPnL >= 0 ? '+' : '') + selected.stats.totalPnL?.toFixed(2) + '$', color: selected.stats.totalPnL >= 0 ? '#00cc77' : '#ff4466' },
                { label: l.discipline, val: selected.stats.disciplineScore + '/100', color: selected.stats.disciplineScore > 70 ? '#00cc77' : selected.stats.disciplineScore > 40 ? '#ffaa00' : '#ff4466' },
                { label: l.trades, val: selected.stats.trades, color: '#00ccff' },
              ].map(s => (
                <div key={s.label} style={card}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: 'JetBrains Mono' }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4, letterSpacing: 1 }}>{s.label?.toUpperCase()}</div>
                </div>
              ))}
            </div>
          )}

          {/* Charts */}
          {tradesForChart.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div style={card}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, marginBottom: 12 }}>📈 {l.cumPnL}</div>
                <ResponsiveContainer width="100%" height={150}>
                  <AreaChart data={pnlChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00cc77" stopOpacity={0.2}/><stop offset="95%" stopColor="#00cc77" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.2)' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.2)' }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="cumPnL" name="Cum. P&L" stroke="#00cc77" fill="url(#pg)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div style={card}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, marginBottom: 12 }}>💹 {l.pnlTrade}</div>
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
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, marginBottom: 12 }}>🧠 {l.discTrade}</div>
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
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, marginBottom: 12 }}>🏆 {l.winPair}</div>
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

          {/* Behavior flags */}
          {selected.stats && (
            <div style={card}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, marginBottom: 12 }}>⚠️ {l.behaviorFlags}</div>
              {[
                { label: l.revenge, val: selected.stats.revengeCount, color: '#ffaa00', warn: selected.stats.revengeCount > 0 },
                { label: l.stratBreaks, val: selected.stats.stratBreaks, color: '#cc44ff', warn: selected.stats.stratBreaks > 0 },
                { label: l.clean, val: selected.stats.trades - selected.stats.revengeCount - selected.stats.stratBreaks, color: '#00cc77', warn: false },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, marginBottom: 6, border: `1px solid ${item.warn ? item.color + '33' : 'rgba(255,255,255,0.05)'}` }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{item.label}</span>
                  <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'JetBrains Mono', color: item.color }}>{item.val}</span>
                </div>
              ))}
            </div>
          )}

          {/* AI Report */}
          <div style={card}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, marginBottom: 16 }}>🤖 {l.coachReport}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.9 }}>
              {formatReport(selected.report || '')}
            </div>
          </div>
        </div>
      ) : (
        /* LIST VIEW */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>{l.history}</div>
                      </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>Loading...</div>
          ) : reports.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>{period === "weekly" ? l.noReportsWeekly : l.noReportsMonthly}</div>
            </div>
          ) : (
            reports.map((r, i) => (
              <div key={i} onClick={() => handleSelect(r)}
                style={{ ...card, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all .2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,204,119,0.05)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,204,119,0.2)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                    {period === 'weekly' ? '📅' : '🗓️'} {r.period_start} → {r.period_end}
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, fontFamily: 'JetBrains Mono' }}>
                    <span style={{ color: r.stats?.winRate >= 60 ? '#00cc77' : r.stats?.winRate >= 40 ? '#ffaa00' : '#ff4466' }}>
                      {r.stats?.winRate}% WR
                    </span>
                    <span style={{ color: r.stats?.totalPnL >= 0 ? '#00cc77' : '#ff4466' }}>
                      {r.stats?.totalPnL >= 0 ? '+' : ''}${r.stats?.totalPnL?.toFixed(2)}
                    </span>
                    <span style={{ color: '#00ccff' }}>{r.stats?.trades} trades</span>
                    <span style={{ color: r.stats?.disciplineScore > 70 ? '#00cc77' : '#ffaa00' }}>
                      {r.stats?.disciplineScore}/100 disc
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{new Date(r.created_at).toLocaleDateString()}</div>
                  <span style={{ color: '#00cc77', fontSize: 16 }}>›</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
