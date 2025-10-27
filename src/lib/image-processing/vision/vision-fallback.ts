// @ts-nocheck
/**
 * Vision Fallback Service
 * خدمة الاحتياط للرؤية
 */

import { VisionResult, UploadedImage } from '../../../types/image-processing.types';
import { ClaudeVisionService } from './claude-vision';
import { GPT4VisionService } from './gpt4-vision';
import { GeminiVisionService } from './gemini-vision';

export class VisionFallbackService {
  private services: Map<string, any> = new Map();
  private fallbackOrder: string[] = ['gpt4', 'claude', 'gemini'];

  constructor(apiKeys: { gpt4?: string; claude?: string; gemini?: string }) {
    if (apiKeys.gpt4) {
      this.services.set('gpt4', new GPT4VisionService(apiKeys.gpt4));
    }
    if (apiKeys.claude) {
      this.services.set('claude', new ClaudeVisionService(apiKeys.claude));
    }
    if (apiKeys.gemini) {
      this.services.set('gemini', new GeminiVisionService(apiKeys.gemini));
    }
  }

  async analyzeWithFallback(image: UploadedImage): Promise<VisionResult> {
    let lastError = '';

    for (const provider of this.fallbackOrder) {
      const service = this.services.get(provider);
      if (!service) continue;

      try {
        console.log(`🔄 محاولة تحليل الصورة باستخدام ${provider}...`);
        const result = await service.analyzeImage(image);
        
        if (result.success && result.extractedText && result.extractedText.trim()) {
          console.log(`✅ نجح التحليل باستخدام ${provider}`);
          return result;
        } else {
          console.log(`⚠️ فشل ${provider}: لا توجد نتيجة مفيدة`);
          lastError = result.error || `لا توجد نتيجة من ${provider}`;
        }
      } catch (error) {
        console.log(`❌ خطأ في ${provider}:`, error);
        lastError = error instanceof Error ? error.message : `خطأ في ${provider}`;
        continue;
      }
    }

    // إذا فشلت جميع الخدمات
    return {
      provider: 'claude',
      description: '',
      extractedText: '',
      confidence: 0,
      processingTime: Date.now(),
      success: false,
      error: `فشل جميع خدمات الرؤية. آخر خطأ: ${lastError}`
    };
  }

  setFallbackOrder(order: string[]) {
    this.fallbackOrder = order;
  }

  getFallbackOrder(): string[] {
    return [...this.fallbackOrder];
  }

  getAvailableProviders(): string[] {
    return Array.from(this.services.keys());
  }
}