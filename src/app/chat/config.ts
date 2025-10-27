// config.ts
// ============================================
// ⚙️ التكوين والثوابت والـ UI Utilities
// ============================================

import { Conversation } from '@/lib/types';

// مقدمي خدمة AI
export const AI_PROVIDERS: Record<string, { name: string; color: string; textColor: string }> = {
  deepseek: { 
    name: 'عقول', 
    color: 'from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40', 
    textColor: 'text-orange-700 dark:text-orange-300' 
  },
  openai: { 
    name: 'عقول', 
    color: 'from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40', 
    textColor: 'text-green-700 dark:text-green-300' 
  },
  claude: { 
    name: 'MuayadAi', 
    color: 'from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40', 
    textColor: 'text-purple-700 dark:text-purple-300' 
  },
  search: { 
    name: 'بحث ذكي', 
    color: 'from-cyan-100 to-cyan-200 dark:from-cyan-900/40 dark:to-cyan-800/40', 
    textColor: 'text-cyan-700 dark:text-cyan-300' 
  },
  local: { 
    name: 'Oqool AI Local', 
    color: 'from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40', 
    textColor: 'text-blue-700 dark:text-blue-300' 
  },
};

// مفاتيح التخزين
export const STORAGE_KEYS = {
  CONVERSATIONS: 'oqool_ai_conversations',
  SETTINGS: 'oqool_ai_settings',
  THEME: 'oqool_ai_theme'
};

// حفظ في localStorage
export const saveToStorage = (key: string, data: any): void => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key}:`, e);
  }
};

// تحميل من localStorage
export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    if (typeof window === 'undefined') return defaultValue;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.warn(`Failed to load ${key}:`, e);
    return defaultValue;
  }
};

// نسخ للحافظة
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

// تصدير محادثة
export const exportConversation = (conversation: Conversation): void => {
  const content = conversation.messages
    .map(m => `[${m.role.toUpperCase()}] ${m.content}`)
    .join('\n\n');
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${conversation.title}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};