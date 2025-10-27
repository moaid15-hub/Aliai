// ============================================
// 📝 Search System Types & Interfaces
// نظام التعريفات الشامل للبحث
// ============================================

// 🔍 Search Result - نتيجة البحث الأساسية
export interface SearchResult {
  id?: string;
  title: string;
  url: string;
  snippet: string;
  content: string;
  source: SearchSource;

  // معلومات إضافية
  relevanceScore?: number;
  publishDate?: string;
  author?: string;
  language?: string;

  // روابط ومعاينات
  displayLink?: string;
  formattedUrl?: string;
  thumbnail?: string;
  favicon?: string;

  // معلومات وسائط
  image?: ImageInfo;
  video?: VideoInfo;

  // بيانات إضافية
  metadata?: Record<string, any>;
  tags?: string[];
}

// 🖼️ Image Information
export interface ImageInfo {
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  alt?: string;
  contextLink?: string;
}

// 🎥 Video Information
export interface VideoInfo {
  videoId?: string;
  duration?: string;
  views?: string;
  uploadDate?: string;
  channelName?: string;
  channelUrl?: string;
  thumbnailUrl?: string;
}

// 🌐 Search Sources - مصادر البحث
export enum SearchSource {
  GOOGLE = 'google',
  YOUTUBE = 'youtube',
  WIKIPEDIA = 'wikipedia',
  STACKOVERFLOW = 'stackoverflow',
  GITHUB = 'github',
  REDDIT = 'reddit',
  TWITTER = 'twitter',
  TAVILY = 'tavily',
  PERPLEXITY = 'perplexity',
  BING = 'bing',
  DUCKDUCKGO = 'duckduckgo',
  BRAVE = 'brave',
  SCHOLAR = 'scholar',
  NEWS = 'news',
  RELIGIOUS = 'religious',
  CUSTOM = 'custom'
}

// 📊 Search Response - استجابة البحث الكاملة
export interface SearchResponse {
  query: string;
  results: SearchResult[];
  totalResults: number;
  searchTime: number;
  sources: SearchSource[];

  // معلومات إضافية
  correctedQuery?: string;
  suggestions?: string[];
  relatedSearches?: string[];

  // بيانات التخزين المؤقت
  cached?: boolean;
  cacheTimestamp?: number;

  // معلومات الصفحات
  currentPage?: number;
  totalPages?: number;
  hasMore?: boolean;
}

// 🎯 Multi-Source Response - استجابة متعددة المصادر
export interface MultiSourceResponse {
  query: string;
  primarySource: SourceResults;
  additionalSources: SourceResults[];
  aggregatedResults: SearchResult[];
  totalResults: number;
  searchTime: number;
  metadata?: SearchMetadata;
}

// 📦 Source Results - نتائج من مصدر واحد
export interface SourceResults {
  source: SearchSource;
  sourceLabel: string;
  icon: string;
  results: SearchResult[];
  totalResults: number;
  searchTime: number;
  error?: string;
}

// 📋 Search Metadata
export interface SearchMetadata {
  timestamp: number;
  userAgent?: string;
  location?: string;
  language?: string;
  customData?: Record<string, any>;
}

// ⚙️ Search Options - خيارات البحث
export interface SearchOptions {
  // أساسيات
  maxResults?: number;
  page?: number;
  language?: string;
  country?: string;

  // الأداء
  timeout?: number;
  retries?: number;
  fastMode?: boolean;

  // الفلترة
  dateRange?: DateRange;
  safeSearch?: SafeSearchLevel;
  exactMatch?: boolean;
  excludeTerms?: string[];
  includeDomains?: string[];
  excludeDomains?: string[];

  // المصادر
  sources?: SearchSource[];
  primarySource?: SearchSource;
  fallbackSources?: SearchSource[];

  // الميزات المتقدمة
  useAI?: boolean;
  smartRanking?: boolean;
  deduplication?: boolean;
  streaming?: boolean;

  // التخصيص
  personalizedResults?: boolean;
  userPreferences?: UserPreferences;
}

// 📅 Date Range
export interface DateRange {
  from?: Date | string;
  to?: Date | string;
  preset?: 'today' | 'week' | 'month' | 'year' | 'custom';
}

// 🛡️ Safe Search Level
export type SafeSearchLevel = 'off' | 'medium' | 'high';

