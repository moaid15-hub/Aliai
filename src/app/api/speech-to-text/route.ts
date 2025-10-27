/**
 * Speech-to-Text API
 * تحويل الصوت إلى نص باستخدام OpenAI Whisper
 */

import { NextRequest, NextResponse } from 'next/server';
import { correctWhisperMistakes } from '@/lib/text-corrector';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    console.log('🎤 بداية تحويل الصوت إلى نص...');

    // قراءة الصوت من الطلب
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: 'لم يتم إرسال ملف صوتي' },
        { status: 400 }
      );
    }

    console.log('📁 الملف المستلم:', audioFile.name, audioFile.size, 'bytes');

    // التحقق من وجود API Key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY غير موجود');
      return NextResponse.json(
        { success: false, error: 'OPENAI_API_KEY غير موجود في البيئة' },
        { status: 500 }
      );
    }

    // إرسال إلى OpenAI Whisper
    const whisperFormData = new FormData();
    whisperFormData.append('file', audioFile);
    whisperFormData.append('model', 'whisper-1');
    whisperFormData.append('language', 'ar'); // اللغة العربية

    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: whisperFormData,
    });

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      console.error('❌ خطأ من OpenAI Whisper:', errorText);
      return NextResponse.json(
        { success: false, error: `فشل Whisper: ${whisperResponse.status}` },
        { status: whisperResponse.status }
      );
    }

    const result = await whisperResponse.json();
    console.log('✅ النص المستخرج:', result.text);

    const correctedText = correctWhisperMistakes(result.text);

    return NextResponse.json({
      success: true,
      text: correctedText,
    });

  } catch (error: any) {
    console.error('❌ خطأ في Speech-to-Text:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'حدث خطأ في تحويل الصوت إلى نص'
      },
      { status: 500 }
    );
  }
}
