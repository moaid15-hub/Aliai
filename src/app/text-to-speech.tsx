// text-to-speech.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';

interface TextToSpeechProps {
  text: string;
  autoPlay?: boolean;
  className?: string;
}

export const TextToSpeech: React.FC<TextToSpeechProps> = ({ 
  text, 
  autoPlay = false,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // التحقق من دعم المتصفح
    setIsSupported('speechSynthesis' in window);
  }, []);

  useEffect(() => {
    if (autoPlay && isSupported && text) {
      const timer = setTimeout(() => handleSpeak(), 300);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, text, isSupported]);

  const cleanText = (rawText: string): string => {
    // تنظيف النص من markdown والرموز
    return rawText
      .replace(/```[\s\S]*?```/g, '') // إزالة code blocks
      .replace(/`[^`]*`/g, '') // إزالة inline code
      .replace(/\*\*([^*]+)\*\*/g, '$1') // إزالة bold
      .replace(/\*([^*]+)\*/g, '$1') // إزالة italic
      .replace(/#+ /g, '') // إزالة headings
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // إزالة links (الاحتفاظ بالنص فقط)
      .replace(/[🔍🎯📊⏱️💡✅❌🎥📚💻⚙️📰🌐👤👁️🔗📎]/g, '') // إزالة emojis
      .replace(/>\s*/g, '') // إزالة blockquotes
      .replace(/\n{3,}/g, '\n\n') // تقليل الأسطر الفارغة
      .trim();
  };

  const handleSpeak = () => {
    if (!isSupported) {
      console.warn('❌ Text-to-Speech not supported');
      return;
    }

    // إيقاف النطق الحالي إذا كان موجود
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      return;
    }

    const cleanedText = cleanText(text);
    
    if (!cleanedText || cleanedText.length < 2) {
      console.warn('⚠️ No text to speak');
      return;
    }

    // إزالة أي نطق سابق
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utteranceRef.current = utterance;

    // إعدادات الصوت العربي المحسنة
    utterance.lang = 'ar-SA'; // اللغة العربية السعودية
    utterance.rate = 0.95; // سرعة محسنة
    utterance.pitch = 1.0; // نغمة طبيعية
    utterance.volume = 1.0; // صوت عالي

    // محاولة اختيار صوت عربي بذكاء
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find(voice => 
        voice.lang === 'ar-SA' || 
        voice.lang.startsWith('ar') || 
        voice.name.toLowerCase().includes('arabic')
      );
      
      if (arabicVoice) {
        utterance.voice = arabicVoice;
        console.log('🔊 Using Arabic voice:', arabicVoice.name);
      } else {
        console.log('⚠️ No Arabic voice found, using default');
      }
    };
    
    // تحميل الأصوات إذا لم تكن محملة
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    } else {
      loadVoices();
    }

    // Event handlers
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      console.log('🔊 Started speaking');
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      console.log('✅ Finished speaking');
    };

    utterance.onerror = (event) => {
      console.error('❌ Speech error:', event.error);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onpause = () => {
      setIsPaused(true);
      console.log('⏸️ Speech paused');
    };

    utterance.onresume = () => {
      setIsPaused(false);
      console.log('▶️ Speech resumed');
    };

    // بدء النطق
    window.speechSynthesis.speak(utterance);
  };

  const handlePauseResume = () => {
    if (!isSupported) return;

    if (isPaused) {
      window.speechSynthesis.resume();
    } else {
      window.speechSynthesis.pause();
    }
  };

  const handleStop = () => {
    if (!isSupported) return;
    
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!isSupported) {
    return null; // لا تعرض الزر إذا المتصفح لا يدعم النطق
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* زر النطق الرئيسي */}
      <button
        onClick={handleSpeak}
        className={`
          p-2 rounded-lg transition-all duration-200
          ${isPlaying 
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
            : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
          }
          hover:scale-105 active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        title={isPlaying ? "إيقاف النطق" : "تشغيل النطق"}
        disabled={!text}
      >
        {isPlaying ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </button>

      {/* أزرار التحكم (إيقاف مؤقت/استئناف) */}
      {isPlaying && (
        <>
          <button
            onClick={handlePauseResume}
            className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400 
                     hover:bg-yellow-500/30 transition-all duration-200
                     hover:scale-105 active:scale-95"
            title={isPaused ? "استئناف" : "إيقاف مؤقت"}
          >
            {isPaused ? (
              <Play className="w-4 h-4" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
          </button>
        </>
      )}
    </div>
  );
};

export default TextToSpeech;
