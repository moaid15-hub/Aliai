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
  results: SearchResult[]; // النتائج الأولية
  secondaryResults?: SearchResult[]; // النتائج الثانوية
  totalResults: number;
  searchTime: number;
  source: string; // المصادر المستخدمة
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
  primaryOnly?: boolean; // 🆕 خيار جديد: البحث من Google + YouTube فقط
  quickSearch?: boolean; // 🚀 بحث سريع: نتيجتين فقط (1 YouTube + 1 Google)
  advancedMode?: boolean; // 🆕 وضع متقدم: كل المصادر
}

// ============================================
// 🖼️ Link Preview & YouTube Thumbnails
// ============================================

interface LinkPreview {
  title: string;
  description: string;
  image?: string;
  url: string;
  type: 'website' | 'youtube' | 'article';
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

// ============================================
// 🖼️ Link Preview Functions
// ============================================

/**
 * استخراج معرف فيديو YouTube من الرابط
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

/**
 * إنشاء معاينة للرابط
 */
function createLinkPreview(result: SearchResult): LinkPreview {
  // إذا كان فيديو يوتيوب
  const youtubeId = extractYouTubeId(result.url);
  if (youtubeId) {
    return {
      title: result.title,
      description: result.snippet,
      image: `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`, // صورة متوسطة الجودة
      url: result.url,
      type: 'youtube'
    };
  }
  
  // روابط عادية
  return {
    title: result.title,
    description: result.snippet,
    image: result.thumbnail || result.image?.thumbnailLink,
    url: result.url,
    type: result.displayLink?.includes('wikipedia') ? 'article' : 'website'
  };
}

/**
 * تنسيق معاينة الرابط بـ HTML/Markdown
 */
function formatLinkPreview(preview: LinkPreview, index: number): string {
  const isYoutube = preview.type === 'youtube';
  const icon = isYoutube ? '🎥' : preview.type === 'article' ? '📖' : '🌐';
  
  let html = `\n<div class="search-result-card" data-index="${index}">\n`;
  
  // العنوان
  html += `  <div class="result-header">\n`;
  html += `    <span class="result-number">${index + 1}${icon}</span>\n`;
  html += `    <h3 class="result-title">${preview.title}</h3>\n`;
  html += `  </div>\n`;
  
  // المحتوى
  html += `  <div class="result-content">\n`;
  
  // الصورة المصغرة
  if (preview.image) {
    html += `    <div class="result-thumbnail">\n`;
    if (isYoutube) {
      html += `      <img src="${preview.image}" alt="${preview.title}" class="youtube-thumb" />\n`;
      html += `      <div class="play-overlay">▶</div>\n`;
    } else {
      html += `      <img src="${preview.image}" alt="${preview.title}" />\n`;
    }
    html += `    </div>\n`;
  }
  
  // الوصف
  html += `    <div class="result-description">\n`;
  html += `      <p>${preview.description}</p>\n`;
  html += `    </div>\n`;
  
  html += `  </div>\n`;
  
  // رابط الفتح
  html += `  <div class="result-footer">\n`;
  html += `    <a href="${preview.url}" target="_blank" rel="noopener noreferrer" class="result-link">\n`;
  html += `      🔗 ${isYoutube ? 'شاهد الفيديو' : 'اقرأ المزيد'}\n`;
  html += `    </a>\n`;
  html += `  </div>\n`;
  
  html += `</div>\n`;
  
  return html;
}

// ============================================
// 🧠 Smart Source Detection
// ============================================

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
  if (!query || query.trim().length < 2) return false;
  
  const lowerQuery = query.toLowerCase().trim();
  
