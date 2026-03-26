'use client'
import React from 'react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import PreTradeGate from '@/components/trade/PreTradeGate'
import TradeJournal from '@/components/journal/TradeJournal'
import WeeklyReport from '@/components/dashboard/WeeklyReport'
import LangSwitcher from '@/components/ui/LangSwitcher'
import NotificationBell, { checkDisciplineAlerts, showUpdateNotif } from '@/components/ui/NotificationSystem'
import { getLang, t, Lang } from '@/lib/i18n'
import TrialBanner from '@/components/ui/TrialBanner'
import OnboardingFlow from '@/components/ui/OnboardingFlow'
import { Trade, Profile } from '@/types'

type Tab = 'pre-trade' | 'journal' | 'weekly'

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>('pre-trade')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [todayTrades, setTodayTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [disciplineScore, setDisciplineScore] = useState(100)
  const [revengeCount, setRevengeCount] = useState(0)
  const [allTimePnL, setAllTimePnL] = useState(0)
  const [demoTrades, setDemoTrades] = useState<any[]>([])
  const [lang, setLangState] = useState<Lang>('en')
  const [theme, setThemeState] = useState<'dark'|'light'>('dark')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'

  useEffect(() => {
    setLangState(getLang())
    const savedTheme = localStorage.getItem('tradis_theme') as 'dark'|'light'
    if (savedTheme) setThemeState(savedTheme)
    async function init() {
      if (isDemo) {
        const today = new Date().toISOString().split('T')[0]
        const d = (days: number) => { const d = new Date(); d.setDate(d.getDate()-days); return d.toISOString().split('T')[0] }
        setProfile({ id: 'demo', full_name: 'Demo Trader', account_balance: 10000, risk_percent: 2, max_daily_trades: 10, email: 'demo@tradis.app' } as any)
        const demoTrades = [
          { id:'1', pair:'EURUSD', direction:'BUY', pnl:357, result:'win', is_revenge:false, date:today, entry:1.085, stop_loss:1.082, take_profit:1.091, lot_size:0.1, strategy:'Structure Break', mood:4, planned_rr:2, notes:'Good setup', created_at:'', exit_price:1.091, duration_minutes:45, gains_percent:3.57 },
          { id:'2', pair:'GBPUSD', direction:'SELL', pnl:525, result:'win', is_revenge:false, date:today, entry:1.265, stop_loss:1.268, take_profit:1.259, lot_size:0.07, strategy:'FVG', mood:4, planned_rr:2, notes:'', created_at:'', exit_price:1.259, duration_minutes:30, gains_percent:5.25 },
          { id:'3', pair:'XAUUSD', direction:'BUY', pnl:850, result:'win', is_revenge:false, date:d(1), entry:2315, stop_loss:2308, take_profit:2329, lot_size:0.05, strategy:'Structure Break', mood:3, planned_rr:2, notes:'Strong momentum', created_at:'', exit_price:2329, duration_minutes:90, gains_percent:8.5 },
          { id:'4', pair:'USDJPY', direction:'BUY', pnl:1604, result:'win', is_revenge:false, date:d(2), entry:149.5, stop_loss:149.1, take_profit:150.3, lot_size:0.2, strategy:'Trend Continuation', mood:4, planned_rr:2, notes:'Perfect entry', created_at:'', exit_price:150.3, duration_minutes:120, gains_percent:16.04 },
          { id:'5', pair:'EURUSD', direction:'SELL', pnl:-122, result:'loss', is_revenge:false, date:d(2), entry:1.088, stop_loss:1.091, take_profit:1.082, lot_size:0.1, strategy:'FVG', mood:3, planned_rr:2, notes:'SL hit', created_at:'', exit_price:1.091, duration_minutes:20, gains_percent:-1.22 },
          { id:'6', pair:'GBPUSD', direction:'BUY', pnl:-95, result:'loss', is_revenge:true, date:d(2), entry:1.268, stop_loss:1.265, take_profit:1.274, lot_size:0.08, strategy:'Structure Break', mood:1, planned_rr:2, notes:'Revenge trade', created_at:'', exit_price:1.265, duration_minutes:15, gains_percent:-0.95 },
          { id:'7', pair:'USDJPY', direction:'SELL', pnl:420, result:'win', is_revenge:false, date:d(3), entry:150.2, stop_loss:150.5, take_profit:149.6, lot_size:0.15, strategy:'Order Block', mood:4, planned_rr:2, notes:'', created_at:'', exit_price:149.6, duration_minutes:60, gains_percent:4.2 },
          { id:'8', pair:'EURUSD', direction:'BUY', pnl:275, result:'win', is_revenge:false, date:d(4), entry:1.082, stop_loss:1.079, take_profit:1.088, lot_size:0.1, strategy:'FVG', mood:4, planned_rr:2, notes:'', created_at:'', exit_price:1.088, duration_minutes:75, gains_percent:2.75 },
          { id:'9', pair:'XAUUSD', direction:'SELL', pnl:-180, result:'loss', is_revenge:false, date:d(5), entry:2320, stop_loss:2326, take_profit:2308, lot_size:0.05, strategy:'Structure Break', mood:3, planned_rr:2, notes:'News hit SL', created_at:'', exit_price:2326, duration_minutes:25, gains_percent:-1.8 },
          { id:'10', pair:'GBPUSD', direction:'BUY', pnl:380, result:'win', is_revenge:false, date:d(6), entry:1.261, stop_loss:1.258, take_profit:1.267, lot_size:0.1, strategy:'Trend Continuation', mood:4, planned_rr:2, notes:'', created_at:'', exit_price:1.267, duration_minutes:55, gains_percent:3.8 },
          { id:'11', pair:'USDJPY', direction:'BUY', pnl:890, result:'win', is_revenge:false, date:d(7), entry:148.8, stop_loss:148.4, take_profit:149.6, lot_size:0.2, strategy:'Order Block', mood:5, planned_rr:2, notes:'Best setup this week', created_at:'', exit_price:149.6, duration_minutes:100, gains_percent:8.9 },
          { id:'12', pair:'EURUSD', direction:'SELL', pnl:-95, result:'loss', is_revenge:true, date:d(7), entry:1.086, stop_loss:1.089, take_profit:1.080, lot_size:0.1, strategy:'FVG', mood:2, planned_rr:2, notes:'Should not have entered', created_at:'', exit_price:1.089, duration_minutes:18, gains_percent:-0.95 },
          { id:'13', pair:'XAUUSD', direction:'BUY', pnl:560, result:'win', is_revenge:false, date:d(8), entry:2308, stop_loss:2302, take_profit:2320, lot_size:0.05, strategy:'Structure Break', mood:4, planned_rr:2, notes:'', created_at:'', exit_price:2320, duration_minutes:85, gains_percent:5.6 },
          { id:'14', pair:'GBPUSD', direction:'SELL', pnl:195, result:'win', is_revenge:false, date:d(9), entry:1.270, stop_loss:1.273, take_profit:1.264, lot_size:0.08, strategy:'FVG', mood:4, planned_rr:2, notes:'', created_at:'', exit_price:1.264, duration_minutes:40, gains_percent:1.95 },
          { id:'15', pair:'USDJPY', direction:'BUY', pnl:458, result:'win', is_revenge:false, date:d(10), entry:149.0, stop_loss:148.6, take_profit:149.8, lot_size:0.15, strategy:'Trend Continuation', mood:4, planned_rr:2, notes:'', created_at:'', exit_price:149.8, duration_minutes:70, gains_percent:4.58 },
        ]
        setDemoTrades(demoTrades)
        setTodayTrades(demoTrades.filter(t => t.date === today) as any)
        setAllTimePnL(demoTrades.reduce((s,t) => s+(t.pnl||0), 0))
        setRevengeCount(demoTrades.filter(t => t.date === today && t.is_revenge).length)
        setDisciplineScore(Math.max(0, 100 - demoTrades.filter(t => t.date === today && t.is_revenge).length * 20))
        setLoading(false)
        return
      }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)
      if (prof && !prof.onboarding_done && !isDemo) setShowOnboarding(true)
      await loadTodayTrades(user.id, prof)
      const { data: allT } = await supabase.from('trades').select('pnl').eq('user_id', user.id)
      setAllTimePnL((allT || []).reduce((s: number, t: any) => s + (t.pnl || 0), 0))
      setLoading(false)
      showUpdateNotif('1.1', 'Discipline Analysis + Notifications zdaw! Check Performance tab.')
    }
    init()
    function handleStorage() { setLangState(getLang()) }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  async function loadTodayTrades(userId?: string, prof?: any) {
    const { data: { user } } = await supabase.auth.getUser()
    const uid = userId || user?.id
    if (!uid) return
    const today = new Date().toISOString().split('T')[0]
    const { data: trades } = await supabase.from('trades').select('*').eq('user_id', uid).eq('date', today)
    setTodayTrades(trades || [])
    const currentProfile = prof || profile
    if (currentProfile) checkDisciplineAlerts(trades || [], currentProfile)
    const revenge = (trades || []).filter((t: Trade) => t.is_revenge).length
    setRevengeCount(revenge)
    setDisciplineScore(Math.max(0, 100 - revenge * 20))
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (showOnboarding && profile) return (
    <OnboardingFlow
      lang={lang}
      userId={profile.id}
      userName={profile.full_name || profile.username || ''}
      onComplete={() => setShowOnboarding(false)}
    />
  )

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#00ff88', fontFamily: 'JetBrains Mono', fontSize: '14px' }}>Loading...</div>
    </div>
  )

  const totalPnL = todayTrades.reduce((s, tt) => s + tt.pnl, 0)
  const isRTL = false
  const isDark = theme === 'dark'
  const bg = isDark ? '#0a0a0f' : '#f0f2f5'
  const bgHeader = isDark ? '#000000' : '#ffffff'
  const bgCard = isDark ? '#000000' : '#ffffff'
  const bgTabs = isDark ? '#0d0d18' : '#e8eaf0'
  const border = isDark ? '#1a1a1a' : '#e0e0e0'
  const border2 = isDark ? '#1e1e30' : '#e0e0e0'
  const textColor = isDark ? '#e8e8f0' : '#0a0a0f'
  const currentBalance = (profile?.account_balance || 0) + allTimePnL

  return (
    <div style={{ minHeight: '100vh', background: bg, color: textColor, fontFamily: 'Syne, sans-serif', direction: isRTL ? 'rtl' : 'ltr' }}>
      <div style={{ background: bgHeader, borderBottom: `1px solid ${border}`, padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <img src="/logo-nav.jpg" alt="TRADIS" style={{ height: '56px', objectFit: 'contain' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
<NotificationBell />
          <ProfileDropdown profile={profile} lang={lang} theme={theme} onThemeChange={(t: 'dark'|'light') => { setThemeState(t); localStorage.setItem('tradis_theme', t) }} onProfile={() => router.push('/profile')} onLangChange={(l: string) => { localStorage.setItem('tradis_lang', l); setLangState(l as Lang); window.dispatchEvent(new StorageEvent('storage', { key: 'tds_lang', newValue: l })) }} onLogout={logout} onSettings={() => router.push('/settings')} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#1e1e30', borderBottom: '1px solid #1e1e30' }}>
        {[
          { label: t('balance', lang), val: '$' + currentBalance.toFixed(2), color: currentBalance >= (profile?.account_balance || 0) ? '#00ff88' : '#ff4466' },
          { label: t('pnlToday', lang), val: totalPnL !== 0 ? (totalPnL > 0 ? '+' : '') + totalPnL.toFixed(0) + '$' : '—', color: totalPnL >= 0 ? '#00ff88' : '#ff4466' },
          { label: t('revenge', lang), val: revengeCount, color: revengeCount > 0 ? '#ffaa00' : '#555570' },
          { label: t('disciplineScore', lang), val: disciplineScore + '/100', color: disciplineScore > 70 ? '#00ff88' : disciplineScore > 40 ? '#ffaa00' : '#ff4466' },
        ].map(s => (
          <div key={s.label as string} style={{ background: bgCard, padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: s.color as string, fontFamily: 'JetBrains Mono' }}>{s.val}</div>
            <div style={{ fontSize: '9px', color: '#555570', letterSpacing: '0.5px', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: '8px 24px 0' }}>
        <TrialBanner trialStartDate={profile?.trial_start_date || null} isPro={profile?.is_pro || false} />
      </div>
      <div style={{ display: 'flex', background: bgTabs, borderBottom: `1px solid ${border2}` }}>
        {(['pre-trade', 'journal', 'weekly'] as Tab[]).map(tb => (
          <button key={tb} onClick={() => setTab(tb)} style={{ flex: 1, padding: '12px', border: 'none', background: 'none', color: tab === tb ? '#e8e8f0' : '#555570', fontFamily: 'Syne', fontSize: '12px', fontWeight: 600, cursor: 'pointer', borderBottom: tab === tb ? '2px solid #00ff88' : '2px solid transparent' }}>
            {tb === 'pre-trade' ? t('preTrade', lang) : tb === 'journal' ? t('journal', lang) : 'Report'}
          </button>
        ))}
      </div>
      <div style={{ padding: '16px 24px' }}>
        {tab === 'pre-trade' && <PreTradeGate profile={profile} todayTrades={todayTrades} onTradeAdded={() => loadTodayTrades()} />}
        {tab === 'journal' && <TradeJournal userId={profile?.id} profile={profile} lang={lang} demoTrades={isDemo ? demoTrades : undefined} />}
        {tab === 'weekly' && <WeeklyReport userId={profile?.id} profile={profile} lang={lang} demoTrades={isDemo ? demoTrades : undefined} />}
      </div>
    </div>
  )
function ProfileDropdown({ profile, lang, theme, onThemeChange, onLangChange, onLogout, onSettings, onProfile }: any) {
  const [open, setOpen] = React.useState(false)
  const initials = profile?.full_name ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0,2) : 'TR'
  const LANGS = [{ code: 'en', flag: '🇬🇧', label: 'English' }, { code: 'fr', flag: '🇫🇷', label: 'Français' }, { code: 'es', flag: '🇪🇸', label: 'Español' }]
  return (
    <div style={{ position: 'relative' }}>
      <div onClick={() => setOpen(!open)} style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#00cc77,#00aa66)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontFamily: 'Syne', fontWeight: 800, fontSize: 13, color: '#000', userSelect: 'none' }}>
        {initials}
      </div>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
          <div style={{ position: 'absolute', top: 46, right: 0, width: 220, background: '#0d0d18', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 8, zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{profile?.full_name || 'Trader'}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{profile?.email || ''}</div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '6px 0' }} />

            <div onClick={() => { onProfile(); setOpen(false) }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
              <span>👤</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Profile</span>
            </div>
            <div onClick={() => { onSettings(); setOpen(false) }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
              <span>⚙️</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Settings</span>
            </div>
            <div onClick={() => { onLogout(); setOpen(false) }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,68,102,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
              <span>🚪</span>
              <span style={{ fontSize: 13, color: '#ff4466' }}>Logout</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

}

function AccountSwitcher({ accounts, active, onChange, onAdd }: any) {
  const [open, setOpen] = React.useState(false)
  if (!accounts?.length) return null
  return (
    <div style={{ position: 'relative' }}>
      <div onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'rgba(0,204,119,0.08)', border: '1px solid rgba(0,204,119,0.2)', borderRadius: 8, cursor: 'pointer', fontFamily: 'Syne' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00cc77' }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#00cc77', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{active?.name || 'Select'}</span>
        <span style={{ fontSize: 10, color: 'rgba(0,204,119,0.6)' }}>▾</span>
      </div>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
          <div style={{ position: 'absolute', top: 42, right: 0, width: 220, background: '#0d0d18', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 8, zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: 1.2, padding: '4px 8px 8px' }}>TRADING ACCOUNTS</div>
            {accounts.map((acc: any) => (
              <div key={acc.id} onClick={() => { onChange(acc); setOpen(false) }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: 8, cursor: 'pointer', background: active?.id === acc.id ? 'rgba(0,204,119,0.1)' : 'none', marginBottom: 2 }}
                onMouseEnter={e => (e.currentTarget.style.background = active?.id === acc.id ? 'rgba(0,204,119,0.12)' : 'rgba(255,255,255,0.04)')}
                onMouseLeave={e => (e.currentTarget.style.background = active?.id === acc.id ? 'rgba(0,204,119,0.1)' : 'none')}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: active?.id === acc.id ? '#00cc77' : '#fff' }}>{acc.name}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{acc.broker} • ${(acc.balance || 0).toLocaleString()}</div>
                </div>
                {active?.id === acc.id && <span style={{ color: '#00cc77', fontSize: 12 }}>✓</span>}
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '6px 0' }} />
            <div onClick={() => { onAdd(); setOpen(false) }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
              <span style={{ fontSize: 16, color: '#00cc77' }}>+</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Add Account</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
