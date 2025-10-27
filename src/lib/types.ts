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
  advancedSearchQuery?: string; // 🆕 للبحث المتقدم
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

// ============================================
// 🔍 البحث والنتائج
// ============================================

export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  displayLink?: string;
  thumbnail?: string;
  author?: string;
  views?: string;
  duration?: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  totalResults: string;
  source: string;
  searchTime: number;
}

export interface MultiSourceResponse {
  query: string;
  primarySource?: {
    source: string;
    icon: string;
    results: SearchResult[];
  };
  additionalSources?: Array<{
    source: string;
    icon: string;
    results: SearchResult[];
  }>;
  searchTime: number;
  totalResults?: string;
  google?: SearchResult[];
}

export interface SearchOptions {
  maxResults?: number;
  fastMode?: boolean;
  smartSearch?: boolean;
  advancedMode?: boolean;
  recentOnly?: boolean;
  exactMatch?: boolean;
  primaryOnly?: boolean;
  quickSearch?: boolean;
}