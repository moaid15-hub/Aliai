import { NextRequest } from "next/server";
import OpenAI from "openai";
import { selectOptimalProvider } from '../../chat/ai-selector';
import { getSystemPrompt } from '../../chat/system-prompt';

export const runtime = "nodejs";

// 🚀 دالة OpenAI السريعة مع Streaming
async function streamOpenAI(messages: any[], query: string) {
  const client = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY!,
    // إعدادات محسّنة للسرعة
    timeout: 30000,
    maxRetries: 2,
  });

  // إعداد Schema محسّن للاستجابات العربية
  const schema = {
    type: "object",
    properties: {
      content: { type: "string", description: "المحتوى الرئيسي للاستجابة بالعربية" },
      confidence: { type: "number", description: "مستوى الثقة في الإجابة من 0 إلى 1" },
      language: { type: "string", enum: ["ar", "en"], description: "لغة الاستجابة" }
    },
    required: ["content", "confidence", "language"],
    additionalProperties: false
  };

  // إضافة System Prompt
  const systemPrompt = getSystemPrompt();
  const fullMessages = [
    { role: 'system', content: systemPrompt },
    ...messages
  ];

  // بدء الـ Streaming مع إعدادات محسّنة
  const stream = await client.chat.completions.create({
    model: "gpt-4o-mini", // أسرع وأرخص من gpt-4
    messages: fullMessages,
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 2000,
    stream: true,
    // response_format: { 
    //   type: "json_schema", 
    //   json_schema: { 
    //     name: "OqoolResponse", 
    //     schema, 
    //     strict: false // مرونة أكثر للاستجابات العربية
    //   } 
    // }
  });

  return stream;
}

// 🎯 GET Route للاختبار السريع
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "مرحباً! كيف يمكنني مساعدتك اليوم؟";
  
  const messages = [{ role: "user", content: q }];
  
  try {
    const stream = await streamOpenAI(messages, q);
    
    const encoder = new TextEncoder();
    const body = new ReadableStream({
      start(controller) {
        (async () => {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
              }
            }
            controller.enqueue(encoder.encode(`event: done\ndata: {"status": "completed"}\n\n`));
            controller.close();
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
            controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: errorMessage })}\n\n`));
            controller.close();
          }
        })();
      }
    });
    
    return new Response(body, { 
      headers: { 
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      } 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// 🎯 POST Route للدردشة مع النظام الذكي
export async function POST(req: NextRequest) {
  try {
    const { messages, provider: requestedProvider } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'رسائل غير صحيحة' 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // اختيار المزود الذكي أو استخدام المطلوب
    const lastMessage = messages[messages.length - 1];
    const userInput = lastMessage?.content || '';
    const selectedProvider = requestedProvider || selectOptimalProvider(userInput);
    
    // إذا كان المزود المختار OpenAI، استخدم الـ Streaming السريع
    if (selectedProvider === 'openai') {
      const stream = await streamOpenAI(messages, userInput);
      
      const encoder = new TextEncoder();
      const body = new ReadableStream({
        start(controller) {
          let fullContent = '';
          (async () => {
            try {
              for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                  fullContent += content;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                    content,
                    provider: 'openai',
                    streaming: true 
                  })}\n\n`));
                }
              }
              controller.enqueue(encoder.encode(`event: done\ndata: ${JSON.stringify({ 
                status: "completed",
                fullContent,
                provider: 'openai',
                model: 'gpt-4o-mini'
              })}\n\n`));
              controller.close();
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
              controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ 
                error: errorMessage,
                provider: 'openai'
              })}\n\n`));
              controller.close();
            }
          })();
        }
      });
      
      return new Response(body, { 
        headers: { 
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        } 
      });
    }
    
    // للمزودين الآخرين، استخدم النظام الحالي
    return new Response(JSON.stringify({
      success: false,
      error: 'يدعم هذا الـ Route فقط OpenAI مع الـ Streaming. استخدم /api/chat للمزودين الآخرين.'
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error('Fast AI API Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'حدث خطأ داخلي في الخادم'
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}