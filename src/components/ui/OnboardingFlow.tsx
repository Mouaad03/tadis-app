'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

const T = {
  en: {
    welcome: 'Welcome to TRADIS',
    welcomeSub: 'Your trading discipline starts now.',
    step1: 'Setup Your Account',
    step2: 'Set Your Risk',
    step3: 'Build Your Checklist',
    step4: "You're Ready!",
    name: 'Your trading name',
    namePh: 'e.g. John',
    balance: 'Account balance ($)',
    balancePh: 'e.g. 10000',
    risk: 'Risk per trade (%)',
    riskPh: 'e.g. 2',
    maxTrades: 'Max trades per day',
    checklist: 'Add your first rule',
    checklistPh: 'e.g. SL behind structure',
    add: 'Add',
    next: 'Next →',
    finish: 'Start Trading',
    skip: 'Skip',
    readySub: 'TRADIS will enforce your discipline on every trade.',
    of: 'of',
    conditions: 'conditions added',
    condition: 'condition added',
  },
  fr: {
    welcome: 'Bienvenue sur TRADIS',
    welcomeSub: 'Votre discipline de trading commence maintenant.',
    step1: 'Configurer votre compte',
    step2: 'Définir votre risque',
    step3: 'Construire votre checklist',
    step4: 'Vous êtes prêt !',
    name: 'Votre nom de trading',
    namePh: 'ex. Jean',
    balance: 'Solde du compte ($)',
    balancePh: 'ex. 10000',
    risk: 'Risque par trade (%)',
    riskPh: 'ex. 2',
    maxTrades: 'Max trades par jour',
    checklist: 'Ajoutez votre première règle',
    checklistPh: 'ex. SL derrière la structure',
    add: 'Ajouter',
    next: 'Suivant →',
    finish: 'Commencer',
    skip: 'Passer',
    readySub: 'TRADIS va enforcer votre discipline à chaque trade.',
    of: 'sur',
    conditions: 'conditions ajoutées',
    condition: 'condition ajoutée',
  },
  es: {
    welcome: 'Bienvenido a TRADIS',
    welcomeSub: 'Tu disciplina de trading comienza ahora.',
    step1: 'Configura tu cuenta',
    step2: 'Define tu riesgo',
    step3: 'Construye tu checklist',
    step4: '¡Estás listo!',
    name: 'Tu nombre de trading',
    namePh: 'ej. Juan',
    balance: 'Saldo de cuenta ($)',
    balancePh: 'ej. 10000',
    risk: 'Riesgo por operación (%)',
    riskPh: 'ej. 2',
    maxTrades: 'Máx operaciones por día',
    checklist: 'Añade tu primera regla',
    checklistPh: 'ej. SL detrás de estructura',
    add: 'Añadir',
    next: 'Siguiente →',
    finish: 'Empezar',
    skip: 'Omitir',
    readySub: 'TRADIS reforzará tu disciplina en cada operación.',
    of: 'de',
    conditions: 'condiciones añadidas',
    condition: 'condición añadida',
  },
  ar: {
    welcome: 'مرحباً بك في تراديس',
    welcomeSub: 'انضباطك في التداول يبدأ الآن.',
    step1: 'إعداد حسابك',
    step2: 'تحديد المخاطرة',
    step3: 'بناء قائمة الشروط',
    step4: 'أنت جاهز!',
    name: 'اسم التداول',
    namePh: 'مثال: أحمد',
    balance: 'رصيد الحساب ($)',
    balancePh: 'مثال: 10000',
    risk: 'المخاطرة لكل صفقة (%)',
    riskPh: 'مثال: 2',
    maxTrades: 'أقصى عدد صفقات يومياً',
    checklist: 'أضف قاعدتك الأولى',
    checklistPh: 'مثال: وقف الخسارة خلف الهيكل',
    add: 'إضافة',
    next: 'التالي →',
    finish: 'ابدأ التداول',
    skip: 'تخطي',
    readySub: 'تراديس سيطبق انضباطك في كل صفقة.',
    of: 'من',
    conditions: 'شروط مضافة',
    condition: 'شرط مضاف',
  },
}

type Lang = 'en' | 'fr' | 'es' | 'ar'

interface Props {
  lang: Lang
  userId: string
  userName: string
  onComplete: () => void
}

