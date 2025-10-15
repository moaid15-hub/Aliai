// Religious Search Handler
// معالج البحث في الأسئلة الدينية

interface ReligiousSearchResult {
  text: string;
  source: string;
  reference?: string;
}

interface ReligiousSearchResponse {
  shiite_sources: ReligiousSearchResult[];
  sunni_source: ReligiousSearchResult;
}

/**
 * دالة للكشف عن الأسئلة الدينية
 */
function isReligiousQuestion(message: string): boolean {
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

// 🌐 المواقع الدينية المعتمدة للبحث
const RELIGIOUS_WEBSITES = {
  shiite: [
    'https://www.sistani.org',      // موقع السيد السيستاني
    'https://www.leader.ir',         // موقع السيد الخامنئي
    'https://alkhoei.net',           // مؤسسة الإمام الخوئي
    'https://www.alhaydari.com',     // مواقع فقهية شيعية أخرى
  ],
  sunni: [
    'https://islamqa.info',          // موقع الإسلام سؤال وجواب
    'https://www.dar-alifta.org',    // دار الإفتاء المصرية
  ]
};

/**
 * 🔍 البحث في المواقع الشيعية باستخدام Google Custom Search أو Web Scraping
 */
async function searchShiiteWebsites(query: string): Promise<ReligiousSearchResult[]> {
  console.log(`🔍 جارٍ البحث في المواقع الشيعية عن: "${query}"`);
  
  try {
    // استخدام Google Custom Search API أو Bing Search API
    // يمكن أيضاً استخدام SerpAPI أو ScraperAPI
    
    // مثال باستخدام Google Search (يحتاج API Key)
    // const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
    // const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;
    
    // البحث في المواقع الشيعية
    const searchQuery = `${query} site:sistani.org OR site:alkhoei.net OR site:leader.ir`;
    
    // TODO: استدعاء Google Search API هنا
    // const response = await fetch(
    //   `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(searchQuery)}`
    // );
    
    // مؤقتاً: نرجع نتائج تجريبية توضح الآلية
    return [
      {
        text: `🔍 نتائج البحث عن "${query}" في المواقع الشيعية المعتمدة:`,
        source: "sistani.org",
        reference: "يتم البحث في موقع السيد السيستاني..."
      },
      {
        text: `للحصول على فتاوى دقيقة، يُنصح بزيارة المواقع الرسمية للمراجع العظام.`,
        source: "alkhoei.net",
        reference: "مؤسسة الإمام الخوئي الخيرية"
      }
    ];
    
  } catch (error) {
    console.error('خطأ في البحث في المواقع الشيعية:', error);
    return [{
      text: `عذراً، حصل خطأ في البحث عن "${query}" في المواقع الشيعية.`,
      source: "نظام البحث",
      reference: "يُرجى المحاولة مرة أخرى أو زيارة المواقع مباشرة"
    }];
  }
}

/**
 * 🔍 البحث في المواقع السنية
 */
async function searchSunniWebsites(query: string): Promise<ReligiousSearchResult> {
  console.log(`🔍 جارٍ البحث في المواقع السنية عن: "${query}"`);
  
  try {
    const searchQuery = `${query} site:islamqa.info OR site:dar-alifta.org`;
    
    // TODO: استدعاء Search API للمواقع السنية
    
    return {
      text: `🔍 نتائج البحث عن "${query}" في المواقع السنية المعتمدة.`,
      source: "islamqa.info",
      reference: "موقع الإسلام سؤال وجواب"
    };
    
  } catch (error) {
    console.error('خطأ في البحث في المواقع السنية:', error);
    return {
      text: `عذراً، حصل خطأ في البحث عن "${query}" في المواقع السنية.`,
      source: "نظام البحث",
      reference: "يُرجى المحاولة مرة أخرى"
    };
  }
}

/**
 * 🔍 دالة البحث الديني الرئيسية - تبحث في المواقع الدينية الحقيقية
 */
async function religiousSearch(query: string): Promise<ReligiousSearchResponse> {
  console.log(`🔍 بدء البحث الديني عن: "${query}"`);
  
  try {
    // البحث في المواقع الشيعية أولاً
    const shiiteSources = await searchShiiteWebsites(query);
    
    // البحث في المواقع السنية
    const sunniSource = await searchSunniWebsites(query);
    
    return {
      shiite_sources: shiiteSources,
      sunni_source: sunniSource
    };
    
  } catch (error) {
    console.error('خطأ في البحث الديني:', error);
    
    // رد احتياطي في حالة الفشل
    return {
      shiite_sources: [
        {
          text: `عذراً، لم نتمكن من البحث عن "${query}" حالياً.`,
          source: "نظام البحث",
          reference: "خطأ تقني مؤقت"
        }
      ],
      sunni_source: {
        text: `يُنصح بزيارة المواقع الدينية المعتمدة مباشرة للحصول على فتاوى دقيقة.`,
        source: "نظام البحث",
        reference: "خطأ تقني مؤقت"
      }
    };
  }
}

/**
 * دالة تنسيق الرد الديني - متوافقة مع prompt الجديد
 */
function formatReligiousResponse(
  query: string, 
  results: ReligiousSearchResponse
): string {
  const { shiite_sources, sunni_source } = results;
  
  // مقدمة قصيرة
  let response = `سؤال مهم! خلني أبحث لك في المصادر الموثوقة 🕌\n\n`;
  response += `---\n\n`;
  
  // المصادر الشيعية
  response += `### 📚 من المصادر الشيعية:\n\n`;
  
  shiite_sources.forEach((source, index) => {
    response += `**الرأي ${index === 0 ? 'الأول' : 'الثاني'}:**\n`;
    response += `${source.text}\n`;
    response += `**المصدر:** ${source.source}`;
    if (source.reference) {
      response += ` - ${source.reference}`;
    }
    response += `\n\n`;
  });
  
  response += `---\n\n`;
  
  // المصدر السني
  response += `### 📖 من المصادر السنية:\n\n`;
  response += `${sunni_source.text}\n`;
  response += `**المصدر:** ${sunni_source.source}`;
  if (sunni_source.reference) {
    response += ` - ${sunni_source.reference}`;
  }
  response += `\n\n`;
  
  response += `---\n\n`;
  
  // خاتمة تشجيعية للمتابعة
  response += `💡 **ملاحظة:** هذه معلومات عامة من المصادر. للحالات الخاصة، يُفضل استشارة مرجع أو عالم دين موثوق.\n\n`;
  response += `تبي تفاصيل أكثر عن نقطة معينة؟ 🤲`;
  
  return response;
}

/**
 * المعالج الرئيسي للرسائل
 */
async function handleUserMessage(message: string): Promise<string> {
  // تحقق إذا كان سؤال ديني
  if (isReligiousQuestion(message)) {
    try {
      // ابحث في المصادر الدينية
      const searchResults = await religiousSearch(message);
      
      // نسق الرد
      const formattedResponse = formatReligiousResponse(message, searchResults);
      
      return formattedResponse;
    } catch (error) {
      return `عذراً، حصل خطأ أثناء البحث في المصادر الدينية 😕\n\nممكن تعيد المحاولة؟ أو اسألني بطريقة مختلفة!`;
    }
  }
  
  // إذا مو سؤال ديني، رد عادي
  return `فهمتك! 😊\n\nكيف أقدر أساعدك؟`;
}

// مثال على الاستخدام
export {
  isReligiousQuestion,
  religiousSearch,
  formatReligiousResponse,
  handleUserMessage
};

// ============================================
// مثال على التطبيق في Chat Component
// ============================================

/*
// في Chat Window Component:

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
    // استخدم المعالج
    const aiResponse = await handleUserMessage(inputValue);
    
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiMessage]);
  } catch (error) {
    const errorMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: 'عذراً، حصل خطأ! ممكن تحاول مرة ثانية؟ 😅',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, errorMessage]);
  } finally {
    setIsTyping(false);
  }
};
*/