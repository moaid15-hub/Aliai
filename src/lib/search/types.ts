// ============================================
// 📦 Search Types - التعريفات المشتركة
// ============================================

export type SearchSource =
  | 'google'
  | 'google_news'
  | 'bing'
  | 'bing_news'
  | 'youtube'
  | 'wikipedia'
  | 'twitter_api'
  | 'arabic_sources';

export type SearchResultType = 'youtube' | 'article' | 'news' | 'general';

export interface SearchResult {
  title: string;
  url: string;
  description: string;
  snippet?: string;
  source: SearchSource;
  type: SearchResultType;
  thumbnail?: string;
  publishedDate?: string;
  author?: string;
  score?: number;
  displayLink?: string;
  video?: {
    duration?: string;
    views?: string;
    channelName?: string;
  };
}

export interface SearchResponse {
  results: SearchResult[];
  totalResults?: number;
  searchTime?: number;
  cached?: boolean;
}
