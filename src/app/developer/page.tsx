// 🎨 صفحة Developer Assistant الرئيسية

'use client';

import { useState, useEffect } from 'react';
import SetupWizard from '@/components/developer/SetupWizard';
import DevAssistant from '@/components/developer/DevAssistant';

export default function DeveloperPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // التحقق من وجود API Key في localStorage
    const savedKey = localStorage.getItem('oqool_dev_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
    setLoading(false);
  }, []);

  const handleSetupComplete = (key: string) => {
    localStorage.setItem('oqool_dev_api_key', key);
    setApiKey(key);
  };

  const handleReset = () => {
    if (confirm('هل تريد حقاً إعادة الإعداد؟ سيتم حذف API Key الحالي.')) {
      localStorage.removeItem('oqool_dev_api_key');
      setApiKey(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⚙️</div>
          <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!apiKey) {
    return <SetupWizard onComplete={handleSetupComplete} />;
  }

  return (
    <div className="relative">
      <DevAssistant apiKey={apiKey} />
      
      {/* زر إعادة الإعداد */}
      <button
        onClick={handleReset}
        className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
      >
        🔄 إعادة الإعداد
      </button>
    </div>
  );
}
