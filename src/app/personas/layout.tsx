// تخطيط صفحات الشخصيات

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الشخصيات | Oqool AI',
  description: 'إدارة واختيار الشخصيات المخصصة للذكاء الاصطناعي',
};

export default function PersonasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

