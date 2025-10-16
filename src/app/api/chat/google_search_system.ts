// ========================================
// نظام البحث العام الاحترافي
// Professional Google Search System
// ========================================

// ============ Types & Interfaces ============

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink?: string;
  formattedUrl?: string;
  image?: {
    thumbnailLink: string;
    contextLink: string;
  };
}

interface SearchResponse {
  results: SearchResult[];
  totalResults: string;
  searchTime: number;
  query: string;
}

interface SearchConfig {
  apiKey: string;
  searchEngineId: string; // CX
  language?: string;
  country?: string;
  safeSearch?: 'off' | 'medium' | 'high';
  numResults?: number; // 1-10
}

interface CacheEntry {
  data: SearchResponse;
  timestamp: number;
}

// ============ Configuration ============

const DEFAULT_SEARCH_CONFIG = {
  language: 'ar', // اللغة العربية
  country: 'sa', // السعودية (غيّرها حسب بلدك)
  safeSearch: 'medium' as const,
  numResults: 5
};

// ============ Cache System ============

class GoogleSearchCache {
  private cache: Map<string, CacheEntry>;
  private maxAge: number; // بالميلي ثانية
  private maxSize: number;

  constructor(maxAge = 1800000, maxSize = 200) { // 30 دقيقة، 200 نتيجة
    this.cache = new Map();
    this.maxAge = maxAge;
    this.maxSize = maxSize;
  }

  private generateKey(query: string, options: Partial<SearchConfig>): string {
    return `${query}_${options.language}_${options.numResults}`;
  }

  set(query: string, options: Partial<SearchConfig>, data: SearchResponse): void {
    const key = this.generateKey(query, options);
    
    // احذف أقدم عنصر إذا وصل الحد الأقصى
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(query: string, options: Partial<SearchConfig>): SearchResponse | null {
    const key = this.generateKey(query, options);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // تحقق من انتهاء الصلاحية
    if (Date.now() - cached.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
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

const googleSearchCache = new GoogleSearchCache();

// ============ Search Function ============

/**
 * دالة البحث الرئيسية باستخدام Google Custom Search API
 */
async function googleSearch(
  query: string,
  config: SearchConfig
): Promise<SearchResponse> {
  const startTime = Date.now();
  
  // تحقق من الـ Cache
  const cached = googleSearchCache.get(query, config);
  if (cached) {
    console.log('✅ نتيجة من الـ Cache');
    return cached;
  }
  
  // بناء الـ URL
  const params = new URLSearchParams({
    key: config.apiKey,
    cx: config.searchEngineId,
    q: query,
    lr: `lang_${config.language || DEFAULT_SEARCH_CONFIG.language}`,
    gl: config.country || DEFAULT_SEARCH_CONFIG.country,
    safe: config.safeSearch || DEFAULT_SEARCH_CONFIG.safeSearch,
    num: String(config.numResults || DEFAULT_SEARCH_CONFIG.numResults)
  });
  
  const url = `https://www.googleapis.com/customsearch/v1?${params.toString()}`;
  
  try {
    console.log('🔍 بدء البحث في Google...');
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Google API Error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    
    // معالجة النتائج
    const searchResponse: SearchResponse = {
      results: (data.items || []).map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        displayLink: item.displayLink,
        formattedUrl: item.formattedUrl,
        image: item.pagemap?.cse_image?.[0] ? {
          thumbnailLink: item.pagemap.cse_image[0].src,
          contextLink: item.link
        } : undefined
      })),
      totalResults: data.searchInformation?.totalResults || '0',
      searchTime: Date.now() - startTime,
      query: query
    };
    
    // حفظ في الـ Cache
    googleSearchCache.set(query, config, searchResponse);
    
    console.log(`✅ تم العثور على ${searchResponse.results.length} نتيجة`);
    
    return searchResponse;
    
  } catch (error) {
    console.error('❌ خطأ في البحث:', error);
    throw error;
  }
}

// ============ Search with Retry ============

/**
 * دالة بحث مع إعادة المحاولة
 */
async function googleSearchWithRetry(
  query: string,
  config: SearchConfig,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<SearchResponse> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await googleSearch(query, config);
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ محاولة ${attempt} فشلت:`, error);
      
      if (attempt < maxRetries) {
        console.log(`🔄 إعادة المحاولة بعد ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
  }
  
