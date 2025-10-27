// @ts-nocheck
/**
 * محلل الصور الذكي - Smart Image Analyzer
 * 
 * يحلل الصورة المرفوعة ويحدد:
 * - نوع المحتوى (نص مطبوع، خط يدوي، رسومات، معادلات)
 * - جودة الصورة ووضوحها
 * - اللغة المتوقعة
 * - تعقيد المحتوى
 * - الاستراتيجية المقترحة للمعالجة
 * 
 * @module image-analyzer
 * @path src/services/image-processing/image-analyzer.ts
 */

import {
  ImageAnalysisResult,
  ContentType,
  ImageQuality,
  ProcessingComplexity,
  ImageMetadata,
  ContentCharacteristics,
  QualityMetrics,
  LanguageInfo
} from '../../types/image-processing.types';

import {
  IMAGE_PROCESSING_CONFIG,
  CONTENT_TYPE_THRESHOLDS,
  QUALITY_THRESHOLDS
} from '../../config/image-processing-config';

// ============================================
// 1. الواجهات المحلية - Local Interfaces
// ============================================

interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

interface ColorAnalysis {
  dominantColors: string[];
  hasBackground: boolean;
  isGrayscale: boolean;
  colorComplexity: 'simple' | 'moderate' | 'complex';
}

interface TextDetectionHints {
  hasArabicScript: boolean;
  hasEnglishScript: boolean;
  hasNumbers: boolean;
  hasMathSymbols: boolean;
  textDensity: number;
}

interface ComplexityIndicators {
  structuralComplexity: number;
  visualNoise: number;
  layoutComplexity: number;
  contentDiversity: number;
}

// ============================================
// 2. فئة محلل الصور - ImageAnalyzer Class
// ============================================

export class ImageAnalyzer {
  private config = IMAGE_PROCESSING_CONFIG;
  
