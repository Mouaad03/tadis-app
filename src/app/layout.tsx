import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'TRADIS — Trading Discipline System',
  description: 'Stop losing trades to your emotions. Pre-trade checklist, revenge cooldown, AI coaching.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-PYLJ9D8F4Z" />
        <Script id="ga-init" dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-PYLJ9D8F4Z');
        `}} />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#0a0a0f' }}>
        {children}
      </body>
    </html>
  )
}
