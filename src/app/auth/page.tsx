'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

const FLAGS: Record<string, string> = { en: '🇬🇧', fr: '🇫🇷', ar: '🇸🇦', es: '🇪🇸' }
const LANG_NAMES: Record<string, string> = { en: 'English', fr: 'Français', ar: 'العربية', es: 'Español' }

const T: Record<string, Record<string, string>> = {
  en: { create: 'Create account', login: 'Login', title_register: 'Start trading with discipline', title_login: 'Welcome back', sub_register: 'Free account — no credit card needed', sub_login: 'Login to your TRADIS account', name: 'Trading name', name_ph: 'Your name', country: 'Country', country_ph: 'Your country', email: 'Email', password: 'Password', btn_register: 'Create Free Account', btn_login: 'Login', already: 'Already have an account? Login', no_account: "Don't have an account? Sign up free", terms: 'By creating an account, you agree to our Terms of Service.' },
  fr: { create: 'Créer un compte', login: 'Connexion', title_register: 'Commencez à trader avec discipline', title_login: 'Content de vous revoir', sub_register: 'Compte gratuit — sans carte bancaire', sub_login: 'Connectez-vous à votre compte TRADIS', name: 'Nom de trading', name_ph: 'Votre nom', country: 'Pays', country_ph: 'Votre pays', email: 'Email', password: 'Mot de passe', btn_register: 'Créer un compte gratuit', btn_login: 'Se connecter', already: 'Déjà un compte ? Connexion', no_account: "Pas encore de compte ? S'inscrire", terms: "En créant un compte, vous acceptez nos conditions d'utilisation." },
  ar: { create: 'إنشاء حساب', login: 'دخول', title_register: 'ابدأ التداول بانضباط', title_login: 'مرحباً بعودتك', sub_register: 'حساب مجاني — بدون بطاقة بنكية', sub_login: 'سجل دخولك إلى حساب تراديس', name: 'اسم التداول', name_ph: 'اسمك', country: 'البلد', country_ph: 'بلدك', email: 'البريد الإلكتروني', password: 'كلمة المرور', btn_register: 'إنشاء حساب مجاني', btn_login: 'تسجيل الدخول', already: 'لديك حساب؟ تسجيل الدخول', no_account: 'ليس لديك حساب؟ سجل الآن', terms: 'بإنشاء حساب، أنت توافق على شروط الخدمة.' },
  es: { create: 'Crear cuenta', login: 'Iniciar sesión', title_register: 'Empieza a operar con disciplina', title_login: 'Bienvenido de nuevo', sub_register: 'Cuenta gratuita — sin tarjeta de crédito', sub_login: 'Inicia sesión en tu cuenta TRADIS', name: 'Nombre de trading', name_ph: 'Tu nombre', country: 'País', country_ph: 'Tu país', email: 'Email', password: 'Contraseña', btn_register: 'Crear cuenta gratis', btn_login: 'Iniciar sesión', already: '¿Ya tienes cuenta? Iniciar sesión', no_account: '¿No tienes cuenta? Regístrate gratis', terms: 'Al crear una cuenta, aceptas nuestros términos de servicio.' },
}

