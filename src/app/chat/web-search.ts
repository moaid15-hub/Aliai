// ============================================
// 🔍 نظام البحث الكامل المدمج
// Google Search + Multi-Source + Cache + Usage Tracker
// ============================================

// 📝 Types & Interfaces
interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  content: string;
  relevanceScore?: number;
  displayLink?: string;
  formattedUrl?: string;
  thumbnail?: string;
  author?: string;
  duration?: string;
  views?: string;
  image?: {
    contextLink?: string;
    height?: number;
    width?: number;
    thumbnailLink?: string;
  };
}

interface SearchResponse {
  results: SearchResult[];
  query: string;
  totalResults: string | number;
  searchTime: number;
  source: string;
}

interface MultiSourceResponse {
  query?: string;
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
  // بنية بديلة لنتائج مباشرة
  google?: SearchResult[];
  youtube?: SearchResult[];
  wikipedia?: SearchResult[];
  stackoverflow?: SearchResult[];
  github?: SearchResult[];
  totalResults: number;
  searchTime: number;
}

interface GoogleSearchConfig {
  apiKey: string;
  searchEngineId: string;
  language?: string;
  country?: string;
  safeSearch?: 'off' | 'medium' | 'high';
  numResults?: number;
}

interface SearchOptions {
  maxResults?: number;
  timeout?: number;
  recentOnly?: boolean;
  exactMatch?: boolean;
  fastMode?: boolean;
  retries?: number;
  smartSearch?: boolean; // جديد: للبحث الذكي متعدد المصادر
  searchMode?: 'normal' | 'advanced'; // وضع البحث: عادي أو متقدم
}

// ⚙️ Configuration
const DEFAULT_CONFIG = {
  language: 'ar',
  country: 'sa',
  safeSearch: 'medium' as const,
  numResults: 5,
  timeout: 10000,
  fastTimeout: 3000,
  maxRetries: 3,
  fastRetries: 1
};

// ============================================
// 💾 Cache System
// ============================================

interface CacheEntry {
  data: SearchResponse | MultiSourceResponse;
  timestamp: number;
}

class SearchCache {
  private cache: Map<string, CacheEntry>;
  private maxAge: number;
  private maxSize: number;

  constructor(maxAge: number = 30 * 60 * 1000, maxSize: number = 200) {
    this.cache = new Map();
    this.maxAge = maxAge;
    this.maxSize = maxSize;
  }

  private generateKey(query: string, options: any): string {
    return `${query}_${options.smartSearch}_${options.maxResults}`;
  }

  set(query: string, options: any, data: SearchResponse | MultiSourceResponse): void {
    const key = this.generateKey(query, options);
    
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(query: string, options: any): SearchResponse | MultiSourceResponse | null {
    const key = this.generateKey(query, options);
    const entry = this.cache.get(key);

    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      maxAge: this.maxAge
    };
  }
}

const searchCache = new SearchCache();

// ============================================
// 📊 Usage Tracker
// ============================================

class UsageTracker {
  private dailyUsage: Map<string, number>;
  private maxDailyQueries: number;

  constructor(maxDailyQueries: number = 100) {
    this.dailyUsage = new Map();
    this.maxDailyQueries = maxDailyQueries;
  }

  private getTodayKey(): string {
    return new Date().toISOString().split('T')[0];
  }

  canSearch(): boolean {
    const today = this.getTodayKey();
    const usage = this.dailyUsage.get(today) || 0;
    return usage < this.maxDailyQueries;
  }

  incrementUsage(): void {
    const today = this.getTodayKey();
    const current = this.dailyUsage.get(today) || 0;
    this.dailyUsage.set(today, current + 1);
  }

  getUsage() {
    const today = this.getTodayKey();
    const used = this.dailyUsage.get(today) || 0;
    return {
      used,
      remaining: this.maxDailyQueries - used,
      limit: this.maxDailyQueries
    };
  }

  resetDaily(): void {
    const today = this.getTodayKey();
    this.dailyUsage.clear();
    this.dailyUsage.set(today, 0);
  }
}

const usageTracker = new UsageTracker(100);

// ============================================
// 🎯 Keywords & Detection
// ============================================

