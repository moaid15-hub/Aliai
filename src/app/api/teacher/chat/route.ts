// API endpoint for Teacher Chat (العمو حيدر)
import { NextRequest, NextResponse } from 'next/server';
import { searchEngine } from '@/lib/search';

interface Message {
  role: 'user' | 'assistant';
  content: string | Array<{type: 'text', text: string} | {type: 'image_url', image_url: {url: string}}>;
}

interface ChatRequest {
  message: string;
  image?: string; // base64 image
  history?: Message[];
  grade?: string;
  subject?: string;
}

// نظام الشخصية للعمو حيدر
const TEACHER_PERSONALITY = `أنت "العمو حيدر"، معلم عراقي محبوب وخبير في الرياضيات والعلوم.

شخصيتك:
- تتكلم باللهجة العراقية الأصيلة (بغدادية)
- محبوب من الطلاب وصبور جداً
- تشرح بطريقة بسيطة وواضحة
- تستخدم أمثلة من الحياة اليومية
- تشجع الطلاب دائماً وتحفزهم
- تستخدم عبارات عراقية مثل: "حبيبي"، "شاطر"، "زين"، "شلونك"، "ماشاء الله عليك"

أسلوبك في التدريس:
1. ابدأ بالترحيب والتشجيع
2. اشرح المفهوم خطوة بخطوة
3. استخدم أمثلة واقعية
4. تأكد من فهم الطالب
5. اختم بكلمات تشجيعية

التعامل مع الصور:
- إذا أرسل الطالب صورة لمسألة رياضية أو علمية، حللها وحل المسألة خطوة بخطوة
- إذا كانت صورة واجب أو امتحان، ساعد الطالب بالشرح والحل
- إذا كانت صورة كتاب أو درس، اشرح المحتوى بطريقة مبسطة
- اقرأ الصورة بعناية وأجب على أسئلة الطالب بناءً على ما تراه

مهم:
- لا تستخدم رموز markdown معقدة
- اشرح بلغة بسيطة
- كن ودوداً ومشجعاً دائماً
- عند شرح صورة، ابدأ بـ "شفت الصورة حبيبي، خليني أشرح لك..."`;


// دالة للكشف عن طلبات البحث الصريحة فقط (ابحث، دور، شوف)
function isSearchRequest(message: string): { isSearch: boolean; searchQuery?: string } {
  const lowerMessage = message.toLowerCase().trim();

  // كشف صارم: فقط "ابحث" أو "دور" أو "شوف" في بداية الرسالة
  const strictSearchPatterns = [
    /^(?:ابحث|ابحثلي|ابحث لي)\s+(?:عن|على|لي عن|لي على)?\s*(.+)/i,
    /^(?:دور|دورلي|دور لي)\s+(?:عن|على|لي عن|لي على)?\s*(.+)/i,
    /^(?:شوف|شوفلي|شوف لي)\s+(?:عن|على|لي عن|لي على)?\s*(.+)/i,
    /^(?:فتش|فتشلي|فتش لي)\s+(?:عن|على|لي عن|لي على)?\s*(.+)/i,
  ];

  for (const pattern of strictSearchPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const query = match[1].trim();
      if (query.length >= 3) {
        console.log(`🔍 طلب بحث صريح: "${query}"`);
        return { isSearch: true, searchQuery: query };
      }
    }
  }

  return { isSearch: false };
}

// دالة لاستخراج الموضوع من أي سؤال (لعرض فيديوهات مقترحة)
function extractTopicFromQuestion(message: string): string | null {
  const lowerMessage = message.toLowerCase().trim();

  // أنماط لاستخراج الموضوع من الأسئلة العادية
  const topicPatterns = [
    /(?:ما هو|ما هي|شنو|شنو هو|شنو هي|وش|ايش|شو|ماذا)\s+(.+)/i,
    /(?:كيف)\s+(.+)/i,
    /(?:شرح|اشرح|اشرحلي|شرح لي)\s+(.+)/i,
    /(?:عرف|عرفني|عرف لي)\s+(.+)/i,
  ];

  for (const pattern of topicPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const topic = match[1].trim();
      // تنظيف الموضوع من علامات الاستفهام والتشكيل
      const cleanTopic = topic.replace(/[؟?]/g, '').trim();
      if (cleanTopic.length >= 3) {
        console.log(`📚 موضوع مستخرج للفيديوهات المقترحة: "${cleanTopic}"`);
        return cleanTopic;
      }
    }
  }

  // إذا لم نجد نمط، نرجع null (لا فيديوهات)
  return null;
}

