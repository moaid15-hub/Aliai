// تخطيط صفحة معالجة الصور

import type { Metadata } from 'next';
import '@/features/image-processing/styles/ImageUploader.css';
import '@/features/image-processing/styles/ProcessingMethodSelector.css';
import './page.css';

export const metadata: Metadata = {
  title: 'معالجة الصور | الشخصيات',
  description: 'معالجة الصور والتعرف على النصوص باستخدام AI Vision و OCR',
};

export default function ImageProcessingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