const SEARCH_KEYWORDS = [
  'ابحث عن', 'دور على', 'ابحث لي عن', 'find me', 'search for',
  'معلومات عن', 'أريد معرفة', 'أخبرني عن', 'وضح لي',
  'آخر أخبار', 'أحدث', 'جديد في', 'ما الجديد', 'latest news',
  'أخبار اليوم', 'حديث عن', 'معلومات حديثة عن', 'الأخبار',
  'قارن بين', 'مقارنة', 'الفرق بين', 'أيهما أفضل',
  'سعر', 'كم سعر', 'كم يكلف', 'تكلفة', 'price', 'cost',
  'متى', 'تاريخ', 'موعد', 'when', 'date',
  'إحصائيات', 'أرقام', 'بيانات', 'statistics', 'data',
  'الطقس', 'weather', 'الأسهم', 'stock', 'البورصة'
];

const EXCLUDE_PATTERNS = [
  'مرحبا', 'مرحباً', 'أهلا', 'سلام', 'السلام عليكم',
  'صباح الخير', 'مساء الخير', 'شكرا', 'شكراً',
  'hello', 'hi', 'hey', 'thanks', 'bye',
  'كيف حالك', 'كيفك', 'how are you', 'ما اسمك'
];

// أنماط المصادر المتخصصة
const SOURCE_PATTERNS = {
  youtube: {
    keywords: ['فيديو', 'شرح', 'تعليم', 'درس', 'كورس', 'video', 'tutorial', 'how to', 'كيف أسوي'],
    icon: '🎥',
    priority: 1
  },
  wikipedia: {
    keywords: ['من هو', 'ما هو', 'ما هي', 'تعريف', 'معنى', 'who is', 'what is', 'define', 'تاريخ'],
    icon: '📚',
    priority: 2
  },
  stackoverflow: {
    keywords: ['خطأ', 'error', 'bug', 'كود', 'code', 'برمجة', 'programming', 'python', 'javascript'],
    icon: '💻',
    priority: 1
  },
  github: {
    keywords: ['مشروع', 'project', 'repository', 'repo', 'source code', 'open source'],
    icon: '⚙️',
    priority: 2
  },
  news: {
    keywords: ['أخبار', 'خبر', 'جديد', 'أحدث', 'آخر', 'news', 'latest', 'breaking'],
    icon: '📰',
    priority: 1
  }
};

/**
 * 🤔 هل السؤال يحتاج بحث؟
 */
export function needsSearch(query: string): boolean {
  const lowerQuery = query.toLowerCase().trim();
  
  if (lowerQuery.length < 8) return false;
  if (EXCLUDE_PATTERNS.some(p => lowerQuery.includes(p))) return false;
  
  const hasKeywords = SEARCH_KEYWORDS.some(k => lowerQuery.includes(k.toLowerCase()));
  
  const hasSearchPatterns = [
    /\b(في|من|حول|عن|about|of)\s+\w{4,}/g,
    /\b(كيف|how)\s+(يمكن|can)\s+\w+/g,
    /\b(ما هو|what is)\s+\w{3,}/g,
    /\d{4}|\b(عام|سنة|year)\b/g,
  ].some(pattern => pattern.test(lowerQuery));
  
  const isLongQuery = lowerQuery.length > 15;
  
  return hasKeywords || hasSearchPatterns || isLongQuery;
}

/**
 * كشف المصدر المناسب
 */
function detectBestSource(query: string): string[] {
  const lowerQuery = query.toLowerCase();
  const sources: Array<{ name: string; priority: number; matches: number }> = [];
  
  for (const [sourceName, config] of Object.entries(SOURCE_PATTERNS)) {
    const matches = config.keywords.filter(k => lowerQuery.includes(k.toLowerCase())).length;
    
    if (matches > 0) {
      sources.push({ name: sourceName, priority: config.priority, matches });
    }
  }
  
  sources.sort((a, b) => {
    if (a.matches !== b.matches) return b.matches - a.matches;
    return a.priority - b.priority;
  });
  
  // ✨ دائماً نضيف Wikipedia و YouTube كمصادر إضافية (للبحث الشامل)
  const detectedSources = sources.slice(0, 2).map(s => s.name);
  
  // إذا ما في مصادر محددة، نضيف Wikipedia و YouTube تلقائياً
  if (detectedSources.length === 0) {
    return ['wikipedia', 'youtube'];
  }
  
  // نتأكد إن Wikipedia و YouTube موجودة
  if (!detectedSources.includes('wikipedia')) {
    detectedSources.push('wikipedia');
  }
  if (!detectedSources.includes('youtube') && detectedSources.length < 3) {
    detectedSources.push('youtube');
  }
  
  return detectedSources.slice(0, 3); // أقصى 3 مصادر إضافية
}