  // كلمات تحتاج بحث 100%
  const searchKeywords = [
    // عربي - بحث مباشر
    'ابحث', 'دور', 'شوف', 'لقي', 'جيب', 'تتبع',
    'ابحثلي', 'دورلي', 'شوفلي', 'جيبلي',
    
    // عربي - أسئلة
    'ما هو', 'من هو', 'ما هي', 'من هي', 'كيف', 'متى', 'أين', 'لماذا', 'ليش',
    'وين', 'شلون', 'كم', 'هل',
    
    // عربي - معلومات
    'معلومات', 'تفاصيل', 'شرح', 'تعليم', 'دروس', 'كورس', 'دورة',
    'اخبار', 'جديد', 'احدث', 'آخر', 'حديث',
    
    // عربي - مقارنات
    'افضل', 'احسن', 'الأفضل', 'الأحسن', 'مقارنة', 'فرق',
    
    // English - Direct
    'search', 'find', 'look', 'google', 'show me',
    
    // English - Questions  
    'what is', 'who is', 'how to', 'when', 'where', 'why',
    'what are', 'who are', 'how do',
    
    // English - Information
    'information', 'details', 'explain', 'tutorial', 'course', 'lessons',
    'news', 'latest', 'recent', 'update',
    
    // English - Comparisons
    'best', 'better', 'compare', 'vs', 'versus', 'difference',
    
    // أسعار ومنتجات
    'سعر', 'ثمن', 'كم يكلف', 'بكم', 'price', 'cost', 'how much',
    
    // أرقام وإحصائيات
    'كم عدد', 'كم يبلغ', 'إحصائيات', 'statistics', 'how many',
    
    // محتوى تعليمي
    'تعلم', 'اتعلم', 'علمني', 'learn', 'teach me',
    'مبتدئ', 'للمبتدئين', 'beginner', 'for beginners',
    'شروحات', 'tutorials', 'guides'
  ];
  
  // تحقق من الكلمات المفتاحية
  const hasKeyword = searchKeywords.some(keyword => 
    lowerQuery.includes(keyword.toLowerCase())
  );
  
  if (hasKeyword) return true;
  
  // أنماط regex للأسئلة
  const questionPatterns = [
    /^(ما|من|كيف|متى|أين|لماذا|ليش|هل|وين|شلون)\s/,
    /\?$/,
    /^(what|who|how|when|where|why|is|are|do|does)\s/i
  ];
  
  const isQuestion = questionPatterns.some(pattern => pattern.test(lowerQuery));
  if (isQuestion) return true;
  
  // إذا فيه كلمة واحدة فقط (غالباً اسم شيء للبحث)
  const words = lowerQuery.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 1 && words[0].length > 2) {
    return true; // "برمجة"، "react"، إلخ
  }
  
  // إذا فيه كلمتين أو أكثر وتبدو مثل استفسار
  if (words.length >= 2) {
    // "دروس برمجه" ، "تعلم Python" ، إلخ
    const learningWords = ['دروس', 'تعلم', 'شرح', 'كورس', 'tutorial', 'learn', 'course'];
    const hasLearning = words.some(word => 
      learningWords.some(lw => word.includes(lw) || lw.includes(word))
    );
    if (hasLearning) return true;
  }
  
  return false;
}

/**
 * كشف المصدر المناسب
 */
function detectBestSource(query: string, searchLevel: 'primary' | 'secondary' = 'primary'): string[] {
  const lowerQuery = query.toLowerCase();
  
  // 🎯 البحث الأولي: YouTube + Google (يوتيوب أولاً دائماً)
  if (searchLevel === 'primary') {
    // ✅ يوتيوب دائماً في المقدمة
    return ['youtube', 'google'];
  }
  
  // 🔍 البحث الثانوي: باقي المصادر
  const sources: Array<{ name: string; priority: number; matches: number }> = [];
  
  // Wikipedia
  if (/من هو|ما هو|ما هي|تعريف|معنى|who is|what is|define/i.test(lowerQuery)) {
    sources.push({ name: 'wikipedia', priority: 1, matches: 1 });
  }
  
  // Stack Overflow
  if (/خطأ|error|bug|كود|code|برمجة|programming/i.test(lowerQuery)) {
    sources.push({ name: 'stackoverflow', priority: 1, matches: 1 });
  }
  
  // GitHub
  if (/مشروع|project|repository|repo|source code/i.test(lowerQuery)) {
    sources.push({ name: 'github', priority: 2, matches: 1 });
  }
  
  return sources
    .sort((a, b) => b.priority - a.priority || b.matches - a.matches)
    .slice(0, 2)
    .map(s => s.name);
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
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ YouTube API Key غير موجود');
      return [];
    }
    
    const params = new URLSearchParams({
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: maxResults.toString(),
      key: apiKey,
      relevanceLanguage: 'ar',
      safeSearch: 'moderate'
    });
    
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params.toString()}`
    );
    
    if (!response.ok) {
      console.error('❌ YouTube API Error:', response.status);
      return [];
    }
    
    const data = await response.json();
    
    // جلب تفاصيل إضافية (مدة، مشاهدات)
    const videoIds = data.items?.map((item: any) => item.id.videoId).join(',');
    
    const detailsParams = new URLSearchParams({
      part: 'contentDetails,statistics',
      id: videoIds,
      key: apiKey
    });
    
    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?${detailsParams.toString()}`
    );
    
    const detailsData = detailsResponse.ok ? await detailsResponse.json() : null;
    
    return data.items?.map((item: any, index: number) => {
      const videoId = item.id.videoId;
      const details = detailsData?.items?.[index];
      
      // تحويل المدة من ISO 8601
      const duration = details?.contentDetails?.duration;
      const formattedDuration = duration ? formatYouTubeDuration(duration) : null;
      
      // تنسيق المشاهدات
      const views = details?.statistics?.viewCount;
      const formattedViews = views ? formatNumber(parseInt(views)) : null;
      
      return {
        title: item.snippet.title,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        snippet: item.snippet.description || 'لا يوجد وصف',
        content: item.snippet.description || '',
        // استخدام أعلى جودة متاحة: high > medium > default
        thumbnail: item.snippet.thumbnails?.high?.url || 
                   item.snippet.thumbnails?.medium?.url || 
                   item.snippet.thumbnails?.default?.url,
        displayLink: 'youtube.com',
        author: item.snippet.channelTitle,
        duration: formattedDuration,
        views: formattedViews,
        relevanceScore: 0.9
      };
    }) || [];
    
  } catch (error) {
    console.error('❌ خطأ YouTube:', error);
    return [];
  }
}

