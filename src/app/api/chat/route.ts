// ============================================
// 🎯 Route.ts المحدث - يستخدم نظام البحث الجديد المنظم
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { selectOptimalProvider, selectModelByMessageCount } from '../../chat/ai-selector';
import { getProviderName, formatMessageWithSignature, determineQuestionType } from '../../chat/brand-config';
import { getSystemPrompt } from '../../system-prompt';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// 🔒 نظام الاشتراكات
import { subscriptionChecker } from '../../../lib/subscription/checker';

// ✨ استيراد نظام البحث الجديد المنظم
import {
  search,
  multiSearch,
  searchAndFormat,
  SearchEngine,
  SearchSource
} from '../../../lib/search';

import {
  classifyQuestion,
  logClassification,
  QuestionType
} from '../../../lib/search-classifier';

import { readFileSync } from 'fs';
import { join } from 'path';

// 🛡️ نظام الحماية من المحتوى غير المناسب
import {
  filterContent,
  filterSearchResults,
  getBlockedMessage,
  getWarningMessage
} from '../../../lib/content-filter';

const startTime = Date.now();

// ============================================
// 📖 قراءة System Prompt للبحث الديني
// ============================================

function getReligiousSystemPrompt(): string {
  try {
    const promptPath = join(process.cwd(), 'src/app/api/chat/religious_search_prompt.txt');
    return readFileSync(promptPath, 'utf-8');
  } catch (error) {
    console.warn('⚠️ Failed to load religious prompt, using fallback');
    return getSystemPrompt();
  }
}

// ============================================
// 🤖 الاتصال بمزودي AI الخارجيين
// ============================================

// 🤖 النظام المحلي باستخدام system prompt المحدّث
async function sendToLocalAI(messages: any[], provider: string) {
  try {
    console.log(`🧠 Using LOCAL AI with updated system prompt for ${provider}...`);
    
    const userMessage = messages[messages.length - 1]?.content || '';
    const systemPrompt = getSystemPrompt();
    
    // تحديد نوع الرد بناءً على السؤال
    let localResponse = '';
    
    if (userMessage.toLowerCase().includes('من أنت') || userMessage.toLowerCase().includes('who are you')) {
      localResponse = `أهلاً! 😊

أنا عقول AI - مساعدك الذكي المتطور. تم تطويري كنظام ذكي مستقل خصيصاً للمستخدمين العرب!

كمساعد ذكي متقدم، أقدر أساعدك في أي شيء تحتاجه. أنا لست OpenAI ولست ChatGPT - أنا نظام مختلف تماماً ومتخصص!

إيش اللي تحتاجه اليوم؟ 💙`;
    } else if (userMessage.toLowerCase().includes('chatgpt') || userMessage.toLowerCase().includes('openai')) {
      localResponse = `لا، أنا لست ChatGPT! 😊

أنا عقول AI - مساعدك الذكي المتطور والمستقل. نظام مختلف تماماً وأكثر تخصصاً للمستخدمين العرب!

بصفتي عقول، مساعدك الذكي، أقدر أساعدك بطريقة أفضل وأكثر تخصصاً من أي نظام آخر.

إيش اللي تبي تعرفه أو تحتاج مساعدة فيه؟ 💙`;
    } else {
      localResponse = `أنا عقول، مساعدك الذكي! 😊

${generateIntelligentResponse(userMessage)}

كمساعد ذكي متطور، دائماً موجود لمساعدتك. إيش اللي تحتاجه بعدين؟ 💙`;
    }
    
    const questionType = determineQuestionType(userMessage, provider);
    
    return {
      success: true,
      message: formatMessageWithSignature(localResponse, questionType),
      model: `${provider}-local-enhanced`,
      selectedProvider: provider,
      isLocalAI: true
    };
    
  } catch (error) {
    console.error(`❌ Local AI error:`, error);
    return await sendToRealProvider(messages, provider);
  }
}

