'use client'
import { useState, useEffect } from 'react'
import { Lang, getLang, setLang } from '@/lib/i18n'

const FLAGS: Record<Lang, string> = { en: '🇬🇧', fr: '🇫🇷', ar: '🇸🇦', es: '🇪🇸' }
const LABELS: Record<Lang, string> = { en: 'EN', fr: 'FR', ar: 'ع', es: 'ES' }

export default function LangSwitcher() {
  const [lang, setCurrentLang] = useState<Lang>('en')
  const [open, setOpen] = useState(false)

  useEffect(() => { setCurrentLang(getLang()) }, [])

  function changeLang(l: Lang) {
    setLang(l)
    setOpen(false)
  }

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{
        background: '#13131f', border: '1px solid #1e1e30', borderRadius: '8px',
        color: '#aaaacc', padding: '6px 10px', cursor: 'pointer',
        fontFamily: 'JetBrains Mono', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px'
      }}>
        <span style={{ fontSize: '14px' }}>{FLAGS[lang]}</span>
        <span>{LABELS[lang]}</span>
        <span style={{ color: '#555570', fontSize: '10px' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: '4px',
          background: '#13131f', border: '1px solid #1e1e30', borderRadius: '8px',
          overflow: 'hidden', zIndex: 1000, minWidth: '100px'
        }}>
          {(['en','fr','ar','es'] as Lang[]).map(l => (
            <button key={l} onClick={() => changeLang(l)} style={{
              width: '100%', padding: '8px 12px', background: lang === l ? '#1e1e30' : 'none',
              border: 'none', color: lang === l ? '#00ff88' : '#aaaacc',
              fontFamily: 'Syne', fontSize: '13px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left'
            }}>
              <span style={{ fontSize: '16px' }}>{FLAGS[l]}</span>
              <span>{LABELS[l]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
