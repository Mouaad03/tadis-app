'use client'
import { useRouter } from 'next/navigation'

export default function PrivacyPage() {
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
          <h1 style={{ fontSize: 42, fontWeight: 800, letterSpacing: -1, marginBottom: 12 }}>Privacy Policy</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>Last updated: March 2026</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 40 }}>
          {[
            ['1. Information We Collect', 'We collect information you provide when creating an account, including your name, email address, and trading data such as trades, strategies, and journal entries. We also collect usage data to improve our service.'],
            ['2. How We Use Your Information', 'We use your information to provide and improve the TRADIS service, send you important updates about your account, generate AI-powered trading reports and coaching, and analyze usage patterns to improve our product.'],
            ['3. Data Storage & Security', 'Your data is stored securely using Supabase, a trusted database provider. We use industry-standard encryption for data in transit and at rest. We never sell your personal data to third parties.'],
            ['4. AI & Third-Party Services', 'TRADIS uses Anthropic\'s Claude AI to generate trading reports and coaching. Trade data sent for AI analysis is processed securely and not used to train AI models. We use TwelveData and Yahoo Finance APIs for market data.'],
            ['5. Your Rights', 'You have the right to access, correct, or delete your personal data at any time. You can export your trade history as CSV from the Journal section. To delete your account, contact us at support@tradis.app.'],
            ['6. Cookies', 'We use minimal cookies for authentication and session management. We do not use tracking cookies or advertising cookies.'],
            ['7. Changes to This Policy', 'We may update this Privacy Policy from time to time. We will notify you of significant changes via email or in-app notification.'],
            ['8. Contact', 'If you have any questions about this Privacy Policy, please contact us at support@tradis.app.'],
          ].map(([t, c]) => section(t as string, c as string))}
        </div>
      </div>
    </div>
  )
}
