// 🔌 مكون حالة الاتصال

'use client';

import { ConnectionStatus } from '@/types/developer';

interface ConnectionStatusProps {
  status: ConnectionStatus;
  projectName?: string;
  error?: string;
}

export default function ConnectionStatusComponent({
  status,
  projectName,
  error,
}: ConnectionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return {
          icon: '✅',
          text: 'متصل',
          color: 'bg-green-100 dark:bg-green-900 border-green-400 text-green-800 dark:text-green-200',
          pulse: false,
        };
      case ConnectionStatus.CONNECTING:
        return {
          icon: '⏳',
          text: 'جاري الاتصال...',
          color: 'bg-yellow-100 dark:bg-yellow-900 border-yellow-400 text-yellow-800 dark:text-yellow-200',
          pulse: true,
        };
      case ConnectionStatus.ERROR:
        return {
          icon: '❌',
          text: 'خطأ في الاتصال',
          color: 'bg-red-100 dark:bg-red-900 border-red-400 text-red-800 dark:text-red-200',
          pulse: false,
        };
      case ConnectionStatus.DISCONNECTED:
      default:
        return {
          icon: '⚪',
          text: 'غير متصل',
          color: 'bg-gray-100 dark:bg-gray-700 border-gray-400 text-gray-800 dark:text-gray-200',
          pulse: false,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`border-2 rounded-lg p-4 ${config.color} transition-all duration-300`}>
      <div className="flex items-center gap-3">
        <span className={`text-2xl ${config.pulse ? 'animate-pulse' : ''}`}>
          {config.icon}
        </span>
        <div className="flex-1">
          <p className="font-bold">{config.text}</p>
          {projectName && status === ConnectionStatus.CONNECTED && (
            <p className="text-sm opacity-80">المشروع: {projectName}</p>
          )}
          {error && status === ConnectionStatus.ERROR && (
            <p className="text-sm opacity-80 mt-1">{error}</p>
          )}
        </div>
        {config.pulse && (
          <div className="w-3 h-3 bg-current rounded-full animate-ping"></div>
        )}
      </div>
    </div>
  );
}
