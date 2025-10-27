'use client';

/**
 * Redirect من /teacher إلى /personas/iraqi-teacher
 * للحفاظ على الروابط القديمة
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TeacherRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/personas/iraqi-teacher');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <div className="text-6xl mb-4">🔄</div>
        <p className="text-xl font-semibold text-gray-700">جاري التحويل...</p>
      </div>
    </div>
  );
}
