// ============================================
// 📚 src/lib/index.ts - المكتبة الرئيسية (محدّثة)
// ============================================

// 🔍 نظام البحث الجديد المنظم
export {
  search,
  multiSearch,
  searchAndFormat,
  getSearchStats,
  clearSearchCache,
  searchEngine,
  SearchEngine,
  QueryAnalyzer,
  ResultRanker,
  MarkdownFormatter
} from './search';

export type {
  SearchResult,
  SearchResponse,
  MultiSourceResponse,
  SearchOptions,
  SearchSource,
  SourceResults,
  QueryAnalysis,
  QueryIntent,
  QueryCategory
} from './search/core/types';

export {
  SearchSource as SearchSourceEnum,
  QueryIntent as QueryIntentEnum,
  QueryCategory as QueryCategoryEnum
} from './search/core/types';

// 🎯 Search Classification
export {
  classifyQuestion,
  logClassification,
  QuestionType
} from './search-classifier';

// 📝 Types
export type {
  Message,
  Conversation,
  Settings
} from './types';

// 🎯 Utility Functions
export const LIBRARY_VERSION = '4.0.0';
export const SUPPORTED_LANGUAGES = ['ar', 'en', 'auto'] as const;
export const DEFAULT_MAX_RESULTS = 10;
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// 📊 Search Statistics
export interface SearchStats {
  totalSearches: number;
  religiousSearches: number;
  technicalSearches: number;
  generalSearches: number;
  averageResponseTime: number;
  cacheHitRate: number;
}

// 🔧 Configuration
export const SEARCH_CONFIG = {
  maxResults: DEFAULT_MAX_RESULTS,
  cacheEnabled: true,
  cacheDuration: CACHE_DURATION,
  enableEnhancedSearch: true,
  enableReligiousSearch: true,
  smartFiltering: true,
  multilingual: true
} as const;

// 🎨 Search Themes
export const SEARCH_THEMES = {
  religious: {
    icon: '🕌',
    color: '#10B981',
    description: 'البحث الديني المتخصص'
  },
  technical: {
    icon: '💻',
    color: '#3B82F6',
    description: 'البحث التقني والبرمجي'
  },
  general: {
    icon: '🔍',
    color: '#6366F1',
    description: 'البحث العام'
  },
  enhanced: {
    icon: '🚀',
    color: '#8B5CF6',
    description: 'البحث المتقدم متعدد المصادر'
  }
} as const;

export default {
  version: LIBRARY_VERSION,
  config: SEARCH_CONFIG,
  themes: SEARCH_THEMES,
  supportedLanguages: SUPPORTED_LANGUAGES
};
