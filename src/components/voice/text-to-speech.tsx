// text-to-speech.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';

interface TextToSpeechProps {
  text: string;
  autoPlay?: boolean;
  className?: string;
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
  voiceMode?: 'free' | 'premium'; // نوع الصوت
}

export const TextToSpeech: React.FC<TextToSpeechProps> = ({
  text,
  autoPlay = false,
  className = '',
  onSpeakStart,
  onSpeakEnd,
  voiceMode = 'premium'
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [useServerTTS, setUseServerTTS] = useState(true); // استخدام OpenAI TTS أولاً
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // التحقق من دعم المتصفح
    setIsSupported('speechSynthesis' in window);

    // الاستماع لحدث إيقاف شامل
    const handleStopAll = () => {
      console.log('🛑 تلقي حدث إيقاف شامل في TextToSpeech');
      // إيقاف Audio element إذا موجود
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      // إيقاف Browser TTS
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.addEventListener('stopAllAudio', handleStopAll);

    return () => {
      window.removeEventListener('stopAllAudio', handleStopAll);
    };
  }, []);

  useEffect(() => {
    if (autoPlay && isSupported && text) {
      const timer = setTimeout(() => handleSpeak(), 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // استخدام OpenAI TTS (صوت طبيعي جداً)
  const handleServerSpeak = async () => {
    const cleanedText = cleanText(text);

    if (!cleanedText || cleanedText.length < 2) {
      console.warn('⚠️ No text to speak');
      alert('لا يوجد نص للقراءة!');
      return;
    }

    try {
      console.log('🎙️ استخدام OpenAI TTS...');
      setIsPlaying(true);

      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: cleanedText,
          voice: 'alloy', // أفضل صوت بشري للعربي - واضح وطبيعي جداً
        }),
      });

      if (!response.ok) {
        console.warn('⚠️ Server TTS failed, falling back to browser TTS');
        setUseServerTTS(false);
        handleBrowserSpeak();
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // إنشاء Audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        console.log('✅ OpenAI TTS playing!');
        setIsPlaying(true);
        onSpeakStart?.();
      };

      audio.onended = () => {
        console.log('✅ OpenAI TTS finished');
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        onSpeakEnd?.();
      };

      audio.onerror = (e) => {
        console.error('❌ Audio playback error:', e);
        setIsPlaying(false);
        setUseServerTTS(false);
        handleBrowserSpeak();
      };

      await audio.play();

    } catch (error) {
      console.error('❌ Server TTS error:', error);
      setIsPlaying(false);
      setUseServerTTS(false);
      handleBrowserSpeak();
    }
  };

  // استخدام Browser TTS (احتياطي)
  const handleBrowserSpeak = () => {
    if (!isSupported) {
      console.error('❌ Text-to-Speech not supported in this browser');
      alert('عذراً! المتصفح لا يدعم تحويل النص إلى صوت. جرب Chrome أو Edge.');
      return;
    }

    // إيقاف النطق الحالي إذا كان موجود
    if (isPlaying) {
      console.log('⏹️ Stopping current speech');
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      return;
    }

    // التحقق من توفر الأصوات
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      console.warn('⚠️ No voices available yet, waiting...');
      // انتظار تحميل الأصوات
      window.speechSynthesis.onvoiceschanged = () => {
        const newVoices = window.speechSynthesis.getVoices();
        if (newVoices.length === 0) {
          alert('⚠️ لا توجد أصوات متاحة!\n\nالحل:\n1. استخدم Google Chrome\n2. أو Microsoft Edge\n\nهذه المتصفحات تحتوي على أصوات عربية مدمجة.');
        } else {
          handleSpeak(); // أعد المحاولة
        }
      };
      return;
    }

    const cleanedText = cleanText(text);

    if (!cleanedText || cleanedText.length < 2) {
      console.warn('⚠️ No text to speak');
      alert('لا يوجد نص للقراءة!');
      return;
    }

    console.log('📝 Text to speak:', cleanedText);

    // إزالة أي نطق سابق
    window.speechSynthesis.cancel();

    // الانتظار قليلاً بعد الإلغاء
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utteranceRef.current = utterance;

      // إعدادات الصوت العربي المحسنة
      utterance.lang = 'ar-SA';
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Event handlers
      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
        onSpeakStart?.();
        console.log('✅ Speech started!');
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        onSpeakEnd?.();
        console.log('✅ Speech finished');
      };

      utterance.onerror = (event) => {
        console.error('❌ Speech error:', event.error);
        setIsPlaying(false);
        setIsPaused(false);
        alert(`خطأ في النطق: ${event.error}`);
      };

      utterance.onpause = () => {
        setIsPaused(true);
        console.log('⏸️ Speech paused');
      };

      utterance.onresume = () => {
        setIsPaused(false);
        console.log('▶️ Speech resumed');
      };

      // تحميل الأصوات
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('🔊 Available voices:', voices.length);

        let arabicVoice = voices.find(voice => voice.lang === 'ar-SA');
        if (!arabicVoice) {
          arabicVoice = voices.find(voice => voice.lang.startsWith('ar'));
        }

        if (arabicVoice) {
          utterance.voice = arabicVoice;
          console.log('✅ Using Arabic voice:', arabicVoice.name);
        } else {
          console.warn('⚠️ No Arabic voice found');
          if (voices.length > 0) {
            utterance.voice = voices[0];
          }
        }
      };

      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        console.log('⏳ Waiting for voices...');
        window.speechSynthesis.onvoiceschanged = () => {
          loadVoices();
          window.speechSynthesis.speak(utterance);
        };
      } else {
        loadVoices();
        window.speechSynthesis.speak(utterance);
      }
    }, 100);
  };

  // الدالة الرئيسية للتحدث
  const handleSpeak = () => {
    // إيقاف الصوت الحالي
    if (isPlaying) {
      console.log('⏹️ Stopping audio');

      // إيقاف Audio element إذا موجود
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // إيقاف Browser TTS
      window.speechSynthesis.cancel();

      setIsPlaying(false);
      setIsPaused(false);
      return;
    }

    // اختيار نوع الصوت حسب الوضع
    if (voiceMode === 'free') {
      // استخدام Browser TTS (مجاني)
      console.log('🆓 استخدام الصوت المجاني (Browser TTS)');
      handleBrowserSpeak();
    } else {
      // استخدام OpenAI TTS (Premium)
      console.log('💎 استخدام الصوت البشري (OpenAI TTS)');
      if (useServerTTS) {
        handleServerSpeak();
      } else {
        handleBrowserSpeak();
      }
    }
  };

  const handlePauseResume = () => {
    if (!isSupported) return;

    if (isPaused) {
      window.speechSynthesis.resume();
    } else {
      window.speechSynthesis.pause();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
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

      {isPlaying && (
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
      )}
    </div>
  );
};

export default TextToSpeech;
