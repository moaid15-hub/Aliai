// خدمة Claude AI من Anthropic
import { AIService, AIResponse, AIServiceOptions } from './router';

export class ClaudeService implements AIService {
  private modelName = 'claude-3-opus';
  private apiKey: string;
  private apiEndpoint = 'https://api.anthropic.com/v1/messages';

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
  }

  async generateResponse(prompt: string, options?: AIServiceOptions): Promise<AIResponse> {
    if (!this.isAvailable()) {
      throw new Error('خدمة Claude غير متاحة - مفتاح API مفقود');
    }

    try {
      const response = await this.callClaudeAPI(prompt, options);
      
      return {
        content: response.content,
        model: this.modelName,
        tokensUsed: response.tokensUsed,
        cost: this.calculateCost(response.tokensUsed)
      };
    } catch (error) {
      console.error('خطأ في خدمة Claude:', error);
      throw new Error('فشل في الحصول على استجابة من Claude');
    }
  }

  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  getModelName(): string {
    return this.modelName;
  }

  private async callClaudeAPI(prompt: string, options?: AIServiceOptions): Promise<{ content: string; tokensUsed: number }> {
    const messages = this.buildMessages(prompt, options);
    
    const requestBody = {
      model: 'claude-3-opus-20240229',
      max_tokens: options?.maxTokens || 1000,
      temperature: options?.temperature || 0.7,
      messages: messages,
      system: options?.systemPrompt || 'أنت مساعد ذكي مفيد ومتعاون. أجب بالعربية إذا كان السؤال بالعربية.'
    };

    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Claude API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.content || data.content.length === 0) {
      throw new Error('لم يتم الحصول على استجابة من Claude');
    }

    const content = data.content[0]?.text || '';
    const tokensUsed = data.usage?.input_tokens + data.usage?.output_tokens || this.estimateTokens(prompt + content);

    return {
      content,
      tokensUsed
    };
  }

  private buildMessages(userPrompt: string, options?: AIServiceOptions): Array<{ role: string; content: string }> {
    return [
      {
        role: 'user',
        content: userPrompt
      }
    ];
  }

  private estimateTokens(text: string): number {
    // تقدير تقريبي لـ Claude (حوالي 3.5 أحرف لكل token)
    return Math.ceil(text.length / 3.5);
  }

  private calculateCost(tokensUsed: number): number {
    // تكلفة Claude 3 Opus (تقديرية)
    // $15 per 1M input tokens
    // $75 per 1M output tokens
    const avgCostPer1KTokens = 0.045; // متوسط التكلفة
    return (tokensUsed / 1000) * avgCostPer1KTokens;
  }

  // استخدام Claude مع أنواع مختلفة من النماذج
  async generateWithModel(
    prompt: string,
    model: 'claude-3-opus' | 'claude-3-sonnet' | 'claude-3-haiku' = 'claude-3-opus',
    options?: AIServiceOptions
  ): Promise<AIResponse> {
    if (!this.isAvailable()) {
      throw new Error('خدمة Claude غير متاحة');
    }

    const modelVersions = {
      'claude-3-opus': 'claude-3-opus-20240229',
      'claude-3-sonnet': 'claude-3-sonnet-20240229',
      'claude-3-haiku': 'claude-3-haiku-20240307'
    };

    const requestBody = {
      model: modelVersions[model],
      max_tokens: options?.maxTokens || 1000,
      temperature: options?.temperature || 0.7,
      messages: this.buildMessages(prompt, options),
      system: options?.systemPrompt || 'أنت مساعد ذكي مفيد ومتعاون.'
    };

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.content[0]?.text || '';
      const tokensUsed = data.usage?.input_tokens + data.usage?.output_tokens || this.estimateTokens(prompt + content);

      return {
        content,
        model: model,
        tokensUsed,
        cost: this.calculateCost(tokensUsed)
      };
    } catch (error) {
      console.error(`خطأ في Claude ${model}:`, error);
      throw error;
    }
  }

  // تحليل المحتوى مع Claude
  async analyzeContent(
    content: string,
    analysisType: 'summary' | 'sentiment' | 'translation' | 'explanation' = 'summary',
    targetLanguage?: string
  ): Promise<AIResponse> {
    const prompts = {
      summary: `لخص المحتوى التالي بشكل مختصر ومفيد:\n\n${content}`,
      sentiment: `حلل المشاعر والنبرة في النص التالي:\n\n${content}`,
      translation: `ترجم النص التالي إلى ${targetLanguage || 'العربية'}:\n\n${content}`,
      explanation: `اشرح وفسر المحتوى التالي بطريقة بسيطة وواضحة:\n\n${content}`
    };

    const prompt = prompts[analysisType];
    return this.generateResponse(prompt, {
      maxTokens: 1500,
      temperature: 0.3
    });
  }

  // إحصائيات خدمة Claude
  getServiceStats(): {
    name: string;
    nameArabic: string;
    available: boolean;
    features: string[];
    featuresArabic: string[];
    models: string[];
    pricing: string;
    pricingArabic: string;
  } {
    return {
      name: 'Anthropic Claude 3',
      nameArabic: 'كلود 3 من أنثروبيك',
      available: this.isAvailable(),
      features: [
        'Exceptional reasoning',
        'Long context understanding',
        'Safe and helpful responses',
        'Multiple model sizes',
        'Advanced analysis capabilities'
      ],
      featuresArabic: [
        'تفكير استثنائي',
        'فهم السياق الطويل',
        'إجابات آمنة ومفيدة',
        'أحجام نماذج متعددة',
        'قدرات تحليل متقدمة'
      ],
      models: ['Claude 3 Opus', 'Claude 3 Sonnet', 'Claude 3 Haiku'],
      pricing: '$15-$75 per 1M tokens',
      pricingArabic: '15-75$ لكل مليون رمز'
    };
  }
}

export const claudeService = new ClaudeService();