// توجيه نماذج الذكاء الاصطناعي حسب الباقة
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserSubscription, subscriptionChecker } from '../subscription/checker';
import { FreeAIService } from './free-model';
import { GeminiService } from './gemini';
import { ClaudeService } from './claude';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface AIResponse {
  content?: string;
  message?: string;
  code?: string;
  language?: string;
  model: string;
  tokensUsed: number;
  cost?: number;
}

export interface AIServiceOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface AIService {
  generateResponse(prompt: string, options?: AIServiceOptions): Promise<AIResponse>;
  isAvailable(): boolean;
  getModelName(): string;
}

export class AIRouter {
  private static instance: AIRouter;
  private freeAI: FreeAIService;
  private geminiService: GeminiService;
  private claudeService: ClaudeService;

  constructor() {
    this.freeAI = new FreeAIService();
    this.geminiService = new GeminiService();
    this.claudeService = new ClaudeService();
  }

  static getInstance(): AIRouter {
    if (!AIRouter.instance) {
      AIRouter.instance = new AIRouter();
    }
    return AIRouter.instance;
  }

  async routeAIRequest(
    userPlan: string,
    prompt: string,
    type: 'chat' | 'code'
  ): Promise<AIResponse> {
    switch(userPlan) {
      case 'free':
        return this.generateBasicResponse(prompt, type);
        
      case 'premium':
        return this.generateGeminiResponse(prompt, type);
        
      case 'enterprise':
        return this.generateClaudeResponse(prompt, type);
        
      default:
        return this.generateBasicResponse(prompt, type);
    }
  }

  async generateBasicResponse(prompt: string, type: string): Promise<AIResponse> {
    // AI بسيط - ردود محدودة
    if (type === 'code') {
      return {
        code: `<!-- كود بسيط -->\n<div>${prompt}</div>`,
        language: 'html',
        model: 'free-ai',
        tokensUsed: 10
      };
    }
    return { 
      message: 'رد بسيط: ' + prompt,
      model: 'free-ai',
      tokensUsed: 5
    };
  }

  async generateGeminiResponse(prompt: string, type: string): Promise<AIResponse> {
    try {
      const model = gemini.getGenerativeModel({ model: "gemini-pro" });
      
      const systemPrompt = type === 'code' 
        ? 'أنت مبرمج خبير. اكتب كود نظيف واحترافي فقط بدون شرح.'
        : 'أنت مساعد ذكي ومفيد.';
        
      const result = await model.generateContent(systemPrompt + '\n\n' + prompt);
      const response = await result.response;
      
      if (type === 'code') {
        return {
          code: this.extractCode(response.text()),
          language: this.detectLanguage(prompt),
          model: 'gemini-pro',
          tokensUsed: 50
        };
      }
      
      return { 
        message: response.text(),
        model: 'gemini-pro',
        tokensUsed: 30
      };
    } catch (error) {
      console.error('Gemini error:', error);
      return this.generateBasicResponse(prompt, type);
    }
  }

