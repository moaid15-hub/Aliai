// ============================================
// 🎯 Route.ts المحدث - يستخدم نظام البحث الجديد المنظم
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { selectOptimalProvider, selectModelByMessageCount } from '../../chat/ai-selector';
import { getProviderName, formatMessageWithSignature, determineQuestionType } from '../../chat/brand-config';
import { getSystemPrompt } from '../../chat/system-prompt';

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

async function sendToRealProvider(messages: any[], provider: string) {
  const EXTERNAL_API_URL = 'https://m6a2nksc08.execute-api.eu-west-1.amazonaws.com/chat';

  try {
    console.log(`🚀 Connecting to ${provider}...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(EXTERNAL_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, provider }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Provider API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.message) {
      console.log(`✅ Success from ${provider}`);
      const lastMessage = messages[messages.length - 1]?.content || '';
      const questionType = determineQuestionType(lastMessage, provider);

      return {
        success: true,
        message: formatMessageWithSignature(data.message, questionType),
        model: data.model || getModelName(provider, messages.length),
        selectedProvider: provider,
        isExternalAPI: true
      };
    }

    throw new Error(data.error || 'Invalid response');

  } catch (error) {
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
    const { messages, provider } = body;

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
    // 🔒 فحص صلاحيات الاشتراك
    // ============================================

    console.log('🔒 فحص صلاحيات الاشتراك...');
    const subscriptionCheck = await checkSubscriptionPermissions(userId, userInput);

    if (!subscriptionCheck.allowed) {
      console.log('❌ تم رفض الطلب: ' + subscriptionCheck.error);

      return NextResponse.json({
        success: false,
        error: subscriptionCheck.error,
        errorType: 'subscription_limit',
        upgradeRequired: subscriptionCheck.upgradeRequired,
        currentPlan: subscriptionCheck.currentPlan,
        suggestedPlan: subscriptionCheck.suggestedPlan,
        subscriptionInfo: subscriptionCheck.subscription ? {
          planId: subscriptionCheck.subscription.planId,
          usage: subscriptionCheck.subscription.usage,
          limits: subscriptionChecker.getCurrentLimits(subscriptionCheck.subscription)
        } : null
      }, { status: 402 });
    }

    console.log('✅ صلاحيات الاشتراك مؤكدة');

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

          return NextResponse.json({
            success: true,
            message: formattedMessage,
            model: 'enhanced-multi-source',
            isSearchResult: true,
            isEnhancedSearch: true,
            sources,
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

          return NextResponse.json({
            success: true,
            message: formattedMessage,
            model: 'multi-search',
            isSearchResult: true,
            sources,
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
    // 4️⃣ المسار العادي - AI Chat
    // ============================================

    console.log('💬 مسار AI Chat عادي');

    const result = await sendToRealProvider(messages, selectedProvider);

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
