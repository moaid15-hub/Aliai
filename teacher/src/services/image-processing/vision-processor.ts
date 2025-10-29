/**
 * معالج Vision API - Vision Processor
 * 
 * يتعامل مع Claude Vision و GPT-4 Vision و Gemini Vision
 * مع نظام Fallback ذكي
 * 
 * @module vision-processor
 * @path src/services/image-processing/vision-processor.ts
 */

import {
  VisionProcessingResult,
  VisionProvider,
  VisionRequest,
  VisionResponse,
  ProcessingError,
  FallbackStrategy
} from '../../types/image-processing.types';

import {
  IMAGE_PROCESSING_CONFIG,
  VISION_API_CONFIG
} from '../../config/image-processing-config';

// ============================================
// 1. الواجهات المحلية
// ============================================

interface VisionProviderConfig {
  provider: VisionProvider;
  apiKey: string;
  endpoint: string;
  model: string;
  maxRetries: number;
  timeout: number;
}

interface VisionRequestOptions {
  provider?: VisionProvider;
  prompt?: string;
  language?: string;
  maxTokens?: number;
  temperature?: number;
  enableFallback?: boolean;
}

interface ProviderResponse {
  success: boolean;
  data?: any;
  error?: string;
  provider: VisionProvider;
  processingTime: number;
}

// ============================================
// 2. فئة معالج Vision
// ============================================

export class VisionProcessor {
  private config = IMAGE_PROCESSING_CONFIG;
  private visionConfig = VISION_API_CONFIG;
  private providerAttempts: Map<VisionProvider, number> = new Map();
  
  constructor() {
    this.initializeProviders();
  }
  
  /**
   * تهيئة المزودين
   */
  private initializeProviders(): void {
    const providers: VisionProvider[] = ['claude', 'gpt4', 'gemini'];
    providers.forEach(provider => {
      this.providerAttempts.set(provider, 0);
    });
  }
  
  // ============================================
  // 3. المعالجة الرئيسية
  // ============================================
  