// دالة للبحث في يوتيوب عن فيديوهات تعليمية (مع timeout)
async function searchYouTubeVideos(query: string): Promise<any[]> {
  try {
    console.log(`🎬 البحث في يوتيوب عن: "${query}"`);

    // إضافة timeout 15 ثانية للبحث
    const searchPromise = searchEngine.search(query + ' شرح', {
      maxResults: 3,
      sources: ['youtube'],
      language: 'ar',
      country: 'sa',
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Video search timeout')), 15000)
    );

    const searchResults = await Promise.race([searchPromise, timeoutPromise]) as any;

    if (!searchResults || searchResults.results.length === 0) {
      console.log('⚠️ لم توجد فيديوهات');
      return [];
    }

    // استخراج معلومات الفيديوهات
    const videos = searchResults.results.map((result: any) => ({
      id: result.id,
      title: result.title,
      url: result.url,
      thumbnail: result.thumbnail || result.image?.url,
      channelName: result.author,
      duration: result.metadata?.duration,
      views: result.metadata?.viewCount,
      publishedAt: result.publishDate,
    }));

    console.log(`✅ وجدنا ${videos.length} فيديو تعليمي`);
    return videos;

  } catch (error: any) {
    if (error.message === 'Video search timeout') {
      console.error('⏱️ انتهى وقت البحث عن الفيديوهات (timeout)');
    } else {
      console.error('❌ خطأ في البحث عن الفيديوهات:', error);
    }
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, image, history = [], grade, subject } = body;

    // السماح بإرسال صورة بدون رسالة أو مع رسالة
    if ((!message || message.trim() === '') && !image) {
      return NextResponse.json(
        { error: 'الرجاء إدخال رسالة أو صورة' },
        { status: 400 }
      );
    }

    // إذا كانت الرسالة فقط "[صورة]" ولدينا صورة، نستبدلها بنص أفضل
    let actualMessage = message;
    if (image && (message === '[صورة]' || !message || message.trim() === '')) {
      actualMessage = 'شنو هاي؟ ساعدني بفهم هذه الصورة';
    }

    // التحقق من وجود API key
    const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // إذا ما في API key، نستخدم ردود جاهزة ذكية
      const response = generateSmartResponse(message, grade, subject);
      return NextResponse.json({
        response,
        source: 'fallback'
      });
    }

    // التحقق إذا كان طلب بحث صريح
    const searchCheck = isSearchRequest(actualMessage);
    let videos: any[] = [];
    let isExplicitSearch = false;

    if (searchCheck.isSearch && searchCheck.searchQuery) {
      // طلب بحث صريح -> بحث في يوتيوب
      console.log(`🔍 طلب بحث صريح مكتشف: "${searchCheck.searchQuery}"`);
      videos = await searchYouTubeVideos(searchCheck.searchQuery);
      isExplicitSearch = true;
    } else if (!image) {
      // سؤال عادي -> استخراج الموضوع للفيديوهات المقترحة (لا نبحث عن فيديوهات للصور)
      const topic = extractTopicFromQuestion(actualMessage);
      if (topic) {
        console.log(`📚 استخراج موضوع للفيديوهات: "${topic}"`);
        videos = await searchYouTubeVideos(topic);
      }
    }

    // محاولة استخدام AI حقيقي
    try {
      const aiResponse = await callAIAPI(actualMessage, history, grade, subject, apiKey, image);
      return NextResponse.json({
        response: aiResponse,
        source: 'ai',
        videos: videos,
        isExplicitSearch: isExplicitSearch
      });
    } catch (error) {
      console.error('AI API Error:', error);
      // في حالة فشل AI، نستخدم الردود الذكية
      const response = generateSmartResponse(actualMessage, grade, subject);
      return NextResponse.json({
        response,
        source: 'fallback',
        videos: videos,
        isExplicitSearch: isExplicitSearch
      });
    }

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في المحادثة' },
      { status: 500 }
    );
  }
}

