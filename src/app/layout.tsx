import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Oqool AI - منصة الذكاء الاصطناعي',
  description: 'منصة Oqool AI المتكاملة للذكاء الاصطناعي بدعم اللغة العربية',
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
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <meta name="theme-color" content="#7c3aed" />
      </head>
      <body>{children}</body>
    </html>
  )
}
