'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type LangKey = 'en' | 'fr' | 'ar' | 'es'

const FAQS = {
  en: {
    title: 'FAQ',
    sub: 'Everything you need to know about TRADIS',
    back: '← Back to home',
    categories: [
      {
        cat: 'General',
        items: [
          { q: 'What is TRADIS?', a: 'TRADIS (Trading Discipline System) is a tool that enforces trading discipline. It blocks you from entering trades until you complete your pre-trade checklist, calculates risk automatically, and gives you AI coaching after every trade.' },
          { q: 'Do I need to connect my broker?', a: 'No. TRADIS is a discipline tool, not a broker integration. You enter trades manually. This is intentional — it forces you to be deliberate about every trade you take.' },
          { q: 'Is TRADIS for beginners or experienced traders?', a: 'Both. Beginners use it to build good habits from the start. Experienced traders use it to stop breaking their own rules — which is the #1 reason profitable traders lose money.' },
        ]
      },
      {
        cat: 'Features',
        items: [
          { q: 'What pairs are supported?', a: 'All major and minor Forex pairs, Gold (XAUUSD), Silver (XAGUSD), major Indices (SPX, NAS100, DAX, FTSE...) and top Crypto pairs (BTC, ETH, SOL...).' },
          { q: 'How does the Pre-Trade Gate work?', a: 'Before every trade, you must complete your personalized checklist (SL behind structure, R:R minimum, trend confirmation, etc). Only when all conditions are checked can you enter the trade.' },
          { q: 'How does the Revenge Timer work?', a: 'After every losing trade, a 30-minute timer starts automatically. You cannot log a new trade until the timer ends. This forces an emotional reset and prevents revenge trading.' },
          { q: 'What is the Discipline Score?', a: 'Your Discipline Score (0-100) tracks how well you follow your rules each day. It drops when you take revenge trades, break your strategy, or overtrade. It resets each week.' },
          { q: 'How does the AI Coach work?', a: 'After closing each trade, Claude AI analyzes your entry, exit, mood, and checklist to give you honest feedback. Every week, it generates a full behavioral coaching report.' },
        ]
      },
      {
        cat: 'Pricing & Account',
        items: [
          { q: 'Is TRADIS really free?', a: 'Yes. The Free plan includes the pre-trade gate, lot calculator, trade journal, and up to 10 trades per day. No credit card required.' },
          { q: 'What does the Pro plan include?', a: 'Pro ($12/month) adds AI trade feedback after every trade, weekly AI coaching reports, unlimited daily trades, and priority support.' },
          { q: 'Is my data private?', a: 'Yes. Your trades, checklist, and journal are stored in your private account. We never share, sell, or use your trading data for any purpose other than providing the service.' },
          { q: 'Can I cancel my Pro subscription anytime?', a: 'Yes. Cancel anytime with no questions asked. Your data is preserved on the Free plan.' },
        ]
      },
    ]
  },
  fr: {
    title: 'FAQ',
    sub: 'Tout ce que vous devez savoir sur TRADIS',
    back: '← Retour à l\'accueil',
    categories: [
      {
        cat: 'Général',
        items: [
          { q: 'Qu\'est-ce que TRADIS?', a: 'TRADIS est un outil qui impose la discipline de trading. Il vous bloque jusqu\'à ce que vous complétiez votre checklist pré-trade, calcule le risque automatiquement et vous donne un coaching IA après chaque trade.' },
          { q: 'Dois-je connecter mon courtier?', a: 'Non. TRADIS est un outil de discipline, pas une intégration de courtier. Vous entrez les trades manuellement — c\'est intentionnel.' },
          { q: 'TRADIS est-il pour les débutants ou les traders expérimentés?', a: 'Les deux. Les débutants l\'utilisent pour créer de bonnes habitudes. Les traders expérimentés pour arrêter de briser leurs propres règles.' },
        ]
      },
      {
        cat: 'Fonctionnalités',
        items: [
          { q: 'Quelles paires sont supportées?', a: 'Toutes les paires Forex majeures et mineures, Or, Argent, grands Indices et top Crypto.' },
          { q: 'Comment fonctionne le Portail Pré-Trade?', a: 'Avant chaque trade, vous devez compléter votre checklist personnalisée. Uniquement quand toutes les conditions sont cochées, vous pouvez entrer.' },
          { q: 'Comment fonctionne le Timer Anti-Revenge?', a: 'Après chaque trade perdant, un timer de 30 minutes démarre automatiquement. Vous ne pouvez pas enregistrer un nouveau trade avant la fin.' },
          { q: 'Qu\'est-ce que le Score de Discipline?', a: 'Votre Score (0-100) suit à quel point vous respectez vos règles chaque jour. Il baisse pour les trades de revenge, les cassures de stratégie.' },
          { q: 'Comment fonctionne le Coach IA?', a: 'Après chaque trade, Claude AI analyse votre entrée, sortie et humeur pour donner un feedback honnête. Chaque semaine, rapport de coaching complet.' },
        ]
      },
      {
        cat: 'Tarifs & Compte',
        items: [
          { q: 'TRADIS est-il vraiment gratuit?', a: 'Oui. Le plan Gratuit inclut le portail pré-trade, calculateur de lot, journal de trading et jusqu\'à 10 trades par jour.' },
          { q: 'Que comprend le plan Pro?', a: 'Pro (12€/mois) ajoute le feedback IA après chaque trade, rapports hebdomadaires, trades illimités et support prioritaire.' },
          { q: 'Mes données sont-elles privées?', a: 'Oui. Vos trades et journal sont dans votre compte privé. Jamais partagés ni vendus.' },
          { q: 'Puis-je annuler l\'abonnement Pro à tout moment?', a: 'Oui. Annulation à tout moment sans question. Vos données sont conservées en plan Gratuit.' },
        ]
      },
    ]
  },
  ar: {
    title: 'الأسئلة الشائعة',
    sub: 'كل ما تحتاج معرفته عن تراديس',
    back: '→ العودة للرئيسية',
    categories: [
      {
        cat: 'عام',
        items: [
          { q: 'ما هو تراديس؟', a: 'تراديس هو أداة تفرض انضباط التداول. تمنعك من الدخول حتى تكمل قائمة التحقق، تحسب المخاطرة تلقائياً، وتعطيك تدريباً بالذكاء الاصطناعي بعد كل صفقة.' },
          { q: 'هل أحتاج لربط حساب الوساطة؟', a: 'لا. تراديس أداة انضباط وليست تكاملاً مع وسيط. تدخل الصفقات يدوياً — هذا مقصود لجعلك متعمداً في كل صفقة.' },
          { q: 'هل تراديس للمبتدئين أم المحترفين؟', a: 'كلاهما. المبتدئون يستخدمونه لبناء عادات جيدة. المحترفون لوقف كسر قواعدهم الخاصة.' },
        ]
      },
      {
        cat: 'المميزات',
        items: [
          { q: 'ما الأزواج المدعومة؟', a: 'جميع أزواج الفوركس، الذهب، الفضة، المؤشرات الكبرى والعملات الرقمية.' },
          { q: 'كيف تعمل بوابة ما قبل الصفقة؟', a: 'قبل كل صفقة، يجب إكمال قائمة التحقق المخصصة. فقط عند التحقق من جميع الشروط يمكنك الدخول.' },
          { q: 'كيف يعمل مؤقت الانتقام؟', a: 'بعد كل صفقة خاسرة، يبدأ مؤقت 30 دقيقة تلقائياً. لا يمكنك تسجيل صفقة جديدة حتى ينتهي.' },
          { q: 'ما هو نقاط الانضباط؟', a: 'نقاطك (0-100) تتبع مدى التزامك بقواعدك يومياً. تنخفض عند صفقات الانتقام أو كسر الاستراتيجية.' },
          { q: 'كيف يعمل مدرب الذكاء الاصطناعي؟', a: 'بعد كل صفقة، يحلل Claude AI دخولك وخروجك وحالتك النفسية. كل أسبوع تقرير تدريب كامل.' },
        ]
      },
      {
        cat: 'الأسعار والحساب',
        items: [
          { q: 'هل تراديس مجاني حقاً؟', a: 'نعم. الخطة المجانية تشمل البوابة، الحاسبة، السجل، حتى 10 صفقات/يوم. بدون بطاقة ائتمانية.' },
          { q: 'ماذا يشمل برو؟', a: 'برو ($12/شهر) يضيف ملاحظات AI بعد كل صفقة، تقارير أسبوعية، صفقات غير محدودة.' },
          { q: 'هل بياناتي خاصة؟', a: 'نعم. صفقاتك وسجلك في حسابك الخاص. لا نشاركها أبداً.' },
          { q: 'هل يمكن إلغاء الاشتراك في أي وقت؟', a: 'نعم. إلغاء في أي وقت بدون أسئلة. بياناتك محفوظة في الخطة المجانية.' },
        ]
      },
    ]
  },
  es: {
    title: 'Preguntas Frecuentes',
    sub: 'Todo lo que necesitas saber sobre TRADIS',
    back: '← Volver al inicio',
    categories: [
      {
        cat: 'General',
        items: [
          { q: '¿Qué es TRADIS?', a: 'TRADIS es una herramienta que impone disciplina de trading. Te bloquea hasta completar tu checklist pre-trade, calcula el riesgo automáticamente y te da coaching IA después de cada operación.' },
          { q: '¿Necesito conectar mi broker?', a: 'No. TRADIS es una herramienta de disciplina. Introduces las operaciones manualmente — esto es intencional.' },
          { q: '¿TRADIS es para principiantes o traders experimentados?', a: 'Ambos. Los principiantes lo usan para crear buenos hábitos. Los experimentados para dejar de romper sus propias reglas.' },
        ]
      },
      {
        cat: 'Características',
        items: [
          { q: '¿Qué pares están soportados?', a: 'Todos los pares Forex, Oro, Plata, índices principales y top Crypto.' },
          { q: '¿Cómo funciona la Puerta Pre-Trade?', a: 'Antes de cada operación, debes completar tu checklist personalizada. Solo cuando todas las condiciones estén marcadas puedes entrar.' },
          { q: '¿Cómo funciona el Timer Anti-Venganza?', a: 'Tras cada operación perdedora, un timer de 30 minutos arranca automáticamente. No puedes registrar una nueva operación hasta que termine.' },
          { q: '¿Qué es la Puntuación de Disciplina?', a: 'Tu puntuación (0-100) rastrea qué tan bien sigues tus reglas cada día. Baja con revenge trades o estrategia rota.' },
          { q: '¿Cómo funciona el Coach IA?', a: 'Tras cada operación, Claude AI analiza tu entrada, salida y estado mental. Cada semana, informe completo de coaching conductual.' },
        ]
      },
      {
        cat: 'Precios y Cuenta',
        items: [
          { q: '¿Es TRADIS realmente gratis?', a: 'Sí. El plan Gratis incluye puerta pre-trade, calculadora, diario y hasta 10 operaciones/día. Sin tarjeta de crédito.' },
          { q: '¿Qué incluye el plan Pro?', a: 'Pro ($12/mes) añade feedback IA por operación, informes semanales, operaciones ilimitadas y soporte prioritario.' },
          { q: '¿Son privados mis datos?', a: 'Sí. Tus operaciones y diario están en tu cuenta privada. Nunca los compartimos.' },
          { q: '¿Puedo cancelar la suscripción Pro en cualquier momento?', a: 'Sí. Cancela cuando quieras sin preguntas. Tus datos se conservan en el plan Gratis.' },
        ]
      },
    ]
  }
}