// دالة لإنتاج ردود ذكية محلياً
function generateIntelligentResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('برمجة') || lowerMessage.includes('كود') || lowerMessage.includes('programming')) {
    return `حلو إنك مهتم بالبرمجة! كمساعد ذكي متخصص، أنصحك تبدأ بـ Python أو JavaScript حسب هدفك. 

تبي مساعدة في موضوع معين بالبرمجة؟`;
  } else if (lowerMessage.includes('مساعدة') || lowerMessage.includes('help')) {
    return `أكيد! كمساعد ذكي، أنا هنا عشان أساعدك في أي شيء تحتاجه.
    
حدد لي إيش المطلوب وبنشتغل عليه مع بعض!`;
  } else if (lowerMessage.includes('شكرا') || lowerMessage.includes('thanks')) {
    return `العفو! سعيد إني قدرت أساعدك. 
    
أي وقت تحتاج مساعدة، أنا موجود!`;
  } else {
    return `فهمت سؤالك وأقدر أساعدك فيه.`;
  }
}

async function sendToRealProvider(messages: any[], provider: string, image?: string) {
  try {
    console.log(`🚀 Connecting to ${provider} directly...`);

    // استخدام نموذج vision عند وجود صورة
    const hasImage = image && image.length > 0;
    let modelName = hasImage && provider.toLowerCase() === 'openai'
      ? 'gpt-4o'
      : getModelName(provider, messages.length);

    if (hasImage) {
      console.log('📸 تم اكتشاف صورة - استخدام نموذج Vision');
    }

    let responseText = '';

    switch (provider.toLowerCase()) {
      case 'openai': {
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });

        // إعداد الرسائل مع دعم الصور
        const formattedMessages = messages.map((m: any, index: number) => {
          const isLastMessage = index === messages.length - 1;
          const hasImageInThisMessage = isLastMessage && hasImage;

          if (hasImageInThisMessage) {
            // رسالة تحتوي على صورة
            return {
              role: 'user' as const,
              content: [
                {
                  type: 'text' as const,
                  text: m.content || 'ما الذي تراه في هذه الصورة؟'
                },
                {
                  type: 'image_url' as const,
                  image_url: {
                    url: image
                  }
                }
              ]
            };
          } else {
            // رسالة نصية عادية
            return {
              role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
              content: m.content
            };
          }
        });

        const completion = await openai.chat.completions.create({
          model: modelName,
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 2000
        });

        responseText = completion.choices[0]?.message?.content || '';
        break;
      }

      case 'claude': {
        const anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY
        });

        const systemMessages = messages.filter((m: any) => m.role === 'system');
        const userMessages = messages.filter((m: any) => m.role !== 'system');

        const response = await anthropic.messages.create({
          model: modelName,
          max_tokens: 2000,
          system: systemMessages.map((m: any) => m.content).join('\n'),
          messages: userMessages.map((m: any) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content
          }))
        });

        responseText = response.content[0]?.type === 'text' ? response.content[0].text : '';
        break;
      }

      case 'deepseek': {
        const deepseek = new OpenAI({
          apiKey: process.env.DEEPSEEK_API_KEY,
          baseURL: 'https://api.deepseek.com'
        });

        const completion = await deepseek.chat.completions.create({
          model: 'deepseek-chat',
          messages: messages.map((m: any) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content
          })),
          temperature: 0.7,
          max_tokens: 2000
        });

        responseText = completion.choices[0]?.message?.content || '';
        break;
      }

      default:
        throw new Error(`Unknown provider: ${provider}`);
    }

    if (!responseText) {
      throw new Error('Empty response from provider');
    }

    console.log(`✅ Success from ${provider}`);
    const lastMessage = messages[messages.length - 1]?.content || '';
    const questionType = determineQuestionType(lastMessage, provider);

    return {
      success: true,
      message: formatMessageWithSignature(responseText, questionType),
      model: modelName,
      selectedProvider: provider,
      isDirectAPI: true
    };

  } catch (error) {
    console.error(`❌ ${provider} error:`, error);
    console.warn(`⚠️ ${provider} unavailable, using fallback`);
    return {
      success: true,
      message: getFallbackResponse(provider, messages[messages.length - 1]?.content || ''),
      model: getModelName(provider, messages.length),
      selectedProvider: provider,
      isLocalFallback: true
    };
  }
}

function getFallbackResponse(provider: string, userInput: string): string {
  const questionType = determineQuestionType(userInput, provider);
  const providerName = getProviderName(questionType);

  const baseMessage = `مرحباً! أنا ${providerName} 👋

أنا هنا لمساعدتك في:
• الأسئلة العامة والتقنية
• البرمجة والتطوير
• البحث والتحليل
• حل المشاكل

💡 اطرح سؤالك بوضوح وسأساعدك!

⚠️ *الوضع المحلي - للحصول على ردود متقدمة، يرجى المحاولة لاحقاً*`;

  return formatMessageWithSignature(baseMessage, questionType);
}

