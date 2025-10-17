// ai-service.ts
// ============================================
// 🤖 خدمة الذكاء الاصطناعي الذكية
// ============================================

import { Message } from './types';
import { needsSearch } from './search';
import { searchWeb } from './web-search';
import { 
  selectOptimalProvider, 
  getAlternativeProvider, 
  recordProviderStats, 
  intelligentCategories,
  initializeAISelector,
  getEmergencyFallback 
} from './ai-selector';
import { getSystemPrompt } from './system-prompt';
import { isReligiousQuestion, handleUserMessage as handleReligiousMessage } from './religious_search_component';

// تهيئة النظام الذكي
initializeAISelector();

// 🧠 إرسال ذكي مع اختيار تلقائي للمزود
export const sendToAIIntelligent = async (
  messages: Array<{ role: string; content: string }>,
  userMessage: string
): Promise<{ success: boolean; message: string; usedProvider?: string; error?: string }> => {
  
  // 🕌 فحص الأسئلة الدينية أولاً
  if (isReligiousQuestion(userMessage)) {
    try {
      console.log('🕌 Detected religious question, using specialized search...');
      const religiousResponse = await handleReligiousMessage(userMessage);
      return {
        success: true,
        message: religiousResponse,
        usedProvider: 'religious_search'
      };
    } catch (error) {
      console.warn('❌ Religious search failed, falling back to AI providers');
      // إذا فشل البحث الديني، تابع مع المزودين العاديين
    }
  }
  
  // اختيار المزود الأمثل للأسئلة غير الدينية
  const optimalProvider = selectOptimalProvider(userMessage);
  
  // محاولة الإرسال مع النظام الاحتياطي
  return await sendWithIntelligentFallback(messages, optimalProvider);
};

// 🔄 إرسال مع نظام احتياطي ذكي
export const sendWithIntelligentFallback = async (
  messages: Array<{ role: string; content: string }>,
  selectedProvider: string
): Promise<{ success: boolean; message: string; usedProvider?: string; error?: string }> => {
  
  const providers = [
    selectedProvider,
    getAlternativeProvider(selectedProvider),
    getEmergencyFallback() // DeepSeek كاحتياطي أخير
  ].filter((p, i, arr) => arr.indexOf(p) === i); // إزالة التكرار

  let lastError: any = null;

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    const startTime = Date.now();
    
    try {
      console.log(`🤖 Trying provider: ${provider} (attempt ${i + 1}/${providers.length})`);
      
      const result = await sendToAI(messages, provider);
      const responseTime = Date.now() - startTime;
      
      if (result.success) {
        // تسجيل النجاح
        recordProviderStats(provider, responseTime, true);
        console.log(`✅ Success with ${provider} in ${responseTime}ms`);
        
        return { 
          ...result, 
          usedProvider: provider 
        };
      } else {
        // تسجيل الفشل
        recordProviderStats(provider, responseTime, false);
        lastError = result.error;
        console.warn(`❌ ${provider} failed: ${result.error}`);
      }
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      recordProviderStats(provider, responseTime, false);
      lastError = error;
      console.error(`💥 ${provider} error:`, error);
    }
  }
  
  // إذا فشلت كل المحاولات
  return {
    success: false,
    message: '',
    error: `فشل في الاتصال بجميع المزودين. آخر خطأ: ${lastError}`
  };
};

// إرسال رسالة للذكاء الاصطناعي (الدالة الأساسية)
export const sendToAI = async (
  messages: Array<{ role: string; content: string }>,
  provider: string
): Promise<{ success: boolean; message: string; error?: string }> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, provider })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return { success: true, message: data.message };
    } else {
      throw new Error(data.error || 'خطأ في الاستجابة');
    }
  } catch (error) {
    console.error('AI API Error:', error);
    return {
      success: false,
      message: '',
      error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
    };
  }
};