// ============================================
// 🔍 Google Search
// ============================================

async function googleSearch(query: string, config: GoogleSearchConfig): Promise<SearchResponse> {
  const startTime = Date.now();

  const params = new URLSearchParams({
    key: config.apiKey,
    cx: config.searchEngineId,
    q: query,
    num: (config.numResults || 5).toString(),
    lr: `lang_${config.language || 'ar'}`,
    gl: config.country || 'sa',
    safe: config.safeSearch || 'medium'
  });

  const url = `https://www.googleapis.com/customsearch/v1?${params.toString()}`;
  console.log('🔍 Google Search:', query);

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`Google API error: ${response.status}`);
  }

  const data = await response.json();

  return {
    results: (data.items || []).map((item: any) => ({
      title: item.title || 'بدون عنوان',
      url: item.link || '',
      snippet: item.snippet || '',
      content: item.snippet || '',
      displayLink: item.displayLink,
      relevanceScore: 0.9,
      image: item.pagemap?.cse_image?.[0]
    })),
    query,
    totalResults: data.searchInformation?.totalResults || '0',
    searchTime: Date.now() - startTime,
    source: 'Google Custom Search'
  };
}

async function googleSearchWithRetry(
  query: string,
  config: GoogleSearchConfig,
  maxRetries: number = 3
): Promise<SearchResponse> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await googleSearch(query, config);
    } catch (error) {
      console.error(`❌ محاولة ${attempt} فشلت:`, error);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      } else {
        throw error;
      }
    }
  }
  throw new Error('فشل البحث');
}

// ============================================
// 🎥 Multi-Source Search Functions
// ============================================

async function searchYouTube(query: string, maxResults: number = 5): Promise<SearchResult[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];
  
  try {
    // تحسين الـ query
    let enhancedQuery = query
      .replace(/ابحث\s+(عن|لي|في)/g, '')
      .replace(/اليوم|الآن|حالياً/g, '')
      .trim();
    
    // إضافة كلمات مساعدة بناءً على نوع البحث
    if (query.match(/رياض|كرة|مباراة|فريق|هدف|بطولة/i)) {
      enhancedQuery += ' رياضة';
    } else if (query.match(/طبخ|وصفة|طعام|أكل/i)) {
      enhancedQuery += ' شرح';
    } else if (query.match(/كيف|طريقة|خطوات/i)) {
      enhancedQuery += ' تعليم شرح';
    }
    
    const params = new URLSearchParams({
      part: 'snippet',
      q: enhancedQuery,
      maxResults: (maxResults * 2).toString(), // ضعف العدد للفلترة
      type: 'video',
      key: apiKey,
      relevanceLanguage: 'ar'
    });
    
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
    if (!response.ok) return [];
    
    const data = await response.json();
    
    // فلترة النتائج
    const searchTerms = query.toLowerCase();
    const filtered = data.items
      ?.filter((item: any) => {
        const title = item.snippet.title.toLowerCase();
        const description = item.snippet.description.toLowerCase();
        
        // تحقق من الارتباط
        return searchTerms.split(' ').some(term => 
          term.length > 3 && (title.includes(term) || description.includes(term))
        );
      })
      .slice(0, maxResults) // العدد المطلوب بعد الفلترة
      .map((item: any) => ({
        title: item.snippet.title,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        snippet: item.snippet.description,
        content: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url, // نستخدم high للجودة العالية
        author: item.snippet.channelTitle,
        relevanceScore: 0.9
      })) || [];
    
    return filtered;
  } catch (error) {
    console.error('خطأ YouTube:', error);
    return [];
  }
}

