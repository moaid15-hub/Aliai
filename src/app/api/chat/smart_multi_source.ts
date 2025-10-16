// ============================================
// 🧠 نظام البحث الذكي متعدد المصادر
// يختار المصدر المناسب حسب نوع السؤال
// ============================================

import { searchWeb, type SearchResponse } from './google_search_system';

// 📝 Types
interface SourceResult {
  source: string;
  icon: string;
  results: Array<{
    title: string;
    url: string;
    snippet: string;
    thumbnail?: string;
    author?: string;
    duration?: string;
    views?: string;
  }>;
}

interface MultiSourceResponse {
  query: string;
  primarySource: SourceResult;
  additionalSources: SourceResult[];
  searchTime: number;
}

// ============================================
// 🎯 كشف نوع السؤال والمصدر المناسب
// ============================================

const SOURCE_PATTERNS = {
  // يوتيوب
  youtube: {
    keywords: [
      'فيديو', 'شرح', 'تعليم', 'درس', 'كورس', 'دورة',
      'video', 'tutorial', 'course', 'lesson', 'how to',
      'طريقة', 'كيف أسوي', 'كيف اعمل', 'علمني'
    ],
    icon: '🎥',
    priority: 1
  },
  
  // ويكيبيديا
  wikipedia: {
    keywords: [
      'من هو', 'ما هو', 'ما هي', 'تعريف', 'معنى',
      'who is', 'what is', 'define', 'definition',
      'تاريخ', 'history', 'معلومات عن'
    ],
    icon: '📚',
    priority: 2
  },
  
  // Stack Overflow (للبرمجة)
  stackoverflow: {
    keywords: [
      'خطأ', 'error', 'bug', 'كود', 'code', 'برمجة',
      'programming', 'كيف أصلح', 'how to fix',
      'python', 'javascript', 'java', 'react', 'node'
    ],
    icon: '💻',
    priority: 1
  },
  
  // GitHub (للكود والمشاريع)
  github: {
    keywords: [
      'مشروع', 'project', 'repository', 'repo', 'source code',
      'open source', 'مفتوح المصدر', 'كود مصدري'
    ],
    icon: '⚙️',
    priority: 2
  },
  
  // Reddit (للنقاشات)
  reddit: {
    keywords: [
      'رأي', 'آراء', 'تجربة', 'تجارب', 'نقاش',
      'opinion', 'discussion', 'experience', 'review'
    ],
    icon: '💬',
    priority: 3
  },
  
  // الأخبار
  news: {
    keywords: [
      'أخبار', 'خبر', 'جديد', 'أحدث', 'آخر',
      'news', 'latest', 'breaking', 'recent'
    ],
    icon: '📰',
    priority: 1
  }
};

/**
 * كشف المصدر المناسب حسب السؤال
 */
function detectBestSource(query: string): string[] {
  const lowerQuery = query.toLowerCase();
  const sources: Array<{ name: string; priority: number; matches: number }> = [];
  
  for (const [sourceName, config] of Object.entries(SOURCE_PATTERNS)) {
    const matches = config.keywords.filter(keyword => 
      lowerQuery.includes(keyword.toLowerCase())
    ).length;
    
    if (matches > 0) {
      sources.push({
        name: sourceName,
        priority: config.priority,
        matches
      });
    }
  }
  
  // ترتيب حسب عدد التطابقات والأولوية
  sources.sort((a, b) => {
    if (a.matches !== b.matches) return b.matches - a.matches;
    return a.priority - b.priority;
  });
  
  // إذا ما في مصدر محدد، استخدم Google العام
  if (sources.length === 0) {
    return ['google'];
  }
  
  // أرجع أفضل 3 مصادر
  return sources.slice(0, 3).map(s => s.name);
}

// ============================================
// 🔍 دوال البحث لكل مصدر
// ============================================

/**
 * 🎥 البحث في يوتيوب
 */
