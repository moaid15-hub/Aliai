/**
 * Google Vision OCR Service
 * خدمة التعرف على النصوص بـ Google Vision
 */

import { OCRResult, UploadedImage } from '../../../types/image-processing.types';

export class GoogleVisionOCRService {
  private apiKey: string;
  private baseUrl: string = 'https://vision.googleapis.com/v1/images:annotate';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async extractText(image: UploadedImage): Promise<OCRResult> {
    try {
      const startTime = Date.now();
      const base64Data = await this.convertToBase64(image.file);
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Data
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                  maxResults: 1
                }
              ]
            }
          ]
        })
      });

      const result = await response.json();
      const endTime = Date.now();
      
      const textAnnotations = result.responses?.[0]?.textAnnotations;
      const extractedText = textAnnotations?.[0]?.description || '';
      const confidence = textAnnotations?.[0]?.confidence || 0.8;
      
      return {
        provider: 'google-vision',
        text: extractedText,
        confidence: confidence,
        language: 'ar',
        processingTime: endTime - startTime,
        success: extractedText.length > 0
      };
    } catch (error) {
      return {
        provider: 'google-vision',
        text: '',
        confidence: 0,
        language: 'ar',
        processingTime: Date.now(),
        success: false,
        error: error instanceof Error ? error.message : 'خطأ في Google Vision OCR'
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