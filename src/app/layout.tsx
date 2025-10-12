import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'عقول - منصة الذكاء الاصطناعي',
  description: 'منصة عقول المتكاملة للذكاء الاصطناعي بدعم اللغة العربية',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon-192.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#7c3aed" />
      </head>
      <body>{children}</body>
    </html>
  )
}