export default function AuthPage() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  const [isLogin, setIsLogin] = useState(mode !== 'register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotMsg, setForgotMsg] = useState('')

  async function handleForgot() {
    if (!forgotEmail) return
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: window.location.origin + '/reset-password'
    })
    if (error) setForgotMsg('Error: ' + error.message)
    else setForgotMsg('Check your email for reset link!')
  }
  const [name, setName] = useState('')
  const [country, setCountry] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [lang, setLang] = useState('en')
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()
  const t = T[lang] || T.en
  const isRTL = lang === 'ar'

  useEffect(() => {
    setIsLogin(mode !== 'register')
    const saved = localStorage.getItem('tradis_lang')
    if (saved && T[saved]) setLang(saved)
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [mode])

  function changeLang(l: string) { setLang(l); localStorage.setItem('tradis_lang', l); setLangOpen(false) }

  async function handleSubmit() {
    setLoading(true); setMsg('')
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMsg(error.message)
      else router.push('/dashboard')
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username: name, country } } })
      if (error) {
        setMsg(error.message)
      } else if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: email,
          full_name: name,
          country: country,
          trial_start_date: new Date().toISOString(),
          is_pro: false,
          account_balance: 0,
          risk_percent: 2,
          max_daily_trades: 10,
        })
        setMsg('Account created! Check your email to confirm.')
        setTimeout(() => router.push('/dashboard'), 2000)
      }
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 20px 40px', fontFamily: 'Syne, sans-serif', direction: isRTL ? 'rtl' : 'ltr' }}>
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap'); * { box-sizing: border-box; }` }} />

      {/* Top bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', background: '#000', borderBottom: '1px solid rgba(255,255,255,0.07)', zIndex: 100 }}>
        <div style={{ cursor: 'pointer' }} onClick={() => router.push('/')}>
          <img src="/logo-nav.jpg" alt="TRADIS" style={{ height: 56, width: 'auto', display: 'block' }} />
        </div>
        <div ref={langRef} style={{ position: 'relative' }}>
          <button onClick={() => setLangOpen(!langOpen)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff', fontFamily: 'Syne', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <span style={{ fontSize: 16 }}>{FLAGS[lang]}</span>
            <span>{lang.toUpperCase()}</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{langOpen ? '▲' : '▼'}</span>
          </button>
          {langOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden', minWidth: 160, zIndex: 300 }}>
              {['en','fr','ar','es'].map(l => (
                <button key={l} onClick={() => changeLang(l)} style={{ width: '100%', padding: '12px 16px', background: lang === l ? 'rgba(255,255,255,0.07)' : 'none', border: 'none', color: lang === l ? '#fff' : 'rgba(255,255,255,0.55)', fontFamily: 'Syne', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{FLAGS[l]}</span>
                  <span>{LANG_NAMES[l]}</span>
                  {lang === l && <span style={{ marginLeft: 'auto', fontSize: 12 }}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Toggle */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 4, marginBottom: 32 }}>
          <button onClick={() => setIsLogin(false)} style={{ flex: 1, padding: '10px', background: !isLogin ? '#ffffff' : 'none', border: 'none', borderRadius: 10, color: !isLogin ? '#000000' : 'rgba(255,255,255,0.5)', fontFamily: 'Syne', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all .2s' }}>{t.create}</button>
          <button onClick={() => setIsLogin(true)} style={{ flex: 1, padding: '10px', background: isLogin ? '#ffffff' : 'none', border: 'none', borderRadius: 10, color: isLogin ? '#000000' : 'rgba(255,255,255,0.5)', fontFamily: 'Syne', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all .2s' }}>{t.login}</button>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', letterSpacing: '-1px', marginBottom: 8 }}>
            {isLogin ? t.title_login : t.title_register}
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>
            {isLogin ? t.sub_login : t.sub_register}
          </p>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!isLogin && (
            <div>
              <div style={labelStyle}>{t.name}</div>
              <input value={name} onChange={e => setName(e.target.value)} placeholder={t.name_ph} style={inputStyle} />
            </div>
          )}
          {!isLogin && (
            <div>
              <div style={labelStyle}>{t.country}</div>
              <input value={country} onChange={e => setCountry(e.target.value)} placeholder={t.country_ph} style={inputStyle} />
            </div>
          )}
          <div>
            <div style={labelStyle}>{t.email}</div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" style={inputStyle} />
          </div>
          <div>
            <div style={labelStyle}>{t.password}</div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder="••••••••" style={inputStyle} />
            {isLogin && <button onClick={() => setForgotMode(true)} style={{ background: 'none', border: 'none', color: 'rgba(0,255,136,0.7)', fontSize: 12, cursor: 'pointer', fontFamily: 'Syne', marginTop: 6, textAlign: 'right', width: '100%' }}>Forgot password?</button>}
          </div>

          {forgotMode && (
            <div style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Enter your email to reset password</div>
              <input value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="your@email.com" style={{ ...inputStyle, marginBottom: 8 }} />
              {forgotMsg && <div style={{ fontSize: 12, color: forgotMsg.includes('Check') ? '#00ff88' : '#ff4466', marginBottom: 8 }}>{forgotMsg}</div>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleForgot} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg,#00ff88,#00ccaa)', border: 'none', borderRadius: 8, color: '#000', fontFamily: 'Syne', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>Send Reset Link</button>
                <button onClick={() => { setForgotMode(false); setForgotMsg('') }} style={{ padding: '10px 16px', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.4)', fontFamily: 'Syne', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}

          {msg && <div style={{ fontSize: 13, color: msg.includes('created') || msg.includes('Check') ? '#00ff88' : '#ff4466', padding: '10px 14px', background: msg.includes('created') || msg.includes('Check') ? 'rgba(0,255,136,0.08)' : 'rgba(255,68,102,0.08)', borderRadius: 8 }}>{msg}</div>}

          <button onClick={handleSubmit} disabled={loading} style={{ padding: '14px', background: 'linear-gradient(135deg, #00ff88, #00ccaa)', border: 'none', borderRadius: 10, color: '#000000', fontFamily: 'Syne', fontWeight: 800, fontSize: 15, cursor: 'pointer', marginTop: 4 }}>
            {loading ? '...' : isLogin ? t.btn_login : t.btn_register}
          </button>

          {!isLogin && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center', lineHeight: 1.5 }}>{t.terms}</div>}
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 13, cursor: 'pointer', fontFamily: 'Syne' }}>
            {isLogin ? t.no_account : t.already}
          </button>
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 6, fontWeight: 600 }
const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#ffffff', fontFamily: 'JetBrains Mono', fontSize: 14, outline: 'none' }