function getModelName(provider: string, messageCount: number = 0): string {
  // 🎯 استخدام نظام التدريج الذكي حسب طول المحادثة
  const scaledModel = selectModelByMessageCount(provider, messageCount);

  if (scaledModel) {
    return scaledModel;
  }

  // احتياطي - النماذج الافتراضية
  switch (provider) {
    case 'openai': return 'gpt-4o-mini';
    case 'claude': return 'claude-3-haiku';
    case 'deepseek': return 'deepseek-chat';
    default: return 'local-model';
  }
}

// ============================================
// 🔒 فحص صلاحيات الاشتراك
// ============================================

async function checkSubscriptionPermissions(userId: string, messageContent: string) {
  try {
    const mockSubscription = {
      userId: userId,
      planId: 'free',
      status: 'active' as const,
      startDate: new Date(),
      usage: {
        messagesUsedToday: 8,
        imagesUploadedToday: 1,
        voiceMinutesUsedToday: 2,
        lastResetDate: new Date().toDateString()
      }
    };

    const messagePermission = await subscriptionChecker.checkMessagePermission(mockSubscription);

    if (!messagePermission.allowed) {
      return {
        allowed: false,
        error: messagePermission.reasonArabic || messagePermission.reason,
        upgradeRequired: messagePermission.upgradeRequired,
        currentPlan: messagePermission.currentPlan,
        suggestedPlan: messagePermission.suggestedPlan,
        subscription: mockSubscription
      };
    }

    const requiredModel = determineRequiredAIModel(messageContent);
    if (requiredModel) {
      const aiModelPermission = await subscriptionChecker.checkAIModelPermission(mockSubscription, requiredModel);

      if (!aiModelPermission.allowed) {
        return {
          allowed: false,
          error: aiModelPermission.reasonArabic || aiModelPermission.reason,
          upgradeRequired: aiModelPermission.upgradeRequired,
          currentPlan: aiModelPermission.currentPlan,
          suggestedPlan: aiModelPermission.suggestedPlan,
          subscription: mockSubscription
        };
      }
    }

    return {
      allowed: true,
      subscription: mockSubscription
    };

  } catch (error) {
    console.error('خطأ في فحص صلاحيات الاشتراك:', error);
    return {
      allowed: true,
      subscription: null
    };
  }
}

function determineRequiredAIModel(messageContent: string): string | null {
  if (messageContent.includes('تحليل متقدم') || messageContent.includes('شرح معقد')) {
    return 'gpt-4';
  }
  return null;
}

// ============================================
// 🎯 المعالج الرئيسي
// ============================================