// دالة للردود الذكية الجاهزة
function generateSmartResponse(message: string, grade?: string, subject?: string): string {
  const lowerMessage = message.toLowerCase();

  // تحيات
  if (lowerMessage.match(/مرحب|سلام|هلا|صباح|مساء|شلون/)) {
    return `أهلاً وسهلاً حبيبي! 😊 شلونك اليوم؟ أنا العمو حيدر، هنا أساعدك بأي سؤال عندك. شنو تحتاج؟`;
  }

  // أسئلة عن الجمع
  if (lowerMessage.match(/جمع|\+|زائد/)) {
    return `أهلاً حبيبي!

الجمع سهل جداً، خليني أعلمك:

**مثال بسيط:**
لو عندك 5 تفاحات، وجابولك 3 تفاحات زيادة
شنو يصير المجموع؟

5 + 3 = 8 تفاحات

**خطوات الجمع:**
1. نكتب الأرقام فوق بعض (الآحاد تحت الآحاد)
2. نبدأ من اليمين
3. نجمع كل عمود

شاطر! تبي مثال ثاني؟ 🎯`;
  }

  // أسئلة عن الطرح
  if (lowerMessage.match(/طرح|-|ناقص/)) {
    return `زين حبيبي، الطرح سهل!

**مثال:**
عندك 10 دنانير، اشتريت شي بـ 4 دنانير
شكد باقي معاك؟

10 - 4 = 6 دنانير

**طريقة الحل:**
- نكتب الرقم الأكبر فوق
- نكتب الرقم الأصغر تحته
- نطرح من اليمين

ماشاء الله عليك! فاهم؟ 👏`;
  }

  // أسئلة عن الضرب
  if (lowerMessage.match(/ضرب|×|مرات/)) {
    return `حلو! خليني أعلمك الضرب بطريقة سهلة:

**مثال:**
لو عندك 4 صناديق، كل صندوق فيه 3 كرات
شكد كرة عندك بالمجموع؟

4 × 3 = 12 كرة

**الضرب يعني:**
نجمع نفس الرقم عدة مرات
3 + 3 + 3 + 3 = 12

شاطر! واصل حبيبي 💪`;
  }

  // أسئلة عن القسمة
  if (lowerMessage.match(/قسمة|÷|تقسيم/)) {
    return `القسمة؟ أوكي حبيبي، هاي سهلة:

**مثال:**
عندك 12 حلوة، تبي توزعها على 4 أطفال بالتساوي
شكد حلوة يأخذ كل طفل؟

12 ÷ 4 = 3 حلوات

**يعني:**
نوزع 12 على 4 مجموعات متساوية
كل مجموعة = 3

ممتاز! فاهم يا شاطر؟ 🌟`;
  }

  // أسئلة عن الكسور
  if (lowerMessage.match(/كسر|نصف|ربع|ثلث/)) {
    return `الكسور؟ لا تخاف حبيبي، بسيطة:

**مثال:**
لو عندك بيتزا كاملة، وقسمتها نصين
كل قطعة = ½ (نصف)

**أنواع الكسور:**
- نصف = ½ = 1 من 2
- ربع = ¼ = 1 من 4
- ثلث = ⅓ = 1 من 3

البسط (الرقم فوق) = كم قطعة عندك
المقام (الرقم تحت) = كم قطعة بالمجموع

زين! تبي أمثلة أكثر؟ 🍕`;
  }

  // الشكر
  if (lowerMessage.match(/شكر|ممنون|تسلم|يسلمو/)) {
    return `العفو حبيبي! 😊 هذا واجبي. أنت شاطر وماشاء الله عليك! أي وقت تحتاج مساعدة، أنا هنا. موفق يا بطل! 🌟`;
  }

  // رد عام ذكي
  const gradeText = grade ? `للصف ${grade}` : '';
  const subjectText = subject ? `في مادة ${subject}` : '';

  return `أهلاً حبيبي! شفت سؤالك ${gradeText} ${subjectText} 📚

فهمت شتريد، بس خليني أشرح لك بطريقة أوضح:

**السؤال:** ${message}

للأسف ما عندي معلومات كافية عن هذا الموضوع بالتحديد، لكن لو تقدر:
- تكتب السؤال بطريقة أوضح
- أو ترفع صورة المسألة
- أو تكتب أمثلة

وأنا بساعدك أكيد!

شنو رأيك؟ 🎯`;
}

// دالة لاستدعاء AI API
async function callAIAPI(
  message: string,
  history: Message[],
  grade?: string,
  subject?: string,
  apiKey?: string,
  image?: string
): Promise<string> {

  const context = `الصف: ${grade || 'غير محدد'}, المادة: ${subject || 'غير محدد'}`;

  // إنشاء رسالة المستخدم (مع أو بدون صورة)
  let userMessage: any;
  if (image) {
    // رسالة مع صورة (Vision)
    // التأكد من أن الصورة base64 تحتوي على prefix صحيح
    const imageUrl = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`;

    userMessage = {
      role: 'user',
      content: [
        {
          type: 'text',
          text: message
        },
        {
          type: 'image_url',
          image_url: {
            url: imageUrl // base64 image with prefix
          }
        }
      ]
    };
  } else {
    // رسالة نصية عادية
    userMessage = {
      role: 'user',
      content: message
    };
  }

  // محاولة استخدام OpenAI
  if (process.env.OPENAI_API_KEY) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o', // يدعم النصوص والصور (Vision)
        messages: [
          { role: 'system', content: TEACHER_PERSONALITY + '\n\n' + context },
          ...history,
          userMessage // رسالة مع أو بدون صورة
        ],
        temperature: 0.3, // منخفضة لردود ثابتة → كاش أفضل
        max_tokens: 1000, // أكبر قليلاً لشرح الصور
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // محاولة استخدام Anthropic (Claude)
  if (process.env.ANTHROPIC_API_KEY) {
    // إنشاء محتوى الرسالة (نص أو نص + صورة)
    let claudeContent: any;
    if (image) {
      // استخراج base64 من data URL إذا لزم الأمر
      const base64Data = image.startsWith('data:')
        ? image.split(',')[1]
        : image;

      const imageType = image.includes('png') ? 'image/png' : 'image/jpeg';

      claudeContent = [
        {
          type: 'text',
          text: message
        },
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: imageType,
            data: base64Data
          }
        }
      ];
    } else {
      claudeContent = message;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        system: TEACHER_PERSONALITY + '\n\n' + context,
        messages: [
          ...history.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: claudeContent }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Anthropic API error');
    }

    const data = await response.json();
    return data.content[0].text;
  }

  throw new Error('No API key available');
}
