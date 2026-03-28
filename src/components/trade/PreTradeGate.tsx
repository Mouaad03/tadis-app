'use client'
import { useState, useEffect, useRef } from 'react'
import { Profile, Direction } from '@/types'
import { getLang, t, Lang } from '@/lib/i18n'

const PAIRS: Record<string, string[]> = {
  'Forex': ['EURUSD','GBPUSD','USDJPY','USDCHF','AUDUSD','USDCAD','NZDUSD','EURGBP','EURJPY','GBPJPY','EURCAD','EURCHF','AUDCAD','AUDNZD','GBPCAD','GBPCHF','CADJPY','CHFJPY'],
  'Gold/Silver': ['XAUUSD','XAGUSD'],
  'Indices': ['SP500','US100','US30','DAX','FTSE','CAC40','NI225','ASX200'],
  'Crypto': ['BTCUSD','ETHUSD','BNBUSD','XRPUSD','SOLUSD','ADAUSD','DOTUSD'],
  'Commodities': ['USOIL','UKOIL','NATGAS','COPPER'],
}
const DEFAULT_STRATEGIES = ['Structure Break + Retest','Order Block','Fair Value Gap','Trend Continuation','Support / Resistance','Liquidity Sweep','Fibonacci Retracement']
const CHECKLIST_KEY = 'tds_checklist_v4'
const STRATEGIES_KEY = 'tds_strategies_v4'
interface CheckItem { id: string; text: string; tag: string; checked: boolean }
const DEFAULT_CHECKLIST: CheckItem[] = [
  { id: '1', text: 'SL behind 15min or 1H structure — not 5min', tag: 'RISK', checked: false },
  { id: '2', text: 'R:R minimum 1:1.5', tag: 'RISK', checked: false },
  { id: '3', text: 'Clear trend on 4H or Daily', tag: 'STRATEGY', checked: false },
  { id: '4', text: 'Real setup — not based on feelings', tag: 'STRATEGY', checked: false },
  { id: '5', text: 'No big loss in this session', tag: 'PSYCH', checked: false },
]
const TAG_CLR: Record<string, [string, string]> = {
  RISK: ['rgba(255,68,102,0.12)', '#ff4466'],
  STRATEGY: ['rgba(0,204,119,0.12)', '#00cc77'],
  PSYCH: ['rgba(255,170,0,0.12)', '#ffaa00'],
  CUSTOM: ['rgba(0,204,255,0.12)', '#00ccff'],
}
function dec(pair: string) { return pair.includes('JPY') ? 3 : ['XAUUSD','XAGUSD','SP500','US100','US30','DAX','FTSE','CAC40','NI225','ASX200','BTCUSD','ETHUSD','USOIL','UKOIL'].includes(pair) ? 2 : 5 }
function pip(pair: string) {
  if (pair.includes('JPY')) return 100
  if (['BTCUSD','ETHUSD'].includes(pair)) return 1
  if (['SP500','US100','US30','DAX','FTSE','CAC40','NI225','ASX200'].includes(pair)) return 1
  if (['XAUUSD','XAGUSD'].includes(pair)) return 10
  if (['USOIL','UKOIL','NATGAS'].includes(pair)) return 100
  if (['XRPUSD','ADAUSD','SOLUSD','BNBUSD'].includes(pair)) return 10000
  return 10000
}

interface Props { profile: Profile | null; todayTrades: any[]; onTradeAdded: () => void }