/**
 * تحويل مدة YouTube من ISO 8601 إلى قراءة بشرية
 * مثال: PT1H2M10S → 1:02:10
 */
function formatYouTubeDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return duration;
  
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * تنسيق الأرقام (المشاهدات)
 * مثال: 1234567 → 1.2M
 */
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
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
      results: googleResults,
      totalResults: googleResults.length,
      searchTime: Date.now() - startTime,
      source: 'google'
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
    results: primarySource.results,
    secondaryResults: additionalSources.flatMap(s => s.results),
    totalResults: primarySource.results.length + additionalSources.reduce((sum, s) => sum + s.results.length, 0),
    searchTime: Date.now() - startTime,
    source: [primarySource.source, ...additionalSources.map(s => s.source)].join(' + ')
  };
}

// ============================================
// 🌐 Main Search Function
// ============================================

export async function searchWeb(
  query: string, 
  options: SearchOptions = {}
): Promise<SearchResponse | MultiSourceResponse> {
  
  const { 
    maxResults = 5,
    fastMode = false,
    smartSearch = false,
    primaryOnly = true,
    quickSearch = false, // 🚀 بحث سريع
    advancedMode = false, // 🆕 وضع متقدم
    recentOnly = false,
    exactMatch = false
  } = options;
  
  const startTime = Date.now();
  
  // تحقق من Cache
  const cached = searchCache.get(query, options);
  if (cached) {
    console.log('✅ من Cache');
    return cached;
  }
  
  // 🎯 البحث المتقدم: كل المصادر
  if (advancedMode) {
    console.log('🔍 البحث المتقدم - كل المصادر...');
    
    const googleKey = process.env.GOOGLE_SEARCH_API_KEY;
    const googleCx = process.env.GOOGLE_SEARCH_ENGINE_ID;
    
    const searchPromises = [];
    
    // ✅ YouTube أولاً (5 فيديوهات)
    searchPromises.push(searchYouTube(query, 5).catch(() => []));
    
    // Google ثانياً (8 نتائج)
    if (googleKey && googleCx) {
      searchPromises.push(
        googleSearch(query, {
          apiKey: googleKey,
          searchEngineId: googleCx,
          numResults: 8
        }).then(r => r.results).catch(() => [])
      );
    }
    
    // Wikipedia (2 نتائج)
    searchPromises.push(searchWikipedia(query, 2).catch(() => []));
    
    // Stack Overflow (2 نتائج)
    searchPromises.push(searchStackOverflow(query, 2).catch(() => []));
    
    // GitHub (2 نتائج)
    searchPromises.push(searchGitHub(query, 2).catch(() => []));
    
    const allResults = await Promise.all(searchPromises);
    const flatResults = allResults.flat();
    
    const response: MultiSourceResponse = {
      results: flatResults,
      query,
      totalResults: flatResults.length,
      searchTime: Date.now() - startTime,
      source: 'multi-source-advanced'
    };
    
    searchCache.set(query, options, response);
    return response;
  }
  
  // 🎯 البحث العادي: YouTube + Google
  const primarySources = detectBestSource(query, 'primary');
  console.log('🔍 البحث الأولي من:', primarySources);
  
  // 🚀 البحث السريع: YouTube (3 فيديوهات) + Google (2 نتائج)
  const primaryResults = await Promise.all(
    primarySources.map(async (source) => {
      if (source === 'google') {
        const googleKey = process.env.GOOGLE_SEARCH_API_KEY;
        const googleCx = process.env.GOOGLE_SEARCH_ENGINE_ID;
        if (!googleKey || !googleCx) return [];
        
        try {
          usageTracker.incrementUsage();
          const googleLimit = quickSearch ? 2 : maxResults; // 🔥 2 نتائج (أفضل نتيجتين)
          const result = await googleSearch(query, {
            apiKey: googleKey,
            searchEngineId: googleCx,
            numResults: googleLimit
          });
          return result.results;
        } catch (error) {
          console.warn('⚠️ Google فشل:', error);
          return [];
        }
      }
      
      if (source === 'youtube') {
        try {
          const youtubeLimit = quickSearch ? 3 : maxResults; // 🎥 3 فيديوهات
          return await searchYouTube(query, youtubeLimit);
        } catch (error) {
          console.warn('⚠️ YouTube فشل:', error);
          return [];
        }
      }
      
      return [];
    })
  );
  
  // دمج النتائج الأولية
  let allPrimaryResults = primaryResults.flat();
  
  // 🔍 البحث الثانوي (اختياري)
  let secondaryResults: SearchResult[] = [];
  if (!primaryOnly) {
    const secondarySources = detectBestSource(query, 'secondary');
    console.log('🔍 البحث الثانوي من:', secondarySources);
    
    const secondaryPromises = secondarySources.map(async (source) => {
      try {
        switch (source) {
          case 'wikipedia':
            return await searchWikipedia(query, Math.floor(maxResults / 2));
          case 'stackoverflow':
            return await searchStackOverflow(query, Math.floor(maxResults / 2));
          case 'github':
            return await searchGitHub(query, Math.floor(maxResults / 2));
          default:
            return [];
        }
      } catch (error) {
        console.warn(`⚠️ ${source} فشل:`, error);
        return [];
      }
    });
    
    const results = await Promise.all(secondaryPromises);
    secondaryResults = results.flat();
  }
  
  const response: MultiSourceResponse = {
    results: allPrimaryResults,
    secondaryResults: secondaryResults,
    query,
    totalResults: allPrimaryResults.length + secondaryResults.length,
    searchTime: Date.now() - startTime,
    source: primarySources.join(' + ')
  };
  
  searchCache.set(query, options, response);
  return response;
}

