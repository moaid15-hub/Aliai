import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'عقول - منصة الذكاء الاصطناعي',
  description: 'منصة عقول المتكاملة للذكاء الاصطناعي بدعم اللغة العربية',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
