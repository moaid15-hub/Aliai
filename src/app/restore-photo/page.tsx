'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Sparkles, Zap, Upload, Download, Image as ImageIcon, Camera, FolderOpen } from 'lucide-react';

export default function RestorePhotoPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [restoredUrl, setRestoredUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<'restore' | 'upscale'>('restore');
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // معاينة الصورة
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setOriginalUrl(URL.createObjectURL(file));
      setRestoredUrl('');
      setError('');
    }
  };

  // فتح اختيار من المعرض
  const openGallery = () => {
    fileInputRef.current?.click();
  };

  // فتح الكاميرا
  const openCamera = () => {
    cameraInputRef.current?.click();
  };

  // عملية الترميم
  const handleRestore = async () => {
    if (!imageFile) {
      setError('الرجاء اختيار صورة أولاً');
      return;
    }

    setLoading(true);
    setError('');
    setProgress('');

    try {
      // الخطوة 1: رفع الصورة
      setProgress('📤 جاري رفع الصورة...');
      const formData = new FormData();
      formData.append('image', imageFile);

      const uploadRes = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error || 'فشل رفع الصورة');
      }

      const { imageUrl } = await uploadRes.json();
      console.log('✅ تم الرفع:', imageUrl);

      // الخطوة 2: ترميم الصورة
      setProgress(`🔧 جاري ${action === 'restore' ? 'ترميم' : 'تكبير'} الصورة... قد يستغرق 30-60 ثانية`);
      
      const restoreRes = await fetch('/api/restore-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageUrl,
          action 
        })
      });

      if (!restoreRes.ok) {
        const errorData = await restoreRes.json();
        throw new Error(errorData.error || 'فشل معالجة الصورة');
      }

      const result = await restoreRes.json();
      
      if (result.success) {
        setRestoredUrl(result.restoredImageUrl);
        setProgress('✨ تم بنجاح!');
        console.log('✅ النتيجة:', result.restoredImageUrl);
      } else {
        throw new Error(result.error || 'حدث خطأ غير متوقع');
      }

    } catch (err) {
      console.error('❌ خطأ:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء المعالجة');
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* العنوان */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              ترميم الصور
            </h1>
          </div>
          <p className="text-gray-300 text-lg">
            أعد الحياة لصورك القديمة باستخدام تقنية AI المتطورة ✨
          </p>
        </div>

        {/* لوحة التحكم */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-6 md:p-8 mb-8">
          
          {/* اختيار الصورة */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
              <Upload className="w-5 h-5 text-purple-400" />
              اختر صورة:
            </label>

            {/* Input مخفي للمعرض */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Input مخفي للكاميرا */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* الأزرار التفاعلية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* زر المعرض */}
              <button
                onClick={openGallery}
                disabled={loading}
                className="group relative overflow-hidden p-6 rounded-2xl border-2 border-white/10 bg-gradient-to-br from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20 transition-all duration-300 transform hover:scale-105 hover:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/50 group-hover:shadow-purple-500/70 transition-all duration-300">
                    <FolderOpen className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white mb-1">
                      اختر من المعرض
                    </div>
                    <div className="text-xs text-gray-400">
                      تصفح صورك المحفوظة
                    </div>
                  </div>
                </div>
                {/* تأثير الخلفية */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              {/* زر الكاميرا */}
              <button
                onClick={openCamera}
                disabled={loading}
                className="group relative overflow-hidden p-6 rounded-2xl border-2 border-white/10 bg-gradient-to-br from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-300 transform hover:scale-105 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/50 group-hover:shadow-blue-500/70 transition-all duration-300">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white mb-1">
                      فتح الكاميرا
                    </div>
                    <div className="text-xs text-gray-400">
                      التقط صورة جديدة
                    </div>
                  </div>
                </div>
                {/* تأثير الخلفية */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            {/* معلومات الملف */}
            {imageFile ? (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">{imageFile.name}</div>
                    <div className="text-gray-400 text-xs">
                      {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setImageFile(null);
                      setOriginalUrl('');
                      setRestoredUrl('');
                    }}
                    className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors"
                  >
                    <span className="text-red-400">✕</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                <p className="text-sm text-gray-400">
                  💾 الحد الأقصى: 10MB | 📸 الأنواع المدعومة: JPG, PNG, WebP
                </p>
              </div>
            )}
          </div>

          {/* اختيار نوع المعالجة */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-lg font-semibold text-white mb-3">
              <Zap className="w-5 h-5 text-blue-400" />
              نوع المعالجة:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setAction('restore')}
                disabled={loading}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  action === 'restore'
                    ? 'border-purple-500 bg-gradient-to-br from-purple-500/20 to-blue-500/20 shadow-lg shadow-purple-500/50'
                    : 'border-white/10 bg-white/5 hover:border-purple-500/50'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Sparkles className={`w-8 h-8 mb-3 ${action === 'restore' ? 'text-purple-400' : 'text-gray-400'}`} />
                <div className={`font-bold text-lg mb-2 ${action === 'restore' ? 'text-white' : 'text-gray-300'}`}>
                  ترميم شامل
                </div>
                <div className="text-xs text-gray-400">
                  إصلاح الخدوش + تحسين الوجوه + رفع الجودة
                </div>
              </button>

              <button
                onClick={() => setAction('upscale')}
                disabled={loading}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  action === 'upscale'
                    ? 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-purple-500/20 shadow-lg shadow-blue-500/50'
                    : 'border-white/10 bg-white/5 hover:border-blue-500/50'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Zap className={`w-8 h-8 mb-3 ${action === 'upscale' ? 'text-blue-400' : 'text-gray-400'}`} />
                <div className={`font-bold text-lg mb-2 ${action === 'upscale' ? 'text-white' : 'text-gray-300'}`}>
                  تكبير 4x
                </div>
                <div className="text-xs text-gray-400">
                  زيادة الدقة + تحسين التفاصيل
                </div>
              </button>
            </div>
          </div>

          {/* زر الترميم */}
          <button
            onClick={handleRestore}
            disabled={loading || !imageFile}
            className={`w-full py-5 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105
                     ${loading || !imageFile
                       ? 'bg-gray-600 cursor-not-allowed opacity-50'
                       : 'bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-[length:200%_100%] hover:bg-right text-white shadow-2xl shadow-purple-500/50'
                     }`}
            style={{
              backgroundSize: '200% 100%',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                جاري المعالجة...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {action === 'restore' ? <Sparkles className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                {action === 'restore' ? 'رمم الصورة' : 'كبّر الصورة'}
              </span>
            )}
          </button>

          {/* رسالة التقدم */}
          {progress && (
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-300 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                {progress}
              </div>
            </div>
          )}

          {/* رسالة خطأ */}
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="text-xl">❌</span>
                {error}
              </div>
            </div>
          )}
        </div>

        {/* عرض النتائج */}
        {(originalUrl || restoredUrl) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            
            {/* الصورة الأصلية */}
            {originalUrl && (
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                  الصورة الأصلية
                </h3>
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/30 border border-white/5">
                  <Image
                    src={originalUrl}
                    alt="Original"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}

            {/* الصورة المرممة */}
            {restoredUrl && (
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  بعد المعالجة
                </h3>
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/30 border border-purple-500/30 shadow-lg shadow-purple-500/20">
                  <Image
                    src={restoredUrl}
                    alt="Restored"
                    fill
                    className="object-contain"
                  />
                </div>
                <a
                  href={restoredUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 w-full py-3 
                           bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700
                           text-white rounded-xl font-semibold text-center transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  تحميل الصورة
                </a>
              </div>
            )}
          </div>
        )}

        {/* معلومات إضافية */}
        <div className="mt-12 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div className="p-4">
              <div className="text-3xl mb-2">💡</div>
              <div className="text-gray-300 text-sm font-medium">التكلفة</div>
              <div className="text-purple-400 font-bold">~$0.002</div>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-gray-300 text-sm font-medium">المدة</div>
              <div className="text-blue-400 font-bold">30-60 ثانية</div>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">🔒</div>
              <div className="text-gray-300 text-sm font-medium">الأمان</div>
              <div className="text-green-400 font-bold">100% آمن</div>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">🎨</div>
              <div className="text-gray-300 text-sm font-medium">التقنية</div>
              <div className="text-pink-400 font-bold">Replicate AI</div>
            </div>
          </div>
          <div className="mt-4 text-center text-xs text-gray-500">
            Powered by GFPGAN + Real-ESRGAN
          </div>
        </div>

      </div>
    </div>
  );
}
