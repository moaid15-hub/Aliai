/**
 * Azure OCR Service
 * خدمة التعرف على النصوص بـ Azure
 */

import { OCRResult, UploadedImage } from '../../../types/image-processing.types';

export class AzureOCRService {
  private subscriptionKey: string;
  private endpoint: string;

  constructor(subscriptionKey: string, endpoint: string) {
    this.subscriptionKey = subscriptionKey;
    this.endpoint = endpoint;
  }

  async extractText(image: UploadedImage): Promise<OCRResult> {
    try {
      const startTime = Date.now();
      
      // إرسال الصورة للتحليل
      const analyzeResponse = await fetch(`${this.endpoint}/vision/v3.2/read/analyze`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'Content-Type': 'application/octet-stream'
        },
        body: image.file
      });

      if (!analyzeResponse.ok) {
        throw new Error(`Azure OCR خطأ: ${analyzeResponse.status}`);
      }

      const operationLocation = analyzeResponse.headers.get('Operation-Location');
      if (!operationLocation) {
        throw new Error('لم يتم الحصول على Operation-Location من Azure');
      }

      // انتظار النتائج
      let result;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;

        const resultResponse = await fetch(operationLocation, {
          headers: {
            'Ocp-Apim-Subscription-Key': this.subscriptionKey
          }
        });

        result = await resultResponse.json();
      } while (result.status === 'running' && attempts < maxAttempts);

      const endTime = Date.now();

      if (result.status === 'succeeded') {
        const pages = result.analyzeResult?.readResults || [];
        let extractedText = '';
        
        pages.forEach((page: any) => {
          page.lines.forEach((line: any) => {
            extractedText += line.text + '\n';
          });
        });

        return {
          provider: 'azure',
          text: extractedText.trim(),
          confidence: 0.92,
          language: 'ar',
          processingTime: endTime - startTime,
          success: extractedText.trim().length > 0
        };
      } else {
        throw new Error(`Azure OCR فشل: ${result.status}`);
      }
    } catch (error) {
      return {
        provider: 'azure',
        text: '',
        confidence: 0,
        language: 'ar',
        processingTime: Date.now(),
        success: false,
        error: error instanceof Error ? error.message : 'خطأ في Azure OCR'
      };
    }
  }
}