/**
 * ImageUploader Component
 * مكون رفع الصور
 */

import React, { useRef, useState } from 'react';
import './ImageUploader.css';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  acceptedFormats?: string[];
  maxSize?: number;
  isLoading?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUpload,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxSize = 10 * 1024 * 1024, // 10MB
  isLoading = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');

  const validateFile = (file: File): boolean => {
    if (!acceptedFormats.includes(file.type)) {
      setError('نوع الملف غير مدعوم. يرجى رفع صورة بصيغة JPG أو PNG');
      return false;
    }
    if (file.size > maxSize) {
      setError('حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت');
      return false;
    }
    setError('');
    return true;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (validateFile(file)) {
      onImageUpload(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="image-uploader">
      <div 
        className={`image-uploader__dropzone ${
          dragActive ? 'image-uploader__dropzone--active' : ''
        } ${isLoading ? 'image-uploader__dropzone--loading' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleInputChange}
          className="image-uploader__input"
          disabled={isLoading}
        />

        {isLoading ? (
          <div className="image-uploader__loading">
            <div className="image-uploader__spinner"></div>
            <p>جاري رفع الصورة...</p>
          </div>
        ) : (
          <div className="image-uploader__content">
            <div className="image-uploader__icon">📸</div>
            <h3 className="image-uploader__title">
              ارفع صورة واجبك هنا حبيبي
            </h3>
            <p className="image-uploader__subtitle">
              اسحب الصورة هنا أو اضغط للاختيار
            </p>
            <div className="image-uploader__formats">
              صيغ مدعومة: JPG, PNG, WebP (حتى 10 ميجابايت)
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="image-uploader__error">
          ❌ {error}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;