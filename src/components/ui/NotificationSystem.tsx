'use client'
import { useState, useEffect } from 'react'

export type NotifType = 'danger' | 'warning' | 'success' | 'info'

export interface Notif {
  id: string; type: NotifType; title: string; message: string; duration?: number; read?: boolean
}

type Listener = (notifs: Notif[]) => void
const listeners: Listener[] = []
let notifStore: Notif[] = []

export function notify(notif: Omit<Notif, 'id'>) {
  const n: Notif = { ...notif, id: Date.now().toString() + Math.random(), read: false }
  notifStore = [n, ...notifStore].slice(0, 10)
  listeners.forEach(l => l([...notifStore]))
  // No auto-dismiss — notifications stay until user clears them
}

export function dismissNotif(id: string) {
  notifStore = notifStore.filter(n => n.id !== id)
  listeners.forEach(l => l([...notifStore]))
}

export function markAllRead() {
  notifStore = notifStore.map(n => ({ ...n, read: true }))
  listeners.forEach(l => l([...notifStore]))
}

const COLORS: Record<NotifType, { bg: string; border: string; dot: string; title: string }> = {
  danger:  { bg: 'rgba(255,68,102,0.08)',  border: 'rgba(255,68,102,0.2)',  dot: '#ff4466', title: '#ff4466' },
  warning: { bg: 'rgba(255,170,0,0.08)',   border: 'rgba(255,170,0,0.2)',   dot: '#ffaa00', title: '#ffaa00' },
  success: { bg: 'rgba(0,204,119,0.08)',   border: 'rgba(0,204,119,0.2)',   dot: '#00cc77', title: '#00cc77' },
  info:    { bg: 'rgba(0,204,255,0.08)',   border: 'rgba(0,204,255,0.2)',   dot: '#00ccff', title: '#00ccff' },
}
const ICONS: Record<NotifType, string> = { danger: '🚨', warning: '⚠️', success: '✅', info: '💡' }

export default function NotificationBell() {
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const listener: Listener = (n) => setNotifs(n)
    listeners.push(listener)
    return () => { const i = listeners.indexOf(listener); if (i > -1) listeners.splice(i, 1) }
  }, [])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const el = document.getElementById('notif-bell')
      if (el && !el.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const unread = notifs.filter(n => !n.read).length
  const hasDanger = notifs.some(n => n.type === 'danger' && !n.read)

  return (
    <div id="notif-bell" style={{ position: 'relative' }}>
      <button onClick={() => { setOpen(!open); if (!open) markAllRead() }}
        style={{ position: 'relative', background: open ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${hasDanger ? 'rgba(255,68,102,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
        🔔
        {unread > 0 && (
          <div style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: hasDanger ? '#ff4466' : '#ffaa00', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#000', fontFamily: 'JetBrains Mono' }}>
            {unread > 9 ? '9+' : unread}
          </div>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, width: 340, background: '#080810', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, boxShadow: '0 8px 40px rgba(0,0,0,0.8)', zIndex: 9999, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.2 }}>NOTIFICATIONS</div>
            {notifs.length > 0 && <button onClick={() => { notifStore = []; listeners.forEach(l => l([])) }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 11, fontFamily: 'Syne' }}>Clear all</button>}
          </div>
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {notifs.length === 0 ? (
              <div style={{ padding: '28px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🔕</div>No notifications
              </div>
            ) : notifs.map(n => {
              const col = COLORS[n.type]
              return (
                <div key={n.id} style={{ display: 'flex', gap: 10, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: n.read ? 'transparent' : col.bg }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: n.read ? 'transparent' : col.dot, marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: col.title, fontFamily: 'Syne' }}>{ICONS[n.type]} {n.title}</div>
                      <button onClick={() => dismissNotif(n.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: 14, padding: 0 }}>×</button>
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{n.message}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export function checkDisciplineAlerts(todayTrades: any[], profile: any) {
  const totalPnL = todayTrades.reduce((s: number, t: any) => s + (t.pnl || 0), 0)
  const balance = profile?.account_balance || 10000
  const maxDailyTrades = profile?.max_daily_trades || 5
  const revenges = todayTrades.filter((t: any) => t.is_revenge)

  if (totalPnL < -(balance * 0.03))
    notify({ type: 'danger', title: 'Daily Loss Limit!', message: `You lost ${Math.abs(totalPnL).toFixed(0)} (${((Math.abs(totalPnL)/balance)*100).toFixed(1)}% of balance). Stop trading today and come back tomorrow.`, duration: 0 })

  if (revenges.length > 0)
    notify({ type: 'danger', title: 'Revenge Trade Detected!', message: `You entered a trade right after a loss. Wait for the cooldown and stick to your strategy.`, duration: 8000 })

  if (todayTrades.length === 3)
    notify({ type: 'warning', title: 'Overtrading Warning', message: `You have placed 3 trades today. Think carefully before entering a new one.`, duration: 7000 })

  if (todayTrades.length >= maxDailyTrades)
    notify({ type: 'danger', title: 'Daily Limit Reached!', message: `You reached your daily limit of ${maxDailyTrades} trades — stop here for today.`, duration: 0 })

  const lastThree = todayTrades.slice(0, 3)
  if (lastThree.length === 3 && lastThree.every((t: any) => t.result === 'win'))
    notify({ type: 'success', title: 'Win Streak x3! 🔥', message: `3 consecutive wins! Stay disciplined — do not increase your lot size out of excitement.`, duration: 6000 })
}

export function showUpdateNotif(version: string, changes: string) {
  notify({ type: 'success', title: `Update v${version}`, message: changes, duration: 10000 })
}

export function showMaintenanceNotif(message: string) {
  notify({ type: 'info', title: 'Maintenance', message, duration: 0 })
}
