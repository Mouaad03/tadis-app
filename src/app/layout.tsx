import type { Metadata } from 'next'
import './nav.css'
import Script from 'next/script'
import CookieBanner from '@/components/ui/CookieBanner'

export const metadata: Metadata = {
  title: "TRADIS — Trading Discipline System",
  description: "Stop losing trades to your emotions. Pre-trade checklist, revenge cooldown timer, AI coaching reports. Try free 15 days.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
    shortcut: "/icon.png",
  },
  verification: {
    google: "VDmlqOwQqNMdfK0gWrHrg3w9WIOUvfGR0DkL6y-9rFY",
  },
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-BNSRM3R6PM" />
        <Script id="ga-init" dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-BNSRM3R6PM');
        `}} />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#0a0a0f' }}>
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
