/**
 * Claude Vision Service
 * خدمة رؤية كلود
 */

import { VisionResult, UploadedImage } from '../../../types/image-processing.types';

export class ClaudeVisionService {
  private apiKey: string;
  private baseUrl: string = 'https://api.anthropic.com/v1/messages';

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
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: `image/${image.format}`,
                    data: base64Data
                  }
                },
                {
                  type: 'text',
                  text: 'تحليل هذه الصورة واستخراج أي نص أو معلومات تعليمية. الرد باللغة العربية.'
                }
              ]
            }
          ]
        })
      });

      const result = await response.json();
      
      return {
        provider: 'claude',
        description: result.content[0]?.text || '',
        extractedText: result.content[0]?.text || '',
        confidence: 0.9,
        processingTime: Date.now(),
        success: true
      };
    } catch (error) {
      return {
        provider: 'claude',
        description: '',
        extractedText: '',
        confidence: 0,
        processingTime: Date.now(),
        success: false,
        error: error instanceof Error ? error.message : 'خطأ في Claude Vision'
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