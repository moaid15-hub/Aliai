"use client";

import React from "react";

export default function ChatError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-6 text-right">
        <h1 className="text-xl font-bold text-red-600 mb-2">حدث خطأ في الدردشة</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{error?.message || "عذراً، حدث خطأ في هذه الصفحة."}</p>
        {error?.digest && (
          <p className="text-xs text-gray-400 mb-4">رمز الخطأ: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-start">
          <button onClick={reset} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            إعادة المحاولة
          </button>
          <a href="/" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
            الصفحة الرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}
