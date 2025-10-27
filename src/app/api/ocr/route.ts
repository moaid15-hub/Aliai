import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();
    
    if (!image) {
      return NextResponse.json(
        { success: false, error: 'لم يتم توفير صورة' },
        { status: 400 }
      );
    }

    // محاكاة OCR (يمكن استبدالها بـ Tesseract.js لاحقاً)
    const mockOCRResult = {
      success: true,
      extractedText: 'هذا نص تجريبي من OCR. يمكن استبدال هذه الدالة بـ Tesseract.js للتعرف الحقيقي على النصوص.',
      confidence: 0.85,
      processingTime: 1200
    };

    return NextResponse.json(mockOCRResult);

  } catch (error) {
    console.error('OCR API Error:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في معالجة OCR' },
      { status: 500 }
    );
  }
}


