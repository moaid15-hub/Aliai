// voice-search.tsx
// ============================================
// 🎤 نظام البحث الصوتي المتقدم
// ============================================

"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';

interface VoiceSearchProps {
  onSearchQuery: (query: string) => void;
  onError: (error: string) => void;
  language?: 'ar-SA' | 'en-US';
  disabled?: boolean;
}

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export const VoiceSearch: React.FC<VoiceSearchProps> = ({
  onSearchQuery,
  onError,
  language = 'ar-SA',
  disabled = false
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [volume, setVolume] = useState(0);
  const [canSpeak, setCanSpeak] = useState(false);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      setupRecognition();
    } else {
      setIsSupported(false);
      onError('🎤 البحث الصوتي غير مدعوم في هذا المتصفح');
    }

    if (speechSynthesis) {
      setCanSpeak(true);
    }

    return () => {
      stopListening();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const setupRecognition = () => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;
    
    recognition.continuous = false; // تغيير لتجنب التأخير
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 Voice recognition started');
      setIsListening(true);
      setIsProcessing(false);
      startVolumeMonitoring();
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const fullTranscript = finalTranscript || interimTranscript;
      setTranscript(fullTranscript);

      // معالجة فورية للنتيجة النهائية
      if (finalTranscript.trim() && finalTranscript.length > 2) {
        console.log('🎯 Final transcript:', finalTranscript);
        handleVoiceResult(finalTranscript.trim());
        recognition.stop(); // إيقاف فوري لتجنب التأخير
      }
    };

    recognition.onerror = (event: any) => {
      console.error('❌ Voice recognition error:', event.error);
      
      let errorMessage = 'حدث خطأ في التعرف الصوتي';
      switch (event.error) {
        case 'no-speech':
          errorMessage = '🔇 لم يتم رصد أي صوت، تحدث بوضوح أكبر';
          break;
        case 'audio-capture':
          errorMessage = '🎤 تعذر الوصول للميكروفون، تحقق من الأذونات';
          break;
        case 'not-allowed':
          errorMessage = '⛔ تم رفض الوصول للميكروفون، يرجى السماح بالوصول';
          break;
        case 'network':
          errorMessage = '🌐 مشكلة في الاتصال بالإنترنت';
          break;
        default:
          errorMessage = `❌ خطأ في التعرف الصوتي: ${event.error}`;
      }
      
      onError(errorMessage);
      stopListening();
    };

    recognition.onend = () => {
      console.log('🏁 Voice recognition ended');
      setIsListening(false);
      setIsProcessing(false);
      setTranscript('');
      stopVolumeMonitoring();
    };
  };

  const startVolumeMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      const updateVolume = () => {
        if (!analyserRef.current) return;
        
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        setVolume(average / 255);
        
        if (isListening) {
          animationRef.current = requestAnimationFrame(updateVolume);
        }
      };
      
      updateVolume();
    } catch (error) {
      console.warn('Volume monitoring failed:', error);
    }
  };

  const stopVolumeMonitoring = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setVolume(0);
  };

  const handleVoiceResult = (transcript: string) => {
    // معالجة سريعة ومباشرة
    const cleanTranscript = transcript.trim().replace(/[.!?]+$/, '').replace(/\s+/g, ' ');
    
    console.log('🚀 Instant voice processing:', cleanTranscript);
    
    // معالجة فورية بدون تأخير
    setIsProcessing(true);
    onSearchQuery(cleanTranscript);
    
    // إيقاف فوري
    stopListening();
    
    // تأكيد صوتي اختياري
    if (canSpeak) {
      setTimeout(() => speakResponse(`بحث: ${cleanTranscript}`), 100);
    }
  };

  const startListening = () => {
    if (!isSupported || !recognitionRef.current || disabled) return;
    
    try {
      setTranscript('');
      setIsProcessing(false);
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      onError('🎤 فشل في بدء التعرف الصوتي');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setIsProcessing(false);
    setTranscript('');
    stopVolumeMonitoring();
  };

  const speakResponse = (text: string) => {
    if (!canSpeak || !window.speechSynthesis) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400">
        <MicOff className="w-4 h-4" />
        <span>البحث الصوتي غير مدعوم</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Voice Search Button */}
      <button
        onClick={toggleListening}
        disabled={disabled || isProcessing}
        className={`
          relative p-3 rounded-full transition-all duration-300 flex items-center justify-center
          ${isListening 
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg scale-110' 
            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
          }
          ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isListening ? 'animate-pulse' : ''}
        `}
        title={isListening ? 'إيقاف البحث الصوتي' : 'بدء البحث الصوتي'}
      >
        {isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isListening ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
        
        {/* Volume indicator */}
        {isListening && (
          <div 
            className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
            style={{ 
              opacity: Math.min(volume * 3, 1),
              transform: `scale(${1 + volume})` 
            }}
          />
        )}
      </button>

      {/* Live Transcript Display */}
      {(isListening || isProcessing) && (
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-md">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {isProcessing ? '⚡ بحث فوري جاري...' : isListening ? '🎤 استمع...' : '⏹️ توقف'}
              </span>
            </div>
            <p className="text-sm text-gray-800 dark:text-gray-200 min-h-[20px]">
              {transcript || (isListening ? 'تحدث الآن...' : 'جاري المعالجة...')}
            </p>
          </div>
        </div>
      )}

      {/* Speaker Toggle */}
      {canSpeak && (
        <button
          onClick={() => setCanSpeak(!canSpeak)}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          title={canSpeak ? 'كتم الصوت' : 'تفعيل الصوت'}
        >
          {canSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
};

export default VoiceSearch;