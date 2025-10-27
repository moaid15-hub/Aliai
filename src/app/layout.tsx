import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import UnderConstructionBanner from '@/components/UnderConstructionBanner';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Oqool AI - منصة الذكاء الاصطناعي",
  description: "منصة عقول للذكاء الاصطناعي - احصل على إجابات ذكية ومساعدة شخصية متقدمة",
};

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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
      </head>
      <body className={inter.className}>
        <UnderConstructionBanner />
        <SubscriptionProvider>
          {children}
        </SubscriptionProvider>
      </body>
    </html>
  )
}