// 👤 User Preferences
export interface UserPreferences {
  favoriteTopics?: string[];
  blockedDomains?: string[];
  preferredLanguages?: string[];
  preferredSources?: SearchSource[];
}

// 🎨 Search Provider Interface - واجهة موحدة لكل مزودي البحث
export interface ISearchProvider {
  name: string;
  source: SearchSource;
  priority: number;

  search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  isAvailable(): Promise<boolean>;
  getQuota(): Promise<ProviderQuota>;
}

// 📊 Provider Quota
export interface ProviderQuota {
  used: number;
  limit: number;
  remaining: number;
  resetAt?: Date;
}

// 🧠 Query Analysis - تحليل الاستعلام
export interface QueryAnalysis {
  originalQuery: string;
  normalizedQuery: string;
  intent: QueryIntent;
  category: QueryCategory;
  entities?: Entity[];
  keywords: string[];
  language: string;
  requiresWebSearch: boolean;
  suggestedSources: SearchSource[];
  confidence: number;
}

// 🎯 Query Intent
export enum QueryIntent {
  INFORMATIONAL = 'informational',    // معلومات عامة
  NAVIGATIONAL = 'navigational',      // البحث عن موقع
  TRANSACTIONAL = 'transactional',    // إجراء عملية
  COMMERCIAL = 'commercial',           // شراء/مقارنة
  LOCAL = 'local',                     // بحث محلي
  NEWS = 'news',                       // أخبار
  MEDIA = 'media',                     // صور/فيديو
  ACADEMIC = 'academic',               // أكاديمي
  RELIGIOUS = 'religious',             // ديني
  TECHNICAL = 'technical'              // تقني/برمجي
}

// 📚 Query Category
export enum QueryCategory {
  GENERAL = 'general',
  TECHNOLOGY = 'technology',
  SCIENCE = 'science',
  HEALTH = 'health',
  EDUCATION = 'education',
  ENTERTAINMENT = 'entertainment',
  SPORTS = 'sports',
  BUSINESS = 'business',
  NEWS = 'news',
  RELIGION = 'religion',
  PROGRAMMING = 'programming',
  MATH = 'math',
  HISTORY = 'history',
  GEOGRAPHY = 'geography'
}

// 🏷️ Entity - كيان مستخرج
export interface Entity {
  text: string;
  type: EntityType;
  confidence: number;
  metadata?: Record<string, any>;
}

// 🎯 Entity Types
export enum EntityType {
  PERSON = 'person',
  ORGANIZATION = 'organization',
  LOCATION = 'location',
  DATE = 'date',
  TIME = 'time',
  MONEY = 'money',
  PERCENTAGE = 'percentage',
  PRODUCT = 'product',
  EVENT = 'event',
  URL = 'url',
  EMAIL = 'email',
  PHONE = 'phone'
}

// 💾 Cache Entry
export interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
  expiresAt: number;
  hits: number;
  tags?: string[];
}

// ⚡ Rate Limit Info
export interface RateLimitInfo {
  requests: number;
  limit: number;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}

// 📈 Search Statistics
export interface SearchStatistics {
  totalSearches: number;
  successfulSearches: number;
  failedSearches: number;
  averageResponseTime: number;
  cacheHitRate: number;
  providerUsage: Record<SearchSource, number>;
  popularQueries: Array<{ query: string; count: number }>;
}

// 🎨 Format Options
export interface FormatOptions {
  format: 'markdown' | 'html' | 'json' | 'text';
  includeMetadata?: boolean;
  includeSources?: boolean;
  maxLength?: number;
  template?: string;
}

// ❌ Search Error
export interface SearchError {
  code: string;
  message: string;
  source?: SearchSource;
  details?: any;
  timestamp: number;
  retryable: boolean;
}

// 🔄 Retry Strategy
export interface RetryStrategy {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

// 📊 Search Performance Metrics
export interface PerformanceMetrics {
  queryTime: number;
  networkTime: number;
  processingTime: number;
  cacheTime: number;
  totalTime: number;
  resultsCount: number;
  providersUsed: number;
}

// 🎯 Search Configuration
export interface SearchConfig {
  defaultSource: SearchSource;
  fallbackSources: SearchSource[];
  maxConcurrentRequests: number;
  defaultTimeout: number;
  enableCache: boolean;
  cacheMaxAge: number;
  enableRateLimit: boolean;
  rateLimitMax: number;
  rateLimitWindow: number;
  enableAnalytics: boolean;
}
