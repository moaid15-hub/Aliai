/**
 * Text-to-Speech API
 * تحويل النص إلى صوت باستخدام OpenAI TTS
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    console.log('🔊 بداية تحويل النص إلى صوت...');

    const { text, voice = 'alloy' } = await request.json();

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'لم يتم إرسال نص' },
        { status: 400 }
      );
    }

    console.log('📝 النص المطلوب:', text);
    console.log('🎙️ الصوت المختار:', voice);

    // التحقق من وجود API Key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY غير موجود');
      return NextResponse.json(
        { success: false, error: 'OPENAI_API_KEY غير موجود في البيئة' },
        { status: 500 }
      );
    }

    // إرسال إلى OpenAI TTS
    const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1-hd', // نموذج عالي الجودة
        input: text,
        voice: voice, // alloy, echo, fable, onyx, nova, shimmer
        response_format: 'mp3',
        speed: 1.0,
      }),
    });

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error('❌ خطأ من OpenAI TTS:', errorText);
      return NextResponse.json(
        { success: false, error: `فشل TTS: ${ttsResponse.status}` },
        { status: ttsResponse.status }
      );
    }

    // الحصول على الصوت كـ ArrayBuffer
    const audioBuffer = await ttsResponse.arrayBuffer();
    console.log('✅ تم إنشاء الصوت:', audioBuffer.byteLength, 'bytes');

    // إرجاع الصوت مباشرة
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });

  } catch (error: any) {
    console.error('❌ خطأ في Text-to-Speech:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'حدث خطأ في تحويل النص إلى صوت'
      },
      { status: 500 }
    );
  }
}
