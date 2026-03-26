'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function getTrialInfo(trialStartDate: string | null, isPro: boolean) {
  if (isPro) return { isExpired: false, daysLeft: 999, isPro: true }
  if (!trialStartDate) return { isExpired: false, daysLeft: 15, isPro: false }
  const start = new Date(trialStartDate)
  const diffDays = Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24))
  const daysLeft = Math.max(0, 15 - diffDays)
  return { isExpired: daysLeft === 0, daysLeft, isPro: false }
}

export default function TrialBanner({ trialStartDate, isPro }: { trialStartDate: string | null, isPro: boolean }) {
  const router = useRouter()
  const [dismissed, setDismissed] = useState(false)
  const { isExpired, daysLeft } = getTrialInfo(trialStartDate, isPro)
  if (isPro || dismissed) return null
  if (isExpired) {
    return (
      <div style={{ background: 'rgba(255,68,102,0.1)', border: '1px solid rgba(255,68,102,0.3)', borderRadius: 10, padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🔒</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#ff4466' }}>Trial Expired</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Upgrade to Pro to continue using TRADIS</div>
          </div>
        </div>
        <button onClick={() => router.push('/upgrade')} style={{ padding: '8px 18px', background: 'linear-gradient(135deg,#00ff88,#00ccaa)', border: 'none', borderRadius: 8, color: '#000', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>Upgrade — $9/mo</button>
      </div>
    )
  }
  const color = daysLeft <= 3 ? '#ff4466' : daysLeft <= 7 ? '#ffaa00' : '#00ff88'
  const bgColor = daysLeft <= 3 ? 'rgba(255,68,102,0.08)' : daysLeft <= 7 ? 'rgba(255,170,0,0.08)' : 'rgba(0,255,136,0.06)'
  const borderColor = daysLeft <= 3 ? 'rgba(255,68,102,0.25)' : daysLeft <= 7 ? 'rgba(255,170,0,0.25)' : 'rgba(0,255,136,0.15)'
  return (
    <div style={{ background: bgColor, border: `1px solid ${borderColor}`, borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 16 }}>{daysLeft <= 3 ? '⚠️' : '🎯'}</span>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
          Free Trial — <span style={{ color, fontWeight: 700 }}>{daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => router.push('/upgrade')} style={{ padding: '6px 14px', background: 'linear-gradient(135deg,#00ff88,#00ccaa)', border: 'none', borderRadius: 7, color: '#000', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>Upgrade $9/mo</button>
        {daysLeft > 3 && <button onClick={() => setDismissed(true)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: 16, cursor: 'pointer', padding: '2px 4px' }}>×</button>}
      </div>
    </div>
  )
}
