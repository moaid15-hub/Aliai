// @ts-nocheck
/**
 * معالج OCR - OCR Processor
 * 
 * يتعامل مع Google Vision OCR و Azure OCR و Tesseract
 * مع نظام Fallback ذكي
 * 
 * @module ocr-processor
 * @path src/services/image-processing/ocr-processor.ts
 */

import {
  OCRProcessingResult,
  OCRProvider,
  OCRRequest,
  OCRResponse,
  TextBlock,
  TextLine,
  Word,
  BoundingBox,
  OCRQuality
} from '../../types/image-processing.types';

import {
  IMAGE_PROCESSING_CONFIG,
  OCR_API_CONFIG
} from '../../config/image-processing-config';

// ============================================
// 1. الواجهات المحلية
// ============================================

interface OCRProviderConfig {
  provider: OCRProvider;
  apiKey: string;
  endpoint: string;
  maxRetries: number;
  timeout: number;
}

interface OCRRequestOptions {
  provider?: OCRProvider;
  language?: string;
  detectOrientation?: boolean;
  enableFallback?: boolean;
  preserveLayout?: boolean;
}

interface ProviderResponse {
  success: boolean;
  data?: any;
  error?: string;
  provider: OCRProvider;
  processingTime: number;
}

interface PreprocessingOptions {
  denoise?: boolean;
  deskew?: boolean;
  sharpen?: boolean;
  contrast?: boolean;
}

// ============================================
// 2. فئة معالج OCR
// ============================================

export class OCRProcessor {
  private config = IMAGE_PROCESSING_CONFIG;
  private ocrConfig = OCR_API_CONFIG;
  private providerAttempts: Map<OCRProvider, number> = new Map();
  
  constructor() {
    this.initializeProviders();
  }
  
  /**
   * تهيئة المزودين
   */
  private initializeProviders(): void {
    const providers: OCRProvider[] = ['google-vision', 'azure', 'tesseract'];
    providers.forEach(provider => {
      this.providerAttempts.set(provider, 0);
    });
  }
  
  // ============================================
  // 3. المعالجة الرئيسية
  // ============================================
  
  /**
   * معالجة صورة باستخدام OCR
   */
  async processImage(
    imageData: string | Blob,
    options?: OCRRequestOptions
  ): Promise<OCRProcessingResult> {
    
    const startTime = Date.now();
    
    try {
      // تحضير الصورة
      const preparedImage = await this.prepareImage(imageData, {
        denoise: true,
        deskew: true,
        contrast: true
      });
      
      // تحديد المزود
      const provider = options?.provider || this.selectBestProvider();
      
      // إنشاء الطلب
      const request = this.createOCRRequest(
        preparedImage,
        provider,
        options
      );
      
      // تنفيذ الطلب مع Fallback
      const response = await this.executeWithFallback(
        request,
        provider,
        options?.enableFallback !== false
      );
      
      // معالجة الاستجابة
      const result = this.processResponse(response, startTime);
      
      return result;
      
    } catch (error) {
      return this.handleError(error, startTime);
    }
  }
  
  /**
   * معالجة نص فقط (سريع)
   */
  async extractTextOnly(
    imageData: string | Blob,
    options?: OCRRequestOptions
  ): Promise<string> {
    
    const result = await this.processImage(imageData, options);
    return result.fullText;
  }
  
  /**
   * معالجة متعددة (Batch)
   */
  async processBatch(
    images: Array<string | Blob>,
    options?: OCRRequestOptions
  ): Promise<OCRProcessingResult[]> {
    
    const results: OCRProcessingResult[] = [];
    
    for (const image of images) {
      const result = await this.processImage(image, options);
      results.push(result);
    }
    
    return results;
  }
  
  // ============================================
  // 4. إعداد الصورة (Preprocessing)
  // ============================================
  
