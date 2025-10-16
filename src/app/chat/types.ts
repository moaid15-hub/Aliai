// types.ts
// ============================================
// 🔷 الأنواع الأساسية للنظام
// ============================================

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  provider?: string;
  sources?: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  needsUserChoice?: boolean;
  searchOptions?: {
    primary: 'google' | 'youtube';
    advanced: boolean;
  };
  videos?: Array<{
    id: string;
    title: string;
    thumbnail: string;
    url: string;
    channel: string;
    views: string;
    duration?: string;
  }>;
}

export interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
}

export interface Settings {
  autoSearch: boolean;
  soundEnabled: boolean;
  animationsEnabled: boolean;
}

export interface ToastData {
  message: string;
  type: 'success' | 'error' | 'info' | 'loading';
}