// ============================================
// 🎨 Format Results
// ============================================

export function formatSearchResults(
  response: SearchResponse | MultiSourceResponse,
  aiExplanation?: string
): string {
  const sr = response as any;
  
  // رأس مصغر جداً
  let formatted = `<div style="font-size:11px;color:#999;margin-bottom:12px">🔍 ${sr.query} • ${sr.results?.length || 0} نتيجة • ${(sr.searchTime / 1000).toFixed(2)}s</div>\n`;
  
  // شرح عقول AI (قبل النتائج)
  if (aiExplanation) {
    formatted += `<div style="background:linear-gradient(135deg,rgba(139,92,246,0.15),rgba(59,130,246,0.15));border:1px solid rgba(139,92,246,0.3);border-radius:12px;padding:16px;margin-bottom:20px">\n`;
    formatted += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">\n`;
    formatted += `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#a78bfa"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/></svg>\n`;
    formatted += `<span style="font-weight:600;color:#e0e0e0;font-size:15px">شرح سريع من عقول</span>\n`;
    formatted += `</div>\n`;
    formatted += `<div style="color:#d0d0d0;font-size:14px;line-height:1.6">${aiExplanation}</div>\n`;
    formatted += `</div>\n`;
    formatted += `<div style="font-weight:600;color:#e0e0e0;font-size:16px;margin:20px 0 12px 0">شاهد الشروحات التفصيلية</div>\n`;
  }
  
  if (sr.results && sr.results.length > 0) {
    // Grid container متجاوب - يتكيف مع جميع الأجهزة
    formatted += `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:12px;margin:12px 0;width:100%">\n`;
    
    sr.results.forEach((result: SearchResult, index: number) => {
      const isYouTube = result.url.includes('youtube.com') || result.url.includes('youtu.be');
      const isWikipedia = result.url.includes('wikipedia.org');
      const isStackOverflow = result.url.includes('stackoverflow.com');
      const isGitHub = result.url.includes('github.com');
      
      // تحديد الأيقونة حسب المصدر
      let icon = '🔍';
      if (isYouTube) icon = '🎥';
      else if (isWikipedia) icon = '📚';
      else if (isStackOverflow) icon = '💻';
      else if (isGitHub) icon = '⚙️';
      
      // بطاقة كل نتيجة (card) - ألوان داكنة + متجاوبة
      formatted += `<div style="background:rgba(30,30,40,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:12px;box-shadow:0 2px 8px rgba(0,0,0,0.3);backdrop-filter:blur(10px);width:100%;box-sizing:border-box">\n`;
      
      // العنوان (متجاوب)
      formatted += `<div style="font-weight:600;font-size:clamp(13px,3vw,14px);margin-bottom:8px;color:#fff;word-wrap:break-word">${index + 1}. ${icon} ${result.title.substring(0, 60)}${result.title.length > 60 ? '...' : ''}</div>\n`;
      
      // صورة يوتيوب (متجاوبة)
      if (isYouTube && result.thumbnail) {
        formatted += `<a href="${result.url}" target="_blank" style="display:block;margin-bottom:8px"><img src="${result.thumbnail}" alt="${result.title}" style="width:100%;height:auto;aspect-ratio:16/9;border-radius:6px;object-fit:cover;transition:transform 0.2s;box-shadow:0 2px 6px rgba(0,0,0,0.4)" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'"/></a>\n`;
      }
      
      // معلومات يوتيوب (متجاوبة)
      if (isYouTube && (result.author || result.duration || result.views)) {
        formatted += `<div style="color:#aaa;font-size:clamp(11px,2.5vw,12px);margin-bottom:6px">`;
        if (result.author) formatted += `👤 ${result.author}`;
        if (result.duration) formatted += ` • ⏱️ ${result.duration}`;
        if (result.views) formatted += ` • 👁️ ${result.views}`;
        formatted += `</div>\n`;
      }
      
      // الرابط (متجاوب)
      formatted += `<div style="font-size:clamp(10px,2vw,11px);color:#888;word-break:break-all;overflow-wrap:break-word">🔗 <code style="font-size:clamp(9px,1.8vw,10px);color:#999;background:rgba(0,0,0,0.3);padding:2px 4px;border-radius:3px;word-break:break-all">${result.url}</code></div>\n`;
      
      formatted += `</div>\n`; // نهاية البطاقة
    });
    
    formatted += `</div>\n`; // نهاية Grid
  }
  
  // 🔍 زر البحث المتقدم (مضغوط)
  if (sr.results && sr.results.length <= 2) {
    formatted += `---\n`;
    formatted += `💡 **تريد المزيد؟** [🔍 بحث متقدم](#advanced-search)\n`;
  }
  
  return formatted;
}

