// ===================================
// عارض معلومات النظام الذكي
// ===================================

import React from 'react';
import { Brain, Zap, Shield, TrendingUp } from 'lucide-react';

interface AIProviderInfo {
  name: string;
  icon: string;
  specialty: string;
  description: string;
  color: string;
}

const providerInfo: Record<string, AIProviderInfo> = {
  openai: {
    name: 'عقول AI',
    icon: '🧠',
    specialty: 'الأسئلة المعقدة والرياضيات',
    description: 'متوازن وسريع، مثالي للأسئلة العامة والمعقدة',
    color: 'from-green-500 to-emerald-500'
  },
  deepseek: {
    name: 'DeepSeek AI',
    icon: '💻',
    specialty: 'البرمجة والمحادثات البسيطة',
    description: 'متخصص في الكود والبرمجة والمحادثات السريعة',
    color: 'from-blue-500 to-cyan-500'
  },
  claude: {
    name: 'Claude AI',
    icon: '✨',
    specialty: 'الكتابة الإبداعية والتحليل العميق',
    description: 'قوي في التحليل والكتابة والترجمة والمواضيع الطبية',
    color: 'from-purple-500 to-pink-500'
  }
};

export const AISystemInfo = ({ currentProvider }: { currentProvider?: string }) => {
  const info = currentProvider ? providerInfo[currentProvider] : null;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
          <svg width="24" height="24" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="6" fill="white"/>
            
            {/* الدائرة الخارجية */}
            <line x1="60" y1="60" x2="60" y2="20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="85" y2="32" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="95" y2="50" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="95" y2="70" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="85" y2="88" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="60" y2="100" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="35" y2="88" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="25" y2="70" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="25" y2="50" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="60" y1="60" x2="35" y2="32" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            
            {/* النقاط الخارجية */}
            <circle cx="60" cy="20" r="3" fill="white"/>
            <circle cx="85" cy="32" r="3" fill="white"/>
            <circle cx="95" cy="50" r="3" fill="white"/>
            <circle cx="95" cy="70" r="3" fill="white"/>
            <circle cx="85" cy="88" r="3" fill="white"/>
            <circle cx="60" cy="100" r="3" fill="white"/>
            <circle cx="35" cy="88" r="3" fill="white"/>
            <circle cx="25" cy="70" r="3" fill="white"/>
            <circle cx="25" cy="50" r="3" fill="white"/>
            <circle cx="35" cy="32" r="3" fill="white"/>
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            نظام الاختيار الذكي
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            يختار أفضل مزود AI تلقائياً
          </p>
        </div>
      </div>

      {info && (
        <div className={`p-4 rounded-xl bg-gradient-to-r ${info.color} text-white mb-4`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{info.icon}</span>
            <div>
              <h3 className="font-bold text-lg">{info.name}</h3>
              <p className="text-sm opacity-90">{info.specialty}</p>
            </div>
          </div>
          <p className="text-sm opacity-80">{info.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
          <Zap className="w-5 h-5 text-yellow-500" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">السرعة</p>
            <p className="font-semibold text-gray-800 dark:text-gray-200">تلقائي</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
          <Shield className="w-5 h-5 text-green-500" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">النسخ الاحتياطي</p>
            <p className="font-semibold text-gray-800 dark:text-gray-200">3 مستويات</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">التحسن</p>
            <p className="font-semibold text-gray-800 dark:text-gray-200">تعلم ذاتي</p>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
              كيف يعمل النظام الذكي؟
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
              يحلل نوع سؤالك ويختار أفضل مزود AI تلقائياً. إذا فشل المزود الأول، ينتقل للبديل فوراً.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISystemInfo;