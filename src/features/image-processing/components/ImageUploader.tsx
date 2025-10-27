// مكون رفع ومعالجة الصور

import { useState, useCallback } from 'react';
import { ImageUpload, ImageProcessingMethod } from '@/features/image-processing/types/image-processing.types';
import { ImageProcessor } from '@/features/image-processing/services';

interface ImageUploaderProps {
  method: ImageProcessingMethod;
  onProcessComplete?: (result: any) => void;
  maxFiles?: number;
}

export function ImageUploader({ 
  method, 
  onProcessComplete,
  maxFiles = 5 
}: ImageUploaderProps) {
  const [uploads, setUploads] = useState<ImageUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // معالج رفع الملفات
  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files) return;

    const newUploads: ImageUpload[] = Array.from(files).map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      status: 'pending' as const,
    }));

    setUploads(prev => [...prev, ...newUploads].slice(0, maxFiles));

    // معالجة الصور
    const processor = new ImageProcessor({
      method,
      fallbackToVision: true,
      maxImageSize: 10 * 1024 * 1024, // 10MB
      supportedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    });

    for (const upload of newUploads) {
      setUploads(prev => 
        prev.map(u => 
          u.id === upload.id 
            ? { ...u, status: 'processing' as const }
            : u
        )
      );

      try {
        const result = await processor.processImage(upload.file);
        
        setUploads(prev => 
          prev.map(u => 
            u.id === upload.id 
              ? { ...u, status: 'completed' as const, result }
              : u
          )
        );

        onProcessComplete?.(result);
  } catch (_error) {
        setUploads(prev => 
          prev.map(u => 
            u.id === upload.id 
              ? { ...u, status: 'failed' as const }
              : u
          )
        );
      }
    }
  }, [method, maxFiles, onProcessComplete]);

  // معالج السحب والإفلات
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  return (
    <div className="image-uploader">
      {/* منطقة الرفع */}
      <div 
        className={`upload-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="image-upload"
          accept="image/*"
          multiple
          onChange={(e) => handleFileUpload(e.target.files)}
          style={{ display: 'none' }}
        />
        <label htmlFor="image-upload">
          <div className="upload-content">
            <span className="upload-icon">📸</span>
            <p>اسحب الصور هنا أو انقر للتحميل</p>
            <small>
              {method === 'ai_vision' && '🧠 AI Vision: يفهم الرسومات والمخططات'}
              {method === 'ocr' && '⚡ OCR: أسرع وأرخص للنصوص الواضحة'}
              {method === 'hybrid' && '🎯 Hybrid: الأذكى - يجرب OCR أولاً'}
            </small>
          </div>
        </label>
      </div>

      {/* قائمة الصور المرفوعة */}
      {uploads.length > 0 && (
        <div className="uploads-list">
          {uploads.map(upload => (
            <div key={upload.id} className={`upload-item status-${upload.status}`}>
              <img src={upload.preview} alt="preview" />
              <div className="upload-info">
                <span className="filename">{upload.file.name}</span>
                <span className="status">
                  {upload.status === 'pending' && '⏳ في الانتظار...'}
                  {upload.status === 'processing' && '⚙️ جاري المعالجة...'}
                  {upload.status === 'completed' && '✅ تم'}
                  {upload.status === 'failed' && '❌ فشل'}
                </span>
              </div>
              {upload.result && (
                <div className="result-preview">
                  {upload.result.extractedText && (
                    <p className="extracted-text">
                      {upload.result.extractedText.slice(0, 100)}...
                    </p>
                  )}
                  {upload.result.visionAnalysis && (
                    <div className="vision-tags">
                      {upload.result.visionAnalysis.isMath && <span>📐 رياضيات</span>}
                      {upload.result.visionAnalysis.isDiagram && <span>📊 رسم</span>}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