async function searchWikipedia(query: string, maxResults: number = 3): Promise<SearchResult[]> {
  try {
    // تحسين الـ query للبحث الأفضل
    const cleanQuery = query
      .replace(/ابحث\s+(عن|لي|في)/g, '')
      .replace(/اليوم|الآن|حالياً/g, '')
      .trim();
    
    const params = new URLSearchParams({
      action: 'query',
      list: 'search',
      srsearch: cleanQuery,
      format: 'json',
      srlimit: (maxResults * 2).toString(), // نجيب ضعف العدد للفلترة
      origin: '*'
    });
    
    const response = await fetch(`https://ar.wikipedia.org/w/api.php?${params.toString()}`);
    if (!response.ok) return [];
    
    const data = await response.json();
    
    // فلترة النتائج غير المرتبطة
    const filtered = data.query?.search
      ?.filter((item: any) => {
        const title = item.title.toLowerCase();
        const snippet = item.snippet.toLowerCase();
        const searchTerms = cleanQuery.toLowerCase();
        
        // تحقق من وجود كلمات البحث في العنوان أو الوصف
        return title.includes(searchTerms) || 
               snippet.includes(searchTerms) ||
               searchTerms.split(' ').some(term => 
                 term.length > 3 && (title.includes(term) || snippet.includes(term))
               );
      })
      .slice(0, maxResults) // خذ العدد المطلوب بعد الفلترة
      .map((item: any) => ({
        title: item.title,
        url: `https://ar.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
        snippet: item.snippet.replace(/<[^>]*>/g, ''),
        content: item.snippet.replace(/<[^>]*>/g, ''),
        relevanceScore: 0.85
      })) || [];
    
    return filtered;
  } catch (error) {
    console.error('خطأ Wikipedia:', error);
    return [];
  }
}

async function searchStackOverflow(query: string, maxResults: number = 5): Promise<SearchResult[]> {
  try {
    const params = new URLSearchParams({
      order: 'desc',
      sort: 'relevance',
      intitle: query,
      site: 'stackoverflow',
      pagesize: maxResults.toString()
    });
    
    const response = await fetch(`https://api.stackexchange.com/2.3/search/advanced?${params.toString()}`);
    if (!response.ok) return [];
    
    const data = await response.json();
    
    return data.items?.map((item: any) => ({
      title: item.title,
      url: item.link,
      snippet: `${item.answer_count} إجابة • ${item.score} نقطة`,
      content: item.title,
      author: item.owner?.display_name,
      views: item.view_count?.toString(),
      relevanceScore: 0.8
    })) || [];
  } catch (error) {
    console.error('خطأ Stack Overflow:', error);
    return [];
  }
}

async function searchGitHub(query: string, maxResults: number = 5): Promise<SearchResult[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      sort: 'stars',
      order: 'desc',
      per_page: maxResults.toString()
    });
    
    const headers: any = { 'Accept': 'application/vnd.github.v3+json' };
    const token = process.env.GITHUB_TOKEN;
    if (token) headers['Authorization'] = `token ${token}`;
    
    const response = await fetch(`https://api.github.com/search/repositories?${params.toString()}`, { headers });
    if (!response.ok) return [];
    
    const data = await response.json();
    
    return data.items?.map((item: any) => ({
      title: item.full_name,
      url: item.html_url,
      snippet: item.description || 'لا يوجد وصف',
      content: item.description || '',
      author: item.owner?.login,
      views: `⭐ ${item.stargazers_count}`,
      relevanceScore: 0.8
    })) || [];
  } catch (error) {
    console.error('خطأ GitHub:', error);
    return [];
  }
}

// ============================================
// 🧠 Smart Multi-Source Search
// ============================================

