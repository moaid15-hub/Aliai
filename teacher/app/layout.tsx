// app/layout.tsx
// التخطيط الأساسي للتطبيق

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'المعلم العراقي الذكي - AI Iraqi Teacher',
  description: 'نظام ذكي لمساعدة الطلاب العراقيين في التعلم والحصول على شرح مفصل للمواد الدراسية',
  keywords: 'التعليم العراقي، الذكاء الاصطناعي، المعلم الذكي، العراق، تعليم',
  authors: [{ name: 'Iraqi Education AI Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'المعلم العراقي الذكي',
    description: 'نظام ذكي لمساعدة الطلاب العراقيين في التعلم',
    type: 'website',
    locale: 'ar_IQ',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@300;400;600;700&display=swap" 
          rel="stylesheet" 
        />
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" 
        />
      </head>
      <body className={inter.className}>
        <div className="app-container">
          <header className="app-header">
            <div className="header-content">
              <div className="logo-section">
                <i className="fas fa-graduation-cap header-icon"></i>
                <h1 className="app-title">المعلم العراقي الذكي</h1>
              </div>
              <nav className="main-nav">
                <a href="/" className="nav-link">الرئيسية</a>
                <a href="/personas/iraqi-teacher" className="nav-link">المعلم</a>
                <a href="/about" className="nav-link">حول النظام</a>
              </nav>
            </div>
          </header>
          
          <main className="main-content">
            {children}
          </main>
          
          <footer className="app-footer">
            <div className="footer-content">
              <div className="footer-section">
                <h3>المعلم العراقي الذكي</h3>
                <p>نظام ذكي متقدم لمساعدة الطلاب العراقيين في رحلتهم التعليمية</p>
              </div>
              <div className="footer-section">
                <h4>الخدمات</h4>
                <ul>
                  <li>شرح المواد الدراسية</li>
                  <li>تحليل الصور التعليمية</li>
                  <li>حل المسائل خطوة بخطوة</li>
                  <li>دعم جميع المراحل الدراسية</li>
                </ul>
              </div>
              <div className="footer-section">
                <h4>تواصل معنا</h4>
                <div className="social-links">
                  <a href="#" className="social-link">
                    <i className="fab fa-facebook"></i>
                  </a>
                  <a href="#" className="social-link">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#" className="social-link">
                    <i className="fab fa-telegram"></i>
                  </a>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <p>&copy; 2024 المعلم العراقي الذكي. جميع الحقوق محفوظة.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}