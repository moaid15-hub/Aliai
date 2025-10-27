// src/app/personas/create/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import PersonaCreator from '@/features/personas/components/PersonaCreator';
import { Persona } from '@/features/personas/types/persona.types';

export default function CreatePersonaPage() {
  const router = useRouter();

  const handleSave = (persona: Persona) => {
    // Success message
    alert(`تم إنشاء الشخصية "${persona.name}" بنجاح! 🎉`);
    
    // Redirect to persona details
    router.push(`/personas/${persona.id}`);
  };

  const handleCancel = () => {
    router.push('/personas');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* ⚠️ تحذير - للمطورين فقط */}
        <div className="mb-8 p-6 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 border border-orange-300 dark:border-orange-700 rounded-lg shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">⚠️</span>
            <h2 className="text-xl font-bold text-orange-800 dark:text-orange-300">تحذير مهم</h2>
          </div>
          <div className="text-orange-700 dark:text-orange-300 space-y-2">
            <p className="text-lg font-semibold">🔒 هذه الصفحة مخصصة للمطورين فقط</p>
            <div className="text-sm space-y-1">
              <p>• إنشاء الشخصيات يتطلب معرفة تقنية بالـ System Prompts</p>
              <p>• التعديل الخاطئ قد يؤثر على أداء الذكاء الاصطناعي</p>
              <p>• يُنصح بعمل نسخة احتياطية قبل التعديل</p>
              <p>• للمستخدمين العاديين: يرجى استخدام الشخصيات الجاهزة من المعرض</p>
            </div>
            <div className="mt-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded border-l-4 border-orange-500">
              <p className="text-xs font-mono text-orange-600 dark:text-orange-400">
                💡 نصيحة: إذا لم تكن مطوراً، انتقل إلى <a href="/personas" className="underline font-semibold">معرض الشخصيات</a> واختر من الشخصيات الجاهزة
              </p>
            </div>
          </div>
        </div>

        <PersonaCreator
          mode="create"
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}

