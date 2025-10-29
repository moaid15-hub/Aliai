'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Message as AIMessage, ToastData } from '@/lib/types';

const VideoCards = dynamic(() => import('@/components/personas/iraqi-teacher/VideoCards'), { ssr: false });

interface Message extends AIMessage {
  sources?: any[];
  videos?: any[];
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
  const [isPlayingSample, setIsPlayingSample] = useState<string | null>(null);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState<boolean>(true);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [autoSendVoice, setAutoSendVoice] = useState<boolean>(true);

  // Image Upload
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Auto scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-send after voice input
  useEffect(() => {
    if (!isListening && input.trim() && autoSendVoice && !isLoading) {
      const timer = setTimeout(() => {
        handleSend();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isListening]);

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
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
      setIsSpeaking(false);
      setIsLoadingAudio(false);
      setToast({
        message: 'تم إيقاف الصوت',
        type: 'info',
      });
    }
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
    setIsLoadingAudio(true);
    try {
      console.log('🔊 بداية تشغيل الصوت التلقائي...');
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
            })
            .catch((error) => {
              console.warn('⚠️ فشل التشغيل التلقائي:', error.message);
              // عرض رسالة للمستخدم أن يضغط على زر التشغيل
              setToast({
                message: 'اضغط على أيقونة 🔊 لسماع الرد',
                type: 'info',
              });
              setIsSpeaking(false);
            });
        }