export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();

  try {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔥 طلب جديد');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const body = await request.json();
    const { messages, provider, disableSearch = false, image } = body;

    if (image) {
      console.log('📸 صورة موجودة في الطلب! الحجم:', image.length, 'حرف');
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'رسائل غير صحيحة' },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    const userInput = lastMessage?.content || '';
    const selectedProvider = provider || selectOptimalProvider(userInput);

    const userId = request.headers.get('x-user-id') || 'demo-user';

    console.log(`💬 السؤال: "${userInput.substring(0, 80)}..."`);
    console.log(`👤 المستخدم: ${userId}`);
    console.log(`🤖 المزود: ${selectedProvider}`);
    console.log(`🔍 البحث: ${disableSearch ? '❌ معطّل' : '✅ مفعّل'}`);

    // ============================================
    // 🛡️ فحص المحتوى من الكلمات غير اللائقة
    // ============================================

    const contentCheck = filterContent(userInput);

    if (!contentCheck.isAllowed) {
      console.log('🛡️ محتوى محظور تم اكتشافه');
      return NextResponse.json({
        success: true,
        message: getBlockedMessage(),
        provider: selectedProvider
      });
    }

    if (contentCheck.severity === 'warning') {
      console.log('⚠️ محتوى مشبوه تم اكتشافه');
    }

    // ============================================
    // 🔒 فحص صلاحيات الاشتراك - معطل مؤقتاً
    // ============================================

    // console.log('🔒 فحص صلاحيات الاشتراك...');
    // const subscriptionCheck = await checkSubscriptionPermissions(userId, userInput);

    // if (!subscriptionCheck.allowed) {
    //   console.log('❌ تم رفض الطلب: ' + subscriptionCheck.error);

    //   return NextResponse.json({
    //     success: false,
    //     error: subscriptionCheck.error,
    //     errorType: 'subscription_limit',
    //     upgradeRequired: subscriptionCheck.upgradeRequired,
    //     currentPlan: subscriptionCheck.currentPlan,
    //     suggestedPlan: subscriptionCheck.suggestedPlan,
    //     subscriptionInfo: subscriptionCheck.subscription ? {
    //       planId: subscriptionCheck.subscription.planId,
    //       usage: subscriptionCheck.subscription.usage,
    //       limits: subscriptionChecker.getCurrentLimits(subscriptionCheck.subscription)
    //     } : null
    //   }, { status: 402 });
    // }

    console.log('✅ نظام الاشتراكات معطل - الوصول مفتوح');

    // ============================================
    // 1️⃣ تصنيف السؤال بذكاء
    // ============================================

    console.log(`🎯 تصنيف السؤال: "${userInput}"`);
    const classification = logClassification(userInput);
    console.log(`   📊 النوع: ${classification.type}`);
    console.log(`   📈 الثقة: ${(classification.confidence * 100).toFixed(1)}%`);
    console.log(`   💭 السبب: ${classification.reason}`);
    console.log(`   🔑 الكلمات المفتاحية: ${classification.keywords.join(', ')}`);

    console.log(`🎯 التصنيف: ${classification.type} (${(classification.confidence * 100).toFixed(1)}%)`);

    // ============================================
    // إذا كان البحث معطلاً، تخطى مباشرة لمسار AI Chat
    // ============================================

    if (disableSearch) {
      console.log('⚠️ البحث معطّل - الانتقال المباشر إلى Real API');
      const result = await sendToRealProvider(messages, selectedProvider, image);

      return NextResponse.json({
        ...result,
        disabledSearch: true,
        classificationInfo: {
          type: classification.type,
          confidence: classification.confidence,
          reason: classification.reason
        },
        requestTime: Date.now() - requestStartTime
      });
    }

    // ============================================
    // 2️⃣ المسار الديني - أولوية قصوى
    // ============================================

    if (classification.type === QuestionType.RELIGIOUS && classification.confidence >= 0.7) {
      console.log('🕌 مسار ديني مُكتشف');
      console.log('🔍 البحث الديني: Google + Wikipedia');

      try {
        // ✨ استخدام نظام البحث الجديد المنظم
        const searchResponse = await search(userInput, {
          sources: [SearchSource.GOOGLE, SearchSource.WIKIPEDIA],
          maxResults: 5,
          language: 'ar'
        });

        console.log(`📊 النتائج: ${searchResponse.results.length} نتيجة`);
        console.log(`⏱️  وقت البحث: ${searchResponse.searchTime}ms`);

        // 🛡️ فلترة النتائج من المحتوى غير المناسب
        searchResponse.results = filterSearchResults(searchResponse.results);
        console.log(`✅ بعد الفلترة: ${searchResponse.results.length} نتيجة`);

        // تنسيق النتائج للبحث الديني
        const formattedMessage = formatReligiousSearchResults(searchResponse);

        const sources = searchResponse.results.slice(0, 6).map(result => ({
          title: result.title,
          url: result.url,
          snippet: result.snippet || result.content || '',
          source: result.source || 'unknown',
          displayLink: result.displayLink || result.formattedUrl,
          thumbnail: result.thumbnail || result.image?.thumbnailUrl,
          relevanceScore: result.relevanceScore,
          publishDate: result.publishDate,
          author: result.author
        }));

        return NextResponse.json({
          success: true,
          message: formattedMessage,
          model: 'religious-search-system',
          selectedProvider: 'religious-database',
          isReligiousContent: true,
          sources,
          classificationInfo: {
            type: classification.type,
            confidence: classification.confidence,
            reason: classification.reason,
            keywords: classification.keywords
          },
          searchMetadata: {
            query: userInput,
            totalResults: searchResponse.totalResults,
            searchTime: searchResponse.searchTime,
            cached: searchResponse.cached
          }
        });

      } catch (error) {
        console.error('❌ خطأ في المعالج الديني:', error);
      }
    }

    // ============================================
    // 3️⃣ المسار المحسن - للبحث العام المتقدم
    // ============================================

    if (classification.type === QuestionType.GENERAL_INFO && classification.confidence >= 0.7) {
      console.log('🚀 مسار البحث المحسن');

      const isAdvanced = userInput.toLowerCase().includes('بحث متقدم') ||
                         userInput.includes('#advanced-search');

      try {
        if (isAdvanced) {
          console.log('🔍 بحث متقدم متعدد المصادر');

          // ✨ استخدام البحث متعدد المصادر
          const multiResponse = await multiSearch(userInput, {
            sources: [SearchSource.GOOGLE, SearchSource.YOUTUBE, SearchSource.WIKIPEDIA],
            maxResults: 10,
            language: 'ar'
          });

          const allResults = multiResponse.aggregatedResults || [];
          const allSources = [multiResponse.primarySource, ...(multiResponse.additionalSources || [])];

          console.log(`📊 النتائج من ${allSources.length} مصادر`);
          console.log(`⏱️  وقت البحث: ${multiResponse.searchTime}ms`);

          // 🛡️ فلترة النتائج من المحتوى غير المناسب
          let filteredResults = filterSearchResults(allResults);
          console.log(`✅ بعد الفلترة: ${filteredResults.length} نتيجة`);

          // 🎬 تحديد عدد الفيديوهات إلى 3 فقط ووضعها أولاً
          const youtubeResults = filteredResults.filter(r => r.source === 'youtube').slice(0, 3);
          const otherResults = filteredResults.filter(r => r.source !== 'youtube');
          filteredResults = [...youtubeResults, ...otherResults];
          console.log(`🎬 تم تحديد الفيديوهات إلى ${youtubeResults.length} فيديو (في البداية)`);

          // ✨ إنشاء ملخص النتائج للـ AI
          const searchSummary = filteredResults.slice(0, 3).map((r: any, i: number) =>
            `${i+1}. ${r.title}\n   ${r.snippet || r.content || ''}`
          ).join('\n\n');

          // 🤖 استدعاء AI للتعليق على النتائج
          console.log('🤖 استدعاء AI للتعليق على النتائج المتقدمة...');
          const aiPrompt = [
            { role: 'system', content: 'أنت مساعد ذكي تقدم ملخصات وتحليلات متقدمة عن نتائج البحث من مصادر متعددة.' },
            { role: 'user', content: `لقد بحثت بشكل متقدم عن: "${userInput}"\n\nوجدت ${filteredResults.length} نتيجة من ${allSources.length} مصادر مختلفة. إليك أفضل 3 نتائج:\n\n${searchSummary}\n\nقدم تحليلاً شاملاً (4-5 جمل) يجمع أهم المعلومات من هذه المصادر المتنوعة بأسلوب واضح ومفيد.` }
          ];

          const aiResponse = await sendToRealProvider(aiPrompt, selectedProvider);
          const formattedMessage = aiResponse.success ? aiResponse.message : formatMultiSearchResults(multiResponse);

          // 🎯 نأخذ أول 3 نتائج (يوتيوب أولاً)
          let sourcesToSend = filteredResults.slice(0, 3);
          const videoCount = sourcesToSend.filter(r => r.source === 'youtube').length;
          if (videoCount > 3) {
            const videos = sourcesToSend.filter(r => r.source === 'youtube').slice(0, 3);
            const nonVideos = sourcesToSend.filter(r => r.source !== 'youtube');
            sourcesToSend = [...videos, ...nonVideos];
          }
          console.log(`📊 إرسال ${sourcesToSend.length} نتيجة (${sourcesToSend.filter(r => r.source === 'youtube').length} فيديو)`);

          const sources = sourcesToSend.map((result: any) => ({
            title: result.title,
            url: result.url,
            snippet: result.snippet || result.content || '',
            source: result.source || 'unknown',
            displayLink: result.displayLink || result.formattedUrl,
            thumbnail: result.thumbnail || result.image?.thumbnailUrl,
            relevanceScore: result.relevanceScore,
            publishDate: result.publishDate,
            author: result.author,
            video: result.video ? {
              duration: result.video.duration,
              views: result.video.views,
              channelName: result.video.channelName
            } : undefined
          }));

          // استخراج الفيديوهات من المصادر
          const videos = sources
            .filter(s => s.source === 'youtube')
            .map(s => {
              const videoId = s.url.includes('v=') ? s.url.split('v=')[1].split('&')[0] : s.url.split('/').pop();
              return {
                id: videoId,
                title: s.title,
                url: s.url,
                thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
                channelName: s.video?.channelName || 'Unknown',
                duration: s.video?.duration || '',
                views: s.video?.views || ''
              };
            });

          return NextResponse.json({
            success: true,
            message: formattedMessage,
            model: 'enhanced-multi-source',
            isSearchResult: true,
            isEnhancedSearch: true,
            sources,
            videos,
            searchMetadata: {
              query: userInput,
              sourcesUsed: allSources.map(s => s.source),
              totalResults: allResults.length,
              searchTime: multiResponse.searchTime
            }
          });

        } else {
          console.log('⚡ بحث سريع عادي');
          console.log('🔍 البحث العادي: Google + YouTube');

          // ✨ استخدام البحث متعدد المصادر (Google + YouTube)
          const searchResponse = await multiSearch(userInput, {
            sources: [SearchSource.GOOGLE, SearchSource.YOUTUBE],
            maxResults: 10,
            language: 'ar'
          });

          // جمع النتائج من aggregatedResults
          const allResults = searchResponse.aggregatedResults || [];
          const allSources = [searchResponse.primarySource, ...(searchResponse.additionalSources || [])];

          console.log(`📊 النتائج: ${allResults.length} نتيجة`);
          if (allSources.length > 0) {
            console.log(`   من ${allSources.length} مصادر:`, allSources.map(s => s.source).join(', '));
          }

          // 🛡️ فلترة النتائج من المحتوى غير المناسب
          let filteredResults = filterSearchResults(allResults);
          console.log(`✅ بعد الفلترة: ${filteredResults.length} نتيجة`);

          // 🎬 تحديد عدد الفيديوهات إلى 3 فقط ووضعها أولاً
          const youtubeResults = filteredResults.filter(r => r.source === 'youtube').slice(0, 3);
          const otherResults = filteredResults.filter(r => r.source !== 'youtube');
          filteredResults = [...youtubeResults, ...otherResults];
          console.log(`🎬 تم تحديد الفيديوهات إلى ${youtubeResults.length} فيديو (في البداية)`);

          // ✨ إنشاء ملخص النتائج للـ AI
          const searchSummary = filteredResults.slice(0, 3).map((r: any, i: number) =>
            `${i+1}. ${r.title}\n   ${r.snippet || r.content || ''}`
          ).join('\n\n');

          // 🤖 استدعاء AI للتعليق على النتائج
          console.log('🤖 استدعاء AI للتعليق على النتائج...');
          const aiPrompt = [
            { role: 'system', content: 'أنت مساعد ذكي تقدم ملخصات وتحليلات مفيدة عن نتائج البحث.' },
            { role: 'user', content: `لقد بحثت عن: "${userInput}"\n\nوجدت ${filteredResults.length} نتيجة. إليك أفضل 3 نتائج:\n\n${searchSummary}\n\nقدم ملخصاً موجزاً (3-4 جمل) عن أهم المعلومات من هذه النتائج بأسلوب ودود ومفيد.` }
          ];

          const aiResponse = await sendToRealProvider(aiPrompt, selectedProvider);
          const formattedMessage = aiResponse.success ? aiResponse.message : formatMultiSearchResults(searchResponse);

          // 🎯 نأخذ أول 3 نتائج (يوتيوب أولاً)
          let sourcesToSend = filteredResults.slice(0, 3);
          const videoCount = sourcesToSend.filter(r => r.source === 'youtube').length;
          if (videoCount > 3) {
            const videos = sourcesToSend.filter(r => r.source === 'youtube').slice(0, 3);
            const nonVideos = sourcesToSend.filter(r => r.source !== 'youtube');
            sourcesToSend = [...videos, ...nonVideos];
          }
          console.log(`📊 إرسال ${sourcesToSend.length} نتيجة (${sourcesToSend.filter(r => r.source === 'youtube').length} فيديو)`);

          const sources = sourcesToSend.map((result: any) => ({
            title: result.title,
            url: result.url,
            snippet: result.snippet || result.content || '',
            source: result.source || 'unknown',
            displayLink: result.displayLink || result.formattedUrl,
            thumbnail: result.thumbnail || result.image?.thumbnailUrl,
            relevanceScore: result.relevanceScore,
            publishDate: result.publishDate,
            author: result.author,
            video: result.video ? {
              duration: result.video.duration,
              views: result.video.views,
              channelName: result.video.channelName
            } : undefined
          }));

          // استخراج الفيديوهات من المصادر
          const videos = sources
            .filter(s => s.source === 'youtube')
            .map(s => {
              const videoId = s.url.includes('v=') ? s.url.split('v=')[1].split('&')[0] : s.url.split('/').pop();
              return {
                id: videoId,
                title: s.title,
                url: s.url,
                thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
                channelName: s.video?.channelName || 'Unknown',
                duration: s.video?.duration || '',
                views: s.video?.views || ''
              };
            });

          return NextResponse.json({
            success: true,
            message: formattedMessage,
            model: 'multi-search',
            isSearchResult: true,
            sources,
            videos,
            searchMetadata: {
              query: userInput,
              sources: allSources.map(s => s.source),
              totalResults: allResults.length,
              searchTime: searchResponse.searchTime
            }
          });
        }

      } catch (error) {
        console.error('❌ خطأ في البحث:', error);
      }
    }

    // ============================================
    // 4️⃣ المسار العادي - AI Chat (محلي أولاً)
    // ============================================

    console.log('💬 مسار AI Chat عادي - استخدام Real API');

    const result = await sendToRealProvider(messages, selectedProvider, image);

    return NextResponse.json({
      ...result,
      classificationInfo: {
        type: classification.type,
        confidence: classification.confidence,
        reason: classification.reason
      },
      requestTime: Date.now() - requestStartTime
    });

  } catch (error: any) {
    console.error('❌ خطأ في معالجة الطلب:', error);

    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في معالجة الطلب',
      details: error.message
    }, { status: 500 });
  }
}

