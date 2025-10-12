"use client";

import React from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
          <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-xl p-6 text-right">
            <h1 className="text-xl font-bold text-red-600 mb-2">حدث خطأ غير متوقع</h1>
            <p className="text-sm text-gray-600 mb-4">{error?.message || "عذراً، حدث خطأ في التطبيق."}</p>
            {error?.digest && (
              <p className="text-xs text-gray-400 mb-4">رمز الخطأ: {error.digest}</p>
            )}
            <div className="flex gap-3 justify-start">
              <button
                onClick={reset}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                إعادة المحاولة
              </button>
              <a
                href="/"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                الصفحة الرئيسية
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