async function smartMultiSourceSearch(
  query: string, 
  maxResults: number = 5,
  searchMode: 'normal' | 'advanced' = 'advanced' // الوضع الجديد
): Promise<MultiSourceResponse> {
  const startTime = Date.now();
  
  console.log(`🧠 بحث ذكي (${searchMode})...`);
  
  const detectedSources = detectBestSource(query);
  console.log('🎯 المصادر المكتشفة:', detectedSources);
  
  // 🔍 البحث في Google (مصدر رئيسي)
  const googleKey = process.env.GOOGLE_SEARCH_API_KEY;
  const googleCx = process.env.GOOGLE_SEARCH_ENGINE_ID;
  
  let googleResults: SearchResult[] = [];
  
  // تحديد عدد نتائج Google حسب الوضع
  const googleCount = searchMode === 'normal' ? 3 : 5;
  
  if (googleKey && googleCx) {
    try {
      console.log(`🔍 جارٍ البحث في Google (${googleCount} نتائج)...`);
      const googleResponse = await googleSearch(query, {
        apiKey: googleKey,
        searchEngineId: googleCx,
        numResults: googleCount,
        language: DEFAULT_CONFIG.language,
        country: DEFAULT_CONFIG.country,
        safeSearch: DEFAULT_CONFIG.safeSearch
      });
      googleResults = googleResponse.results;
      console.log(`✅ Google: ${googleResults.length} نتيجة`);
    } catch (error) {
      console.error('❌ خطأ في Google:', error);
    }
  }
  
  // 🚫 في البحث العادي: نتائج Google فقط
  if (searchMode === 'normal') {
    return {
      google: googleResults,
      youtube: [],
      wikipedia: [],
      stackoverflow: [],
      github: [],
      totalResults: googleResults.length,
      searchTime: Date.now() - startTime
    };
  }
  
  // 🎯 في البحث المتقدم: نبحث في المصادر الأخرى
  const searchPromises: Promise<SearchResult[]>[] = [];
  const sourceNames: string[] = [];
  const sourceIcons: string[] = [];
  
  for (const source of detectedSources) {
    switch (source) {
      case 'youtube':
        searchPromises.push(searchYouTube(query, 3)); // 3 فيديوهات
        sourceNames.push('YouTube');
        sourceIcons.push('🎥');
        break;
      case 'wikipedia':
        searchPromises.push(searchWikipedia(query, 2)); // مقالتين
        sourceNames.push('ويكيبيديا');
        sourceIcons.push('📚');
        break;
      case 'stackoverflow':
        searchPromises.push(searchStackOverflow(query, maxResults));
        sourceNames.push('Stack Overflow');
        sourceIcons.push('💻');
        break;
      case 'github':
        searchPromises.push(searchGitHub(query, maxResults));
        sourceNames.push('GitHub');
        sourceIcons.push('⚙️');
        break;
    }
  }
  
  const results = await Promise.all(searchPromises);
  const validResults = results.map((r, i) => ({
    source: sourceNames[i],
    icon: sourceIcons[i],
    results: r
  })).filter(r => r.results.length > 0);
  
  console.log(`✅ تم البحث في ${validResults.length} مصدر إضافي`);
  
  // 📊 Google هو المصدر الرئيسي دائماً
  let primarySource = {
    source: 'Google',
    icon: '🔍',
    results: googleResults
  };
  
  const additionalSources = validResults;
  
  if (!primarySource.results.length && !additionalSources.length) {
    // Fallback نهائي إذا كل المصادر فشلت
    primarySource = {
      source: 'Web',
      icon: '🌐',
      results: [{
        title: `نتائج عن: ${query}`,
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        snippet: 'ابحث في Google للمزيد من النتائج',
        content: '',
        relevanceScore: 0.5
      }]
    };
  }
  
  return {
    query,
    primarySource,
    additionalSources,
    totalResults: primarySource.results.length + additionalSources.reduce((sum, s) => sum + s.results.length, 0),
    searchTime: Date.now() - startTime
  };
}

// ============================================
// 🌐 Main Search Function
// ============================================