export default function OnboardingFlow({ lang, userId, userName, onComplete }: Props) {
  const l = T[lang] || T.en
  const isRTL = lang === 'ar'
  const [step, setStep] = useState(0)
  const [balance, setBalance] = useState('')
  const [risk, setRisk] = useState('2')
  const [maxTrades, setMaxTrades] = useState('10')
  const [conditions, setConditions] = useState<string[]>([])
  const [newCondition, setNewCondition] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const steps = [l.step1, l.step2, l.step3, l.step4]

  async function finish() {
    setSaving(true)
    await supabase.from('profiles').update({
      account_balance: parseFloat(balance) || 0,
      risk_percent: parseFloat(risk) || 2,
      max_daily_trades: parseInt(maxTrades) || 10,
      onboarding_done: true,
    }).eq('id', userId)

    // Save checklist conditions
    if (conditions.length > 0) {
      const rows = conditions.map((text, i) => ({
        user_id: userId,
        text,
        category: 'CUSTOM',
        order_index: i,
        is_active: true,
      }))
      await supabase.from('checklist_items').insert(rows)
    }
    setSaving(false)
    onComplete()
  }

  function addCondition() {
    if (!newCondition.trim()) return
    setConditions([...conditions, newCondition.trim()])
    setNewCondition('')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    color: '#fff',
    fontFamily: 'Syne, sans-serif',
    fontSize: 15,
    outline: 'none',
    direction: isRTL ? 'rtl' : 'ltr',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 8,
    display: 'block',
    direction: isRTL ? 'rtl' : 'ltr',
  }

  const btnStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg,#00ff88,#00ccaa)',
    border: 'none',
    borderRadius: 10,
    color: '#000',
    fontFamily: 'Syne, sans-serif',
    fontWeight: 800,
    fontSize: 15,
    cursor: 'pointer',
    marginTop: 8,
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      fontFamily: 'Syne, sans-serif',
      direction: isRTL ? 'rtl' : 'ltr',
    }}>
      <div style={{
        width: '100%', maxWidth: 480,
        background: '#0a0a0f',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: 32,
        position: 'relative',
      }}>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 24 : 8, height: 8,
              borderRadius: 4,
              background: i <= step ? '#00ff88' : 'rgba(255,255,255,0.1)',
              transition: 'all .3s',
            }} />
          ))}
        </div>

        {/* Step label */}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#00ff88', letterSpacing: 2, marginBottom: 8, textAlign: 'center' }}>
          {l.of ? `${step + 1} ${l.of} ${steps.length}` : ''} — {steps[step]}
        </div>

        {/* STEP 0 — Welcome + Name */}
        {step === 0 && (
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: 8, letterSpacing: '-1px' }}>
              {l.welcome}
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginBottom: 32 }}>
              {l.welcomeSub}
            </p>
            <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 24 }}>👋</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', textAlign: 'center', marginBottom: 32 }}>
              {userName ? `${userName}!` : ''}
            </div>
            <button onClick={() => setStep(1)} style={btnStyle}>{l.next}</button>
          </div>
        )}

        {/* STEP 1 — Balance + Risk */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 24 }}>{l.step1}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>{l.balance}</label>
                <input value={balance} onChange={e => setBalance(e.target.value)} placeholder={l.balancePh} type="number" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{l.risk}</label>
                <input value={risk} onChange={e => setRisk(e.target.value)} placeholder={l.riskPh} type="number" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{l.maxTrades}</label>
                <input value={maxTrades} onChange={e => setMaxTrades(e.target.value)} placeholder="10" type="number" style={inputStyle} />
              </div>
            </div>
            <button onClick={() => setStep(2)} style={{ ...btnStyle, marginTop: 24 }}>{l.next}</button>
            <button onClick={() => setStep(2)} style={{ width: '100%', background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: 12, cursor: 'pointer', marginTop: 12, fontFamily: 'Syne' }}>{l.skip}</button>
          </div>
        )}

        {/* STEP 2 — Checklist */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{l.step3}</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 20 }}>
              {conditions.length} {conditions.length === 1 ? l.condition : l.conditions}
            </p>

            {/* Existing conditions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, maxHeight: 160, overflowY: 'auto' }}>
              {conditions.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: 8 }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>✓ {c}</span>
                  <button onClick={() => setConditions(conditions.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: 16 }}>×</button>
                </div>
              ))}
            </div>

            {/* Add input */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={newCondition}
                onChange={e => setNewCondition(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCondition()}
                placeholder={l.checklistPh}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button onClick={addCondition} style={{ padding: '14px 18px', background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 10, color: '#00ff88', fontFamily: 'Syne', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>{l.add}</button>
            </div>

            <button onClick={() => setStep(3)} style={{ ...btnStyle, marginTop: 20 }}>{l.next}</button>
            <button onClick={() => setStep(3)} style={{ width: '100%', background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: 12, cursor: 'pointer', marginTop: 12, fontFamily: 'Syne' }}>{l.skip}</button>
          </div>
        )}

        {/* STEP 3 — Ready */}
        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🚀</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-1px' }}>{l.step4}</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', marginBottom: 32, lineHeight: 1.6 }}>{l.readySub}</p>

            {/* Summary */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 32, justifyContent: 'center' }}>
              {[
                { val: balance ? '$' + parseFloat(balance).toLocaleString() : '—', label: 'Balance' },
                { val: risk + '%', label: 'Risk' },
                { val: conditions.length || '—', label: 'Rules' },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, padding: '12px 8px', background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.1)', borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#00ff88', fontFamily: 'JetBrains Mono' }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <button onClick={finish} disabled={saving} style={btnStyle}>
              {saving ? '...' : l.finish}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