        audio.onended = () => {
          console.log('🔇 انتهى الصوت');
          setIsSpeaking(false);
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

  // Replay message audio
  const replayAudio = async (messageId: string, text: string) => {
    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: selectedVoice, speed: voiceSpeed }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        if (audioRefs.current[messageId]) {
          audioRefs.current[messageId]?.pause();
        }

        const audio = new Audio(audioUrl);
        audioRefs.current[messageId] = audio;
        audio.play();
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          audioRefs.current[messageId] = null;
        };
      }
    } catch (error) {
      console.error('Error replaying audio:', error);
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
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userId: 'teacher-user',
          conversationId: 'teacher-session',
          disableSearch: false, // تفعيل البحث في يوتيوب
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
        console.log('📹 الفيديوهات من الـ API:', data.videos);

        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          sources: data.sources,
          videos: data.videos,
        };
        setMessages(prev => [...prev, aiMessage]);
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
      setToast({
        message: 'تم مسح المحادثة بنجاح',
        type: 'success',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">المعلم العراقي الذكي</h1>
                <p className="text-sm text-slate-500">محادثة صوتية تفاعلية</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowVoicePanel(!showVoicePanel)}
                className="px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all text-sm font-medium"
              >
                🎙️ الصوت
              </button>
              <button
                onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
                className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  autoPlayEnabled
                    ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
                title={autoPlayEnabled ? 'إيقاف الصوت التلقائي' : 'تشغيل الصوت التلقائي'}
              >
                {autoPlayEnabled ? '🔊' : '🔇'} تلقائي
              </button>
              <button
                onClick={() => setShowCalculator(!showCalculator)}
                className="px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all text-sm font-medium"
              >
                🔢 الآلة الحاسبة
              </button>
              <button
                onClick={handleClearConversation}
                className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all text-sm font-medium"
                title="مسح المحادثة"
              >
                🗑️ مسح
              </button>
              <button className="px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all text-sm font-medium">
                الإعدادات
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-5">
          {/* Sidebar الأيمن */}
          <aside className="col-span-3 space-y-5">
            {/* اختيار الصف والمادة */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-base font-semibold text-slate-800 mb-4">
                الصف والمادة
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    الصف الدراسي
                  </label>
                  <select
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all bg-white"
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
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    المادة الدراسية
                  </label>
                  <select
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all bg-white"
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

            {/* إحصائيات سريعة */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-base font-semibold text-slate-800 mb-4">
                الإحصائيات
              </h3>

              <div className="space-y-2.5">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-sm font-medium text-slate-700">الدروس</span>
                  <span className="text-base font-bold text-blue-600">5</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-sm font-medium text-slate-700">النقاط</span>
                  <span className="text-base font-bold text-slate-700">120</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-sm font-medium text-slate-700">الوقت</span>
                  <span className="text-base font-bold text-slate-700">45 د</span>
                </div>
              </div>
            </div>

            {/* أدوات إضافية */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-base font-semibold text-slate-800 mb-4">
                الأدوات
              </h3>

              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />

                {uploadedImage ? (
                  <div className="space-y-2">
                    <img src={uploadedImage} alt="Uploaded" className="w-full rounded-lg border border-slate-200" />
                    <button
                      onClick={() => setUploadedImage(null)}
                      className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      حذف الصورة
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    رفع صورة
                  </button>
                )}
              </div>
            </div>

            {/* Voice Control Panel */}
            {showVoicePanel && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <h3 className="text-base font-semibold text-slate-800 mb-4">
                  🎙️ التحكم بالصوت
                </h3>

                <div className="space-y-3">
                  <div>
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

                  <div>
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

                  <button
                    onClick={() => playSample(selectedVoice)}
                    disabled={isPlayingSample !== null}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isPlayingSample ? '⏳ جاري التشغيل...' : '🔊 اختبر الصوت'}
                  </button>
                </div>
              </div>
            )}

            {/* Calculator */}
            {showCalculator && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-slate-800">🔢 الآلة الحاسبة</h3>
                  <button
                    onClick={() => setCalcScientificMode(!calcScientificMode)}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {calcScientificMode ? 'أساسي' : 'علمي'}
                  </button>
                </div>

                <div className="mb-3">
                  <div className="bg-slate-100 rounded-lg p-3 mb-2">
                    <div className="text-right text-2xl font-mono text-slate-800 overflow-auto">
                      {calcDisplay}
                    </div>
                    {calcMemory !== 0 && (
                      <div className="text-xs text-blue-600">M: {calcMemory}</div>
                    )}
                  </div>
                  {calcHistory.length > 0 && (
                    <div className="text-xs text-slate-500 space-y-1">
                      {calcHistory.map((h, i) => (
                        <div key={i}>{h}</div>
                      ))}
                    </div>
                  )}
                </div>

                {calcScientificMode && (
                  <div className="grid grid-cols-4 gap-1 mb-2">
                    <button onClick={() => handleCalculator('sin')} className="calc-btn bg-indigo-100 text-indigo-700">sin</button>
                    <button onClick={() => handleCalculator('cos')} className="calc-btn bg-indigo-100 text-indigo-700">cos</button>
                    <button onClick={() => handleCalculator('tan')} className="calc-btn bg-indigo-100 text-indigo-700">tan</button>
                    <button onClick={() => handleCalculator('Deg/Rad')} className="calc-btn bg-purple-100 text-purple-700">{calcAngleMode}</button>
                    <button onClick={() => handleCalculator('log')} className="calc-btn bg-indigo-100 text-indigo-700">log</button>
                    <button onClick={() => handleCalculator('ln')} className="calc-btn bg-indigo-100 text-indigo-700">ln</button>
                    <button onClick={() => handleCalculator('π')} className="calc-btn bg-pink-100 text-pink-700">π</button>
                    <button onClick={() => handleCalculator('e')} className="calc-btn bg-pink-100 text-pink-700">e</button>
                    <button onClick={() => handleCalculator('x²')} className="calc-btn bg-teal-100 text-teal-700">x²</button>
                    <button onClick={() => handleCalculator('x³')} className="calc-btn bg-teal-100 text-teal-700">x³</button>
                    <button onClick={() => handleCalculator('xʸ')} className="calc-btn bg-teal-100 text-teal-700">xʸ</button>
                    <button onClick={() => handleCalculator('√')} className="calc-btn bg-teal-100 text-teal-700">√</button>
                  </div>
                )}

                <div className="grid grid-cols-4 gap-1">
                  <button onClick={() => handleCalculator('MC')} className="calc-btn bg-orange-100 text-orange-700">MC</button>
                  <button onClick={() => handleCalculator('MR')} className="calc-btn bg-orange-100 text-orange-700">MR</button>
                  <button onClick={() => handleCalculator('M+')} className="calc-btn bg-orange-100 text-orange-700">M+</button>
                  <button onClick={() => handleCalculator('M-')} className="calc-btn bg-orange-100 text-orange-700">M-</button>

                  <button onClick={() => handleCalculator('AC')} className="calc-btn bg-red-100 text-red-700">AC</button>
                  <button onClick={() => handleCalculator('DEL')} className="calc-btn bg-red-100 text-red-700">DEL</button>
                  <button onClick={() => handleCalculator('%')} className="calc-btn bg-blue-100 text-blue-700">%</button>
                  <button onClick={() => handleCalculator('÷')} className="calc-btn bg-blue-100 text-blue-700">÷</button>

                  <button onClick={() => handleCalculator('7')} className="calc-btn">7</button>
                  <button onClick={() => handleCalculator('8')} className="calc-btn">8</button>
                  <button onClick={() => handleCalculator('9')} className="calc-btn">9</button>
                  <button onClick={() => handleCalculator('×')} className="calc-btn bg-blue-100 text-blue-700">×</button>

                  <button onClick={() => handleCalculator('4')} className="calc-btn">4</button>
                  <button onClick={() => handleCalculator('5')} className="calc-btn">5</button>
                  <button onClick={() => handleCalculator('6')} className="calc-btn">6</button>
                  <button onClick={() => handleCalculator('-')} className="calc-btn bg-blue-100 text-blue-700">-</button>

                  <button onClick={() => handleCalculator('1')} className="calc-btn">1</button>
                  <button onClick={() => handleCalculator('2')} className="calc-btn">2</button>
                  <button onClick={() => handleCalculator('3')} className="calc-btn">3</button>
                  <button onClick={() => handleCalculator('+')} className="calc-btn bg-blue-100 text-blue-700">+</button>

                  <button onClick={() => handleCalculator('0')} className="calc-btn col-span-2">0</button>
                  <button onClick={() => handleCalculator('.')} className="calc-btn">.</button>
                  <button onClick={() => handleCalculator('=')} className="calc-btn bg-blue-600 text-white">=</button>
                </div>
              </div>
            )}
          </aside>

          {/* منطقة المحادثة الرئيسية */}
          <main className="col-span-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-[calc(100vh-140px)] flex flex-col">
              {/* رأس المحادثة */}
              <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-blue-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-blue-700"></div>
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-white">المعلم العراقي</h2>
                      <p className="text-xs text-blue-100 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                        متصل الآن
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button className="p-2 hover:bg-blue-600 rounded-lg transition-colors text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.414a2 2 0 001.414.586h3a2 2 0 001.414-.586l6.293-6.293a1 1 0 000-1.414l-4-4a1 1 0 00-1.414 0L5.586 9.414a2 2 0 00-.586 1.414v3z" />
                      </svg>
                    </button>
                    <button className="p-2 hover:bg-blue-600 rounded-lg transition-colors text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* منطقة الرسائل */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-5">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center border border-blue-200">
                      <svg className="w-14 h-14 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800 mb-1.5">ابدأ المحادثة الصوتية</h3>
                      <p className="text-slate-500 text-sm max-w-md">
                        اضغط على زر المايك في الأسفل وابدأ بالتحدث، سأساعدك في جميع المواد الدراسية
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center max-w-xl">
                      <button
                        onClick={() => handleQuickPrompt('ممكن تشرح لي درس الرياضيات؟')}
                        className="px-3 py-1.5 bg-white text-slate-600 text-xs rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors border border-slate-200"
                      >
                        شرح الرياضيات
                      </button>
                      <button
                        onClick={() => handleQuickPrompt('ممكن تساعدني بحل الواجب؟')}
                        className="px-3 py-1.5 bg-white text-slate-600 text-xs rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors border border-slate-200"
                      >
                        حل الواجب
                      </button>
                      <button
                        onClick={() => handleQuickPrompt('أريد مراجعة الدرس السابق')}
                        className="px-3 py-1.5 bg-white text-slate-600 text-xs rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors border border-slate-200"
                      >
                        مراجعة الدرس
                      </button>
                      <button
                        onClick={() => handleQuickPrompt('ممكن تعطيني اختبار سريع؟')}
                        className="px-3 py-1.5 bg-white text-slate-600 text-xs rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors border border-slate-200"
                      >
                        اختبار سريع
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
                        <div className={`flex gap-2.5 max-w-[75%] ${msg.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            msg.role === 'user'
                              ? 'bg-slate-200'
                              : 'bg-blue-600'
                          }`}>
                            <svg className={`w-4 h-4 ${msg.role === 'user' ? 'text-slate-600' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className={`rounded-xl p-3.5 shadow-sm ${
                            msg.role === 'user'
                              ? 'bg-white text-slate-700 rounded-tr-sm border border-slate-200'
                              : 'bg-blue-600 text-white rounded-tl-sm'
                          }`}>
                            {/* Videos before text */}
                            {msg.role === 'assistant' && msg.videos && msg.videos.length > 0 && (
                              <div className="mb-3">
                                <VideoCards videos={msg.videos} isExplicitSearch={false} />
                              </div>
                            )}

                            <div className="flex items-start gap-2">
                              <p className="text-sm leading-relaxed flex-1">{msg.content}</p>

                              {/* Speaker icon for replay */}
                              {msg.role === 'assistant' && (
                                <button
                                  onClick={() => replayAudio(msg.id, msg.content)}
                                  className="flex-shrink-0 p-1 hover:bg-blue-500 rounded transition-colors"
                                  title="إعادة تشغيل الصوت"
                                >
                                  🔊
                                </button>
                              )}
                            </div>

                            <span className={`text-xs mt-1.5 block ${msg.role === 'user' ? 'text-slate-400' : 'text-blue-100'}`}>
                              {new Date(msg.timestamp).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex justify-end animate-fadeIn">
                        <div className="flex gap-2.5 max-w-[75%] flex-row-reverse">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-600">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="bg-white rounded-xl rounded-tl-sm p-3.5 shadow-sm border border-slate-200">
                            <div className="flex gap-1.5 items-center">
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                              <span className="text-sm text-slate-600 mr-2">المعلم يتحدث...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* مؤشر تحميل الصوت */}
                    {isLoadingAudio && (
                      <div className="flex justify-end animate-fadeIn">
                        <div className="flex gap-2.5 max-w-[75%] flex-row-reverse">
                          <div className="bg-blue-100 rounded-xl p-3 shadow-sm flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span className="text-sm text-blue-600">جاري تحويل النص إلى صوت...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

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
              <div className="p-5 border-t border-slate-200 bg-white">
                {/* زر المايك والإدخال النصي */}
                <div className="flex items-end gap-3 mb-3">
                  {/* حقل الإدخال النصي */}
                  <div className="flex-1">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="اكتب سؤالك هنا أو استخدم المايك..."
                      className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all resize-none bg-slate-50"
                      rows={2}
                      disabled={isLoading}
                    />
                  </div>

                  {/* زر الإرسال */}
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="p-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-sm flex-shrink-0 disabled:opacity-50"
                    title="إرسال الرسالة"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>

                  {/* زر المايك */}
                  <button
                    className={`p-3.5 rounded-xl transition-all shadow-sm flex-shrink-0 ${
                      isListening
                        ? 'bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-100'
                        : isSpeaking
                        ? 'bg-amber-500 hover:bg-amber-600 text-white ring-4 ring-amber-100'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    onClick={toggleMicrophone}
                    disabled={isSpeaking}
                    title={isListening ? 'إيقاف التسجيل' : 'ابدأ التحدث'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isListening ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      ) : isSpeaking ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.414a2 2 0 001.414.586h3a2 2 0 001.414-.586l6.293-6.293a1 1 0 000-1.414l-4-4a1 1 0 00-1.414 0L5.586 9.414a2 2 0 00-.586 1.414v3z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      )}
                    </svg>
                  </button>

                  {/* زر إلغاء التسجيل الصوتي */}
                  {isListening && (
                    <button
                      onClick={stopVoiceRecording}
                      className="p-3.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all shadow-sm flex-shrink-0"
                      title="إلغاء التسجيل"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}

                  {/* زر إيقاف الصوت */}
                  {(isSpeaking || isLoadingAudio) && (
                    <button
                      onClick={stopCurrentAudio}
                      className="p-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all shadow-sm flex-shrink-0"
                      title="إيقاف الصوت"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* الأزرار الإضافية وحالة النظام */}
                <div className="flex items-center justify-between">
                  {/* أزرار إضافية */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="إرفاق ملف"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </button>

                    <button
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="مسح المحادثة"
                      onClick={() => setMessages([])}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                    <button
                      onClick={handleSaveConversation}
                      disabled={messages.length === 0}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                      title="حفظ المحادثة"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                    </button>
                  </div>

                  {/* مؤشر الحالة */}
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                    isListening
                      ? 'bg-red-50 text-red-700'
                      : isSpeaking
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      isListening || isSpeaking ? 'bg-current animate-pulse' : 'bg-current'
                    }`}></div>
                    <span>
                      {isListening ? 'يستمع للصوت' : isSpeaking ? 'يتحدث الآن' : 'جاهز للاستماع'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Sidebar الأيسر */}
          <aside className="col-span-3 space-y-5">
            {/* التقدم الأسبوعي */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-base font-semibold text-slate-800 mb-4">
                نشاطك الأسبوعي
              </h3>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 font-medium">السبت</span>
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 font-medium">الأحد</span>
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-slate-200 rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 font-medium">الاثنين</span>
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-slate-200 rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-slate-200 rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 font-medium">الثلاثاء</span>
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"></div>
                    <div className="w-2.5 h-2.5 bg-slate-200 rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-slate-200 rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-slate-200 rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">معدل الأسبوع</span>
                  <span className="text-blue-600 font-semibold">12 جلسة</span>
                </div>
              </div>
            </div>

            {/* الإنجازات */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-base font-semibold text-slate-800 mb-4">
                الإنجازات
              </h3>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <svg className="w-7 h-7 text-blue-600 mb-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs font-semibold text-blue-700">متميز</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <svg className="w-7 h-7 text-slate-400 mb-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-semibold text-slate-500">مجتهد</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <svg className="w-7 h-7 text-slate-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-xs font-semibold text-slate-400">مقفل</span>
                </div>
              </div>
            </div>

            {/* دروس مقترحة */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-base font-semibold text-slate-800 mb-4">
                دروس مقترحة
              </h3>

              <div className="space-y-2.5">
                <button className="w-full p-3 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg text-right hover:shadow-sm transition-all border border-blue-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-sm font-semibold text-slate-800">المثلثات</p>
                      <p className="text-xs text-slate-500">رياضيات • 15 دقيقة</p>
                    </div>
                  </div>
                </button>

                <button className="w-full p-3 bg-slate-50 rounded-lg text-right hover:bg-slate-100 transition-all border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-sm font-semibold text-slate-800">التفاعلات</p>
                      <p className="text-xs text-slate-500">كيمياء • 20 دقيقة</p>
                    </div>
                  </div>
                </button>

                <button className="w-full p-3 bg-slate-50 rounded-lg text-right hover:bg-slate-100 transition-all border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-sm font-semibold text-slate-800">القارات</p>
                      <p className="text-xs text-slate-500">جغرافية • 10 دقائق</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* المحادثات الأخيرة */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-base font-semibold text-slate-800 mb-4">
                المحادثات الأخيرة
              </h3>

              <div className="space-y-2.5">
                <button className="w-full p-2.5 hover:bg-slate-50 rounded-lg transition-colors text-right">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 font-medium truncate">شرح درس الجبر</p>
                      <p className="text-xs text-slate-500">منذ ساعة</p>
                    </div>
                  </div>
                </button>

                <button className="w-full p-2.5 hover:bg-slate-50 rounded-lg transition-colors text-right">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-slate-300 rounded-full mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 font-medium truncate">حل واجب الفيزياء</p>
                      <p className="text-xs text-slate-500">منذ 3 ساعات</p>
                    </div>
                  </div>
                </button>

                <button className="w-full p-2.5 hover:bg-slate-50 rounded-lg transition-colors text-right">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-slate-300 rounded-full mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 font-medium truncate">مراجعة الكيمياء</p>
                      <p className="text-xs text-slate-500">أمس</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Toast Notifications */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
        }`}>
          <div className="flex items-center gap-2">
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-xl">✕</button>
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
    </div>
  );
}