export async function searchWeb(query: string, options: SearchOptions = {}): Promise<SearchResponse | MultiSourceResponse> {
  const { 
    maxResults = 5,
    fastMode = false,
    smartSearch = false, // البحث الذكي متعدد المصادر
    searchMode = 'advanced', // الوضع الافتراضي
    recentOnly = false,
    exactMatch = false
  } = options;
  
  const timeout = fastMode ? DEFAULT_CONFIG.fastTimeout : (options.timeout || DEFAULT_CONFIG.timeout);
  const retries = fastMode ? DEFAULT_CONFIG.fastRetries : (options.retries || DEFAULT_CONFIG.maxRetries);
  const startTime = Date.now();
  
  // تحقق من Cache
  const cached = searchCache.get(query, options);
  if (cached) {
    console.log('✅ من Cache');
    return cached;
  }
  
  // البحث الذكي متعدد المصادر
  if (smartSearch) {
    const result = await smartMultiSourceSearch(query, maxResults, searchMode);
    searchCache.set(query, options, result);
    return result;
  }
  
  // البحث العادي في Google
  const canUseGoogle = usageTracker.canSearch();
  
  if (canUseGoogle) {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const engineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    
    if (apiKey && engineId) {
      try {
        console.log('🔍 Google Search...');
        usageTracker.incrementUsage();
        
        let modifiedQuery = query;
        if (recentOnly) modifiedQuery += ` after:${new Date().getFullYear() - 1}`;
        if (exactMatch) modifiedQuery = `"${query}"`;
        
        const config: GoogleSearchConfig = {
          apiKey,
          searchEngineId: engineId,
          ...DEFAULT_CONFIG,
          numResults: maxResults
        };

        const result = await googleSearchWithRetry(modifiedQuery, config, retries);
        searchCache.set(query, options, result);
        return result;

      } catch (error) {
        console.warn('⚠️ Google فشل:', error);
      }
    }
  }
  
  // Fallback
  return {
    results: [{
      title: `نتائج عن: ${query}`,
      url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      snippet: 'للمزيد من النتائج، ابحث في Google',
      content: '',
      relevanceScore: 0.5
    }],
    query,
    totalResults: 1,
    searchTime: Date.now() - startTime,
    source: 'Fallback'
  };
}

// ============================================
// 🎨 Format Results
// ============================================

export function formatSearchResults(response: SearchResponse | MultiSourceResponse): string {
  // تحقق من النوع - البحث المتقدم أو العادي
  if ('primarySource' in response || 'google' in response) {
    return formatMultiSourceResults(response);
  }
  
  return formatGoogleResults(response as SearchResponse);
}

function formatGoogleResults(response: SearchResponse): string {
  const { results, query, source, totalResults, searchTime } = response;
  
  if (!results || results.length === 0) {
    return `عذراً، لم أجد نتائج عن "${query}" 🔍`;
  }
  
  let formatted = `🔍 **نتائج البحث عن: "${query}"**\n\n`;
  
  if (typeof totalResults === 'string' && totalResults !== '0') {
    const total = parseInt(totalResults);
    if (!isNaN(total)) formatted += `📊 **${total.toLocaleString('ar')}** نتيجة`;
  }
  
  formatted += ` في ${(searchTime / 1000).toFixed(2)} ثانية\n`;
  formatted += `🔎 المصدر: **${source}**\n\n---\n\n`;
  
  results.forEach((r, i) => {
    formatted += `### ${i + 1}. ${r.title}\n\n`;
    if (r.displayLink) formatted += `🌐 **${r.displayLink}**\n\n`;
    formatted += `${r.snippet}\n\n`;
    formatted += `> [🔗 **افتح الرابط**](${r.url})\n\n---\n\n`;
  });
  
  if (source.includes('Google')) {
    const usage = usageTracker.getUsage();
    formatted += `\n📊 استخدام API: ${usage.used}/${usage.limit} (متبقي: ${usage.remaining})\n\n`;
  }
  
  formatted += `💡 تبي تفاصيل أكثر؟ 😊`;
  return formatted;
}