export default function FAQPage() {
  const [lang, setLang] = useState<LangKey>('en')
  const [openItem, setOpenItem] = useState<string | null>(null)
  const router = useRouter()
  const f = FAQS[lang]
  const isRTL = lang === 'ar'

  useEffect(() => {
    const saved = localStorage.getItem('tradis_lang') as LangKey
    if (saved && FAQS[saved]) setLang(saved)
  }, [])

  return (
    <div style={{ background: '#000000', color: '#ffffff', fontFamily: "'Syne', sans-serif", minHeight: '100vh', direction: isRTL ? 'rtl' : 'ltr' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #000; }
        .faq-item { transition: all .15s; cursor: pointer; border-radius: 8px; }
        .faq-item:hover { background: rgba(255,255,255,0.03) !important; }
      ` }} />

      {/* NAV */}
      <nav style={{ background: '#000', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>
          <div style={{ cursor: 'pointer' }} onClick={() => router.push('/')}>
            <img src="/logo.jpg" alt="TRADIS" style={{ height: 60, width: 'auto' }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['en','fr','ar','es'] as LangKey[]).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{ padding: '5px 10px', background: lang === l ? 'rgba(255,255,255,0.1)' : 'none', border: `1px solid ${lang === l ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 6, color: lang === l ? '#fff' : 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer', fontFamily: 'Syne', fontWeight: 600 }}>{l.toUpperCase()}</button>
            ))}
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 24px' }}>
        {/* Back */}
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 14, cursor: 'pointer', fontFamily: 'Syne', marginBottom: 48, padding: 0 }}>{f.back}</button>

        {/* Header */}
        <div style={{ marginBottom: 64 }}>
          <h1 style={{ fontSize: 'clamp(36px,6vw,64px)', fontWeight: 800, letterSpacing: '-2px', marginBottom: 16 }}>{f.title}</h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)' }}>{f.sub}</p>
        </div>

        {/* Categories */}
        {f.categories.map((cat, ci) => (
          <div key={ci} style={{ marginBottom: 56 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{cat.cat}</div>
            {cat.items.map((item, ii) => {
              const key = `${ci}-${ii}`
              const isOpen = openItem === key
              return (
                <div key={ii} className="faq-item" onClick={() => setOpenItem(isOpen ? null : key)} style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#ffffff' }}>{item.q}</div>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 20, flexShrink: 0 }}>{isOpen ? '−' : '+'}</span>
                  </div>
                  {isOpen && <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, marginTop: 14 }}>{item.a}</div>}
                </div>
              )
            })}
          </div>
        ))}

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 80, padding: '60px 24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Still have questions?</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>Start using TRADIS for free — no credit card required.</p>
          <button onClick={() => router.push('/auth')} style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #00ff88, #00ccaa)', border: 'none', borderRadius: 10, color: '#000', fontFamily: 'Syne', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>Get Started Free</button>
        </div>
      </div>
    </div>
  )
}
