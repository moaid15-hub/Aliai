// 🤖 المكون الرئيسي للـ Developer Assistant

'use client';

import { useState } from 'react';
import { CommandType, ConnectionStatus, CommandResult, CommandStatus } from '@/types/developer';
import ConnectionStatusComponent from './ConnectionStatus';
import CommandInput from './CommandInput';

interface DevAssistantProps {
  apiKey: string;
}

export default function DevAssistant({ apiKey }: DevAssistantProps) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    ConnectionStatus.CONNECTED
  );
  const [executing, setExecuting] = useState(false);
  const [results, setResults] = useState<CommandResult[]>([]);
  const [currentProject] = useState('My Project');

  const executeCommand = async (type: CommandType, payload: Record<string, any>) => {
    setExecuting(true);

    try {
      const response = await fetch('/api/dev/commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          payload,
          api_key: apiKey,
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setResults((prev) => [data.data, ...prev]);
      } else {
        // إنشاء نتيجة فشل
        const errorResult: CommandResult = {
          command_id: Date.now().toString(),
          status: CommandStatus.FAILED,
          error: data.error || 'Unknown error',
          executed_at: new Date(),
          execution_time: 0,
        };
        setResults((prev) => [errorResult, ...prev]);
      }
    } catch (error: any) {
      const errorResult: CommandResult = {
        command_id: Date.now().toString(),
        status: CommandStatus.FAILED,
        error: error.message,
        executed_at: new Date(),
        execution_time: 0,
      };
      setResults((prev) => [errorResult, ...prev]);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* الهيدر */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">🤖 Developer Assistant</h1>
          <p className="text-gray-600 dark:text-gray-400">
            تحكم في مشروعك المحلي من هنا
          </p>
        </div>

        {/* حالة الاتصال */}
        <div className="mb-6">
          <ConnectionStatusComponent
            status={connectionStatus}
            projectName={currentProject}
          />
        </div>

        {/* إدخال الأوامر */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CommandInput onExecute={executeCommand} disabled={executing} />

          {/* معلومات */}
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-300 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">💡 نصائح سريعة</h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li>✅ استخدم <strong>قراءة ملف</strong> لعرض محتوى الملفات</li>
              <li>✏️ استخدم <strong>كتابة ملف</strong> لإنشاء أو تعديل ملفات</li>
              <li>📋 استخدم <strong>عرض الملفات</strong> لاستكشاف المشروع</li>
              <li>🔍 استخدم <strong>Git Status</strong> لمعرفة التغييرات</li>
              <li>⚠️ الأوامر الخطرة (حذف، Push) تحتاج موافقة</li>
            </ul>
          </div>
        </div>

        {/* النتائج */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">📊 النتائج</h3>

          {results.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-4">🎯</p>
              <p>لم يتم تنفيذ أي أمر بعد</p>
              <p className="text-sm mt-2">ابدأ بتنفيذ أمر أعلاه</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {results.map((result, index) => (
                <ResultCard key={index} result={result} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultCard({ result }: { result: CommandResult }) {
  const isSuccess = result.status === 'success';

  return (
    <div
      className={`border-l-4 p-4 rounded-lg ${
        isSuccess
          ? 'bg-green-50 dark:bg-green-900 border-green-500'
          : 'bg-red-50 dark:bg-red-900 border-red-500'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{isSuccess ? '✅' : '❌'}</span>
          <span className="font-bold">
            {isSuccess ? 'نجح التنفيذ' : 'فشل التنفيذ'}
          </span>
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {result.execution_time}ms
        </span>
      </div>

      {result.error && (
        <p className="text-sm text-red-700 dark:text-red-300 mb-2">
          {result.error}
        </p>
      )}

      {result.output && (
        <pre className="bg-white dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
          {typeof result.output === 'string'
            ? result.output
            : JSON.stringify(result.output, null, 2)}
        </pre>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        {result.executed_at?.toLocaleString('ar')}
      </p>
    </div>
  );
}
