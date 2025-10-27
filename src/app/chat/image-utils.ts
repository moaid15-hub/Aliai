// ===================================
// دوال مساعدة للتعامل مع الصور
// ===================================

/**
 * تحويل ملف صورة إلى Base64
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * تحويل عدة ملفات صور إلى Base64
 */
export async function filesToBase64(files: File[]): Promise<string[]> {
  return Promise.all(files.map(file => fileToBase64(file)));
}

/**
 * التحقق من نوع الملف (صورة أم لا)
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * الحصول على أبعاد الصورة
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * ضغط الصورة (للـ AI Vision)
 */
export async function compressImage(file: File, maxWidth: number = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('لا يمكن إنشاء canvas context'));
        return;
      }

      // حساب الأبعاد الجديدة
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // رسم الصورة المضغوطة
      ctx.drawImage(img, 0, 0, width, height);
      
      // تحويل إلى base64
      const base64 = canvas.toDataURL('image/jpeg', 0.8);
      resolve(base64);
      
      URL.revokeObjectURL(img.src);
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * تطبيق فلتر على الصورة
 */
export async function applyFilter(
  file: File, 
  filter: 'grayscale' | 'sepia' | 'blur' | 'brightness' | 'contrast'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('لا يمكن إنشاء canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      // تطبيق الفلتر
      ctx.filter = {
        grayscale: 'grayscale(100%)',
        sepia: 'sepia(100%)',
        blur: 'blur(5px)',
        brightness: 'brightness(150%)',
        contrast: 'contrast(150%)'
      }[filter];

      ctx.drawImage(img, 0, 0);
      
      const base64 = canvas.toDataURL('image/png');
      resolve(base64);
      
      URL.revokeObjectURL(img.src);
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * استخراج النص من الصورة باستخدام OCR (Tesseract.js)
 */
export async function extractTextFromImage(file: File): Promise<string> {
  try {
    // سنحتاج Tesseract.js لهذا
    // TODO: تثبيت tesseract.js: npm install tesseract.js
    
    // حالياً نرجع رسالة placeholder
    return 'ميزة OCR ستكون متاحة قريباً! 🔜';
    
    /*
    // الكود الفعلي بعد تثبيت tesseract.js:
    const Tesseract = await import('tesseract.js');
    const { data: { text } } = await Tesseract.recognize(
      file,
      'ara+eng', // دعم العربية والإنجليزية
      {
        logger: m => console.log(m)
      }
    );
    return text;
    */
  } catch (error) {
    console.error('خطأ في استخراج النص:', error);
    return 'فشل استخراج النص من الصورة';
  }
}

