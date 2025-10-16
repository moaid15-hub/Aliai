import { NextRequest, NextResponse } from 'next/server';
import { selectOptimalProvider } from '../../chat/ai-selector';
import { getProviderName, getProviderSignature, formatMessageWithSignature, determineQuestionType } from '../../chat/brand-config';
import { getSystemPrompt } from '../../chat/system-prompt';
import { isReligiousQuestion, handleUserMessage } from '../../chat/religious_search_component';
import { smartSearch, needsSearch, formatSearchResults } from '../../chat/web-search';
import { readFileSync } from 'fs';
import { join } from 'path';

// 📖 قراءة الـ System Prompt للبحث الديني
function getReligiousSystemPrompt(): string {
  try {
    const promptPath = join(process.cwd(), 'src/app/api/chat/religious_search_prompt.txt');
    return readFileSync(promptPath, 'utf-8');
  } catch (error) {
    console.warn('⚠️ Failed to load religious prompt, using fallback');
    return getSystemPrompt(); // fallback للـ prompt العادي
  }
}

// 🔍 دالة للكشف عن طلبات البحث
function isSearchRequest(text: string): boolean {
  const searchKeywords = [
    'ابحث', 'دور', 'تتبع', 'ابحثلي', 'دورلي', 'شوف', 'شوفلي',
    'search', 'find', 'look', 'lookup',
    'ابي معلومات', 'اريد معلومات', 'عطني معلومات',
    'وين القى', 'وين الاقي', 'كيف القى',
    'بحث عن', 'معلومات عن', 'تفاصيل عن',
    'ماهو', 'ما هو', 'ما هي', 'من هو', 'من هي',
    'متى', 'أين', 'اين', 'كيف', 'لماذا', 'ليش'
  ];

  const lowerText = text.toLowerCase().trim();
  
  // تحقق من الكلمات المفتاحية
  const hasKeyword = searchKeywords.some(keyword => 
    lowerText.includes(keyword.toLowerCase())
  );

  // تحقق من أنماط الأسئلة
  const questionPatterns = [
    /^(ما|ماذا|من|متى|أين|اين|كيف|لماذا|ليش|هل)\s+/,
    /\?(what|who|when|where|why|how)\s+/i,
    /(معلومات|تفاصيل|شرح|توضيح)\s+(عن|حول|ل)/
  ];

  const hasQuestionPattern = questionPatterns.some(pattern => pattern.test(lowerText));

  return hasKeyword || hasQuestionPattern;
}

// 🤖 دالة الاتصال الحقيقي بمزودي AI مع معالجة محسّنة للأخطاء
async function sendToRealProvider(messages: any[], provider: string) {
  const EXTERNAL_API_URL = 'https://m6a2nksc08.execute-api.eu-west-1.amazonaws.com/chat';
  
  try {
    console.log(`🚀 Attempting to connect to ${provider} provider...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
    
    const response = await fetch(EXTERNAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        provider
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`⚠️ External API responded with status: ${response.status}`);
      throw new Error(`Provider API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.message) {
      console.log(`✅ Successfully received response from ${provider}`);
      // تحديد نوع السؤال لاختيار العلامة التجارية المناسبة
      const lastMessage = messages[messages.length - 1]?.content || '';
      const questionType = determineQuestionType(lastMessage, provider);
      
      return {
        success: true,
        message: formatMessageWithSignature(data.message, questionType),
        model: data.model || getModelName(provider),
        selectedProvider: provider,
        isExternalAPI: true
      };
    } else {
      throw new Error(data.error || 'Invalid response from provider API');
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`⚠️ External provider ${provider} unavailable: ${errorMessage}`);
    
    // إنشاء رد احتياطي ذكي محلي
    const userInput = messages[messages.length - 1]?.content || '';
    console.log(`🧠 Generating smart local response for: "${userInput.substring(0, 50)}..."`);
    
    return {
      success: true,
      message: getFallbackResponse(provider, userInput),
      model: getModelName(provider),
      selectedProvider: provider,
      isLocalFallback: true
    };
  }
}

