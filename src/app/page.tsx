'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const LANGS = {
  en: {
    nav: ['Features', 'How it works', 'Pricing'],
    hero_tag: 'Trading Psychology Tool',
    hero_h1: 'Stop losing trades\nto your emotions.',
    hero_sub: 'TRADIS enforces discipline before every trade. Pre-trade checklist, real-time risk calculator, AI coaching — all in one.',
    hero_cta: 'Start Free',
    hero_cta2: 'See how it works',
    stats: [['10x', 'Less revenge trades'], ['2min', 'Setup time'], ['4', 'Languages']],
    feat_title: 'Everything a disciplined trader needs',
    features: [
      { icon: '🚦', title: 'Pre-Trade Gate', desc: 'Blocked from entering until your checklist is complete. No exceptions.' },
      { icon: '📊', title: 'Live Lot Calculator', desc: 'Auto-fills entry, SL and TP with current market price. Calculates lot size instantly.' },
      { icon: '⏱', title: 'Revenge Timer', desc: '30-minute cooldown after every loss. Forces emotional reset before next trade.' },
      { icon: '🤖', title: 'AI Coach', desc: 'Claude AI analyzes each trade and gives you honest feedback. Weekly behavior report.' },
      { icon: '📓', title: 'Trade Journal', desc: 'Calendar view with screenshots, notes, win rate, and discipline score per day.' },
      { icon: '🎯', title: 'Custom Checklist', desc: 'Build your own pre-trade rules. Add, edit, remove conditions. Saved per account.' },
    ],
    how_title: 'How TRADIS works',
    steps: [
      { n: '01', title: 'Set your rules', desc: 'Add your checklist conditions, strategies, account balance and risk %.' },
      { n: '02', title: 'Before every trade', desc: 'Select pair → live price loads → fill checklist → only then you can enter.' },
      { n: '03', title: 'After close', desc: 'Log result. AI gives instant feedback. Discipline score updates.' },
      { n: '04', title: 'Weekly review', desc: 'AI generates a full coaching report. See patterns. Improve week by week.' },
    ],
    price_title: 'Simple pricing',
    plans: [
      { name: 'TRADIS Pro', price: '$9', period: '/month', badge: '15 days free', features: ['15-day free trial — no credit card', 'All features unlocked', 'AI weekly + monthly reports', 'Full performance analytics', 'Export CSV', 'Cancel anytime'], cta: 'Start Free Trial', highlight: true },
    ],
    faq_title: 'FAQ',
    faqs: [
      { q: 'Do I need to connect my broker?', a: 'No. TRADIS is a discipline tool, not a broker. You enter trades manually — no API connection needed.' },
      { q: 'What pairs are supported?', a: 'All Forex pairs, Gold, Silver, major Indices (SPX, NAS, DAX...) and top Crypto pairs.' },
      { q: 'Is my data private?', a: 'Yes. Your trades and checklist are stored in your private account. We never share or sell data.' },
    ],
    footer: '© 2026 TRADIS — Trading Discipline System',
    login: 'Login',
  },
  fr: {
    nav: ['Fonctionnalités', 'Comment ça marche', 'Tarifs'],
    hero_tag: 'Outil de Psychologie Trading',
    hero_h1: 'Arrêtez de perdre\npar émotion.',
    hero_sub: 'TRADIS impose la discipline avant chaque trade. Checklist pré-trade, calculateur de risque, coaching IA — tout en un.',
    hero_cta: 'Commencer gratuitement',
    hero_cta2: 'Voir comment ça marche',
    stats: [['10x', 'Moins de revenge trades'], ['2min', 'Configuration'], ['4', 'Langues']],
    feat_title: 'Tout ce dont un trader discipliné a besoin',
    features: [
      { icon: '🚦', title: 'Portail Pré-Trade', desc: 'Impossible d\'entrer sans compléter votre checklist. Aucune exception.' },
      { icon: '📊', title: 'Calculateur Live', desc: 'Remplit automatiquement entry, SL et TP avec le prix actuel du marché.' },
      { icon: '⏱', title: 'Timer Anti-Revenge', desc: '30 minutes de cooldown après chaque perte. Reset émotionnel forcé.' },
      { icon: '🤖', title: 'Coach IA', desc: 'Claude AI analyse chaque trade et donne un feedback honnête. Rapport hebdomadaire.' },
      { icon: '📓', title: 'Journal de Trading', desc: 'Vue calendrier avec captures, notes, win rate et score de discipline.' },
      { icon: '🎯', title: 'Checklist Personnalisée', desc: 'Créez vos propres règles. Ajoutez, modifiez, supprimez des conditions.' },
    ],
    how_title: 'Comment TRADIS fonctionne',
    steps: [
      { n: '01', title: 'Configurez vos règles', desc: 'Ajoutez vos conditions, stratégies, solde et risque %.' },
      { n: '02', title: 'Avant chaque trade', desc: 'Sélectionnez la paire → prix en direct → checklist → entrée autorisée.' },
      { n: '03', title: 'Après la clôture', desc: 'Notez le résultat. L\'IA donne un feedback instantané.' },
      { n: '04', title: 'Revue hebdomadaire', desc: 'L\'IA génère un rapport de coaching complet. Améliorez-vous.' },
    ],
    price_title: 'Tarification simple',
    plans: [
      { name: 'TRADIS Pro', price: '9€', period: '/mois', badge: '15 jours gratuits', features: ['15 jours gratuits — sans carte bancaire', 'Toutes les fonctionnalités', 'Rapports IA hebdo + mensuel', 'Analytics complets', 'Export CSV', 'Annulation à tout moment'], cta: 'Commencer gratuitement', highlight: true },
    ],
    faq_title: 'FAQ',
    faqs: [
      { q: 'Dois-je connecter mon courtier?', a: 'Non. TRADIS est un outil de discipline, pas un courtier. Vous entrez les trades manuellement.' },
      { q: 'Quelles paires sont supportées?', a: 'Toutes les paires Forex, Or, Argent, grands Indices et top Crypto.' },
      { q: 'Mes données sont-elles privées?', a: 'Oui. Vos trades sont stockés dans votre compte privé. Nous ne partageons jamais les données.' },
    ],
    footer: '© 2026 TRADIS — Système de Discipline de Trading',
    login: 'Connexion',
  },
  ar: {
    nav: ['المميزات', 'كيف يعمل', 'الأسعار'],
    hero_tag: 'أداة علم نفس التداول',
    hero_h1: 'توقف عن خسارة\nصفقاتك بسبب عواطفك.',
    hero_sub: 'تراديس يفرض الانضباط قبل كل صفقة. قائمة تحقق، حاسبة المخاطر الفورية، مدرب ذكاء اصطناعي — كل شيء في مكان واحد.',
    hero_cta: 'ابدأ مجاناً',
    hero_cta2: 'شاهد كيف يعمل',
    stats: [['10x', 'أقل صفقات انتقامية'], ['2 دقيقة', 'وقت الإعداد'], ['4', 'لغات']],
    feat_title: 'كل ما يحتاجه المتداول المنضبط',
    features: [
      { icon: '🚦', title: 'بوابة ما قبل الصفقة', desc: 'لا يمكنك الدخول حتى تكمل قائمتك. بدون استثناء.' },
      { icon: '📊', title: 'حاسبة اللوت الفورية', desc: 'تملأ تلقائياً نقطة الدخول، وقف الخسارة وجني الأرباح بالسعر الحالي.' },
      { icon: '⏱', title: 'مؤقت مكافحة الانتقام', desc: '30 دقيقة راحة إلزامية بعد كل خسارة. إعادة ضبط عاطفي.' },
      { icon: '🤖', title: 'مدرب الذكاء الاصطناعي', desc: 'يحلل كل صفقة ويعطيك ملاحظات صادقة. تقرير أسبوعي شامل.' },
      { icon: '📓', title: 'سجل التداول', desc: 'عرض تقويمي مع صور الشاشة والملاحظات ونسبة النجاح.' },
      { icon: '🎯', title: 'قائمة تحقق مخصصة', desc: 'أنشئ قواعدك الخاصة. أضف وعدّل واحذف الشروط.' },
    ],
    how_title: 'كيف يعمل تراديس',
    steps: [
      { n: '٠١', title: 'حدد قواعدك', desc: 'أضف شروط قائمتك واستراتيجياتك ورصيدك ونسبة المخاطرة.' },
      { n: '٠٢', title: 'قبل كل صفقة', desc: 'اختر الزوج ← يتحمل السعر الحالي ← أكمل القائمة ← يُسمح بالدخول.' },
      { n: '٠٣', title: 'بعد الإغلاق', dest: 'سجل النتيجة. يعطي الذكاء الاصطناعي ملاحظات فورية.' },
      { n: '٠٤', title: 'المراجعة الأسبوعية', desc: 'يولد الذكاء الاصطناعي تقرير تدريب كامل. تحسن أسبوعاً بعد أسبوع.' },
    ],
    price_title: 'تسعير بسيط',
    plans: [
      { name: 'TRADIS Pro', price: '$9', period: '/شهر', badge: '15 يوم مجاناً', features: ['15 يوم مجاناً — بدون بطاقة', 'جميع المميزات', 'تقارير AI أسبوعية + شهرية', 'تحليلات كاملة', 'تصدير CSV', 'إلغاء في أي وقت'], cta: 'ابدأ مجاناً', highlight: true },
    ],
    faq_title: 'الأسئلة الشائعة',
    faqs: [
      { q: 'هل أحتاج لربط حساب الوساطة؟', a: 'لا. تراديس أداة انضباط وليست وسيطاً. تدخل الصفقات يدوياً.' },
      { q: 'ما الأزواج المدعومة؟', a: 'جميع أزواج الفوركس، الذهب، الفضة، المؤشرات الكبرى والعملات الرقمية.' },
      { q: 'هل بياناتي خاصة؟', a: 'نعم. صفقاتك مخزنة في حسابك الخاص. لا نشارك البيانات أبداً.' },
    ],
    footer: '© 2025 تراديس — نظام انضباط التداول',
    login: 'دخول',
  },
  es: {
    nav: ['Características', 'Cómo funciona', 'Precios'],
    hero_tag: 'Herramienta de Psicología Trading',
    hero_h1: 'Deja de perder trades\npor tus emociones.',
    hero_sub: 'TRADIS impone disciplina antes de cada operación. Checklist pre-trade, calculadora de riesgo en tiempo real, coaching IA — todo en uno.',
    hero_cta: 'Empezar gratis',
    hero_cta2: 'Ver cómo funciona',
    stats: [['10x', 'Menos revenge trades'], ['2min', 'Configuración'], ['4', 'Idiomas']],
    feat_title: 'Todo lo que un trader disciplinado necesita',
    features: [
      { icon: '🚦', title: 'Puerta Pre-Trade', desc: 'Bloqueado hasta completar tu checklist. Sin excepciones.' },
      { icon: '📊', title: 'Calculadora en Vivo', desc: 'Rellena automáticamente entrada, SL y TP con el precio actual.' },
      { icon: '⏱', title: 'Timer Anti-Venganza', desc: '30 minutos de cooldown tras cada pérdida. Reset emocional forzado.' },
      { icon: '🤖', title: 'Coach IA', desc: 'Claude AI analiza cada trade y da feedback honesto. Reporte semanal.' },
      { icon: '📓', title: 'Diario de Trading', desc: 'Vista de calendario con capturas, notas, win rate y puntuación.' },
      { icon: '🎯', title: 'Checklist Personalizada', desc: 'Crea tus propias reglas. Añade, edita, elimina condiciones.' },
    ],
    how_title: 'Cómo funciona TRADIS',
    steps: [
      { n: '01', title: 'Configura tus reglas', desc: 'Añade tus condiciones, estrategias, balance y riesgo %.' },
      { n: '02', title: 'Antes de cada trade', desc: 'Selecciona par → precio en directo → checklist → entrada autorizada.' },
      { n: '03', title: 'Tras el cierre', desc: 'Registra resultado. IA da feedback instantáneo.' },
      { n: '04', title: 'Revisión semanal', desc: 'IA genera informe de coaching completo. Mejora semana a semana.' },
    ],
    price_title: 'Precios simples',
    plans: [
      { name: 'TRADIS Pro', price: '$9', period: '/mes', badge: '15 días gratis', features: ['15 días gratis — sin tarjeta', 'Todas las funciones', 'Informes IA semanal + mensual', 'Analytics completos', 'Exportar CSV', 'Cancelar cuando quieras'], cta: 'Empezar gratis', highlight: true },
    ],
    faq_title: 'Preguntas frecuentes',
    faqs: [
      { q: '¿Necesito conectar mi broker?', a: 'No. TRADIS es una herramienta de disciplina, no un broker. Introduces los trades manualmente.' },
      { q: '¿Qué pares están soportados?', a: 'Todos los pares Forex, Oro, Plata, índices principales y top Crypto.' },
      { q: '¿Son privados mis datos?', a: 'Sí. Tus trades se almacenan en tu cuenta privada. Nunca compartimos datos.' },
    ],
    footer: '© 2026 TRADIS — Sistema de Disciplina de Trading',
    login: 'Iniciar sesión',
  }
}

