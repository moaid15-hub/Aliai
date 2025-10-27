// صفحة معالجة الصور

'use client';

import { useState } from 'react';
import {
  ImageProcessingMethod,
  ProcessingMethodSelector,
  ImageUploader,
} from '@/features/image-processing';

export default function ImageProcessingPage() {
  const [selectedMethod, setSelectedMethod] = useState<ImageProcessingMethod>(
    ImageProcessingMethod.HYBRID
  );

  const handleProcessComplete = (result: any) => {
    console.log('معالجة مكتملة:', result);
    // يمكن إضافة منطق إضافي هنا
  };

  return (
    <div className="image-processing-page">
      <header className="page-header">
        <h1>📸 معالجة الصور والتعرف على النصوص</h1>
        <p>اختر الطريقة المناسبة ثم ارفع صورك</p>
      </header>

      <section className="method-selection-section">
        <ProcessingMethodSelector
          selectedMethod={selectedMethod}
          onMethodChange={setSelectedMethod}
        />
      </section>

      <section className="upload-section">
        <ImageUploader
          method={selectedMethod}
          onProcessComplete={handleProcessComplete}
        />
      </section>

      <section className="info-section">
        <div className="info-card">
          <h3>💡 متى تستخدم كل طريقة؟</h3>
          
          <div className="use-cases">
            <div className="use-case">
              <h4>🧠 AI Vision</h4>
              <p>استخدمه عندما:</p>
              <ul>
                <li>الصورة تحتوي معادلات رياضية</li>
                <li>الصورة رسم تخطيطي أو مخطط</li>
                <li>الخط غير واضح</li>
                <li>تحتاج فهم سياق الصورة</li>
              </ul>
            </div>

            <div className="use-case">
              <h4>⚡ OCR</h4>
              <p>استخدمه عندما:</p>
              <ul>
                <li>الصورة نص واضح فقط</li>
                <li>تحتاج سرعة عالية</li>
                <li>تحتاج تكلفة أقل</li>
                <li>الكمية كبيرة</li>
              </ul>
            </div>

            <div className="use-case">
              <h4>🎯 Hybrid</h4>
              <p>استخدمه عندما:</p>
              <ul>
                <li>غير متأكد من نوع الصورة</li>
                <li>تحتاج أفضل نتيجة ممكنة</li>
                <li>مزيج من صور مختلفة</li>
                <li>الخيار الموصى به (افتراضي)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