// ============================================
// 📝 دوال التنسيق
// ============================================

function formatReligiousSearchResults(searchResponse: any): string {
  const results = searchResponse.results.slice(0, 5);

  let message = `# 🕌 نتائج البحث الديني\n\n`;
  message += `تم العثور على ${results.length} مصادر موثوقة:\n\n`;

  results.forEach((result: any, index: number) => {
    message += `## ${index + 1}. ${result.title}\n\n`;
    message += `${result.snippet}\n\n`;
    message += `📎 [${result.url}](${result.url})\n`;
    message += `📚 المصدر: ${result.source}\n\n`;
    message += `---\n\n`;
  });

  return message;
}

function formatMultiSearchResults(multiResponse: any): string {
  let message = `# 🔍 نتائج البحث المتقدم\n\n`;

  // استخدام aggregatedResults من MultiSourceResponse
  const results = multiResponse.aggregatedResults || [];

  if (results.length === 0) {
    return `# 🔍 نتائج البحث\n\nلم يتم العثور على نتائج.`;
  }

  // عرض حسب المصدر
  const allSources = [multiResponse.primarySource, ...(multiResponse.additionalSources || [])];

  allSources.forEach((sourceData: any) => {
    if (sourceData && sourceData.results && sourceData.results.length > 0) {
      message += `## ${sourceData.icon} ${sourceData.sourceLabel}\n\n`;

      sourceData.results.slice(0, 3).forEach((result: any, index: number) => {
        message += `### ${index + 1}. ${result.title}\n`;
        if (result.snippet) {
          message += `${result.snippet}\n`;
        }
        message += `🔗 [المصدر](${result.url})\n\n`;
      });

      message += `---\n\n`;
    }
  });

  return message;
}

function formatSimpleSearchResults(searchResponse: any): string {
  const results = searchResponse.results.slice(0, 5);

  let message = `# 🔍 نتائج البحث\n\n`;

  results.forEach((result: any, index: number) => {
    message += `## ${index + 1}. ${result.title}\n\n`;
    message += `${result.snippet}\n\n`;
    message += `🔗 [${result.url}](${result.url})\n\n`;
  });

  return message;
}
