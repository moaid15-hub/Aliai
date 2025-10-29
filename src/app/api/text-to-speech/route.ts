/**
 * Text-to-Speech API
 * تحويل النص إلى صوت باستخدام OpenAI TTS
 * مع نظام كاش ذكي يستخدم Semantic Similarity
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const maxDuration = 60;

// مجلد الكاش
const CACHE_DIR = path.join(process.cwd(), '.cache', 'audio');
const METADATA_FILE = path.join(CACHE_DIR, 'metadata.json');

// نسبة التشابه المطلوبة (90% أو أكثر)
const SIMILARITY_THRESHOLD = 0.90;

// Interface للـ metadata
interface CacheMetadata {
  [key: string]: {
    text: string;
    voice: string;
    embedding: number[];
    timestamp: number;
  };
}

// إنشاء hash للنص (cache key)
function getCacheKey(text: string, voice: string, speed: number = 1.0): string {
  const hash = createHash('md5').update(`${text}-${voice}-${speed}`).digest('hex');
  return hash;
}

// حساب Cosine Similarity بين نصين
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// الحصول على embedding للنص
async function getEmbedding(text: string, apiKey: string): Promise<number[]> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small', // نموذج رخيص وسريع
        input: text.substring(0, 500), // أول 500 حرف فقط
      }),
    });

    if (!response.ok) {
      console.error('Embedding API failed');
      return [];
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error getting embedding:', error);
    return [];
  }
}

// تحميل metadata
async function loadMetadata(): Promise<CacheMetadata> {
  try {
    const data = await fs.readFile(METADATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// حفظ metadata
async function saveMetadata(metadata: CacheMetadata): Promise<void> {
  try {
    await fs.writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2));
  } catch (error) {
    console.error('Error saving metadata:', error);
  }
}

// البحث عن أقرب نص في الكاش
async function findSimilarCache(
  text: string,
  voice: string,
  embedding: number[]
): Promise<string | null> {
  if (embedding.length === 0) return null;

  const metadata = await loadMetadata();
  let bestMatch: string | null = null;
  let bestSimilarity = 0;

  for (const [key, data] of Object.entries(metadata)) {
    if (data.voice !== voice) continue;
    if (data.embedding.length === 0) continue;

    const similarity = cosineSimilarity(embedding, data.embedding);

    if (similarity > bestSimilarity && similarity >= SIMILARITY_THRESHOLD) {
      bestSimilarity = similarity;
      bestMatch = key;
    }
  }

  if (bestMatch) {
    console.log(`🎯 وجدت تشابه: ${(bestSimilarity * 100).toFixed(1)}%`);
  }

  return bestMatch;
}

// التأكد من وجود مجلد الكاش
async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    console.error('خطأ في إنشاء مجلد الكاش:', error);
  }
}

// البحث في الكاش
async function getFromCache(key: string): Promise<Buffer | null> {
  try {
    const filePath = path.join(CACHE_DIR, `${key}.mp3`);
    const data = await fs.readFile(filePath);
    console.log('✅ تم العثور على الصوت في الكاش');
    return data;
  } catch (error) {
    return null;
  }
}

// حفظ في الكاش
async function saveToCache(key: string, data: Buffer): Promise<void> {
  try {
    const filePath = path.join(CACHE_DIR, `${key}.mp3`);
    await fs.writeFile(filePath, data);
    console.log('💾 تم حفظ الصوت في الكاش');
  } catch (error) {
    console.error('❌ خطأ في حفظ الصوت:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔊 بداية تحويل النص إلى صوت...');

    const { text, voice = 'alloy', speed = 1.0 } = await request.json();

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'لم يتم إرسال نص' },
        { status: 400 }
      );
    }

    console.log('📝 النص المطلوب:', text.substring(0, 50) + '...');
    console.log('🎙️ الصوت المختار:', voice);
    console.log('⚡ السرعة:', speed + 'x');

    // التأكد من وجود مجلد الكاش
    await ensureCacheDir();

    // التحقق من وجود API Key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY غير موجود');
      return NextResponse.json(
        { success: false, error: 'OPENAI_API_KEY غير موجود في البيئة' },
        { status: 500 }
      );
    }

    // 1. حساب embedding للنص الجديد
    console.log('🧮 حساب embedding للنص...');
    const embedding = await getEmbedding(text, apiKey);

    // 2. البحث عن نص مشابه في الكاش
    const similarKey = await findSimilarCache(text, voice, embedding);

    if (similarKey) {
      // وجدنا نص مشابه!
      const cachedAudio = await getFromCache(similarKey);
      if (cachedAudio) {
        console.log('⚡ إرجاع الصوت من الكاش (تشابه دلالي!)');
        return new NextResponse(cachedAudio, {
          status: 200,
          headers: {
            'Content-Type': 'audio/mpeg',
            'Content-Length': cachedAudio.length.toString(),
            'X-Cache': 'HIT-SIMILAR', // مطابقة بالتشابه
          },
        });
      }
    }

    // 3. لم نجد تشابه، نبحث عن مطابقة تامة
    const cacheKey = getCacheKey(text, voice, speed);
    const exactMatch = await getFromCache(cacheKey);
    if (exactMatch) {
      console.log('⚡ إرجاع الصوت من الكاش (مطابقة تامة!)');
      return new NextResponse(exactMatch, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': exactMatch.length.toString(),
          'X-Cache': 'HIT-EXACT',
        },
      });
    }

    console.log('🌐 لم يوجد تشابه - استدعاء OpenAI TTS...');

    // إرسال إلى OpenAI TTS - نموذج سريع
    const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1', // النموذج السريع - أسرع من HD ب 50%
        input: text,
        voice: voice || 'alloy', // alloy أفضل صوت للعربية
        response_format: 'mp3',
        speed: Math.max(0.25, Math.min(4.0, speed)), // من 0.25x إلى 4.0x
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
    const audioData = Buffer.from(audioBuffer);
    console.log('✅ تم إنشاء الصوت:', audioData.length, 'bytes');

    // حفظ في الكاش للمرات القادمة
    await saveToCache(cacheKey, audioData);

    // حفظ metadata مع embedding
    const metadata = await loadMetadata();
    metadata[cacheKey] = {
      text,
      voice,
      embedding,
      timestamp: Date.now(),
    };
    await saveMetadata(metadata);
    console.log('💾 تم حفظ الصوت + embedding في الكاش');

    // إرجاع الصوت
    return new NextResponse(audioData, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioData.length.toString(),
        'X-Cache': 'MISS', // مؤشر أن الصوت جديد
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