/**
 * إنشاء كارت منفصل لكل نتيجة
 */
function createResultCard(result: SearchResult, index: number): string {
  const isYouTube = result.url.includes('youtube.com') || result.url.includes('youtu.be');
  const isWikipedia = result.url.includes('wikipedia.org');
  const isStackOverflow = result.url.includes('stackoverflow.com');
  const isGitHub = result.url.includes('github.com');
  
  // تحديد الأيقونة حسب المصدر
  let icon = '🔍'; // Google افتراضي
  if (isYouTube) icon = '🎥';
  else if (isWikipedia) icon = '📚';
  else if (isStackOverflow) icon = '💻';
  else if (isGitHub) icon = '⚙️';
  
  let card = '';
  
  // 📌 رقم وأيقونة
  card += `## ${index} ${icon}\n\n`;
  
  // 📝 العنوان
  card += `### ${result.title}\n\n`;
  
  // �️ صورة مصغرة (لليوتيوب)
  if (isYouTube && result.thumbnail) {
    card += `![${result.title}](${result.thumbnail})\n\n`;
  }
  
  // 🌐 المصدر
  if (result.displayLink) {
    card += `📍 **المصدر:** ${result.displayLink}\n\n`;
  }
  
  // 📄 الوصف
  if (result.snippet) {
    card += `> ${result.snippet}\n\n`;
  }
  
  // 🎬 معلومات إضافية (يوتيوب)
  if (isYouTube) {
    if (result.author) card += `👤 **القناة:** ${result.author}\n`;
    if (result.duration) card += `⏱️ **المدة:** ${result.duration}\n`;
    if (result.views) card += `👁️ **المشاهدات:** ${result.views}\n`;
    card += `\n`;
  }
  
  // 🔗 زر الفتح
  card += `[🔗 **${isYouTube ? 'شاهد الفيديو' : 'اقرأ المزيد'}**](${result.url})\n\n`;
  card += `---\n`;
  
  return card;
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