  throw lastError || new Error('فشل البحث بعد عدة محاولات');
}

// ============ Format Response ============

/**
 * تنسيق نتائج البحث بطريقة جميلة
 */
function formatSearchResults(response: SearchResponse): string {
  const { results, totalResults, searchTime, query } = response;
  
  if (results.length === 0) {
    return `ما لقيت نتائج للبحث عن: "${query}" 😕\n\nجرّب تغيير كلمات البحث أو استخدم مصطلحات مختلفة!`;
  }
  
  let formatted = `🔍 نتائج البحث عن: **${query}**\n\n`;
  formatted += `وجدت حوالي ${parseInt(totalResults).toLocaleString('ar')} نتيجة في ${(searchTime / 1000).toFixed(2)} ثانية\n\n`;
  formatted += `---\n\n`;
  
  results.forEach((result, index) => {
    formatted += `**${index + 1}. ${result.title}**\n`;
    formatted += `🔗 ${result.link}\n`;
    formatted += `${result.snippet}\n\n`;
  });
  
  formatted += `---\n\n`;
  formatted += `تبي تفاصيل أكثر عن نتيجة معينة؟ أو تبي أبحث عن شيء آخر؟ 😊`;
  
  return formatted;
}

// ============ Smart Search Handler ============

/**
 * معالج ذكي يحدد نوع البحث المطلوب
 */
async function smartSearch(
  query: string,
  config: SearchConfig,
  options?: {
    includeImages?: boolean;
    recentOnly?: boolean; // نتائج حديثة فقط
    exactMatch?: boolean; // بحث دقيق
  }
): Promise<SearchResponse> {
  let modifiedQuery = query;
  
  // إضافة معاملات خاصة للبحث
  if (options?.recentOnly) {
    // إضافة فلتر للنتائج الحديثة (آخر سنة)
    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    modifiedQuery += ` after:${lastYear.getFullYear()}`;
  }
  
  if (options?.exactMatch) {
    // بحث دقيق بوضع الاستعلام بين علامات اقتباس
    modifiedQuery = `"${query}"`;
  }
  
  return await googleSearchWithRetry(modifiedQuery, config);
}

// ============ Main Handler ============

/**
 * المعالج الرئيسي للبحث
 */
async function handleSearchQuery(
  query: string,
  apiKey: string,
  searchEngineId: string,
  options?: {
    language?: string;
    country?: string;
    numResults?: number;
    recentOnly?: boolean;
    exactMatch?: boolean;
  }
): Promise<string> {
  try {
    console.log(`🔍 بدء البحث عن: "${query}"`);
    
    const config: SearchConfig = {
      apiKey,
      searchEngineId,
      language: options?.language || DEFAULT_SEARCH_CONFIG.language,
      country: options?.country || DEFAULT_SEARCH_CONFIG.country,
      safeSearch: DEFAULT_SEARCH_CONFIG.safeSearch,
      numResults: options?.numResults || DEFAULT_SEARCH_CONFIG.numResults
    };
    
    const searchResponse = await smartSearch(query, config, {
      recentOnly: options?.recentOnly,
      exactMatch: options?.exactMatch
    });
    
    return formatSearchResults(searchResponse);
    
  } catch (error) {
    console.error('❌ خطأ في البحث:', error);
    
    // معالجة أخطاء شائعة
    const errorMessage = (error as Error).message;
    
    if (errorMessage.includes('API key')) {
      return `عذراً، في مشكلة بمفتاح API! 🔑\n\nتأكد من صحة الـ API Key والـ Search Engine ID.`;
    }
    
    if (errorMessage.includes('quota')) {
      return `عذراً، وصلنا للحد اليومي من الاستعلامات! 📊\n\nGoogle تعطي 100 استعلام مجاني يومياً. حاول بكرة!`;
    }
    
    return `عذراً، حصل خطأ أثناء البحث 😕\n\nممكن تحاول مرة ثانية؟`;
  }
}

// ============ Usage Tracking ============