async function searchYouTube(query: string, maxResults: number = 5): Promise<SourceResult | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.log('⚠️ YouTube API Key غير موجود');
    return null;
  }
  
  try {
    const params = new URLSearchParams({
      part: 'snippet',
      q: query,
      maxResults: maxResults.toString(),
      type: 'video',
      key: apiKey,
      relevanceLanguage: 'ar'
    });
    
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params.toString()}`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    return {
      source: 'YouTube',
      icon: '🎥',
      results: data.items?.map((item: any) => ({
        title: item.snippet.title,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        snippet: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.medium?.url,
        author: item.snippet.channelTitle
      })) || []
    };
  } catch (error) {
    console.error('خطأ YouTube:', error);
    return null;
  }
}

/**
 * 📚 البحث في ويكيبيديا
 */
async function searchWikipedia(query: string, maxResults: number = 3): Promise<SourceResult | null> {
  try {
    const params = new URLSearchParams({
      action: 'query',
      list: 'search',
      srsearch: query,
      format: 'json',
      srlimit: maxResults.toString(),
      origin: '*'
    });
    
    const response = await fetch(
      `https://ar.wikipedia.org/w/api.php?${params.toString()}`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    return {
      source: 'ويكيبيديا',
      icon: '📚',
      results: data.query?.search?.map((item: any) => ({
        title: item.title,
        url: `https://ar.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
        snippet: item.snippet.replace(/<[^>]*>/g, '') // إزالة HTML tags
      })) || []
    };
  } catch (error) {
    console.error('خطأ Wikipedia:', error);
    return null;
  }
}

/**
 * 💻 البحث في Stack Overflow
 */
async function searchStackOverflow(query: string, maxResults: number = 5): Promise<SourceResult | null> {
  try {
    const params = new URLSearchParams({
      order: 'desc',
      sort: 'relevance',
      intitle: query,
      site: 'stackoverflow',
      pagesize: maxResults.toString()
    });
    
    const response = await fetch(
      `https://api.stackexchange.com/2.3/search/advanced?${params.toString()}`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    return {
      source: 'Stack Overflow',
      icon: '💻',
      results: data.items?.map((item: any) => ({
        title: item.title,
        url: item.link,
        snippet: `${item.answer_count} إجابة • ${item.score} نقطة`,
        author: item.owner?.display_name,
        views: item.view_count?.toString()
      })) || []
    };
  } catch (error) {
    console.error('خطأ Stack Overflow:', error);
    return null;
  }
}

/**
 * ⚙️ البحث في GitHub
 */