  async generateClaudeResponse(prompt: string, type: string): Promise<AIResponse> {
    try {
      const systemPrompt = type === 'code'
        ? 'أنت خبير برمجة متقدم. اكتب كود احترافي كامل جاهز للاستخدام.'
        : 'أنت مساعد ذكي متقدم.';
        
      const message = await anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{
          role: "user",
          content: prompt
        }]
      });
      
      const content = message.content[0];
      const text = content.type === 'text' ? content.text : '';
      
      if (type === 'code') {
        return {
          code: this.extractCode(text),
          language: this.detectLanguage(prompt),
          model: 'claude-3-sonnet',
          tokensUsed: 100
        };
      }
      
      return { 
        message: text,
        model: 'claude-3-sonnet',
        tokensUsed: 80
      };
    } catch (error) {
      console.error('Claude error:', error);
      return this.generateGeminiResponse(prompt, type);
    }
  }

  private extractCode(text: string): string {
    const codeMatch = text.match(/```[\w]*\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1].trim() : text;
  }

  private detectLanguage(prompt: string): string {
    if (prompt.includes('react') || prompt.includes('jsx')) return 'jsx';
    if (prompt.includes('typescript') || prompt.includes('tsx')) return 'tsx';
    if (prompt.includes('css')) return 'css';
    if (prompt.includes('javascript') || prompt.includes('js')) return 'javascript';
    return 'html';
  }

  // توجيه الطلب لأفضل نموذج متاح حسب الباقة
  async route(
    subscription: UserSubscription,
    prompt: string,
    preferredModel?: string,
    options?: AIServiceOptions
  ): Promise<AIResponse> {
    // فحص صلاحية إرسال الرسالة
    const permission = await subscriptionChecker.checkMessagePermission(subscription);
    if (!permission.allowed) {
      throw new Error(permission.reasonArabic || permission.reason || 'غير مسموح بإرسال الرسالة');
    }

    // تحديد النموذج المناسب
    const selectedModel = this.selectBestModel(subscription, preferredModel);
    const service = this.getServiceForModel(selectedModel);

    if (!service || !service.isAvailable()) {
      // العودة للنموذج المجاني كبديل
      const fallbackService = this.freeAI;
      if (fallbackService.isAvailable()) {
        const response = await fallbackService.generateResponse(prompt, options);
        // تحديث إحصائيات الاستخدام
        subscriptionChecker.updateUsage(subscription, 'message');
        return response;
      }
      throw new Error('لا يوجد نموذج ذكاء اصطناعي متاح حالياً');
    }

    try {
      const response = await service.generateResponse(prompt, options);
      
      // تحديث إحصائيات الاستخدام
      subscriptionChecker.updateUsage(subscription, 'message');
      
      return response;
    } catch (error) {
      console.error(`خطأ في نموذج ${selectedModel}:`, error);
      
      // العودة للنموذج المجاني في حالة الخطأ
      if (selectedModel !== 'free-ai') {
        const fallbackResponse = await this.freeAI.generateResponse(prompt, options);
        subscriptionChecker.updateUsage(subscription, 'message');
        return fallbackResponse;
      }
      
      throw error;
    }
  }

  // اختيار أفضل نموذج متاح
  private selectBestModel(subscription: UserSubscription, preferredModel?: string): string {
    const availableModels = this.getAvailableModels(subscription);
    
    // إذا تم تحديد نموذج مفضل وهو متاح
    if (preferredModel && availableModels.includes(preferredModel)) {
      return preferredModel;
    }

    // اختيار أفضل نموذج متاح حسب الأولوية
    const modelPriority = ['claude-3-opus', 'gemini-pro', 'free-ai'];
    
    for (const model of modelPriority) {
      if (availableModels.includes(model)) {
        return model;
      }
    }

    return 'free-ai'; // النموذج الافتراضي
  }

  // الحصول على النماذج المتاحة للمستخدم
  getAvailableModels(subscription: UserSubscription): string[] {
    const { getPlanById } = require('../subscription/plans');
    const userPlan = getPlanById(subscription.planId);
    
    if (!userPlan) {
      return ['free-ai'];
    }

    return userPlan.limits.aiModels.filter((model: string) => {
      const service = this.getServiceForModel(model);
      return service && service.isAvailable();
    });
  }

  // الحصول على الخدمة المناسبة للنموذج
  private getServiceForModel(modelId: string): AIService | null {
    switch (modelId) {
      case 'free-ai':
        return this.freeAI;
      case 'gemini-pro':
        return this.geminiService;
      case 'claude-3-opus':
        return this.claudeService;
      default:
        return null;
    }
  }

  // إحصائيات الاستخدام
  async getUsageStats(subscription: UserSubscription): Promise<{
    currentUsage: any;
    limits: any;
    warningMessage: string | null;
  }> {
    const limits = subscriptionChecker.getCurrentLimits(subscription);
    const warningMessage = subscriptionChecker.getWarningMessage(subscription);

    return {
      currentUsage: subscription.usage,
      limits,
      warningMessage
    };
  }
}

export const aiRouter = AIRouter.getInstance();