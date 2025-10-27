// ============================================
// 🎨 Photo Restoration API using Replicate
// API ترميم الصور باستخدام Replicate
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

export async function POST(request: NextRequest) {
  try {
    console.log('🎨 Starting photo restoration...');

    const body = await request.json();
    const { imageUrl, action = 'restore' } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'URL الصورة مطلوب' },
        { status: 400 }
      );
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { success: false, error: 'Replicate API token غير متوفر' },
        { status: 500 }
      );
    }

    console.log(`📸 Image URL: ${imageUrl}`);
    console.log(`⚙️ Action: ${action}`);

    let output;
    let modelUsed;

    if (action === 'restore') {
      // ============================================
      // 🔧 Restore Old/Damaged Photos
      // ترميم الصور القديمة/التالفة
      // ============================================
      console.log('🔧 Using CodeFormer for face restoration...');
      modelUsed = 'sczhou/codeformer';

      output = await replicate.run(
        "sczhou/codeformer:7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56",
        {
          input: {
            image: imageUrl,
            codeformer_fidelity: 0.5,
            background_enhance: true,
            face_upsample: true,
            upscale: 2,
          }
        }
      );

    } else if (action === 'upscale') {
      // ============================================
      // 📈 Upscale/Enhance Images
      // تكبير وتحسين الصور
      // ============================================
      console.log('📈 Using Real-ESRGAN for upscaling...');
      modelUsed = 'nightmareai/real-esrgan';

      output = await replicate.run(
        "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        {
          input: {
            image: imageUrl,
            scale: 4,
            face_enhance: true,
          }
        }
      );

    } else {
      return NextResponse.json(
        { success: false, error: 'نوع العملية غير صحيح' },
        { status: 400 }
      );
    }

    console.log('✅ Restoration completed!');
    console.log('📤 Output:', output);

    // Replicate يرجع URL للصورة المرممة
    const restoredImageUrl = Array.isArray(output) ? output[0] : output;

    return NextResponse.json({
      success: true,
      restoredImageUrl: restoredImageUrl,
      modelUsed: modelUsed,
      action: action,
      message: action === 'restore'
        ? 'تم ترميم الصورة بنجاح!'
        : 'تم تكبير الصورة بنجاح!'
    });

  } catch (error: any) {
    console.error('❌ Restoration Error:', error);

    // تفاصيل الخطأ
    let errorMessage = 'حدث خطأ أثناء معالجة الصورة';

    if (error.message) {
      errorMessage = error.message;
    }

    if (error.response?.data) {
      console.error('API Error Details:', error.response.data);
      errorMessage = error.response.data.detail || errorMessage;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// GET method لعرض معلومات API
export async function GET() {
  return NextResponse.json({
    service: 'Photo Restoration API',
    provider: 'Replicate',
    models: {
      restore: {
        name: 'CodeFormer',
        description: 'ترميم الصور القديمة وتحسين الوجوه',
        features: ['face restoration', 'background enhancement', 'face upsampling']
      },
      upscale: {
        name: 'Real-ESRGAN',
        description: 'تكبير الصور وتحسين الجودة',
        features: ['4x upscaling', 'face enhancement', 'detail preservation']
      }
    },
    usage: {
      method: 'POST',
      body: {
        imageUrl: 'string (required)',
        action: '"restore" | "upscale" (default: "restore")'
      }
    },
    status: process.env.REPLICATE_API_TOKEN ? 'active' : 'inactive (missing API key)'
  });
}