  /**
   * تحليل صورة كاملة
   */
  async analyzeImage(
    imageData: string | Blob | File,
    options?: {
      skipMetadata?: boolean;
      quickAnalysis?: boolean;
    }
  ): Promise<ImageAnalysisResult> {
    
    const startTime = Date.now();
    
    try {
      // 1. تحويل الصورة إلى format موحد
      const imageBlob = await this.normalizeImageInput(imageData);
      
      // 2. استخراج المعلومات الأساسية
      const metadata = options?.skipMetadata 
        ? this.createDefaultMetadata()
        : await this.extractMetadata(imageBlob);
      
      // 3. تحليل الأبعاد
      const dimensions = await this.analyzeDimensions(imageBlob);
      
      // 4. تحليل الألوان
      const colorAnalysis = await this.analyzeColors(imageBlob);
      
      // 5. كشف نوع المحتوى
      const contentType = await this.detectContentType(
        imageBlob, 
        colorAnalysis,
        options?.quickAnalysis
      );
      
      // 6. تقييم جودة الصورة
      const quality = await this.assessQuality(
        imageBlob,
        dimensions,
        colorAnalysis
      );
      
      // 7. كشف اللغة
      const language = await this.detectLanguage(imageBlob, contentType);
      
      // 8. تحليل التعقيد
      const complexity = await this.analyzeComplexity(
        contentType,
        quality,
        dimensions
      );
      
      // 9. تحديد الخصائص
      const characteristics = this.determineCharacteristics(
        contentType,
        quality,
        colorAnalysis,
        language
      );
      
      // 10. اقتراح الاستراتيجية
      const suggestedStrategy = this.suggestProcessingStrategy(
        contentType,
        quality,
        complexity,
        characteristics
      );
      
      const analysisTime = Date.now() - startTime;
      
      return {
        contentType,
        quality,
        complexity,
        language,
        metadata,
        characteristics,
        suggestedStrategy,
        confidence: this.calculateConfidence(contentType, quality, complexity),
        analysisTime,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      throw new Error(`Image analysis failed: ${error.message}`);
    }
  }
  
  // ============================================
  // 3. تحويل المدخلات - Input Normalization
  // ============================================
  
  /**
   * تحويل أي نوع مدخل إلى Blob
   */
  private async normalizeImageInput(
    input: string | Blob | File
  ): Promise<Blob> {
    
    if (input instanceof Blob || input instanceof File) {
      return input;
    }
    
    // Base64 string
    if (typeof input === 'string') {
      return this.base64ToBlob(input);
    }
    
    throw new Error('Unsupported image input format');
  }
  
  /**
   * تحويل Base64 إلى Blob
   */
  private base64ToBlob(base64: string): Blob {
    // إزالة data:image prefix إذا موجود
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
    
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'image/png' });
  }
  
  // ============================================
  // 4. استخراج Metadata
  // ============================================
  
  /**
   * استخراج معلومات الصورة الأساسية
   */
  private async extractMetadata(imageBlob: Blob): Promise<ImageMetadata> {
    return {
      size: imageBlob.size,
      format: this.detectImageFormat(imageBlob),
      dimensions: await this.getImageDimensions(imageBlob),
      createdAt: new Date().toISOString()
    };
  }
  
  /**
   * إنشاء metadata افتراضية
   */
  private createDefaultMetadata(): ImageMetadata {
    return {
      size: 0,
      format: 'unknown',
      dimensions: { width: 0, height: 0 },
      createdAt: new Date().toISOString()
    };
  }
  
  /**
   * كشف نوع الصورة
   */
  private detectImageFormat(blob: Blob): string {
    const type = blob.type;
    if (type.includes('jpeg') || type.includes('jpg')) return 'jpeg';
    if (type.includes('png')) return 'png';
    if (type.includes('webp')) return 'webp';
    if (type.includes('gif')) return 'gif';
    return 'unknown';
  }
  
  /**
   * الحصول على أبعاد الصورة
   */
  private async getImageDimensions(
    blob: Blob
  ): Promise<{ width: number; height: number }> {
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: img.width,
          height: img.height
        });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  }
  
  // ============================================
  // 5. تحليل الأبعاد - Dimensions Analysis
  // ============================================
  
  /**
   * تحليل أبعاد الصورة
   */
  private async analyzeDimensions(blob: Blob): Promise<ImageDimensions> {
    const { width, height } = await this.getImageDimensions(blob);
    
    return {
      width,
      height,
      aspectRatio: width / height
    };
  }
  
  // ============================================
  // 6. تحليل الألوان - Color Analysis
  // ============================================
  
  /**
   * تحليل الألوان في الصورة
   */
  private async analyzeColors(blob: Blob): Promise<ColorAnalysis> {
    // هذه دالة مبسطة - في الواقع نحتاج Canvas API
    // أو مكتبة معالجة صور
    
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve(this.getDefaultColorAnalysis());
          return;
        }
        
        canvas.width = Math.min(img.width, 100);
        canvas.height = Math.min(img.height, 100);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const analysis = this.processColorData(imageData);
        
        URL.revokeObjectURL(url);
        resolve(analysis);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(this.getDefaultColorAnalysis());
      };
      
      img.src = url;
    });
  }
  
  /**
   * معالجة بيانات الألوان
   */
  private processColorData(imageData: ImageData): ColorAnalysis {
    const data = imageData.data;
    let totalBrightness = 0;
    let colorVariance = 0;
    const colorMap = new Map<string, number>();
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // حساب السطوع
      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;
      
      // تجميع الألوان
      const colorKey = `${Math.floor(r/50)}-${Math.floor(g/50)}-${Math.floor(b/50)}`;
      colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
    }
    
    const pixelCount = data.length / 4;
    const avgBrightness = totalBrightness / pixelCount;
    
    // تحديد إذا كانت grayscale
    const isGrayscale = this.checkIfGrayscale(data);
    
    // تحديد تعقيد الألوان
    const uniqueColors = colorMap.size;
    let colorComplexity: 'simple' | 'moderate' | 'complex' = 'simple';
    
    if (uniqueColors > 20) colorComplexity = 'complex';
    else if (uniqueColors > 10) colorComplexity = 'moderate';
    
    return {
      dominantColors: Array.from(colorMap.keys()).slice(0, 3),
      hasBackground: avgBrightness > 200 || avgBrightness < 50,
      isGrayscale,
      colorComplexity
    };
  }
  
  /**
   * فحص إذا كانت الصورة grayscale
   */
  private checkIfGrayscale(data: Uint8ClampedArray): boolean {
    let grayCount = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      if (Math.abs(r - g) < 10 && Math.abs(g - b) < 10) {
        grayCount++;
      }
    }
    
    const totalPixels = data.length / 4;
    return (grayCount / totalPixels) > 0.9;
  }
  
  /**
   * تحليل ألوان افتراضي
   */
  private getDefaultColorAnalysis(): ColorAnalysis {
    return {
      dominantColors: [],
      hasBackground: true,
      isGrayscale: false,
      colorComplexity: 'moderate'
    };
  }
  
  // ============================================
  // 7. كشف نوع المحتوى - Content Type Detection
  // ============================================
  
  /**
   * كشف نوع المحتوى في الصورة
   */
  private async detectContentType(
    blob: Blob,
    colorAnalysis: ColorAnalysis,
    quickAnalysis?: boolean
  ): Promise<ContentType> {
    
    // في التطبيق الفعلي، نستخدم ML model أو Vision API
    // هنا نستخدم heuristics بسيطة
    
    const hints = await this.getContentHints(blob, colorAnalysis);
    
    // قواعد بسيطة للكشف
    if (hints.hasMathSymbols && hints.hasNumbers) {
      return 'math_equations';
    }
    
    if (hints.hasArabicScript && hints.textDensity > 0.3) {
      return hints.textDensity > 0.7 ? 'printed_text' : 'mixed_content';
    }
    
    if (colorAnalysis.isGrayscale && hints.textDensity > 0.5) {
      return 'printed_text';
    }
    
    if (!colorAnalysis.isGrayscale && hints.textDensity < 0.3) {
      return 'diagrams_charts';
    }
    
    if (hints.textDensity > 0.4) {
      return 'handwritten';
    }
    
    return 'mixed_content';
  }
  
  /**
   * الحصول على تلميحات المحتوى
   */
  private async getContentHints(
    blob: Blob,
    colorAnalysis: ColorAnalysis
  ): Promise<TextDetectionHints> {
    
    // تحليل مبسط - في الواقع نحتاج OCR خفيف
    return {
      hasArabicScript: true, // افتراض وجود عربي
      hasEnglishScript: false,
      hasNumbers: true,
      hasMathSymbols: false,
      textDensity: colorAnalysis.isGrayscale ? 0.6 : 0.4
    };
  }
  
  // ============================================
  // 8. تقييم الجودة - Quality Assessment
  // ============================================
  
  /**
   * تقييم جودة الصورة
   */
  private async assessQuality(
    blob: Blob,
    dimensions: ImageDimensions,
    colorAnalysis: ColorAnalysis
  ): Promise<ImageQuality> {
    
    const metrics = this.calculateQualityMetrics(
      blob.size,
      dimensions,
      colorAnalysis
    );
    
    return {
      overall: this.determineOverallQuality(metrics),
      resolution: this.assessResolution(dimensions),
      clarity: this.assessClarity(metrics),
      lighting: this.assessLighting(colorAnalysis),
      contrast: this.assessContrast(colorAnalysis),
      metrics
    };
  }
  
  /**
   * حساب مقاييس الجودة
   */
  private calculateQualityMetrics(
    fileSize: number,
    dimensions: ImageDimensions,
    colorAnalysis: ColorAnalysis
  ): QualityMetrics {
    
    const pixelCount = dimensions.width * dimensions.height;
    const bytesPerPixel = fileSize / pixelCount;
    
    return {
      resolution: pixelCount,
      dpi: Math.sqrt(pixelCount) / 8.5, // تقدير تقريبي
      sharpness: bytesPerPixel > 3 ? 0.8 : 0.5,
      noise: colorAnalysis.colorComplexity === 'complex' ? 0.3 : 0.1,
      brightness: colorAnalysis.hasBackground ? 0.7 : 0.5,
      contrast: colorAnalysis.isGrayscale ? 0.6 : 0.8
    };
  }
  
  /**
   * تحديد الجودة الإجمالية
   */
  private determineOverallQuality(metrics: QualityMetrics): 'excellent' | 'good' | 'acceptable' | 'poor' {
    const score = (
      metrics.sharpness * 0.3 +
      (1 - metrics.noise) * 0.3 +
      metrics.brightness * 0.2 +
      metrics.contrast * 0.2
    );
    
    if (score >= 0.8) return 'excellent';
    if (score >= 0.6) return 'good';
    if (score >= 0.4) return 'acceptable';
    return 'poor';
  }
  
  /**
   * تقييم الدقة
   */
  private assessResolution(dimensions: ImageDimensions): 'high' | 'medium' | 'low' {
    const pixelCount = dimensions.width * dimensions.height;
    
    if (pixelCount >= QUALITY_THRESHOLDS.resolution.high) return 'high';
    if (pixelCount >= QUALITY_THRESHOLDS.resolution.medium) return 'medium';
    return 'low';
  }
  
  /**
   * تقييم الوضوح
   */
  private assessClarity(metrics: QualityMetrics): 'sharp' | 'clear' | 'blurry' {
    if (metrics.sharpness >= 0.7) return 'sharp';
    if (metrics.sharpness >= 0.4) return 'clear';
    return 'blurry';
  }
  
  /**
   * تقييم الإضاءة
   */
  private assessLighting(colorAnalysis: ColorAnalysis): 'good' | 'acceptable' | 'poor' {
    if (colorAnalysis.hasBackground) return 'good';
    return 'acceptable';
  }
  
  /**
   * تقييم التباين
   */
  private assessContrast(colorAnalysis: ColorAnalysis): 'high' | 'medium' | 'low' {
    if (colorAnalysis.isGrayscale) return 'medium';
    if (colorAnalysis.colorComplexity === 'complex') return 'high';
    return 'medium';
  }
  
  // ============================================
  // 9. كشف اللغة - Language Detection
  // ============================================
  
  /**
   * كشف اللغة في الصورة
   */
  private async detectLanguage(
    blob: Blob,
    contentType: ContentType
  ): Promise<LanguageInfo> {
    
    // في التطبيق الفعلي نستخدم OCR أو ML model
    // هنا نفترض عربي كلغة أساسية
    
    return {
      primary: 'ar',
      secondary: contentType === 'math_equations' ? 'math' : undefined,
      confidence: 0.8,
      direction: 'rtl'
    };
  }
  
  // ============================================
  // 10. تحليل التعقيد - Complexity Analysis
  // ============================================
  
  /**
   * تحليل مستوى تعقيد المحتوى
   */
  private async analyzeComplexity(
    contentType: ContentType,
    quality: ImageQuality,
    dimensions: ImageDimensions
  ): Promise<ProcessingComplexity> {
    
    const indicators = this.calculateComplexityIndicators(
      contentType,
      quality,
      dimensions
    );
    
    const level = this.determineComplexityLevel(indicators);
    
    return {
      level,
      factors: {
        contentDensity: indicators.contentDiversity,
        visualNoise: indicators.visualNoise,
        structuralComplexity: indicators.structuralComplexity,
        languageMixing: contentType === 'mixed_content' ? 0.5 : 0.1
      },
      estimatedProcessingTime: this.estimateProcessingTime(level, quality)
    };
  }
  
  /**
   * حساب مؤشرات التعقيد
   */
  private calculateComplexityIndicators(
    contentType: ContentType,
    quality: ImageQuality,
    dimensions: ImageDimensions
  ): ComplexityIndicators {
    
    return {
      structuralComplexity: this.calculateStructuralComplexity(contentType),
      visualNoise: quality.metrics.noise,
      layoutComplexity: this.calculateLayoutComplexity(dimensions),
      contentDiversity: this.calculateContentDiversity(contentType)
    };
  }
  
  /**
   * حساب التعقيد الهيكلي
   */
  private calculateStructuralComplexity(contentType: ContentType): number {
    const complexityMap: Record<ContentType, number> = {
      'printed_text': 0.3,
      'handwritten': 0.6,
      'math_equations': 0.8,
      'diagrams_charts': 0.7,
      'mixed_content': 0.9,
      'tables': 0.7
    };
    
    return complexityMap[contentType] || 0.5;
  }
  
  /**
   * حساب تعقيد التخطيط
   */
  private calculateLayoutComplexity(dimensions: ImageDimensions): number {
    const pixelCount = dimensions.width * dimensions.height;
    
    if (pixelCount > 2000000) return 0.8;
    if (pixelCount > 1000000) return 0.6;
    if (pixelCount > 500000) return 0.4;
    return 0.2;
  }
  
  /**
   * حساب تنوع المحتوى
   */
  private calculateContentDiversity(contentType: ContentType): number {
    if (contentType === 'mixed_content') return 0.9;
    if (contentType === 'diagrams_charts') return 0.7;
    if (contentType === 'math_equations') return 0.6;
    return 0.4;
  }
  
  /**
   * تحديد مستوى التعقيد
   */
  private determineComplexityLevel(
    indicators: ComplexityIndicators
  ): 'simple' | 'moderate' | 'complex' | 'very_complex' {
    
    const avgComplexity = (
      indicators.structuralComplexity +
      indicators.visualNoise +
      indicators.layoutComplexity +
      indicators.contentDiversity
    ) / 4;
    
    if (avgComplexity >= 0.75) return 'very_complex';
    if (avgComplexity >= 0.55) return 'complex';
    if (avgComplexity >= 0.35) return 'moderate';
    return 'simple';
  }
  
  /**
   * تقدير وقت المعالجة
   */
  private estimateProcessingTime(
    level: ProcessingComplexity['level'],
    quality: ImageQuality
  ): number {
    
    const baseTime: Record<typeof level, number> = {
      'simple': 2000,
      'moderate': 5000,
      'complex': 10000,
      'very_complex': 20000
    };
    
    let time = baseTime[level];
    
    // تعديل حسب الجودة
    if (quality.overall === 'poor') time *= 1.5;
    if (quality.resolution === 'high') time *= 1.3;
    
    return Math.round(time);
  }
  
  // ============================================
  // 11. تحديد الخصائص - Characteristics
  // ============================================
  
  /**
   * تحديد خصائص المحتوى
   */
  private determineCharacteristics(
    contentType: ContentType,
    quality: ImageQuality,
    colorAnalysis: ColorAnalysis,
    language: LanguageInfo
  ): ContentCharacteristics {
    
    return {
      hasText: this.hasTextContent(contentType),
      hasMath: contentType === 'math_equations',
      hasDiagrams: contentType === 'diagrams_charts',
      hasTables: contentType === 'tables',
      isHandwritten: contentType === 'handwritten',
      requiresOCR: this.requiresOCR(contentType, quality),
      requiresVision: this.requiresVision(contentType),
      preferredEngine: this.determinePreferredEngine(contentType, quality)
    };
  }
  
  /**
   * فحص وجود نص
   */
  private hasTextContent(contentType: ContentType): boolean {
    return [
      'printed_text',
      'handwritten',
      'math_equations',
      'mixed_content',
      'tables'
    ].includes(contentType);
  }
  
  /**
   * فحص الحاجة لـ OCR
   */
  private requiresOCR(contentType: ContentType, quality: ImageQuality): boolean {
    return (
      contentType === 'printed_text' &&
      quality.clarity !== 'blurry' &&
      quality.overall !== 'poor'
    );
  }
  
  /**
   * فحص الحاجة لـ Vision
   */
  private requiresVision(contentType: ContentType): boolean {
    return [
      'handwritten',
      'math_equations',
      'diagrams_charts',
      'mixed_content'
    ].includes(contentType);
  }
  
  /**
   * تحديد المحرك المفضل
   */
  private determinePreferredEngine(
    contentType: ContentType,
    quality: ImageQuality
  ): 'ocr' | 'vision' | 'hybrid' {
    
    if (contentType === 'printed_text' && quality.overall !== 'poor') {
      return 'ocr';
    }
    
    if (contentType === 'handwritten' || contentType === 'math_equations') {
      return 'vision';
    }
    
    return 'hybrid';
  }
  
  // ============================================
  // 12. اقتراح الاستراتيجية - Strategy Suggestion
  // ============================================
  
  /**
   * اقتراح استراتيجية المعالجة
   */
  private suggestProcessingStrategy(
    contentType: ContentType,
    quality: ImageQuality,
    complexity: ProcessingComplexity,
    characteristics: ContentCharacteristics
  ): 'ocr-first' | 'vision-first' | 'parallel' | 'adaptive' | 'vision-only' | 'ocr-only' {
    
    // OCR فقط للنصوص المطبوعة الواضحة
    if (
      contentType === 'printed_text' &&
      quality.overall === 'excellent' &&
      complexity.level === 'simple'
    ) {
      return 'ocr-only';
    }
    
    // Vision فقط للخط اليدوي والرسومات
    if (
      (contentType === 'handwritten' || contentType === 'diagrams_charts') &&
      !characteristics.hasText
    ) {
      return 'vision-only';
    }
    
    // Parallel للمعادلات الرياضية
    if (contentType === 'math_equations') {
      return 'parallel';
    }
    
    // OCR-first للنصوص الجيدة
    if (
      characteristics.hasText &&
      quality.overall === 'good' &&
      !characteristics.isHandwritten
    ) {
      return 'ocr-first';
    }
    
    // Vision-first للخط اليدوي
    if (characteristics.isHandwritten) {
      return 'vision-first';
    }
    
    // Adaptive للحالات المعقدة
    return 'adaptive';
  }
  
  // ============================================
  // 13. حساب الثقة - Confidence Calculation
  // ============================================
  
  /**
   * حساب مستوى الثقة في التحليل
   */
  private calculateConfidence(
    contentType: ContentType,
    quality: ImageQuality,
    complexity: ProcessingComplexity
  ): number {
    
    let confidence = 0.7; // قيمة أساسية
    
    // زيادة الثقة للجودة العالية
    if (quality.overall === 'excellent') confidence += 0.2;
    else if (quality.overall === 'good') confidence += 0.1;
    else if (quality.overall === 'poor') confidence -= 0.2;
    
    // تقليل الثقة للتعقيد العالي
    if (complexity.level === 'very_complex') confidence -= 0.2;
    else if (complexity.level === 'complex') confidence -= 0.1;
    
    // تقليل الثقة للمحتوى المختلط
    if (contentType === 'mixed_content') confidence -= 0.1;
    
    return Math.max(0.1, Math.min(1.0, confidence));
  }
  
  // ============================================
  // 14. دوال مساعدة إضافية - Additional Helpers
  // ============================================
  
  /**
   * التحقق من صلاحية الصورة
   */
  async validateImage(imageData: string | Blob | File): Promise<{
    isValid: boolean;
    reason?: string;
  }> {
    
    try {
      const blob = await this.normalizeImageInput(imageData);
      
      // فحص الحجم
      if (blob.size > this.config.maxFileSize) {
        return {
          isValid: false,
          reason: `File size exceeds ${this.config.maxFileSize / 1024 / 1024}MB`
        };
      }
      
      // فحص النوع
      const format = this.detectImageFormat(blob);
      if (!this.config.supportedFormats.includes(format as any)) {
        return {
          isValid: false,
          reason: `Format ${format} is not supported`
        };
      }
      
      // فحص الأبعاد
      const dimensions = await this.getImageDimensions(blob);
      if (
        dimensions.width < this.config.minDimensions.width ||
        dimensions.height < this.config.minDimensions.height
      ) {
        return {
          isValid: false,
          reason: 'Image dimensions too small'
        };
      }
      
      return { isValid: true };
      
    } catch (error) {
      return {
        isValid: false,
        reason: error.message
      };
    }
  }
  
  /**
   * الحصول على ملخص التحليل
   */
  getAnalysisSummary(result: ImageAnalysisResult): string {
    return `
      Content: ${result.contentType}
      Quality: ${result.quality.overall}
      Complexity: ${result.complexity.level}
      Strategy: ${result.suggestedStrategy}
      Confidence: ${(result.confidence * 100).toFixed(0)}%
      Time: ${result.analysisTime}ms
    `.trim();
  }
}

// ============================================
// 15. التصدير - Exports
// ============================================

/**
 * إنشاء instance من المحلل
 */
export function createImageAnalyzer(): ImageAnalyzer {
  return new ImageAnalyzer();
}

/**
 * دالة مساعدة سريعة للتحليل
 */
export async function quickAnalyze(
  imageData: string | Blob | File
): Promise<ImageAnalysisResult> {
  const analyzer = createImageAnalyzer();
  return analyzer.analyzeImage(imageData, { quickAnalysis: true });
}

/**
 * دالة للتحليل الكامل
 */
export async function fullAnalyze(
  imageData: string | Blob | File
): Promise<ImageAnalysisResult> {
  const analyzer = createImageAnalyzer();
  return analyzer.analyzeImage(imageData);
}

// التصدير الافتراضي
export default ImageAnalyzer;