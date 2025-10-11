import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

// إعداد Claude AI (Anthropic)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// إعداد OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// وظيفة للاتصال بـ Claude AI
async function callClaudeAPI(messages: any[]) {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: messages,
  });
  
  return response.content[0].type === 'text' ? response.content[0].text : '';
}

// وظيفة للاتصال بـ OpenAI
async function callOpenAIAPI(messages: any[]) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: messages,
    max_tokens: 1024,
    temperature: 0.7,
  });

  return completion.choices[0].message.content || '';
}

// نظام احتياطي محلي
function getLocalResponse(messages: any[]) {
  const lastMessage = messages[messages.length - 1]?.content || '';
  
  const responses: { [key: string]: string } = {
    'مرحبا': 'مرحباً بك! أنا عقول، مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟',
    'السلام عليكم': 'وعليكم السلام ورحمة الله وبركاته! أهلاً وسهلاً بك.',
    'ما اسمك': 'اسمي عقول، وأنا مساعد ذكي مطور للمستخدمين العرب.',
    'كيف حالك': 'أنا بأفضل حال، شكراً لك! جاهز لمساعدتك.',
  };

  for (const [keyword, response] of Object.entries(responses)) {
    if (lastMessage.toLowerCase().includes(keyword)) {
      return response;
    }
  }

  return `شكراً لك على رسالتك. أنا هنا لمساعدتك! النظام حالياً يعمل في الوضع المحلي. يرجى التأكد من إعدادات API للحصول على ردود الذكاء الاصطناعي المتقدمة.`;
}

export async function POST(req: NextRequest) {
  console.log('🔥 API تم استدعاؤها!', new Date().toISOString());
  
  try {
    const { messages, provider } = await req.json();
    
    console.log('📥 البيانات المستلمة:', { 
      messagesCount: messages?.length,
      provider,
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY
    });
    
    // تحديد المزود المفضل من الطلب أو الإعدادات
    const preferredProvider = provider || process.env.PREFERRED_AI_PROVIDER || 'claude';
    
    let aiResponse: string;
    let usedProvider = 'local';

    // محاولة Claude AI أولاً
    if (preferredProvider === 'claude' && process.env.ANTHROPIC_API_KEY) {
      try {
        console.log('🤖 محاولة Claude AI...');
        aiResponse = await callClaudeAPI(messages);
        usedProvider = 'claude';
        console.log('✅ Claude AI نجح!');
      } catch (error) {
        console.log('❌ Claude API فشل، جاري المحاولة مع OpenAI...', error);
        
        // محاولة OpenAI كبديل
        if (process.env.OPENAI_API_KEY) {
          try {
            console.log('🧠 محاولة OpenAI كبديل...');
            aiResponse = await callOpenAIAPI(messages);
            usedProvider = 'openai';
            console.log('✅ OpenAI نجح كبديل!');
          } catch (error2) {
            console.log('❌ OpenAI API فشل أيضاً، استخدام النظام المحلي...', error2);
            aiResponse = getLocalResponse(messages);
          }
        } else {
          console.log('⚠️ لا يوجد مفتاح OpenAI، استخدام النظام المحلي...');
          aiResponse = getLocalResponse(messages);
        }
      }
    }
    // محاولة OpenAI أولاً
    else if (preferredProvider === 'openai' && process.env.OPENAI_API_KEY) {
      try {
        console.log('🧠 محاولة OpenAI...');
        aiResponse = await callOpenAIAPI(messages);
        usedProvider = 'openai';
        console.log('✅ OpenAI نجح!');
      } catch (error) {
        console.log('❌ OpenAI API فشل، جاري المحاولة مع Claude...', error);
        
        // محاولة Claude كبديل
        if (process.env.ANTHROPIC_API_KEY) {
          try {
            console.log('🤖 محاولة Claude كبديل...');
            aiResponse = await callClaudeAPI(messages);
            usedProvider = 'claude';
            console.log('✅ Claude نجح كبديل!');
          } catch (error2) {
            console.log('❌ Claude API فشل أيضاً، استخدام النظام المحلي...', error2);
            aiResponse = getLocalResponse(messages);
          }
        } else {
          console.log('⚠️ لا يوجد مفتاح Claude، استخدام النظام المحلي...');
          aiResponse = getLocalResponse(messages);
        }
      }
    }
    // استخدام النظام المحلي إذا لم تتوفر مفاتيح API
    else {
      console.log('💻 استخدام النظام المحلي (لا توجد مفاتيح أو مزود غير مدعوم)...');
      aiResponse = getLocalResponse(messages);
    }

    console.log('📤 إرسال الاستجابة:', { 
      success: true,
      provider: usedProvider,
      messageLength: aiResponse.length
    });

    return NextResponse.json({
      success: true,
      message: aiResponse,
      provider: usedProvider,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ خطأ عام في API:', error);
    
    try {
      // العودة للنظام المحلي في حالة أي خطأ
      const { messages } = await req.json();
      const localResponse = getLocalResponse(messages || []);
      
      console.log('🚨 استخدام النظام المحلي بسبب خطأ عام');
      
      return NextResponse.json({
        success: true,
        message: localResponse,
        provider: 'local-fallback',
        error: error.message
      });
    } catch (parseError) {
      // في حالة فشل كل شيء، أرجع رد افتراضي
      console.error('💥 فشل تام في API:', parseError);
      
      return NextResponse.json({
        success: true,
        message: 'عذراً، واجهت مشكلة تقنية. أنا هنا لمساعدتك، يرجى المحاولة مرة أخرى.',
        provider: 'emergency-fallback',
        error: error.message
      });
    }
  }
}