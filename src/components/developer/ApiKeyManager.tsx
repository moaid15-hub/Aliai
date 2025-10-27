// 🔑 مكون إدارة API Keys

'use client';

import { useState } from 'react';

interface ApiKeyManagerProps {
  onKeyGenerated?: (key: string) => void;
}

export default function ApiKeyManager({ onKeyGenerated }: ApiKeyManagerProps) {
  const [keyName, setKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generateKey = async () => {
    if (!keyName.trim()) {
      setError('الرجاء إدخال اسم للمفتاح');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/dev/auth/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: keyName,
          permissions: ['*'],
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedKey(data.data.key);
        if (onKeyGenerated) {
          onKeyGenerated(data.data.key);
        }
        setKeyName('');
      } else {
        setError(data.error || 'فشل في توليد المفتاح');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء التوليد');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">🔑 إدارة API Keys</h2>

      <div className="space-y-4">
        {/* إدخال اسم المفتاح */}
        <div>
          <label className="block text-sm font-medium mb-2">
            اسم المفتاح
          </label>
          <input
            type="text"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            placeholder="مثال: Local Development"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        {/* زر التوليد */}
        <button
          onClick={generateKey}
          disabled={loading || !keyName.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          {loading ? '⏳ جاري التوليد...' : '✨ توليد API Key جديد'}
        </button>

        {/* رسالة خطأ */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">
            ❌ {error}
          </div>
        )}

        {/* المفتاح المولد */}
        {generatedKey && (
          <div className="bg-green-50 dark:bg-green-900 border border-green-400 p-4 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200 mb-2 font-bold">
              ✅ تم توليد المفتاح بنجاح! احفظه في مكان آمن:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white dark:bg-gray-800 px-3 py-2 rounded text-sm font-mono break-all">
                {generatedKey}
              </code>
              <button
                onClick={copyToClipboard}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
              >
                {copied ? '✓ تم النسخ' : '📋 نسخ'}
              </button>
            </div>
            <p className="text-xs text-green-700 dark:text-green-300 mt-2">
              ⚠️ لن تتمكن من رؤية هذا المفتاح مرة أخرى!
            </p>
          </div>
        )}

        {/* معلومات إضافية */}
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-300 p-4 rounded-lg text-sm">
          <h3 className="font-bold mb-2">💡 كيفية الاستخدام:</h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
            <li>قم بتوليد API Key جديد</li>
            <li>احفظه في ملف <code>.env.local</code></li>
            <li>استخدمه في <code>oqool-dev-server</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
}
