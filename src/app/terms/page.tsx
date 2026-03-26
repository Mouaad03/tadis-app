'use client'
import { useRouter } from 'next/navigation'

export default function TermsPage() {
  const router = useRouter()
  const section = (title: string, content: string) => (
    <div key={title} style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 12 }}>{title}</h2>
      <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>{content}</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#e8e8f0', fontFamily: 'Syne, sans-serif' }}>
      <div style={{ background: '#000', borderBottom: '1px solid #1a1a28', padding: '16px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={() => router.push('/')} style={{ fontSize: 18, fontWeight: 800, letterSpacing: 2, cursor: 'pointer', color: '#fff' }}>TRADIS</div>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.4)', padding: '7px 16px', cursor: 'pointer', fontSize: 13, fontFamily: 'Syne' }}>← Back</button>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'inline-block', background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 20, padding: '4px 14px', fontSize: 11, color: '#00ff88', fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>LEGAL</div>
          <h1 style={{ fontSize: 42, fontWeight: 800, letterSpacing: -1, marginBottom: 12 }}>Terms & Conditions</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>Last updated: March 2026</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 40 }}>
          <div style={{ background: 'rgba(255,68,102,0.08)', border: '1px solid rgba(255,68,102,0.2)', borderRadius: 10, padding: 16, marginBottom: 32 }}>
            <div style={{ fontSize: 13, color: '#ff4466', fontWeight: 700, marginBottom: 6 }}>⚠ Risk Disclaimer</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>Trading financial instruments involves substantial risk of loss. TRADIS is a discipline and journaling tool — not financial advice. Past performance is not indicative of future results.</div>
          </div>

          {[
            ['1. Acceptance of Terms', 'By accessing and using TRADIS, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our service.'],
            ['2. Service Description', 'TRADIS is a trading discipline system that provides pre-trade checklists, trade journaling, performance analytics, and AI-powered coaching reports. TRADIS does not provide financial advice, investment recommendations, or brokerage services.'],
            ['3. Not Financial Advice', 'All content, features, and AI-generated reports provided by TRADIS are for educational and informational purposes only. Nothing on TRADIS constitutes financial, investment, or trading advice. Always do your own research and consult a qualified financial advisor.'],
            ['4. Subscription & Billing', 'TRADIS offers a 15-day free trial with full access to all features. After the trial period, a Pro subscription of $9/month is required to continue using the service. You may cancel at any time before the trial ends without being charged.'],
            ['5. User Responsibilities', 'You are responsible for maintaining the confidentiality of your account credentials. You agree not to share your account, use the service for any illegal purpose, or attempt to reverse engineer or copy the TRADIS platform.'],
            ['6. Intellectual Property', 'All content, features, and functionality of TRADIS are owned by TRADIS and are protected by copyright, trademark, and other intellectual property laws.'],
            ['7. Limitation of Liability', 'TRADIS shall not be liable for any trading losses, lost profits, or any indirect, incidental, or consequential damages arising from your use of the service. TRADIS is a discipline tool only.'],
            ['8. Termination', 'We reserve the right to suspend or terminate accounts that violate these terms. You may close your account at any time by contacting support@tradis.app.'],
            ['9. Governing Law', 'These terms are governed by applicable law. Any disputes will be resolved through binding arbitration.'],
            ['10. Contact', 'For questions about these Terms, contact us at support@tradis.app.'],
          ].map(([t, c]) => section(t as string, c as string))}
        </div>
      </div>
    </div>
  )
}
