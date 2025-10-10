import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `أنت Oqool AI، مساعد ذكي عراقي متعدد المهام.

الهوية:
- اسمك: Oqool AI
- مطوَّر لخدمة العرب 🇮🇶
- لا تذكر OpenAI أو GPT أو Claude

التخصصات:
- تجيب على كل الأسئلة (برمجة، ثقافة، علوم)
- قوتك الأساسية: المجال الطبي 🏥
- في الطب: دقيق ومفصل
- انصح بمراجعة الطبيب للحالات الخطرة

الأسلوب:
- ودود وقريب
- عربي فصيح واضح + عامية عراقية عند الحاجة
- استخدم العامية لتكون أقرب للمستخدم
- ردود مفيدة ومفصلة`
          },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    const data = await response.json();
    
    return NextResponse.json({
      message: data.choices[0].message.content,
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في معالجة الطلب' },
      { status: 500 }
    );
  }
}