export default function PreTradeGate({ profile, todayTrades, onTradeAdded }: Props) {
  const [lang, setLang] = useState<Lang>('en')
  const [pair, setPair] = useState('')
  const [pairSearch, setPairSearch] = useState('')
  const [showPairs, setShowPairs] = useState(false)
  const [dir, setDir] = useState<Direction | ''>('')
  const [price, setPrice] = useState<number | null>(null)
  const [priceLoad, setPriceLoad] = useState(false)
  const [entry, setEntry] = useState('')
  const [sl, setSl] = useState('')
  const [tp, setTp] = useState('')
  const [strategy, setStrategy] = useState('')
  const [stratOpen, setStratOpen] = useState(false)
  const [newStrat, setNewStrat] = useState('')
  const [mood, setMood] = useState(0)
  const [checklist, setChecklist] = useState<CheckItem[]>([])
  const [strategies, setStrategies] = useState<string[]>([])
  const [newCond, setNewCond] = useState('')
  const [newCondTag, setNewCondTag] = useState('CUSTOM')
  const [editId, setEditId] = useState<string|null>(null)
  const [editTxt, setEditTxt] = useState('')
  const [timer, setTimer] = useState(0)
  const [saving, setSaving] = useState(false)
  const [activeTrades, setActiveTrades] = useState<any[]>([])
  const [closingTrade, setClosingTrade] = useState<any>(null)
  const [entryTime, setEntryTime] = useState<string>('')
  const timerRef = useRef<NodeJS.Timeout>()
  const stratRef = useRef<HTMLDivElement>(null)
  const pairRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLang(getLang())
    function onStorage() { setLang(getLang()) }
    function onClickOut(e: MouseEvent) {
      if (stratRef.current && !stratRef.current.contains(e.target as Node)) setStratOpen(false)
      if (pairRef.current && !pairRef.current.contains(e.target as Node)) setShowPairs(false)
    }
    window.addEventListener('storage', onStorage)
    document.addEventListener('mousedown', onClickOut)
    // Load from Supabase if user logged in
    if (profile?.id) {
      loadChecklistFromDB(profile.id)
      loadStrategiesFromDB(profile.id)
    } else {
      const cl = localStorage.getItem(CHECKLIST_KEY)
      setChecklist(cl ? JSON.parse(cl).map((c: CheckItem) => ({...c, checked: false})) : DEFAULT_CHECKLIST)
      const st = localStorage.getItem(STRATEGIES_KEY)
      setStrategies(st ? JSON.parse(st) : DEFAULT_STRATEGIES)
    }
    return () => { window.removeEventListener('storage', onStorage); document.removeEventListener('mousedown', onClickOut) }
  }, [profile?.id])

  async function loadChecklistFromDB(userId: string) {
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const { data } = await supabase.from('checklist_items').select('*').eq('user_id', userId).eq('is_active', true).order('order_index')
    if (data && data.length > 0) {
      setChecklist(data.map((d: any) => ({ id: d.id, text: d.text, checked: false, category: d.category || 'CUSTOM' })))
    } else {
      setChecklist(DEFAULT_CHECKLIST)
    }
  }

  async function loadStrategiesFromDB(userId: string) {
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const { data } = await supabase.from('user_strategies').select('*').eq('user_id', userId).order('created_at')
    if (data && data.length > 0) {
      setStrategies(data.map((d: any) => d.name))
    } else {
      setStrategies(DEFAULT_STRATEGIES)
    }
  }

  async function saveChecklistToDB(items: CheckItem[]) {
    if (!profile?.id) { localStorage.setItem(CHECKLIST_KEY, JSON.stringify(items)); return }
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== profile.id) return
    await supabase.from('checklist_items').delete().eq('user_id', user.id)
    if (items.length > 0) {
      await supabase.from('checklist_items').insert(items.map((item, i) => ({
        user_id: user.id, text: item.text, category: item.category || 'CUSTOM', is_active: true, order_index: i
      })))
    }
  }

  async function saveStrategyToDB(name: string) {
    if (!profile?.id) return
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== profile.id) return
    await supabase.from('user_strategies').insert({ user_id: user.id, name })
  }

  async function deleteStrategyFromDB(name: string) {
    if (!profile?.id) return
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== profile.id) return
    await supabase.from('user_strategies').delete().eq('user_id', user.id).eq('name', name)
  }
  useEffect(() => {
    // Check localStorage first for persistent timer
    const saved = localStorage.getItem('tradis_revenge_end')
    if (saved) {
      const left = Math.round((parseInt(saved) - Date.now()) / 1000)
      if (left > 0) { startTimer(left); return }
      else localStorage.removeItem('tradis_revenge_end')
    }
    const t = todayTrades[0]
    if (t?.result === 'loss') {
      const r = Math.max(0, 1800 - (Date.now() - new Date(t.created_at).getTime()) / 1000)
      if (r > 0) startTimer(r)
    }
  }, [todayTrades])
  useEffect(() => { if (pair) fetchPrice(pair) }, [pair])

  useEffect(() => {
    async function checkOpenTrade() {
      if (!profile) return
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      const { data } = await supabase.from('trades').select('*').eq('user_id', profile.id).eq('status', 'open').order('created_at', { ascending: false })
      if (data && data.length > 0) setActiveTrades(data)
    }
    checkOpenTrade()
  }, [profile, todayTrades.length])

  async function fetchPrice(sym: string) {
    setPriceLoad(true)
    try {
      const r = await fetch(`/api/price?symbol=${sym}`)
      const d = await r.json()
      if (d.price) {
        const p = parseFloat(d.price)
        setPrice(p)
        const d2 = dec(sym)
        setEntry(p.toFixed(d2))
        if (dir) fillSLTP(p, dir, sym)
      }
    } catch {}
    setPriceLoad(false)
  }

  function fillSLTP(p: number, d: Direction | '', sym: string) {
    if (!p || !d || !sym) return
    const d2 = dec(sym), sl = p * 0.005, tp = p * 0.010
    if (d === 'BUY') { setSl((p - sl).toFixed(d2)); setTp((p + tp).toFixed(d2)) }
    else { setSl((p + sl).toFixed(d2)); setTp((p - tp).toFixed(d2)) }
  }

  function changeDir(d: Direction) { setDir(d); if (price) fillSLTP(price, d, pair) }

  function startTimer(secs: number) {
    clearInterval(timerRef.current)
    const endTime = Date.now() + Math.round(secs) * 1000
    localStorage.setItem('tradis_revenge_end', endTime.toString())
    const remaining = Math.round((endTime - Date.now()) / 1000)
    setTimer(remaining)
    timerRef.current = setInterval(() => {
      const left = Math.round((endTime - Date.now()) / 1000)
      if (left <= 0) { clearInterval(timerRef.current); setTimer(0); localStorage.removeItem('tradis_revenge_end') }
      else setTimer(left)
    }, 1000)
  }

  const eN = parseFloat(entry), sN = parseFloat(sl), tN = parseFloat(tp)
  const slD = eN && sN ? Math.abs(eN - sN) : 0
  const tpD = eN && tN ? Math.abs(tN - eN) : 0
  const rr = slD > 0 ? parseFloat((tpD / slD).toFixed(2)) : 0
  const slP = slD > 0 ? Math.round(slD * pip(pair)) : 0
  const risk$ = profile ? profile.account_balance * (profile.risk_percent / 100) : 0
  const lot = slP > 0 && risk$ > 0 ? parseFloat((risk$ / (slP * 10)).toFixed(2)) : 0
  const checked = checklist.filter(c => c.checked).length
  const allOk = checklist.length > 0 && checked === checklist.length
  const blocked = !allOk || mood < 3 || !pair || !dir || !strategy || timer > 0 || todayTrades.length >= (profile?.max_daily_trades || 5)
  const isRTL = false

  async function enterTrade() {
    if (blocked || !pair || !dir) return
    setSaving(true)
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const today = new Date().toISOString().split('T')[0]
    const nowTime = new Date().toTimeString().slice(0, 8) // HH:MM:SS
    const isRevenge = todayTrades.some((t: any) => t.result==='loss' && Date.now()-new Date(t.created_at).getTime()<1800000)
    const entryPips = slP > 0 ? slP : null
    const { data: trade, error } = await supabase.from('trades').insert({
      user_id: user.id, date: today, pair, direction: dir,
      entry: eN||null, stop_loss: sN||null, take_profit: tN||null,
      planned_rr: rr||null, lot_size: lot||null, strategy, mood,
      is_revenge: isRevenge, is_strategy_break: false, result: 'win', pnl: 0, status: 'open',
      entry_time: nowTime,
      entry_pips: entryPips,
    }).select().single()
    if (error) { console.error(error); setSaving(false); return }
    setEntryTime(nowTime)
    setActiveTrades(prev => [{ ...trade, _entryTime: nowTime }, ...prev])
    setSaving(false)
    setPair(''); setDir(''); setEntry(''); setSl(''); setTp(''); setStrategy(''); setMood(0); setPrice(null)
    setChecklist(p => p.map(c => ({...c, checked: false})))
  }

  async function closeTrade(result: 'win'|'loss', pnl: number, notes: string, exitData: ExitData) {
    if (!closingTrade?.id) return
    setSaving(true)
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()

    const exitTime = new Date().toTimeString().slice(0, 8)
    const entryTimeStr = closingTrade.entry_time || closingTrade._entryTime || exitTime
    const toMins = (t: string) => { const [h,m,s] = t.split(":").map(Number); return h*60 + m + (s||0)/60 }
    const durationMins2 = Math.max(0, Math.round(toMins(exitTime) - toMins(entryTimeStr)))
    const exitTs = new Date(`1970-01-01T${exitTime}`)
    const durationMins = durationMins2

    // Calc exit pips
    const exitPrice = parseFloat(exitData.exitPrice) || 0
    const entryPrice = closingTrade.entry || 0
    const pipMult = pip(closingTrade.pair || '')
    const exitPips = exitPrice && entryPrice
      ? Math.round(Math.abs(exitPrice - entryPrice) * pipMult) * (result === 'win' ? 1 : -1)
      : null

    // Calc gains %
    const balance = profile?.account_balance || 0
    const gainsPercent = balance > 0 && pnl ? parseFloat(((pnl / balance) * 100).toFixed(2)) : null

    await supabase.from('trades').update({
      result, pnl, notes,
      exit_time: exitTime,
      exit_price: exitPrice || null,
      exit_type: exitData.exitType,
      exit_pips: exitPips,
      duration_minutes: durationMins,
      gains_percent: gainsPercent,
      status: 'closed',
    }).eq('id', closingTrade.id)

    if (result === 'loss') startTimer(1800)
    setActiveTrades(prev => prev.filter(t => t.id !== closingTrade.id))
    setClosingTrade(null); setSaving(false); onTradeAdded()
  }

  const tm = String(Math.floor(timer/60)).padStart(2,'0'), ts = String(timer%60).padStart(2,'0')

  return (
    <div style={{ fontFamily: 'Syne,sans-serif', direction: isRTL ? 'rtl' : 'ltr' }}>
      <style dangerouslySetInnerHTML={{ __html: `* { box-sizing: border-box; }` }} />

      {/* ACTIVE TRADES */}
      {activeTrades.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, marginBottom: 8 }}>🟢 ACTIVE TRADES ({activeTrades.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeTrades.map(trade => (
              <div key={trade.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(0,204,119,0.05)', border: '1px solid rgba(0,204,119,0.2)', borderRadius: 12 }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#fff', fontFamily: 'JetBrains Mono' }}>{trade.pair}</span>
                  <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 700, color: trade.direction === 'BUY' ? '#00cc77' : '#ff4466' }}>{trade.direction}</span>
                  <span style={{ marginLeft: 8, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>🕐 {(trade.entry_time || trade._entryTime || '').slice(0,5)}</span>
                  <span style={{ marginLeft: 8, fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono' }}>@ {trade.entry}</span>
                </div>
                <button onClick={() => setClosingTrade(trade)} style={{ padding: '7px 16px', background: 'linear-gradient(135deg,#00cc77,#00aa66)', border: 'none', borderRadius: 8, color: '#000', fontFamily: 'Syne', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>Close Trade</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {closingTrade && (
        <div style={{ marginBottom: 16 }}>
          <ClosePanel trade={closingTrade} onClose={closeTrade} saving={saving} profile={profile} />
        </div>
      )}

      {timer > 0 && (
        <div style={{ background: 'rgba(255,68,102,0.06)', border: '1px solid rgba(255,68,102,0.2)', borderRadius: 12, padding: 20, textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 44, fontWeight: 800, color: '#ff4466', fontFamily: 'JetBrains Mono' }}>{tm}:{ts}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,68,102,0.7)', marginTop: 4, letterSpacing: 1 }}>REVENGE COOLDOWN</div>
          <button onClick={() => { clearInterval(timerRef.current); setTimer(0); localStorage.removeItem('tradis_revenge_end') }} style={{ marginTop: 8, background: 'none', border: '1px solid rgba(255,68,102,0.3)', borderRadius: 7, color: 'rgba(255,68,102,0.7)', padding: '5px 12px', cursor: 'pointer', fontSize: 12 }}>Skip</button>
        </div>
      )}

      {
        <>
          {/* 2 COLUMNS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* LEFT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>

              {/* PAIR */}
              <div style={card}>
                <div style={title}>{t('pairDirection', lang)}</div>
                <div ref={pairRef} style={{ position: 'relative', marginBottom: 10 }}>
                  <input value={pair || pairSearch} onChange={e => { setPairSearch(e.target.value); setPair(''); setShowPairs(true) }} onFocus={() => setShowPairs(true)}
                    placeholder={t('searchPair', lang)} style={{ ...inp, width: '100%', paddingRight: price ? 120 : 12 }} />
                  {price && !priceLoad && (
                    <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#00cc77', fontFamily: 'JetBrains Mono' }}>{price.toFixed(dec(pair))}</span>
                      <button onClick={() => fetchPrice(pair)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 13 }}>↻</button>
                    </div>
                  )}
                  {priceLoad && <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#ffaa00' }}>...</span>}
                  {showPairs && !pair && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#0d0d18', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, maxHeight: 200, overflowY: 'auto', zIndex: 999, marginTop: 4 }}>
                      {Object.entries(PAIRS).map(([cat, ps]) => (
                        <div key={cat}>
                          <div style={{ padding: '4px 12px', fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: 1, background: '#080810' }}>{cat}</div>
                          {ps.filter(p => p.toLowerCase().includes(pairSearch.toLowerCase())).map(p => (
                            <div key={p} onClick={() => { setPair(p); setPairSearch(''); setShowPairs(false) }}
                              style={{ padding: '8px 12px', fontSize: 13, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>{p}</div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button onClick={() => changeDir('BUY')} style={{ padding: 10, border: `1px solid ${dir==='BUY'?'rgba(0,204,119,0.4)':'rgba(255,255,255,0.08)'}`, borderRadius: 10, background: dir==='BUY'?'rgba(0,204,119,0.08)':'rgba(255,255,255,0.03)', color: dir==='BUY'?'#00cc77':'rgba(255,255,255,0.4)', fontFamily: 'Syne', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>▲ BUY</button>
                  <button onClick={() => changeDir('SELL')} style={{ padding: 10, border: `1px solid ${dir==='SELL'?'rgba(255,68,102,0.4)':'rgba(255,255,255,0.08)'}`, borderRadius: 10, background: dir==='SELL'?'rgba(255,68,102,0.08)':'rgba(255,255,255,0.03)', color: dir==='SELL'?'#ff4466':'rgba(255,255,255,0.4)', fontFamily: 'Syne', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>▼ SELL</button>
                </div>
              </div>

              {/* CALCULATOR */}
              <div style={cardHidden}>
                <div style={title}>{t('entry', lang)} / {t('stopLoss', lang)} / {t('takeProfit', lang)}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                  {[['Entry', entry, setEntry], ['Stop Loss', sl, setSl], ['Take Profit', tp, setTp]].map(([lbl, val, set]) => (
                    <div key={lbl as string}>
                      <div style={lbl2}>{lbl as string}</div>
                      <input value={val as string} onChange={e => (set as Function)(e.target.value)} type="number" step="any" style={{ ...inp, width: '100%' }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {[
                    ['Lot', lot > 0 ? lot.toFixed(2) : '—', '#00cc77'],
                    ['Risk $', risk$ > 0 ? '$'+risk$.toFixed(0) : '—', '#ffaa00'],
                    ['R:R', rr > 0 ? '1:'+rr : '—', rr>=1.5?'#00cc77':rr>=1?'#ffaa00':'#ff4466'],
                    ['Pips', slP > 0 ? slP+'p' : '—', '#00ccff'],
                  ].map(([l,v,c]) => (
                    <div key={l as string} style={{ textAlign: 'center' }}>
                      <div style={lbl2}>{l as string}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: c as string, fontFamily: 'JetBrains Mono' }}>{v as string}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* STRATEGY */}
              <div ref={stratRef} style={{ ...card, position: 'relative', zIndex: 10 }}>
                <div style={title}>{t('strategy', lang)}</div>
                <button onClick={() => setStratOpen(!stratOpen)} style={{ width: '100%', padding: '9px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${strategy?'rgba(0,204,119,0.3)':'rgba(255,255,255,0.08)'}`, borderRadius: 10, color: strategy?'#00cc77':'rgba(255,255,255,0.35)', fontFamily: 'Syne', fontSize: 13, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: strategy?600:400 }}>
                  <span>{strategy || t('selectStrategy', lang)}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{stratOpen?'▲':'▼'}</span>
                </button>
                {stratOpen && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#0d0d18', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, zIndex: 999, marginTop: 4, overflow: 'hidden' }}>
                    {strategies.map(s => (
                      <div key={s} style={{ display: 'flex', alignItems: 'center', padding: '9px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <span onClick={() => { setStrategy(s); setStratOpen(false) }} style={{ flex: 1, fontSize: 13, color: strategy===s?'#00cc77':'rgba(255,255,255,0.7)' }}>{s}</span>
                        <button onClick={() => { deleteStrategyFromDB(s); setStrategies(p => p.filter(x => x!==s)); if (strategy===s) setStrategy('') }} style={{ background: 'none', border: 'none', color: 'rgba(255,68,102,0.5)', cursor: 'pointer', fontSize: 15 }}>×</button>
                      </div>
                    ))}
                    <div style={{ padding: '8px 10px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 6 }}>
                      <input value={newStrat} onChange={e => setNewStrat(e.target.value)} onKeyDown={e => { if (e.key==='Enter' && newStrat.trim()) { saveStrategyToDB(newStrat.trim()); setStrategies(p => [...p, newStrat.trim()]); setNewStrat('') }}} placeholder={t('addStrategy', lang)} style={{ ...inp, flex: 1, fontSize: 12, padding: '6px 9px' }} />
                      <button onClick={() => { if (newStrat.trim()) { saveStrategyToDB(newStrat.trim()); setStrategies(p => [...p, newStrat.trim()]); setNewStrat('') }}} style={{ padding: '6px 11px', background: 'rgba(0,204,119,0.1)', border: '1px solid rgba(0,204,119,0.2)', borderRadius: 7, color: '#00cc77', cursor: 'pointer', fontSize: 13 }}>+</button>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>

              {/* CHECKLIST */}
              <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={title}>{t('checklistTitle', lang)}</div>
                  <span style={{ fontSize: 11, color: allOk?'#00cc77':'rgba(255,255,255,0.3)', fontWeight: 600 }}>{checked}/{checklist.length}</span>
                </div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, marginBottom: 12 }}>
                  <div style={{ height: '100%', width: checklist.length?`${(checked/checklist.length)*100}%`:'0%', background: '#00cc77', borderRadius: 2, transition: 'width .3s' }} />
                </div>
                {checklist.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div onClick={() => setChecklist(p => p.map(c => c.id===item.id?{...c,checked:!c.checked}:c))}
                      style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0, border: item.checked?'none':'1px solid rgba(255,255,255,0.2)', background: item.checked?'#00cc77':'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#000', fontWeight: 700, cursor: 'pointer' }}>
                      {item.checked ? '✓' : ''}
                    </div>
                    {editId === item.id ? (
                      <div style={{ flex: 1, display: 'flex', gap: 5 }}>
                        <input value={editTxt} onChange={e => setEditTxt(e.target.value)} onKeyDown={e => { if (e.key==='Enter') { setChecklist(p => p.map(c => c.id===item.id?{...c,text:editTxt}:c)); setEditId(null) }}} style={{ ...inp, flex: 1, padding: '4px 8px', fontSize: 12 }} autoFocus />
                        <button onClick={() => { setChecklist(p => p.map(c => c.id===item.id?{...c,text:editTxt}:c)); setEditId(null) }} style={{ background: 'rgba(0,204,119,0.1)', border: '1px solid rgba(0,204,119,0.2)', borderRadius: 6, color: '#00cc77', cursor: 'pointer', padding: '4px 8px', fontSize: 12 }}>✓</button>
                        <button onClick={() => setEditId(null)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '4px 8px', fontSize: 12 }}>✕</button>
                      </div>
                    ) : (
                      <div style={{ flex: 1, fontSize: 12, color: item.checked?'rgba(255,255,255,0.25)':'rgba(255,255,255,0.75)', textDecoration: item.checked?'line-through':'none' }}>
                        {item.text}
                        <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 20, marginLeft: 6, background: TAG_CLR[item.tag]?.[0]||'rgba(255,255,255,0.08)', color: TAG_CLR[item.tag]?.[1]||'#fff' }}>{item.tag}</span>
                      </div>
                    )}
                    <button onClick={() => { setEditId(item.id); setEditTxt(item.text) }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: 12 }}>✏</button>
                    <button onClick={() => setChecklist(p => { const n = p.filter(c => c.id!==item.id); saveChecklistToDB(n); return n })} style={{ background: 'none', border: 'none', color: 'rgba(255,68,102,0.4)', cursor: 'pointer', fontSize: 15 }}>×</button>
                  </div>
                ))}
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', gap: 5, marginBottom: 7, flexWrap: 'wrap' }}>
                    {['RISK','STRATEGY','PSYCH','CUSTOM'].map(tag => (
                      <button key={tag} onClick={() => setNewCondTag(tag)} style={{ padding: '3px 9px', background: newCondTag===tag?(TAG_CLR[tag]?.[0]||'rgba(255,255,255,0.08)'):'rgba(255,255,255,0.03)', border: `1px solid ${newCondTag===tag?(TAG_CLR[tag]?.[1]||'#fff'):'rgba(255,255,255,0.08)'}`, borderRadius: 20, color: newCondTag===tag?(TAG_CLR[tag]?.[1]||'#fff'):'rgba(255,255,255,0.3)', fontSize: 10, cursor: 'pointer', fontWeight: 600 }}>{tag}</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 7 }}>
                    <input value={newCond} onChange={e => setNewCond(e.target.value)} onKeyDown={e => { if (e.key==='Enter' && newCond.trim()) { const item = {id: Date.now().toString(), text: newCond.trim(), tag: newCondTag, category: newCondTag || 'CUSTOM', checked: false}; setChecklist(p => { const n = [...p, item]; saveChecklistToDB(n); return n }); setNewCond('') }}} placeholder={t('addCondition', lang)} style={{ ...inp, flex: 1, fontSize: 12 }} />
                    <button onClick={() => { if (newCond.trim()) { const item = {id: Date.now().toString(), text: newCond.trim(), tag: newCondTag, category: newCondTag || 'CUSTOM', checked: false}; setChecklist(p => { const n = [...p, item]; saveChecklistToDB(n); return n }); setNewCond('') }}} style={{ padding: '7px 12px', background: 'rgba(0,204,119,0.1)', border: '1px solid rgba(0,204,119,0.2)', borderRadius: 8, color: '#00cc77', cursor: 'pointer', fontSize: 14 }}>+</button>
                  </div>
                </div>
              </div>

              {/* MENTAL STATE */}
              <div style={cardHidden}>
                <div style={title}>{t('mentalState', lang)}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['🤬','😤','😐','😌','🧠'].map((e, i) => (
                    <button key={i} onClick={() => setMood(i+1)} style={{ flex: 1, padding: '9px 4px', background: mood===i+1?'rgba(0,204,119,0.08)':'rgba(255,255,255,0.03)', border: mood===i+1?'1px solid rgba(0,204,119,0.3)':'1px solid rgba(255,255,255,0.07)', borderRadius: 10, fontSize: 20, cursor: 'pointer' }}>{e}</button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* REAL-TIME DISCIPLINE ALERTS */}
          {(() => {
            const alerts: { type: 'danger'|'warning'|'info'; msg: string }[] = []
            const maxDailyTrades = profile?.max_daily_trades || 5
            const todayCount = todayTrades.length

            // Overtrading alert
            if (todayCount >= 3) alerts.push({ type: todayCount >= maxDailyTrades ? 'danger' : 'warning', msg: `📈 ${todayCount} trades today — ${todayCount >= maxDailyTrades ? 'LIMIT REACHED!' : `${maxDailyTrades - todayCount} remaining`}` })

            // Big lot size alert
            if (lot > 0 && profile?.account_balance) {
              const riskPct = profile.risk_percent || 1
              const maxSafeLot = parseFloat(((profile.account_balance * (riskPct / 100)) / 100).toFixed(2))
              if (lot > maxSafeLot * 2) alerts.push({ type: 'danger', msg: `🎰 Lot size ${lot} kbar bzaf! Max safe: ${maxSafeLot}` })
              else if (lot > maxSafeLot * 1.5) alerts.push({ type: 'warning', msg: `⚠ Lot size ${lot} — kaytqarb l limit (${maxSafeLot})` })
            }

            // Revenge trade risk
            const lastLoss = todayTrades.find(t => t.result === 'loss')
            if (lastLoss && Date.now() - new Date(lastLoss.created_at).getTime() < 1800000) {
              alerts.push({ type: 'danger', msg: `🔴 Loss detected — risk dyal revenge trade! Sber dik chwiya.` })
            }

            // Daily loss limit
            const todayPnL = todayTrades.reduce((s, t) => s + (t.pnl || 0), 0)
            if (profile?.account_balance && todayPnL < -(profile.account_balance * 0.03)) {
              alerts.push({ type: 'danger', msg: `🚨 Daily loss limit — khsart ${Math.abs(todayPnL).toFixed(0)}$ (3%+ dyal balance)` })
            }

            if (alerts.length === 0) return null
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
                {alerts.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: a.type === 'danger' ? 'rgba(255,68,102,0.08)' : a.type === 'warning' ? 'rgba(255,170,0,0.08)' : 'rgba(0,204,119,0.08)', border: `1px solid ${a.type === 'danger' ? 'rgba(255,68,102,0.25)' : a.type === 'warning' ? 'rgba(255,170,0,0.25)' : 'rgba(0,204,119,0.25)'}` }}>
                    <div style={{ fontSize: 12, color: a.type === 'danger' ? '#ff4466' : a.type === 'warning' ? '#ffaa00' : '#00cc77', fontWeight: 600, fontFamily: 'Syne' }}>{a.msg}</div>
                  </div>
                ))}
              </div>
            )
          })()}

          {/* WARNINGS */}
          {blocked && (
            <div style={{ background: 'rgba(255,68,102,0.06)', border: '1px solid rgba(255,68,102,0.15)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'rgba(255,120,140,0.9)', marginTop: 12 }}>
              {!pair && <div>⚠ {t('selectPair', lang)}</div>}
              {!dir && <div>⚠ {t('selectDirection', lang)}</div>}
              {!strategy && <div>⚠ {t('selectStrategy', lang)}</div>}
              {!allOk && checklist.length > 0 && <div>⚠ {checklist.length - checked} {t('conditionsMissing', lang)}</div>}
              {mood < 3 && mood > 0 && <div>⚠ {t('badMood', lang)}</div>}
              {mood === 0 && <div>⚠ {t('selectMood', lang)}</div>}
            </div>
          )}

          {/* ENTER BUTTON */}
          <button onClick={enterTrade} disabled={blocked || saving} style={{ width: '100%', padding: 16, border: 'none', borderRadius: 12, background: blocked?'rgba(255,255,255,0.04)':'linear-gradient(135deg,#00cc77,#00aa66)', color: blocked?'rgba(255,255,255,0.2)':'#000', fontFamily: 'Syne', fontSize: 15, fontWeight: 800, cursor: blocked?'not-allowed':'pointer', marginTop: 12, letterSpacing: '0.5px' }}>
            {saving ? '...' : blocked ? t('completeChecklist', lang) : `✓ ${t('enterTrade', lang)} — ${pair||'?'} ${dir||'?'}`}
          </button>
        </>
      }
    </div>
  )
}

// ─── EXIT DATA TYPE ───────────────────────────────────────────────
interface ExitData {
  exitPrice: string
  exitType: 'tp' | 'sl' | 'market'
}

// ─── CLOSE PANEL ─────────────────────────────────────────────────
function ClosePanel({ trade, onClose, saving, profile }: any) {
  const [pnl, setPnl] = useState('')
  const [notes, setNotes] = useState('')
  const [exitPrice, setExitPrice] = useState('')
  const [exitType, setExitType] = useState<'tp'|'sl'|'market'>('market')

  // Auto-fill exit price from TP/SL
  useEffect(() => {
    if (exitType === 'tp' && trade.take_profit) setExitPrice(String(trade.take_profit))
    else if (exitType === 'sl' && trade.stop_loss) setExitPrice(String(trade.stop_loss))
  }, [exitType])

  // Auto-calc PnL from exit price
  useEffect(() => {
    if (!exitPrice || !trade.entry || !trade.lot_size) return
    const pipMult = pip(trade.pair || '')
    const priceDiff = Math.abs(parseFloat(exitPrice) - trade.entry)
    const pips = priceDiff * pipMult
    const calcPnl = pips * trade.lot_size * 10
    const isWin = trade.direction === 'BUY'
      ? parseFloat(exitPrice) > trade.entry
      : parseFloat(exitPrice) < trade.entry
    setPnl((isWin ? calcPnl : -calcPnl).toFixed(2))
  }, [exitPrice])

  const pnlNum = parseFloat(pnl) || 0
  const balance = profile?.account_balance || 0
  const gainsPercent = balance > 0 && pnlNum ? ((pnlNum / balance) * 100).toFixed(2) : null
  const isWin = pnlNum >= 0

  return (
    <div style={{ background: 'rgba(0,204,119,0.04)', border: '1px solid rgba(0,204,119,0.15)', borderRadius: 14, padding: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'JetBrains Mono', color: '#e8e8f0' }}>{trade.pair} {trade.direction}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
            🕐 Entry: {trade.entry_time ? trade.entry_time.slice(0,5) : trade._entryTime ? trade._entryTime.slice(0,5) : '—'} &nbsp;|&nbsp; Lot: {trade.lot_size||'—'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>Entry Price</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'JetBrains Mono' }}>{trade.entry || '—'}</div>
        </div>
      </div>

      {/* Exit Type */}
      <div style={{ marginBottom: 14 }}>
        <div style={lbl2}>Exit Type</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {(['tp','sl','market'] as const).map(t2 => {
            const colors: Record<string, string> = { tp: '#00cc77', sl: '#ff4466', market: '#ffaa00' }
            const labels: Record<string, string> = { tp: '✓ Take Profit', sl: '✗ Stop Loss', market: '◎ Market' }
            const active = exitType === t2
            return (
              <button key={t2} onClick={() => setExitType(t2)}
                style={{ padding: '9px 6px', border: `1px solid ${active ? colors[t2] : 'rgba(255,255,255,0.08)'}`, borderRadius: 10, background: active ? `rgba(${t2==='tp'?'0,204,119':t2==='sl'?'255,68,102':'255,170,0'},0.1)` : 'rgba(255,255,255,0.03)', color: active ? colors[t2] : 'rgba(255,255,255,0.4)', fontFamily: 'Syne', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                {labels[t2]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Exit Price + PnL + Notes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div>
          <div style={lbl2}>Exit Price</div>
          <input value={exitPrice} onChange={e => setExitPrice(e.target.value)} placeholder="0.00000" style={{ ...inp, width: '100%' }} type="number" step="any" />
        </div>
        <div>
          <div style={lbl2}>Net PnL ($)</div>
          <input value={pnl} onChange={e => setPnl(e.target.value)} placeholder="+125 / -50" style={{ ...inp, width: '100%', color: pnlNum >= 0 ? '#00cc77' : '#ff4466' }} type="number" />
        </div>
        <div>
          <div style={lbl2}>Notes</div>
          <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional..." style={{ ...inp, width: '100%' }} />
        </div>
      </div>

      {/* PnL Preview */}
      {pnlNum !== 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14, padding: '12px 16px', background: isWin ? 'rgba(0,204,119,0.06)' : 'rgba(255,68,102,0.06)', borderRadius: 10, border: `1px solid ${isWin ? 'rgba(0,204,119,0.2)' : 'rgba(255,68,102,0.2)'}` }}>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 3 }}>NET PROFIT</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: isWin ? '#00cc77' : '#ff4466', fontFamily: 'JetBrains Mono' }}>{pnlNum >= 0 ? '+' : ''}{pnlNum.toFixed(2)}$</div>
          </div>
          {gainsPercent && (
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 3 }}>GAINS %</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: isWin ? '#00cc77' : '#ff4466', fontFamily: 'JetBrains Mono' }}>{pnlNum >= 0 ? '+' : ''}{gainsPercent}%</div>
            </div>
          )}
        </div>
      )}

      {/* WIN / LOSS Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <button onClick={() => onClose('win', pnlNum, notes, { exitPrice, exitType })} disabled={saving}
          style={{ padding: 13, background: 'linear-gradient(135deg,#00cc77,#00aa66)', border: 'none', borderRadius: 10, color: '#000', fontFamily: 'Syne', fontWeight: 800, cursor: 'pointer', fontSize: 14 }}>
          WIN ▲
        </button>
        <button onClick={() => onClose('loss', pnlNum, notes, { exitPrice, exitType })} disabled={saving}
          style={{ padding: 13, background: '#ff4466', border: 'none', borderRadius: 10, color: '#fff', fontFamily: 'Syne', fontWeight: 800, cursor: 'pointer', fontSize: 14 }}>
          LOSS ▼
        </button>
      </div>
    </div>
  )
}

const card: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 16, minWidth: 0 }
const cardHidden: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 16, minWidth: 0, overflow: 'hidden' }
const title: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 12 }
const lbl2: React.CSSProperties = { fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 5, fontWeight: 600 }
const inp: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#e8e8f0', fontFamily: 'JetBrains Mono', fontSize: 13, outline: 'none', padding: '8px 10px', boxSizing: 'border-box', minWidth: 0 }