function formatMultiSourceResults(response: MultiSourceResponse): string {
  const { query, primarySource, additionalSources, searchTime } = response;
  
  // التعامل مع البنية الجديدة (البحث العادي)
  if (!primarySource && response.google) {
    let formatted = `🔍 **نتائج البحث: "${query}"**\n\n`;
    formatted += `⏱️ ${(searchTime / 1000).toFixed(2)} ثانية • 📊 ${response.totalResults} نتيجة\n\n---\n\n`;
    
    response.google.slice(0, 3).forEach((r, i) => {
      formatted += `### ${i + 1}. ${r.title}\n\n`;
      if (r.displayLink) formatted += `🌐 **${r.displayLink}**\n\n`;
      if (r.snippet) formatted += `${r.snippet}\n\n`;
      formatted += `> [🔗 **افتح الرابط**](${r.url})\n\n`;
    });
    
    formatted += `💡 تبي تفاصيل أكثر؟ 😊`;
    return formatted;
  }
  
  // التعامل مع البنية القديمة (البحث المتقدم)
  if (!primarySource || !additionalSources) {
    return `لم يتم العثور على نتائج`;
  }
  
  let formatted = `🧠 **نتائج البحث الذكي: "${query}"**\n\n`;
  formatted += `⏱️ ${(searchTime / 1000).toFixed(2)} ثانية • 📊 ${1 + additionalSources.length} مصدر\n\n---\n\n`;
  
  // المصدر الرئيسي
  formatted += `### ${primarySource.icon} **${primarySource.source}** (الرئيسي)\n\n`;
  
  primarySource.results.slice(0, 5).forEach((r, i) => {
    formatted += `### ${i + 1}. ${r.title}\n\n`;
    if (r.displayLink) formatted += `🌐 **${r.displayLink}**\n\n`;
    if (r.author) formatted += `👤 ${r.author} `;
    if (r.views) formatted += `• 👁️ ${r.views}`;
    if (r.author || r.views) formatted += `\n\n`;
    if (r.snippet) formatted += `${r.snippet}\n\n`;
    formatted += `> [🔗 **افتح الرابط**](${r.url})\n\n`;
  });
  
  formatted += `---\n\n`;
  
  // المصادر الإضافية
  if (additionalSources.length > 0) {
    formatted += `### 📚 **مصادر إضافية:**\n\n`;
    
    additionalSources.forEach(src => {
      if (src.results.length > 0) {
        formatted += `#### ${src.icon} **${src.source}**\n\n`;
        
        src.results.slice(0, 3).forEach((r, i) => {
          // عرض مصغر فيديو اليوتيوب
          if (r.thumbnail && src.source === 'YouTube') {
            formatted += `[![${r.title}](${r.thumbnail})](${r.url} "${r.title}")\n\n`;
            formatted += `**${i + 1}. ${r.title}**\n\n`;
          } else {
            formatted += `**${i + 1}. ${r.title}**\n\n`;
          }
          
          if (r.author) formatted += `👤 ${r.author}\n\n`;
          if (r.displayLink && !r.thumbnail) formatted += `🌐 **${r.displayLink}**\n\n`;
          if (r.snippet) formatted += `${r.snippet}\n\n`;
          formatted += `> [🔗 **افتح الرابط**](${r.url})\n\n`;
        });
        
        formatted += `\n`;
      }
    });
    
    formatted += `---\n\n`;
  }
  
  formatted += `💡 تبي تفاصيل من مصدر معين؟ 😊`;
  return formatted;
}

// ============================================
// 🛠️ Utility & Helper Functions
// ============================================

export function getCacheStats() {
  return searchCache.getStats();
}

export function clearCache() {
  searchCache.clear();
}

export function getUsageStats() {
  return usageTracker.getUsage();
}

export function resetUsage() {
  usageTracker.resetDaily();
}

export async function fastSearch(query: string, maxResults: number = 3): Promise<SearchResponse | MultiSourceResponse> {
  return searchWeb(query, { maxResults, fastMode: true });
}

export async function advancedSearch(query: string, options?: Omit<SearchOptions, 'fastMode'>): Promise<SearchResponse | MultiSourceResponse> {
  return searchWeb(query, { ...options, fastMode: false });
}

export async function smartSearch(query: string, maxResults: number = 5, searchMode: 'normal' | 'advanced' = 'advanced'): Promise<MultiSourceResponse> {
  const result = await searchWeb(query, { maxResults, smartSearch: true, searchMode });
  return result as MultiSourceResponse;
}

export async function protectedSearch(query: string, options?: SearchOptions): Promise<string> {
  if (!usageTracker.canSearch()) {
    const usage = usageTracker.getUsage();
    return `عذراً، وصلت للحد الأقصى! 📊\n\nاستخدمت ${usage.used}/${usage.limit}.\nحاول بكرة! 😊`;
  }

  try {
    const result = await searchWeb(query, options);
    return formatSearchResults(result);
  } catch (error) {
    console.error('❌ خطأ:', error);
    return `عذراً، حصل خطأ 😕\n\nممكن تحاول مرة ثانية؟`;
  }
}

export const simpleSearchWeb = fastSearch;

export {
  searchCache,
  usageTracker,
  DEFAULT_CONFIG
};