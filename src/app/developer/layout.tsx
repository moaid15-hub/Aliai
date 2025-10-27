// 📐 Layout لصفحة Developer

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Developer Assistant | oqool',
  description: 'تحكم في مشروعك المحلي من المتصفح',
};

export default function DeveloperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