  /**
   * معالجة صورة باستخدام Vision API
   */
  async processImage(
    imageData: string | Blob,
    options?: VisionRequestOptions
  ): Promise<VisionProcessingResult> {
    
    const startTime = Date.now();
    
    try {
      // تحويل الصورة إلى Base64
      const base64Image = await this.prepareImage(imageData);
      
      // تحديد المزود
      const provider = options?.provider || this.selectBestProvider();
      
      // إنشاء الطلب
      const request = this.createVisionRequest(
        base64Image,
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
   * معالجة نص مع صورة
   */
  async processWithPrompt(
    imageData: string | Blob,
    prompt: string,
    options?: VisionRequestOptions
  ): Promise<VisionProcessingResult> {
    
    return this.processImage(imageData, {
      ...options,
      prompt
    });
  }
  
  /**
   * معالجة متعددة (Batch)
   */
  async processBatch(
    images: Array<string | Blob>,
    options?: VisionRequestOptions
  ): Promise<VisionProcessingResult[]> {
    
    const results: VisionProcessingResult[] = [];
    
    for (const image of images) {
      const result = await this.processImage(image, options);
      results.push(result);
    }
    
    return results;
  }
  
  // ============================================
  // 4. إعداد الصورة
  // ============================================
  
  /**
   * تحويل الصورة إلى Base64
   */
  private async prepareImage(imageData: string | Blob): Promise<string> {
    if (typeof imageData === 'string') {
      return imageData;
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result);
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
  private selectBestProvider(): VisionProvider {
    const providers: VisionProvider[] = ['claude', 'gpt4', 'gemini'];
    
    // ترتيب حسب عدد المحاولات الفاشلة
    const sorted = providers.sort((a, b) => {
      const attemptsA = this.providerAttempts.get(a) || 0;
      const attemptsB = this.providerAttempts.get(b) || 0;
      return attemptsA - attemptsB;
    });
    
    return sorted[0];
  }
  
  /**
   * الحصول على المزود التالي للـ Fallback
   */
  private getNextProvider(currentProvider: VisionProvider): VisionProvider | null {
    const sequence: VisionProvider[] = ['claude', 'gpt4', 'gemini'];
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
   * إنشاء طلب Vision
   */
  private createVisionRequest(
    base64Image: string,
    provider: VisionProvider,
    options?: VisionRequestOptions
  ): VisionRequest {
    
    const defaultPrompt = this.getDefaultPrompt(options?.language || 'ar');
    
    return {
      image: base64Image,
      provider,
      prompt: options?.prompt || defaultPrompt,
      options: {
        language: options?.language || 'ar',
        maxTokens: options?.maxTokens || 2000,
        temperature: options?.temperature || 0.3
      }
    };
  }
  
  /**
   * الحصول على Prompt افتراضي
   */
  private getDefaultPrompt(language: string): string {
    if (language === 'ar') {
      return `قم بتحليل هذه الصورة واستخرج كل النصوص والمعلومات الموجودة فيها.
      
      إذا كانت تحتوي على:
      - نص: اكتب النص كاملاً بدقة
      - معادلات رياضية: اكتبها بصيغة LaTeX
      - جداول: حافظ على هيكل الجدول
      - رسومات: صف الرسم بالتفصيل
      
      الرجاء الإجابة باللغة العربية.`;
    }
    
    return `Analyze this image and extract all text and information.
    
    If it contains:
    - Text: Write the complete text accurately
    - Math equations: Write in LaTeX format
    - Tables: Preserve table structure
    - Diagrams: Describe in detail`;
  }
  
  // ============================================
  // 7. تنفيذ الطلبات
  // ============================================
  
  /**
   * تنفيذ الطلب مع نظام Fallback
   */
  private async executeWithFallback(
    request: VisionRequest,
    provider: VisionProvider,
    enableFallback: boolean
  ): Promise<ProviderResponse> {
    
    let currentProvider = provider;
    const maxAttempts = enableFallback ? 3 : 1;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await this.callProvider(request, currentProvider);
        
        if (response.success) {
          // إعادة تعيين العداد عند النجاح
          this.providerAttempts.set(currentProvider, 0);
          return response;
        }
        
        // زيادة عداد المحاولات الفاشلة
        this.providerAttempts.set(
          currentProvider,
          (this.providerAttempts.get(currentProvider) || 0) + 1
        );
        
        // محاولة المزود التالي
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
    
    throw new Error('All vision providers failed');
  }
  
  /**
   * استدعاء مزود معين
   */
  private async callProvider(
    request: VisionRequest,
    provider: VisionProvider
  ): Promise<ProviderResponse> {
    
    const startTime = Date.now();
    
    try {
      let response: any;
      
      switch (provider) {
        case 'claude':
          response = await this.callClaude(request);
          break;
        case 'gpt4':
          response = await this.callGPT4(request);
          break;
        case 'gemini':
          response = await this.callGemini(request);
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
  // 8. استدعاء Claude Vision
  // ============================================
  
  /**
   * استدعاء Claude Vision API
   */
  private async callClaude(request: VisionRequest): Promise<any> {
    const config = this.visionConfig.providers.claude;
    
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: request.options?.maxTokens || 2000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/png',
                  data: request.image.replace(/^data:image\/\w+;base64,/, '')
                }
              },
              {
                type: 'text',
                text: request.prompt
              }
            ]
          }
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      text: data.content[0].text,
      usage: data.usage,
      model: data.model
    };
  }
  
  // ============================================
  // 9. استدعاء GPT-4 Vision
  // ============================================
  
  /**
   * استدعاء GPT-4 Vision API
   */
  private async callGPT4(request: VisionRequest): Promise<any> {
    const config = this.visionConfig.providers.gpt4;
    
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: request.prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: request.image
                }
              }
            ]
          }
        ],
        max_tokens: request.options?.maxTokens || 2000,
        temperature: request.options?.temperature || 0.3
      })
    });
    
    if (!response.ok) {
      throw new Error(`GPT-4 API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      text: data.choices[0].message.content,
      usage: data.usage,
      model: data.model
    };
  }
  
  // ============================================
  // 10. استدعاء Gemini Vision
  // ============================================
  
  /**
   * استدعاء Gemini Vision API
   */
  private async callGemini(request: VisionRequest): Promise<any> {
    const config = this.visionConfig.providers.gemini;
    
    const endpoint = `${config.endpoint}?key=${config.apiKey}`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: request.prompt
              },
              {
                inline_data: {
                  mime_type: 'image/png',
                  data: request.image.replace(/^data:image\/\w+;base64,/, '')
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: request.options?.temperature || 0.3,
          maxOutputTokens: request.options?.maxTokens || 2000
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      text: data.candidates[0].content.parts[0].text,
      usage: data.usageMetadata,
      model: config.model
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
  ): VisionProcessingResult {
    
    if (!response.success) {
      throw new Error(response.error || 'Vision processing failed');
    }
    
    return {
      extractedText: response.data.text,
      provider: response.provider,
      confidence: this.calculateConfidence(response),
      processingTime: Date.now() - startTime,
      metadata: {
        model: response.data.model,
        usage: response.data.usage,
        providerTime: response.processingTime
      },
      success: true,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * حساب مستوى الثقة
   */
  private calculateConfidence(response: ProviderResponse): number {
    // حساب بسيط - يمكن تحسينه
    if (!response.data.text || response.data.text.length < 10) {
      return 0.3;
    }
    
    // Claude عادة الأفضل للعربي
    if (response.provider === 'claude') return 0.9;
    if (response.provider === 'gpt4') return 0.85;
    if (response.provider === 'gemini') return 0.8;
    
    return 0.7;
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
  ): VisionProcessingResult {
    
    return {
      extractedText: '',
      provider: 'claude',
      confidence: 0,
      processingTime: Date.now() - startTime,
      success: false,
      error: {
        code: 'VISION_ERROR',
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
    provider: VisionProvider
  ): Promise<boolean> {
    
    try {
      // إنشاء صورة اختبار بسيطة
      const testImage = this.createTestImage();
      
      const request: VisionRequest = {
        image: testImage,
        provider,
        prompt: 'Test',
        options: {
          maxTokens: 10
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
    // صورة 1x1 pixel شفافة
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  }
  
  /**
   * الحصول على إحصائيات المزودين
   */
  getProvidersStats(): Record<VisionProvider, number> {
    return {
      claude: this.providerAttempts.get('claude') || 0,
      gpt4: this.providerAttempts.get('gpt4') || 0,
      gemini: this.providerAttempts.get('gemini') || 0
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
  getRecommendedProvider(): VisionProvider {
    return this.selectBestProvider();
  }
}

// ============================================
// 14. دوال مساعدة عامة
// ============================================

/**
 * إنشاء معالج Vision
 */
export function createVisionProcessor(): VisionProcessor {
  return new VisionProcessor();
}

/**
 * معالجة سريعة
 */
export async function quickVisionProcess(
  imageData: string | Blob,
  prompt?: string
): Promise<VisionProcessingResult> {
  
  const processor = createVisionProcessor();
  return processor.processImage(imageData, { prompt });
}

/**
 * معالجة مع مزود محدد
 */
export async function processWithProvider(
  imageData: string | Blob,
  provider: VisionProvider,
  prompt?: string
): Promise<VisionProcessingResult> {
  
  const processor = createVisionProcessor();
  return processor.processImage(imageData, { provider, prompt });
}

// ============================================
// 15. التصدير
// ============================================

export default VisionProcessor;