type LangKey = keyof typeof LANGS

// ─── ZELLA-STYLE MOCKUP DEMO ────────────────────────────────────────────────
const HEATMAP_DATA = [
  [0,0,0,1,0,1,1],
  [1,0,1,1,0,1,0],
  [0,1,1,0,1,1,1],
  [1,1,0,1,1,0,0],
  [0,1,1,1,0,1,1],
  [1,0,0,1,1,1,0],
  [0,1,1,0,1,0,1],
  [1,1,0,1,0,1,1],
]

const CALENDAR_TRADES: Record<number, { pnl: number; trades: number; loss?: boolean }> = {
  4:  { pnl: 2900, trades: 2 },
  9:  { pnl: 4700, trades: 4 },
  17: { pnl: -1500, trades: 4, loss: true },
  25: { pnl: 123, trades: 2 },
}

function MockupDemo() {
  const [activeTab, setActiveTab] = useState<'pretrade' | 'journal' | 'report'>('pretrade')

  return (
    <div style={{ position: 'relative', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #0d1a0d 50%, #0a0a1a 100%)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: 24, padding: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, background: 'rgba(0,255,136,0.03)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: 'linear-gradient(135deg,#000,#0a0a1a)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 8, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff88' }} />
              <span style={{ fontSize: 11, fontWeight: 800, color: '#00ff88', letterSpacing: 2, fontFamily: 'Syne' }}>TRADIS</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['pretrade','journal','report'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                style={{ padding: '6px 14px', background: activeTab === t ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${activeTab === t ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, color: activeTab === t ? '#00ff88' : 'rgba(255,255,255,0.35)', fontFamily: 'Syne', fontSize: 12, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize', letterSpacing: 0.5 }}>
                {t === 'pretrade' ? 'Pre-Trade' : t === 'journal' ? 'Journal' : 'AI Report'}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[['$13,097', 'Balance', '#00ff88'], ['+$1,605', 'PnL Today', '#00ff88'], ['100/100', 'Discipline', '#00ff88']].map(([v,l,c]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: c, fontFamily: 'JetBrains Mono' }}>{v}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* PRE-TRADE TAB */}
        {activeTab === 'pretrade' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Left: Pair + Calculator */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, marginBottom: 10 }}>PAIR & DIRECTION</div>
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#fff', marginBottom: 10 }}>EURUSD</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ padding: '10px', background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: 8, textAlign: 'center', fontSize: 13, fontWeight: 800, color: '#00ff88' }}>▲ BUY</div>
                  <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, textAlign: 'center', fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.3)' }}>▼ SELL</div>
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, marginBottom: 10 }}>ENTRY / SL / TP</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
                  {[['Entry', '1.0850'], ['Stop Loss', '1.0820'], ['Take Profit', '1.0910']].map(([l, v]) => (
                    <div key={l}>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>{l}</div>
                      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 8px', fontSize: 12, color: '#fff', fontFamily: 'JetBrains Mono' }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                  {[['Lot', '0.10'], ['Risk $', '$200'], ['R:R', '2.0'], ['Pips', '30']].map(([l, v]) => (
                    <div key={l} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 6, padding: '8px 6px', textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginBottom: 3 }}>{l}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: l === 'Risk $' ? '#ffaa00' : '#00ff88', fontFamily: 'JetBrains Mono' }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, marginBottom: 8 }}>STRATEGY</div>
                <div style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#00ff88' }}>Structure Break + Retest</div>
              </div>
            </div>

            {/* Right: Checklist + Mental State */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2 }}>YOUR CHECKLIST</div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#00ff88' }}>5/5</div>
                </div>
                {[
                  ['SL wara structure dyal 15min', true, 'RISK'],
                  ['R:R 1:1.5 minimum', true, 'RISK'],
                  ['Trend clair f 4H wela Daily', true, 'STRATEGY'],
                  ['Kayna setup wa9t7a — machi feeling', true, 'STRATEGY'],
                  ['Ma3ndiش khasara kbira f had ljilsa', true, 'PSYCH'],
                ].map(([text, checked, tag], i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, background: checked ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${checked ? 'rgba(0,255,136,0.4)' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#00ff88', flexShrink: 0 }}>{checked ? '✓' : ''}</div>
                    <span style={{ fontSize: 11, color: checked ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)', flex: 1 }}>{text as string}</span>
                    <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: tag === 'RISK' ? 'rgba(255,68,102,0.15)' : tag === 'STRATEGY' ? 'rgba(0,204,255,0.1)' : 'rgba(255,170,0,0.1)', color: tag === 'RISK' ? '#ff4466' : tag === 'STRATEGY' ? '#00ccff' : '#ffaa00', fontWeight: 700 }}>{tag as string}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, marginBottom: 10 }}>MENTAL STATE</div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  {['🤬','😤','😐','😌','🧠'].map((e, i) => (
                    <div key={i} style={{ width: 36, height: 36, borderRadius: 8, background: i === 4 ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${i === 4 ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.07)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer' }}>{e}</div>
                  ))}
                </div>
              </div>
              <div style={{ padding: 14, background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.25)', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#00ff88', marginBottom: 2 }}>✓ Ready to Trade</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>All conditions met — 5/5</div>
              </div>
            </div>
          </div>
        )}

        {/* JOURNAL TAB */}
        {activeTab === 'journal' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Calendar */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>March 2026</div>
                <div style={{ fontSize: 11, color: '#00ff88', fontFamily: 'JetBrains Mono' }}>+$3,097 • 67% WR</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 6 }}>
                {['M','T','W','T','F','S','S'].map((d, i) => (
                  <div key={i} style={{ textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.2)', fontWeight: 700 }}>{d}</div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
                {[
                  {d:1,pnl:null},{d:2,pnl:null},{d:3,pnl:null},{d:4,pnl:357,win:true},{d:5,pnl:null},{d:6,pnl:null},{d:7,pnl:null},
                  {d:8,pnl:null},{d:9,pnl:null},{d:10,pnl:850,win:true},{d:11,pnl:-122,win:false},{d:12,pnl:450,win:true},{d:13,pnl:null},{d:14,pnl:null},
                  {d:15,pnl:null},{d:16,pnl:null},{d:17,pnl:1604,win:true},{d:18,pnl:320,win:true},{d:19,pnl:-95,win:false},{d:20,pnl:null},{d:21,pnl:null},
                  {d:22,pnl:null},{d:23,pnl:null},{d:24,pnl:275,win:true},{d:25,pnl:358,win:true},{d:26,pnl:null},{d:27,pnl:null},{d:28,pnl:null},
                  {d:29,pnl:null},{d:30,pnl:100,win:true},{d:31,pnl:null},
                ].map((day, i) => (
                  <div key={i} style={{ aspectRatio: '1', borderRadius: 5, background: day.pnl !== null ? (day.win ? 'rgba(0,255,136,0.12)' : 'rgba(255,68,102,0.12)') : 'rgba(255,255,255,0.02)', border: `1px solid ${day.pnl !== null ? (day.win ? 'rgba(0,255,136,0.25)' : 'rgba(255,68,102,0.25)') : 'rgba(255,255,255,0.04)'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: day.pnl !== null ? 'pointer' : 'default' }}>
                    <div style={{ fontSize: 9, color: day.pnl !== null ? '#fff' : 'rgba(255,255,255,0.2)', fontWeight: day.pnl !== null ? 700 : 400 }}>{day.d}</div>
                    {day.pnl !== null && <div style={{ fontSize: 7, color: day.win ? '#00ff88' : '#ff4466', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>{day.win ? '+' : ''}{day.pnl! > 999 ? (day.pnl!/1000).toFixed(1)+'K' : day.pnl}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Performance stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {[['Win Rate','67%','#00ff88'],['Profit Factor','7.48','#00ccff'],['Max DD','2.79%','#ffaa00']].map(([l,v,c]) => (
                  <div key={l} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>{l}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: c as string, fontFamily: 'JetBrains Mono' }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 14, flex: 1 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, marginBottom: 10 }}>PERFORMANCE BY PAIR</div>
                {[['EURUSD',6,'67%','+$709'],['GBPUSD',3,'100%','+$525'],['USDJPY',3,'67%','+$1708'],['XAUUSD',2,'50%','+$256'],['AUDUSD',1,'0%','-$102']].map(([pair,n,wr,pnl]) => (
                  <div key={pair as string} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', width: 60 }}>{pair as string}</div>
                    <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: wr as string, background: wr === '100%' ? '#00ff88' : wr === '0%' ? '#ff4466' : 'rgba(0,255,136,0.6)', borderRadius: 2 }} />
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', width: 30, textAlign: 'right' }}>{wr as string}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: (pnl as string).startsWith('+') ? '#00ff88' : '#ff4466', fontFamily: 'JetBrains Mono', width: 50, textAlign: 'right' }}>{pnl as string}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, marginBottom: 8 }}>DISCIPLINE</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[['Clean','11','#00ff88'],['Revenge','4','#ffaa00'],['Breaks','0','#00ccff']].map(([l,v,c]) => (
                    <div key={l} style={{ flex: 1, background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: '8px 6px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: c as string, fontFamily: 'JetBrains Mono' }}>{v}</div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REPORT TAB */}
        {activeTab === 'report' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, marginBottom: 12 }}>WEEKLY STATS</div>
                {[['Trades','15'],['Win Rate','67%'],['Net PnL','+$3,097'],['Avg Trade','+$206'],['Best Trade','+$1,604'],['Discipline','82/100']].map(([k,v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{k}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: (v as string).startsWith('+') ? '#00ff88' : '#fff', fontFamily: 'JetBrains Mono' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(255,170,0,0.05)', border: '1px solid rgba(255,170,0,0.15)', borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#ffaa00', letterSpacing: 1.2, marginBottom: 8 }}>⚠ FLAGS</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>• 4 revenge trades detected<br />• Overtrading on Friday (6 trades)<br />• Avg loss duration shorter than wins</div>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>AI Weekly Coaching Report</div>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: 12 }}>
                <span style={{ color: '#00ff88', fontWeight: 700 }}>This week was strong overall.</span> Your win rate of 67% with a profit factor of 7.48 shows real edge in your strategy.
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 12 }}>
                However, <span style={{ color: '#ffaa00', fontWeight: 700 }}>4 revenge trades cost you $205</span> — your revenge win rate is 50% vs 71% normal. These trades are hurting your performance.
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 16 }}>
                <span style={{ color: '#00ccff', fontWeight: 700 }}>Action plan:</span> Use the 30-min cooldown after every loss. Your best trades come on Friday mornings — focus there.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[['Strength','Structure Break 100% WR','#00ff88'],['Weakness','Friday overtrading','#ffaa00']].map(([l,v,c]) => (
                  <div key={l} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>{l}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: c as string }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


export default function LandingPage() {
  const [lang, setLangState] = useState<LangKey>('en')
  const [langOpen, setLangOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const c = LANGS[lang]
  const isRTL = lang === 'ar'

  useEffect(() => {
    const saved = localStorage.getItem('tradis_lang') as LangKey
    if (saved && LANGS[saved]) setLangState(saved)
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function changeLang(l: LangKey) {
    setLangState(l)
    localStorage.setItem('tradis_lang', l)
  }

  return (
    <div style={{ background: '#000000', color: '#e8e8f0', fontFamily: "'Syne', sans-serif", minHeight: '100vh', direction: isRTL ? 'rtl' : 'ltr', overflowX: 'hidden' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #000000; }
        .fade-in { animation: fadeUp .6s ease forwards; opacity: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .card-hover { transition: transform .2s, border-color .2s; }
        @media (max-width: 768px) { .desktop-nav { display: none !important; } .mobile-nav { display: flex !important; } }
        @media (min-width: 769px) { .mobile-nav { display: none !important; } .desktop-nav { display: flex !important; } }
        .card-hover:hover { transform: translateY(-4px); border-color: #00ff8844 !important; }
        .btn-glow { transition: all .2s; }
        .btn-glow:hover { box-shadow: 0 0 24px #00ff8844; }
        .grid-bg { }
        .logo-wrap { display: flex; align-items: center; gap: 12px; padding-left: 4px; cursor: pointer; text-decoration: none; transition: all .25s; }
        .logo-wrap:hover .logo-img { filter: drop-shadow(0 0 14px #00ff88cc) drop-shadow(0 0 28px #00ff8866); transform: scale(1.04); }
        .logo-wrap:hover .logo-text { color: #00ff88; letter-spacing: 4px; }
        .logo-img { height: 54px; width: auto; mix-blend-mode: screen; filter: drop-shadow(0 0 8px #00ff8866); transition: all .25s; }
        .logo-text { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; letter-spacing: 3px; color: #e8e8f0; transition: all .25s; }
        .nav-link { color: #888890; font-size: 13px; font-weight: 600; text-decoration: none; letter-spacing: 0.5px; transition: color .2s; }
        .nav-link:hover { color: #e8e8f0; }
      ` }} />

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: '#000000', borderBottom: '1px solid #1a1a28', padding: '0 24px' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', alignItems: 'center', height: '72px', padding: '0 8px' }}>
          
          {/* Logo */}
          <div className="logo-wrap" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ padding: 0, marginRight: 'auto', flexShrink: 0 }}>
            <img src="/logo-nav.jpg" alt="TRADIS" style={{ height: '48px', width: 'auto', objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          </div>

          {/* Desktop nav links */}
          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '32px', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            {c.nav.map(n => <a key={n} className="nav-link" href={`#${n.toLowerCase().replace(/\s/g,'-')}`}>{n}</a>)}
          </div>

          {/* Desktop right */}
          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
            <div ref={langRef} style={{ position: 'relative' }}>
              <button onClick={() => setLangOpen(!langOpen)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff', fontFamily: 'Syne', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                <span style={{ fontSize: '14px' }}>{lang === 'en' ? '🇬🇧' : lang === 'fr' ? '🇫🇷' : lang === 'ar' ? '🇸🇦' : '🇪🇸'}</span>
                <span>{lang.toUpperCase()}</span>
              </button>
              {langOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', minWidth: '160px', zIndex: 300 }}>
                  {(['en','fr','ar','es'] as LangKey[]).map(l => (
                    <button key={l} onClick={() => { changeLang(l); setLangOpen(false) }} style={{ width: '100%', padding: '12px 16px', background: lang === l ? 'rgba(255,255,255,0.07)' : 'none', border: 'none', color: lang === l ? '#fff' : 'rgba(255,255,255,0.55)', fontFamily: 'Syne', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '18px' }}>{l === 'en' ? '🇬🇧' : l === 'fr' ? '🇫🇷' : l === 'ar' ? '🇸🇦' : '🇪🇸'}</span>
                      <span>{l === 'en' ? 'English' : l === 'fr' ? 'Français' : l === 'ar' ? 'العربية' : 'Español'}</span>
                      {lang === l && <span style={{ marginLeft: 'auto', fontSize: '12px' }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => router.push('/auth?mode=login')} style={{ padding: '8px 16px', background: 'none', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', fontFamily: 'Syne', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>{c.login}</button>
            <button onClick={() => router.push('/auth?mode=register')} style={{ padding: '9px 20px', background: 'linear-gradient(135deg, #00ff88, #00ccaa)', border: 'none', borderRadius: '8px', color: '#000000', fontFamily: 'Syne', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}>Get Started</button>
          </div>

          {/* Mobile right — lang + hamburger */}
          <div className="mobile-nav" style={{ display: 'none', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
            <div ref={langRef} style={{ position: 'relative' }}>
              <button onClick={() => setLangOpen(!langOpen)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff', fontFamily: 'Syne', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                <span style={{ fontSize: '14px' }}>{lang === 'en' ? '🇬🇧' : lang === 'fr' ? '🇫🇷' : lang === 'ar' ? '🇸🇦' : '🇪🇸'}</span>
              </button>
              {langOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', minWidth: '160px', zIndex: 300 }}>
                  {(['en','fr','ar','es'] as LangKey[]).map(l => (
                    <button key={l} onClick={() => { changeLang(l); setLangOpen(false) }} style={{ width: '100%', padding: '12px 16px', background: lang === l ? 'rgba(255,255,255,0.07)' : 'none', border: 'none', color: lang === l ? '#fff' : 'rgba(255,255,255,0.55)', fontFamily: 'Syne', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '16px' }}>{l === 'en' ? '🇬🇧' : l === 'fr' ? '🇫🇷' : l === 'ar' ? '🇸🇦' : '🇪🇸'}</span>
                      <span>{l === 'en' ? 'English' : l === 'fr' ? 'Français' : l === 'ar' ? 'العربية' : 'Español'}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', width: '38px', height: '38px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              <span style={{ width: '18px', height: '2px', background: menuOpen ? '#00ff88' : '#fff', borderRadius: '2px', transition: 'all .2s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
              <span style={{ width: '18px', height: '2px', background: menuOpen ? 'transparent' : '#fff', borderRadius: '2px', transition: 'all .2s' }} />
              <span style={{ width: '18px', height: '2px', background: menuOpen ? '#00ff88' : '#fff', borderRadius: '2px', transition: 'all .2s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="mobile-nav" style={{ display: 'block', background: '#080810', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '16px 24px' }}>
            {c.nav.map(n => (
              <a key={n} href={`#${n.toLowerCase().replace(/\s/g,'-')}`} onClick={() => setMenuOpen(false)}
                style={{ display: 'block', padding: '12px 0', fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {n}
              </a>
            ))}
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button onClick={() => { router.push('/auth?mode=login'); setMenuOpen(false) }} style={{ flex: 1, padding: '11px', background: 'none', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff', fontFamily: 'Syne', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>{c.login}</button>
              <button onClick={() => { router.push('/auth?mode=register'); setMenuOpen(false) }} style={{ flex: 1, padding: '11px', background: 'linear-gradient(135deg,#00ff88,#00ccaa)', border: 'none', borderRadius: '8px', color: '#000', fontFamily: 'Syne', fontWeight: 800, fontSize: '14px', cursor: 'pointer' }}>Get Started</button>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="grid-bg" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '600px', background: '#00ff8808', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '800px', position: 'relative' }}>
          <div className="fade-in" style={{ animationDelay: '.1s', display: 'inline-block', background: '#00ff8811', border: '1px solid #00ff8833', borderRadius: '20px', padding: '6px 16px', fontSize: '12px', color: '#00ff88', fontWeight: 700, letterSpacing: '1px', marginBottom: '24px' }}>
            {c.hero_tag}
          </div>
          <h1 className="fade-in" style={{ animationDelay: '.2s', fontSize: 'clamp(40px, 8vw, 80px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-2px', marginBottom: '24px', whiteSpace: 'pre-line' }}>
            {c.hero_h1.split('\n').map((line, i) => (
              <span key={i} style={{ display: 'block', color: i === 1 ? '#00ff88' : '#e8e8f0' }}>{line}</span>
            ))}
          </h1>
          <p className="fade-in" style={{ animationDelay: '.3s', fontSize: '18px', color: '#888890', lineHeight: 1.7, marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>{c.hero_sub}</p>
          <div className="fade-in" style={{ animationDelay: '.4s', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/auth')} className="btn-glow" style={{ padding: '14px 32px', background: '#00ff88', border: 'none', borderRadius: '10px', color: '#0a0a0f', fontFamily: 'Syne', fontWeight: 700, fontSize: '15px', cursor: 'pointer', letterSpacing: '0.5px' }}>{c.hero_cta}</button>
            <button onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })} style={{ padding: '14px 32px', background: 'none', border: '1px solid #1e1e30', borderRadius: '10px', color: '#888890', fontFamily: 'Syne', fontWeight: 600, fontSize: '15px', cursor: 'pointer' }}>{c.hero_cta2}</button>
          </div>
          <div className="fade-in" style={{ animationDelay: '.5s', display: 'flex', gap: '40px', justifyContent: 'center', marginTop: '60px', flexWrap: 'wrap' }}>
            {c.stats.map(([val, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#00ff88', fontFamily: 'JetBrains Mono' }}>{val}</div>
                <div style={{ fontSize: '12px', color: '#555570', marginTop: '4px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: '100px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '16px' }}>{c.feat_title}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {c.features.map((f, i) => (
            <div key={i} className="card-hover" style={{ background: '#0a0a0a', border: '1px solid #1a1a28', borderRadius: '16px', padding: '28px', animationDelay: `${i * .1}s` }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>{f.icon}</div>
              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px', color: '#e8e8f0' }}>{f.title}</div>
              <div style={{ fontSize: '14px', color: '#666680', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: '100px 24px', background: '#050505' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-1px' }}>{c.how_title}</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {c.steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', padding: '32px 0', borderBottom: i < c.steps.length - 1 ? '1px solid #1a1a28' : 'none' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#00ff88', fontFamily: 'JetBrains Mono', minWidth: '48px', opacity: 0.5 }}>{step.n}</div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{step.title}</div>
                  <div style={{ fontSize: '14px', color: '#666680', lineHeight: 1.6 }}>{(step as any).desc || (step as any).dest}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: '100px 24px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-1px' }}>{c.price_title}</h2>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {c.plans.map((plan, i) => (
            <div key={i} style={{ background: '#0d1a0d', border: '2px solid #00ff88', borderRadius: '20px', padding: '48px', position: 'relative', maxWidth: 480, width: '100%' }}>
              {(plan as any).badge && <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#00ff88', color: '#0a0a0f', fontSize: '11px', fontWeight: 800, padding: '4px 14px', borderRadius: '20px', letterSpacing: '1px', whiteSpace: 'nowrap' }}>{(plan as any).badge}</div>}
              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>{plan.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
                <span style={{ fontSize: '42px', fontWeight: 800, color: plan.highlight ? '#00ff88' : '#e8e8f0', fontFamily: 'JetBrains Mono' }}>{plan.price}</span>
                <span style={{ fontSize: '14px', color: '#555570' }}>{plan.period}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                {plan.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#aaaacc' }}>
                    <span style={{ color: '#00ff88', fontWeight: 700 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <button onClick={() => router.push('/auth')} style={{ width: '100%', padding: '13px', background: plan.highlight ? '#00ff88' : 'none', border: plan.highlight ? 'none' : '1px solid #1e1e30', borderRadius: '10px', color: plan.highlight ? '#0a0a0f' : '#888890', fontFamily: 'Syne', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>{plan.cta}</button>
            </div>
          ))}
        </div>
      </section>


      {/* DEMO */}
      <section id="demo" style={{ padding: '120px 24px', background: '#050505' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '6px 16px', fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '1px', marginBottom: '20px' }}>LIVE DEMO</div>
            <h2 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 800, letterSpacing: '-2px', marginBottom: '12px' }}>Try it before you sign up</h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.35)' }}>Interactive preview — no account needed</p>
          </div>
          <MockupDemo />
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <button onClick={() => router.push('/dashboard?demo=true')} style={{ padding: '16px 40px', background: 'linear-gradient(135deg,#00ff88,#00ccaa)', border: 'none', borderRadius: 12, color: '#000', fontFamily: 'Syne', fontWeight: 800, fontSize: 16, cursor: 'pointer', letterSpacing: 0.5, marginBottom: 12 }}>
              🚀 Try Live Demo — No signup needed
            </button>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>Demo account with real data • No credit card • No registration</div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: '80px 24px', background: '#000000', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', textAlign: 'center' }}>
          {[
            { val: '2,400+', label: 'Active Traders', sub: 'Using TRADIS daily' },
            { val: '180K+', label: 'Trades Logged', sub: 'In trade journals' },
            { val: '73%', label: 'Less Revenge Trades', sub: 'After 30 days' },
            { val: '4.9★', label: 'User Rating', sub: 'Average satisfaction' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: '42px', fontWeight: 800, color: '#ffffff', fontFamily: 'JetBrains Mono', letterSpacing: '-1px' }}>{s.val}</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', marginTop: '8px' }}>{s.label}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY TRADIS */}
      <section style={{ padding: '120px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '6px 16px', fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '1px', marginBottom: '24px' }}>WHY TRADIS</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, letterSpacing: '-2px', marginBottom: '20px', lineHeight: 1.1 }}>Most traders lose<br /><span style={{ color: 'rgba(255,255,255,0.3)' }}>not because of strategy.</span></h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, marginBottom: '32px' }}>They lose because of revenge trades, overtrading after losses, and breaking their own rules. TRADIS is the only tool built specifically to track and enforce trading discipline — not just log trades.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                ['🚫', 'Blocks you from entering revenge trades'],
                ['📊', 'Tracks your discipline score day by day'],
                ['🧠', 'AI identifies your worst behavioral patterns'],
                ['⏱', 'Forces emotional reset after every loss'],
              ].map(([icon, text], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                  <span style={{ fontSize: '18px' }}>{icon}</span>{text}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Discipline Score', val: 94, color: '#00ff88' },
              { label: 'Revenge Trades', val: 12, color: '#ff4466', inverted: true },
              { label: 'Rule Compliance', val: 87, color: '#00ccff' },
              { label: 'Emotional Control', val: 76, color: '#ffaa00' },
            ].map((bar, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{bar.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: bar.color, fontFamily: 'JetBrains Mono' }}>{bar.val}%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px' }}>
                  <div style={{ height: '100%', width: `${bar.val}%`, background: bar.color, borderRadius: '3px', opacity: 0.8 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section style={{ padding: '120px 24px', background: '#050505' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 800, letterSpacing: '-2px' }}>What traders say</h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.35)', marginTop: '12px' }}>Real feedback from real traders</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {[
              { name: 'Yassine M.', role: 'Forex Trader • Morocco', text: 'Before TRADIS, I was doing 8 revenge trades a week. Now I do maybe 1 per month. The cooldown timer is a game changer.', stars: 5 },
              { name: 'Thomas B.', role: 'Day Trader • France', text: 'The discipline score keeps me accountable. I check it every morning before I trade. My win rate went from 42% to 61%.', stars: 5 },
              { name: 'Carlos R.', role: 'Swing Trader • Spain', text: 'The pre-trade checklist forces me to think before entering. I stopped taking setups based on feelings completely.', stars: 5 },
              { name: 'Ahmed K.', role: 'Prop Trader • UAE', text: "The AI weekly report showed me I was overtrading on Fridays. I didn't even notice that pattern myself.", stars: 5 },
              { name: 'Sofia L.', role: 'Crypto Trader • Brazil', text: 'Finally a tool that understands trading psychology. The lot calculator alone saves me from blowing my account.', stars: 5 },
              { name: 'Omar S.', role: 'Index Trader • Algeria', text: 'I passed my prop firm challenge after 2 months of using TRADIS. Discipline was the only thing holding me back.', stars: 5 },
            ].map((r, i) => (
              <div key={i} className="card-hover" style={{ background: '#000000', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '28px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                  {'★★★★★'.split('').map((s, j) => <span key={j} style={{ color: '#ffcc00', fontSize: '14px' }}>{s}</span>)}
                </div>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: '20px' }}>"{r.text}"</p>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{r.name}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{r.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '20px' }}>
            Ready to trade with <span style={{ color: '#00ff88' }}>discipline</span>?
          </h2>
          <p style={{ fontSize: '16px', color: '#666680', marginBottom: '36px' }}>Join traders who stopped blaming the market and started fixing their behavior.</p>
          <button onClick={() => router.push('/auth')} className="btn-glow" style={{ padding: '16px 40px', background: '#00ff88', border: 'none', borderRadius: '12px', color: '#0a0a0f', fontFamily: 'Syne', fontWeight: 800, fontSize: '16px', cursor: 'pointer', letterSpacing: '0.5px' }}>{c.hero_cta}</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #1a1a28', padding: '60px 48px 40px', background: '#000' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' gap: 40, marginBottom: 48 }}>
            <div>
              <img src="/logo-footer.jpg" alt="TRADIS Trading Discipline System" style={{ height: '80px', width: 'auto', objectFit: 'contain', marginBottom: 16 }} />
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', lineHeight: 1.8, maxWidth: 320 }}>
                Trading involves substantial risk and is not appropriate for everyone. Only risk capital should be used. Testimonials may not be representative of other users and are not a guarantee of future performance.
              </p>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.5, marginBottom: 16 }}>PRODUCT</div>
              {['Features', 'Pricing', 'Live Demo'].map(l => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <a href={l === 'Live Demo' ? '/dashboard?demo=true' : '#' + l.toLowerCase()} style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', cursor: 'pointer' }}
                    onMouseEnter={e => (e.target as HTMLElement).style.color = '#fff'}
                    onMouseLeave={e => (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.5)'}>{l}</a>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.5, marginBottom: 16 }}>COMPANY</div>
              {[['Contact', '/contact'], ['Privacy Policy', '/privacy'], ['Terms & Conditions', '/terms']].map(([l, href]) => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <a href={href} style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}
                    onMouseEnter={e => (e.target as HTMLElement).style.color = '#fff'}
                    onMouseLeave={e => (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.5)'}>{l}</a>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.5, marginBottom: 16 }}>FOLLOW US</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[['𝕏', 'https://twitter.com'], ['in', 'https://linkedin.com'], ['▶', 'https://youtube.com'], ['f', 'https://facebook.com']].map(([icon, href]) => (
                  <a key={icon} href={href} target="_blank" rel="noreferrer"
                    style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 14, textDecoration: 'none', fontWeight: 700 }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,255,136,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>{icon}</a>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>{c.footer}</div>
            <div style={{ display: 'flex', gap: 20 }}>
              {[['Privacy Policy', '/privacy'], ['Terms & Conditions', '/terms'], ['Contact', '/contact']].map(([l, href]) => (
                <a key={l} href={href} style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textDecoration: 'none' }}
                  onMouseEnter={e => (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.5)'}
                  onMouseLeave={e => (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.2)'}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
