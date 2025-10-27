// خدمة AI Vision - تحليل الصور باستخدام Claude/GPT-4

interface VisionAnalysis {
  description: string;
  detectedObjects?: string[];
  isMath?: boolean;
  isDiagram?: boolean;
  confidence: number;
}

/**
 * معالجة الصورة باستخدام AI Vision (Claude/GPT-4)
 * - يشوف الصورة كاملة
 * - يفهم الرسومات والمخططات
 * - يقرأ الخط حتى لو مو واضح
 * - الأفضل للرياضيات والرسومات
 */
export async function processWithAIVision(imageFile: File): Promise<VisionAnalysis> {
  try {
    // تحويل الصورة إلى Base64
    const base64Image = await fileToBase64(imageFile);

    // استدعاء Claude أو GPT-4 Vision API
    // يمكن استخدام Claude-3 Sonnet أو GPT-4 Vision
    
    const response = await fetch('/api/vision', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        prompt: buildVisionPrompt(),
      }),
    });

    if (!response.ok) {
      throw new Error('فشل تحليل الصورة بـ AI Vision');
    }

    const data = await response.json();
    
    return parseVisionResponse(data);

  } catch (error) {
    console.error('AI Vision Error:', error);
    throw new Error('فشل معالجة الصورة بـ AI Vision');
  }
}

/**
 * بناء prompt مخصص لتحليل الصورة
 */
function buildVisionPrompt(): string {
  return `
قم بتحليل هذه الصورة بعناية:

1. استخرج أي نص موجود في الصورة (عربي أو إنجليزي)
2. إذا كانت تحتوي على معادلات رياضية، اشرحها
3. إذا كانت رسماً تخطيطياً، صفه بالتفصيل
4. حدد الكائنات والعناصر الرئيسية
5. قدم ملخصاً شاملاً للمحتوى

قدم الإجابة بصيغة JSON:
{
  "text": "النص المستخرج",
  "isMath": true/false,
  "isDiagram": true/false,
  "objects": ["object1", "object2"],
  "description": "وصف شامل",
  "confidence": 0.0-1.0
}
`.trim();
}

/**
 * تحليل استجابة AI Vision
 */
function parseVisionResponse(data: any): VisionAnalysis {
  try {
    // محاولة تحليل JSON إذا كانت الاستجابة بصيغة JSON
    const parsed = typeof data.content === 'string' 
      ? JSON.parse(data.content) 
      : data.content;

    return {
      description: parsed.text || parsed.description || '',
      detectedObjects: parsed.objects || [],
      isMath: parsed.isMath || false,
      isDiagram: parsed.isDiagram || false,
      confidence: parsed.confidence || 0.85,
    };
  } catch (_error) {
    // إذا فشل التحليل، نستخدم النص مباشرة
    return {
      description: typeof data === 'string' ? data : JSON.stringify(data),
      confidence: 0.7,
    };
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
      resolve(base64String.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * اكتشاف نوع المحتوى في الصورة
 */
export function detectContentType(analysis: VisionAnalysis): 'text' | 'math' | 'diagram' | 'mixed' {
  if (analysis.isMath) return 'math';
  if (analysis.isDiagram) return 'diagram';
  if (analysis.detectedObjects && analysis.detectedObjects.length > 3) return 'mixed';
  return 'text';
}