  /**
   * تحضير الصورة قبل OCR
   */
  private async prepareImage(
    imageData: string | Blob,
    options?: PreprocessingOptions
  ): Promise<string> {
    
    // تحويل إلى Base64
    const base64 = await this.toBase64(imageData);
    
    // يمكن إضافة معالجة مسبقة هنا
    // - Denoise
    // - Deskew
    // - Sharpen
    // - Contrast adjustment
    
    return base64;
  }
  
  /**
   * تحويل إلى Base64
   */
  private async toBase64(imageData: string | Blob): Promise<string> {
    if (typeof imageData === 'string') {
      return imageData;
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read image'));
      };
      
      reader.readAsDataURL(imageData);
    });
  }
  
  // ============================================
  // 5. اختيار المزود
  // ============================================
  
  /**
   * اختيار أفضل مزود متاح
   */
  private selectBestProvider(): OCRProvider {
    const providers: OCRProvider[] = ['google-vision', 'azure', 'tesseract'];
    
    const sorted = providers.sort((a, b) => {
      const attemptsA = this.providerAttempts.get(a) || 0;
      const attemptsB = this.providerAttempts.get(b) || 0;
      return attemptsA - attemptsB;
    });
    
    return sorted[0];
  }
  
  /**
   * الحصول على المزود التالي
   */
  private getNextProvider(currentProvider: OCRProvider): OCRProvider | null {
    const sequence: OCRProvider[] = ['google-vision', 'azure', 'tesseract'];
    const currentIndex = sequence.indexOf(currentProvider);
    
    if (currentIndex < sequence.length - 1) {
      return sequence[currentIndex + 1];
    }
    
    return null;
  }
  
  // ============================================
  // 6. إنشاء الطلبات
  // ============================================
  
  /**
   * إنشاء طلب OCR
   */
  private createOCRRequest(
    base64Image: string,
    provider: OCRProvider,
    options?: OCRRequestOptions
  ): OCRRequest {
    
    return {
      image: base64Image,
      provider,
      options: {
        language: options?.language || 'ar',
        detectOrientation: options?.detectOrientation !== false,
        preserveLayout: options?.preserveLayout !== false
      }
    };
  }
  
  // ============================================
  // 7. تنفيذ الطلبات
  // ============================================
  
  /**
   * تنفيذ الطلب مع Fallback
   */
  private async executeWithFallback(
    request: OCRRequest,
    provider: OCRProvider,
    enableFallback: boolean
  ): Promise<ProviderResponse> {
    
    let currentProvider = provider;
    const maxAttempts = enableFallback ? 3 : 1;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await this.callProvider(request, currentProvider);
        
        if (response.success) {
          this.providerAttempts.set(currentProvider, 0);
          return response;
        }
        
        this.providerAttempts.set(
          currentProvider,
          (this.providerAttempts.get(currentProvider) || 0) + 1
        );
        
        const nextProvider = this.getNextProvider(currentProvider);
        if (!nextProvider || !enableFallback) {
          return response;
        }
        
        currentProvider = nextProvider;
        request.provider = currentProvider;
        
      } catch (error) {
        if (attempt === maxAttempts - 1) {
          throw error;
        }
        
        const nextProvider = this.getNextProvider(currentProvider);
        if (!nextProvider || !enableFallback) {
          throw error;
        }
        
        currentProvider = nextProvider;
        request.provider = currentProvider;
      }
    }
    
    throw new Error('All OCR providers failed');
  }
  
  /**
   * استدعاء مزود معين
   */
  private async callProvider(
    request: OCRRequest,
    provider: OCRProvider
  ): Promise<ProviderResponse> {
    
    const startTime = Date.now();
    
    try {
      let response: any;
      
      switch (provider) {
        case 'google-vision':
          response = await this.callGoogleVision(request);
          break;
        case 'azure':
          response = await this.callAzure(request);
          break;
        case 'tesseract':
          response = await this.callTesseract(request);
          break;
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
      
      return {
        success: true,
        data: response,
        provider,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        provider,
        processingTime: Date.now() - startTime
      };
    }
  }
  
  // ============================================
  // 8. استدعاء Google Vision OCR
  // ============================================
  
  /**
   * استدعاء Google Vision API
   */
  private async callGoogleVision(request: OCRRequest): Promise<any> {
    const config = this.ocrConfig.providers['google-vision'];
    
    const endpoint = `${config.endpoint}?key=${config.apiKey}`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: request.image.replace(/^data:image\/\w+;base64,/, '')
            },
            features: [
              {
                type: 'DOCUMENT_TEXT_DETECTION',
                maxResults: 1
              }
            ],
            imageContext: {
              languageHints: [request.options?.language || 'ar']
            }
          }
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Google Vision API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.responses || !data.responses[0]) {
      throw new Error('No response from Google Vision');
    }
    
    return this.parseGoogleVisionResponse(data.responses[0]);
  }
  
  /**
   * تحليل استجابة Google Vision
   */
  private parseGoogleVisionResponse(response: any): any {
    const textAnnotations = response.textAnnotations || [];
    const fullTextAnnotation = response.fullTextAnnotation;
    
    if (!fullTextAnnotation) {
      return {
        fullText: textAnnotations[0]?.description || '',
        blocks: [],
        confidence: 0.5
      };
    }
    
    const blocks: TextBlock[] = fullTextAnnotation.pages[0].blocks.map((block: any) => {
      return {
        text: this.extractBlockText(block),
        boundingBox: this.convertBoundingBox(block.boundingBox),
        confidence: block.confidence || 0.8,
        lines: block.paragraphs.map((para: any) => {
          return {
            text: this.extractParagraphText(para),
            boundingBox: this.convertBoundingBox(para.boundingBox),
            words: para.words.map((word: any) => {
              return {
                text: this.extractWordText(word),
                boundingBox: this.convertBoundingBox(word.boundingBox),
                confidence: word.confidence || 0.8
              };
            })
          };
        })
      };
    });
    
    return {
      fullText: fullTextAnnotation.text,
      blocks,
      confidence: this.calculateAverageConfidence(blocks)
    };
  }
  
  /**
   * استخراج نص Block
   */
  private extractBlockText(block: any): string {
    return block.paragraphs
      .map((para: any) => this.extractParagraphText(para))
      .join('\n');
  }
  
  /**
   * استخراج نص Paragraph
   */
  private extractParagraphText(para: any): string {
    return para.words
      .map((word: any) => this.extractWordText(word))
      .join(' ');
  }
  
  /**
   * استخراج نص Word
   */
  private extractWordText(word: any): string {
    return word.symbols
      .map((symbol: any) => symbol.text)
      .join('');
  }
  
  /**
   * تحويل Bounding Box
   */
  private convertBoundingBox(box: any): BoundingBox {
    const vertices = box.vertices || [];
    return {
      x: vertices[0]?.x || 0,
      y: vertices[0]?.y || 0,
      width: (vertices[1]?.x || 0) - (vertices[0]?.x || 0),
      height: (vertices[2]?.y || 0) - (vertices[0]?.y || 0)
    };
  }
  
  // ============================================
  // 9. استدعاء Azure OCR
  // ============================================
  
  /**
   * استدعاء Azure Computer Vision API
   */
  private async callAzure(request: OCRRequest): Promise<any> {
    const config = this.ocrConfig.providers.azure;
    
    const response = await fetch(`${config.endpoint}/vision/v3.2/ocr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': config.apiKey
      },
      body: JSON.stringify({
        url: request.image
      })
    });
    
    if (!response.ok) {
      throw new Error(`Azure API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return this.parseAzureResponse(data);
  }
  
  /**
   * تحليل استجابة Azure
   */
  private parseAzureResponse(response: any): any {
    const regions = response.regions || [];
    
    let fullText = '';
    const blocks: TextBlock[] = [];
    
    regions.forEach((region: any) => {
      region.lines.forEach((line: any) => {
        const lineText = line.words.map((w: any) => w.text).join(' ');
        fullText += lineText + '\n';
        
        const block: TextBlock = {
          text: lineText,
          boundingBox: this.parseAzureBoundingBox(line.boundingBox),
          confidence: 0.8,
          lines: [
            {
              text: lineText,
              boundingBox: this.parseAzureBoundingBox(line.boundingBox),
              words: line.words.map((word: any) => ({
                text: word.text,
                boundingBox: this.parseAzureBoundingBox(word.boundingBox),
                confidence: 0.8
              }))
            }
          ]
        };
        
        blocks.push(block);
      });
    });
    
    return {
      fullText: fullText.trim(),
      blocks,
      confidence: 0.8
    };
  }
  
  /**
   * تحليل Azure Bounding Box
   */
  private parseAzureBoundingBox(box: string): BoundingBox {
    const parts = box.split(',').map(Number);
    return {
      x: parts[0],
      y: parts[1],
      width: parts[2],
      height: parts[3]
    };
  }
  
  // ============================================
  // 10. استدعاء Tesseract
  // ============================================
  
  /**
   * استدعاء Tesseract.js
   */
  private async callTesseract(request: OCRRequest): Promise<any> {
    // ملاحظة: Tesseract.js يحتاج import
    // هنا نفترض أنه موجود
    
    // @ts-ignore
    const { createWorker } = await import('tesseract.js');
    
    const worker = await createWorker(request.options?.language || 'ara');
    
    const result = await worker.recognize(request.image);
    
    await worker.terminate();
    
    return this.parseTesseractResponse(result);
  }
  
  /**
   * تحليل استجابة Tesseract
   */
  private parseTesseractResponse(response: any): any {
    const data = response.data;
    
    const blocks: TextBlock[] = data.blocks.map((block: any) => {
      return {
        text: block.text,
        boundingBox: {
          x: block.bbox.x0,
          y: block.bbox.y0,
          width: block.bbox.x1 - block.bbox.x0,
          height: block.bbox.y1 - block.bbox.y0
        },
        confidence: block.confidence / 100,
        lines: block.lines.map((line: any) => {
          return {
            text: line.text,
            boundingBox: {
              x: line.bbox.x0,
              y: line.bbox.y0,
              width: line.bbox.x1 - line.bbox.x0,
              height: line.bbox.y1 - line.bbox.y0
            },
            words: line.words.map((word: any) => {
              return {
                text: word.text,
                boundingBox: {
                  x: word.bbox.x0,
                  y: word.bbox.y0,
                  width: word.bbox.x1 - word.bbox.x0,
                  height: word.bbox.y1 - word.bbox.y0
                },
                confidence: word.confidence / 100
              };
            })
          };
        })
      };
    });
    
    return {
      fullText: data.text,
      blocks,
      confidence: data.confidence / 100
    };
  }
  
  // ============================================
  // 11. معالجة الاستجابة
  // ============================================
  
  /**
   * معالجة استجابة المزود
   */
  private processResponse(
    response: ProviderResponse,
    startTime: number
  ): OCRProcessingResult {
    
    if (!response.success) {
      throw new Error(response.error || 'OCR processing failed');
    }
    
    const quality = this.assessOCRQuality(response.data);
    
    return {
      fullText: response.data.fullText,
      blocks: response.data.blocks || [],
      provider: response.provider,
      confidence: response.data.confidence,
      quality,
      processingTime: Date.now() - startTime,
      metadata: {
        blockCount: response.data.blocks?.length || 0,
        wordCount: this.countWords(response.data.fullText),
        providerTime: response.processingTime
      },
      success: true,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * تقييم جودة OCR
   */
  private assessOCRQuality(data: any): OCRQuality {
    const confidence = data.confidence;
    const textLength = data.fullText.length;
    
    let overall: OCRQuality['overall'] = 'poor';
    
    if (confidence >= 0.9 && textLength > 10) {
      overall = 'excellent';
    } else if (confidence >= 0.7 && textLength > 5) {
      overall = 'good';
    } else if (confidence >= 0.5) {
      overall = 'acceptable';
    }
    
    return {
      overall,
      textClarity: confidence >= 0.8 ? 'high' : confidence >= 0.6 ? 'medium' : 'low',
      layoutPreservation: data.blocks?.length > 0 ? 'good' : 'poor',
      characterAccuracy: confidence
    };
  }
  
  /**
   * عد الكلمات
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }
  
  /**
   * حساب متوسط الثقة
   */
  private calculateAverageConfidence(blocks: TextBlock[]): number {
    if (blocks.length === 0) return 0;
    
    const sum = blocks.reduce((acc, block) => acc + block.confidence, 0);
    return sum / blocks.length;
  }
  
  // ============================================
  // 12. معالجة الأخطاء
  // ============================================
  
  /**
   * معالجة الأخطاء
   */
  private handleError(
    error: any,
    startTime: number
  ): OCRProcessingResult {
    
    return {
      fullText: '',
      blocks: [],
      provider: 'google-vision',
      confidence: 0,
      quality: {
        overall: 'poor',
        textClarity: 'low',
        layoutPreservation: 'poor',
        characterAccuracy: 0
      },
      processingTime: Date.now() - startTime,
      success: false,
      error: {
        code: 'OCR_ERROR',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };
  }
  
  // ============================================
  // 13. دوال مساعدة
  // ============================================
  
  /**
   * فحص توفر المزود
   */
  async checkProviderAvailability(
    provider: OCRProvider
  ): Promise<boolean> {
    
    try {
      const testImage = this.createTestImage();
      
      const request: OCRRequest = {
        image: testImage,
        provider,
        options: {
          language: 'en'
        }
      };
      
      const response = await this.callProvider(request, provider);
      return response.success;
      
    } catch {
      return false;
    }
  }
  
  /**
   * إنشاء صورة اختبار
   */
  private createTestImage(): string {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  }
  
  /**
   * الحصول على إحصائيات
   */
  getProvidersStats(): Record<OCRProvider, number> {
    return {
      'google-vision': this.providerAttempts.get('google-vision') || 0,
      'azure': this.providerAttempts.get('azure') || 0,
      'tesseract': this.providerAttempts.get('tesseract') || 0
    };
  }
  
  /**
   * إعادة تعيين الإحصائيات
   */
  resetStats(): void {
    this.providerAttempts.clear();
    this.initializeProviders();
  }
  
  /**
   * الحصول على المزود الموصى به
   */
  getRecommendedProvider(): OCRProvider {
    return this.selectBestProvider();
  }
  
  /**
   * استخراج نص من منطقة محددة
   */
  extractTextFromRegion(
    result: OCRProcessingResult,
    region: BoundingBox
  ): string {
    
    const relevantBlocks = result.blocks.filter(block => {
      return this.boxesOverlap(block.boundingBox, region);
    });
    
    return relevantBlocks.map(block => block.text).join('\n');
  }
  
  /**
   * فحص تداخل المناطق
   */
  private boxesOverlap(box1: BoundingBox, box2: BoundingBox): boolean {
    return !(
      box1.x + box1.width < box2.x ||
      box2.x + box2.width < box1.x ||
      box1.y + box1.height < box2.y ||
      box2.y + box2.height < box1.y
    );
  }
}

// ============================================
// 14. دوال مساعدة عامة
// ============================================

/**
 * إنشاء معالج OCR
 */
export function createOCRProcessor(): OCRProcessor {
  return new OCRProcessor();
}

/**
 * معالجة سريعة
 */
export async function quickOCRProcess(
  imageData: string | Blob,
  language?: string
): Promise<string> {
  
  const processor = createOCRProcessor();
  return processor.extractTextOnly(imageData, { language });
}

/**
 * معالجة مع مزود محدد
 */
export async function processWithProvider(
  imageData: string | Blob,
  provider: OCRProvider,
  language?: string
): Promise<OCRProcessingResult> {
  
  const processor = createOCRProcessor();
  return processor.processImage(imageData, { provider, language });
}

// ============================================
// 15. التصدير
// ============================================

export default OCRProcessor;