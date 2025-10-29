/**
 * GPT-4 Vision Service
 * خدمة رؤية GPT-4
 */

import { VisionResult, UploadedImage } from '../../../types/image-processing.types';

export class GPT4VisionService {
  private apiKey: string;
  private baseUrl: string = 'https://api.openai.com/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeImage(image: UploadedImage): Promise<VisionResult> {
    try {
      const base64Data = await this.convertToBase64(image.file);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'تحليل هذه الصورة التعليمية واستخراج أي نص أو معلومات مفيدة. الرد باللغة العربية.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/${image.format};base64,${base64Data}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1000
        })
      });

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content || '';
      
      return {
        provider: 'gpt4',
        description: content,
        extractedText: content,
        confidence: 0.95,
        processingTime: Date.now(),
        success: true
      };
    } catch (error) {
      return {
        provider: 'gpt4',
        description: '',
        extractedText: '',
        confidence: 0,
        processingTime: Date.now(),
        success: false,
        error: error instanceof Error ? error.message : 'خطأ في GPT-4 Vision'
      };
    }
  }

  private async convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}