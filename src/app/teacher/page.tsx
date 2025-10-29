'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Message as AIMessage, ToastData } from '@/lib/types';

const VideoCards = dynamic(() => import('@/components/personas/iraqi-teacher/VideoCards'), { ssr: false });

interface Message extends AIMessage {
  sources?: any[];
  videos?: any[];
  image?: string;
  isSearching?: boolean;
  isSearchResults?: boolean;
  isTeacherLoading?: boolean;
  isTeacherResponse?: boolean;
}

export default function TeacherPage() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice Control States
  const [selectedVoice, setSelectedVoice] = useState<string>('alloy');
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // التحكم في عرض قسم الإعدادات
  const [isPlayingSample, setIsPlayingSample] = useState<string | null>(null);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState<boolean>(true);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [autoSendVoice, setAutoSendVoice] = useState<boolean>(true);
  const [useFreeVoice, setUseFreeVoice] = useState<boolean>(false); // استخدام الصوت المدفوع (OpenAI) افتراضياً
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false); // تتبع حالة تشغيل الصوت
  const [cancelRequest, setCancelRequest] = useState<boolean>(false); // إلغاء الطلب الحالي
  const [currentlyPlayingMessageId, setCurrentlyPlayingMessageId] = useState<string | null>(null); // معرف الرسالة التي يتم تشغيل صوتها حالياً
  const currentAudioRef = useRef<HTMLAudioElement | null>(null); // مرجع للصوت الحالي

  // Conversation Management
  const [showConversations, setShowConversations] = useState(false);
  const [savedConversations, setSavedConversations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedMessages, setBookmarkedMessages] = useState<string[]>([]);

  // Image Upload
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Camera
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Calculator
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState<string>('0');
  const [calcPrevValue, setCalcPrevValue] = useState<number | null>(null);
  const [calcOperator, setCalcOperator] = useState<string | null>(null);
  const [calcWaitingForOperand, setCalcWaitingForOperand] = useState<boolean>(false);
  const [calcMemory, setCalcMemory] = useState<number>(0);
  const [calcHistory, setCalcHistory] = useState<string[]>([]);
  const [calcScientificMode, setCalcScientificMode] = useState<boolean>(false);
  const [calcAngleMode, setCalcAngleMode] = useState<'deg' | 'rad'>('deg');

  // Audio refs for replay
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
  const recognitionRef = useRef<any>(null);

  // Auto scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // تنظيف الكاميرا عند إغلاق المكون
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Auto-send after voice input
  useEffect(() => {
    if (!isListening && input.trim() && autoSendVoice && !isLoading) {
      const timer = setTimeout(() => {
        handleSend();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isListening]);

  // Auto-save conversation every 30 seconds
  useEffect(() => {
    const autoSave = () => {
      if (messages.length > 0) {
        const conversationData = {
          id: Date.now().toString(),
          messages,
          timestamp: new Date().toISOString(),
          grade: selectedGrade,
          subject: selectedSubject,
          title: messages[0]?.content?.substring(0, 50) + '...' || 'محادثة جديدة',
          lastSaved: new Date().toISOString()
        };
        
        // حفظ المحادثة الحالية
        localStorage.setItem('currentConversation', JSON.stringify(conversationData));
        
        // إضافة للمحادثات المحفوظة
        const savedConversations = JSON.parse(localStorage.getItem('savedConversations') || '[]');
        const existingIndex = savedConversations.findIndex((conv: any) => conv.id === conversationData.id);
        
        if (existingIndex >= 0) {
          savedConversations[existingIndex] = conversationData;
        } else {
          savedConversations.unshift(conversationData);
          // احتفظ بآخر 50 محادثة فقط
          if (savedConversations.length > 50) {
            savedConversations.splice(50);
          }
        }
        
        localStorage.setItem('savedConversations', JSON.stringify(savedConversations));
        console.log('💾 تم الحفظ التلقائي:', new Date().toLocaleTimeString('ar-IQ'));
      }
    };

    // حفظ فوري عند تغيير الرسائل
    const timer = setTimeout(autoSave, 1000);
    
    // حفظ دوري كل 30 ثانية
    const interval = setInterval(autoSave, 30000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [messages, selectedGrade, selectedSubject]);

  // Restore conversation on load
  useEffect(() => {
    const restoreConversation = () => {
      const saved = localStorage.getItem('currentConversation');
      if (saved && messages.length === 0) {
        try {
          const conversationData = JSON.parse(saved);
          if (conversationData.messages && conversationData.messages.length > 0) {
            setMessages(conversationData.messages);
            setSelectedGrade(conversationData.grade || 'الصف السادس الابتدائي');
            setSelectedSubject(conversationData.subject || 'الرياضيات');
            setToast({
              message: 'تم استرجاع آخر محادثة تلقائياً',
              type: 'success',
            });
          }
        } catch (error) {
          console.error('خطأ في استرجاع المحادثة:', error);
        }
      }
    };

    restoreConversation();
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'ar-SA';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          const newText = finalTranscript.trim();
          setInput(prev => prev + newText);
          setCurrentTranscript('');

          // إرسال تلقائي إذا كان مفعل
          if (autoSendVoice && newText) {
            // إيقاف التسجيل أولاً
            if (recognitionRef.current) {
              recognitionRef.current.stop();
            }
          }
        } else {
          setCurrentTranscript(interimTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setToast({
          message: 'خطأ في التعرف على الصوت',
          type: 'error',
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setCurrentTranscript('');
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [autoSendVoice]);

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Camera Functions
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // استخدام الكاميرا الخلفية على الموبايل
        audio: false
      });

      streamRef.current = stream;
      setIsCameraOpen(true);

      // انتظر قليلاً حتى يتم تحميل عنصر الفيديو
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setToast({
        message: 'فشل الوصول إلى الكاميرا. تأكد من السماح بالوصول إلى الكاميرا.',
        type: 'error',
      });
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setUploadedImage(imageData);
        closeCamera();
        setToast({
          message: 'تم التقاط الصورة بنجاح!',
          type: 'success',
        });
      }
    }
  };

  // Toggle Microphone
  const toggleMicrophone = () => {
    if (!recognitionRef.current) {
      setToast({
        message: 'المتصفح لا يدعم التعرف على الصوت',
        type: 'error',
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setCurrentTranscript('');
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Stop/Cancel voice recording
  const stopVoiceRecording = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setCurrentTranscript('');
      setInput(''); // مسح النص المدخل
      setToast({
        message: 'تم إلغاء التسجيل الصوتي',
        type: 'info',
      });
    }
  };

  // Stop/Mute current audio
  const stopCurrentAudio = () => {
    // إيقاف الصوت الأساسي (الردود الجديدة)
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
      setIsSpeaking(false);
      setIsLoadingAudio(false);
    }

    // إيقاف صوت الرسائل المحفوظة
    if (currentlyPlayingMessageId) {
      if (audioRefs.current[currentlyPlayingMessageId]) {
        audioRefs.current[currentlyPlayingMessageId]?.pause();
        audioRefs.current[currentlyPlayingMessageId] = null;
      }
      setCurrentlyPlayingMessageId(null);
    }

    // إيقاف الصوت المجاني إن كان يعمل
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    setIsAudioPlaying(false);
    setToast({
      message: 'تم إيقاف الصوت',
      type: 'info',
    });
  };

  // Cancel current request
  const cancelCurrentRequest = () => {
    setCancelRequest(true);
    setIsLoading(false);
    stopCurrentAudio();
    setToast({
      message: 'تم إلغاء الطلب',
      type: 'error',
    });
  };

  // Play voice sample
  const playSample = async (voice: string) => {
    setIsPlayingSample(voice);
    try {
      const sampleText = 'مرحباً، أنا المعلم العراقي الذكي';
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sampleText, voice, speed: voiceSpeed }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
        audio.onended = () => {
          setIsPlayingSample(null);
          URL.revokeObjectURL(audioUrl);
        };
      }
    } catch (error) {
      console.error('Error playing sample:', error);
    } finally {
      setTimeout(() => setIsPlayingSample(null), 3000);
    }
  };

  // Play auto response (when AI responds)
  const playAutoResponse = async (text: string) => {
    // تحقق من تفعيل الصوت التلقائي
    if (!autoPlayEnabled) {
      console.log('⏸️ الصوت التلقائي معطل');
      return;
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    setIsSpeaking(true);

    // استخدام الصوت المجاني من المتصفح
    if (useFreeVoice) {
      try {
        console.log('🆓 استخدام الصوت المجاني من المتصفح');
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA';
        utterance.rate = voiceSpeed;

        utterance.onend = () => {
          console.log('🔇 انتهى الصوت المجاني');
          setIsSpeaking(false);
        };

        utterance.onerror = (error) => {
          console.error('❌ خطأ في الصوت المجاني:', error);
          setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('❌ خطأ في تشغيل الصوت المجاني:', error);
        setIsSpeaking(false);
      }
      return;
    }

    // استخدام OpenAI TTS (مدفوع)
    setIsLoadingAudio(true);
    try {
      console.log('💰 استخدام OpenAI TTS (مدفوع)...');
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: selectedVoice, speed: voiceSpeed }),
      });

      if (response.ok) {
        console.log('✅ تم الحصول على الصوت من الـ API');
        setIsLoadingAudio(false);
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;

        // محاولة التشغيل مع معالجة الأخطاء
        const playPromise = audio.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('✅ تم تشغيل الصوت بنجاح');
              setIsAudioPlaying(true);
            })
            .catch((error) => {
              console.warn('⚠️ فشل التشغيل التلقائي:', error.message);
              // عرض رسالة للمستخدم أن يضغط على زر التشغيل
              setToast({
                message: 'اضغط على أيقونة 🔊 لسماع الرد',
                type: 'info',
              });
              setIsSpeaking(false);
              setIsAudioPlaying(false);
            });
        }

        audio.onended = () => {
          console.log('🔇 انتهى الصوت');
          setIsSpeaking(false);
          setIsAudioPlaying(false);
          URL.revokeObjectURL(audioUrl);
          currentAudioRef.current = null;
        };

        audio.onerror = (error) => {
          console.error('❌ خطأ في تشغيل الصوت:', error);
          setIsSpeaking(false);
          setIsLoadingAudio(false);
          URL.revokeObjectURL(audioUrl);
        };
      } else {
        console.error('❌ فشل الحصول على الصوت من الـ API');
        setIsSpeaking(false);
        setIsLoadingAudio(false);
      }
    } catch (error) {
      console.error('❌ خطأ في playAutoResponse:', error);
      setIsSpeaking(false);
      setIsLoadingAudio(false);
    }
  };

  // Toggle audio playback for message (play/stop)
  const toggleAudioPlayback = async (messageId: string, text: string) => {
    try {
      // إذا كان نفس الصوت يعمل حالياً، أوقفه
      if (currentlyPlayingMessageId === messageId) {
        // إيقاف الصوت الحالي
        if (audioRefs.current[messageId]) {
          audioRefs.current[messageId]?.pause();
          audioRefs.current[messageId] = null;
        }
        // إيقاف الصوت المجاني إن وجد
        if (useFreeVoice) {
          window.speechSynthesis.cancel();
        }
        setCurrentlyPlayingMessageId(null);
        setIsAudioPlaying(false);
        return;
      }

      // إيقاف أي صوت آخر يعمل حالياً
      if (currentlyPlayingMessageId) {
        if (audioRefs.current[currentlyPlayingMessageId]) {
          audioRefs.current[currentlyPlayingMessageId]?.pause();
          audioRefs.current[currentlyPlayingMessageId] = null;
        }
        if (useFreeVoice) {
          window.speechSynthesis.cancel();
        }
      }

      // تشغيل الصوت الجديد
      setCurrentlyPlayingMessageId(messageId);
      setIsAudioPlaying(true);

      // استخدام الصوت المجاني
      if (useFreeVoice) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA';
        utterance.rate = voiceSpeed;
        
        utterance.onend = () => {
          setCurrentlyPlayingMessageId(null);
          setIsAudioPlaying(false);
        };
        
        utterance.onerror = () => {
          setCurrentlyPlayingMessageId(null);
          setIsAudioPlaying(false);
        };

        window.speechSynthesis.speak(utterance);
        return;
      }

      // استخدام OpenAI TTS (مدفوع)
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: selectedVoice, speed: voiceSpeed }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        const audio = new Audio(audioUrl);
        audioRefs.current[messageId] = audio;
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          audioRefs.current[messageId] = null;
          setCurrentlyPlayingMessageId(null);
          setIsAudioPlaying(false);
        };

        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          audioRefs.current[messageId] = null;
          setCurrentlyPlayingMessageId(null);
          setIsAudioPlaying(false);
        };

        await audio.play();
      } else {
        setCurrentlyPlayingMessageId(null);
        setIsAudioPlaying(false);
      }
    } catch (error) {
      console.error('Error toggling audio:', error);
      setCurrentlyPlayingMessageId(null);
      setIsAudioPlaying(false);
    }
  };

  // Calculator Handler
  const handleCalculator = (value: string) => {
    const currentValue = parseFloat(calcDisplay);

    if (!isNaN(parseFloat(value)) || value === '.') {
      if (calcWaitingForOperand) {
        setCalcDisplay(value);
        setCalcWaitingForOperand(false);
      } else {
        setCalcDisplay(calcDisplay === '0' ? value : calcDisplay + value);
      }
      return;
    }

    if (value === 'AC') {
      setCalcDisplay('0');
      setCalcPrevValue(null);
      setCalcOperator(null);
      setCalcWaitingForOperand(false);
      return;
    }

    if (value === 'DEL') {
      setCalcDisplay(calcDisplay.length > 1 ? calcDisplay.slice(0, -1) : '0');
      return;
    }

    if (value === 'MC') {
      setCalcMemory(0);
      return;
    }
    if (value === 'MR') {
      setCalcDisplay(calcMemory.toString());
      return;
    }
    if (value === 'M+') {
      setCalcMemory(calcMemory + currentValue);
      return;
    }
    if (value === 'M-') {
      setCalcMemory(calcMemory - currentValue);
      return;
    }

    if (value === '√') {
      const result = Math.sqrt(currentValue);
      setCalcDisplay(result.toString());
      addToHistory(`√${currentValue} = ${result}`);
      return;
    }

    if (value === 'x²') {
      const result = currentValue ** 2;
      setCalcDisplay(result.toString());
      addToHistory(`${currentValue}² = ${result}`);
      return;
    }

    if (value === 'x³') {
      const result = currentValue ** 3;
      setCalcDisplay(result.toString());
      addToHistory(`${currentValue}³ = ${result}`);
      return;
    }

    if (value === '1/x') {
      const result = 1 / currentValue;
      setCalcDisplay(result.toString());
      addToHistory(`1/${currentValue} = ${result}`);
      return;
    }

    if (value === '%') {
      const result = currentValue / 100;
      setCalcDisplay(result.toString());
      return;
    }

    if (['sin', 'cos', 'tan'].includes(value)) {
      const angleInRad = calcAngleMode === 'deg' ? (currentValue * Math.PI) / 180 : currentValue;
      let result = 0;
      if (value === 'sin') result = Math.sin(angleInRad);
      if (value === 'cos') result = Math.cos(angleInRad);
      if (value === 'tan') result = Math.tan(angleInRad);
      setCalcDisplay(result.toString());
      addToHistory(`${value}(${currentValue}) = ${result}`);
      return;
    }

    if (value === 'log') {
      const result = Math.log10(currentValue);
      setCalcDisplay(result.toString());
      addToHistory(`log(${currentValue}) = ${result}`);
      return;
    }

    if (value === 'ln') {
      const result = Math.log(currentValue);
      setCalcDisplay(result.toString());
      addToHistory(`ln(${currentValue}) = ${result}`);
      return;
    }

    if (value === 'π') {
      setCalcDisplay(Math.PI.toString());
      return;
    }

    if (value === 'e') {
      setCalcDisplay(Math.E.toString());
      return;
    }

    if (value === 'Deg/Rad') {
      setCalcAngleMode(calcAngleMode === 'deg' ? 'rad' : 'deg');
      return;
    }

    if (['+', '-', '×', '÷', 'xʸ'].includes(value)) {
      if (calcPrevValue !== null && calcOperator && !calcWaitingForOperand) {
        const result = performCalculation(calcPrevValue, currentValue, calcOperator);
        setCalcDisplay(result.toString());
        setCalcPrevValue(result);
        addToHistory(`${calcPrevValue} ${calcOperator} ${currentValue} = ${result}`);
      } else {
        setCalcPrevValue(currentValue);
      }
      setCalcOperator(value);
      setCalcWaitingForOperand(true);
      return;
    }

    if (value === '=') {
      if (calcPrevValue !== null && calcOperator) {
        const result = performCalculation(calcPrevValue, currentValue, calcOperator);
        setCalcDisplay(result.toString());
        addToHistory(`${calcPrevValue} ${calcOperator} ${currentValue} = ${result}`);
        setCalcPrevValue(null);
        setCalcOperator(null);
        setCalcWaitingForOperand(true);
      }
    }
  };

  const performCalculation = (a: number, b: number, operator: string): number => {
    switch (operator) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      case 'xʸ': return a ** b;
      default: return b;
    }
  };

  const addToHistory = (entry: string) => {
    setCalcHistory(prev => [entry, ...prev].slice(0, 3));
  };

  const voices = [
    { id: 'alloy', name: 'Alloy', emoji: '🎵' },
    { id: 'echo', name: 'Echo', emoji: '🔊' },
    { id: 'fable', name: 'Fable', emoji: '📖' },
    { id: 'onyx', name: 'Onyx', emoji: '💎' },
    { id: 'nova', name: 'Nova', emoji: '⭐' },
    { id: 'shimmer', name: 'Shimmer', emoji: '✨' },
  ];

  // Send message
  const handleSend = async () => {
    if ((!input.trim() && !uploadedImage) || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim() || (uploadedImage ? '📸 [صورة الواجب]' : ''),
      timestamp: new Date(),
      image: uploadedImage || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    const originalInput = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // ============================================
      // 🚀 المرحلة الأولى: البحث السريع (إذا لم تكن صورة)
      // ============================================
      if (!uploadedImage && originalInput) {
        console.log('🔍 بدء البحث السريع...');
        
        // إضافة رسالة مؤقتة للبحث
        const searchingMessageId = `search-${Date.now()}`;
        const searchingMessage: Message = {
          id: searchingMessageId,
          role: 'assistant',
          content: '🔍 جاري البحث عن مقاطع فيديو تعليمية...',
          timestamp: new Date(),
          isSearching: true,
        };
        setMessages(prev => [...prev, searchingMessage]);

        // استدعاء API للبحث السريع
        const searchResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            userId: 'teacher-user',
            conversationId: 'teacher-session',
            disableSearch: false,
            searchOnly: true, // وضع البحث فقط
            settings: {
              teacherMode: true,
              iraqiTeacher: true,
              grade: selectedGrade,
              subject: selectedSubject,
            }
          }),
        });

        const searchData = await searchResponse.json();

        if (searchData.success && searchData.videos && searchData.videos.length > 0) {
          // عرض نتائج البحث السريعة
          const searchResultsMessage: Message = {
            id: `search-results-${Date.now()}`,
            role: 'assistant',
            content: `🎬 وجدت ${searchData.videos.length} مقطع فيديو تعليمي حول "${originalInput}"`,
            timestamp: new Date(),
            videos: searchData.videos,
            sources: searchData.sources,
            isSearchResults: true,
          };

          // استبدال رسالة "جاري البحث" بالنتائج
          setMessages(prev => 
            prev.map(msg => 
              msg.id === searchingMessageId ? searchResultsMessage : msg
            )
          );

          console.log('✅ تم عرض النتائج السريعة:', searchData.videos.length, 'فيديو');
        } else {
          // إزالة رسالة البحث إذا لم توجد نتائج
          setMessages(prev => prev.filter(msg => msg.id !== searchingMessageId));
        }
      }

      // ============================================
      // 🎓 المرحلة الثانية: رد المعلم المفصل
      // ============================================
      console.log('🎓 بدء تحضير رد المعلم المفصل...');
      
      // إضافة رسالة تحميل للمعلم
      const teacherLoadingId = `teacher-loading-${Date.now()}`;
      const teacherLoadingMessage: Message = {
        id: teacherLoadingId,
        role: 'assistant',
        content: '🎓 المعلم العراقي يحضر لك شرحاً مفصلاً...',
        timestamp: new Date(),
        isTeacherLoading: true,
      };
      setMessages(prev => [...prev, teacherLoadingMessage]);

      // تأخير بسيط لإعطاء انطباع بالتحضير
      await new Promise(resolve => setTimeout(resolve, 1500));

      // استدعاء API للرد المفصل
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userId: 'teacher-user',
          conversationId: 'teacher-session',
          disableSearch: true, // تعطيل البحث للرد المفصل
          detailedResponse: true, // طلب رد مفصل
          settings: {
            teacherMode: true,
            iraqiTeacher: true,
            grade: selectedGrade,
            subject: selectedSubject,
          },
          image: uploadedImage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ وصل الرد المفصل من المعلم');

        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          sources: data.sources,
          isTeacherResponse: true,
        };

        // استبدال رسالة التحميل بالرد الفعلي
        setMessages(prev => 
          prev.map(msg => 
            msg.id === teacherLoadingId ? aiMessage : msg
          )
        );
        // مسح الصورة بعد الإرسال الناجح
        setUploadedImage(null);

        // Play audio automatically
        playAutoResponse(data.message);
      } else {
        throw new Error(data.error || 'فشل في الحصول على رد');
      }
    } catch (error: any) {
      console.error('خطأ في الإرسال:', error);
      setToast({
        message: error.message || 'حدث خطأ في الاتصال',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick prompt handler
  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    // Auto send after 500ms
    setTimeout(() => {
      if (prompt) {
        setInput(prompt);
        setTimeout(() => handleSend(), 100);
      }
    }, 100);
  };

  // Save conversation
  const handleSaveConversation = () => {
    try {
      const conversationData = {
        messages,
        date: new Date().toISOString(),
        grade: selectedGrade,
        subject: selectedSubject,
      };

      const dataStr = JSON.stringify(conversationData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `محادثة-${new Date().toLocaleDateString('ar-IQ')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setToast({
        message: 'تم حفظ المحادثة بنجاح',
        type: 'success',
      });
    } catch (error) {
      console.error('Error saving conversation:', error);
      setToast({
        message: 'فشل حفظ المحادثة',
        type: 'error',
      });
    }
  };

  // Clear conversation
  const handleClearConversation = () => {
    if (messages.length === 0) {
      setToast({
        message: 'لا توجد محادثة لمسحها',
        type: 'info',
      });
      return;
    }

    const confirmed = window.confirm('هل تريد حقاً مسح المحادثة؟');
    if (confirmed) {
      setMessages([]);
      localStorage.removeItem('currentConversation');
      setToast({
        message: 'تم مسح المحادثة بنجاح',
        type: 'success',
      });
    }
  };

  // Load saved conversations
  const loadSavedConversations = () => {
    const saved = JSON.parse(localStorage.getItem('savedConversations') || '[]');
    setSavedConversations(saved);
    setShowConversations(true);
  };

  // Load specific conversation
  const loadConversation = (conversation: any) => {
    setMessages(conversation.messages);
    setSelectedGrade(conversation.grade);
    setSelectedSubject(conversation.subject);
    setShowConversations(false);
    setToast({
      message: 'تم تحميل المحادثة بنجاح',
      type: 'success',
    });
  };

  // Delete conversation
  const deleteConversation = (conversationId: string) => {
    const confirmed = window.confirm('هل تريد حقاً حذف هذه المحادثة؟');
    if (confirmed) {
      const updated = savedConversations.filter(conv => conv.id !== conversationId);
      setSavedConversations(updated);
      localStorage.setItem('savedConversations', JSON.stringify(updated));
      setToast({
        message: 'تم حذف المحادثة',
        type: 'success',
      });
    }
  };

  // Export conversation to PDF
  const exportToPDF = async (conversation: any) => {
    try {
      setToast({
        message: 'جاري تصدير المحادثة...',
        type: 'loading',
      });

      // Create PDF content
      const pdfContent = {
        content: [
          { text: 'المعلم العراقي الذكي', style: 'header' },
          { text: `المحادثة: ${conversation.title}`, style: 'subheader' },
          { text: `التاريخ: ${new Date(conversation.timestamp).toLocaleDateString('ar-IQ')}`, style: 'date' },
          { text: `الصف: ${conversation.grade} - المادة: ${conversation.subject}`, style: 'info' },
          { text: '\n' },
          ...conversation.messages.map((msg: any) => ({
            text: `${msg.role === 'user' ? 'الطالب' : 'المعلم'}: ${msg.content}`,
            style: msg.role === 'user' ? 'student' : 'teacher',
            margin: [0, 5]
          }))
        ],
        styles: {
          header: { fontSize: 18, bold: true, alignment: 'center' },
          subheader: { fontSize: 14, bold: true },
          date: { fontSize: 10, italics: true },
          info: { fontSize: 12 },
          student: { fontSize: 11, color: '#2563eb' },
          teacher: { fontSize: 11, color: '#7c3aed' }
        },
        defaultStyle: { font: 'Helvetica', direction: 'rtl' }
      };

      // Note: This would require a PDF library like pdfmake
      // For now, we'll create a simple HTML export
      const htmlContent = `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>${conversation.title}</title>
          <style>
            body { font-family: Arial; margin: 20px; }
            .header { text-align: center; color: #2563eb; }
            .info { color: #666; margin: 10px 0; }
            .message { margin: 10px 0; padding: 10px; border-radius: 8px; }
            .student { background: #eff6ff; border-left: 4px solid #2563eb; }
            .teacher { background: #f3e8ff; border-right: 4px solid #7c3aed; }
          </style>
        </head>
        <body>
          <h1 class="header">المعلم العراقي الذكي</h1>
          <h2>${conversation.title}</h2>
          <div class="info">
            <p>التاريخ: ${new Date(conversation.timestamp).toLocaleDateString('ar-IQ')}</p>
            <p>الصف: ${conversation.grade} - المادة: ${conversation.subject}</p>
          </div>
          ${conversation.messages.map((msg: any) => `
            <div class="message ${msg.role === 'user' ? 'student' : 'teacher'}">
              <strong>${msg.role === 'user' ? 'الطالب' : 'المعلم'}:</strong>
              ${msg.content}
            </div>
          `).join('')}
        </body>
        </html>
      `;

      // Create and download file
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `محادثة-${conversation.title.substring(0, 20)}-${new Date().getTime()}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setToast({
        message: 'تم تصدير المحادثة بنجاح',
        type: 'success',
      });
    } catch (error) {
      console.error('Error exporting conversation:', error);
      setToast({
        message: 'فشل تصدير المحادثة',
        type: 'error',
      });
    }
  };

  // Filter conversations based on search
  const filteredConversations = savedConversations.filter(conv => 
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.messages.some((msg: any) => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Toggle bookmark for message
  const toggleBookmark = (messageId: string) => {
    const isBookmarked = bookmarkedMessages.includes(messageId);
    let updated;
    
    if (isBookmarked) {
      updated = bookmarkedMessages.filter(id => id !== messageId);
    } else {
      updated = [...bookmarkedMessages, messageId];
    }
    
    setBookmarkedMessages(updated);
    localStorage.setItem('bookmarkedMessages', JSON.stringify(updated));
    
    setToast({
      message: isBookmarked ? 'تم إزالة الإشارة المرجعية' : 'تم إضافة إشارة مرجعية',
      type: 'success',
    });
  };

  // Load bookmarks on component mount
  useEffect(() => {
    const savedBookmarks = JSON.parse(localStorage.getItem('bookmarkedMessages') || '[]');
    setBookmarkedMessages(savedBookmarks);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/90 shadow-lg border-b border-white/20">
        <div className="container mx-auto px-3 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 transform hover:scale-105 transition-transform">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-base md:text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  المعلم العراقي الذكي
                </h1>
                <p className="text-xs md:text-sm text-slate-600 font-medium hidden sm:block">محادثة صوتية تفاعلية مدعومة بالذكاء الاصطناعي</p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 relative">
              {/* زر إيقاف الصوت في الشريط العلوي */}
              {(isAudioPlaying || isLoadingAudio) && (
                <button
                  onClick={stopCurrentAudio}
                  className="px-3 md:px-4 py-2 md:py-2.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg md:rounded-xl transition-all text-xs md:text-sm font-semibold shadow-sm border border-red-200 hover:border-red-300 animate-fadeIn"
                  title="إيقاف الصوت"
                >
                  <span className="flex items-center gap-1.5">
                    🔇 <span className="hidden sm:inline">إيقاف</span>
                  </span>
                </button>
              )}

              {/* زر المحادثات المحفوظة */}
              <button
                onClick={loadSavedConversations}
                className="px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl transition-all duration-300 text-xs md:text-sm font-semibold shadow-sm hover:shadow-md border text-slate-700 bg-white hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 border-slate-200 hover:border-green-300"
                title="المحادثات المحفوظة"
              >
                <span className="flex items-center gap-1.5 md:gap-2">
                  💾 <span className="hidden sm:inline">المحادثات</span>
                </span>
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl transition-all duration-300 text-xs md:text-sm font-semibold shadow-sm hover:shadow-md border ${
                  showSettings
                    ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 border-transparent shadow-blue-500/30'
                    : 'text-slate-700 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border-slate-200 hover:border-blue-300'
                }`}
              >
                <span className="flex items-center gap-1.5 md:gap-2">
                  ⚙️ <span className="hidden sm:inline">الإعدادات</span>
                </span>
              </button>

              {/* Settings Dropdown */}
              {showSettings && (
                <>
                  {/* Overlay للنقر خارج النافذة */}
                  <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                    onClick={() => setShowSettings(false)}
                  />

                  <div className="absolute left-0 top-full mt-2 w-96 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border-2 border-blue-200 p-6 animate-fadeIn z-50">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gradient-to-r from-blue-200 via-indigo-200 to-purple-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                          <span className="text-xl">⚙️</span>
                        </div>
                        <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          الإعدادات
                        </h3>
                      </div>
                      {/* زر الإغلاق */}
                      <button
                        onClick={() => setShowSettings(false)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-600 hover:text-red-600"
                        title="إغلاق"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-5 max-h-[70vh] overflow-y-auto">
                    {/* الصف والمادة */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg">📚</span>
                        <h4 className="text-sm font-bold text-slate-800">الصف والمادة</h4>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-2">
                            الصف الدراسي
                          </label>
                          <select
                            className="w-full px-4 py-3 text-sm border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all bg-white shadow-sm hover:shadow-md font-medium"
                            value={selectedGrade}
                            onChange={(e) => setSelectedGrade(e.target.value)}
                          >
                            <option value="">اختر الصف</option>
                            <option value="1">الأول الابتدائي</option>
                            <option value="2">الثاني الابتدائي</option>
                            <option value="3">الثالث الابتدائي</option>
                            <option value="4">الرابع الابتدائي</option>
                            <option value="5">الخامس الابتدائي</option>
                            <option value="6">السادس الابتدائي</option>
                            <option value="7">الأول المتوسط</option>
                            <option value="8">الثاني المتوسط</option>
                            <option value="9">الثالث المتوسط</option>
                            <option value="10">الرابع الإعدادي</option>
                            <option value="11">الخامس الإعدادي</option>
                            <option value="12">السادس الإعدادي</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-2">
                            المادة الدراسية
                          </label>
                          <select
                            className="w-full px-4 py-3 text-sm border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all bg-white shadow-sm hover:shadow-md font-medium"
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                          >
                            <option value="">اختر المادة</option>
                            <option value="math">الرياضيات</option>
                            <option value="science">العلوم</option>
                            <option value="physics">الفيزياء</option>
                            <option value="chemistry">الكيمياء</option>
                            <option value="biology">الأحياء</option>
                            <option value="arabic">اللغة العربية</option>
                            <option value="english">اللغة الإنجليزية</option>
                            <option value="history">التاريخ</option>
                            <option value="geography">الجغرافية</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* إعدادات الصوت */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">🎙️ إعدادات الصوت</h4>

                      <div className="space-y-2">
                        {/* نوع الصوت: مجاني/مدفوع */}
                        <button
                          onClick={() => setUseFreeVoice(!useFreeVoice)}
                          className={`w-full px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
                            useFreeVoice
                              ? 'text-green-600 bg-green-50 hover:bg-green-100 border-2 border-green-200'
                              : 'text-orange-600 bg-orange-50 hover:bg-orange-100 border-2 border-orange-200'
                          }`}
                        >
                          {useFreeVoice ? '🆓 صوت مجاني (من المتصفح)' : '💰 صوت OpenAI (جودة عالية - افتراضي)'}
                        </button>

                        {/* الصوت التلقائي */}
                        <button
                          onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
                          className={`w-full px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
                            autoPlayEnabled
                              ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200'
                              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 border-2 border-slate-200'
                          }`}
                        >
                          {autoPlayEnabled ? '🔊 الصوت التلقائي مُفعّل' : '🔇 الصوت التلقائي معطل'}
                        </button>
                      </div>

                      {/* اختيار الصوت (فقط للصوت المدفوع) */}
                      {!useFreeVoice && (
                        <div className="mt-3">
                          <label className="block text-xs font-medium text-slate-600 mb-2">
                            اختر الصوت
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {voices.map((voice) => (
                              <button
                                key={voice.id}
                                onClick={() => setSelectedVoice(voice.id)}
                                className={`p-2 rounded-lg text-sm font-medium transition-all ${
                                  selectedVoice === voice.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                {voice.emoji} {voice.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* السرعة */}
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-slate-600 mb-2">
                          السرعة: {voiceSpeed.toFixed(2)}x
                        </label>
                        <input
                          type="range"
                          min="0.25"
                          max="4"
                          step="0.25"
                          value={voiceSpeed}
                          onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      {/* اختبار الصوت */}
                      {!useFreeVoice && (
                        <button
                          onClick={() => playSample(selectedVoice)}
                          disabled={isPlayingSample !== null}
                          className="w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isPlayingSample ? '⏳ جاري التشغيل...' : '🔊 اختبر الصوت'}
                        </button>
                      )}
                    </div>

                    {/* زر مسح المحادثة */}
                    <div className="pt-4 border-t-2 border-slate-200">
                      <button
                        onClick={() => {
                          handleClearConversation();
                          setShowSettings(false);
                        }}
                        className="w-full px-5 py-3 text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 bg-red-50 rounded-xl transition-all duration-300 text-sm font-bold shadow-sm hover:shadow-md border-2 border-red-200 hover:border-transparent"
                        title="مسح المحادثة"
                      >
                        <span className="flex items-center justify-center gap-2">
                          🗑️ <span>مسح المحادثة</span>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 md:px-6 py-3 md:py-6">
        <div className="grid grid-cols-12 gap-3 md:gap-5">
          {/* منطقة المحادثة الرئيسية */}
          <main className="col-span-12 lg:col-span-9">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 h-[calc(100vh-140px)] flex flex-col overflow-hidden">
              {/* رأس المحادثة */}
              <div className="p-3 md:p-5 border-b border-white/30 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                        <svg className="w-6 h-6 md:w-7 md:h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-green-400 rounded-full border-2 border-white shadow-md animate-pulse"></div>
                    </div>
                    <div>
                      <h2 className="text-base md:text-lg font-bold text-white">المعلم العراقي</h2>
                      <p className="text-xs text-blue-100 flex items-center gap-1 md:gap-1.5 font-medium">
                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full animate-pulse"></span>
                        <span className="hidden sm:inline">متصل ومستعد للمساعدة</span>
                        <span className="sm:hidden">متصل</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 md:gap-2">
                    <button className="p-2 md:p-2.5 hover:bg-white/20 rounded-lg md:rounded-xl transition-all text-white backdrop-blur-sm">
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.414a2 2 0 001.414.586h3a2 2 0 001.414-.586l6.293-6.293a1 1 0 000-1.414l-4-4a1 1 0 00-1.414 0L5.586 9.414a2 2 0 00-.586 1.414v3z" />
                      </svg>
                    </button>
                    <button className="p-2 md:p-2.5 hover:bg-white/20 rounded-lg md:rounded-xl transition-all text-white backdrop-blur-sm">
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* منطقة الرسائل */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-28 h-28 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/40 transform hover:scale-105 transition-transform">
                      <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        ابدأ المحادثة الصوتية
                      </h3>
                      <p className="text-slate-600 text-sm max-w-md font-medium">
                        اضغط على زر المايك في الأسفل وابدأ بالتحدث، سأساعدك في جميع المواد الدراسية
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2.5 justify-center max-w-xl">
                      <button
                        onClick={() => handleQuickPrompt('ممكن تشرح لي درس الرياضيات؟')}
                        className="px-4 py-2 bg-white text-slate-700 text-sm font-medium rounded-xl hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 hover:text-white transition-all duration-300 border-2 border-blue-200 hover:border-transparent shadow-sm hover:shadow-lg transform hover:scale-105"
                      >
                        📐 شرح الرياضيات
                      </button>
                      <button
                        onClick={() => handleQuickPrompt('ممكن تساعدني بحل الواجب؟')}
                        className="px-4 py-2 bg-white text-slate-700 text-sm font-medium rounded-xl hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 hover:text-white transition-all duration-300 border-2 border-indigo-200 hover:border-transparent shadow-sm hover:shadow-lg transform hover:scale-105"
                      >
                        ✏️ حل الواجب
                      </button>
                      <button
                        onClick={() => handleQuickPrompt('أريد مراجعة الدرس السابق')}
                        className="px-4 py-2 bg-white text-slate-700 text-sm font-medium rounded-xl hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-300 border-2 border-purple-200 hover:border-transparent shadow-sm hover:shadow-lg transform hover:scale-105"
                      >
                        📚 مراجعة الدرس
                      </button>
                      <button
                        onClick={() => handleQuickPrompt('ممكن تعطيني اختبار سريع؟')}
                        className="px-4 py-2 bg-white text-slate-700 text-sm font-medium rounded-xl hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 hover:text-white transition-all duration-300 border-2 border-pink-200 hover:border-transparent shadow-sm hover:shadow-lg transform hover:scale-105"
                      >
                        🎯 اختبار سريع
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'} animate-fadeIn`}
                      >
                        <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md transform hover:scale-105 transition-transform ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-br from-slate-200 to-slate-300'
                              : 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600'
                          }`}>
                            <svg className={`w-5 h-5 ${msg.role === 'user' ? 'text-slate-700' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className={`rounded-2xl p-4 shadow-lg transform hover:scale-[1.01] transition-all ${
                            msg.role === 'user'
                              ? 'bg-white text-slate-800 rounded-tr-md border-2 border-slate-200 hover:border-slate-300'
                              : msg.isSearchResults
                              ? 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-tl-md shadow-emerald-500/30'
                              : msg.isTeacherResponse
                              ? 'bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 text-white rounded-tl-md shadow-purple-500/30'
                              : msg.isSearching || msg.isTeacherLoading
                              ? 'bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 text-white rounded-tl-md shadow-orange-500/30'
                              : 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white rounded-tl-md shadow-blue-500/30'
                          }`}>
                            {/* رسالة البحث السريع */}
                            {msg.isSearching && (
                              <div className="flex items-center gap-2 text-blue-100">
                                <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm font-medium">جاري البحث في YouTube...</span>
                              </div>
                            )}

                            {/* رسالة تحميل المعلم */}
                            {msg.isTeacherLoading && (
                              <div className="flex items-center gap-2 text-blue-100">
                                <div className="flex gap-1">
                                  <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                  <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                </div>
                                <span className="text-sm font-medium">المعلم يحضر شرحاً مفصلاً...</span>
                              </div>
                            )}

                            {/* نتائج البحث السريعة */}
                            {msg.isSearchResults && msg.videos && msg.videos.length > 0 && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-blue-100 mb-3">
                                  <span className="text-xl">🎬</span>
                                  <span className="text-sm font-semibold">فيديوهات تعليمية سريعة</span>
                                </div>
                                <VideoCards videos={msg.videos} isExplicitSearch={false} />
                                <div className="text-xs text-blue-200 bg-blue-500/20 p-2 rounded-lg">
                                  💡 تصفح الفيديوهات بينما المعلم يحضر لك شرحاً تفصيلياً
                                </div>
                              </div>
                            )}

                            {/* Videos للرد العادي */}
                            {msg.role === 'assistant' && !msg.isSearchResults && msg.videos && msg.videos.length > 0 && (
                              <div className="mb-3">
                                <VideoCards videos={msg.videos} isExplicitSearch={false} />
                              </div>
                            )}

                            {/* User image attachment */}
                            {msg.role === 'user' && msg.image && (
                              <div className="mb-2">
                                <img
                                  src={msg.image}
                                  alt="صورة الواجب"
                                  className="max-w-xs rounded-lg border-2 border-slate-300 shadow-sm"
                                />
                                <p className="text-xs text-slate-500 mt-1">📎 صورة الواجب</p>
                              </div>
                            )}

                            {/* المحتوى النصي */}
                            {!msg.isSearching && !msg.isTeacherLoading && (
                              <div className="flex items-start gap-2">
                                {/* شارة خاصة للرد المفصل */}
                                {msg.isTeacherResponse && (
                                  <div className="flex items-center gap-1 mb-2 text-blue-200">
                                    <span className="text-lg">🎓</span>
                                    <span className="text-xs font-semibold bg-blue-500/20 px-2 py-1 rounded-full">شرح مفصل</span>
                                  </div>
                                )}
                                
                                <p className="text-sm leading-relaxed flex-1">{msg.content}</p>

                                {/* Action buttons */}
                                <div className="flex items-center gap-1">
                                  {/* Bookmark button */}
                                  <button
                                    onClick={() => toggleBookmark(msg.id)}
                                    className={`flex-shrink-0 p-1 rounded transition-colors ${
                                      bookmarkedMessages.includes(msg.id) 
                                        ? 'bg-yellow-400 text-white hover:bg-yellow-500' 
                                        : 'text-blue-200 hover:bg-blue-500 hover:text-white'
                                    }`}
                                    title={bookmarkedMessages.includes(msg.id) ? "إزالة الإشارة المرجعية" : "إضافة إشارة مرجعية"}
                                  >
                                    {bookmarkedMessages.includes(msg.id) ? '⭐' : '☆'}
                                  </button>

                                  {/* Speaker icon for toggle audio */}
                                  {msg.role === 'assistant' && !msg.isSearchResults && (
                                    <button
                                      onClick={() => toggleAudioPlayback(msg.id, msg.content)}
                                      className={`flex-shrink-0 p-1 hover:bg-blue-500 rounded transition-colors ${
                                        currentlyPlayingMessageId === msg.id ? 'bg-blue-500 text-white' : 'text-blue-200'
                                      }`}
                                      title={currentlyPlayingMessageId === msg.id ? "إيقاف الصوت" : "تشغيل الصوت"}
                                    >
                                      {currentlyPlayingMessageId === msg.id ? '🔇' : '🔊'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}

                            <span className={`text-xs mt-1.5 block ${msg.role === 'user' ? 'text-slate-400' : 'text-blue-100'}`}>
                              {new Date(msg.timestamp).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex justify-end animate-fadeIn">
                        <div className="flex gap-3 max-w-[80%] flex-row-reverse">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-md">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="bg-white rounded-2xl rounded-tl-md p-4 shadow-lg border-2 border-blue-200">
                            <div className="flex gap-2 items-center justify-between">
                              <div className="flex gap-2 items-center">
                                <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></div>
                                <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                                <span className="text-sm text-slate-700 mr-2 font-medium">المعلم يفكر...</span>
                              </div>
                              {/* زر إلغاء الطلب */}
                              <button
                                onClick={cancelCurrentRequest}
                                className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-600 text-xs rounded-lg font-medium transition-colors flex items-center gap-1"
                                title="إلغاء الطلب"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                إلغاء
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* مؤشر تحميل الصوت */}
                    {isLoadingAudio && (
                      <div className="flex justify-end animate-fadeIn">
                        <div className="flex gap-3 max-w-[80%] flex-row-reverse">
                          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-4 shadow-lg border-2 border-blue-200">
                            <div className="flex items-center gap-2.5 justify-between">
                              <div className="flex items-center gap-2.5">
                                <svg className="w-5 h-5 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span className="text-sm text-blue-700 font-medium">جاري تحويل النص إلى صوت...</span>
                              </div>
                              <button
                                onClick={stopCurrentAudio}
                                className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-600 text-xs rounded-lg font-medium transition-colors"
                                title="إيقاف الصوت"
                              >
                                🔇
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* شريط التحكم في الصوت الثابت */}
              {(isAudioPlaying || isLoadingAudio) && (
                <div className="px-5 py-3 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-t border-purple-200 animate-fadeIn">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {isLoadingAudio ? (
                        <>
                          <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm text-purple-700 font-medium">يتم تحضير الصوت...</span>
                        </>
                      ) : (
                        <>
                          <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-purple-700 font-medium">🔊 الصوت قيد التشغيل</span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={stopCurrentAudio}
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium text-sm rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                        title="إيقاف الصوت"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-6.219-8.56" />
                        </svg>
                        إيقاف الصوت
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* شريط النص الحالي */}
              {currentTranscript && (
                <div className="px-5 py-3 bg-blue-50 border-t border-blue-100">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <p className="text-sm text-slate-700 flex-1">{currentTranscript}</p>
                  </div>
                </div>
              )}

              {/* منطقة الإدخال والتحكم */}
              <div className="p-6 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/30 backdrop-blur-sm">
                {/* معاينة الصورة المرفوعة */}
                {uploadedImage && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl shadow-md">
                    <div className="flex items-start gap-4">
                      <img
                        src={uploadedImage}
                        alt="صورة الواجب"
                        className="w-28 h-28 object-cover rounded-xl border-2 border-blue-400 shadow-lg"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-blue-800 mb-1.5">📸 صورة الواجب جاهزة للإرسال</p>
                        <p className="text-xs text-blue-600 font-medium">سيتم إرفاق الصورة مع رسالتك القادمة</p>
                      </div>
                      <button
                        onClick={() => setUploadedImage(null)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition-all shadow-sm hover:shadow-md"
                        title="حذف الصورة"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* منطقة الإدخال الموحدة مع الأزرار بالداخل */}
                <div className="relative bg-white border-2 border-slate-200 rounded-2xl md:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 focus-within:border-blue-400 focus-within:ring-2 md:focus-within:ring-4 focus-within:ring-blue-100">
                  {/* حقل الإدخال النصي */}
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="اكتب سؤالك هنا أو استخدم المايك، الصورة، أو الكاميرا..."
                    className="w-full px-4 md:px-6 pt-4 md:pt-5 pb-16 md:pb-20 text-sm md:text-base border-0 rounded-2xl md:rounded-3xl focus:outline-none resize-none bg-transparent font-medium text-slate-800 placeholder:text-slate-400"
                    rows={3}
                    disabled={isLoading}
                  />

                  {/* شريط الأزرار في الأسفل */}
                  <div className="absolute bottom-0 left-0 right-0 px-3 md:px-4 pb-3 md:pb-4 flex items-center justify-between gap-2 md:gap-3">
                    {/* الأزرار الجانبية (المايك، الصور، الكاميرا) */}
                    <div className="flex items-center gap-1.5 md:gap-2">
                      {/* زر المايك */}
                      <button
                        className={`p-2.5 md:p-3 rounded-lg md:rounded-xl transition-all shadow-md hover:shadow-lg flex-shrink-0 transform hover:scale-105 ${
                          isListening
                            ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white ring-2 md:ring-4 ring-red-200 animate-pulse'
                            : isSpeaking
                            ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white ring-2 md:ring-4 ring-amber-200'
                            : 'bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
                        }`}
                        onClick={toggleMicrophone}
                        disabled={isSpeaking}
                        title={isListening ? 'إيقاف التسجيل' : 'ابدأ التحدث'}
                      >
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          {isListening ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          ) : isSpeaking ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.414a2 2 0 001.414.586h3a2 2 0 001.414-.586l6.293-6.293a1 1 0 000-1.414l-4-4a1 1 0 00-1.414 0L5.586 9.414a2 2 0 00-.586 1.414v3z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          )}
                        </svg>
                      </button>

                      {/* زر رفع الصورة */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-2.5 md:p-3 rounded-lg md:rounded-xl transition-all shadow-md hover:shadow-lg flex-shrink-0 transform hover:scale-105 ${
                          uploadedImage
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white ring-2 md:ring-4 ring-green-200'
                            : 'bg-gradient-to-br from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white'
                        }`}
                        title="رفع صورة"
                      >
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>

                      {/* زر الكاميرا */}
                      <button
                        onClick={openCamera}
                        className="p-2.5 md:p-3 rounded-lg md:rounded-xl transition-all shadow-md hover:shadow-lg flex-shrink-0 transform hover:scale-105 bg-gradient-to-br from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
                        title="التقاط صورة بالكاميرا"
                      >
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>

                      {/* زر إلغاء التسجيل الصوتي */}
                      {isListening && (
                        <button
                          onClick={stopVoiceRecording}
                          className="p-2.5 md:p-3 bg-gradient-to-br from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white rounded-lg md:rounded-xl transition-all shadow-md hover:shadow-lg flex-shrink-0 transform hover:scale-105 animate-fadeIn"
                          title="إلغاء التسجيل"
                        >
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}

                      {/* زر إيقاف الصوت */}
                      {(isSpeaking || isLoadingAudio) && (
                        <button
                          onClick={stopCurrentAudio}
                          className="p-2.5 md:p-3 bg-gradient-to-br from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-lg md:rounded-xl transition-all shadow-md hover:shadow-lg flex-shrink-0 transform hover:scale-105 animate-fadeIn"
                          title="إيقاف الصوت"
                        >
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* أزرار الإرسال والإلغاء على اليمين */}
                    <div className="flex items-center gap-2">
                      {/* زر إلغاء الطلب عند التحميل */}
                      {isLoading && (
                        <button
                          onClick={cancelCurrentRequest}
                          className="p-2.5 md:p-3 bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-lg md:rounded-xl transition-all shadow-lg hover:shadow-xl flex-shrink-0 transform hover:scale-105 animate-fadeIn"
                          title="إلغاء الطلب"
                        >
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}

                      {/* زر الإرسال */}
                      <button
                        onClick={handleSend}
                        disabled={(!input.trim() && !uploadedImage) || isLoading}
                        className="p-2.5 md:p-3 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-lg md:rounded-xl transition-all shadow-lg hover:shadow-xl flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
                        title="إرسال الرسالة"
                      >
                      {isLoading ? (
                        <svg className="w-4 h-4 md:w-5 md:h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Sidebar الأيسر */}
          <aside className="hidden lg:block col-span-3 space-y-3">
            {/* الحاسبة */}
            <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-sm">
                    <span className="text-base">🔢</span>
                  </div>
                  <h3 className="text-sm font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    الآلة الحاسبة
                  </h3>
                </div>
                <button
                  onClick={() => setCalcScientificMode(!calcScientificMode)}
                  className="px-2 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {calcScientificMode ? 'أساسي' : 'علمي'}
                </button>
              </div>

              <div className="mb-2">
                <div className="bg-slate-100 rounded-lg p-2 mb-2">
                  <div className="text-right text-lg font-mono text-slate-800 overflow-auto">
                    {calcDisplay}
                  </div>
                  {calcMemory !== 0 && (
                    <div className="text-xs text-blue-600">M: {calcMemory}</div>
                  )}
                </div>
                {calcHistory.length > 0 && (
                  <div className="text-xs text-slate-500 space-y-0.5 max-h-12 overflow-y-auto">
                    {calcHistory.map((h, i) => (
                      <div key={i}>{h}</div>
                    ))}
                  </div>
                )}
              </div>

              {calcScientificMode && (
                <div className="grid grid-cols-4 gap-1 mb-1">
                  <button onClick={() => handleCalculator('sin')} className="calc-btn bg-indigo-100 text-indigo-700 text-xs p-1">sin</button>
                  <button onClick={() => handleCalculator('cos')} className="calc-btn bg-indigo-100 text-indigo-700 text-xs p-1">cos</button>
                  <button onClick={() => handleCalculator('tan')} className="calc-btn bg-indigo-100 text-indigo-700 text-xs p-1">tan</button>
                  <button onClick={() => handleCalculator('Deg/Rad')} className="calc-btn bg-purple-100 text-purple-700 text-xs p-1">{calcAngleMode}</button>
                  <button onClick={() => handleCalculator('log')} className="calc-btn bg-indigo-100 text-indigo-700 text-xs p-1">log</button>
                  <button onClick={() => handleCalculator('ln')} className="calc-btn bg-indigo-100 text-indigo-700 text-xs p-1">ln</button>
                  <button onClick={() => handleCalculator('π')} className="calc-btn bg-pink-100 text-pink-700 text-xs p-1">π</button>
                  <button onClick={() => handleCalculator('e')} className="calc-btn bg-pink-100 text-pink-700 text-xs p-1">e</button>
                  <button onClick={() => handleCalculator('x²')} className="calc-btn bg-teal-100 text-teal-700 text-xs p-1">x²</button>
                  <button onClick={() => handleCalculator('x³')} className="calc-btn bg-teal-100 text-teal-700 text-xs p-1">x³</button>
                  <button onClick={() => handleCalculator('xʸ')} className="calc-btn bg-teal-100 text-teal-700 text-xs p-1">xʸ</button>
                  <button onClick={() => handleCalculator('√')} className="calc-btn bg-teal-100 text-teal-700 text-xs p-1">√</button>
                </div>
              )}

              <div className="grid grid-cols-4 gap-1">
                <button onClick={() => handleCalculator('MC')} className="calc-btn bg-orange-100 text-orange-700 text-xs p-1">MC</button>
                <button onClick={() => handleCalculator('MR')} className="calc-btn bg-orange-100 text-orange-700 text-xs p-1">MR</button>
                <button onClick={() => handleCalculator('M+')} className="calc-btn bg-orange-100 text-orange-700 text-xs p-1">M+</button>
                <button onClick={() => handleCalculator('M-')} className="calc-btn bg-orange-100 text-orange-700 text-xs p-1">M-</button>

                <button onClick={() => handleCalculator('AC')} className="calc-btn bg-red-100 text-red-700 text-xs p-1">AC</button>
                <button onClick={() => handleCalculator('DEL')} className="calc-btn bg-red-100 text-red-700 text-xs p-1">DEL</button>
                <button onClick={() => handleCalculator('%')} className="calc-btn bg-blue-100 text-blue-700 text-xs p-1">%</button>
                <button onClick={() => handleCalculator('÷')} className="calc-btn bg-blue-100 text-blue-700 text-xs p-1">÷</button>

                <button onClick={() => handleCalculator('7')} className="calc-btn text-xs p-1">7</button>
                <button onClick={() => handleCalculator('8')} className="calc-btn text-xs p-1">8</button>
                <button onClick={() => handleCalculator('9')} className="calc-btn text-xs p-1">9</button>
                <button onClick={() => handleCalculator('×')} className="calc-btn bg-blue-100 text-blue-700 text-xs p-1">×</button>

                <button onClick={() => handleCalculator('4')} className="calc-btn text-xs p-1">4</button>
                <button onClick={() => handleCalculator('5')} className="calc-btn text-xs p-1">5</button>
                <button onClick={() => handleCalculator('6')} className="calc-btn text-xs p-1">6</button>
                <button onClick={() => handleCalculator('-')} className="calc-btn bg-blue-100 text-blue-700 text-xs p-1">-</button>

                <button onClick={() => handleCalculator('1')} className="calc-btn text-xs p-1">1</button>
                <button onClick={() => handleCalculator('2')} className="calc-btn text-xs p-1">2</button>
                <button onClick={() => handleCalculator('3')} className="calc-btn text-xs p-1">3</button>
                <button onClick={() => handleCalculator('+')} className="calc-btn bg-blue-100 text-blue-700 text-xs p-1">+</button>

                <button onClick={() => handleCalculator('0')} className="calc-btn col-span-2 text-xs p-1">0</button>
                <button onClick={() => handleCalculator('.')} className="calc-btn text-xs p-1">.</button>
                <button onClick={() => handleCalculator('=')} className="calc-btn bg-blue-600 text-white text-xs p-1">=</button>
              </div>
            </div>

            {/* التقدم الأسبوعي */}
            <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/40 p-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-sm">📊</span>
                </div>
                <h3 className="text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  نشاطك الأسبوعي
                </h3>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-purple-50 transition-colors">
                  <span className="text-xs text-slate-700 font-medium">السبت</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-purple-50 transition-colors">
                  <span className="text-xs text-slate-700 font-medium">الأحد</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-purple-50 transition-colors">
                  <span className="text-xs text-slate-700 font-medium">الاثنين</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
                    <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-purple-50 transition-colors">
                  <span className="text-xs text-slate-700 font-medium">الثلاثاء</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
                    <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
                    <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-purple-100">
                <div className="flex items-center justify-between text-xs bg-gradient-to-r from-purple-50 to-pink-50 p-2 rounded-lg">
                  <span className="text-slate-700 font-medium">معدل الأسبوع</span>
                  <span className="text-purple-600 font-bold">12 جلسة</span>
                </div>
              </div>
            </div>

            {/* المحادثات الأخيرة */}
            <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/40 p-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-sm">💬</span>
                </div>
                <h3 className="text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  المحادثات الأخيرة
                </h3>
              </div>

              <div className="space-y-1.5">
                <button className="w-full p-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg transition-all text-right group border border-transparent hover:border-blue-200">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mt-1 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-800 font-medium truncate group-hover:text-blue-700 transition-colors">شرح درس الجبر</p>
                      <p className="text-xs text-slate-400">منذ ساعة</p>
                    </div>
                  </div>
                </button>

                <button className="w-full p-2 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-lg transition-all text-right group border border-transparent hover:border-indigo-200">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-1 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 font-medium truncate group-hover:text-indigo-700 transition-colors">حل واجب الفيزياء</p>
                      <p className="text-xs text-slate-400">منذ 3 ساعات</p>
                    </div>
                  </div>
                </button>

                <button className="w-full p-2 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-lg transition-all text-right group border border-transparent hover:border-purple-200">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-1 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 font-medium truncate group-hover:text-purple-700 transition-colors">مراجعة الكيمياء</p>
                      <p className="text-xs text-slate-400">أمس</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-4">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-sm md:max-w-2xl w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-600 to-rose-600 p-3 md:p-4 flex items-center justify-between">
              <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                التقاط صورة
              </h3>
              <button
                onClick={closeCamera}
                className="text-white hover:bg-white/20 rounded-lg p-1.5 md:p-2 transition-all"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Video Preview */}
            <div className="relative bg-black aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            {/* Actions */}
            <div className="p-3 md:p-4 flex gap-2 md:gap-3 justify-center bg-slate-50">
              <button
                onClick={closeCamera}
                className="px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white rounded-lg md:rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 text-sm md:text-base"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                إلغاء
              </button>
              <button
                onClick={capturePhoto}
                className="px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-lg md:rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 text-sm md:text-base"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                التقاط
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-2xl shadow-2xl text-white animate-fadeIn backdrop-blur-lg border-2 ${
          toast.type === 'error'
            ? 'bg-gradient-to-r from-red-600 to-rose-600 border-red-400/50'
            : toast.type === 'info'
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-400/50'
            : 'bg-gradient-to-r from-green-600 to-emerald-600 border-green-400/50'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {toast.type === 'error' ? '❌' : toast.type === 'info' ? 'ℹ️' : '✅'}
            </span>
            <span className="font-medium">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-xl hover:bg-white/20 rounded-lg p-1 transition-all ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}



      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .calc-btn {
          padding: 12px 8px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 8px;
          transition: all 0.2s;
          background-color: #f1f5f9;
          color: #334155;
        }

        .calc-btn:hover {
          background-color: #e2e8f0;
        }
      `}</style>

      {/* نافذة المحادثات المحفوظة */}
      {showConversations && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowConversations(false)}
          />
          
          {/* النافذة */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-[90vw] max-w-4xl max-h-[85vh] overflow-hidden">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      💾
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">المحادثات المحفوظة</h2>
                      <p className="text-sm text-slate-600">{savedConversations.length} محادثة محفوظة</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowConversations(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* شريط البحث */}
                <div className="mt-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ابحث في المحادثات..."
                      className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      🔍
                    </div>
                  </div>
                </div>
              </div>

              {/* قائمة المحادثات */}
              <div className="flex-1 overflow-auto p-6">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">لا توجد محادثات</h3>
                    <p className="text-slate-500">ابدأ محادثة جديدة لتظهر هنا</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer hover:shadow-md"
                        onClick={() => loadConversation(conversation)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-800 truncate mb-1">
                              {conversation.title}
                            </h3>
                            <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                              <span>📅 {new Date(conversation.timestamp).toLocaleDateString('ar-IQ')}</span>
                              <span>📚 {conversation.grade}</span>
                              <span>📖 {conversation.subject}</span>
                              <span>💬 {conversation.messages.length} رسالة</span>
                            </div>
                            <p className="text-sm text-slate-600 line-clamp-2">
                              {conversation.messages[0]?.content?.substring(0, 100)}...
                            </p>
                          </div>
                          
                          {/* أزرار العمل */}
                          <div className="flex items-center gap-2 mr-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                exportToPDF(conversation);
                              }}
                              className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                              title="تصدير PDF"
                            >
                              📄
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteConversation(conversation.id);
                              }}
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                              title="حذف"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
