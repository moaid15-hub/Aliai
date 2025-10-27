// خدمة Gemini AI من Google
import { AIService, AIResponse, AIServiceOptions } from './router';

export class GeminiService implements AIService {
  private modelName = 'gemini-pro';
  private apiKey: string;
  private apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
  }

  async generateResponse(prompt: string, options?: AIServiceOptions): Promise<AIResponse> {
    if (!this.isAvailable()) {
      throw new Error('خدمة Gemini غير متاحة - مفتاح API مفقود');
    }

    try {
      const response = await this.callGeminiAPI(prompt, options);
      
      return {
        content: response.content,
        model: this.modelName,
        tokensUsed: response.tokensUsed,
        cost: this.calculateCost(response.tokensUsed)
      };
    } catch (error) {
      console.error('خطأ في خدمة Gemini:', error);
      throw new Error('فشل في الحصول على استجابة من Gemini');
    }
  }

  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  getModelName(): string {
    return this.modelName;
  }

  private async callGeminiAPI(prompt: string, options?: AIServiceOptions): Promise<{ content: string; tokensUsed: number }> {
    const requestBody = {
      contents: [{
        parts: [{
          text: this.buildPrompt(prompt, options)
        }]
      }],
      generationConfig: {
        temperature: options?.temperature || 0.7,
        maxOutputTokens: options?.maxTokens || 1000,
        candidateCount: 1
      }
    };

    const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('لم يتم الحصول على استجابة من Gemini');
    }

    const candidate = data.candidates[0];
    const content = candidate.content?.parts?.[0]?.text || '';
    
    // تقدير عدد الرموز المستخدمة
    const tokensUsed = this.estimateTokens(prompt + content);

    return {
      content,
      tokensUsed
    };
  }

  private buildPrompt(userPrompt: string, options?: AIServiceOptions): string {
    let fullPrompt = '';
    
    if (options?.systemPrompt) {
      fullPrompt += `النظام: ${options.systemPrompt}\n\n`;
    }
    
    fullPrompt += `المستخدم: ${userPrompt}`;
    
    return fullPrompt;
  }

  private estimateTokens(text: string): number {
    // تقدير تقريبي لـ Gemini (حوالي 4 أحرف لكل token)
    return Math.ceil(text.length / 4);
  }

  private calculateCost(tokensUsed: number): number {
    // تكلفة Gemini Pro (تقديرية)
    // $0.0005 per 1K tokens for input
    // $0.0015 per 1K tokens for output
    const avgCostPer1KTokens = 0.001; // متوسط التكلفة
    return (tokensUsed / 1000) * avgCostPer1KTokens;
  }

  // إعدادات متقدمة لـ Gemini
  async generateWithAdvancedOptions(
    prompt: string,
    options: {
      temperature?: number;
      topK?: number;
      topP?: number;
      maxTokens?: number;
      stopSequences?: string[];
      safetySettings?: Array<{
        category: string;
        threshold: string;
      }>;
    } = {}
  ): Promise<AIResponse> {
    if (!this.isAvailable()) {
      throw new Error('خدمة Gemini غير متاحة');
    }

    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: options.temperature || 0.7,
        topK: options.topK || 32,
        topP: options.topP || 0.95,
        maxOutputTokens: options.maxTokens || 1000,
        stopSequences: options.stopSequences || [],
        candidateCount: 1
      },
      safetySettings: options.safetySettings || [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    try {
      const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const tokensUsed = this.estimateTokens(prompt + content);

      return {
        content,
        model: this.modelName,
        tokensUsed,
        cost: this.calculateCost(tokensUsed)
      };
    } catch (error) {
      console.error('خطأ في Gemini المتقدم:', error);
      throw error;
    }
  }

  // إحصائيات خدمة Gemini
  getServiceStats(): {
    name: string;
    nameArabic: string;
    available: boolean;
    features: string[];
    featuresArabic: string[];
    pricing: string;
    pricingArabic: string;
  } {
    return {
      name: 'Google Gemini Pro',
      nameArabic: 'جوجل جيميني برو',
      available: this.isAvailable(),
      features: [
        'Advanced reasoning',
        'Large context window',
        'Multimodal support',
        'Fast response times',
        'High accuracy'
      ],
      featuresArabic: [
        'تفكير متقدم',
        'نافذة سياق كبيرة',
        'دعم متعدد الوسائط',
        'أوقات استجابة سريعة',
        'دقة عالية'
      ],
      pricing: '$0.001 per 1K tokens',
      pricingArabic: '0.001$ لكل 1000 رمز'
    };
  }
}

export const geminiService = new GeminiService();