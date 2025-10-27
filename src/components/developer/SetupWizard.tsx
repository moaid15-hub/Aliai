// 🧙‍♂️ معالج الإعداد الأولي

'use client';

import { useState } from 'react';
import ApiKeyManager from './ApiKeyManager';

interface SetupWizardProps {
  onComplete: (apiKey: string) => void;
}

export default function SetupWizard({ onComplete }: SetupWizardProps) {
  const [step, setStep] = useState(1);
  const [apiKey, setApiKey] = useState('');

  const handleKeyGenerated = (key: string) => {
    setApiKey(key);
    setStep(2);
  };

  const handleComplete = () => {
    if (apiKey) {
      onComplete(apiKey);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">🚀 مرحباً في Developer Assistant</h1>
        <p className="text-gray-600 dark:text-gray-400">
          دعنا نقوم بإعداد كل شيء في 3 خطوات بسيطة
        </p>
      </div>

      {/* شريط التقدم */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <StepIndicator number={1} active={step === 1} completed={step > 1} />
        <div className={`h-1 w-20 ${step > 1 ? 'bg-blue-600' : 'bg-gray-300'}`} />
        <StepIndicator number={2} active={step === 2} completed={step > 2} />
        <div className={`h-1 w-20 ${step > 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
        <StepIndicator number={3} active={step === 3} completed={step > 3} />
      </div>

      {/* محتوى الخطوات */}
      <div className="space-y-6">
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">الخطوة 1: توليد API Key</h2>
            <ApiKeyManager onKeyGenerated={handleKeyGenerated} />
          </div>
        )}

        {step === 2 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">الخطوة 2: تثبيت Dev Server</h2>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                الآن، قم بتثبيت <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">oqool-dev-server</code> في مشروعك المحلي:
              </p>

              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                <p className="mb-2"># في مجلد مشروعك المحلي:</p>
                <p className="text-green-400">$ npm install -g oqool-dev-server</p>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                💡 سنقوم بإنشاء هذا الـ Package في الخطوات القادمة
              </p>

              <button
                onClick={() => setStep(3)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                التالي ➡️
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">الخطوة 3: تشغيل Dev Server</h2>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                قم بتشغيل Dev Server في مشروعك:
              </p>

              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm space-y-2">
                <p className="text-gray-400"># انتقل لمجلد مشروعك:</p>
                <p className="text-green-400">$ cd /path/to/your/project</p>
                <p className="text-gray-400 mt-4"># شغل Dev Server:</p>
                <p className="text-green-400">$ oqool-dev start --api-key {apiKey.substring(0, 20)}...</p>
              </div>

              <div className="bg-green-50 dark:bg-green-900 border border-green-400 p-4 rounded-lg">
                <p className="text-green-800 dark:text-green-200 font-bold mb-2">✅ جاهز!</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  الآن يمكنك استخدام Developer Assistant للتحكم في مشروعك من هنا 🎉
                </p>
              </div>

              <button
                onClick={handleComplete}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                ✨ ابدأ الاستخدام
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepIndicator({
  number,
  active,
  completed,
}: {
  number: number;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
        completed
          ? 'bg-green-600 text-white'
          : active
          ? 'bg-blue-600 text-white'
          : 'bg-gray-300 dark:bg-gray-700 text-gray-600'
      }`}
    >
      {completed ? '✓' : number}
    </div>
  );
}
