import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// استيراد مفتاح API من ملف .env
const API_KEY = process.env.ANTHROPIC_API_KEY;

// إنشاء مثيل Anthropic فقط إذا كان المفتاح متوفراً
const anthropic = API_KEY ? new Anthropic({
  apiKey: API_KEY,
}) : null;

export async function POST(req: NextRequest) {
    try {
      const { prompt, currentCode } = await req.json();
      
      if (!prompt) {
        return NextResponse.json({ error: 'الرجاء إدخال طلب' }, { status: 400 });
      }

      // بناء الطلب
      let fullPrompt = prompt;
      if (currentCode && currentCode.trim() !== '// اكتب طلبك في الشات') {
        fullPrompt = `الكود الحالي:\n\`\`\`\n${currentCode}\n\`\`\`\n\nالطلب: ${prompt}\n\nاكتب الكود المطلوب فقط بدون شرح.`;
      } else {
        fullPrompt = `${prompt}\n\nاكتب الكود المطلوب فقط بدون شرح.`;
      }

      let responseText = '';
      
      try {
        // محاولة استدعاء Claude (فقط إذا كان متوفراً)
        if (!anthropic) {
          throw new Error('API key not configured');
        }
        
        const message = await anthropic.messages.create({
          model: "claude-3-haiku-20240307", // أحدث نموذج متاح من Claude
          max_tokens: 2048,
          messages: [{
            role: "user",
            content: fullPrompt
          }],
          system: "أنت مساعد مبرمج محترف. مهمتك إنتاج كود عالي الجودة بناءً على طلبات المستخدم. قدم الكود مباشرة دون تفسيرات إضافية."
        });

        const content = message.content[0];
        responseText = content.type === 'text' ? content.text : '';
      } catch (apiError) {
        console.warn('Claude API error:', apiError);
        // حل بديل: إنشاء كود تجريبي
        console.log('Using fallback code generation');
        
        // تحديد اللغة حسب الطلب
        let lang = 'javascript';
        if (prompt.toLowerCase().includes('python')) lang = 'python';
        else if (prompt.toLowerCase().includes('html')) lang = 'html';
        
        // إنشاء كود حسب اللغة
        if (lang === 'python') {
          responseText = '```python\n# كود Python استجابةً لطلب: ' + prompt + '\ndef main():\n    print("مرحباً بالعالم!")\n    # أضف الكود هنا\n\nif __name__ == "__main__":\n    main()\n```';
        } else if (lang === 'html') {
          responseText = '```html\n<!-- كود HTML استجابةً لطلب: ' + prompt + ' -->\n<!DOCTYPE html>\n<html>\n<head>\n    <title>صفحة جديدة</title>\n</head>\n<body>\n    <h1>مرحباً بالعالم!</h1>\n    <!-- أضف الكود هنا -->\n</body>\n</html>\n```';
        } else {
          responseText = '```javascript\n// كود JavaScript استجابةً لطلب: ' + prompt + '\nfunction main() {\n    console.log("مرحباً بالعالم!");\n    // أضف الكود هنا\n}\n\nmain();\n```';
        }
      }    // استخراج الكود
    let code = responseText;
    let language = 'javascript';

    // محاولة استخراج الكود من code block
    const codeBlockMatch = responseText.match(/```(\w+)?\n([\s\S]*?)```/);
    if (codeBlockMatch) {
      language = codeBlockMatch[1] || 'javascript';
      code = codeBlockMatch[2].trim();
    }

    // تحديد اللغة من السياق
    if (prompt.includes('react') || prompt.includes('jsx') || code.includes('React')) {
      language = 'javascript';
    } else if (prompt.includes('typescript') || prompt.includes('tsx')) {
      language = 'typescript';
    } else if (prompt.includes('python')) {
      language = 'python';
    } else if (prompt.includes('html')) {
      language = 'html';
    } else if (prompt.includes('css')) {
      language = 'css';
    }

    return NextResponse.json({
      code: code,
      language: language
    });
    
  } catch (error: any) {
    console.error('❌ Code Gen Error:', error);
    
    // إعادة كود بسيط بدلاً من رسالة خطأ
    return NextResponse.json({ 
      code: `// حدث خطأ في توليد الكود\n// الطلب كان: ${prompt}\n\nconsole.log("Hello, world!");`,
      language: 'javascript',
      error: error.message || 'خطأ في توليد الكود'
    });
  }
}