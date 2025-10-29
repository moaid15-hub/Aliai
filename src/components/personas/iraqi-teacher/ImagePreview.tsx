/**
 * ImagePreview Component
 * مكون معاينة الصور المرفوعة
 */

import React from 'react';
import './ImagePreview.css';

interface ImagePreviewProps {
  imageUrl: string;
  fileName?: string;
  fileSize?: number;
  onRemove?: () => void;
  onReplace?: () => void;
  isLoading?: boolean;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl,
  fileName,
  fileSize,
  onRemove,
  onReplace,
  isLoading = false
}) => {
  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} بايت`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} كيلوبايت`;
    return `${(size / (1024 * 1024)).toFixed(1)} ميجابايت`;
  };

  return (
    <div className="image-preview">
      <div className="image-preview__container">
        {isLoading ? (
          <div className="image-preview__loading">
            <div className="image-preview__spinner"></div>
            <p>جاري تحميل الصورة...</p>
          </div>
        ) : (
          <img 
            src={imageUrl} 
            alt={fileName || 'صورة مرفوعة'}
            className="image-preview__image"
          />
        )}
        
        <div className="image-preview__overlay">
          <div className="image-preview__actions">
            {onReplace && (
              <button 
                className="image-preview__btn image-preview__btn--replace"
                onClick={onReplace}
                title="استبدال الصورة"
              >
                🔄
              </button>
            )}
            {onRemove && (
              <button 
                className="image-preview__btn image-preview__btn--remove"
                onClick={onRemove}
                title="حذف الصورة"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>

      {(fileName || fileSize) && (
        <div className="image-preview__info">
          {fileName && (
            <p className="image-preview__filename">
              📄 {fileName}
            </p>
          )}
          {fileSize && (
            <p className="image-preview__filesize">
              📊 {formatFileSize(fileSize)}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ImagePreview;