// � إرسال سريع مع البحث التلقائي
export const sendWithAutoSearch = async (
  userMessage: string,
  conversationHistory: Message[],
  autoSearchEnabled: boolean
): Promise<{ 
  success: boolean; 
  message: string; 
  sources?: any[];
  usedProvider?: string;
  error?: string;
}> => {
  console.log('🤖 sendWithAutoSearch called:', { userMessage, autoSearchEnabled });
  
  try {
    let searchContext = '';
    let sources: any[] = [];

    // بحث سريع ومبسط
    if (autoSearchEnabled && needsSearch(userMessage)) {
      console.log('🚀 Enhanced search for:', userMessage);
      
      try {
        const searchResults = await searchWeb(userMessage, { 
          maxResults: 3,
          quickSearch: true // بحث سريع
        });
        console.log('🔍 Enhanced search results received:', searchResults);
        
        if (searchResults.results && searchResults.results.length > 0) {
          searchContext = searchResults.results
            .slice(0, 3)
            .map((result: any, index: number) => 
              `${index + 1}. ${result.title}: ${(result.snippet || '').substring(0, 200)}`
            )
            .join('\n\n');
          
          sources = searchResults.results.slice(0, 3);
          console.log('✅ Found', sources.length, 'search sources');
        } else {
          console.log('⚠️ No search results found, but continuing...');
          searchContext = '🔍 تم البحث في الإنترنت لكن لم يتم العثور على نتائج محددة.';
        }
      } catch (searchError) {
        console.error('❌ Search failed, but trying enhanced fallback:', searchError);
        // محاولة بحث مبسط كبديل
        try {
          console.log('🔄 Trying simple search as fallback...');
          const fallbackSearch = await fetch('/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              query: userMessage, 
              max_results: 2,
              useAI: false 
            }),
            signal: AbortSignal.timeout(5000)
          });
          
          if (fallbackSearch.ok) {
            const fallbackResults = await fallbackSearch.json();
            if (fallbackResults.results && fallbackResults.results.length > 0) {
              searchContext = fallbackResults.results
                .slice(0, 2)
                .map((result: any, index: number) => 
                  `${index + 1}. ${result.title}: ${result.snippet || ''}`
                )
                .join('\n');
              sources = fallbackResults.results.slice(0, 2);
              console.log('✅ Fallback search succeeded with', sources.length, 'results');
            }
          }
        } catch (fallbackError) {
          console.error('❌ Fallback search also failed:', fallbackError);
        }
        
        // إذا فشل كل شيء، استخدم نتائج وهمية مفيدة
        if (!searchContext) {
          searchContext = `🔍 البحث عن "${userMessage}" - سأحاول تقديم معلومات عامة حول هذا الموضوع.`;
          sources = [{
            title: `بحث محدود عن: ${userMessage}`,
            url: `https://www.google.com/search?q=${encodeURIComponent(userMessage)}`,
            snippet: `🔄 نعمل حالياً في الوضع المحلي الذكي لضمان استمرار الخدمة`
          }];
        }
      }
    }

    const messages = [
      ...(searchContext ? [{
        role: 'system',
        content: `استخدم المعلومات التالية للإجابة:\n\n${searchContext}`
      }] : []),
      ...conversationHistory.map(m => ({
        role: m.role,
        content: m.content
      })),
      {
        role: 'user',
        content: userMessage
      }
    ];

    // استخدام النظام الذكي لاختيار المزود وإرسال الرسالة
    console.log('🧠 Calling AI with messages:', messages.length, 'messages');
    const result = await sendToAIIntelligent(messages, userMessage);
    console.log('🧠 AI Response:', result);
    
    if (result.success) {
      return {
        success: true,
        message: result.message,
        sources: sources.length > 0 ? sources : undefined,
        usedProvider: result.usedProvider
      };
    } else {
      throw new Error(result.error || 'خطأ في الاستجابة');
    }
  } catch (error) {
    console.error('AI Service Error:', error);
    return {
      success: false,
      message: '',
      error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
    };
  }
};