class SearchUsageTracker {
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
  
  getUsage(): { used: number; remaining: number; limit: number } {
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

const usageTracker = new SearchUsageTracker(100);

// ============ Protected Search ============

/**
 * بحث محمي مع تتبع الاستخدام
 */
async function protectedSearch(
  query: string,
  apiKey: string,
  searchEngineId: string,
  options?: {
    language?: string;
    country?: string;
    numResults?: number;
  }
): Promise<string> {
  // تحقق من الحد اليومي
  if (!usageTracker.canSearch()) {
    const usage = usageTracker.getUsage();
    return `عذراً، وصلت للحد الأقصى من البحث اليوم! 📊\n\nاستخدمت ${usage.used} من ${usage.limit} استعلام.\nحاول بكرة! 😊`;
  }
  
  // زيادة عداد الاستخدام
  usageTracker.incrementUsage();
  
  // تنفيذ البحث
  return await handleSearchQuery(query, apiKey, searchEngineId, options);
}

// ============ Exports ============

export {
  // Types
  type SearchResult,
  type SearchResponse,
  type SearchConfig,
  
  // Main Functions
  googleSearch,
  googleSearchWithRetry,
  smartSearch,
  handleSearchQuery,
  protectedSearch,
  
  // Utilities
  googleSearchCache,
  usageTracker,
  formatSearchResults,
  
  // Constants
  DEFAULT_SEARCH_CONFIG
};

// ============ Usage Examples ============

/*
// ===== مثال 1: بحث بسيط =====

const API_KEY = 'YOUR_API_KEY_HERE';
const SEARCH_ENGINE_ID = 'YOUR_CX_ID_HERE';

const result = await handleSearchQuery(
  'أفضل مطاعم في الرياض',
  API_KEY,
  SEARCH_ENGINE_ID
);

console.log(result);

// ===== مثال 2: بحث مع خيارات =====

const result2 = await handleSearchQuery(
  'الذكاء الاصطناعي',
  API_KEY,
  SEARCH_ENGINE_ID,
  {
    language: 'ar',
    country: 'sa',
    numResults: 10,
    recentOnly: true // نتائج حديثة فقط
  }
);

// ===== مثال 3: بحث محمي مع تتبع الاستخدام =====

const result3 = await protectedSearch(
  'أخبار التقنية اليوم',
  API_KEY,
  SEARCH_ENGINE_ID
);

// تحقق من الاستخدام
const usage = usageTracker.getUsage();
console.log(`استخدمت ${usage.used} من ${usage.limit} استعلام`);

// ===== مثال 4: استخدام في Chat Component =====

const handleSend = async () => {
  if (!inputValue.trim()) return;

  const userMessage: Message = {
    id: Date.now().toString(),
    role: 'user',
    content: inputValue,
    timestamp: new Date()
  };

  setMessages(prev => [...prev, userMessage]);
  setInputValue('');
  setIsTyping(true);

  try {
    // تحقق إذا كان طلب بحث
    if (inputValue.toLowerCase().includes('ابحث') || 
        inputValue.toLowerCase().includes('بحث عن') ||
        inputValue.toLowerCase().includes('دور لي')) {
      
      // استخرج استعلام البحث
      const searchQuery = inputValue
        .replace(/ابحث عن|بحث عن|دور لي عن|ابحث|بحث/gi, '')
        .trim();
      
      const searchResult = await protectedSearch(
        searchQuery,
        'YOUR_API_KEY',
        'YOUR_SEARCH_ENGINE_ID',
        {
          language: 'ar',
          numResults: 5
        }
      );
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: searchResult,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } else {
      // رد عادي (بدون بحث)
      const normalResponse = await handleNormalMessage(inputValue);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: normalResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    }
  } catch (error) {
    console.error('Error:', error);
    
    const errorMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: 'عذراً، حصل خطأ! 😅',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, errorMessage]);
  } finally {
    setIsTyping(false);
  }
};

// ===== مثال 5: إحصائيات الـ Cache =====

const cacheStats = googleSearchCache.getStats();
console.log('Cache Stats:', cacheStats);

// تنظيف الـ Cache
googleSearchCache.clear();
*/