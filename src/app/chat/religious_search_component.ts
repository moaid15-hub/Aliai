// ============================================
// 🕌 نظام البحث الديني المحدّث
// يستخدم نظام البحث الجديد المنظم
// ============================================

import { search, multiSearch, SearchSource } from '@/lib/search';
import { SearchResponse, SearchResult } from '@/lib/types';

// ============================================
// 🔍 دالة البحث الديني المحسنة
// ============================================

export async function performReligiousSearch(query: string): Promise<SearchResponse> {
  console.log('🕌 بدء البحث الديني باستخدام النظام المنظم...');
  console.log(`📝 السؤال: "${query}"`);

  try {
    // ✨ استخدام نظام البحث المتقدم الجديد
    const searchResponse = await search(query, {
      sources: [SearchSource.GOOGLE, SearchSource.WIKIPEDIA],
      maxResults: 10,
      language: 'ar'
    });

    console.log(`✅ تم الحصول على ${searchResponse.results.length} نتيجة من النظام المتقدم`);

    return {
      results: searchResponse.results,
      query: searchResponse.query,
      totalResults: searchResponse.totalResults.toString(),
      searchTime: searchResponse.searchTime,
      source: 'Advanced Search Engine'
    };

  } catch (error) {
    console.error('❌ خطأ في البحث:', error);
    return createFallbackReligiousResults(query);
  }
}

// ============================================
// 🎨 تنسيق النتائج الدينية المُحسّن
// ============================================

export function formatReligiousResults(response: SearchResponse): string {
  const results = response.results || [];

  console.log(`🎨 تنسيق ${results.length} نتيجة دينية...`);

  // إذا لم تكن هناك نتائج حقيقية
  if (results.length === 0) {
    return `🕌 **البحث عن: "${response.query}"**

⚠️ **عذراً، لم أتمكن من الوصول إلى نتائج البحث حالياً.**

📱 **للحصول على فتاوى موثوقة، يُرجى زيارة:**

### 📚 المراجع الشيعية:
• [السيد السيستاني](https://www.sistani.org)
• [مؤسسة الإمام الخوئي](https://www.alkhoei.net)
• [السيد الخامنئي](https://www.leader.ir)

### 📖 المراجع السنية:
• [الإسلام سؤال وجواب](https://islamqa.info)
• [إسلام ويب](https://www.islamweb.net)
• [دار الإفتاء المصرية](https://www.dar-alifta.org)

💡 **نصيحة:** للمسائل الخاصة، استشر مرجعاً دينياً موثوقاً مباشرة.`;
  }

  // تصنيف النتائج
  const shiaResults = results.filter(r =>
    r.url.includes('sistani.org') ||
    r.url.includes('alkhoei.net') ||
    r.url.includes('khamenei.ir') ||
    r.url.includes('leader.ir') ||
    r.displayLink?.toLowerCase().includes('sistani') ||
    r.displayLink?.toLowerCase().includes('khamenei')
  );

  const sunniResults = results.filter(r =>
    r.url.includes('islamqa.info') ||
    r.url.includes('islamweb.net') ||
    r.url.includes('dar-alifta.org') ||
    r.url.includes('aliftaa.jo') ||
    r.displayLink?.toLowerCase().includes('islamqa') ||
    r.displayLink?.toLowerCase().includes('islamweb')
  );

  const generalResults = results.filter(r =>
    !shiaResults.includes(r) && !sunniResults.includes(r)
  );

  console.log(`   📊 شيعية: ${shiaResults.length}`);
  console.log(`   📊 سنية: ${sunniResults.length}`);
  console.log(`   📊 عامة: ${generalResults.length}`);

  // بناء النتيجة
  let formatted = `🕌 **فتاوى ومراجع دينية: "${response.query}"**\n\n`;
  formatted += `⚠️ **تنبيه مهم:** هذه معلومات عامة من المصادر المتاحة. للحصول على فتوى دقيقة، يُنصح بمراجعة مرجع ديني موثوق.\n\n`;
  formatted += `📊 **${results.length} مصدر ديني**\n\n---\n\n`;

  // عرض النتائج الشيعية
  if (shiaResults.length > 0) {
    formatted += `### 📚 من المصادر الشيعية:\n\n`;
    shiaResults.slice(0, 3).forEach((result, i) => {
      formatted += `**${i + 1}. ${result.title}**\n`;
      if (result.displayLink) {
        formatted += `🏛️ **المصدر:** ${result.displayLink}\n`;
      }
      formatted += `📝 ${result.snippet}\n`;
      formatted += `> [📖 اقرأ المزيد](${result.url})\n\n`;
    });
    formatted += `---\n\n`;
  }

  // عرض النتائج السنية
  if (sunniResults.length > 0) {
    formatted += `### 📖 من المصادر السنية:\n\n`;
    sunniResults.slice(0, 3).forEach((result, i) => {
      formatted += `**${i + 1}. ${result.title}**\n`;
      if (result.displayLink) {
        formatted += `🏛️ **المصدر:** ${result.displayLink}\n`;
      }
      formatted += `📝 ${result.snippet}\n`;
      formatted += `> [📖 اقرأ المزيد](${result.url})\n\n`;
    });
    formatted += `---\n\n`;
  }

  // عرض المصادر العامة
  if (generalResults.length > 0) {
    formatted += `### 📝 مصادر إضافية:\n\n`;
    generalResults.slice(0, 3).forEach((result, i) => {
      formatted += `**${i + 1}. ${result.title}**\n`;
      if (result.displayLink) {
        formatted += `🌐 **المصدر:** ${result.displayLink}\n`;
      }
      formatted += `📝 ${result.snippet}\n`;
      formatted += `> [🔗 افتح الرابط](${result.url})\n\n`;
    });
  }

  formatted += `\n💡 **ملاحظة:** للحالات الخاصة أو المسائل المعقدة، يُفضل استشارة مرجع أو عالم دين موثوق مباشرة.\n\n`;
  formatted += `🤲 تبي تفاصيل أكثر عن نقطة معينة؟`;

  return formatted;
}

