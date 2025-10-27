// خدمة OCR - استخراج النص من الصور

/**
 * معالجة الصورة باستخدام OCR (Optical Character Recognition)
 * - أسرع من AI Vision
 * - أرخص
 * - مناسب للنصوص الواضحة فقط
 */
export async function processWithOCR(imageFile: File): Promise<string> {
  try {
    // تحويل الصورة إلى Base64
    const base64Image = await fileToBase64(imageFile);

    // هنا يمكن استخدام مكتبة OCR مثل Tesseract.js
    // أو استدعاء API خارجي للـ OCR
    
    // TODO: دمج مع Tesseract.js أو Google Vision OCR أو AWS Textract
    const response = await fetch('/api/ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        language: 'ara+eng', // دعم العربية والإنجليزية
      }),
    });

    if (!response.ok) {
      throw new Error('فشل استخراج النص من الصورة');
    }

    const data = await response.json();
    return data.text || '';

  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('فشل معالجة الصورة بـ OCR');
  }
}

/**
 * تحويل ملف الصورة إلى Base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      resolve(base64String.split(',')[1]); // إزالة البادئة
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * معاينة جودة النص المستخرج
 */
export function assessOCRQuality(text: string): {
  quality: 'high' | 'medium' | 'low';
  confidence: number;
} {
  // معايير تقييم الجودة:
  // - طول النص
  // - وجود أحرف غريبة أو رموز غير مفهومة
  // - نسبة الأحرف الصحيحة

  if (!text || text.length < 5) {
    return { quality: 'low', confidence: 0 };
  }

  // نسبة الأحرف الصالحة
  const validCharsRatio = calculateValidCharsRatio(text);

  if (validCharsRatio > 0.9) {
    return { quality: 'high', confidence: 0.9 };
  } else if (validCharsRatio > 0.7) {
    return { quality: 'medium', confidence: 0.7 };
  } else {
    return { quality: 'low', confidence: 0.5 };
  }
}

function calculateValidCharsRatio(text: string): number {
  // حساب نسبة الأحرف الصالحة (حروف، أرقام، مسافات، علامات ترقيم)
  const validCharsPattern = /[a-zA-Z0-9\u0600-\u06FF\s.,;:!?()-]/g;
  const validChars = text.match(validCharsPattern) || [];
  return validChars.length / text.length;
}


