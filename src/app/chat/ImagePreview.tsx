"use client";

import React from 'react';
import { X, Download, Maximize2, Wand2, FileText, Zap, Send } from 'lucide-react';

interface ImagePreviewProps {
  files: File[];
  onRemove: (index: number) => void;
  onAnalyze?: (file: File) => void;
  onSend?: () => void;
}

export default function ImagePreview({ files, onRemove, onAnalyze, onSend }: ImagePreviewProps) {
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [showFilters, setShowFilters] = React.useState<number | null>(null);

  const getImageUrl = (file: File) => {
    return URL.createObjectURL(file);
  };

  const downloadImage = (file: File) => {
    const url = getImageUrl(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
  };
  
  const applyFilter = async (file: File, filter: string) => {
    try {
      const { applyFilter: applyFilterUtil } = await import('./image-utils');
      const filteredImage = await applyFilterUtil(file, filter as any);
      
      // تحويل base64 إلى blob وتحميله
      const response = await fetch(filteredImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `filtered_${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('فشل تطبيق الفلتر:', error);
      alert('فشل تطبيق الفلتر على الصورة');
    }
  };
  
  const extractText = async (file: File) => {
    try {
      const { extractTextFromImage } = await import('./image-utils');
      const text = await extractTextFromImage(file);
      alert(`النص المستخرج:\n\n${text}`);
    } catch (error) {
      console.error('فشل استخراج النص:', error);
      alert('فشل استخراج النص من الصورة');
    }
  };

  return (
    <>
      {/* عنوان مع زر إرسال */}
      <div className="flex items-center justify-between mt-4 mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
            📸 {files.length} صورة جاهزة
          </span>
        </div>
        {onSend && (
          <button
            onClick={onSend}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <Send className="w-4 h-4" />
            <span className="text-sm font-medium">إرسال الصور</span>
          </button>
        )}
      </div>

      {/* Grid عرض الصور */}
      <div className="flex flex-wrap gap-4 mb-3">
        {files.map((file, idx) => (
          <div 
            key={idx} 
            className="relative group rounded-2xl overflow-hidden border-2 border-purple-300 dark:border-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            style={{ width: '180px', height: '180px' }}
          >
            <img 
              src={getImageUrl(file)} 
              alt={file.name}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay مع الأزرار */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300">
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                {/* زر التكبير */}
                <button
                  onClick={() => setSelectedImage(getImageUrl(file))}
                  className="opacity-0 group-hover:opacity-100 p-1.5 bg-white/90 rounded-lg hover:bg-white transition-all transform hover:scale-110"
                  title="تكبير"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-gray-800" />
                </button>
                
                {/* زر الفلاتر */}
                <button
                  onClick={() => setShowFilters(showFilters === idx ? null : idx)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 bg-purple-500/90 rounded-lg hover:bg-purple-500 transition-all transform hover:scale-110"
                  title="فلاتر"
                >
                  <Wand2 className="w-3.5 h-3.5 text-white" />
                </button>
                
                {/* زر OCR */}
                <button
                  onClick={() => extractText(file)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 bg-blue-500/90 rounded-lg hover:bg-blue-500 transition-all transform hover:scale-110"
                  title="استخراج النص"
                >
                  <FileText className="w-3.5 h-3.5 text-white" />
                </button>
                
                {/* زر التحميل */}
                <button
                  onClick={() => downloadImage(file)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 bg-green-500/90 rounded-lg hover:bg-green-500 transition-all transform hover:scale-110"
                  title="تحميل"
                >
                  <Download className="w-3.5 h-3.5 text-white" />
                </button>
                
                {/* زر الحذف */}
                <button
                  onClick={() => onRemove(idx)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 bg-red-500/90 rounded-lg hover:bg-red-500 transition-all transform hover:scale-110"
                  title="حذف"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
              
              {/* قائمة الفلاتر */}
              {showFilters === idx && (
                <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-xl">
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={() => applyFilter(file, 'grayscale')}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-all"
                    >
                      أبيض وأسود
                    </button>
                    <button
                      onClick={() => applyFilter(file, 'sepia')}
                      className="px-2 py-1 text-xs bg-amber-100 hover:bg-amber-200 rounded transition-all"
                    >
                      سيبيا
                    </button>
                    <button
                      onClick={() => applyFilter(file, 'blur')}
                      className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded transition-all"
                    >
                      ضبابي
                    </button>
                    <button
                      onClick={() => applyFilter(file, 'brightness')}
                      className="px-2 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 rounded transition-all"
                    >
                      إضاءة
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* اسم الملف */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <p className="text-xs text-white truncate font-medium">{file.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal عرض الصورة بالكامل */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          
          <img 
            src={selectedImage} 
            alt="Preview"
            className="max-w-full max-h-full rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