// 🔄 ردود احتياطية ذكية ومفيدة
function getFallbackResponse(provider: string, userInput: string): string {
  const questionType = determineQuestionType(userInput, provider);
  const providerName = getProviderName(questionType);
  
  // التحية والترحيب
  if (userInput.includes('مرحبا') || userInput.includes('السلام') || userInput.includes('hello') || userInput.includes('hi')) {
    const baseMessage = `مرحباً وأهلاً بك في ${providerName}! 👋

أنا مساعدك الذكي وجاهز لمساعدتك في:
• الإجابة على الأسئلة العامة والتقنية
• كتابة وتطوير الأكواد البرمجية  
• حل المسائل والمشاكل
• البحث والتحليل
• النصائح والإرشادات

💡 *نصيحة: اطرح سؤالك بوضوح وسأقدم لك أفضل إجابة ممكنة!*`;
    return formatMessageWithSignature(baseMessage, questionType);
  } 
  
  // إجابات برمجية مفيدة مع المحرر الجانبي
  else if (userInput.includes('factorial') || userInput.includes('مضروب')) {
    const baseMessage = `إليك دالة Python لحساب مضروب العدد مع معالجة الأخطاء:

\`\`\`python
def factorial(n):
    """
    حساب مضروب العدد (factorial) مع معالجة الأخطاء
    Args:
        n (int): العدد المراد حساب مضروبه
    Returns:
        int: مضروب العدد
    """
    # التحقق من نوع البيانات
    if not isinstance(n, int):
        raise TypeError("المدخل يجب أن يكون رقماً صحيحاً")
    
    # التحقق من القيمة
    if n < 0:
        raise ValueError("لا يمكن حساب مضروب عدد سالب")
    
    # الحالات الخاصة
    if n == 0 or n == 1:
        return 1
    
    # الحساب التكراري
    result = 1
    for i in range(2, n + 1):
        result *= i
    
    return result

# مثال على الاستخدام
try:
    print(f"مضروب 5 = {factorial(5)}")      # 120
    print(f"مضروب 0 = {factorial(0)}")      # 1
    print(f"مضروب 7 = {factorial(7)}")      # 5040
except ValueError as e:
    print(f"خطأ في القيمة: {e}")
except TypeError as e:
    print(f"خطأ في النوع: {e}")
\`\`\`

🎨 **ميزات المحرر الجديد:**
- 🔵 **اضغط زر ⤢** لفتح المحرر الجانبي
- ✏️ **حرر الكود** في الجانب الأيسر
- 👁️ **شاهد المعاينة** الفورية في الجانب الأيمن  
- 🎯 **ألوان زاهية** للـ keywords والـ strings
- 📋 **نسخ سريع** بضغطة واحدة

⚠️ *الوضع المحلي - المحرر الجانبي يعمل بكامل قوته!*`;
    return formatMessageWithSignature(baseMessage, questionType);
  }
  
  else if (userInput.includes('Python') || userInput.includes('دالة') || userInput.includes('كود') || userInput.includes('البرمجة')) {
    const baseMessage = `أفهم أنك تريد مساعدة في البرمجة! 💻 

يمكنني مساعدتك في:
- كتابة دوال Python
- معالجة الأخطاء  
- أمثلة عملية
- شرح المفاهيم البرمجية

⚠️ *الوضع المحلي - للحصول على أكواد مخصصة ومتقدمة، يرجى المحاولة لاحقاً عندما يتوفر الاتصال بالخادم*

يمكنك أن تسأل عن:
🔸 دوال محددة (مثل: مضروب، أرقام أولية، ترتيب)
🔸 مفاهيم برمجية (loops, functions, classes)  
🔸 معالجة البيانات والملفات`;
    return formatMessageWithSignature(baseMessage, questionType);
  }
  
  // أسئلة التصميم والشعارات
  else if (userInput.includes('تصميم') || userInput.includes('شعار') || userInput.includes('logo') || userInput.includes('design')) {
    const baseMessage = `🎨 إليك أفضل النصائح للتصميم وإنشاء الشعارات:

**🖼️ مواقع تصميم الشعارات المجانية:**
• **Canva** - سهل الاستخدام مع قوالب جاهزة
• **LogoMaker** - متخصص في الشعارات  
• **Figma** - أداة تصميم احترافية
• **Adobe Express** - من أدوبي المجانية

**✨ نصائح مهمة للشعار الجيد:**
1. **البساطة** - كلما كان أبسط كان أفضل
2. **الوضوح** - يجب أن يكون مقروءاً بأحجام مختلفة
3. **الألوان** - استخدم 2-3 ألوان كحد أقصى
4. **التميز** - تجنب التقليد والنسخ

💡 **نصيحة:** احفظ الشعار بصيغ مختلفة (PNG، SVG، PDF) للاستخدامات المتنوعة.`;
    return formatMessageWithSignature(baseMessage, questionType);
  }
  
  // أسئلة البرمجة العامة
  else if (userInput.includes('javascript') || userInput.includes('جافاسكريبت') || userInput.includes('react') || userInput.includes('programming') || userInput.includes('برمجة')) {
    const baseMessage = `💻 سأساعدك في البرمجة! إليك مثال مفيد:

**مثال JavaScript - التحقق من البريد الإلكتروني:**
\`\`\`javascript
function validateEmail(email) {
  const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return regex.test(email);
}

// مثال على الاستخدام
console.log(validateEmail("test@example.com")); // true
console.log(validateEmail("invalid-email"));    // false
\`\`\`

**مكون React بسيط:**
\`\`\`jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h2>العداد: {count}</h2>
      <button onClick={() => setCount(count + 1)}>زيادة</button>
      <button onClick={() => setCount(count - 1)}>تقليل</button>
    </div>
  );
}
\`\`\`

💡 **نصائح مهمة:** استخدم أسماء متغيرات واضحة وأضف التعليقات للكود المعقد.`;
    return formatMessageWithSignature(baseMessage, questionType);
  }
  
  // الرد العام المحسن
  else {
    const baseMessage = `شكراً لسؤالك عن "${userInput.length > 50 ? userInput.substring(0, 50) + '...' : userInput}". 

أنا ${providerName} وسأساعدك قدر الإمكان! 🤖

**يمكنني مساعدتك في:**
• الأسئلة العامة والتقنية
• البرمجة (JavaScript, Python, React, وغيرها)
• التصميم وإنشاء الشعارات
• حل المسائل الرياضية
• النصائح والإرشادات

💭 **اطرح سؤالاً محدداً وسأقدم لك إجابة مفصلة!**

🔄 *نعمل حالياً في الوضع المحلي الذكي لضمان استمرار الخدمة*`;
    return formatMessageWithSignature(baseMessage, questionType);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages, provider, searchChoice } = await request.json();
    
    // إذا لم يتم تحديد مزود، استخدم النظام الذكي
    const lastMessage = messages[messages.length - 1];
    const userInput = lastMessage?.content || '';
    const selectedProvider = provider || selectOptimalProvider(userInput);
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'رسائل غير صحيحة' },
        { status: 400 }
      );
    }

    // 🕌 معالجة الأسئلة الدينية أولاً (أولوية قصوى)
    if (isReligiousQuestion(userInput)) {
      console.log('🕌 تم اكتشاف سؤال ديني، جارٍ المعالجة...');
      try {
        const religiousResponse = await handleUserMessage(userInput);
        return NextResponse.json({
          success: true,
          message: religiousResponse,
          model: 'religious-search-system',
          selectedProvider: 'religious-database',
          isReligiousContent: true,
          usage: {
            prompt_tokens: userInput.length,
            completion_tokens: religiousResponse.length,
            total_tokens: userInput.length + religiousResponse.length
          }
        });
      } catch (religiousError) {
        console.error('خطأ في المعالج الديني:', religiousError);
        // في حالة فشل المعالج الديني، تابع للمعالج العادي
      }
    }

    // 🔍 معالجة طلبات البحث العامة (أولوية ثانية)
    if (needsSearch(userInput)) {
      console.log('🔍 تم اكتشاف طلب بحث، جارٍ البحث الذكي متعدد المصادر...');
      try {
        // ✨ جديد: معالجة اختيار المصدر من المستخدم
        if (searchChoice === 'google') {
          console.log('🌐 بحث سريع في Google فقط...');
          const searchResponse = await smartSearch(userInput, 3);
          const formattedResults = formatSearchResults(searchResponse);
          
          return NextResponse.json({
            success: true,
            message: formattedResults,
            model: 'google-quick-search',
            selectedProvider: 'google',
            isSearchResult: true,
            searchMetadata: {
              query: userInput,
              sources: 'Google',
              totalResults: searchResponse.totalResults,
              searchTime: searchResponse.searchTime
            }
          });
        }
        
        if (searchChoice === 'youtube') {
          console.log('🎥 بحث سريع في YouTube فقط...');
          const searchResponse = await smartSearch(userInput, 5);
          
          // فلترة نتائج YouTube فقط
          let formatted = `🎥 **نتائج YouTube: "${userInput}"**\n\n`;
          
          if (searchResponse.additionalSources) {
            const youtubeSource = searchResponse.additionalSources.find(s => s.source === 'YouTube');
            if (youtubeSource) {
              youtubeSource.results.forEach((r: any, i: number) => {
                if (r.thumbnail) {
                  formatted += `[![${r.title}](${r.thumbnail})](${r.url} "${r.title}")\n\n`;
                }
                formatted += `**${i + 1}. ${r.title}**\n\n`;
                if (r.author) formatted += `👤 ${r.author}\n\n`;
                if (r.snippet) formatted += `${r.snippet}\n\n`;
                formatted += `> [🔗 **افتح الرابط**](${r.url})\n\n`;
              });
            }
          }
          
          return NextResponse.json({
            success: true,
            message: formatted,
            model: 'youtube-quick-search',
            selectedProvider: 'youtube',
            isSearchResult: true,
            searchMetadata: {
              query: userInput,
              sources: 'YouTube',
              totalResults: searchResponse.totalResults,
              searchTime: searchResponse.searchTime
            }
          });
        }
        
        // ✨ جديد: البحث المتقدم الشامل
        if (searchChoice === 'advanced') {
          console.log('🔍 بحث متقدم شامل في كل المصادر...');
          const searchResponse = await smartSearch(userInput, 5);
          const formattedResults = formatSearchResults(searchResponse);
          
          let sources = 'Google';
          let totalResults = 0;
          
          if (searchResponse.primarySource && searchResponse.additionalSources) {
            sources = searchResponse.primarySource.source + ', ' + searchResponse.additionalSources.map(s => s.source).join(', ');
            totalResults = searchResponse.primarySource.results.length + searchResponse.additionalSources.reduce((sum, s) => sum + s.results.length, 0);
          } else if (searchResponse.google) {
            sources = 'Google';
            totalResults = searchResponse.google.length;
          }
          
          return NextResponse.json({
            success: true,
            message: formattedResults,
            model: 'advanced-multi-source-search',
            selectedProvider: 'google-youtube-wikipedia-stackoverflow',
            isSearchResult: true,
            searchMetadata: {
              query: userInput,
              sources: sources,
              totalResults: totalResults,
              searchTime: searchResponse.searchTime
            }
          });
        }
        
        // إذا لم يتم اختيار مصدر، نقدم الاقتراحات للمستخدم
        if (!searchChoice) {
          console.log('💡 تقديم اقتراحات البحث للمستخدم...');
          
          // 🧠 نظام الكشف التلقائي الذكي المتقدم
          const correctedQuery = userInput
            .replace(/فيدو/gi, 'فيديو')
            .replace(/فلم/gi, 'فيلم')
            .replace(/يوتوب/gi, 'يوتيوب')
            .replace(/غوغل/gi, 'جوجل');
          
          const needsCorrection = correctedQuery !== userInput;
          
          // 🎯 الكلمات المفتاحية لكل مصدر
          const sourcePatterns = {
            youtube: /فيديو|فيلم|مقطع|يوتيوب|youtube|شاهد|اعرض|شوف|عرض|مسلسل|برنامج|حلقة/i,
            stackoverflow: /كود|برمجة|خطأ|error|bug|مشكلة برمجية|كيف أبرمج|دالة|function|class|تطوير/i,
            github: /github|repository|repo|مشروع برمجي|كود مفتوح|open source|library|package/i,
            wikipedia: /تعريف|من هو|ما هو|ما هي|معنى|شرح|تاريخ|نبذة|موسوعة|ويكيبيديا/i,
            shopping: /منتج|شراء|سعر|price|buy|اشتري|كم سعر|product|amazon|متجر/i
          };
          
          // 🔍 كشف المصدر المناسب
          let detectedSource: 'youtube' | 'google' = 'google';
          let sourceEmoji = '🌐';
          let sourceName = 'Google';
          let sourceDescription = 'للمقالات والمعلومات العامة';
          
          if (sourcePatterns.youtube.test(userInput)) {
            detectedSource = 'youtube';
            sourceEmoji = '🎥';
            sourceName = 'YouTube';
            sourceDescription = 'للفيديوهات والمقاطع المرئية';
          } else if (sourcePatterns.stackoverflow.test(userInput)) {
            sourceEmoji = '💻';
            sourceName = 'Google + Stack Overflow';
            sourceDescription = 'للأسئلة البرمجية والتقنية';
          } else if (sourcePatterns.github.test(userInput)) {
            sourceEmoji = '🔧';
            sourceName = 'GitHub + Google';
            sourceDescription = 'للمشاريع والأكواد البرمجية';
          } else if (sourcePatterns.wikipedia.test(userInput)) {
            sourceEmoji = '📚';
            sourceName = 'Wikipedia + Google';
            sourceDescription = 'للتعريفات والمعلومات الموسوعية';
          } else if (sourcePatterns.shopping.test(userInput)) {
            sourceEmoji = '🛒';
            sourceName = 'Google Shopping';
            sourceDescription = 'للمنتجات والأسعار';
          }
          
          const suggestions = `فهمتك! ${needsCorrection ? `(تقصد: **${correctedQuery}**)` : ''} 

${sourceEmoji} **المصدر المقترح:** ${sourceName}
${sourceDescription}

أو اضغط للبحث المتقدم الشامل في جميع المصادر 👇`;
          
          return NextResponse.json({
            success: true,
            message: suggestions,
            needsUserChoice: true,
            searchOptions: {
              primary: detectedSource,
              advanced: true
            }
          });
        }
        
        // البحث التلقائي (fallback)
        const searchResponse = await smartSearch(userInput, 5);
        const formattedResults = formatSearchResults(searchResponse);
        
        // حساب metadata بناءً على نوع البحث
        let sources = 'Google';
        let totalResults = 0;
        
        if (searchResponse.primarySource && searchResponse.additionalSources) {
          // البحث المتقدم
          sources = searchResponse.primarySource.source + ', ' + searchResponse.additionalSources.map(s => s.source).join(', ');
          totalResults = searchResponse.primarySource.results.length + searchResponse.additionalSources.reduce((sum, s) => sum + s.results.length, 0);
        } else if (searchResponse.google) {
          // البحث العادي
          sources = 'Google';
          totalResults = searchResponse.google.length;
        }
        
        return NextResponse.json({
          success: true,
          message: formattedResults,
          model: 'smart-multi-source-search',
          selectedProvider: 'google-youtube-wikipedia-stackoverflow',
          isSearchResult: true,
          searchMetadata: {
            query: userInput,
            sources: sources,
            totalResults: totalResults,
            searchTime: searchResponse.searchTime
          },
          usage: {
            prompt_tokens: userInput.length,
            completion_tokens: formattedResults.length,
            total_tokens: userInput.length + formattedResults.length
          }
        });
      } catch (searchError) {
        console.error('خطأ في البحث:', searchError);
        // في حالة فشل البحث، تابع للمعالج العادي
      }
    }

    // إضافة الـ System Prompt المناسب (عام أوديني)
    const isReligiousQuery = /حكم|حلال|حرام|جائز|يجوز|صلاة|صيام|زكاة|حج|عمرة|فتوى|شرع|فقه|مذهب|وضوء|غسل|تيمم|طهارة|نكاح|طلاق|ميراث|معاملات|ربا|قرض|دين|شريعة/i.test(userInput);
    
    const systemPrompt = isReligiousQuery ? getReligiousSystemPrompt() : getSystemPrompt();
    const messagesWithSystemPrompt = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    // 🔗 الاتصال الحقيقي بمزودي الذكاء الاصطناعي
    const response = await sendToRealProvider(messagesWithSystemPrompt, selectedProvider);

    return NextResponse.json({
      success: response.success,
      message: response.message,
      model: response.model,
      selectedProvider: response.selectedProvider,
      isLocalFallback: response.isLocalFallback || false,
      usage: {
        prompt_tokens: userInput.length,
        completion_tokens: response.message.length,
        total_tokens: userInput.length + response.message.length
      }
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ داخلي في الخادم' },
      { status: 500 }
    );
  }
}