async function searchGitHub(query: string, maxResults: number = 5): Promise<SourceResult | null> {
  const apiKey = process.env.GITHUB_TOKEN;
  
  try {
    const params = new URLSearchParams({
      q: query,
      sort: 'stars',
      order: 'desc',
      per_page: maxResults.toString()
    });
    
    const headers: any = {
      'Accept': 'application/vnd.github.v3+json'
    };
    
    if (apiKey) {
      headers['Authorization'] = `token ${apiKey}`;
    }
    
    const response = await fetch(
      `https://api.github.com/search/repositories?${params.toString()}`,
      { headers }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    return {
      source: 'GitHub',
      icon: '⚙️',
      results: data.items?.map((item: any) => ({
        title: item.full_name,
        url: item.html_url,
        snippet: item.description || 'لا يوجد وصف',
        author: item.owner?.login,
        views: `⭐ ${item.stargazers_count}`
      })) || []
    };
  } catch (error) {
    console.error('خطأ GitHub:', error);
    return null;
  }
}

/**
 * 📰 البحث في الأخبار (Google News)
 */
async function searchNews(query: string, maxResults: number = 5): Promise<SourceResult | null> {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const searchEngineId = process.env.GOOGLE_NEWS_ENGINE_ID; // محرك بحث مخصص للأخبار
  
  if (!apiKey || !searchEngineId) {
    console.log('⚠️ Google News API غير مكتمل');
    return null;
  }
  
  try {
    const params = new URLSearchParams({
      key: apiKey,
      cx: searchEngineId,
      q: query,
      num: maxResults.toString(),
      sort: 'date' // ترتيب حسب التاريخ
    });
    
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?${params.toString()}`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    return {
      source: 'الأخبار',
      icon: '📰',
      results: data.items?.map((item: any) => ({
        title: item.title,
        url: item.link,
        snippet: item.snippet,
        author: item.displayLink
      })) || []
    };
  } catch (error) {
    console.error('خطأ News:', error);
    return null;
  }
}

// ============================================
// 🧠 البحث الذكي الرئيسي
// ============================================

/**
 * البحث في مصادر متعددة بذكاء
 */
export async function smartMultiSourceSearch(
  query: string,
  options: {
    maxResults?: number;
    includeGoogle?: boolean;
  } = {}
): Promise<MultiSourceResponse> {
  const { maxResults = 5, includeGoogle = true } = options;
  const startTime = Date.now();
  
  console.log('🧠 بدء البحث الذكي متعدد المصادر...');
  
  // 1️⃣ كشف المصادر المناسبة
  const detectedSources = detectBestSource(query);
  console.log('🎯 المصادر المكتشفة:', detectedSources);
  
  // 2️⃣ البحث في المصادر المناسبة بالتوازي
  const searchPromises: Promise<SourceResult | null>[] = [];
  
  for (const source of detectedSources) {
    switch (source) {
      case 'youtube':
        searchPromises.push(searchYouTube(query, maxResults));
        break;
      case 'wikipedia':
        searchPromises.push(searchWikipedia(query, maxResults));
        break;
      case 'stackoverflow':
        searchPromises.push(searchStackOverflow(query, maxResults));
        break;
      case 'github':
        searchPromises.push(searchGitHub(query, maxResults));
        break;
      case 'news':
        searchPromises.push(searchNews(query, maxResults));
        break;
    }
  }
  
  // 3️⃣ إضافة Google العام كمصدر رئيسي (إذا مطلوب)
  let googleResult: SearchResponse | null = null;
  if (includeGoogle) {
    try {
      googleResult = await searchWeb(query, { maxResults, fastMode: false });
    } catch (error) {
      console.warn('⚠️ Google Search فشل:', error);
    }
  }
  
  // 4️⃣ انتظار النتائج
  const sourceResults = await Promise.all(searchPromises);
  const validResults = sourceResults.filter((r): r is SourceResult => r !== null);
  
  // 5️⃣ ترتيب النتائج
  let primarySource: SourceResult;
  let additionalSources: SourceResult[] = [];
  
  if (validResults.length > 0) {
    primarySource = validResults[0];
    additionalSources = validResults.slice(1);
  } else if (googleResult) {
    // استخدم Google كمصدر رئيسي إذا فشلت المصادر الأخرى
    primarySource = {
      source: 'Google',
      icon: '🔍',
      results: googleResult.results.map(r => ({
        title: r.title,
        url: r.url,
        snippet: r.snippet
      }))
    };
  } else {
    // Fallback
    primarySource = {
      source: 'Web',
      icon: '🌐',
      results: [{
        title: `نتائج عن: ${query}`,
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        snippet: 'يُنصح بزيارة محركات البحث للمزيد من النتائج'
      }]
    };
  }
  
  console.log(`✅ تم البحث في ${validResults.length + 1} مصدر`);
  
  return {
    query,
    primarySource,
    additionalSources,
    searchTime: Date.now() - startTime
  };
}

// ============================================
// 🎨 تنسيق النتائج
// ============================================

/**
 * تنسيق نتائج البحث متعدد المصادر
 */
export function formatMultiSourceResults(response: MultiSourceResponse): string {
  const { query, primarySource, additionalSources, searchTime } = response;
  
  let formatted = `🧠 **نتائج البحث الذكي عن: "${query}"**\n\n`;
  formatted += `⏱️ وقت البحث: ${(searchTime / 1000).toFixed(2)} ثانية\n`;
  formatted += `📊 عدد المصادر: ${1 + additionalSources.length}\n\n`;
  formatted += `---\n\n`;
  
  // المصدر الرئيسي
  formatted += `### ${primarySource.icon} **${primarySource.source}** (المصدر الرئيسي)\n\n`;
  
  if (primarySource.results.length === 0) {
    formatted += `لم يتم العثور على نتائج من هذا المصدر.\n\n`;
  } else {
    primarySource.results.slice(0, 5).forEach((result, index) => {
      formatted += `**${index + 1}. ${result.title}**\n`;
      if (result.author) formatted += `👤 ${result.author}\n`;
      if (result.duration) formatted += `⏱️ ${result.duration}\n`;
      if (result.views) formatted += `👁️ ${result.views}\n`;
      formatted += `${result.snippet}\n`;
      formatted += `🔗 [رابط](${result.url})\n\n`;
    });
  }
  
  formatted += `---\n\n`;
  
  // المصادر الإضافية
  if (additionalSources.length > 0) {
    formatted += `### 📚 **مصادر إضافية:**\n\n`;
    
    additionalSources.forEach(source => {
      if (source.results.length > 0) {
        formatted += `#### ${source.icon} ${source.source}\n\n`;
        
        source.results.slice(0, 3).forEach((result, index) => {
          formatted += `**${index + 1}. ${result.title}**\n`;
          formatted += `${result.snippet}\n`;
          formatted += `🔗 [رابط](${result.url})\n\n`;
        });
        
        formatted += `\n`;
      }
    });
    
    formatted += `---\n\n`;
  }
  
  formatted += `💡 تبي تفاصيل أكثر من مصدر معين؟ 😊`;
  
  return formatted;
}

// ============================================
// 🚀 دالة مبسطة للاستخدام السريع
// ============================================

/**
 * بحث ذكي مع تنسيق جاهز
 */
export async function quickSmartSearch(query: string): Promise<string> {
  try {
    const result = await smartMultiSourceSearch(query);
    return formatMultiSourceResults(result);
  } catch (error) {
    console.error('❌ خطأ في البحث الذكي:', error);
    return `عذراً، حصل خطأ أثناء البحث 😕\n\nممكن تحاول مرة ثانية؟`;
  }
}

// 📤 Exports
export {
  detectBestSource,
  searchYouTube,
  searchWikipedia,
  searchStackOverflow,
  searchGitHub,
  searchNews
};