// ============================================
// 🆘 نتائج احتياطية عند فشل البحث
// ============================================

function createFallbackReligiousResults(query: string): SearchResponse {
  console.log('🆘 إنشاء نتائج احتياطية...');

  // نتائج احتياطية مفيدة بناءً على السؤال
  const fallbackResults: SearchResult[] = [
    {
      title: 'موقع السيد السيستاني - المركز الرسمي',
      url: 'https://www.sistani.org',
      snippet: 'الموقع الرسمي لمكتب سماحة السيد السيستاني (دام ظله) - يحتوي على الفتاوى والاستفتاءات الشرعية',
      displayLink: 'sistani.org',
    },
    {
      title: 'مؤسسة الإمام الخوئي الخيرية',
      url: 'https://www.alkhoei.net',
      snippet: 'مؤسسة الإمام الخوئي توفر الفتاوى الشرعية والإجابات على الاستفتاءات الدينية',
      displayLink: 'alkhoei.net',
    },
    {
      title: 'الإسلام سؤال وجواب',
      url: 'https://islamqa.info',
      snippet: 'موقع الإسلام سؤال وجواب - فتاوى وأحكام شرعية موثوقة',
      displayLink: 'islamqa.info',
    },
    {
      title: 'إسلام ويب - مركز الفتوى',
      url: 'https://www.islamweb.net',
      snippet: 'مركز الفتوى في إسلام ويب - أكثر من 400 ألف فتوى في مختلف المجالات الشرعية',
      displayLink: 'islamweb.net',
    }
  ];

  return {
    results: fallbackResults,
    query,
    totalResults: '4',
    searchTime: 0,
    source: 'Fallback Database'
  };
}

/**
 * دالة للكشف عن الأسئلة الدينية
 */
export function isReligiousQuestion(message: string): boolean {
  const religiousKeywords = [
    'حكم', 'حلال', 'حرام', 'جائز', 'يجوز',
    'صلاة', 'صيام', 'زكاة', 'حج', 'عمرة',
    'فتوى', 'شرع', 'فقه', 'مذهب',
    'وضوء', 'غسل', 'تيمم', 'طهارة',
    'نكاح', 'طلاق', 'ميراث', 'معاملات',
    'ربا', 'قرض', 'دين', 'شريعة'
  ];

  const messageLower = message.toLowerCase();
  return religiousKeywords.some(keyword => messageLower.includes(keyword));
}

/**
 * المعالج الرئيسي للرسائل
 */
export async function handleUserMessage(message: string): Promise<string> {
  // تحقق إذا كان سؤال ديني
  if (isReligiousQuestion(message)) {
    try {
      // استخدم البحث الديني المحسن مع النظام الجديد
      const searchResults = await performReligiousSearch(message);

      // نسق الرد
      const formattedResponse = formatReligiousResults(searchResults);

      return formattedResponse;
    } catch (error) {
      return `عذراً، حصل خطأ أثناء البحث في المصادر الدينية 😕\n\nممكن تعيد المحاولة؟ أو اسألني بطريقة مختلفة!`;
    }
  }

  // إذا مو سؤال ديني، رد عادي
  return `فهمتك! 😊\n\nكيف أقدر أساعدك؟`;
}