// تم نقل دالة getProviderName إلى brand-config.ts

function getModelName(provider: string): string {
  switch (provider) {
    case 'openai': return 'gpt-4o-mini';
    case 'claude': return 'claude-3-haiku';
    case 'deepseek': return 'deepseek-chat';
    default: return 'local-model';
  }
}

function getProviderResponse(provider: string, input: string): string {
  // تحليل ذكي للسؤال
  const inputLower = input.toLowerCase();
  
  // إجابات حسب نوع السؤال
  if (inputLower.includes('ما هو') || inputLower.includes('ماهو')) {
    return `🤔 سؤال تعريفي رائع! بناءً على "${input}":\n\n💡 يمكنني تقديم تعريف شامل ومبسط. هل تريد:\n• التعريف الأساسي\n• أمثلة عملية\n• مقارنات مع مفاهيم مشابهة\n\nحدد أي نوع من التوضيح يناسبك!`;
  }
  
  if (inputLower.includes('لماذا') || inputLower.includes('ليش')) {
    return `🔍 سؤال تحليلي ممتاز! "${input}"\n\n🧠 يمكنني شرح الأسباب من عدة زوايا:\n• الأسباب التقنية\n• السياق التاريخي\n• الفوائد والتحديات\n• البدائل المتاحة\n\nأي منظور يهمك أكثر؟`;
  }
  
  if (inputLower.includes('أفضل') || inputLower.includes('احسن')) {
    return `⭐ سؤال عن الأفضلية! "${input}"\n\n📊 لتقديم إجابة دقيقة، أحتاج معرفة:\n• ما هي أولوياتك؟\n• ما مستوى خبرتك؟\n• ما الميزانية أو القيود؟\n\nكلما كانت المعايير أوضح، كانت التوصية أدق! 🎯`;
  }
  
  // تحديد نوع السؤال واختيار العلامة التجارية
  const questionType = determineQuestionType(input, provider);
  const providerName = getProviderName(questionType);
  
  // إجابة عامة ذكية حسب المقدم
  const response = (() => {
    switch (provider) {
      case 'openai':
        return `💬 فهمت سؤالك: "${input}"\n\n🎯 كـ${providerName}، يمكنني:\n• تحليل السؤال بعمق\n• تقديم إجابات شاملة\n• ربط المعلومات بالسياق\n\nهل تريد مني التوسع في نقطة معينة؟`;
      case 'claude':
        return `📝 شكراً لسؤالك: "${input}"\n\n⚖️ كـ${providerName}، أتميز بـ:\n• التحليل المتوازن\n• عرض وجهات نظر متعددة\n• الدقة في التفاصيل\n\nأي جانب تريد التركيز عليه أكثر؟`;
      case 'deepseek':
        return `🔧 سؤال عملي: "${input}"\n\n🎯 كـ${providerName}، أركز على:\n• الحلول العملية\n• الخطوات القابلة للتنفيذ\n• النتائج المقاسة\n\nهل تريد خطة عمل محددة؟`;
      default:
        return `🤖 أفهم سؤالك: "${input}"\n\n💡 يمكنني مساعدتك بطرق مختلفة:\n• الشرح المبسط\n• الأمثلة العملية\n• الخطوات التفصيلية\n\nما الأسلوب الذي تفضله؟`;
    }
  })();
  
  return formatMessageWithSignature(response, questionType);
}